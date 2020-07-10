#include "main.h"
#include "record.h"
#include "io.h"

void IOClass::begin() {
    if (DEBUG)
        Serial.println("[IO] Begin");

    IOData data;
    String record;
    int pin = IOPin_0;

    for (int i = RECORD_ID_IO_BEGIN; i < RECORD_ID_IO_END; ++i) {
        Record.bind(i, 15);
        record = Record.readString(i);

        if (!record.isEmpty() && record.indexOf(SPLIT) != -1) {
            data = parseData(record);
        } else {
            data = initData(pin, IOType_SINGLE, pin, pin, 0, StatusCloud_IDLE, false);
            storeData(i, data);
        }

        datas.insert({ (IOPin_t)pin, data });
        pin++;
    }

    setIOData(IOPin_0, IOType_DOUBLE, IOPin_1);
    setIOData(IOPin_2, IOType_SINGLE);
    setIOData(IOPin_3, IOType_SINGLE);
    setIOData(IOPin_4, IOType_DUAL_TOGGLE, IOPin_5);
    setIOData(IOPin_6, IOType_SINGLE);
    setIOData(IOPin_7, IOType_SINGLE);
    setIoStatusChanged(true);

    Output.begin();
    Input.begin();
}

void IOClass::loop() {
    Output.loop();
    Input.loop();
}

void IOClass::setIOData(IOPin_t pin, IOType_t outputType, IOPin_t outputSecondary) {
    IOData * curData = &(datas.at(pin));

    if (outputType == curData->outputType && outputSecondary == curData->outputSecondary)
        return;

    if (curData->outputType == IOType_DISABLE)
        return;

    if (outputType == IOType_SINGLE && curData->outputType == IOType_SINGLE) {
        if (curData->outputSecondary != curData->outputPrimary) {
            IOData * secData = &(datas.at(curData->outputSecondary));

            secData->outputSecondary = secData->outputPrimary;
            secData->outputType      = IOType_SINGLE;
            secData->dualToggleCount = 0;
            secData->statusCloudPrev = StatusCloud_IDLE;
            secData->statusCloud     = StatusCloud_IDLE;
            secData->statusPrev      = false;
            secData->status          = false;

            storeData(RECORD_ID_IO_BEGIN + (uint8_t)secData->input, datas.at(secData->input));
        }

        curData->outputSecondary = curData->outputPrimary;
    } else if (outputType == IOType_SINGLE && (curData->outputType == IOType_DOUBLE || curData->outputType == IOType_DUAL_TOGGLE)) {
        if (curData->outputSecondary != curData->outputPrimary) {
            IOData * secData = &(datas.at(curData->outputSecondary));

            secData->outputSecondary = secData->outputPrimary;
            secData->outputType      = IOType_SINGLE;
            secData->dualToggleCount = 0;
            secData->statusCloudPrev = StatusCloud_IDLE;
            secData->statusCloud     = StatusCloud_IDLE;
            secData->statusPrev      = false;
            secData->status          = false;

            storeData(RECORD_ID_IO_BEGIN + (uint8_t)secData->input, datas.at(secData->input));
        }

        curData->outputSecondary = curData->outputPrimary;
    } else if (outputType == IOType_DOUBLE || outputType == IOType_DUAL_TOGGLE) {
        if (outputSecondary != curData->outputSecondary) {
            IOData * secData = &(datas.at(outputSecondary));

            secData->outputSecondary = secData->outputPrimary;
            secData->outputType      = IOType_DISABLE;
            secData->dualToggleCount = 0;
            secData->statusCloudPrev = StatusCloud_IDLE;
            secData->statusCloud = StatusCloud_IDLE;
            secData->statusPrev      = false;
            secData->status          = false;

            storeData(RECORD_ID_IO_BEGIN + (uint8_t)secData->input, datas.at(secData->input));

            if (curData->outputSecondary != curData->outputPrimary) {
                secData = &(datas.at(curData->outputSecondary));

                secData->outputSecondary = secData->outputPrimary;
                secData->outputType      = IOType_SINGLE;
                secData->dualToggleCount = 0;
                secData->statusCloudPrev = StatusCloud_IDLE;
                secData->statusCloud     = StatusCloud_IDLE;
                secData->statusPrev      = false;
                secData->status          = false;

                storeData(RECORD_ID_IO_BEGIN + (uint8_t)secData->input, datas.at(secData->input));
            }

            curData->outputSecondary = outputSecondary;
        }
    }

    curData->outputType      = outputType;
    curData->dualToggleCount = 0;

    storeData(RECORD_ID_IO_BEGIN + (uint8_t)curData->input, datas.at(pin));
}

