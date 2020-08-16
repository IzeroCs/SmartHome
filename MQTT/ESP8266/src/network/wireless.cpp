#include "network/wireless.h"

void WirelessClass::begin() {
    Monitor.println("[Wireless] Begin");
    WiFi.mode(WIFI_AP_STA);
    WiFi.persistent(false);
    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);
    WiFi.softAP(Seri.getHostname(), Seri.getSC());

    beginStation("IzeroCs Guest", "nhutheday");
}

void WirelessClass::beginStation(String ssid, String pass) {
    Config.setStationConfig(ssid, pass);
    Config.save();
}

void WirelessClass::loop() {
    wl_status_t status = WiFi.status();

    if (millis() - now >= period) {
        now = millis();

        if (status == WL_CONNECTED) {
            waitConnect = false;
            printDisconnected = false;
            countConnect = 0;

            if (!printConnected) {
                printConnected = true;

                Monitor.led(false);
                Monitor.println("[Wireless] Connected: " + WiFi.SSID());
                Config.save();
            }

            OTA.begin();
            Cloud.begin();
        } else {
            printConnected = false;

            if (!printDisconnected) {
                printDisconnected = true;
                Monitor.println("[Wireless] Disconnected: " + WiFi.SSID());
            }

            if (!waitConnect || countConnect++ >= periodConnect) {
                if (!waitConnect) {
                    Monitor.println("[Wireless] Wait connect: " + Config.getStationSSID());
                    WiFi.begin(Config.getStationSSID(), Config.getStationPass(), 10);
                } else {
                    Monitor.println("[Wireless] Reset wait connect: " + Config.getStationSSID());
                    WiFi.reconnect();
                }

                countConnect = 0;
                waitConnect = true;

                if (WiFi.hostname(Seri.getHostname()))
                    Monitor.println("[Wireless] Hostname: " + Seri.getHostname());
                else
                    Monitor.println("[Wireless] Hostname change unsuccessful");

                Monitor.led(true);
            } else if (waitConnect) {
                Monitor.println("[Wirelees] Connecting(" + String(countConnect) + "): " + Config.getStationSSID() +
                                ", Status: " + statusStationString(status));
            }
        }
    }

    OTA.loop();
}

WirelessClass Wireless;
