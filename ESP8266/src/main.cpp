#include <Arduino.h>
#include "main.h"
#include "record.h"
#include "profile.h"
#include "network.h"

unsigned long timerOne = 0;
unsigned long timerTow = 0;

void setup() {
    timerOne = millis();
    timerTow = millis();

    Serial.begin(115200);
    Serial.println("Smart Home ESP8266");
    Record.begin();
    Profile.begin();
    Network.begin();
}

void loop() {
    unsigned long currentMillis = millis();

    if ((unsigned long)(currentMillis - timerOne) > 10) {
        timerOne = currentMillis;
        Network.loop();
    }

    if ((unsigned long)(currentMillis - timerTow) > 500) {
        timerTow = currentMillis;
        Network.loopPing();
    }
}
