#include "main.h"

void setup() {
    Monitor.begin();
    Monitor.println("[Main] Client running");
    Config.begin();
    Wireless.begin();
}

void loop() {
    Wireless.loop();
}
