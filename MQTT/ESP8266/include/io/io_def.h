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
        String sClient = statusClient ? "true" : "false";

        return "[" + String(input)           + ","
                   + String(outputType)      + ","
                   + String(outputPrimary)   + ","
                   + String(outputSecondary) + ","
                   + String(dualToggleCount) + ","
                   + String(dualToggleTime)  + ","
                   + String(sClient)         + ","
                   + String(statusCloud)     +
                "]";
    }

};

typedef std::map<IOPin_t, IOData> IOMap_t;

class IODefClass {
private:
    IOMap_t ioMap;

    bool ioForceChanged;
    bool ioStatusChanged;

public:
    IOMap_t & getIOMap() {
        return ioMap;
    }

    bool isStatusChanged() {
        return ioStatusChanged;
    }

    void setStatusChanged(bool status) {
        ioStatusChanged = status;
    }

    bool isForceChanged() {
        return ioForceChanged;
    }

    void setForceChanged(bool status) {
        ioForceChanged = status;
    }

    IOType_t parseOutputType(uint8_t type);
    IOData parseIOData(String str);
    bool validate(String str);

    IOData initIOData(
        IOPin_t input,
        IOType_t outputType,
        IOPin_t outputPrimary,
        IOPin_t outputSecondary,
        uint8_t dualToggleCount,
        StatusCloud_t statusCloud,
        bool statusClient
    );

    void setIOPinStatusClient(IOPin_t pin, bool status);
};

extern IODefClass IODef;

#endif
