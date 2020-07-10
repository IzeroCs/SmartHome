#ifndef PAIR_H
#define PAIR_H

#include <Arduino.h>

class PairClass {
public:
    static String get(String data, String key, String def = "") {
        String result = "";
        int index = data.indexOf(key);
        int indexEqual = data.indexOf("=", index + key.length());
        int indexEnd = 0;

        if (index == -1 || indexEqual == -1)
            return def;

        if ((indexEnd = data.indexOf(",", indexEqual + 1)) != -1)
            result = data.substring(indexEqual + 1, indexEnd);
        else
            result = data.substring(indexEqual + 1);

        if (result.startsWith("\""))
            result = result.substring(1);

        if (result.endsWith("\""))
            result = result.substring(result.length() - 1);

        return result;
    }
};

extern PairClass Pair;
#endif
