#include "network.h"
#include "socket.h"
#include "io.h"
#include "pair.h"

void SocketClass::begin() {
    id = Profile.getSn() + Profile.getSc();
    io.onBroadcast([&] (const char * ev, const char * payload, size_t length) {
        String event = String(ev);
        String data = String(payload);

        if (event == "connect")
            onConnect();
        else if (event == "disconnect")
            onDisconnect();
        else if (event == "id")
            onId(data);
        else if (event == "auth")
            onAuth(data);
        else if (event == "sync-io" || event == "sync-detail")
            onSync(data);
        else if (event == "status-cloud")
            onStatusCloud(data);
        else if (DEBUG)
            Serial.println("[Socket] Event: " + event + ", Payload: " + payload);
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

void SocketClass::onConnect() {
    if (DEBUG)
        Serial.println("[Socket] Connect");
}

void SocketClass::onDisconnect() {
    if (DEBUG)
        Serial.println("[Socket] Disconnect");
}

void SocketClass::onId(String payload) {
    if (DEBUG)
        Serial.println("[Socket] Id: " + id);

    io.emit("id", {{ "id", id }});
}

void SocketClass::onAuth(String payload) {
    if (DEBUG)
        Serial.println("[Socket] Authenticate: " + payload);

    if (payload != "authorized")
        io.emit("auth", {{ "token", token }});
    else
        IO.setIoStatusChanged(true);
}

void SocketClass::onSync(String payload) {
    IO.setIoStatusChanged(true);
}

void SocketClass::onStatusCloud(String payload) {
    IOPin_t pin = (IOPin_t)Pair.get(payload, "pin", "-1").toInt();
    StatusCloud_t status = (StatusCloud_t)Pair.get(payload, "status", String(StatusCloud_IDLE)).toInt();

    IO.setIOPinStatusCloud(pin, status);
    IO.setIoStatusChanged(true);
}

SocketClass Socket;
