#ifndef OUTPUT_H
#define OUTPUT_H

#include <Arduino.h>

class OutputClass {
private:
    const int SCK_PIN  = D5;
    const int STR_PIN  = D6;
    const int DATA_PIN = D7;

public:
    void begin();
    void loop();
};

extern OutputClass Output;

#endif
