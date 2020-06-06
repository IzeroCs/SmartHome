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
            data = initData(pin, IOType_SINGLE, pin, pin, 0, false);
            storeData(i, data);
        }

        datas.insert({ (IOPin_t)pin, data });
        pin++;
    }

    setIOData(IOPin_0, IOType_DOUBLE, IOPin_1);
    setIOData(IOPin_2, IOType_DUAL_TOGGLE, IOPin_3);
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

    if (outputType == IOType_SINGLE && (curData->outputType == IOType_DOUBLE || curData->outputType == IOType_DUAL_TOGGLE)) {
        if (curData->outputSecondary != curData->outputPrimary) {
            IOData * secData = &(datas.at(curData->outputSecondary));

            secData->outputSecondary = secData->outputPrimary;
            secData->outputType      = IOType_SINGLE;
            secData->dualToggleCount = 0;
            secData->status          = false;

            storeData(RECORD_ID_IO_BEGIN + (uint8_t)secData->input, datas.at(secData->input));
        }
    } else if (outputType == IOType_DOUBLE || outputType == IOType_DUAL_TOGGLE) {
        if (outputSecondary != curData->outputSecondary) {
            IOData * secData = &(datas.at(outputSecondary));

            secData->outputSecondary = secData->outputPrimary;
            secData->outputType      = IOType_DISABLE;
            secData->dualToggleCount = 0;
            secData->status          = false;

            storeData(RECORD_ID_IO_BEGIN + (uint8_t)secData->input, datas.at(secData->input));

            if (curData->outputSecondary != curData->outputPrimary) {
                secData = &(datas.at(curData->outputSecondary));

                secData->outputSecondary = secData->outputPrimary;
                secData->outputType      = IOType_SINGLE;
                secData->dualToggleCount = 0;
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

void IOClass::setIOPinStatus(IOPin_t pin, bool status) {
    IOData * curData = &(datas.at(pin));

    if (curData->outputType == IOType_DISABLE || status == curData->statusPrev)
        return;

    ioStatusChanged     = true;
    curData->statusPrev = status;

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

IOClass IO;
