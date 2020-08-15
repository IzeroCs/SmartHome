#include "network/cloud.h"

void CloudClass::begin() {
    if (initializing)
        return;

    mqttConnected = false;
    initializing = true;

    Monitor.println("[Cloud] Begin");
    Monitor.println("[Cloud] Connect");
    mqtt.setServer(host.c_str(), port);
    mqtt.setBufferSize(512);

    mqtt.setCallback([&] (char * topic, char * payload, uint size) {
        String mqttTopic   = String(topic);
        String mqttPrefix  = "server/esp/" + Seri.getHostname() + "/";

        if (mqttTopic.startsWith(mqttPrefix))
            callback(mqttTopic.substring(mqttPrefix.length()).c_str(), payload, size);
    });
}

void CloudClass::handle() {
    if (!initializing || WiFi.status() != WL_CONNECTED)
        return;

    if (!mqtt.connected()) {
        if (mqttConnected)
            disconnection();

        mqttConnected = false;

        if (millis() - connectNow >= connectPeriod) {
            if (!mqttReconnected)
                Monitor.println("[Cloud] Attempting MQTT connection...");

            mqttReconnected = true;
            connectNow = millis();

            if (mqtt.connect(Seri.getHostname().c_str(), "ESP", token.c_str())) {
                mqttConnected = true;
                mqttReconnected = false;
                preStateConnect = -100;
                connection();
            } else {
                mqttConnected = false;
                mqttReconnected = false;

                if (preStateConnect != mqtt.state()) {
                    preStateConnect = mqtt.state();
                    Monitor.println("[Cloud] MQTT connect error: " + connectError(mqtt.state()));
                }
            }
        }
    } else {
        mqtt.loop();
        loop();
    }
}

void CloudClass::loop() {
    if (millis() - loopNow >= loopPeriod) {
        loopNow = millis();

        publish(CLOUD_TOPIC_SYNC_IO, "IO");
        publish(CLOUD_TOPIC_SYNC_DETAIL, "Detail");
    }
}

void CloudClass::connection() {
    Monitor.println("[Cloud] Connection");

    subscribe(CLOUD_TOPIC_SYNC_IO);
    subscribe(CLOUD_TOPIC_SYNC_DETAIL);
}

void CloudClass::disconnection() {
    Monitor.println("[Cloud] Disconnection");
}

void CloudClass::callback(const char * topic, const char * payload, const uint size) {
    Monitor.println("[Cloud] Topic: " + String(topic));
    Monitor.println("[Cloud] Payload: " + String(payload));
}

CloudClass Cloud;
