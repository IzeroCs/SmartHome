#include "main.h"
#include "profile.h"
#include "record.h"

void RecordClass::begin() {
    EEPROM.begin(RECORD_SIZE);

    bind(RECORD_ID_SN, PROFILE_SN_LENGTH);
    bind(RECORD_ID_SC, PROFILE_SC_LENGTH);
}

void RecordClass::reset() {
    for (uint16_t i = 0; i < RECORD_SIZE; ++i)
        EEPROM.write(i, 0);

    EEPROM.commit();
}

void RecordClass::bind(uint8_t id, uint16_t size) {
    if (id > datas.size())
        return;

    RecordData data;

    data.id        = id;
    data.size      = size;
    data.address   = addressCurrent;
    addressCurrent = addressCurrent + size;

    datas.push_back(data);
}

void RecordClass::clear(uint8_t id) {
    if (id > datas.size())
        return;

    clear(findId(id));
}

void RecordClass::clear(RecordData data) {
    if (data.address == 0 && data.size == 0)
        return;

    uint16_t begin = data.address;
    uint16_t end   = begin + data.size;

    for (uint16_t i = begin; i < end; ++i)
        EEPROM.write(i, 0);

    EEPROM.commit();
}

void RecordClass::write(uint8_t id, String str) {
    if (id > datas.size())
        return;

    RecordData data = findId(id);

    if (data.address == 0 && data.size == 0)
        return;

    clear(data);

    uint16_t begin = data.address;
    uint16_t end   = begin + data.size;

    for (uint16_t i = begin; i < end; ++i)
        EEPROM.write(i, str.charAt(i - begin));

    EEPROM.commit();
}

void RecordClass::write(uint8_t id, char * data) {
    write(id, String(data));
}

void RecordClass::write(uint8_t id, int data) {
    write(id, String(data));
}

String RecordClass::readString(uint8_t id) {
    if (id > datas.size())
        return "";

    RecordData data = findId(id);

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

int RecordClass::readInt(uint8_t id) {
    String str = readString(id);

    if (str.length() > 0)
        return str.toInt();

    return 0;
}

RecordClass Record;
