#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

class NetworkClass {
private:
    String ssidAccessPoint;
    String passAccessPoint;

    WiFiEventHandler stationConnectedHanlder;
    WiFiEventHandler stationDisconnectedHandler;
    WiFiEventHandler apStationConnectedHandler;
    WiFiEventHandler apStationDisconnectedHandler;

public:
    void wifiBegin();
    void wifiConnect();

    static void onStationConnected(const WiFiEventStationModeConnected & evt);
    static void onStationDisconnected(const WiFiEventStationModeDisconnected & evt);
    static void onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt);
    static void onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt);

    static String macToString(const unsigned char* mac);

protected:
    String ssidAccessPointMake();
    String passAccessPointMake();
};

extern NetworkClass Network;

#endif
