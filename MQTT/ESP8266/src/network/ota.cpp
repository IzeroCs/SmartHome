#include "network/ota.h"

void OTAClass::begin() {
    if (otaRunning)
        return;

    Monitor.println("[OTAUpdate] Begin");

    hostname = String(Seri.getHostname() + ".local");
    hostname.toLowerCase();
    password = "nhutheday";

    ArduinoOTA.setHostname(hostname.c_str());
    ArduinoOTA.setPassword(password.c_str());
    ArduinoOTA.setRebootOnSuccess(true);
    ArduinoOTA.begin(true);

    ArduinoOTA.onStart([&] { onStart(); });
    ArduinoOTA.onEnd([&] { onEnd(); });
    ArduinoOTA.onError([&] (ota_error_t error) { onError(error); });
    ArduinoOTA.onProgress([&] (uint progress, uint total) { onProgress(progress, total); });

    otaRunning = true;
}

void OTAClass::pause() {
    otaRunning = false;
}

void OTAClass::loop() {
    if (otaRunning)
        ArduinoOTA.handle();
}

void OTAClass::led() {
    Monitor.led(!Monitor.ledStatus());
}

void OTAClass::onStart() {
    Monitor.println("[OTAUpdate] Start");
    led();
}

void OTAClass::onEnd() {
    Monitor.println("[OTAUpdate] End");
    led();
}

void OTAClass::onError(ota_error_t error) {
    Monitor.print("[OTAUpdate] Error: ");
    led();

    switch (error) {
        case OTA_AUTH_ERROR:
            Monitor.println("Authentication");
            break;

        case OTA_BEGIN_ERROR:
            Monitor.println("Begin");
            break;

        case OTA_CONNECT_ERROR:
            Monitor.println("Connect");
            break;

        case OTA_RECEIVE_ERROR:
            Monitor.println("Receive");
            break;

        case OTA_END_ERROR:
            Monitor.println("End");
            break;
    }
}

void OTAClass::onProgress(unsigned int progress, unsigned int total) {
    led();
    Monitor.println("[OTAUpdate] Progress: " + String(progress / (total / 100)) + "%");
}

OTAClass OTA;
