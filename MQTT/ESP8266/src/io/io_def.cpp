#include "io/io_def.h"

IOType_t IODefClass::parseOutputType(uint8_t type) {
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

IOData IODefClass::initIOData(
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

IOData IODefClass::parseIOData(String str) {
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

void IODefClass::setIOPinStatusClient(IOPin_t pin, bool status) {
    IOData * curData = &(ioMap.at(pin));
    bool statusCloud = false;

    if (curData->statusCloud == StatusCloud_ON)
        statusCloud = true;
    else if (curData->statusCloud == StatusCloud_OFF)
        statusCloud = false;

    if (curData->outputType == IOType_DISABLE)
        return;

    if (curData->statusCloud != StatusCloud_IDLE) {
        if (curData->statusPrevClient && !status) {
            curData->statusCloud = StatusCloud_IDLE;
            curData->statusPrevClient = status;
        } else if (!curData->statusPrevClient && status) {
            curData->statusCloud = StatusCloud_IDLE;
            curData->statusPrevClient = status;
        } else if (curData->statusCloud == StatusCloud_ON && curData->statusClient) {
            return;
        } else if (curData->statusCloud == StatusCloud_OFF && !curData->statusClient) {
            return;
        } else {
            status = statusCloud;
        }
    } else if (curData->statusPrevClient != status) {
        curData->statusPrevClient = status;
    } else {
        return;
    }

    ioStatusChanged = true;

    if (curData->outputType != IOType_SINGLE) {
        if (curData->outputPrimary == curData->outputSecondary)
            return;

        IOData * secData = &(ioMap.at(curData->outputSecondary));

        if (curData->outputType == IOType_DOUBLE) {
            curData->statusClient    = status;
            secData->statusClient    = status;
            secData->dualToggleCount = 0;
        } else if (curData->outputType == IOType_DUAL_TOGGLE) {
            if (curData->dualToggleTime == 0 || millis() - curData->dualToggleTime > 300)
                curData->dualToggleCount = 0;

            if (curData->dualToggleCount == 0) {
                if (status) {
                    curData->statusClient = true;
                    secData->statusClient = false;
                } else {
                    curData->statusClient    = false;
                    secData->statusClient    = false;
                    curData->dualToggleCount = 1;
                    curData->dualToggleTime  = millis();
                }
            } else if (curData->dualToggleCount == 1) {
                if (status) {
                    curData->statusClient = true;
                    secData->statusClient = true;
                } else {
                    curData->statusClient    = false;
                    secData->statusClient    = false;
                    curData->dualToggleCount = 0;
                }
            }
        }

        return;
    }

    curData->statusClient = status;
}

bool IODefClass::validate(String str) {
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

IODefClass IODef;
