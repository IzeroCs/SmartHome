#include "network.h"
#include "station.h"
#include "ap_station.h"

void ApStationClass::begin() {
    ssid = ssidMake();
    psk  = pskMake();

    ip      = IPAddress(192, 168, 231, 125);
    gateway = IPAddress(192, 168, 231, 125);
    subnet  = IPAddress(255, 255, 255, 0);

    Serial.println("Ap Station begin");
    WiFi.hostname(ssid);
    WiFi.softAPConfig(ip, gateway, subnet);
    WiFi.softAP(ssid, psk);

    setEnabled(false);

    server.on("/",        [&] { onHandleRoot();    });
    server.on("/station", [&] { onHandleStation(); });
    Station.addEvent([&] (StationAction_t action, StationStatus_t status) {
        onStationEvent(action, status); });

    apStationConnectedHandler    = WiFi.onSoftAPModeStationConnected(&onAPStationConnected);
    apStationDisconnectedHandler = WiFi.onSoftAPModeStationDisconnected(&onAPStationDisconnected);
}

void ApStationClass::loop() {
    loopServer();
}

void ApStationClass::onHandleStation() {
    Serial.println("onHandleStation: " + String(server.method()));

    if (server.method() != HTTP_POST)
        return serverSendHttpCode(405);

    if (server.hasArg("changed")) {
        String stationSsid = server.arg("ssid");
        String stationPsk  = server.arg("psk");
        String json        = "{";
        bool isSuccess     = false;

        if (stationSsid.isEmpty()) {
            json += "message: \"Station SSID is required\",";
            json += "status: \"STATION_SSID_IS_REQUIRED\"";
        } else if (stationSsid.equals(Station.getSsid()) && stationPsk.equals(Station.getPsk())) {
            json += "message: \"Station not changed\",";
            json += "status: \"STATION_NOT_CHANGED\"";
        } else {
            uid = Util.generatorText(20);
            isSuccess = true;
            json += "message: \"Station connect\",";
            json += "status: \"STATION_CONNECT\",";
            json += "uid: \"" + uid + "\"";
        }

        server.send(200, "text/plain", json + "}");

        if (isSuccess) {
            delay(100);
            Station.connect(stationSsid, stationPsk);
        }
    } else if (server.hasArg("status")) {
        String json = "{";

        if (!server.hasArg("uid") || !uid.equals(server.arg("uid"))) {
            json += "message: \"UID not validate\"";
            json += "status: \"UID_NOT_VALIDATE\"";

            return server.send(200, "text/plain", json + "}");
        }

        if (WiFi.status() == WL_CONNECT_FAILED) {
            json += "message: \"Connect failed\"";
            json += "status: \"CONNECT_FAILED\"";
        } else if (WiFi.status() == WL_CONNECTED) {
            json += "message: \"Connected\"";
            json += "status: \"CONNECTED\"";
            json += "uid: \"" + uid + "\"";

            uid = server.arg("uid");
        }

        server.send(200, "text/plain", json + "}");
    } else if (server.hasArg("ap_station")) {
        String ap_station = server.arg("ap_station");
        String json = "{";

        if (ap_station.equals("close")) {
            String json  = "{";
                   json += "message: \"Close success\"";
                   json += "status: \"CLOSE_SUCCESS\"";
                   json += "}";

            server.send(200, "text/plain", json);
            delay(500);
            ApStation.setEnabled(false);
        }
    } else {
        serverSendHttpCode(400);
    }
}

void ApStationClass::onStationEvent(StationAction_t action, StationStatus_t status) {
    if (action == StationAction_WAIT) {
        Serial.println("Wait status: " + String(status));
    }
}

void ApStationClass::onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt) {
    Serial.println("AP Station Connected: " + Util.macToString(evt.mac));
}

void ApStationClass::onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt) {
    Serial.println("AP Station Disconnected: " + Util.macToString(evt.mac));
}

ApStationClass ApStation;
