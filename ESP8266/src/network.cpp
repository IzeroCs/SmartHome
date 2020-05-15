#include "profile.h"
#include "network.h"

void NetworkClass::onStationConnected(const WiFiEventStationModeConnected & evt) {
    Serial.println("onStationConnected: " + evt.ssid);
}

void NetworkClass::onStationDisconnected(const WiFiEventStationModeDisconnected & evt) {
    Serial.println("onStationDisconnected: " + evt.ssid);
}

void NetworkClass::onAPStationConnected(const WiFiEventSoftAPModeStationConnected & evt) {
    Serial.println("onAPStationConnected: " + macToString(evt.mac));
}

void NetworkClass::onAPStationDisconnected(const WiFiEventSoftAPModeStationDisconnected & evt) {
    Serial.println("onAPStationDisconnected: " + macToString(evt.mac));
}

void NetworkClass::onServerHandleRoot() {
    Serial.println("onServerHandleRoot");
    apStationServer.send(200, "text/html", "ESP8266");
}

void NetworkClass::onServerHandleWifi() {
    if (apStationServer.method() == HTTP_POST) {
        Serial.println("onSeverHandleWifi");
        apStationServer.send(200, "text/html", "ESP8266 Wifi Receive");
    } else {
        serverSendHttpCode(405);
    }
}

void NetworkClass::begin() {
    ssidApStation = ssidApStationMake();
    passApStation = passApStationMake();

    apStationIp      = IPAddress(192, 168, 31, 15);
    apStationGateway = IPAddress(192, 168, 31, 15);
    apStationSubnet  = IPAddress(255, 255, 255, 0);

    wifiBegin();
    serverBegin();
}

void NetworkClass::wifiBegin() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_AP_STA);
    WiFi.hostname(ssidApStation);
    WiFi.softAPConfig(apStationIp, apStationGateway, apStationSubnet);
    WiFi.softAP(ssidApStation, passApStation);

    stationConnectedHanlder      = WiFi.onStationModeConnected(&onStationConnected);
    stationDisconnectedHandler   = WiFi.onStationModeDisconnected(&onStationDisconnected);
    apStationConnectedHandler    = WiFi.onSoftAPModeStationConnected(&onAPStationConnected);
    apStationDisconnectedHandler = WiFi.onSoftAPModeStationDisconnected(&onAPStationDisconnected);
}

void NetworkClass::serverBegin() {
    apStationServer.on("/", [&] { onServerHandleRoot(); });
    apStationServer.on("/wifi", [&] { onServerHandleWifi(); });

    apStationServer.begin();
}

void NetworkClass::serverSendHttpCode(uint16_t code) {
    apStationServer.setContentLength(CONTENT_LENGTH_UNKNOWN);
    apStationServer.send(code, "text/plain", httpCodeToString(code));
}

void NetworkClass::loop() {
    apStationServer.handleClient();
}

String NetworkClass::ssidApStationMake() {
    return Profile.getSn() + Profile.getSc();
}

String NetworkClass::passApStationMake() {
    return Profile.getSc();
}

String NetworkClass::macToString(const unsigned char * mac) {
    char buf[20];
    snprintf(buf, sizeof(buf), "%02x:%02x:%02x:%02x:%02x:%02x",
            mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

    return String(buf);
}

String NetworkClass::httpCodeToString(uint16_t code) {
    String response = "";

    switch (code) {
        case 100:
            response = "Continue";
            break;
        case 101:
            response = "Switching Protocols";
            break;
        case 102:
            response = "Processing";
            break;
        case 103:
            response = "Early Hints";
            break;

        case 200:
            response = "OK";
            break;
        case 201:
            response = "Created";
            break;
        case 202:
            response = "Accepted";
            break;
        case 203:
            response = "Non-Authoritative Infomation";
            break;
        case 204:
            response = "No Content";
            break;
        case 205:
            response = "Reset Content";
            break;
        case 206:
            response = "Partial Content";
            break;
        case 207:
            response = "Multi-Status";
            break;
        case 208:
            response = "Already Reported";
            break;
        case 226:
            response = "IM Used";
            break;

        case 300:
            response = "Multiple Choices";
            break;
        case 301:
            response = "Moved Permanently";
            break;
        case 302:
            response = "Found (Previously \"Move Permanently\"";
            break;
        case 303:
            response = "See Other";
            break;
        case 304:
            response = "Not Modified";
            break;
        case 305:
            response = "Use Proxy";
            break;
        case 306:
            response = "Switch Proxy";
            break;
        case 307:
            response = "Temporary Redirect";
            break;
        case 308:
            response = "Permanent Redirect";
            break;

        case 400:
            response = "Bad Request";
            break;
        case 401:
            response = "Unauthorized";
            break;
        case 402:
            response = "Payment Required";
            break;
        case 403:
            response = "Forbidden";
            break;
        case 404:
            response = "Not Found";
            break;
        case 405:
            response = "Method Not Allowed";
            break;
        case 406:
            response = "Not Acceptable";
            break;
        case 407:
            response = "Proxy Authencation Required";
            break;
        case 408:
            response = "Request Timeout";
            break;
        case 409:
            response = "Confict";
            break;
        case 410:
            response = "Gone";
            break;
        case 411:
            response = "Length Required";
            break;
        case 412:
            response = "Precondition Failed";
            break;
        case 413:
            response = "Payload Too Large";
            break;
        case 414:
            response = "URI Too Long";
            break;
        case 415:
            response = "Unsupported Media Type";
            break;
        case 416:
            response = "Range Not Satisfiable";
            break;
        case 417:
            response = "Expectation Failed";
            break;
        case 418:
            response = "I'm a teapot";
            break;
        case 421:
            response = "Misdirected Request";
            break;
        case 422:
            response = "Unprocessable Entity";
            break;
        case 423:
            response = "Locked";
            break;
        case 424:
            response = "Failed Dependency";
            break;
        case 425:
            response = "Too Earty";
            break;
        case 426:
            response = "Upgrade Required";
            break;
        case 428:
            response = "Precondition Required";
            break;
        case 429:
            response = "Too Many Requests";
            break;
        case 431:
            response = "Request Header Field Too Large";
            break;
        case 451:
            response = "Unavailable For Legal Reasons";
            break;
        case 498:
            response = "Invalid Token";
            break;
        case 499:
            response = "Token Required";
            break;

        case 500:
            response = "Internal Server Error";
            break;
        case 501:
            response = "Not Implemented";
            break;
        case 502:
            response = "Bad Gateway";
            break;
        case 503:
            response = "Service Unavailable";
            break;
        case 504:
            response = "Gateway Timeout";
            break;
        case 505:
            response = "HTTP Version Not Supported";
            break;
        case 506:
            response = "Variant Also Negotiates";
            break;
        case 507:
            response = "Insufficient Storage";
            break;
        case 508:
            response = "Loop Detected";
            break;
        case 510:
            response = "Not Extended";
            break;
        case 511:
            response = "Network Authencation Required";
            break;
    }

    return "HTTP/1.0 " + String(code) + " " + response;
}

NetworkClass Network;
