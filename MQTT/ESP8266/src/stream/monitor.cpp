#include "stream/monitor.h"

void MonitorClass::begin() {
    pinMode(LED_BUILTIN, OUTPUT);

    Serial.begin(115200);
    Serial.println();
}

bool MonitorClass::ledStatus() {
    return digitalRead(LED_BUILTIN) == LOW;
}

void MonitorClass::led(bool enable) {
    if (enable)
        digitalWrite(LED_BUILTIN, LOW);
    else
        digitalWrite(LED_BUILTIN, HIGH);
}

MonitorClass Monitor;
