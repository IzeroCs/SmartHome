#ifndef IO_H
#define IO_H

using namespace std;

#include <Arduino.h>
#include <vector>

#include "output.h"
#include "input.h"

typedef enum {
    Input_ALL,
    Input_SINGLE,
    Input_DOUBLE,
    Input_ALTERNATE
} Input_t;

struct IOData {
    uint8_t input;
    Input_t inputType;

    uint8_t outputPrimary;
    uint8_t outputSecondary;

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
    const String  SPLIT    = "|";

    vector<IOData> datas;

    Input_t parseInputType(uint8_t type) {
        switch (type) {
            case (uint8_t)Input_ALL:
                return Input_ALL;

            case (uint8_t)Input_DOUBLE:
                return Input_DOUBLE;

            case (uint8_t)Input_ALTERNATE:
                return Input_ALTERNATE;
        }

        return Input_SINGLE;
    }

    IOData parseData(String record) {
        IOData data;

        Serial.println("Record: " + record);

        if (!record.isEmpty() && record.indexOf(SPLIT) != -1) {
            bool run           = true;
            int indexOf        = 0;
            int prevIndexOf    = 0;
            int caseIndex      = 0;
            int startSubstring = 0;
            int endSubstring   = 0;

            do {
                indexOf = record.indexOf(SPLIT);
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

                uint8_t res = record.substring(startSubstring, endSubstring).toInt();

                switch (caseIndex) {
                    case 0:
                        data.input = res;
                        break;

                    case 1:
                        data.inputType = parseInputType(res);
                        break;

                    case 2:
                        data.outputPrimary = res;
                        break;

                    case 3:
                        data.outputSecondary = res;
                        break;

                    case 4:
                        data.status = res == 1;
                        break;

                    default:
                        run = false;
                        break;
                }
            } while (run);
        }

        return data;
    }

    IOData initData(uint8_t input, Input_t inputType, uint8_t outputPrimary, uint8_t outputSecondary, bool status) {
        IOData data;

        data.input           = input;
        data.inputType       = inputType;
        data.outputPrimary   = outputPrimary;
        data.outputSecondary = outputSecondary;
        data.status          = status;

        return data;
    }

    void storeData(uint8_t id, IOData data) {
        String buffer  = String(data.input)  + SPLIT;
               buffer += String(data.inputType) + SPLIT;
               buffer += String(data.outputPrimary) + SPLIT;
               buffer += String(data.outputSecondary) + SPLIT;
               buffer += String(data.status);

        Record.write(id, buffer);
    }

public:
    void begin();
    void loop();
};

extern IOClass IO;

#endif