IOData IOClass::getIOData(IOPin_t pin) {
    return datas.at(pin);
}

void IOClass::setIOPinStatus(IOPin_t pin, bool status) {
    IOData * curData = &(datas.at(pin));
    bool statusCloud = false;

    if (curData->statusCloud == StatusCloud_ON)
        statusCloud = true;
    else if (curData->statusCloud == StatusCloud_OFF)
        statusCloud = false;

    if (curData->outputType == IOType_DISABLE)
        return;

    if (curData->statusCloud != StatusCloud_IDLE) {
        if (curData->statusPrev && !status) {
            curData->statusCloud = StatusCloud_IDLE;
            curData->statusPrev = status;
        } else if (!curData->statusPrev && status) {
            curData->statusCloud = StatusCloud_IDLE;
            curData->statusPrev = status;
        } else if (curData->statusCloud == StatusCloud_ON && curData->status) {
            return;
        } else if (curData->statusCloud == StatusCloud_OFF && !curData->status) {
            return;
        } else {
            status = statusCloud;
        }
    } else if (curData->statusPrev != status) {
        curData->statusPrev = status;
    } else {
        return;
    }

    ioStatusChanged = true;

    if (curData->outputType != IOType_SINGLE) {
        if (curData->outputPrimary == curData->outputSecondary)
            return;

        IOData * secData = &(datas.at(curData->outputSecondary));

        if (curData->outputType == IOType_DOUBLE) {
            bool hasChanged = curData->status != status && secData->status != status;

            curData->status          = status;
            secData->status          = status;
            secData->dualToggleCount = 0;

            if (hasChanged)
                storeData(RECORD_ID_IO_BEGIN + (uint8_t)curData->input, datas.at(pin));
        } else if (curData->outputType == IOType_DUAL_TOGGLE) {
            if (curData->dualToggleCount == 0) {
                if (status) {
                    curData->status = true;
                    secData->status = false;
                } else {
                    curData->status          = false;
                    secData->status          = false;
                    curData->dualToggleCount = 1;
                }
            } else if (curData->dualToggleCount == 1) {
                if (status) {
                    curData->status = true;
                    secData->status = true;
                } else {
                    curData->status          = false;
                    secData->status          = false;
                    curData->dualToggleCount = 0;
                }
            }

            storeData(RECORD_ID_IO_BEGIN + (uint8_t)curData->input, datas.at(pin));
        }

        return;
    }

    bool hasChanged = curData->status != status;
    curData->status = status;

    if (hasChanged)
        storeData(RECORD_ID_IO_BEGIN + (uint8_t)curData->input, datas.at(pin));
}

bool IOClass::getIOPinStatus(IOPin_t pin) {
    return datas.at(pin).status;
}

void IOClass::setIOPinStatusCloud(IOPin_t pin, StatusCloud_t status) {
    IOData * curData = &(datas.at(pin));

    if (curData->outputType == IOType_SINGLE) {
        curData->statusCloudPrev = curData->statusCloud;
        curData->statusCloud = status;
    } else if (curData->outputType == IOType_DISABLE) {
        Map_t::iterator it;

        for (it = datas.begin(); it != datas.end(); ++it) {
            if (it->second.input != pin && it->second.outputSecondary == pin) {
                setIOPinStatusCloud(it->second.input, status);
                break;
            }
        }
    } else if (curData->outputType == IOType_DOUBLE || curData->outputType == IOType_DUAL_TOGGLE) {
        curData->statusCloudPrev = curData->statusCloud;
        curData->statusCloud = status;
    }
}

StatusCloud_t IOClass::getIOPinStatusCloud(IOPin_t pin) {
    return datas.at(pin).statusCloud;
}

IOClass IO;
