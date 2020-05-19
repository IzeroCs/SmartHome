#include "smartconfig.h"
#include "profile.h"

void SmartConfigClass::begin() {
    stationConnectedHanlder    = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler = WiFi.onStationModeDisconnected(&onStationDisconnected);
}

void SmartConfigClass::loop() {
    if (isRestartSmartConfig)
        return runSmartConfig();

    if (!isSmartConfig && WiFi.status() != WL_CONNECTED)
        return runSmartConfig();
}

void SmartConfigClass::startSmartConfig() {
    if (isSmartConfig)
        return;

    if (DEBUG)
        Serial.println("StartSmartConfig");

    isSmartConfig           = true;
    isRestartSmartConfig    = false;
    countReadySmartConfig   = 0;
    countSmartDoneFailed    = 0;
    countRestartSmartConfig = 0;
    countReconnectStation   = 0;

    WiFi.mode(WIFI_AP_STA);
    WiFi.hostname(Profile.getSn() + Profile.getSc());
    WiFi.softAP(Profile.getSn() + Profile.getSc(), Profile.getSc());
    WiFi.setAutoReconnect(true);
}

void SmartConfigClass::restartSmartConfig() {
    isRestartSmartConfig = true;

    if (DEBUG)
        Serial.println("RestartSmartConfig");

    stopSmartConfig();
}

void SmartConfigClass::waitSmartConfig() {
    if (DEBUG)
        Serial.print("BeginSmartConfig");

    do {
        if (WiFi.status() == WL_CONNECTED) {
            if (DEBUG)
                Serial.println();

            stopSmartConfig();
            disableApStation();

            return;
        }

        delay(500);
        if (DEBUG) Serial.print(".");

        if (countReadySmartConfig++ >= MAX_COUNT_READY_SMART_CONFIG) {
            WiFi.beginSmartConfig();
            if (DEBUG) Serial.println();
            break;
        }
    } while (true);

    if (countReadySmartConfig < MAX_COUNT_READY_SMART_CONFIG) {
        if (WiFi.status() == WL_CONNECTED) {
            if (DEBUG)
                Serial.println();

            stopSmartConfig();
            disableApStation();

            return;
        } else {
            stopSmartConfig();
            restartSmartConfig();

            return;
        }
    }

    if (DEBUG)
        Serial.print("WaitSmartConfigDone");

    while (countSmartDoneFailed < MAX_COUNT_SMART_DONE_FAILED) {
        delay(1000);
        if (DEBUG) Serial.print(".");

        if (countRestartSmartConfig++ >= MAX_COUNT_RESTART_SMART_CONFIG) {
            if (DEBUG)
                Serial.println();

            stopSmartConfig();
            WiFi.reconnect();

            if (DEBUG)
                Serial.print("ReconnectStation");

            while (WiFi.status() != WL_CONNECTED) {
                if (countReconnectStation++ <= MAX_COUNT_RECONNECT_STATION) {
                    delay(500);

                    if (DEBUG)
                        Serial.print(".");
                } else {
                    break;
                }
            }

            if (DEBUG)
                Serial.println();

            if (WiFi.status() == WL_CONNECTED) {
                stopSmartConfig();
                disableApStation();

                return;
            } else {
                return restartSmartConfig();
            }
        }

        if (WiFi.smartConfigDone()) {
            if (DEBUG) {
                Serial.println();

                if (countSmartDoneFailed == 0)
                    Serial.print("SmartConfigDone");
                else
                    Serial.print(".");
            }

            if (countSmartDoneFailed++ >= MAX_COUNT_SMART_DONE_FAILED) {
                if (DEBUG) {
                    Serial.println();
                    Serial.println("SmartConfigDone: Failed connect station");
                }

                return restartSmartConfig();
            } else if (WiFi.status() == WL_CONNECTED) {
                if (DEBUG) {
                    Serial.println();
                    WiFi.printDiag(Serial);
                }

                packetSmartConfig();
                stopSmartConfig();
                disableApStation();

                return;
            }
        } else {
            countSmartDoneFailed = 0;
        }
    }

    if (DEBUG)
        Serial.println();

    stopSmartConfig();
}

void SmartConfigClass::packetSmartConfig() {
    if (DEBUG)
        Serial.print("PacketSmartConfig");

    udp.begin(49999);
    udp.parsePacket();

    while (udp.available()) {
        udp.flush();
        delay(5);

        if (DEBUG)
            Serial.print(".");
    }

    udp.stop();
    delay(1000);

    if (DEBUG)
        Serial.println();
}

void SmartConfigClass::stopSmartConfig() {
    isSmartConfig           = false;
    countReadySmartConfig   = 0;
    countSmartDoneFailed    = 0;
    countRestartSmartConfig = 0;
    countReconnectStation   = 0;

    if (DEBUG)
        Serial.println("StopSmartConfig");

    WiFi.stopSmartConfig();
    delay(1000);
}

void SmartConfigClass::runSmartConfig() {
    if (DEBUG)
        Serial.println("RunSmartConfig");

    if (!isSmartConfig) {
        startSmartConfig();
        waitSmartConfig();
    }
}

void SmartConfigClass::disableApStation() {
    if (DEBUG)
        Serial.println("DisableApStation");

    WiFi.enableAP(false);
}

void SmartConfigClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    // Serial.println("Station Connected: " + evt.ssid);
}

void SmartConfigClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    // Serial.println("Station Disconnected: " + evt.ssid);
}

SmartConfigClass SmartConfig;
