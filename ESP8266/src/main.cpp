#include <Arduino.h>
#include "main.h"
#include "record.h"
#include "profile.h"
#include "network.h"

#define TIMER_COUNT 2

unsigned long timers[TIMER_COUNT][2] = {
    { millis(), 10  },
    { millis(), 500 }
};

void setup() {
    Serial.begin(115200);
    Serial.println("Smart Home ESP8266");
    Record.begin();
    Profile.begin();
    Network.begin();
}

void timer(int position) {
    switch (position) {
        case 0:
            Network.loop();
            break;

        case 1:
            Network.loopSocketPing();
            Network.loopStationReconnect();
            break;
    }
}

void loop() {
    unsigned long currentMillis = millis();

    for (uint8_t i = 0; i < TIMER_COUNT; ++i) {
        if ((unsigned long)(currentMillis - timers[i][0]) > timers[i][1]) {
            timer(i);
            timers[i][0] = currentMillis;
        }
    }
}
