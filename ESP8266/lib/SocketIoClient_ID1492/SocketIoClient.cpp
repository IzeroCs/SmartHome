#include <SocketIoClient.h>

const String getEventName(const String msg) {
	return msg.substring(4, msg.indexOf("\"",4));
}

const String getEventPayload(const String msg) {
	String result = msg.substring(msg.indexOf("\"",4)+2,msg.length()-1);
	if(result.startsWith("\"")) {
		result.remove(0,1);
	}
	if(result.endsWith("\"")) {
		result.remove(result.length()-1);
	}
	return result;
}

void SocketIoClient::webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
	String msg;

	if (type == WStype_DISCONNECTED) {
		SOCKETIOCLIENT_DEBUG("[SIoC] Disconnected!\n");

		if (!isDisconnected) {
			isDisconnected = true;
			trigger("disconnect", NULL, 0);
		}

		isConnected = false;
	} else if (type == WStype_CONNECTED) {
		isDisconnected = false;
		SOCKETIOCLIENT_DEBUG("[SIoC] Connected to url: %s\n",  payload);
	} else if (type == WStype_TEXT) {
		msg = String((char*)payload);
		if(msg.startsWith("42")) {
			trigger(getEventName(msg).c_str(), getEventPayload(msg).c_str(), length);
		} else if(msg.startsWith("2")) {
			_webSocket.sendTXT("3");
		} else if(msg.startsWith("40")) {
			isConnected = true;
			trigger("connect", NULL, 0);
		} else if(msg.startsWith("41")) {
			isConnected = false;
			trigger("disconnect", NULL, 0);
		}
	} else if (type == WStype_BIN) {
		SOCKETIOCLIENT_DEBUG("[SIoC] get binary length: %u\n", length);
		hexdump(payload, length);
	}
}

void SocketIoClient::beginSSL(const char* host, const int port, const char* url, const char* fingerprint) {
	_webSocket.beginSSL(host, port, url, fingerprint);
    initialize();
}

void SocketIoClient::begin(const char* host, const int port, const char* url) {
	_webSocket.begin(host, port, url);
    initialize();
}

void SocketIoClient::initialize() {
    _webSocket.onEvent(std::bind(&SocketIoClient::webSocketEvent, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));
	_lastPing = millis();
}

void SocketIoClient::loop() {
	_webSocket.loop();
	for(auto packet=_packets.begin(); packet != _packets.end();) {
		if(_webSocket.sendTXT(*packet)) {
			SOCKETIOCLIENT_DEBUG("[SIoC] packet \"%s\" emitted\n", packet->c_str());
			packet = _packets.erase(packet);
		} else {
			++packet;
		}
	}

	if(millis() - _lastPing > PING_INTERVAL) {
		_webSocket.sendTXT("2");
		_lastPing = millis();
	}
}

void SocketIoClient::on(const char* event, std::function<void (const char * payload, size_t length)> func) {
	_events[event] = func;
}

void SocketIoClient::onBroadcast(SocketIoClientBroadcast broadcast) {
	_broadcast = broadcast;
}

void SocketIoClient::emit(const char* event, const char * payload) {
	emit(event, String(payload));
}

void SocketIoClient::emit(const char* event, const String payload) {
	String msg = String("42[\"");
	msg += event;
	msg += "\"";
	if(!payload.isEmpty()) {
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

void SocketIoClient::emit(const char* event, std::map<String, String> payload) {
	String payloadStr   = "";
	String payloadKey   = "";
	String payloadValue = "";

	if (payload.size() > 0) {
		std::map<String, String>::iterator iterator = payload.begin();

		while (iterator != payload.end()) {
			payloadKey   = iterator->first;
			payloadValue = iterator->second;

			if (payloadStr.length() > 0)
				payloadStr += ",";
			else
				payloadStr += "{";

			if (!payloadKey.startsWith("\""))
				payloadStr += "\"" + payloadKey   + "\":";
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

void SocketIoClient::trigger(const char* event, const char * payload, size_t length) {
	auto e = _events.find(event);
	if(e != _events.end()) {
		SOCKETIOCLIENT_DEBUG("[SIoC] trigger event %s\n", event);
		e->second(payload, length);
	} else {
		SOCKETIOCLIENT_DEBUG("[SIoC] event %s not found. %d events available\n", event, _events.size());
	}

	if (_broadcast != nullptr)
		_broadcast(event, payload, length);
}

void SocketIoClient::disconnect()
{
	_webSocket.disconnect();
	trigger("disconnect", NULL, 0);
}

void SocketIoClient::setAuthorization(const char * user, const char * password) {
    _webSocket.setAuthorization(user, password);
}
