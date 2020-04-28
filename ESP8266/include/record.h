#ifndef RECORD_H
#define RECORD_H

#include <Arduino.h>
#include <EEPROM.h>

#define RECORD_SIZE 512
#define RECORD_ROW  10

class RecordClass {
private:
    uint16_t addressCurrent = 0;
    uint16_t addressBegin[RECORD_ROW];
    uint16_t addressEnd[RECORD_ROW];

public:
    void begin();
    void reset();
    void push(uint8_t address, uint16 size);
    void write(uint8_t address, String data);
    void write(uint8_t address, char * data);
    void write(uint8_t address, int data);
    String readString(uint8_t address);
    int readInt(uint8_t address);

protected:
    void clear(uint8_t address);
};

extern RecordClass Record;

#endif
