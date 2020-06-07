#ifndef __SOCKET_IO_CLIENT_H__
#define __SOCKET_IO_CLIENT_H__

#include <Arduino.h>
#include <map>
#include <vector>
#include <cstdarg>
#include <WebSocketsClient.h>

// #define SOCKETIOCLIENT_DEBUG(...) Serial.printf(__VA_ARGS__);
#define SOCKETIOCLIENT_DEBUG(...)

#define PING_INTERVAL 100 //TODO: use socket.io server response

//#define SOCKETIOCLIENT_USE_SSL
#ifdef SOCKETIOCLIENT_USE_SSL
	#define DEFAULT_PORT 443
#else
	#define DEFAULT_PORT 80
#endif
#define DEFAULT_URL "/socket.io/?transport=websocket"
#define DEFAULT_FINGERPRINT ""

typedef std::function<void (const char * event,
	const char * payload, size_t length)> SocketIoClientBroadcast;

class SocketIoClient {
private:
	bool isConnected;
	bool isDisconnected;

	std::vector<String> _packets;
	WebSocketsClient _webSocket;
	int _lastPing;
	SocketIoClientBroadcast _broadcast = nullptr;
	std::map<String, std::function<void (const char * payload, size_t length)>> _events;

	void trigger(const char* event, const char * payload, size_t length);
	void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
    void initialize();
public:
    void beginSSL(const char* host, const int port = DEFAULT_PORT, const char* url = DEFAULT_URL, const char* fingerprint = DEFAULT_FINGERPRINT);
	void begin(const char* host, const int port = DEFAULT_PORT, const char* url = DEFAULT_URL);
	void loop();
	void on(const char* event, std::function<void (const char * payload, size_t length)>);
	void onBroadcast(SocketIoClientBroadcast broadcast);
	void emit(const char* event, const char * payload = NULL);
	void emit(const char* event, const String payload = "");
	void emit(const char* event, const std::map<String, String> payload);
	void disconnect();
	void setAuthorization(const char * user, const char * password);

	bool isConnect() {
		return isConnected;
	}
};

#endif
