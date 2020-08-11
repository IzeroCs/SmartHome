#ifndef SERI_H
#define SERI_H

#define SERI_SN_LENGTH 14
#define SERI_SC_LENGTH 8

#define SERI_SN_PREFIX "ESP-"
#define SERI_SC_PREFIX "SC"

#define SERI_TIME_CREATE 121800
#define SERI_DATE_CREATE 260420

#define SERI_FILE "seri.dat"
#define SERI_VERSION 5

#include <Arduino.h>

#include "stream/monitor.h"
#include "stream/ffs.h"

typedef struct {
    char sn[16];
    char sc[8];
    char v[5];
} SeriStruct;

class SeriClass {
private:
    SeriStruct seri = {
        .sn = "",
        .sc = "",
        .v  = "0"
    };

public:
    void begin();

    bool isEmpty() {
        return strlen(seri.sn) <= 0 || strlen(seri.sc) <= 0;
    }

    bool isChange() {
        return String(seri.v).toInt() != SERI_VERSION;
    }

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
