#ifndef IO_H
#define IO_H

#include <Arduino.h>

#include "stream/monitor.h"
#include "system/config.h"

#include "io/io_def.h"
#include "io/input.h"
#include "io/output.h"

class IOClass {
private:
    void initIOMap();

public:
    void begin();
    void handle();
};

extern IOClass IO;

#endif
