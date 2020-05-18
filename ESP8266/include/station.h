#ifndef STATION_H
#define STATION_H

using namespace std;

#include <vector>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

#define MAX_STATION_WAIT_CONNECT 30

typedef enum { StationAction_WAIT } StationAction_t;
typedef enum {
    StationStatus_WAIT_NOT_CHANGED,
    StationStatus_WAIT_BEGIN_CONNECT,
    StationStatus_WAIT_START_CONNECT,
    StationStatus_WAIT_END_CONNECT,
    StationStatus_WAIT_LIMIT_CONNECT,
    StationStatus_WAIT_NO_SSID_AVAIL,
    StationStatus_WAIT_CONNECT_FAILED,
    StationStatus_WAIT_WL_IDLE_STATUS,
    StationStatus_WAIT_CONNECTED,
    StationStatus_WAIT_DISCONNECTED
} StationStatus_t;

typedef function<void(StationAction_t action,
    StationStatus_t status)> StationEvent;

class StationClass {
private:
    bool isWaitConnect;
    uint8_t countWaitConnect;

    String ssid = "";
    String psk  = "";

    String ssidWaitConnect = "";
    String pskWaitConnect  = "";

    vector<StationEvent> events;

    WiFiEventHandler stationConnectedHanlder;
    WiFiEventHandler stationDisconnectedHandler;

    void loopConnect();

    void resetWaitConnect() {
        isWaitConnect    = false;
        countWaitConnect = 0;
        ssidWaitConnect  = "";
        pskWaitConnect   = "";
    }

    void triggerWaitStatusEvent(StationStatus_t status) {
        int i = 0;
        int size = events.size();

        for (i = 0; i < size; ++i)
            events.at(i)(StationAction_WAIT, status);
    }

public:
    void begin();
    void loop();

    void connect(String ssidNew, String pskNew);
    void connect(String ssidNew, String pskNew, bool igoneChanged);

    void addEvent(StationEvent event) {
        events.push_back(event);
    }

    bool isWaitConnecting() {
        return isWaitConnect;
    }

    String getSsid() {
        return ssid;
    }

    String getPsk() {
        return psk;
    }

    static void onStationConnected(const WiFiEventStationModeConnected & evt);
    static void onStationDisconnected(const WiFiEventStationModeDisconnected & evt);
};

extern StationClass Station;

#endif
