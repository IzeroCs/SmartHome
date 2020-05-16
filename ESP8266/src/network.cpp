#include "profile.h"
#include "network.h"
#include "station.h"
#include "ap_station.h"
#include "server_socket.h"

void NetworkClass::begin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);

    Station.begin();
    ApStation.begin();
    ServerSocket.begin();

    if (!WiFi.isConnected()) {
        ApStation.setEnabled(true);
        ServerSocket.run();
    }
}

void NetworkClass::loop() {
    ApStation.loop();
    ServerSocket.loop();
}

void NetworkClass::loopSocketPing() {
    ServerSocket.loopPing();
}

void NetworkClass::loopStationReconnect() {
    Station.loop();
}

NetworkClass Network;
