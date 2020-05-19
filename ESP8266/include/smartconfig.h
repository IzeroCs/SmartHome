#ifndef SMARTCONFIG_H
#define SMARTCONFIG_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

class SmartConfigClass {
private:
    const bool DEBUG = true;

    const int MAX_COUNT_READY_SMART_CONFIG   = 10;
    const int MAX_COUNT_SMART_DONE_FAILED    = 20;
    const int MAX_COUNT_RESTART_SMART_CONFIG = 20;
    const int MAX_COUNT_RECONNECT_STATION    = 10;

    bool isSmartConfig;
    bool isRestartSmartConfig;

    uint8_t countReadySmartConfig;
    uint8_t countSmartDoneFailed;
    uint8_t countRestartSmartConfig;
    uint8_t countReconnectStation;

    WiFiUDP udp;
    WiFiEventHandler stationConnectedHanlder;
    WiFiEventHandler stationDisconnectedHandler;

    void startSmartConfig();
    void restartSmartConfig();
    void waitSmartConfig();
    void packetSmartConfig();
    void stopSmartConfig();
    void disableApStation();

public:
    void begin();
    void loop();

    bool isSmartConfigRun() {
        return isSmartConfig;
    }

    void runSmartConfig();

    static void onStationConnected(const WiFiEventStationModeConnected & evt);
    static void onStationDisconnected(const WiFiEventStationModeDisconnected & evt);
};

extern SmartConfigClass SmartConfig;

#endif
