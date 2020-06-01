#include "socket.h"
#include "io.h"

void SocketClass::begin() {
    io.onBroadcast([&] (const char * event, const char * payload, size_t length) {
        onEvent(event, payload, length);
    });

    io.begin(host, port);
}

void SocketClass::loop() {
    io.loop();
}

void SocketClass::loopSyncIO() {
    if (!io.isConnect())
        return;

    std::vector<IOData> datas = IO.getIODatas();
    IOData data;
    String array = "";
    uint8_t size = datas.size();
    uint8_t i    = 0;

    for (i = 0; i < size; ++i) {
        data = datas.at(i);
        if (i > 0)
            array += ",";

        array += "\"" + datas.at(i).toString() + "\"";
    }

    io.emit("sync-io", {{ "io", "[" + array + "]" }});
}

void SocketClass::onEvent(const char * event, const char * payload, size_t length) {
    String evt = String(event);
    String pay = String(payload);

    if (evt == "connect") {
        if (DEBUG)
            Serial.println("[Socket] Connect");

        io.emit("authenticate", {
            { "id", Profile.getSn() },
            { "token", token }
        });
    } else if (evt == "disconnect") {
        Serial.println("[Socket] Disconnect");
    }

    if (DEBUG)
        Serial.println("[Socket] Event: " + evt + ", Payload: " + pay);
}

SocketClass Socket;
