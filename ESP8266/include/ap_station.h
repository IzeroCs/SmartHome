#ifndef AP_STATION_H
#define AP_STATON_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

class ApStationClass {
private:
    String ssid = "";
    String psk  = "";

    bool isEnable;
    bool isUseServer;

    ESP8266WebServer server;
    IPAddress ip;
    IPAddress gateway;
    IPAddress subnet;

    WiFiEventHandler apStationConnectedHandler;
    WiFiEventHandler apStationDisconnectedHandler;

    void beginServer();
    void loopServer();
    void serverSendHttpCode(uint16_t code);

public:
    ApStationClass() : server(80) {}

    void begin();
    void loop();
    void setEnabled(bool enable);

    bool isEnabled() {
        return isEnable;
    }

    static void onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt);
    static void onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt);

protected:
    String ssidMake();
    String pskMake();
};

extern ApStationClass ApStation;

#endif
