#ifndef INPUT_H
#define INPUT_H

#include <Arduino.h>
#include <PCF8574.h>

class InputClass {
private:
    byte ADDRESS = 0x38;
    PCF8574 pcf;

public:
    InputClass() : pcf(ADDRESS) {}

    void begin();
    void loop();
};

extern InputClass Input;

#endif
