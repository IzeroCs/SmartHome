#include "system/config.h"

void ConfigClass::begin() {
    Monitor.println("[Config] Begin");

    EROM.begin();
    EROM.bind(ID_STATION_SSID, SIZE_STATION_SSID);
    EROM.bind(ID_STATION_PASS, SIZE_STATION_PASS);

    for (uint8_t id = ID_IO_MAP_BEGIN; id < ID_IO_MAP_END; ++id)
        EROM.bind(id, IO_MAP_IT_SIZE);

    stationSSID = EROM.readString(ID_STATION_SSID);
    stationPass = EROM.readString(ID_STATION_PASS);

    Monitor.println("[Config] Read station: " + stationSSID + "(" + stationPass + ")");
}

void ConfigClass::save() {
    EROM.write(ID_STATION_SSID, stationSSID);
    EROM.write(ID_STATION_PASS, stationPass);

    if (EROM.commit())
        Monitor.println("[Config] Save successful");
    else
        Monitor.println("[Config] Save unsuccessful");
}

void ConfigClass::updateIOMap() {
    IOMap_t ioMap = IODef.getIOMap();

    if (ioMap.empty()) {
        Monitor.println("[Config] IO map empty, write unsuccessfy");
        return;
    }

    IOData data;
    String buffer;
    IOMap_t::iterator it;
    uint8_t id = ID_IO_MAP_BEGIN;

    for (it = ioMap.begin(); it != ioMap.end(); ++it) {
        data   = it->second;
        buffer = data.toEROM();

        Monitor.println("[Config] Wirte IO map: " + buffer);
        EROM.write(id++, buffer);
    }

    if (EROM.commit())
        Monitor.println("[Config] Write IO map successfy");
    else
        Monitor.println("[Config] Write IO map unsuccessfy");
}

void ConfigClass::readIOMap() {
    IOMap_t & ioMap = IODef.getIOMap();
    IOPin_t   pin   = IOPin_0;
    String ioBuffer = "";

    ioMap.clear();

    for (uint8_t id = ID_IO_MAP_BEGIN; id < ID_IO_MAP_END; ++id) {
        ioBuffer = EROM.readString(id);

        if (ioBuffer.isEmpty() || !IODef.validate(ioBuffer))
            ioMap.insert({ pin, IODef.initIOData(pin, IOType_SINGLE, pin, pin, 0, StatusCloud_IDLE, false) });
        else
            ioMap.insert({ pin, IODef.parseIOData(ioBuffer) });

        pin = (IOPin_t)((uint8_t)pin + 1);
    }

    updateIOMap();
}

ConfigClass Config;
