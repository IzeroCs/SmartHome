#include "util.h"
#include "profile.h"
#include "network.h"
#include "ap_station.h"
#include "server_socket.h"

void ApStationClass::begin() {
    ssid = ssidMake();
    psk  = pskMake();

    ip      = IPAddress(192, 168, 31, 15);
    gateway = IPAddress(192, 168, 31, 15);
    subnet  = IPAddress(255, 255, 255, 0);

    Serial.println("Ap Station begin");
    WiFi.hostname(ssid);
    WiFi.softAPConfig(ip, gateway, subnet);
    WiFi.softAP(ssid, psk);

    setEnabled(false);
}

void ApStationClass::beginServer() {
    if (!isUseServer)
        return;

    Serial.println("Ap Station begin server");

    apStationConnectedHandler    = WiFi.onSoftAPModeStationConnected(&onAPStationConnected);
    apStationDisconnectedHandler = WiFi.onSoftAPModeStationDisconnected(&onAPStationDisconnected);
}

void ApStationClass::setEnabled(bool enable) {
    isEnable = enable;

    if (!enable) {
        Serial.println("Ap Station is disable");
        WiFi.disconnect(true);
    } else {
        Serial.println("Ap Station is enable");
        beginServer();
    }

    WiFi.enableAP(enable);
}

void ApStationClass::loop() {
    loopServer();
}

void ApStationClass::loopServer() {
    if (isUseServer)
        server.handleClient();
}

void ApStationClass::serverSendHttpCode(uint16_t code) {
    if (isUseServer) {
        server.setContentLength(CONTENT_LENGTH_UNKNOWN);
        server.send(code, "text/plain", Util.httpCodeToString(code));
    }
}

void ApStationClass::onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt) {
    Serial.println("AP Station Connected: " + Util.macToString(evt.mac));
}

void ApStationClass::onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt) {
    Serial.println("AP Station Disconnected: " + Util.macToString(evt.mac));
}

String ApStationClass::ssidMake() {
    return Profile.getSn() + Profile.getSc();
}

String ApStationClass::pskMake() {
    return Profile.getSc();
}

ApStationClass ApStation;
