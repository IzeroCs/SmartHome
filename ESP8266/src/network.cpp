#include "profile.h"
#include "network.h"
#include "station.h"
#include "ap_station.h"

void NetworkClass::begin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);

    Station.begin();
    ApStation.begin();

    if (!WiFi.isConnected()) {
        ApStation.setEnabled(true);
    }
}

void NetworkClass::loop() {
    ApStation.loop();
}

void NetworkClass::loopStationReconnect() {
    Station.loop();
}

NetworkClass Network;
