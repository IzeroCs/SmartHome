#ifndef FILE_H
#define FILE_H

#include <Arduino.h>
#include <LittleFS.h>

class FFSClass {
private:

public:
    void begin();
    char * readCharArray(String path);
    String readString(String path);
};

extern FFSClass FFS;

#endif
