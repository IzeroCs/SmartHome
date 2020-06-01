#include "profile.h"
#include "network.h"
#include "smartconfig.h"
#include "socket.h"

void NetworkClass::begin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_STA);
    WiFi.begin("IzeroCs Guest", "nhutheday");
    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);

    Socket.begin();
    SmartConfig.begin();
    SmartConfig.runSmartConfig();
}

void NetworkClass::loop() {
    Socket.loop();
    SmartConfig.loop();
}

void NetworkClass::loopWait() {
    Socket.loopSyncIO();
    SmartConfig.loopWait();
}

NetworkClass Network;
