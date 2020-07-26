#include "main.h"
#include "ffs.h"
#include "record.h"
#include "profile.h"
#include "ota.h"
#include "network.h"
#include "socket.h"
#include "io.h"

#define TIMER_COUNT 4

Ticker ticker;
bool isPrintConnect;
bool isPrintDisconnect;
bool isBlink;

unsigned long timers[TIMER_COUNT][2] = {
    { millis(), 10  },
    { millis(), 20 },
    { millis(), 1000 },
    { millis(), 5000 }
};

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    digitalWrite(LED_BUILTIN, HIGH);

    Serial.begin(115200);
    Serial.println();
    Serial.println("Smart Home ESP8266");
    FFS.begin();
    Record.begin(false);
    Profile.begin();
    Network.begin();
    IO.begin();

    ticker.attach_ms(1000, [&] { IO.loop(); });
}

void timer(int position) {
    switch (position) {
        case 0:
            OTA.handle();
            Network.loop();
            break;

        case 1:
            Socket.loopMain();
            break;

        case 2:
            Network.loopWait();

            if (WiFi.status() == WL_CONNECTED) {
                if (isBlink) {
                    digitalWrite(LED_BUILTIN, LOW);
                    isBlink = false;
                } else {
                    digitalWrite(LED_BUILTIN, HIGH);
                    isBlink = true;
                }
            } else {
                digitalWrite(LED_BUILTIN, LOW);
                isBlink = true;
            }
            break;

        case 3:
            if (WiFi.status() == WL_CONNECTED) {
                if (!isPrintConnect) {
                    isPrintConnect    = true;
                    isPrintDisconnect = false;

                    Serial.println("[Main] Connect: " + WiFi.SSID());
                    OTA.begin();
                }
            } else {
                isPrintConnect = false;

                if (!isPrintDisconnect) {
                    isPrintDisconnect = true;
                    Serial.println("[Main] Disconnect: " + WiFi.SSID());
                    OTA.stop();
                }
            }
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

    Socket.loopMain();
}
