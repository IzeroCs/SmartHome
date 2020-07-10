#include "network.h"
#include "socket.h"
#include "io.h"
#include "pair.h"

void SocketClass::begin() {
    io.onBroadcast([&] (const char * event, const char * payload, size_t length) {
        onEvent(event, payload, length);
    });

    io.begin(host, port, nsp);
}

void SocketClass::loop() {
    loopSyncIO();
}

void SocketClass::loopMain() {
    io.loop();
}

void SocketClass::loopSyncIO(bool forceChanged) {
    if (!io.isConnect())
        return;

    if (!forceChanged && !IO.isIoStatusChanged())
        return;

    std::map<IOPin_t, IOData> datas = IO.getIODatas();
    std::map<IOPin_t, IOData>::iterator it;
    String array = "";

    for (it = datas.begin(); it != datas.end(); ++it) {
        if (it->first != IOPin_0)
            array += ",";

        array += it->second.toJsonString();
    }

    io.emit("sync-io", "{\"pins\":[" + array + "]," +
        "\"changed\":" + (IO.isIoStatusChanged() ? "true" : "false") + "}");

    loopSyncDetail();
    IO.setIoStatusChanged(false);
}

void SocketClass::loopSyncDetail() {
    if (!io.isConnect())
        return;

    io.emit("sync-detail", {
        { "detail_rssi", String(WiFi.RSSI()) }
    });
}

void SocketClass::onEvent(const char * event, const char * payload, size_t length) {
    String evt = String(event);
    String pay = String(payload);

    if (evt == "connect") {
        if (DEBUG)
            Serial.println("[Socket] Connect");

        io.emit("auth", {
            { "id", Profile.getSn() + Profile.getSc() },
            { "token", token }
        });
    } else if (evt == "disconnect") {
        Serial.println("[Socket] Disconnect");
    } else if (evt == "auth" || evt == "sync-io" || evt == "sync-detail") {
        if (evt == "auth")
            Serial.println("[Socket] Authenticate: authorized");

        IO.setIoStatusChanged(true);
    } else if (evt == "status-cloud") {
        IOPin_t pin = (IOPin_t)Pair.get(pay, "pin", "-1").toInt();
        StatusCloud_t status = (StatusCloud_t)Pair.get(pay, "status", String(StatusCloud_IDLE)).toInt();

        Serial.println("Pin: " + String(pin));
        Serial.println("Status: " + String(status));
    } else if (DEBUG) {
        Serial.println("[Socket] Event: " + evt + ", Payload: " + pay);
    }
}

SocketClass Socket;
