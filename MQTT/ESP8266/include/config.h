#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>
#include <ESP_EEPROM.h>

#include "monitor.h"

struct ConfigStruct {
    String stationSSID;
    String stationPass;
};

struct IOStruct {
    String version;
};

class ConfigClass {
private:
    ConfigStruct config;
    IOStruct io;

public:
    void begin();
    void save();

    void setStationConfig(String ssid, String pass) {
        config.stationSSID = ssid;
        config.stationPass = pass;
    }

    String getStationSSID() { return config.stationSSID; }
    String getStationPass() { return config.stationPass; }
};

extern ConfigClass Config;

#endif
