#include "io/io.h"

void IOClass::begin() {
    Monitor.println("[IO] Begin");
    Input.begin();
    Output.begin();
}

void IOClass::handle() {
    Input.loop();
    Output.loop();
}

IOClass IO;
