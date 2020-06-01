#include "main.h"
#include "ffs.h"
#include "record.h"
#include "profile.h"
#include "network.h"
#include "io.h"

#define TIMER_COUNT 3

unsigned long timers[TIMER_COUNT][2] = {
    { millis(), 10   },
    { millis(), 500  },
    { millis(), 5000 }
};

void setup() {
    Serial.begin(115200);
    Serial.println("Smart Home ESP8266");
    FFS.begin();
    Record.begin();
    Profile.begin();
    Network.begin();
    IO.begin();
}

void timer(int position) {
    switch (position) {
        case 0:
            IO.loop();
            Network.loop();
            break;

        case 1:
            Network.loopWait();
            break;

        case 2:
            if (WiFi.status() == WL_CONNECTED)
                Serial.println("SSID [" + String(millis()) + "]: " + WiFi.SSID());
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
