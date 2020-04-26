#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class NetworkClass {
private:
    String ssidStation;
    String passStation;

public:
    void wifiBegin();
    void wifiConnect();

protected:
    String ssidStationMake();
    String passStationMake();
};

extern NetworkClass Network;

#endif
