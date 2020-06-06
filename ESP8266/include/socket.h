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

    const char * host  = "192.168.43.39";
    const int    port  = 3190;

    String token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkVTUDgyNjYiLCJpYXQiOjQxMDI0NDQ4MDB9.HAU4zKdQnfHqj0kfLYoLH5blr3BUSgQo-DgxT0JvIjd9t6b0AloTjA1mUfbk9LRipe-OMC58LYIHG2kbpYAyCg";
    // String token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkFQUCIsImlhdCI6NDEwMjQ0NDgwMH0.W6z51k56Q374LIpEWoaHJkWErMEeMht8J1clLTc9-JewEgsEbNa-rCcoHUr_NKuNzu6H9CQqqAe_j5EEAfayl8nECVMuTJxlc4e0vPqehVQGORicfvF9KUyw8xvzKLQlAu-uzynu3AnCYvJhSICT_kyIXtEoSZdj70mb5e5AGL9NvO27mfCamItF-q8nlsQEPquBf3jPRxjdVog8_t4Sa1hznrhJsgGeJjXAEXK5AqM_7ahCRLbKdG4azENRxrSuN8BBoxO_UdBKvlyL931Zq8Zs1pQAFdebdODk2FNnkzVTRowEn1zfOq0K4Tj06hDXawrO7qdaK-fYsCWJCa7hwg";
    SocketIoClient io;

    void onEvent(const char * event, const char * payload, size_t length);

public:
    void begin();
    void loop();
    void loopSyncIO();
};

extern SocketClass Socket;

#endif
