#ifndef MQTT_H
#define MQTT_H

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <MQTTClient.h>
#include <PubSubClient.h>
#include <SocketIOclient.h>

#include "stream/monitor.h"
#include "system/seri.h"
#include "io/io_def.h"
#include "io/io.h"

#define CLOUD_EVENT_CONNECT        "connect"
#define CLOUD_EVENT_DISCONNECT     "disconnect"
#define CLOUD_EVENT_SOCKET_ID      "socket.id"
#define CLOUD_EVENT_AUTHENTICATION "authentication"
#define CLOUD_EVENT_SYNC_IO        "sync.io"
#define CLOUD_EVENT_SYNC_DETAIL    "sync.detail"
#define CLOUD_EVENT_SYNC_SYSTEM    "sync.system"
#define CLOUD_EVENT_STATUS_CLOUD   "status.cloud"

class CloudClass {
private:
    String   host = "192.168.31.104";
    String   nsp  = "/platform.esp";
    uint16_t port = 3000;

    SocketIoClient socket;
    String token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSXplcm9DcyIsInN1YiI6IkVTUDgyNjYiLCJpYXQiOjQxMDI0NDQ4MDB9.HAU4zKdQnfHqj0kfLYoLH5blr3BUSgQo-DgxT0JvIjd9t6b0AloTjA1mUfbk9LRipe-OMC58LYIHG2kbpYAyCg";

    bool initializing;
    bool storeData;

    ulong loopNow = 0;
    ulong storeNow = 0;
    ulong loopPeriod = 2000;
    ulong storePeriod = 2000;

public:
    void begin();
    void handle();

    bool isSocketConnect() {
        return socket.isConnect();
    }

protected:
    void loop();
    void onConnect();
    void onDisconnect();
    void onSocketId(String data);
    void onAuthentication(String data);
    void onStatusCloud(String data);
    void onSyncIO(String data);
    void onSyncSystem(String data);
};

extern CloudClass Cloud;

#endif
