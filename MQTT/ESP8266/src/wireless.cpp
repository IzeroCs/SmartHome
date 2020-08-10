#include "wireless.h"

void WirelessClass::begin() {
    beginStation("IzeroCs Guest", "nhutheday");
}

void WirelessClass::beginStation(String ssid, String pass) {
    Config.setStationConfig(ssid, pass);
}

void WirelessClass::loop() {
    if (millis() - now >= period) {
        now = millis();

        // if (connecter )
        if (WiFi.status() != WL_CONNECTED) {

        }
    }
}

WirelessClass Wireless;
