#include "io/io.h"

void IOClass::begin() {
    Monitor.println("[IO] Begin");
    initIOMap();
    Input.begin();
    Output.begin();
}

void IOClass::initIOMap() {
    Monitor.println("[IO] IO map reader");
    Config.readIOMap(ioMap);
}

void IOClass::handle() {
    Input.loop();
    Output.loop();
}

IOClass IO;
