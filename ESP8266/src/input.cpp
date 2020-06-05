#include "io.h"
#include "input.h"

void InputClass::begin() {
    pcf.begin();

    for (int i = 0; i < 8; ++i) {
        pcf.pinMode(i, INPUT);
        pcf.digitalWrite(i, LOW);
    }
}

void InputClass::loop() {
    byte digital = pcf.digitalReadAll();
    uint8_t bit  = 0;

    for (uint8_t pin = 0; pin < 8; ++pin) {
        bit = bitRead(digital, pin);
        IO.setIOPinStatus((IOPin_t)pin, bit == 1);
    }
}

InputClass Input;
