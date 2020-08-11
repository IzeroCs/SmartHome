#ifndef FILE_H
#define FILE_H

#include <Arduino.h>
#include <LittleFS.h>

#include "stream/monitor.h"

using WriteHandle = std::function<void(File file)>;
using ReadHandle = std::function<void(File file)>;
using NotExistsHandle = std::function<void()>;

class FFSClass {
private:
    const String BASE = "/data/";
    bool isBegin = false;

public:
    void begin();
    char * readCharArray(String path);
    String readString(String path);

    File open(const String& path, const char* mode);
    bool write(String path, WriteHandle handle);
    bool read(String path, ReadHandle readHandle, NotExistsHandle notExistsHandle = nullptr);
    bool exists(String path);
    bool remove(String path);
    bool format();
};

extern FFSClass FFS;

#endif
