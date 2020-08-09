#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <EspMQTTClient.h>

EspMQTTClient client("192.168.31.104", 1883, "ESP8266");

void setup() {
    Serial.begin(115200);
    Serial.println("SmartHome MQTT running");
    WiFi.begin("IzeroCs Guest", "nhutheday");
    Serial.print("WiFi connecting");

    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(500);
    }

    Serial.println();
    Serial.println("MQTT begin");
    client.setOnConnectionEstablishedCallback(&onConnectionEstablished);
}

void loop() {
    client.loop();
}

void onConnectionEstablished() {
    Serial.println("MQTT connected");

    client.subscribe("room", [] (const String &payload) {
        Serial.println("MQTT Subscribe: " + payload);
    });
}
