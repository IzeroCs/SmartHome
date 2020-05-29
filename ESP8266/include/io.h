#ifndef IO_H
#define IO_H

using namespace std;

#include <Arduino.h>
#include <vector>

#include "output.h"
#include "input.h"

struct IOData {
    uint8_t inputMask;
    uint8_t outputMask;
    bool status;
};

class IOClass {
private:
    const uint8_t IO_PIN_0 = 1;
    const uint8_t IO_PIN_1 = 2;
    const uint8_t IO_PIN_2 = 4;
    const uint8_t IO_PIN_3 = 8;
    const uint8_t IO_PIN_4 = 16;
    const uint8_t IO_PIN_5 = 32;
    const uint8_t IO_PIN_6 = 64;
    const uint8_t IO_PIN_7 = 128;

    const String split = "|";
    vector<IOData> datas;

    IOData parseData(String record) {
        IOData data;

        Serial.println("Record: " + record);

        if (!record.isEmpty() && record.indexOf(split) != -1) {
            String sub;

            int indexOf        = 0;
            int prevIndexOf    = 0;
            int caseIndex      = 0;
            int startSubstring = 0;
            int endSubstring   = 0;

            do {
                indexOf = record.indexOf(split);
                caseIndex++;

                if (indexOf == -1) {
                    if (prevIndexOf == 0)
                        break;

                    startSubstring = prevIndexOf;
                    endSubstring   = record.length();
                } else {
                    startSubstring = prevIndexOf;
                    endSubstring   = indexOf;
                    prevIndexOf    = indexOf + 1;
                }

                sub = record.substring(startSubstring, endSubstring);

                if (caseIndex == 0)
                    data.inputMask = sub.toInt();
                else if (caseIndex == 1)
                    data.outputMask = sub.toInt();
                else if (caseIndex == 2)
                    data.status = sub.toInt() == 1;
                else
                    break;
            } while (true);
        }

        return data;
    }

    IOData initData(uint8_t inputMask, uint8_t outputMask, bool status) {
        IOData data;

        data.inputMask  = inputMask;
        data.outputMask = outputMask;
        data.status     = status;

        return data;
    }

    void storeData(uint8_t id, IOData data) {
        String buffer  = String(data.inputMask)  + split;
               buffer += String(data.outputMask) + split;
               buffer += String(data.status);

        Record.write(id, buffer);
    }

public:
    void begin();
    void loop();
};

extern IOClass IO;

#endif
