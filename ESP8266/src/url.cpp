#include "url.h"

String URLClass::encode(String uri) {
    String buffer = "";
    char code[3];

    for (uint8_t i = 0; i < uri.length(); ++i) {
        code[0] = uri.charAt(i);

        if (code[0] == ' ') {
            buffer += '+';
        } else if (isalnum(code[0])) {
            buffer += code[0];
        } else {
            code[2] = (code[0] & 0xf) + '0';

            if ((code[0] & 0xf) > 9)
                code[2] = (code[0] & 0xf) - 10 + 'A';

            code[0] = (code[0] >> 4) & 0xf;
            code[1] = code[0] + '0';

            if (code[0] > 9)
                code[1] = code[0] - 10 + 'A';

            buffer += '%';
            buffer += code[1];
            buffer += code[2];
        }

        yield();
    }

    return buffer;
}

String URLClass::decode(String data) {
    String buffer = "";
    char code[3];

    for (uint8_t i = 0; i < data.length(); ++i) {
        code[0] = data.charAt(i);

        if (code[0] == '+') {
            buffer += ' ';
        } else if (code[0] == '%') {
            code[1] = data.charAt(++i);
            code[2] = data.charAt(++i);
            code[0] = (h2int(code[1]) << 4) | h2int(code[2]);

            buffer += code[0];
        } else {
            buffer += code[0];
        }

        yield();
    }

    return buffer;
}

unsigned char URLClass::h2int(char c) {
    if (c >= '0' && c <='9')
        return((unsigned char)c - '0');

    if (c >= 'a' && c <='f')
        return((unsigned char)c - 'a' + 10);

    if (c >= 'A' && c <='F')
        return((unsigned char)c - 'A' + 10);

    return(0);
}

URLClass URL;
