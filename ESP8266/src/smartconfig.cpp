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

void SmartConfigClass::loopWait() {
    if (isSmartConfig)
        waitSmartConfig();
}

void SmartConfigClass::startSmartConfig() {
    if (isSmartConfig)
        return;

    if (DEBUG)
        Serial.println("[SmartConfig]:Start");

    isSmartConfig             = true;
    isRestartSmartConfig      = false;
    isLoopBeginSmartConfig    = true;
    isLoopWaitSmartConfigDone = false;
    isLoopReconnectStation    = false;

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
        Serial.println("[SmartConfig]:Restart");

    stopSmartConfig();
}

void SmartConfigClass::waitSmartConfig() {
    if (isLoopBeginSmartConfig) {
        if (DEBUG && countReadySmartConfig == 0)
            Serial.println("[SmartConfig]:Begin");

        if (WiFi.status() == WL_CONNECTED) {
            stopSmartConfig();
            disableApStation();

            return;
        }

        if (countReadySmartConfig++ >= MAX_COUNT_READY_SMART_CONFIG) {
            WiFi.beginSmartConfig();
            Serial.println("[SmartConfig]:End");

            isLoopBeginSmartConfig    = false;
            isLoopWaitSmartConfigDone = true;

            return;
        }
    } else if (isLoopWaitSmartConfigDone) {
        if (DEBUG && countRestartSmartConfig == 0)
            Serial.println("[SmartConfig]:WaitDone");

        if (countRestartSmartConfig++ >= MAX_COUNT_RESTART_SMART_CONFIG) {
            isLoopWaitSmartConfigDone = false;
            isLoopReconnectStation    = true;

            return;
        }

        while (true) {
            delay(1000);

            if (DEBUG)
                    Serial.println("[SmartConfig]:While");

            if (WiFi.smartConfigDone()) {
                if (DEBUG)
                    Serial.println("[SmartConfig]:Done");

                if (countSmartDoneFailed++ >= MAX_COUNT_SMART_DONE_FAILED) {
                    if (DEBUG)
                        Serial.println("[SmartConfig]:Done Failed connect station");

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
            }
        }
    } else if (isLoopReconnectStation) {
        stopSmartConfig();

        if (WiFi.SSID().length() <= 0) {
            if (DEBUG)
                Serial.println("[SmartConfig]:IgnoreReconnect");

            return restartSmartConfig();
        }

        WiFi.reconnect();

        if (DEBUG)
            Serial.println("[SmartConfig]:ReconnectStation");

        if (WiFi.status() == WL_CONNECTED) {
            stopSmartConfig();
            disableApStation();

            return;
        }

        if (countReconnectStation++ >= MAX_COUNT_RECONNECT_STATION)
            return restartSmartConfig();
    }
}

void SmartConfigClass::packetSmartConfig() {
    if (DEBUG)
        Serial.print("[SmartConfig]:Packet");

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
    isSmartConfig             = false;
    isLoopBeginSmartConfig    = false;
    isLoopWaitSmartConfigDone = false;
    isLoopReconnectStation    = false;

    countReadySmartConfig   = 0;
    countSmartDoneFailed    = 0;
    countRestartSmartConfig = 0;
    countReconnectStation   = 0;

    if (DEBUG)
        Serial.println("[SmartConfig]:Stop");

    WiFi.stopSmartConfig();
    delay(1000);
}

void SmartConfigClass::runSmartConfig() {
    if (DEBUG)
        Serial.println("[SmartConfig]:Run");

    if (!isSmartConfig)
        startSmartConfig();
}

void SmartConfigClass::disableApStation() {
    if (DEBUG)
        Serial.println("[SmartConfig]:DisableApStation");

    WiFi.enableAP(false);
}

void SmartConfigClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    // Serial.println("Station Connected: " + evt.ssid);
}

void SmartConfigClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    // Serial.println("Station Disconnected: " + evt.ssid);
}

SmartConfigClass SmartConfig;
