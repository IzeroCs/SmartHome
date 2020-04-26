#ifndef PROFILE_H
#define PROFILE_H

#include <Arduino.h>

#define PROFILE_SN_PREFIX   "ESP"
#define PROFILE_SC_PREFIX   "SC"

#define PROFILE_TIME_CREATE 121800
#define PROFILE_DATE_CREATE 26042020

class ProfileClass {
private:
    String sn;
    String sc;

public:
    void begin();
    String getSn();
    String getSc();

protected:
    void make();
};

extern ProfileClass Profile;

#endif
