#ifndef WLAN_H
#define WLAN_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

#include "monitor.h"
#include "config.h"

class WirelessClass {
private:
    unsigned long now;
    unsigned int period = 1000;
    unsigned int connecter;

public:
    void begin();
    void loop();
    void beginStation(String ssid, String pass);
};

extern WirelessClass Wireless;

#endif
