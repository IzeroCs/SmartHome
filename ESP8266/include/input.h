#ifndef INPUT_H
#define INPUT_H

#include <Arduino.h>
#include <PCF8574.h>

class InputClass {
private:
    const byte ADDRESS = 0x38;

    const int INT_PIN = D7;
    const int SCL_PIN = D6;
    const int SDA_PIN = D5;

    PCF8574 pcf;

public:
    InputClass() : pcf(ADDRESS, SDA_PIN, SCL_PIN) {}

    void begin();
    void loop();
};

extern InputClass Input;

#endif
