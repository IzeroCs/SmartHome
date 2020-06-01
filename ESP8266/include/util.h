#ifndef UTIL_H
#define UTIL_H

#include <Arduino.h>

class UtilClass {
private:

public:
    static String generatorText(uint16_t length);
    static String macToString(const unsigned char* mac);
    static String httpCodeToString(uint16_t code);
    static char * toCharArray(String str);
};

extern UtilClass Util;

#endif
