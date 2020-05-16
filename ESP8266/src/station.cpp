#include "network.h"
#include "station.h"
#include "ap_station.h"
#include "server_socket.h"

void StationClass::begin() {
    WiFi.setAutoReconnect(true);

    stationConnectedHanlder      = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler   = WiFi.onStationModeDisconnected(&onStationDisconnected);
}

void StationClass::loop() {

}

int StationClass::stationConnect(String ssidNew, String pskNew) {
    return stationConnect(ssidNew, pskNew, false);
}

int StationClass::stationConnect(String ssidNew, String pskNew, bool igoneChanged) {
    if (!igoneChanged && ssidNew.isEmpty())
        return STATION_CONNECT_NOT_CHANGED;

    if (!igoneChanged && ssidNew.equals(ssid) && psk.equals(pskNew))
        return STATION_CONNECT_NOT_CHANGED;

    WiFi.begin(ssidNew, pskNew);
    WiFi.reconnect();
    Serial.println("Change staion: { SSID => " + ssidNew + ", PSK => " + pskNew + " }");
    Serial.println("Connecting");

    for (int i = 0; i < 20; ++i) {
        if (WiFi.status() != WL_CONNECTED) {
            Serial.print(".");
            delay(500);
        } else {
            break;
        }
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Connect failed");

        if (!ssid.isEmpty()/* && stationConnectCount++ > 1*/)
            stationConnect(ssid, psk, true);

        return STATION_CONNECT_CONNECT_FAILED;
    }

    Serial.println("Connected");
    ssid = ssidNew;
    psk  = pskNew;

    return STATION_CONNECT_CHANGE_SUCCESS;
}

void StationClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    Serial.println("Station Connected: " + evt.ssid);
    ApStation.setEnabled(true);
    ServerSocket.close();
}

void StationClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    Serial.println("Station Disconnected: " + evt.ssid);
    ApStation.setEnabled(false);
    ServerSocket.run();
}

StationClass Station;
