#ifndef OUTPUT_H
#define OUTPUT_H

#include <Arduino.h>

class OutputClass {
private:
    const int SDA_PIN  = D2;
    const int SCK_PIN  = D1;
    const int DATA_PIN = D0;

public:
    void begin();
    void loop();
};

extern OutputClass Output;

#endif
