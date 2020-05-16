#ifndef URL_H
#define URL_H

#include <Arduino.h>

class URLClass {
private:

public:
    static String encode(String uri);
    static String decode(String data);
    static unsigned char h2int(char c);
};

extern URLClass URL;

#endif
