#ifndef OTA_H
#define OTA_H

#include <Arduino.h>
#include <ArduinoOTA.h>

#include "system/seri.h"
#include "stream/monitor.h"
#include "system/config.h"

class OTAClass {
private:
    String hostname;
    String password;

    bool otaRunning;

public:
    void begin();
    void pause();
    void loop();
    void led();

    bool isRunning() {
        return otaRunning;
    }

    void onStart();
    void onEnd();
    void onError(ota_error_t error);
    void onProgress(unsigned int progress, unsigned int total);
};

extern OTAClass OTA;

#endif
