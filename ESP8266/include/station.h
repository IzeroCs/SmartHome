#ifndef STATION_H
#define STATION_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

class StationClass {
private:
    String ssid = "";
    String psk  = "";

    WiFiEventHandler stationConnectedHanlder;
    WiFiEventHandler stationDisconnectedHandler;

    static const int STATION_CONNECT_NOT_CHANGED    = 1;
    static const int STATION_CONNECT_CONNECT_FAILED = 2;
    static const int STATION_CONNECT_CHANGE_SUCCESS = 3;
    static const int STATION_CONNECT_CHANGE_FAILED  = 4;

public:
    void begin();
    void loop();

    int stationConnect(String ssidNew, String pskNew);
    int stationConnect(String ssidNew, String pskNew, bool igoneChanged);

    static void onStationConnected(const WiFiEventStationModeConnected & evt);
    static void onStationDisconnected(const WiFiEventStationModeDisconnected & evt);
};

extern StationClass Station;

#endif
