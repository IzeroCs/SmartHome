#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

class NetworkClass {
private:
    String ssidApStation;
    String passApStation;

    WiFiEventHandler stationConnectedHanlder;
    WiFiEventHandler stationDisconnectedHandler;
    WiFiEventHandler apStationConnectedHandler;
    WiFiEventHandler apStationDisconnectedHandler;

    ESP8266WebServer apStationServer;
    IPAddress apStationIp;
    IPAddress apStationGateway;
    IPAddress apStationSubnet;

public:
    NetworkClass() : apStationServer(80) {}

    void begin();
    void loop();
    void wifiBegin();
    void serverBegin();

    void onServerHandleRoot();
    void onServerHandleWifi();

    static void onStationConnected(const WiFiEventStationModeConnected & evt);
    static void onStationDisconnected(const WiFiEventStationModeDisconnected & evt);
    static void onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt);
    static void onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt);

    static String macToString(const unsigned char* mac);

protected:
    String ssidApStationMake();
    String passApStationMake();
};

extern NetworkClass Network;

#endif
