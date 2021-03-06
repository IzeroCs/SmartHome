#ifndef WLAN_H
#define WLAN_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

#include "stream/monitor.h"
#include "system/seri.h"
#include "system/config.h"
#include "network/ota.h"
#include "network/cloud.h"

class WirelessClass {
private:
    ulong now = 0;
    uint period = 1000;

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

    String statusStationString(wl_status_t status) {
        if (status == WL_CONNECTION_LOST)
            return "Connection Lost";
        if (status == WL_NO_SSID_AVAIL)
            return "No SSID available";
        if (status == WL_IDLE_STATUS)
            return "Idle Status";

        return "Disconnected";
    }
};

extern WirelessClass Wireless;

#endif
