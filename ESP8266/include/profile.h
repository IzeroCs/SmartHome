#ifndef PROFILE_H
#define PROFILE_H

#include <Arduino.h>

#define PROFILE_SN_LENGTH 16
#define PROFILE_SC_LENGTH 8

#define PROFILE_SN_PREFIX   "ESP"
#define PROFILE_SC_PREFIX   "SC"

#define PROFILE_TIME_CREATE 121800
#define PROFILE_DATE_CREATE 260420

class ProfileClass {
private:
    const String FILE = "profile.txt";

    String sn = "";
    String sc = "";

public:
    void begin();
    String getSn();
    String getSc();

    static bool verify(String sn, String sc) {
        return sn.startsWith("ESP") && sc.startsWith("SC");
    }

protected:
    void make();
};

extern ProfileClass Profile;

#endif
