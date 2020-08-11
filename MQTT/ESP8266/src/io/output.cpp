#include "io/output.h"

void OutputClass::begin() {
    pinMode(STR_PIN,  OUTPUT);
    pinMode(SCK_PIN,  OUTPUT);
    pinMode(DATA_PIN, OUTPUT);
}

void OutputClass::loop() {
    byte data = B00000000;

    // for (uint8_t pin = 0; pin < 8; ++pin) {}

    digitalWrite(STR_PIN, LOW);
    shiftOut(DATA_PIN, SCK_PIN, LSBFIRST, data);
    digitalWrite(STR_PIN, HIGH);
}

OutputClass Output;
