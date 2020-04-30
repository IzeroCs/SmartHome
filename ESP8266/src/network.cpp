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

void NetworkClass::wifiBegin() {
    ssidAccessPoint = ssidAccessPointMake();
    passAccessPoint = passAccessPointMake();

    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);
    WiFi.hostname(ssidAccessPoint);
    WiFi.softAP(ssidAccessPoint, passAccessPoint);

    stationConnectedHanlder      = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler   = WiFi.onStationModeDisconnected(&onStationDisconnected);
    apStationConnectedHandler    = WiFi.onSoftAPModeStationConnected(&onAPStationConnected);
    apStationDisconnectedHandler = WiFi.onSoftAPModeStationDisconnected(&onAPStationDisconnected);
}

void NetworkClass::wifiConnect() {

}

String NetworkClass::ssidAccessPointMake() {
    return Profile.getSn() + Profile.getSc();
}

String NetworkClass::passAccessPointMake() {
    return Profile.getSc();
}

String NetworkClass::macToString(const unsigned char * mac) {
  char buf[20];
  snprintf(buf, sizeof(buf), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(buf);
}

NetworkClass Network;
