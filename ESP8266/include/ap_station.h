#ifndef AP_STATION_H
#define AP_STATON_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

#include "util.h"
#include "profile.h"

class ApStationClass {
private:
    String ssid = "";
    String psk  = "";
    String uid  = "";

    bool isEnable;
    bool isUseServer = true;
    bool isServerRunning;

    ESP8266WebServer server;
    IPAddress ip;
    IPAddress gateway;
    IPAddress subnet;

    WiFiEventHandler apStationConnectedHandler;
    WiFiEventHandler apStationDisconnectedHandler;

    void beginServer() {
        if (!isUseServer || isServerRunning)
            return;

        isServerRunning = true;
        Serial.println("Ap Station begin server");
        server.begin();
    }

    void loopServer() {
        if (isUseServer)
            server.handleClient();
    }

    void closeServer() {
        if (!isUseServer || !isServerRunning)
            return;

        isServerRunning = false;
        Serial.println("Ap station close server");
        server.close();
    }

    void serverSendHttpCode(uint16_t code) {
        if (isUseServer) {
            server.setContentLength(CONTENT_LENGTH_UNKNOWN);
            server.send(code, "text/plain", Util.httpCodeToString(code));
        }
    }

    String ssidMake() {
        return Profile.getSn() + Profile.getSc();
    }

    String pskMake() {
        return Profile.getSc();
    }

    void onStationEvent(StationAction_t action, StationStatus_t status);
    void onHandleRoot() { server.send(200, "text/html", "ESP8266 IzeroCs Server"); }
    void onHandleStation();
public:
    ApStationClass() : server(8080) {}

    void begin();
    void loop();

    void setEnabled(bool enable) {
        isEnable = enable;

        if (!enable) {
            Serial.println("Ap Station is disable");
            WiFi.disconnect(true);
            closeServer();
        } else {
            Serial.println("Ap Station is enable");
            beginServer();
        }

        WiFi.enableAP(enable);
    }

    bool isEnabled() {
        return isEnable;
    }

    static void onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt);
    static void onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt);
};

extern ApStationClass ApStation;

#endif
