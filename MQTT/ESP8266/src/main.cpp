#include "main.h"

Ticker ioTicker;
Ticker ledTicker;

void setup() {
    Monitor.begin();
    Monitor.println("[Main] Client running");
    Seri.begin();
    Config.begin();
    IO.begin();
    Wireless.begin();

    ioTicker.attach_ms(10, [] { IO.handle(); });
    ledTicker.attach_ms(1000, [] {
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
