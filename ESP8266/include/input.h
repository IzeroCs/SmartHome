#ifndef INPUT_H
#define INPUT_H

#include <Arduino.h>
#include <SlowSoftWire.h>

class InputClass {
private:
    const int INT_PIN = 13;
    const int SCL_PIN = 12;
    const int SDA_PIN = 14;

    SlowSoftWire wire;

public:
    InputClass() : wire(SDA_PIN, SCL_PIN, false) {}

    void begin();
    void loop();
};

extern InputClass Input;

#endif
