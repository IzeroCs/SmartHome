#ifndef RECORD_H
#define RECORD_H

#include <Arduino.h>
#include <EEPROM.h>
#include <vector>

#include "stream/monitor.h"

#define RECORD_SIZE 512
#define RECORD_ROW  10

struct EROMData {
    uint8_t id       = 0;
    uint16_t size    = 0;
    uint16_t address = 0;
};

class EROMClass {
private:
    const bool DEBUG = true;

    uint16_t addrCurrent = 0;
    std::vector<EROMData> eromData;

    EROMData findId(uint8_t id);

public:
    void reset();
    void begin(bool reset = false);
    void bind(uint8_t id, uint16 size);
    void write(uint8_t id, String data);
    void write(uint8_t id, char * data);
    void write(uint8_t id, int data);
    String readString(uint8_t id);
    int readInt(uint8_t id);
    bool commit();

protected:
    void clear(uint8_t id);
    void clear(EROMData data);
};

extern EROMClass EROM;

#endif
