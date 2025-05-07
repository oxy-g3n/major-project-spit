/*
  ---------------------------------
  IMPORTANT: Configuration Reminder
  ---------------------------------
  
  Before running this code, make sure to check the "secrets.h" file
  for important configuration details such as Wi-Fi credentials and 
  Firebase settings.

  The "secrets.h" file should include:
  - Your Wi-Fi SSID and Password
  - Your Firebase Realtime Database URL
  - (OPTIONAL) Firebase Authentication Token

  Ensure that "secrets.h" is properly configured and includes the correct
  information for your project. Failure to do so may result in connection
  errors or incorrect behavior of your application.

  Note: The "secrets.h" file should be located in the same directory as
  this sketch.
*/

#include "secrets.h"
#include <SPI.h>
#include <LoRa.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <Firebase.h>
#include <time.h>

// LoRa pins for TTGO ESP32
#define LORA_SCK 5
#define LORA_MISO 19
#define LORA_MOSI 27
#define LORA_SS 18
#define LORA_RST 14
#define LORA_DIO0 26

// NTP Server details
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 19800;  // GMT+5:30 for Mumbai
const int   daylightOffset_sec = 0;

// Variables for WiFi connection status
bool wifiConnected = false;

// Firebase instance
Firebase fb(REFERENCE_URL);

// Add these at the top with other global variables
#define BATCH_SIZE 50
JsonDocument packetsArray[BATCH_SIZE];  // Array to store packets
int packetCount = 0;  // Counter for collected packets
int batchNumber = 0;  // To track batch numbers

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("LoRa Receiver with WiFi and Firebase");

  // Setup LoRa pins
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  // Initialize LoRa
  if (!LoRa.begin(915E6)) {
    Serial.println("Starting LoRa failed!");
    while (1);
  }

  // Connect to WiFi
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(1000);

  Serial.print("Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("-");
    delay(500);
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  wifiConnected = true;

  // After WiFi is connected, try NTP sync with more debug info
  Serial.println("Attempting to sync NTP time...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // More detailed time sync check
  struct tm timeinfo;
  int retry = 0;
  while (!getLocalTime(&timeinfo) && retry < 10) {
    Serial.println("Failed to get time, retrying...");
    Serial.printf("Attempt %d/10\n", retry + 1);
    delay(1000);
    retry++;
  }

  if (getLocalTime(&timeinfo)) {
    Serial.println("Time synchronized successfully!");
    char timeStringBuf[50];
    strftime(timeStringBuf, sizeof(timeStringBuf), "%A, %B %d %Y %H:%M:%S", &timeinfo);
    Serial.print("Current time: ");
    Serial.println(timeStringBuf);
  } else {
    Serial.println("Time sync failed! Check if:");
    Serial.println("1. Your WiFi connection is stable");
    Serial.println("2. NTP server (pool.ntp.org) is accessible");
    Serial.println("3. Your timezone offset is correct");
    Serial.printf("Current timezone offset: %ld seconds\n", gmtOffset_sec);
  }

  Serial.println("LoRa Initialized Successfully!");
  Serial.println("Waiting for packets...");
  Serial.println("------------------------");
}

// Simplified getCurrentDateTime function
String getCurrentDateTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to get time - getLocalTime() returned false");
    return "Time sync error";
  }
  
  char timeString[64];
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);
  return String(timeString);
}

// Function to estimate distance based on RSSI
float estimateDistance(int rssi) {
  // Using a simple path loss model
  // RSSI = -10 * n * log10(d) + A
  // where:
  // n is the path loss exponent (typically 2-4)
  // d is the distance
  // A is the RSSI at 1 meter distance
  
  const float n = 2.7;  // Path loss exponent
  const float A = -60;  // RSSI at 1 meter (calibrate this value)
  
  // Convert RSSI to distance
  float distance = pow(10, (A - rssi) / (10 * n));
  return distance;
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // Read packet
    String packet = "";
    while (LoRa.available()) {
      packet += (char)LoRa.read();
    }

    // Get RSSI and SNR
    int rssi = LoRa.packetRssi();
    float snr = LoRa.packetSnr();
    float distance = estimateDistance(rssi);

    // Parse JSON
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, packet);

    if (!error) {
      // Extract values and prepare data for storage
      JsonDocument& currentPacket = packetsArray[packetCount];
      currentPacket.clear();  // Clear any previous data
      
      // Store all the data in the current packet slot
      currentPacket["timestamp"] = doc["timestamp"];
      currentPacket["bmp_temp"] = doc["bmp_temp"];
      currentPacket["pressure"] = doc["pressure"];
      currentPacket["dht_temp"] = doc["dht_temp"];
      currentPacket["humidity"] = doc["humidity"];
      currentPacket["rssi"] = rssi;
      currentPacket["snr"] = snr;
      currentPacket["distance"] = distance;
      
      currentPacket["received_datetime"] = getCurrentDateTime();

      // Print the received data (keeping your existing print statements)
      Serial.println("\nReceived Sensor Data:");
      Serial.println("------------------------");
      Serial.print("Timestamp: "); Serial.print(doc["timestamp"].as<unsigned long>()); Serial.println(" ms");
      Serial.print("BMP280 Temperature: "); Serial.print(doc["bmp_temp"].as<float>()); Serial.println(" °C");
      Serial.print("Pressure: "); Serial.print(doc["pressure"].as<float>()); Serial.println(" hPa");
      Serial.print("DHT11 Temperature: "); Serial.print(doc["dht_temp"].as<float>()); Serial.println(" °C");
      Serial.print("Humidity: "); Serial.print(doc["humidity"].as<float>()); Serial.println(" %");
      Serial.print("RSSI: "); Serial.print(rssi); Serial.println(" dBm");
      Serial.print("SNR: "); Serial.print(snr); Serial.println(" dB");
      Serial.print("Estimated Distance: "); Serial.print(distance); Serial.println(" meters");
      Serial.print("Received at: "); Serial.println(getCurrentDateTime());
      Serial.println("------------------------");

      packetCount++;

      // When we have collected BATCH_SIZE packets, send them all to Firebase
      if (packetCount >= BATCH_SIZE) {
        // Create a batch document
        JsonDocument batchDoc;
        for (int i = 0; i < BATCH_SIZE; i++) {
          String packetKey = String(packetsArray[i]["timestamp"].as<unsigned long>());
          batchDoc[packetKey] = packetsArray[i];
        }

        // Convert to string
        String batchData;
        serializeJson(batchDoc, batchData);

        // Create a unique path for this batch using current timestamp
        String batchTimestamp = String(time(nullptr));  // Get current Unix timestamp
        String path = "sensor_data/batch_" + batchTimestamp;
        
        // Upload batch to Firebase
        if (fb.setJson(path, batchData)) {
          Serial.println("Batch uploaded successfully!");
          Serial.printf("Uploaded %d packets to path: %s\n", BATCH_SIZE, path.c_str());
          batchNumber++;  // Increment batch counter
        } else {
          Serial.println("Failed to upload batch!");
        }

        // Reset the packet counter after upload
        packetCount = 0;
      }
    } else {
      Serial.print("JSON parsing failed: ");
      Serial.println(error.c_str());
    }
  }
  
  // Check WiFi connection status periodically
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    Serial.println("WiFi connection lost. Attempting to reconnect...");
    wifiConnected = false;
    WiFi.reconnect();
  }
} 