#include "ffs.h"

void FFSClass::begin() {
    if (!LittleFS.begin()) {
        Serial.println("Mount spiffs failed restart esp...");
        delay(3000);
        ESP.restart();
    }
}

char * FFSClass::readCharArray(String path) {
    File file = LittleFS.open("/data/" + path, "r");

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
    File file = LittleFS.open("/data/" + path, "r");
    String buffer = "";
    int chr = 0;

    if (!file)
        return buffer;

    while ((chr = file.read()) != -1)
        buffer += char(chr);

    file.close();
    return buffer;
}

FFSClass FFS;