#include "server_socket.h"

void ServerSocketClass::begin() {
    isRunning = false;

    Serial.println("Server Socket begin");
    socket.onEvent([&] (uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
        onSocketEvent(num, type, payload, length);
    });
}

void ServerSocketClass::run() {
    if (!isRunning) {
        isRunning = true;

        socket.begin();
        Serial.println("Server Socket is running");
    }
}

void ServerSocketClass::close() {
    if (isRunning) {
        isRunning = false;
        socket.close();
        Serial.println("Server Socket is close");
    }
}

void ServerSocketClass::loop() {
    if (isRunning)
        socket.loop();
}

bool ServerSocketClass::isRun() {
    return isRunning;
}

void ServerSocketClass::onSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    if (type == WStype_DISCONNECTED) {
        Serial.printf("[%u] Disconnected!\n", num);
    } else if (type == WStype_CONNECTED) {
        IPAddress remoteIP = socket.remoteIP(num);

        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, remoteIP[0], remoteIP[1], remoteIP[2], remoteIP[3], payload);
        socket.sendTXT(num, "connected");
    } else if (type == WStype_TEXT) {
        String command = String((char *)payload);

        if (command.startsWith("station_ssid")) {
            socket.sendTXT(num, "station_ssid");
        } else if (command.startsWith("station_psk")) {
            socket.sendTXT(num, "station_psk");
        } else if (command == "completed") {
            socket.sendTXT(num, "close");
        }

        Serial.printf("[%u] get Text: %s\n", num, payload);
    } else if (type == WStype_BIN) {
        Serial.printf("[%u] get binary length: %u\n", num, length);
        hexdump(payload, length);
    } else if (type == WStype_PONG) {
        pingStatus[num] = true;
    }
}

void ServerSocketClass::loopPing() {
    if (isRunning) {
        for (int i = 0; i < WEBSOCKETS_SERVER_CLIENT_MAX; ++i) {
            if (pingStatus[i]) {
                pingStatus[i] = false;
                socket.sendPing(i, 0, 0);
            }
        }
    }
}

ServerSocketClass ServerSocket;
