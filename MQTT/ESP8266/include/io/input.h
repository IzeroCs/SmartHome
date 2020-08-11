#ifndef INPUT_H
#define INPUT_H

#include <Arduino.h>
#include <PCF8574.h>

#include "stream/monitor.h"

class InputClass {
private:
    PCF8574 pcf;
    bool printUndetected = true;

public:
    InputClass() : pcf(0x38) {}

    void begin();
    void loop();
};

extern InputClass Input;

#endif