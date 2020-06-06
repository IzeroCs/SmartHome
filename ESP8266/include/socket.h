#ifndef SOCKET_H
#define SOCKET_H

#include <Arduino.h>
#include <SocketIOClient.h>
#include <vector>
#include <array>

#include "util.h"
#include "profile.h"

class SocketClass {
private:
    const static bool DEBUG = true;

    const char * host  = "192.168.31.104";
    const int    port  = 3190;

    String token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkVTUDgyNjYiLCJpYXQiOjQxMDI0NDQ4MDB9.HAU4zKdQnfHqj0kfLYoLH5blr3BUSgQo-DgxT0JvIjd9t6b0AloTjA1mUfbk9LRipe-OMC58LYIHG2kbpYAyCg";
    SocketIoClient io;

    void onEvent(const char * event, const char * payload, size_t length);

public:
    void begin();
    void loop();
    void loopSyncIO();
};

extern SocketClass Socket;

#endif
