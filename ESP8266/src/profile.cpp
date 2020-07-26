#include "Arduino.h"
#include "main.h"
#include "profile.h"
#include "record.h"
#include "ffs.h"

void ProfileClass::begin() {
    if (FFS.exists(FILE)) {
        String str = FFS.readString(FILE);
        int splitIndex = str.indexOf("|");

        if (splitIndex != -1) {
            String snBuff = str.substring(0, splitIndex);
            String scBuff = str.substring(splitIndex + 1);

            if (Profile.verify(snBuff, scBuff)) {
                sn = snBuff;
                sc = scBuff;

                Serial.println("[Profile] " + sn + sc);
            }
        }
    }

    delay(1000);
    make();
}

String ProfileClass::getSn() {
    return sn;
}

String ProfileClass::getSc() {
    return sc;
}

void ProfileClass::make() {
    if (sn.length() > 0 && sc.length() > 0)
        return;

    char buffSn[20];
    char buffSc[20];

    unsigned long snNum = (PROFILE_DATE_CREATE - PROFILE_TIME_CREATE) + random(9999);
    unsigned long scNum = ((PROFILE_TIME_CREATE + PROFILE_DATE_CREATE) << 2) + random(9999);

    ltoa(snNum, buffSn, 10);
    ltoa(scNum, buffSc, 10);

    String charRand = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    String snCreate = PROFILE_SN_PREFIX;
    String scCreate = PROFILE_SC_PREFIX;

    int charRandSize = charRand.length();
    int charDecimal  = 0;

    for (uint8_t i = 0; i < 20; ++i) {
        charDecimal = (int)buffSn[i];

        if (snCreate.length() >= PROFILE_SN_LENGTH)
            break;

        if (charDecimal < 48 || charDecimal > 57)
            break;

        snCreate += charRand.charAt((charDecimal - 48) * random(1, 3));
        snCreate += charRand.charAt(random(charRandSize));
    }

    for (uint8_t i = 0; i < 20; ++i) {
        charDecimal = (int)buffSc[i];

        if (scCreate.length() >= PROFILE_SC_LENGTH)
            break;

        if (charDecimal < 48 || charDecimal > 57)
            break;

        scCreate += charRand.charAt((charDecimal - 48) * random(1, 3));
        scCreate += charRand.charAt(random(charRandSize));
    }

    sn = snCreate;
    sc = scCreate;

    Serial.println("[Profile] Make: SN[" + snCreate + "], SC[" + scCreate + "]");
    FFS.write(FILE, [snCreate, scCreate] (File file) {
        file.print(snCreate + "|" + scCreate);
    });
}

ProfileClass Profile;
