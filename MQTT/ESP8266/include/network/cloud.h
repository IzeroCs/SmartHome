#ifndef MQTT_H
#define MQTT_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <MQTTClient.h>

#include "stream/monitor.h"
#include "system/seri.h"

#define CLOUD_TOPIC_AUTHENTICATION "esp/authentication"

class CloudClass {
private:
    const char * host = "192.168.31.104";
    const uint16_t port = 1883;

    MQTTClient mqtt;
    bool initializing;
    bool mqttConnected;

    ulong connectNow = 0;
    ulong intervalNow = 0;
    ulong connectPeriod = 1000;
    ulong intervalPeriod = 1000;

public:
    void begin(WiFiClient wifiClient);
    void handle();
    void connection();
};

extern CloudClass Cloud;

#endif
