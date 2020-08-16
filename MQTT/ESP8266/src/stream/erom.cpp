#include "system/erom.h"

void EROMClass::begin(bool erase) {
    EEPROM.begin(RECORD_SIZE);

    if (DEBUG)
        Monitor.println("[EROM] Begin");

    if (erase)
        reset();
}

void EROMClass::reset() {
    for (uint16_t i = 0; i < RECORD_SIZE; ++i)
        EEPROM.write(i, 0);

    EEPROM.commit();
}

void EROMClass::bind(uint8_t id, uint16_t size) {
    if (id > eromData.size())
        return;

    EROMData data;

    data.id      = id;
    data.size    = size;
    data.address = addrCurrent;
    addrCurrent  = addrCurrent + size;

    eromData.push_back(data);
}

void EROMClass::clear(uint8_t id) {
    if (id > eromData.size())
        return;

    clear(findId(id));
}

void EROMClass::clear(EROMData data) {
    if (data.address == 0 && data.size == 0)
        return;

    uint16_t begin = data.address;
    uint16_t end   = begin + data.size;

    for (uint16_t i = begin; i < end; ++i)
        EEPROM.write(i, 0);

    EEPROM.commit();
}

EROMData EROMClass::findId(uint8_t id) {
    EROMData data;

    if (id > eromData.size())
        return data;

    int i    = 0;
    int size = eromData.size();

    for (i = 0; i < size; ++i) {
        data = eromData.at(i);

        if (data.id == id)
            break;
    }

    return data;
}

void EROMClass::write(uint8_t id, String str) {
    if (id > eromData.size())
        return;

    EROMData data = findId(id);

    if (data.address == 0 && data.size == 0)
        return;

    clear(data);

    uint16_t begin = data.address;
    uint16_t end   = begin + data.size;

    for (uint16_t i = begin; i < end; ++i)
        EEPROM.write(i, str.charAt(i - begin));
}

void EROMClass::write(uint8_t id, char * data) {
    write(id, String(data));
}

void EROMClass::write(uint8_t id, int data) {
    write(id, String(data));
}

String EROMClass::readString(uint8_t id) {
    if (id > eromData.size())
        return "";

    EROMData data = findId(id);

    if (data.address == 0 && data.size == 0)
        return "";

    uint16_t begin  = data.address;
    uint16_t end    = begin + data.size;
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

int EROMClass::readInt(uint8_t id) {
    String str = readString(id);

    if (str.length() > 0)
        return str.toInt();

    return 0;
}

bool EROMClass::commit() {
    return EEPROM.commit();
}

EROMClass EROM;
