#include <Arduino.h>
#include "main.h"
#include "record.h"
#include "profile.h"
#include "network.h"

unsigned long timerOne = 0;

void setup() {
    Serial.begin(115200);
    Serial.println("Smart Home ESP8266");
    Record.begin();
    Profile.begin();
    Network.begin();
}

void loop() {
    if ((unsigned long)(millis() - timerOne) > 10)
        Network.loop();
}
