#include "profile.h"
#include "network.h"
#include "smartconfig.h"

void NetworkClass::begin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_STA);
    SmartConfig.begin();
    SmartConfig.runSmartConfig();
}

void NetworkClass::loop() {
    SmartConfig.loop();
}

NetworkClass Network;
