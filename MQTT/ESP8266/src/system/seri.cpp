#include "system/seri.h"

void SeriClass::begin() {
    FFS.read(SERI_FILE, [&] (File file) {
        file.read((uint8_t *)&seri, sizeof(seri));
    });

    if (isEmpty()) {
        generator();
    } else if (verify(getSN(), getSC())) {
        Monitor.println("[Seri] SN: " + getSN() + ", SC: " + getSC());
    } else {
        Monitor.println("[Seri] Verify SN, SC failed, restart...");
        delay(2000);
        ESP.restart();
    }
}

void SeriClass::generator() {
    char buffSn[20];
    char buffSc[20];

    ulong snNum = (SERI_DATE_CREATE - SERI_TIME_CREATE) + random(9999);
    ulong scNum = ((SERI_TIME_CREATE + SERI_DATE_CREATE) << random(1, 2)) + random(9999);

    ltoa(snNum, buffSn, 10);
    ltoa(scNum, buffSc, 10);

    String chrRand = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    String snStr   = SERI_SN_PREFIX;
    String scStr   = SERI_SC_PREFIX;

    int chrRandSize = chrRand.length();
    int chrDecimal = 0;

    for (int8_t i = 0; i < 20; ++i) {
        chrDecimal = (int)buffSn[i];

        if (snStr.length() >= SERI_SN_LENGTH)
            break;

        if (chrDecimal < 48 || chrDecimal > 57)
            break;

        snStr += chrRand.charAt((chrDecimal - 48) * random(1, 3));
        snStr += chrRand.charAt(random(chrRandSize));
    }

    for (int8_t i = 0; i < 20; ++i) {
        chrDecimal = (int)buffSc[i];

        if (scStr.length() >= SERI_SC_LENGTH)
            break;

        if (chrDecimal < 48 || chrDecimal > 57)
            break;

        scStr += chrRand.charAt((chrDecimal - 48) * random(1, 3));
        scStr += chrRand.charAt(random(chrRandSize));
    }

    strcpy(seri.sn, snStr.c_str());
    strcpy(seri.sc, scStr.c_str());

    Monitor.println("[Seri] Generator");
    Monitor.println("[Seri] SN: " + String(seri.sn) + ", SC: " + String(seri.sc));

    FFS.write(SERI_FILE, [&] (File file) {
        file.write((uint8_t *)&seri, sizeof(seri));
    });
}

SeriClass Seri;
