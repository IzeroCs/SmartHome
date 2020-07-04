#include <SocketIoClient.h>

const String getEventName(const String msg) {
    int beginQuote = msg.indexOf("\"");
    int nextQuote = msg.indexOf("\"", beginQuote + 1);

    return msg.substring(beginQuote + 1, nextQuote);
}

const String getEventPayload(const String msg) {
    int countLoop = 0;
    int indexQuote = 0;
    int lastIndexQuote = 0;

    while ((indexQuote = msg.indexOf("\"", lastIndexQuote)) != -1) {
        if (++countLoop >= 3)
            break;

        lastIndexQuote = indexQuote + 1;
    }

    String result = msg.substring(indexQuote, msg.length() - 1);

    if (result.startsWith("\""))
        result.remove(0, 1);

    if (result.endsWith("\""))
        result.remove(result.length() - 1);

    return result;
}

void SocketIoClient::webSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
    String msg;

    if (type == WStype_DISCONNECTED) {
        _isConnected = false;
        SOCKETIOCLIENT_DEBUG("[SIoC] Disconnected!\n");

        if (!_isDisconnected) {
            _isDisconnected = true;
            trigger("disconnect", NULL, 0);
        }
    } else if (type == WStype_CONNECTED) {
        _isDisconnected = false;
        SOCKETIOCLIENT_DEBUG("[SIoC] Connected to url: %s\n", payload);
        _webSocket.sendTXT("5");

        if (_nsp != "")
            _webSocket.sendTXT("40/" + _nsp);
    } else if (type == WStype_TEXT) {
        msg = String((char *)payload);

        if (msg.startsWith("42")) {
            trigger(getEventName(msg).c_str(), getEventPayload(msg).c_str(), length);
        } else if (msg.startsWith("2")) {
            _webSocket.sendTXT("3");
        } else if (msg.startsWith("40")) {
            if (_nsp == "") {
                _isConnected = true;
                trigger("connect", NULL, 0);
            } else if (msg.startsWith("40/" + _nsp)) {
                _isConnected = true;
                trigger("connect", NULL, 0);
            }
        } else if (msg.startsWith("41")) {
            _isConnected = false;

            if (!_isDisconnected) {
                _isDisconnected = true;
                trigger("disconnect", NULL, 0);
            }
        }
    } else if (type == WStype_BIN) {
        SOCKETIOCLIENT_DEBUG("[SIoC] get binary length: %u\n", length);
        hexdump(payload, length);
    }
}

void SocketIoClient::beginSSL(const char *host, const int port, const char *nsp, const char *url, const char *fingerprint) {
    _nsp = nsp;

    if (_nsp.startsWith("/"))
        _nsp = _nsp.substring(1);

    _webSocket.beginSSL(host, port, url, fingerprint);
    initialize();
}

void SocketIoClient::begin(const char *host, const int port, const char *nsp, const char *url) {
    _nsp = nsp;

    if (_nsp.startsWith("/"))
        _nsp = _nsp.substring(1);

    _webSocket.begin(host, port, url);
    initialize();
}

void SocketIoClient::initialize() {
    _webSocket.onEvent(std::bind(&SocketIoClient::webSocketEvent, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));
    _lastPing = millis();
}

void SocketIoClient::loop() {
    _webSocket.loop();

    for (auto packet = _packets.begin(); packet != _packets.end();) {
        if (_webSocket.sendTXT(*packet)) {
            SOCKETIOCLIENT_DEBUG("[SIoC] packet \"%s\" emitted\n", packet->c_str());
            packet = _packets.erase(packet);
        } else {
            ++packet;
        }
    }

    if (millis() - _lastPing > PING_INTERVAL) {
        _webSocket.sendTXT("2");
        _lastPing = millis();
    }
}

void SocketIoClient::on(const char *event, std::function<void(const char *payload, size_t length)> func) {
    _events[event] = func;
}

void SocketIoClient::onBroadcast(SocketIoClientBroadcast broadcast) {
    _broadcast = broadcast;
}

void SocketIoClient::emit(const char *event, const char *payload) {
    emit(event, String(payload));
}

void SocketIoClient::emit(const char *event, const String payload) {
    String msg = String("42[\"");

    if (_nsp != "")
        msg = String("42/" + _nsp + ",[\"");

    msg += event;
    msg += "\"";

    if (!payload.isEmpty()) {
        msg += ",";

        if (!payload.startsWith("{") && !payload.startsWith("\""))
            msg += "\"" + payload + "\"";
        else
            msg += payload;
    }

    msg += "]";
    SOCKETIOCLIENT_DEBUG("[SIoC] add packet %s\n", msg.c_str());
    _packets.push_back(msg);
}

void SocketIoClient::emit(const char *event, std::map<String, String> payload) {
    String payloadStr = "";
    String payloadKey = "";
    String payloadValue = "";

    if (payload.size() > 0) {
        std::map<String, String>::iterator iterator = payload.begin();

        while (iterator != payload.end()) {
            payloadKey = iterator->first;
            payloadValue = iterator->second;

            if (payloadStr.length() > 0)
                payloadStr += ",";
            else
                payloadStr += "{";

            if (!payloadKey.startsWith("\""))
                payloadStr += "\"" + payloadKey + "\":";
            else
                payloadStr += payloadKey + ":";

            if (!payloadValue.startsWith("{") && !payloadValue.startsWith("[") && !payloadValue.startsWith("\""))
                payloadStr += "\"" + payloadValue + "\"";
            else
                payloadStr += payloadValue;

            iterator++;
        }

        payloadStr += "}";
    }

    emit(event, payloadStr);
}

void SocketIoClient::trigger(const char *event, const char *payload, size_t length) {
    auto e = _events.find(event);

    if (e != _events.end()) {
        SOCKETIOCLIENT_DEBUG("[SIoC] trigger event %s\n", event);
        e->second(payload, length);
    } else {
        SOCKETIOCLIENT_DEBUG("[SIoC] event %s not found. %d events available\n", event, _events.size());
    }

    if (_broadcast != nullptr)
        _broadcast(event, payload, length);
}

void SocketIoClient::disconnect() {
    _webSocket.disconnect();
    trigger("disconnect", NULL, 0);
}

void SocketIoClient::setAuthorization(const char *user, const char *password) {
    _webSocket.setAuthorization(user, password);
}
