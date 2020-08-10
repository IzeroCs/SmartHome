#include "monitor.h"

void MonitorClass::begin() {
    Serial.begin(115200);
    Serial.println();
}

MonitorClass Monitor;
