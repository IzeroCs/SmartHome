#include "socket.h"

void SocketClass::begin() {
    io.on("event", [&] (const char * payload, size_t length) { onEvent(payload, length); });
    io.begin(host, port);
}

void SocketClass::loop() {

}

void SocketClass::onEvent(const char * payload, size_t length) {

}

SocketClass Socket;
