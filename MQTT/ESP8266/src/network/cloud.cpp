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

        if (IODef.isForceChanged() || IODef.isStatusChanged()) {
            String pinArray = "";
            String changed = "false";
            IOMap_t::iterator it;
            IOMap_t ioMap = IODef.getIOMap();

            if (IODef.isStatusChanged())
                changed = "true";

            for (it = ioMap.begin(); it != ioMap.end(); ++it) {
                if (it->first != IOPin_0)
                    pinArray += ",";

                pinArray += it->second.toJSON();
            }

            publish(CLOUD_TOPIC_SYNC_IO, "{\"pins\":[" + pinArray + "],\"changed\":" + changed + "}");

            IODef.setForceChanged(false);
            IODef.setStatusChanged(false);
        }

        publish(CLOUD_TOPIC_SYNC_DETAIL, "{\"detail_rssi\":" + String(WiFi.RSSI()) + "}");
    }
}

void CloudClass::connection() {
    Monitor.println("[Cloud] Connection");
    IODef.setForceChanged(true);

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
