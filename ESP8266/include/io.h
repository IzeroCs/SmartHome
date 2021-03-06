#ifndef IO_H
#define IO_H

using namespace std;

#include <Arduino.h>
#include <map>
#include <vector>

#include "main.h"
#include "record.h"
#include "output.h"
#include "input.h"
#include "record.h"
#include "io.h"

typedef enum {
    IOType_DOUBLE,
    IOType_SINGLE,
    IOType_DUAL_TOGGLE,
    IOType_DISABLE,
    IOType_NULL
} IOType_t;

typedef enum {
    IOPin_0    = 0,
    IOPin_1    = 1,
    IOPin_2    = 2,
    IOPin_3    = 3,
    IOPin_4    = 4,
    IOPin_5    = 5,
    IOPin_6    = 6,
    IOPin_7    = 7,
    IOPin_NULL = 8
} IOPin_t;

typedef enum {
    StatusCloud_IDLE = 1,
    StatusCloud_ON   = 2,
    StatusCloud_OFF  = 3
} StatusCloud_t;

struct IOData {
    IOPin_t input;
    IOType_t outputType;
    IOPin_t outputPrimary;
    IOPin_t outputSecondary;
    uint8_t dualToggleCount;
    StatusCloud_t statusCloud;

    bool status;
    bool statusPrev;

    String toString() {
        return "input=" + String(input) + "," +
               "outputType=" + String(outputType) +  "," +
               "outputPrimary=" + String(outputPrimary) + "," +
               "outputSecondary=" + String(outputSecondary) + "," +
               "dualToggleCount=" + String(dualToggleCount) + "," +
               "statusCloud=" + String(statusCloud) + "," +
               "status=" + String(status);
    }

    String toJsonString() {
        return "{\"input\":" + String(input) + "," +
            "\"outputType\":" + String(outputType) + "," +
            "\"outputPrimary\":" + String(outputPrimary) + "," +
            "\"outputSecondary\":" + String(outputSecondary) + "," +
            "\"dualToggleCount\":" + String(dualToggleCount) + "," +
            "\"statusCloud\":" + String(statusCloud) + "," +
            "\"status\":" + (status ? "true" : "false") + "}";
    }
};

typedef std::map<IOPin_t, IOData> Map_t;

class IOClass {
private:
    const bool DEBUG = true;
    const String  SPLIT = "|";

    bool ioStatusChanged;
    Map_t datas;

    IOType_t parseOutputType(uint8_t type) {
        switch (type) {
            case (uint8_t)IOType_DOUBLE:
                return IOType_DOUBLE;

            case (uint8_t)IOType_DUAL_TOGGLE:
                return IOType_DUAL_TOGGLE;

            case (uint8_t)IOType_DISABLE:
                return IOType_DISABLE;
        }

        return IOType_SINGLE;
    }

    IOData parseData(String record) {
        IOData data;

        if (DEBUG)
            Serial.println("[IO] Record: " + record);

        if (!record.isEmpty() && record.indexOf(SPLIT) != -1) {
            bool run           = true;
            int indexOf        = 0;
            int prevIndexOf    = 0;
            int caseIndex      = 0;
            int startSubstring = 0;
            int endSubstring   = 0;

            do {
                indexOf = record.indexOf(SPLIT, prevIndexOf);

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

                switch (caseIndex++) {
                    case 0:
                        data.input = (IOPin_t)res;
                        break;

                    case 1:
                        data.outputType = parseOutputType(res);
                        break;

                    case 2:
                        data.outputPrimary = (IOPin_t)res;
                        break;

                    case 3:
                        data.outputSecondary = (IOPin_t)res;
                        break;

                    case 4:
                        data.dualToggleCount = res;
                        break;

                    case 5:
                        data.statusCloud = (StatusCloud_t)res;
                        break;

                    case 6:
                        data.status = res == 1;
                        run = false;
                        break;

                    default:
                        run = false;
                        break;
                }
            } while (run);
        }

        return data;
    }

    IOData initData(
        uint8_t input,
        IOType_t outputType,
        uint8_t outputPrimary,
        uint8_t outputSecondary,
        uint8_t dualToggleCount,
        uint8_t statusCloud,
        bool status
    ) {
        return initData((IOPin_t)input, outputType,
            (IOPin_t)outputPrimary,
            (IOPin_t)outputSecondary, dualToggleCount,
            (StatusCloud_t)statusCloud, status);
    }

    IOData initData(
        IOPin_t input,
        IOType_t outputType,
        IOPin_t outputPrimary,
        IOPin_t outputSecondary,
        uint8_t dualToggleCount,
        StatusCloud_t statusCloud,
        bool status
    ) {
        IOData data;

        data.input           = input;
        data.outputType      = outputType;
        data.outputPrimary   = outputPrimary;
        data.outputSecondary = outputSecondary;
        data.dualToggleCount = dualToggleCount;
        data.statusCloud     = statusCloud;
        data.status          = status;

        return data;
    }

    void flushData(IOPin_t pin) {
        storeData(RECORD_ID_IO_BEGIN + (uint8_t)pin, datas.at(pin));
    }

    void storeData(uint8_t id, IOData data) {
        String buffer  = String(data.input)  + SPLIT;
               buffer += String(data.outputType) + SPLIT;
               buffer += String(data.outputPrimary) + SPLIT;
               buffer += String(data.outputSecondary) + SPLIT;
               buffer += String(data.dualToggleCount) + SPLIT;
               buffer += String(data.statusCloud) + SPLIT;
               buffer += String(data.status);

        Record.write(id, buffer);
    }

public:
    void begin();
    void loop();

    void setIOData(IOPin_t pin, IOType_t outputType = IOType_NULL,
        IOPin_t outputSecondary = IOPin_NULL);

    void setIOPinStatus(IOPin_t pin, bool status);
    void setIOPinStatusCloud(IOPin_t pin, StatusCloud_t status);
    bool getIOPinStatus(IOPin_t pin);

    IOData getIOData(IOPin_t pin);
    StatusCloud_t getIOPinStatusCloud(IOPin_t pin);

    bool isIoStatusChanged() {
        return ioStatusChanged;
    }

    void setIoStatusChanged(bool changed) {
        ioStatusChanged = changed;
    }

    Map_t getIODatas() {
        return datas;
    }
};

extern IOClass IO;

#endif
