#ifndef MQTT_H
#define MQTT_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <MQTTClient.h>
#include <PubSubClient.h>

#include "stream/monitor.h"
#include "system/seri.h"

#define CLOUD_TOPIC_SYNC_IO "sync-io"
#define CLOUD_TOPIC_SYNC_DETAIL "sync-detail"

class CloudClass {
private:
    String   host = "192.168.31.104";
    uint16_t port = 1883;

    String token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkVTUDgyNjYiLCJpYXQiOjQxMDI0NDQ4MDB9.HAU4zKdQnfHqj0kfLYoLH5blr3BUSgQo-DgxT0JvIjd9t6b0AloTjA1mUfbk9LRipe-OMC58LYIHG2kbpYAyCg";

    WiFiClient client;
    PubSubClient mqtt;
    bool initializing;
    bool mqttConnected;
    bool mqttReconnected;

    int preStateConnect = 0;
    ulong loopNow = 0;
    ulong connectNow = 0;
    ulong loopPeriod = 1000;
    ulong connectPeriod = 1000;

public:
    CloudClass(): mqtt(client) {}

    void begin();
    void handle();
    void callback(const char * topic, const char * payload, const uint size);

    bool isMQTTConnect() {
        return mqttConnected;
    }

    bool subscribe(const char * topic) {
        return mqtt.subscribe(("client/esp/" + Seri.getHostname() + "/" + String(topic))
                .c_str());
    }

    bool unsubscribe(const char * topic) {
        return mqtt.unsubscribe(("client/esp/" + Seri.getHostname() + "/" + String(topic))
                   .c_str());
    }

    bool publish(const char * topic, const char * payload) {
        return mqtt.publish(("server/esp/" + Seri.getHostname() + "/" + String(topic)).c_str(), payload);
    }

private:
    void loop();
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
