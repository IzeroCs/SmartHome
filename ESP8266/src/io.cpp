#include "main.h"
#include "record.h"
#include "io.h"

void IOClass::begin() {
    if (DEBUG)
        Serial.println("[IO] Begin");

    IOData data;
    String record;
    int pinMask = IO_PIN_0;

    for (int i = RECORD_ID_IO_BEGIN; i < RECORD_ID_IO_END; ++i) {
        Record.bind(i, 15);
        record = Record.readString(i);

        if (!record.isEmpty() && record.indexOf(SPLIT) != -1) {
            data = parseData(record);
        } else {
            data = initData(pinMask, Input_SINGLE, pinMask, pinMask, false);
            storeData(i, data);
        }

        pinMask <<= 1;
        datas.push_back(data);
    }

    Output.begin();
    Input.begin();
}

void IOClass::loop() {
    Output.loop();
    Input.loop();
}

IOClass IO;
