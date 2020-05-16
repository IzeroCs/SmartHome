#ifndef WEB_SOCKET_H
#define WEB_SOCKET_H

#include <Arduino.h>
#include <WebSocketsServer.h>

class ServerSocketClass {
private:
    bool isRunning;
    bool pingStatus[WEBSOCKETS_SERVER_CLIENT_MAX];

    WebSocketsServer socket = WebSocketsServer(81);

public:
    void begin();
    void close();
    void loop();
    void loopPing();
    bool isRun();
    void run();
    void onSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);
};

extern ServerSocketClass ServerSocket;

#endif
