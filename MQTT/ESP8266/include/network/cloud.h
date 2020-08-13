#ifndef MQTT_H
#define MQTT_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <MQTTClient.h>
#include <PubSubClient.h>

#include "stream/monitor.h"
#include "system/seri.h"

#define CLOUD_TOPIC_AUTHENTICATION "esp/authentication"

class CloudClass {
private:
    const char * host = "192.168.31.104";
    const uint16_t port = 1883;

    WiFiClient client;
    PubSubClient mqtt;
    bool initializing;
    bool mqttConnected;
    bool mqttReconnected;

    int preStateConnect = 0;
    ulong connectNow = 0;
    ulong connectPeriod = 1000;

public:
    CloudClass(): mqtt(client) {}

    void begin();
    void handle();

private:
    void connection();
    void disconnection();

    static String connectError(int state) {
        if (state == MQTT_CONNECTION_TIMEOUT)
            return F("Connection Timeout");
        if (state == MQTT_CONNECTION_LOST)
            return F("Connection Lost");
        if (state == MQTT_CONNECT_FAILED)
            return F("Connect Failed");
        if (state == MQTT_DISCONNECTED)
            return F("Disconnected");
        if (state == MQTT_CONNECT_BAD_PROTOCOL)
            return F("Connect Bad Protocol");
        if (state == MQTT_CONNECT_BAD_CLIENT_ID)
            return F("Connect Bad Cient ID");
        if (state == MQTT_CONNECT_UNAVAILABLE)
            return F("Connect Unavailable");
        if (state == MQTT_CONNECT_BAD_CREDENTIALS)
            return F("Connect Bad Credentials");
        if (state == MQTT_CONNECT_UNAUTHORIZED)
            return F("Connect Unauthorized");

        return F("Unknown");
    }
};

extern CloudClass Cloud;

#endif
