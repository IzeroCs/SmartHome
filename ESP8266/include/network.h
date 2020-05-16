#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>

class NetworkClass {
private:

public:
    void begin();
    void loop();
    void loopSocketPing();
    void loopStationReconnect();
};

extern NetworkClass Network;

#endif
