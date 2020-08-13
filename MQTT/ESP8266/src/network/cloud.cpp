#include "network/cloud.h"

void CloudClass::begin() {
    if (initializing)
        return;

    initializing = true;

    Monitor.println("[Cloud] Begin");
    Monitor.println("[Cloud] Connect");
    mqtt.setServer(host, port);
}

void CloudClass::handle() {
    if (!initializing || WiFi.status() != WL_CONNECTED)
        return;

    if (!mqtt.connected()) {
        if (mqttConnected)
            disconnection();

        mqttConnected = false;

        if (millis() - connectNow > connectPeriod) {
            if (!mqttReconnected)
                Monitor.println("[Cloud] Attempting MQTT connection...");

            mqttReconnected = true;
            connectNow = millis();

            if (mqtt.connect(Seri.getHostname().c_str())) {
                mqttConnected = true;
                mqttReconnected = false;
                preStateConnect = -100;
                connection();
            } else {
                mqttConnected = false;
                mqttReconnected = false;

                if (preStateConnect != mqtt.state()) {
                    preStateConnect = mqtt.state();
                    Monitor.print("[Cloud] MQTT connect error: " + connectError(mqtt.state()));
                }
            }
        }
    } else {
        mqtt.loop();
    }
}

void CloudClass::connection() {
    Monitor.println("[Cloud] Connection");

    // mqtt.subscribe("esp/authentication", [] (String msg) {
    //     Monitor.println("[Cloud] Authentacation: " + msg);
    // });
}

void CloudClass::disconnection() {
    Monitor.println("[Cloud] Disconnection");
}

CloudClass Cloud;
