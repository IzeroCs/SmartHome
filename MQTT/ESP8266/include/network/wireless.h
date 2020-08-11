#ifndef WLAN_H
#define WLAN_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

#include "stream/monitor.h"
#include "system/seri.h"
#include "system/config.h"
#include "network/ota.h"

class WirelessClass {
private:
    unsigned long now;
    unsigned int period = 1000;

    bool waitConnect       = false;
    bool printConnected    = false;
    bool printDisconnected = true;

    int countConnect  = 0;
    int periodConnect = 20;

public:
    void begin();
    void loop();
    void beginStation(String ssid, String pass);

    bool isStationConnect() { return WiFi.status() == WL_CONNECTED; }
    wl_status_t statusStation() { return WiFi.status(); }
};

extern WirelessClass Wireless;

#endif
