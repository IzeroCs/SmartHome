#include "config.h"

void ConfigClass::begin() {
    Monitor.println("[Config] Begin");
    EEPROM.begin(sizeof(config) + sizeof(io));

    if (EEPROM.percentUsed() >= 0) {
        EEPROM.get(0, config);
        EEPROM.get(1, io);
        Monitor.println("[Config] Has data eeprom");
    } else {
        Monitor.println("[Config] Default config save eeprom");
        save();
    }
}

void ConfigClass::save() {
    EEPROM.put(0, config);
    EEPROM.put(1, io);

    if (EEPROM.commit())
        Monitor.println("[Config] Save config failed");
    else
        Monitor.println("[Config] Save config success");
}

ConfigClass Config;
