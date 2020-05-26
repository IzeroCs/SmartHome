#include "input.h"

void InputClass::begin() {
    wire.begin();
}

void InputClass::loop() {
    Serial.println("Scanning...");

  byte error, address;
  int nDevices;

  Serial.println(F("Scanning I2C bus (7-bit addresses) ..."));

  nDevices = 0;
  for(address = 0x20; address <= 0x27; address++ )
    {
      // The i2c_scanner uses the return value of
      // the Write.endTransmisstion to see if
      // a device did acknowledge to the address.
      wire.beginTransmission(address);
      error = wire.endTransmission();

      if (error == 0)
        {
          Serial.print(F("I2C device found at address 0x"));
          if (address<16)
            Serial.print(F("0"));
          Serial.print(address,HEX);
          Serial.println(F("  !"));

          nDevices++;
        }
      else if (error==2)
        {
          Serial.print(F("Unknow error at address 0x"));
          if (address<16)
            Serial.print("0");
          Serial.println(address,HEX);
        }
    }
  if (nDevices == 0)
    Serial.println("No I2C devices found\n");
  else
    Serial.println("done\n");
}

InputClass Input;
