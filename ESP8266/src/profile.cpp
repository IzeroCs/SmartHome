#include "Arduino.h"
#include "profile.h"

void ProfileClass::begin() {
    make();
}

String ProfileClass::getSn() {
    return sn;
}

String ProfileClass::getSc() {
    return sc;
}

void ProfileClass::make() {
    char buffSn[20];
    char buffSc[20];

    unsigned long snCreate = (PROFILE_DATE_CREATE - PROFILE_TIME_CREATE) + random(9999);
    unsigned long scCreate = ((PROFILE_TIME_CREATE + PROFILE_DATE_CREATE) << 2) + random(9999);

    ltoa(snCreate, buffSn, 10);
    ltoa(scCreate, buffSc, 10);

    Serial.print("SN: ");
    Serial.println(buffSn);
    Serial.print("SC: ");
    Serial.println(buffSc);
}

ProfileClass Profile;
