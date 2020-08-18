#include "network/cloud.h"

void CloudClass::begin() {
    if (initializing)
        return;

    Monitor.println("[Cloud] Begin socket");

    socket.onBroadcast([&] (const char * eventName, const char * payload, size_t length) {
        String event = String(eventName);
        String data  = String(payload);

        if (event == CLOUD_EVENT_CONNECT)
            onConnect();
        else if (event == CLOUD_EVENT_DISCONNECT)
            onDisconnect();
        else if (event == CLOUD_EVENT_AUTHENTICATION)
            onAuthentication(data);
        else if (event == CLOUD_EVENT_STATUS_CLOUD)
            onStatusCloud(data);
        else if (event == CLOUD_EVENT_SYNC_IO || event == CLOUD_EVENT_SYNC_DETAIL)
            onSyncIO(data);
        else
            Monitor.println("[Cloud] Event: " + String(event) + ", Payload: " + data);
    });

    socket.begin(host.c_str(), port, nsp.c_str());
    initializing = true;
}

void CloudClass::handle() {
    if (!initializing || WiFi.status() != WL_CONNECTED)
        return;

    socket.loop();
    loop();
}

void CloudClass::loop() {
    if (!socket.isConnect())
        return;

    if (millis() - loopNow >= loopPeriod) {
        loopNow = millis();

        if (IODef.isForceChanged() || IODef.isStatusChanged()) {
            String pinArray = "";
            String changed = "false";
            IOMap_t::iterator it;
            IOMap_t ioMap = IODef.getIOMap();

            if (IODef.isStatusChanged())
                changed = "true";

            for (it = ioMap.begin(); it != ioMap.end(); ++it) {
                if (it->first != IOPin_0)
                    pinArray += ",";

                pinArray += it->second.toJSON();
            }

            socket.emit(CLOUD_EVENT_SYNC_IO, "{\"pins\":[" + pinArray + "],\"changed\":" + changed + "}");

            IODef.setForceChanged(false);
            IODef.setStatusChanged(false);
        }

        socket.emit(CLOUD_EVENT_SYNC_DETAIL, "{\"detail_rssi\":" + String(WiFi.RSSI()) + "}");
    }
}

void CloudClass::onConnect() {
    Monitor.println("[Cloud] Socket connection");
    IODef.setForceChanged(true);
}

void CloudClass::onDisconnect() {
    Monitor.println("[Cloud] Socket disconnection");
}

void CloudClass::onAuthentication(String data) {
    if (data != "authorized")
        socket.emit(CLOUD_EVENT_AUTHENTICATION, "\{\"id\":\"" + Seri.getHostname() + "\", \"token\":\"" + token + "\"}");
    else
        IODef.setForceChanged(true);
}

void CloudClass::onStatusCloud(String data) {

}

void CloudClass::onSyncIO(String data) {
    IODef.setForceChanged(true);
}

CloudClass Cloud;
