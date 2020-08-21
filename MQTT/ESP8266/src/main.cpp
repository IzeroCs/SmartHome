#include "main.h"

Ticker ioTicker;
Ticker ledTicker;

void setup() {
    ESP.wdtEnable(WDTO_8S);

    Monitor.begin();
    Monitor.println("[Main] Client running");
    Monitor.println("[Main] Watchdog enable 8 second");

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
    try {
        Wireless.loop();
        Cloud.handle();
        ESP.wdtFeed();
    } catch (...) {
        Monitor.println("Exception");
    }

    yield();
}
