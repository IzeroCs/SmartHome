#include "profile.h"
#include "network.h"

void NetworkClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    Serial.println("onStationConnected: " + evt.ssid);
}

void NetworkClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    Serial.println("onStationDisconnected: " + evt.ssid);
}

void NetworkClass::onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt) {
    Serial.println("onAPStationConnected: " + macToString(evt.mac));
}

void NetworkClass::onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt) {
    Serial.println("onAPStationDisconnected: " + macToString(evt.mac));
}

void NetworkClass::onServerHandleRoot() {
    Serial.println("onServerHandleRoot");
    apStationServer.send(200, "text/html", "ESP8266");
}

void NetworkClass::onServerHandleWifi() {
    Serial.println("onSeverHandleWifi");
    apStationServer.send(200, "text/html", "ESP8266 Wifi Receive");
}

void NetworkClass::begin() {
    ssidApStation = ssidApStationMake();
    passApStation = passApStationMake();

    apStationIp      = IPAddress(192, 168, 31, 15);
    apStationGateway = IPAddress(192, 168, 31, 15);
    apStationSubnet  = IPAddress(255, 255, 255, 0);

    wifiBegin();
    serverBegin();
}

void NetworkClass::wifiBegin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);
    WiFi.hostname(ssidApStation);
    WiFi.softAPConfig(apStationIp, apStationGateway, apStationSubnet);
    WiFi.softAP(ssidApStation, passApStation);

    stationConnectedHanlder      = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler   = WiFi.onStationModeDisconnected(&onStationDisconnected);
    apStationConnectedHandler    = WiFi.onSoftAPModeStationConnected(&onAPStationConnected);
    apStationDisconnectedHandler = WiFi.onSoftAPModeStationDisconnected(&onAPStationDisconnected);
}

void NetworkClass::serverBegin() {
    apStationServer.on("/", [&] { onServerHandleRoot(); });
    apStationServer.on("/wifi", [&] { onServerHandleWifi(); });

    apStationServer.begin();
}

void NetworkClass::loop() {
    apStationServer.handleClient();
}

String NetworkClass::ssidApStationMake() {
    return Profile.getSn() + Profile.getSc();
}

String NetworkClass::passApStationMake() {
    return Profile.getSc();
}

String NetworkClass::macToString(const unsigned char * mac) {
  char buf[20];
  snprintf(buf, sizeof(buf), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(buf);
}

NetworkClass Network;
