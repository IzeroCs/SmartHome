#include "output.h"

void OutputClass::begin() {
    pinMode(SDA_PIN,  OUTPUT);
    pinMode(SCK_PIN,  OUTPUT);
    pinMode(DATA_PIN, OUTPUT);
}

bool s1 = false;
bool s2 = true;

void OutputClass::loop() {
    byte data = B00000000;

    if (s1 && !s2) {
        data = B00000001;
        s1 = false;
        s2 = true;
    } else if (!s1 && s2) {
        data = B00000010;
        s1 = true;
        s2 = false;
    }

    digitalWrite(SDA_PIN, LOW);
    shiftOut(DATA_PIN, SCK_PIN, MSBFIRST, data);
    digitalWrite(SDA_PIN, HIGH);
}

OutputClass Output;
