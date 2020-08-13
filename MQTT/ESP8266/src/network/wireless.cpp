#include "network/wireless.h"

void WirelessClass::begin() {
    Monitor.println("[Wireless] Begin");
    WiFi.persistent(false);

    beginStation("IzeroCs Guest", "nhutheday");
}

void WirelessClass::beginStation(String ssid, String pass) {
    Config.setStationConfig(ssid, pass);
    Config.save();
}

void WirelessClass::loop() {
    if (millis() - now >= period) {
        now = millis();

        if (WiFi.status() == WL_CONNECTED) {
            waitConnect = false;
            printDisconnected = false;
            countConnect = 0;

            if (!printConnected) {
                printConnected = true;

                Monitor.led(false);
                Monitor.println("[Wireless] Connected: " + WiFi.SSID());
            }

            OTA.begin();
            Cloud.begin();
        } else {
            printConnected = false;

            if (!printDisconnected) {
                printDisconnected = true;
                Monitor.println("[Wireless] Disconnected: " + WiFi.SSID());
            }

            if (!waitConnect || ++countConnect >= periodConnect) {
                if (!waitConnect)
                    Monitor.println("[Wireless] Wait connect: " + Config.getStationSSID());
                else
                    Monitor.println("[Wireless] Reset wait connect: " + Config.getStationSSID());

                countConnect = 0;
                waitConnect = true;

                Monitor.led(true);
                WiFi.begin(Config.getStationSSID(),
                           Config.getStationPass());

                if (WiFi.hostname(Seri.getHostname()))
                    Monitor.println("[Wireless] Hostname: " + Seri.getHostname());
                else
                    Monitor.println("[Wireless] Hostname change unsuccessful");
            } else if (waitConnect) {
                Monitor.println("[Wirelees] Connecting(" + String(countConnect) + "): " + Config.getStationSSID());
            }
        }
    }

    OTA.loop();
}

WirelessClass Wireless;
