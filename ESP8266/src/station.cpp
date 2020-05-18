#include "network.h"
#include "station.h"
#include "ap_station.h"

void StationClass::begin() {
    WiFi.setAutoReconnect(true);

    stationConnectedHanlder      = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler   = WiFi.onStationModeDisconnected(&onStationDisconnected);
}

void StationClass::loop() {
    if (isWaitConnect) {
        if (++countWaitConnect > MAX_STATION_WAIT_CONNECT) {
            isWaitConnect = false;
            countWaitConnect = 0;

            setStatusWait(StationStatus_WAIT_CONNECT_FAILED);
            triggerWaitStatusEvent(StationStatus_WAIT_LIMIT_CONNECT);
            triggerWaitStatusEvent(StationStatus_WAIT_END_CONNECT);

            ApStation.setEnabled(true);
            WiFi.setAutoReconnect(false);
            WiFi.enableSTA(false);
        }

        switch (WiFi.status()) {
            case WL_CONNECTED:
                ssid = ssidWaitConnect;
                psk  = pskWaitConnect;

                resetWaitConnect();
                setStatusWait(StationStatus_WAIT_CONNECTED);
                triggerWaitStatusEvent(StationStatus_WAIT_CONNECTED);
                triggerWaitStatusEvent(StationStatus_WAIT_END_CONNECT);
                break;

            case WL_NO_SSID_AVAIL:
                triggerWaitStatusEvent(StationStatus_WAIT_NO_SSID_AVAIL);
                break;

            case WL_CONNECT_FAILED:
                setStatusWait(StationStatus_WAIT_CONNECT_FAILED);
                triggerWaitStatusEvent(StationStatus_WAIT_CONNECT_FAILED);
                break;

            case WL_IDLE_STATUS:
                triggerWaitStatusEvent(StationStatus_WAIT_WL_IDLE_STATUS);
                break;

            case WL_DISCONNECTED:
                triggerWaitStatusEvent(StationStatus_WAIT_DISCONNECTED);
                break;

            default:
                triggerWaitStatusEvent(StationStatus_WAIT_LIMIT_CONNECT);
                triggerWaitStatusEvent(StationStatus_WAIT_END_CONNECT);
        }
    }
}

void StationClass::connect(String ssidNew, String pskNew) {
    connect(ssidNew, pskNew, false);
}

void StationClass::connect(String ssidNew, String pskNew, bool igoneChanged) {
    if (!igoneChanged && ssidNew.isEmpty())
        triggerWaitStatusEvent(StationStatus_WAIT_NOT_CHANGED);

    if (!igoneChanged && ssidNew.equals(ssid) && psk.equals(pskNew))
        triggerWaitStatusEvent(StationStatus_WAIT_NOT_CHANGED);

    triggerWaitStatusEvent(StationStatus_WAIT_BEGIN_CONNECT);
    WiFi.enableSTA(true);
    WiFi.begin(ssidNew, pskNew);
    triggerWaitStatusEvent(StationStatus_WAIT_START_CONNECT);

    Serial.println("Change staion: { SSID => " + ssidNew + ", PSK => " + pskNew + " }");
    Serial.println("Connecting");

    countWaitConnect = 0;
    isWaitConnect    = true;
    ssidWaitConnect  = ssidNew;
    pskWaitConnect   = pskNew;
}

void StationClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    Serial.println("Station Connected: " + evt.ssid);
}

void StationClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    Serial.println("Station Disconnected: " + evt.ssid);
}

StationClass Station;
