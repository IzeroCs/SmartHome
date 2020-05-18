#ifndef WARNING_H
#define WARNING_H

#include <Arduino.h>

#define DO_PRAGMA(X) _Pragma(#X)
#define DISABLE_WARNING(warningName) \
    DO_PRAGMA(clang diagnostic ignored #warningName)

#endif
