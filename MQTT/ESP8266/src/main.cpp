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
}

void loop() {
    Wireless.loop();
    Cloud.handle();
    yield();
}
