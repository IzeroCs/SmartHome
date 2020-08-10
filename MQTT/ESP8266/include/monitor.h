#ifndef MONITOR_H
#define MONITOR_H

#include <Arduino.h>
#include <Print.h>

class MonitorClass : public Print {
public:
    void begin();

    virtual size_t write(uint8_t c) {
        return Serial.write(c);
    }
};

extern MonitorClass Monitor;

#endif
