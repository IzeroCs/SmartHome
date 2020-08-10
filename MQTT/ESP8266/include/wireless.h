#ifndef WLAN_H
#define WLAN_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class WirelessClass {
private:
    String stationSSID;
    String stationPass;

public:
    void beginStation(String ssid, String pass);
};

#endif
