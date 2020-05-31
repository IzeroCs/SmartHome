#ifndef RECORD_H
#define RECORD_H

using namespace std;

#include <Arduino.h>
#include <EEPROM.h>
#include <vector>

#define RECORD_SIZE 512
#define RECORD_ROW  10

struct RecordData {
    uint8_t id       = 0;
    uint16_t size    = 0;
    uint16_t address = 0;
};

class RecordClass {
private:
    uint16_t addressCurrent = 0;
    vector<RecordData> datas;

    RecordData findId(uint8_t id) {
        RecordData data;

        if (id > datas.size())
            return data;

        int i    = 0;
        int size = datas.size();

        for (i = 0; i < size; ++i) {
            data = datas.at(i);

            if (data.id == id)
                break;
        }

        return data;
    }

public:
    void reset();
    void begin(bool reset = false);
    void bind(uint8_t id, uint16 size);
    void write(uint8_t id, String data);
    void write(uint8_t id, char * data);
    void write(uint8_t id, int data);
    String readString(uint8_t id);
    int readInt(uint8_t id);

protected:
    void clear(uint8_t id);
    void clear(RecordData data);
};

extern RecordClass Record;

#endif
