#include "profile.h"
#include "network.h"
#include "smartconfig.h"
#include "socket.h"
#include "lwip/napt.h"
#include "lwip/dns.h"
#include "dhcpserver.h"

void NetworkClass::begin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);
    WiFi.begin("IzeroCs Guest", "nhutheday");
    WiFi.hostname(Profile.getSn() + Profile.getSc());
    WiFi.setAutoConnect(true);
    WiFi.setAutoReconnect(true);
    WiFi.softAP(Profile.getSn() + Profile.getSc(), Profile.getSc());

    ip_napt_init(IP_NAPT_MAX, IP_PORTMAP_MAX);
    ip_napt_enable_no(SOFTAP_IF, 1);
    dhcps_set_dns(0, WiFi.dnsIP(0));
    dhcps_set_dns(1, WiFi.dnsIP(0));

    Socket.begin();
    SmartConfig.begin();
    SmartConfig.runSmartConfig();
}

void NetworkClass::loop() {
    Socket.loop();
    SmartConfig.loop();
}

void NetworkClass::loopWait() {
    Socket.loopSyncIO(true);
    SmartConfig.loopWait();
}

NetworkClass Network;
