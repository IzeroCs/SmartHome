#include "ota.h"
#include "profile.h"

void OTAClass::begin() {
    String hostname = String(Profile.getSn() + Profile.getSc() + ".local");
           hostname.toLowerCase();

    ArduinoOTA.setHostname(hostname.c_str());
    ArduinoOTA.setPassword(pass);
    ArduinoOTA.setRebootOnSuccess(true);
    ArduinoOTA.begin(true);
    ArduinoOTA.onStart([&] { onStart(); });
    ArduinoOTA.onEnd([&] { onEnd(); });
    ArduinoOTA.onError([&] (ota_error_t error) { onError(error); });
    ArduinoOTA.onProgress([&] (unsigned int progress, unsigned int total) { onProgress(progress, total ); });

    isRunning = true;
}

void OTAClass::stop() {
    isRunning = false;
}

void OTAClass::led() {
    if (digitalRead(LED_BUILTIN) == LOW)
        digitalWrite(LED_BUILTIN, HIGH);
    else
        digitalWrite(LED_BUILTIN, LOW);
}

void OTAClass::handle() {
    if (isRunning)
        ArduinoOTA.handle();
}

void OTAClass::onStart() {
    Serial.println("[OTA] Start");
    led();
}

void OTAClass::onEnd() {
    Serial.println("[OTA] End");
    led();
}

void OTAClass::onError(ota_error_t error) {
    Serial.print("[OTA] Error: ");
    led();

    switch (error) {
        case OTA_AUTH_ERROR:
            Serial.println("Authentication");
            break;

        case OTA_BEGIN_ERROR:
            Serial.println("Begin");
            break;

        case OTA_CONNECT_ERROR:
            Serial.println("Connect");
            break;

        case OTA_RECEIVE_ERROR:
            Serial.println("Receive");
            break;

        case OTA_END_ERROR:
            Serial.println("End");
            break;
    }
}

void OTAClass::onProgress(unsigned int progress, unsigned int total) {
    led();
    Serial.println("[OTA] Progress: " + String(progress / (total / 100)));
}

OTAClass OTA;
