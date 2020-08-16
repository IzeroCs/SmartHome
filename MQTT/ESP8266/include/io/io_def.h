#ifndef IO_DEF_H
#define IO_DEF_H

#include <map>
#include <vector>

#include "stream/monitor.h"
#define IO_MAP_CHAR_SPLIT ","

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

    uint dualToggleCount;
    ulong dualToggleTime;

    bool statusClient;
    bool statusPrevClient;
    StatusCloud_t statusCloud;

    String toEROM() {
        return String(input)           + IO_MAP_CHAR_SPLIT +
               String(outputType)      + IO_MAP_CHAR_SPLIT +
               String(outputPrimary)   + IO_MAP_CHAR_SPLIT +
               String(outputSecondary) + IO_MAP_CHAR_SPLIT +
               String(dualToggleCount) + IO_MAP_CHAR_SPLIT +
               String(statusClient)    + IO_MAP_CHAR_SPLIT +
               String(statusCloud);
    }

    String toJSON() {
        return "{\"input\":"          + String(input)           + "," +
               "\"outputType\":"      + String(outputType)      + "," +
               "\"outputPrimary\":"   + String(outputPrimary)   + ",";
               "\"outputSecondary\":" + String(outputSecondary) + "," +
               "\"dualToggleCount\":" + String(dualToggleCount) + "," +
               "\"dualToggleTime\":"  + String(dualToggleTime)  + "," +
               "\"statusCloud\":"     + String(statusCloud)     + "," +
               "\"statusClient\":"    + (statusClient ? "true" : "false") + "}";
    }
};

typedef std::map<IOPin_t, IOData> IOMap_t;

class IODefClass {
public:
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

    IOData initIOData(
        IOPin_t input,
        IOType_t outputType,
        IOPin_t outputPrimary,
        IOPin_t outputSecondary,
        uint8_t dualToggleCount,
        StatusCloud_t statusCloud,
        bool statusClient
    ) {
        IOData data;

        data.input            = input;
        data.outputType       = outputType;
        data.outputPrimary    = outputPrimary;
        data.outputSecondary  = outputSecondary;
        data.dualToggleCount  = dualToggleCount;
        data.dualToggleTime   = 0;
        data.statusPrevClient = 0;
        data.statusClient     = statusClient;
        data.statusCloud      = statusCloud;

        Monitor.println("[IODef] Init IOData: " +
            String(input)           + IO_MAP_CHAR_SPLIT +
            String(outputType)      + IO_MAP_CHAR_SPLIT +
            String(outputPrimary)   + IO_MAP_CHAR_SPLIT +
            String(outputSecondary) + IO_MAP_CHAR_SPLIT +
            String(dualToggleCount) + IO_MAP_CHAR_SPLIT +
            String(statusClient)    + IO_MAP_CHAR_SPLIT +
            String(statusCloud));

        return data;
    }

    IOData parseIOData(String str) {
        Monitor.println("[IODef] Parse IOData: " + str);

        bool run      = true;
        int indexOf   = 0;
        int caseIndex = 0;
        int length    = str.length();

        IOData data;
        uint8_t res;

        if (length != 13)
            return data;

        do {
            indexOf = str.indexOf(IO_MAP_CHAR_SPLIT, indexOf + 1);

            if (indexOf == -1)
                res = str.substring(length - 1).toInt();
            else
                res = str.substring(indexOf - 1, indexOf).toInt();

            switch (caseIndex++) {
                case 0: data.input = (IOPin_t)res; break;
                case 1: data.outputType = parseOutputType(res); break;
                case 2: data.outputPrimary = (IOPin_t)res; break;
                case 3: data.outputSecondary = (IOPin_t)res; break;
                case 4: data.dualToggleCount = res; break;
                case 5: data.statusClient = res; break;
                case 6: data.statusCloud = (StatusCloud_t)res; break;
                default: run = false; break;
            }
        } while (run);

        data.dualToggleTime = 0;
        data.statusPrevClient = false;

        return data;
    }

    bool validate(String str) {
        if (str.length() != 13)
            return false;

        uint8_t sIndex = 0;

        for (uint8_t i = 0; i < 6; ++i) {
            sIndex = str.indexOf(IO_MAP_CHAR_SPLIT, sIndex + 1);

            if (sIndex == -1)
                return false;
        }

        return true;
    }
};

extern IODefClass IODef;

#endif
