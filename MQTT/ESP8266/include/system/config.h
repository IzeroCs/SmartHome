#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>
#include <ESP_EEPROM.h>

#include "stream/monitor.h"

struct ConfigStruct {
    char stationSSID[30];
    char stationPass[30];
};

struct IOStruct {
    char version[5];
};

class ConfigClass {
private:
    ConfigStruct config;
    IOStruct io;

public:
    void begin();
    void save();

    void setStationConfig(String ssid, String pass) {
        strcpy(config.stationSSID, ssid.c_str());
        strcpy(config.stationPass, pass.c_str());
    }

    String getStationSSID() { return config.stationSSID; }
    String getStationPass() { return config.stationPass; }
};

extern ConfigClass Config;

#endif
