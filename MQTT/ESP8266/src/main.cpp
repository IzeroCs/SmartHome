#include "main.h"

Ticker ticker;

void setup() {
    Monitor.begin();
    Monitor.println("[Main] Client running");
    Seri.begin();
    Config.begin();
    IO.begin();
    Wireless.begin();

    ticker.attach_ms(500, [] { IO.handle(); });
    ticker.attach_ms(1000, [] {
        if (WiFi.status() == WL_CONNECTED)
            Monitor.led(!Monitor.ledStatus());
        else
            Monitor.led(true);
    });
}

void loop() {
    Wireless.loop();
    Cloud.handle();
    yield();
}
