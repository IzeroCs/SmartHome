#include "stream/ffs.h"

void FFSClass::begin() {
    if (!isBegin && !LittleFS.begin()) {
        Monitor.println("[FFS] Mount spiffs failed restart esp...");
        delay(3000);
        ESP.restart();
    } else {
        Monitor.println("[FFS] SPIFFS begin");
    }

    isBegin = true;
}

char * FFSClass::readCharArray(String path) {
    File file = open(BASE + path, "r");

    if (!file)
        return nullptr;

    char * buffer = (char *)malloc(file.size());
    uint8_t size = file.size();
    uint8_t i = 0;

    for (i = 0; i < size; ++i)
        buffer[i] = char(file.read());

    return buffer;
}

String FFSClass::readString(String path) {
    File file = open(BASE + path, "r");
    String buffer = "";
    int chr = 0;

    if (!file)
        return buffer;

    while ((chr = file.read()) != -1)
        buffer += char(chr);

    file.close();
    return buffer;
}

bool FFSClass::write(String path, WriteHandle handle) {
    File file = open(BASE + path, "w+");

    if (!file)
        return false;

    handle(file);
    file.close();

    return true;
}

bool FFSClass::read(String path, ReadHandle readHandle, NotExistsHandle notExistsHandle) {
    if (FFS.exists(path)) {
        File file = open(BASE + path, "r");

        if (!file)
            return false;

        readHandle(file);
        file.close();

        return true;
    } else if (notExistsHandle != nullptr) {
        notExistsHandle();
    }

    return false;
}

bool FFSClass::exists(String path) {
    if (!isBegin)
        begin();

    return LittleFS.exists(BASE + path);
}

bool FFSClass::remove(String path) {
    if (!isBegin)
        begin();

    return LittleFS.remove(path);
}

bool FFSClass::format() {
    if (!isBegin)
        begin();

    return LittleFS.format();
}

File FFSClass::open(const String& path, const char* mode) {
    if (!isBegin)
        begin();

    return LittleFS.open(path, mode);
}

FFSClass FFS;
