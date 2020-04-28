#include <Arduino.h>
#include "main.h"
#include "record.h"
#include "profile.h"
#include "network.h"

#define PIN_COUNT_MAP 3

unsigned long timerOne = 0;

uint8_t pinInMaps[PIN_COUNT_MAP]   = { 14, 12, 13 };
uint8_t pinOutMaps[PIN_COUNT_MAP]  = { 16,  5,  4 };
uint8_t pinInStatus[PIN_COUNT_MAP] = {  0,  0,  0 };

void setup() {
    Serial.begin(115200);
    Record.begin();
    Profile.begin();
    Network.wifiBegin();
    Network.wifiConnect();

    for (int i = 0; i < PIN_COUNT_MAP; ++i) {
        pinMode(pinInMaps[i], INPUT);
        pinMode(pinOutMaps[i], OUTPUT);

        digitalWrite(pinOutMaps[i], LOW);
    }
}

void loop() {
    if ((unsigned long)(millis() - timerOne) > 100) {
        for (int i = 0; i < PIN_COUNT_MAP; ++i) {
            if (digitalRead(pinInMaps[i]) == LOW) {
                if (pinInStatus[i] == 0) {
                    pinInStatus[i] = 1;
                    digitalWrite(pinOutMaps[i], HIGH);
                }
            } else if (pinInStatus[i] == 1) {
                pinInStatus[i] = 0;
                digitalWrite(pinOutMaps[i], LOW);
            }
        }

        timerOne = millis();
    }
}
