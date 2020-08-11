#ifndef SERI_H
#define SERI_H

#define SERI_SN_LENGTH 14
#define SERI_SC_LENGTH 8

#define SERI_SN_PREFIX "ESP_"
#define SERI_SC_PREFIX "SC"

#define SERI_TIME_CREATE 121800
#define SERI_DATE_CREATE 260420

#define SERI_FILE "seri.dat"

#include <Arduino.h>

#include "stream/monitor.h"
#include "stream/ffs.h"

typedef struct {
    char sn[16];
    char sc[8];
} SeriStruct;

class SeriClass {
private:
    SeriStruct seri = { "", "" };

public:
    void begin();

    bool isEmpty() { return strlen(seri.sn) <= 0 || strlen(seri.sc) <= 0; }
    String getSN() { return String(seri.sn); }
    String getSC() { return String(seri.sc); }
    String getHostname() { return String(seri.sn) + String(seri.sc); }

    static bool verify(String sn, String sc) {
        return sn.startsWith(SERI_SN_PREFIX) && sc.startsWith(SERI_SC_PREFIX);
    }

protected:
    void generator();
};

extern SeriClass Seri;

#endif
