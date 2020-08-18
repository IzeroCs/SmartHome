#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

#include "stream/monitor.h"
#include "system/erom.h"
#include "io/io_def.h"

#define ID_STATION_SSID 0
#define ID_STATION_PASS 1
#define ID_IO_MAP_BEGIN 2
#define ID_IO_MAP_END   10

#define SIZE_STATION_SSID 30
#define SIZE_STATION_PASS 30
#define IO_MAP_IT_SIZE 20

class ConfigClass {
private:
    String stationSSID;
    String stationPass;

public:
    void begin();
    void save();

    void setStationConfig(String ssid, String pass) {
        Monitor.println("[Config] Setter station config");

        stationSSID = ssid;
        stationPass = pass;
    }

    void updateIOMap();
    void readIOMap();

    String getStationSSID() { return String(stationSSID); }
    String getStationPass() { return String(stationPass); }
};

extern ConfigClass Config;

#endif
