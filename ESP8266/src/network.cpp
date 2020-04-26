#include "profile.h"
#include "network.h"

void NetworkClass::wifiBegin() {
    ssidStation = ssidStationMake();
    passStation = passStationMake();

    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);
    //WiFi.softAP()
}

void NetworkClass::wifiConnect() {

}

String NetworkClass::ssidStationMake() {
    return "";
}

String NetworkClass::passStationMake() {
    return "";
}

NetworkClass Network;
