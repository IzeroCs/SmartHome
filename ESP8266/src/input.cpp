#include "input.h"

void InputClass::begin() {
    pcf.begin();

    for (int i = 0; i < 8; ++i) {
        pcf.pinMode(i, INPUT);
        pcf.digitalWrite(i, LOW);
    }
}

void InputClass::loop() {
    // byte digital = pcf.digitalReadAll();

    // Serial.print("Read pcf: ");
    // Serial.println(digital, BIN);
}

InputClass Input;
