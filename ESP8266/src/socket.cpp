#include "network.h"
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

    std::map<IOPin_t, IOData> datas = IO.getIODatas();
    std::map<IOPin_t, IOData>::iterator it;
    String array = "";

    for (it = datas.begin(); it != datas.end(); ++it) {
        if (it->first != IOPin_0)
            array += ",";

        array += "\"" + it->second.toString() + "\"";
    }

    io.emit("sync.io", {{ "io", "[" + array + "]" }});
    io.emit("sync.detail", {
        { "rssi", Network.getRSSI() }
    });
}

void SocketClass::onEvent(const char * event, const char * payload, size_t length) {
    String evt = String(event);
    String pay = String(payload);

    if (evt == "connect") {
        if (DEBUG)
            Serial.println("[Socket] Connect");

        io.emit("authenticate", {
            { "id", Profile.getSn() + Profile.getSc() },
            { "token", token }
        });
    } else if (evt == "disconnect") {
        Serial.println("[Socket] Disconnect");
    }

    if (DEBUG)
        Serial.println("[Socket] Event: " + evt + ", Payload: " + pay);
}

SocketClass Socket;
