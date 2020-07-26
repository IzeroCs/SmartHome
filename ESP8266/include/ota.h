#ifndef OTA_H
#define OTA_H

#include <Arduino.h>
#include <ArduinoOTA.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPUpdateServer.h>

class OTAClass {
private:
    const char * user = "izerocs";
    const char * pass = "nhutheday";
    bool isRunning;

public:
    void begin();
    void stop();
    void handle();

protected:
    void onStart();
    void onEnd();
    void onProgress(unsigned int progress, unsigned int total);
    void onError(ota_error_t error);
    void led();
};

extern OTAClass OTA;
#endif
