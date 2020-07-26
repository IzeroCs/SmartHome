#ifndef FILE_H
#define FILE_H

#include <Arduino.h>
#include <LittleFS.h>

using WriteHandle = std::function<void(File file)>;

class FFSClass {
private:
    const String BASE = "/data/";

public:
    void begin();
    char * readCharArray(String path);
    String readString(String path);
    bool write(String path, WriteHandle handle);
    bool exists(String path);
};

extern FFSClass FFS;

#endif
