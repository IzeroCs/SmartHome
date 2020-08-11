#include "network/cloud.h"

void CloudClass::begin(WiFiClient wifiClient) {
    if (initializing)
        return;

    initializing = true;

    Monitor.println("[Cloud] Begin");
    Monitor.println("[Cloud] Connect");

    mqtt.begin(host, port, wifiClient);
    mqtt.setOptions(1000, true, 10000);

    // client.setCallback()

    // mqtt.begin("192.168.31.104", 1883, Seri.getHostname().c_str());
    // mqtt.enableDebuggingMessages(true);
    // mqtt.setOnConnectionEstablishedCallback([&] { connection(); });
}

void CloudClass::handle() {
    if (!initializing)
        return;

    if (mqttConnected) {
        if (intervalNow == 0)
            intervalNow = millis();

        if (millis() - intervalNow >= intervalPeriod) {
            intervalNow = millis();
            mqtt.loop();
            Monitor.println("[Cloud] Interval");
        }
    }

    if (!mqttConnected) {
        if (millis() - connectNow >= connectPeriod) {
            Monitor.println("[Cloud] Connecting broker: " + String(host) + ":" + String(port));
            connectNow = millis();
            mqttConnected = false;

            if (mqtt.connect(Seri.getHostname().c_str())) {
                mqttConnected = true;
                connection();
            } else {
                Monitor.println("[Cloud] Connect failure, reconnect in " + String(connectPeriod / 1000) + "s");
            }
        }
    }
}

void CloudClass::connection() {
    Monitor.println("[Cloud] Connection");

    // mqtt.subscribe("esp/authentication", [] (String msg) {
    //     Monitor.println("[Cloud] Authentacation: " + msg);
    // });
}

CloudClass Cloud;
