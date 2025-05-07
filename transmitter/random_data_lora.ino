#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

// LoRa pins for TTGO ESP32
#define LORA_SCK 5
#define LORA_MISO 19
#define LORA_MOSI 27
#define LORA_SS 18
#define LORA_RST 14
#define LORA_DIO0 26

// BMP280 pins
#define BMP_SDA 21
#define BMP_SCL 22

// DHT11 pin
#define DHT_PIN 4
#define DHT_TYPE DHT11

// Create sensor objects
Adafruit_BMP280 bmp;
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("LoRa Transmitter with Sensors");

  // Setup LoRa pins
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  // Initialize LoRa
  if (!LoRa.begin(915E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  // Initialize BMP280
  Wire.begin(BMP_SDA, BMP_SCL);
  if (!bmp.begin(0x76)) {
    Serial.println("Could not find BMP280 sensor!");
    while (1);
  }

  // Initialize DHT11
  dht.begin();

  Serial.println("All sensors initialized successfully!");
}

void loop() {
  // Read sensor data
  float temperature_bmp = bmp.readTemperature();
  float pressure = bmp.readPressure() / 100.0F; // Convert to hPa
  float temperature_dht = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Get current timestamp (milliseconds since boot)
  unsigned long timestamp = millis();

  // Prepare JSON packet
  String packet = "{";
  packet += "\"timestamp\":" + String(timestamp) + ",";
  packet += "\"bmp_temp\":" + String(temperature_bmp, 2) + ",";
  packet += "\"pressure\":" + String(pressure, 2) + ",";
  packet += "\"dht_temp\":" + String(temperature_dht, 2) + ",";
  packet += "\"humidity\":" + String(humidity, 2);
  packet += "}";
  
  // Send packet
  LoRa.beginPacket();
  LoRa.print(packet);
  LoRa.endPacket();

  Serial.println("Sent packet: " + packet);

  // Delay between transmissions
  delay(2000);
} 