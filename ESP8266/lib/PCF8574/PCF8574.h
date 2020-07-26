/*
 * PCF8574 GPIO Port Expand
 *
 * AUTHOR:  Renzo Mischianti
 * VERSION: 2.2.0
 *
 * https://www.mischianti.org/2019/01/02/pcf8574-i2c-digital-i-o-expander-fast-easy-usage/
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Renzo Mischianti www.mischianti.org All right reserved.
 *
 * You may copy, alter and reuse this code in any way you like, but please leave
 * reference to www.mischianti.org in your comments if you redistribute this code.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#ifndef PCF8574_h
#define PCF8574_h

#include "Wire.h"
#include "Arduino.h"

#define DEFAULT_SDA SDA
#define DEFAULT_SCL SCL
#define PCF8574_SOFT_INITIALIZATION

#define P0  	0
#define P1  	1
#define P2  	2
#define P3  	3
#define P4  	4
#define P5  	5
#define P6  	6
#define P7  	7

#include <math.h>


class PCF8574 {
public:
    PCF8574(uint8_t address);
	PCF8574(uint8_t address, uint8_t sda, uint8_t scl);

#ifdef ESP32
	PCF8574(TwoWire *pWire, uint8_t address, uint8_t sda, uint8_t scl);
#endif

	void begin();
	void pinMode(uint8_t pin, uint8_t mode, uint8_t output_start = HIGH);

	void readBuffer(bool force = true);
	void digitalWrite(uint8_t pin, uint8_t value);
	uint8_t digitalRead(uint8_t pin, bool forceReadNow = false);
	byte digitalReadAll(void);

	int getLatency() const {
		return latency;
	}

    bool isConnected() {
        return _isConnected;
    }

	void setLatency(int latency = 10) {
		this->latency = latency;
	}

private:
	uint8_t _address;
	uint8_t _sda = DEFAULT_SDA;
	uint8_t _scl = DEFAULT_SCL;
    bool _isConnected = false;

	TwoWire *_wire;

	byte writeMode 			= 	B00000000;
	byte writeModeUp		= 	B11111111;
	byte readMode 			= 	B00000000;
	byte readModePullUp 	= 	B11111111;
	byte readModePullDown 	= 	B00000000;
	byte byteBuffered 		= 	B00000000;
	byte resetInitial		= 	B00000000;
	byte initialBuffer		= 	B00000000;
	byte writeByteBuffered  = B00000000;

	unsigned long lastReadMillis = 0;
	uint8_t prevNextCode = 0;
	uint16_t store = 0;

	int latency = 10;
};

#endif
