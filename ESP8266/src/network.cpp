#include "profile.h"
#include "network.h"

void NetworkClass::wifiBegin() {
    ssidAccessPoint = ssidAccessPointMake();
    passAccessPoint = passAccessPointMake();

    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);
    WiFi.hostname(ssidAccessPoint);
    WiFi.softAP(ssidAccessPoint, passAccessPoint);
}

void NetworkClass::wifiConnect() {

}

String NetworkClass::ssidAccessPointMake() {
    return Profile.getSn() + Profile.getSc();
}

String NetworkClass::passAccessPointMake() {
    return Profile.getSc();
}

NetworkClass Network;
