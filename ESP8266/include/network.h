#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>

class NetworkClass {
private:
    String ssidApStation = "";
    String pskApStation  = "";

    String ssidStation = "";
    String pskStation  = "";

    int stationConnectCount;

    WiFiEventHandler stationConnectedHanlder;
    WiFiEventHandler stationDisconnectedHandler;
    WiFiEventHandler apStationConnectedHandler;
    WiFiEventHandler apStationDisconnectedHandler;

    WebSocketsServer apStationSocket = WebSocketsServer(81);
    ESP8266WebServer apStationServer;
    IPAddress apStationIp;
    IPAddress apStationGateway;
    IPAddress apStationSubnet;

public:
    NetworkClass() : apStationServer(80) {}

    static const int STATION_CONNECT_NOT_CHANGED    = 1;
    static const int STATION_CONNECT_CONNECT_FAILED = 2;
    static const int STATION_CONNECT_CHANGE_SUCCESS = 3;
    static const int STATION_CONNECT_CHANGE_FAILED  = 4;

    void begin();
    void loop();
    void wifiBegin();
    void serverBegin();
    int stationConnect(String ssid, String psk);
    int stationConnect(String ssid, String psk, bool igoneChanged);
    void serverSendHttpCode(uint16_t code);

    void onServerHandleRoot();
    void onServerHandleWifi();
    void onSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length);

    static void onStationConnected(const WiFiEventStationModeConnected & evt);
    static void onStationDisconnected(const WiFiEventStationModeDisconnected & evt);
    static void onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt);
    static void onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt);

    static String macToString(const unsigned char* mac);
    static String httpCodeToString(uint16_t code);

protected:
    String ssidApStationMake();
    String pskApStationMake();
};

extern NetworkClass Network;

#endif
