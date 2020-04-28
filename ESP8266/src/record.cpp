#include "main.h"
#include "profile.h"
#include "record.h"

void RecordClass::begin() {
    EEPROM.begin(RECORD_SIZE);

    push(RECORD_ADDRESS_SN, PROFILE_SN_LENGTH);
    push(RECORD_ADDRESS_SC, PROFILE_SC_LENGTH);
}

void RecordClass::reset() {
    for (uint16_t i = 0; i < RECORD_SIZE; ++i)
        EEPROM.write(i, 0);

    EEPROM.commit();
}

void RecordClass::push(uint8_t address, uint16_t size) {
    if (address > RECORD_ROW)
        return;

    addressBegin[address] = addressCurrent;
    addressEnd[address]   = address + size;
    addressCurrent        = address + size;
}

void RecordClass::clear(uint8_t address) {
    if (address > RECORD_ROW)
        return;

    uint16_t begin = addressBegin[address];
    uint16_t end   = addressEnd[address] + begin;

    for (uint16_t i = begin; i < end; ++i)
        EEPROM.write(i, 0);

    EEPROM.commit();
}

void RecordClass::write(uint8_t address, String data) {
    if (address > RECORD_ROW)
        return;

    clear(address);

    uint16_t begin = addressBegin[address];
    uint16_t end   = addressEnd[address] + begin;

    for (uint16_t i = begin; i < end; ++i)
        EEPROM.write(i, data.charAt(i - begin));

    EEPROM.commit();
}

void RecordClass::write(uint8_t address, char * data) {
    write(address, String(data));
}

void RecordClass::write(uint8_t address, int data) {
    write(address, String(data));
}

String RecordClass::readString(uint8_t address) {
    if (address > RECORD_ROW)
        return "";

    uint16_t begin  = addressBegin[address];
    uint16_t end    = addressEnd[address] + begin;
    uint8_t decimal = 0;
    String result   = "";

    for (uint16_t i = begin; i < end; ++i) {
        decimal = EEPROM.read(i);

        if (decimal <= 0 || decimal >= 255)
            break;

        result += char(decimal);
    }

    return result;
}

int RecordClass::readInt(uint8_t address) {
    String str = readString(address);

    if (str.length() > 0)
        return str.toInt();

    return 0;
}

RecordClass Record;
