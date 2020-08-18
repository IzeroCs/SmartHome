#include "io/input.h"

void InputClass::begin() {
    pcf.begin();

    if (pcf.isConnected()) {
        Monitor.println("[Input] Begin hardware detected");

        for (int i = 0; i < 8; ++i) {
            pcf.pinMode(i, INPUT);
            pcf.digitalWrite(i, LOW);
        }

        printUndetected = false;
        printDetected   = true;
    } else {
        Monitor.println("[Input] Begin hardware not detected");
    }
}

void InputClass::loop() {
    if (pcf.isConnected()) {
        if (printDetected)
            Monitor.println("[Input] Loop hardware detected");

        byte digital = pcf.digitalReadAll();
        uint8_t bit = 0;

        for (uint8_t pin = 0; pin < 8; ++pin) {
            bit = bitRead(digital, pin);
            IODef.setIOPinStatusClient((IOPin_t)pin, bit == 1);
        }

        printDetected = false;
    } else if (!printUndetected) {
        printUndetected = true;
        Monitor.println("[Input] Loop hardware not detected");
    }
}

InputClass Input;
