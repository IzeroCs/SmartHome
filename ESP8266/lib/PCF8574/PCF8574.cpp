/*
 * PCF8574 GPIO Port Expand
 * https://www.mischianti.org/2019/01/02/pcf8574-i2c-digital-i-o-expander-fast-easy-usage/
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Renzo Mischianti www.mischianti.org All right reserved.
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

#include "PCF8574.h"
#include "Wire.h"


PCF8574::PCF8574(uint8_t address, uint8_t sda, uint8_t scl){
	_wire = &Wire;

	_address = address;
	_sda = sda;
	_scl = scl;
};

#ifdef ESP32
	/**
	 * Constructor
	 * @param address: i2c address
	 * @param sda: sda pin
	 * @param scl: scl pin
	 */
	PCF8574::PCF8574(TwoWire *pWire, uint8_t address, uint8_t sda, uint8_t scl){
		_wire = pWire;

		_address = address;
		_sda = sda;
		_scl = scl;
	};
#endif

/**
 * Wake up i2c controller
 */
void PCF8574::begin() {
	_wire->begin(_sda, _scl);

	// Check if there are pins to set low
	if (writeMode>0 || readMode>0) {
		_wire->beginTransmission(_address);

		#ifdef PCF8574_SOFT_INITIALIZATION
				resetInitial = writeModeUp | readModePullUp;
		#else
				resetInitial = writeModeUp | readMode;
		#endif

		_wire->beginTransmission(_address);
		_wire->write(resetInitial);

		initialBuffer = writeModeUp | readModePullUp;
		byteBuffered = initialBuffer;
		writeByteBuffered = writeModeUp;

		_wire->endTransmission();
	}

	// inizialize last read
	lastReadMillis = millis();
}

/**
 * Set if fin is OUTPUT or INPUT
 * @param pin: pin to set
 * @param mode: mode, supported only INPUT or OUTPUT (to simplify)
 * @param output_start: output_start, for OUTPUT we can set initial value
 */
void PCF8574::pinMode(uint8_t pin, uint8_t mode, uint8_t output_start){
	if (mode == OUTPUT){
		writeMode = writeMode | bit(pin);

		if (output_start == HIGH)
			writeModeUp = writeModeUp | bit(pin);

		readMode            =   readMode & ~bit(pin);
		readModePullDown 	=	readModePullDown 	& 	~bit(pin);
		readModePullUp 		=	readModePullUp 		& 	~bit(pin);
	} else if (mode == INPUT) {
		writeMode = writeMode & ~bit(pin);

		readMode 			=   readMode 			| bit(pin);
		readModePullDown 	=	readModePullDown 	| bit(pin);
		readModePullUp 		=	readModePullUp 		& ~bit(pin);
	} else if (mode == INPUT_PULLUP) {
		writeMode = writeMode & ~bit(pin);

		readMode 			=   readMode 			| bit(pin);
		readModePullDown 	=	readModePullDown 	& ~bit(pin);
		readModePullUp 		=	readModePullUp 		| bit(pin);

	}
};

byte getBit(byte n, byte position) {
   return (n >> position) & 1;
}

/**
 * Read value from i2c and bufferize it
 * @param force
 */
void PCF8574::readBuffer(bool force){
	if (millis() > PCF8574::lastReadMillis+latency || force){
		_wire->requestFrom(_address, (uint8_t)1); // Begin transmission to PCF8574 with the buttons
		lastReadMillis = millis();

		if(_wire->available()) {
			byte iInput = _wire->read(); // Read a byte

			if ((iInput & readModePullDown) > 0 && (~iInput & readModePullUp) > 0)
				byteBuffered = (byteBuffered & ~readMode) | (byte)iInput;
		}
	}
}

/**
 * Read value of all INPUT pin in byte format for low memory usage
 * Debounce read more fast than 10millis, non managed for interrupt mode
 * @return
 */
byte PCF8574::digitalReadAll(void){
	_wire->requestFrom(_address, (uint8_t)1);// Begin transmission to PCF8574 with the buttons
	lastReadMillis = millis();

	if(_wire->available()) {
		byte iInput = _wire->read(); // Read a byte

		if ((readModePullDown & iInput) > 0 || (readModePullUp & ~iInput) > 0)
			byteBuffered = (byteBuffered & ~readMode) | (byte)iInput;
	}

	byte byteRead = byteBuffered | writeByteBuffered;
	byteBuffered  = (initialBuffer & readMode) | (byteBuffered  & ~readMode);

	return byteRead;
};

/**
 * Read value of specified pin
 * Debounce read more fast than 10millis, non managed for interrupt mode
 * @param pin
 * @return
 */
uint8_t PCF8574::digitalRead(uint8_t pin, bool forceReadNow){
	uint8_t value = (bit(pin) & readModePullUp) ? HIGH : LOW;

	if ((((bit(pin) & (readModePullDown & byteBuffered)) > 0) || (bit(pin) & (readModePullUp & ~byteBuffered)) > 0 )){
		  if ((bit(pin) & byteBuffered) > 0)
			  value = HIGH;
		  else
			  value = LOW;
	 } else if (forceReadNow || (millis() > PCF8574::lastReadMillis + latency)) {
		  _wire->requestFrom(_address, (uint8_t)1);// Begin transmission to PCF8574 with the buttons
		  lastReadMillis = millis();

		  if(_wire->available()) {
			  byte iInput = _wire->read();// Read a byte

			  if ((readModePullDown & iInput) > 0 || (readModePullUp & ~iInput) > 0){
				  byteBuffered = (byteBuffered & ~readMode) | (byte)iInput;

				  if ((bit(pin) & byteBuffered) > 0)
					  value = HIGH;
				  else
					  value = LOW;
			  }
		  }
	}

	if ((bit(pin) & readModePullDown) && value == HIGH)
		byteBuffered = bit(pin) ^ byteBuffered;
	else if ((bit(pin) & readModePullUp) && value == LOW)
		byteBuffered = bit(pin) ^ byteBuffered;
	else if(bit(pin) & writeByteBuffered)
		value = HIGH;

	return value;
};

/**
 * Write on pin
 * @param pin
 * @param value
 */
void PCF8574::digitalWrite(uint8_t pin, uint8_t value){
	_wire->beginTransmission(_address);     //Begin the transmission to PCF8574

	if (value == HIGH){
		writeByteBuffered = writeByteBuffered | bit(pin);
		byteBuffered  = writeByteBuffered | bit(pin);
	} else {
		writeByteBuffered = writeByteBuffered & ~bit(pin);
		byteBuffered  = writeByteBuffered & ~bit(pin);
	}

	byteBuffered = (writeByteBuffered & writeMode) | (resetInitial & readMode);
	_wire->write(byteBuffered);
	byteBuffered = (writeByteBuffered & writeMode) | (initialBuffer & readMode);
	_wire->endTransmission();
};
