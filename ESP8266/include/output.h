#ifndef OUTPUT_H
#define OUTPUT_H

#include <Arduino.h>

class OutputClass {
private:
    const int SDA_PIN  = 4;
    const int SCK_PIN  = 5;
    const int DATA_PIN = 16;

public:
    void begin();
    void loop();
};

extern OutputClass Output;

#endif
