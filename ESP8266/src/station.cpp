#include "network.h"
#include "station.h"

void StationClass::begin() {
    WiFi.setAutoReconnect(true);

    stationConnectedHanlder      = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler   = WiFi.onStationModeDisconnected(&onStationDisconnected);
}

void StationClass::loop() {
}

void StationClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    Serial.println("Station Connected: " + evt.ssid);
}

void StationClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    Serial.println("Station Disconnected: " + evt.ssid);
}

StationClass Station;
