#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class NetworkClass {
private:
    String ssidAccessPoint;
    String passAccessPoint;

public:
    void wifiBegin();
    void wifiConnect();

protected:
    String ssidAccessPointMake();
    String passAccessPointMake();
};

extern NetworkClass Network;

#endif
