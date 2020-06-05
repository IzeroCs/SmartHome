#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>

class NetworkClass {
private:
    String rssi;

    void updateRSSI() {
        rssi = String(WiFi.RSSI());
    }

public:
    void begin();
    void loop();
    void loopWait();

    String getRSSI() {
        return rssi;
    }
};

extern NetworkClass Network;

#endif
