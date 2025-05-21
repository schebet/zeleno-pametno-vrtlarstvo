
/**
 * GardenTech ESP8266 Firmware
 * 
 * This firmware connects to Wi-Fi, reads data from sensors, 
 * controls a water pump, and communicates with the GardenTech app.
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPUpdateServer.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <EEPROM.h>
#include <DNSServer.h>

// Pins
#define DHTPIN D4
#define MOISTURE_SENSOR A0
#define RELAY_PIN D1
#define RESET_BUTTON D3

// Constants
#define DHTTYPE DHT22
#define AP_SSID "GardenTech-Setup"
#define AP_PASSWORD "gardentech123"
#define EEPROM_SIZE 512
#define DNS_PORT 53
#define WIFI_TIMEOUT 60000  // 60 seconds timeout for WiFi connection

// Operation modes
enum Mode {MANUAL, TIMER, AUTO};
Mode currentMode = MANUAL;

// Global variables
float temperature = 0;
float humidity = 0;
int soilMoisture = 0;
int moistureThreshold = 30;  // Default value
int timerDuration = 5;       // Default value in minutes
unsigned long timerStart = 0;
bool pumpActive = false;
bool autoModeEnabled = false;
String lastWatered = "None";
int batteryLevel = 100;     // Mock value for battery

// Network related
String ssid = "";
String password = "";
bool APMode = true;
IPAddress apIP(192, 168, 4, 1);
DNSServer dnsServer;
unsigned long lastSensorUpdate = 0;

// Server instance
ESP8266WebServer server(80);
ESP8266HTTPUpdateServer httpUpdater;

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("\nГарденТех Фирмвер v1.0");
  
  // Initialize pins
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Pump off by default
  pinMode(RESET_BUTTON, INPUT_PULLUP);
  
  // Initialize EEPROM and read stored configuration
  EEPROM.begin(EEPROM_SIZE);
  readConfig();
  
  // Initialize sensor
  dht.begin();
  
  // Try to connect to WiFi with stored credentials
  if (ssid.length() > 0) {
    connectToWiFi();
  }
  
  // If couldn't connect to WiFi, start AP mode
  if (APMode) {
    setupAccessPoint();
  }
  
  // Set up server routes
  setupServerRoutes();
  
  // Set up OTA update
  httpUpdater.setup(&server, "/update");
  
  // Start the server
  server.begin();
  Serial.println("Сервер стартован");
  
  // Start mDNS responder
  if (MDNS.begin("gardentech")) {
    Serial.println("mDNS респондер стартован: http://gardentech.local");
  }
}

void loop() {
  // Handle DNS requests in AP mode
  if (APMode) {
    dnsServer.processNextRequest();
  }
  
  // Handle client requests
  server.handleClient();
  MDNS.update();
  
  // Read reset button
  if (digitalRead(RESET_BUTTON) == LOW) {
    resetToFactoryDefaults();
  }
  
  // Read sensors every 2 seconds
  if (millis() - lastSensorUpdate > 2000) {
    readSensors();
    lastSensorUpdate = millis();
  }
  
  // Handle timer mode
  if (currentMode == TIMER && pumpActive) {
    if ((millis() - timerStart) > (timerDuration * 60000)) {
      stopPump();
    }
  }
  
  // Handle automatic mode
  if (currentMode == AUTO && autoModeEnabled) {
    if (soilMoisture < moistureThreshold && !pumpActive) {
      startPump();
    } else if (soilMoisture > (moistureThreshold + 10) && pumpActive) {
      stopPump();
    }
  }
}

void readSensors() {
  // Read temperature and humidity
  float newT = dht.readTemperature();
  float newH = dht.readHumidity();
  
  if (!isnan(newT) && !isnan(newH)) {
    temperature = newT;
    humidity = newH;
  }
  
  // Read soil moisture sensor
  int rawValue = analogRead(MOISTURE_SENSOR);
  soilMoisture = map(rawValue, 1023, 0, 0, 100);  // Map value to 0-100%
  
  // In a real implementation, you'd read the battery level here
  batteryLevel = max(0, batteryLevel - random(0, 2));  // Mock battery drain
  
  Serial.println("Сензори очитани: Т=" + String(temperature) + "°C, В=" + 
                String(humidity) + "%, Земља=" + String(soilMoisture) + "%");
}

void startPump() {
  digitalWrite(RELAY_PIN, HIGH);
  pumpActive = true;
  lastWatered = getTimeString();
  Serial.println("Пумпа укључена");
}

void stopPump() {
  digitalWrite(RELAY_PIN, LOW);
  pumpActive = false;
  Serial.println("Пумпа искључена");
}

String getTimeString() {
  // In a real implementation, you'd get the current time from NTP
  return "2025-05-21 " + String(random(10, 24)) + ":" + String(random(10, 60));
}

void connectToWiFi() {
  Serial.println("Повезивање на WiFi: " + ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    // Timeout if can't connect
    if (millis() - startTime > WIFI_TIMEOUT) {
      Serial.println("\nНе могу да се повежем на WiFi. Пребацујем се у AP режим.");
      APMode = true;
      return;
    }
  }
  
  Serial.println("\nПовезано на WiFi");
  Serial.print("IP адреса: ");
  Serial.println(WiFi.localIP());
  APMode = false;
}

void setupAccessPoint() {
  Serial.println("Постављање Access Point-а");
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  
  // Start DNS server
  dnsServer.start(DNS_PORT, "*", apIP);
  
  Serial.print("AP IP адреса: ");
  Serial.println(apIP);
}

void setupServerRoutes() {
  // API endpoints
  server.on("/", HTTP_GET, handleRoot);
  server.on("/api/status", HTTP_GET, handleGetStatus);
  server.on("/api/config", HTTP_GET, handleGetConfig);
  server.on("/api/config", HTTP_POST, handleSetConfig);
  server.on("/api/wifi", HTTP_GET, handleGetWifi);
  server.on("/api/wifi", HTTP_POST, handleSetWifi);
  server.on("/api/scan", HTTP_GET, handleScanWifi);
  server.on("/api/pump", HTTP_POST, handlePumpControl);
  server.on("/api/mode", HTTP_POST, handleSetMode);
  server.on("/api/reset", HTTP_POST, handleReset);
  
  // Handle options for CORS
  server.on("/api/status", HTTP_OPTIONS, handleOptions);
  server.on("/api/config", HTTP_OPTIONS, handleOptions);
  server.on("/api/wifi", HTTP_OPTIONS, handleOptions);
  server.on("/api/scan", HTTP_OPTIONS, handleOptions);
  server.on("/api/pump", HTTP_OPTIONS, handleOptions);
  server.on("/api/mode", HTTP_OPTIONS, handleOptions);
  server.on("/api/reset", HTTP_OPTIONS, handleOptions);
  
  server.onNotFound(handleNotFound);
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  html += "<title>ГарденТех</title>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<style>body{font-family:Arial,sans-serif;margin:20px;text-align:center}";
  html += "h1{color:#388E3C}";
  html += ".container{max-width:400px;margin:0 auto}";
  html += "a{display:block;margin:10px 0;padding:10px;background:#4CAF50;color:white;text-decoration:none;border-radius:4px}</style>";
  html += "</head><body><div class='container'>";
  html += "<h1>ГарденТех Подешавање</h1>";
  if (APMode) {
    html += "<p>Уређај је у режиму подешавања. Повежите се на WiFi мрежу да бисте наставили.</p>";
    html += "<a href='/api/scan'>Скенирај WiFi Мреже</a>";
  } else {
    html += "<p>Уређај је повезан на: " + ssid + "</p>";
    html += "<p>IP адреса: " + WiFi.localIP().toString() + "</p>";
  }
  html += "<p>Температура: " + String(temperature) + "°C<br>";
  html += "Влажност: " + String(humidity) + "%<br>";
  html += "Влажност земљишта: " + String(soilMoisture) + "%</p>";
  html += "<a href='/update'>Ажурирање Фирмвера</a>";
  html += "</div></body></html>";
  server.send(200, "text/html; charset=utf-8", html);
}

void handleGetStatus() {
  DynamicJsonDocument doc(1024);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilMoisture"] = soilMoisture;
  doc["pumpActive"] = pumpActive;
  doc["mode"] = getModeString();
  doc["autoModeEnabled"] = autoModeEnabled;
  doc["batteryLevel"] = batteryLevel;
  doc["lastWatered"] = lastWatered;
  doc["wifiConnected"] = !APMode;
  doc["ssid"] = ssid;
  
  String response;
  serializeJson(doc, response);
  
  sendCorsHeaders();
  server.send(200, "application/json", response);
}

void handleGetConfig() {
  DynamicJsonDocument doc(512);
  doc["mode"] = getModeString();
  doc["timerDuration"] = timerDuration;
  doc["moistureThreshold"] = moistureThreshold;
  doc["autoModeEnabled"] = autoModeEnabled;
  
  String response;
  serializeJson(doc, response);
  
  sendCorsHeaders();
  server.send(200, "application/json", response);
}

void handleSetConfig() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      if (doc.containsKey("timerDuration")) {
        timerDuration = doc["timerDuration"];
      }
      if (doc.containsKey("moistureThreshold")) {
        moistureThreshold = doc["moistureThreshold"];
      }
      if (doc.containsKey("autoModeEnabled")) {
        autoModeEnabled = doc["autoModeEnabled"];
      }
      
      writeConfig();
      
      sendCorsHeaders();
      server.send(200, "application/json", "{\"status\":\"OK\"}");
    } else {
      sendCorsHeaders();
      server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Invalid JSON\"}");
    }
  } else {
    sendCorsHeaders();
    server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"No data\"}");
  }
}

void handleGetWifi() {
  DynamicJsonDocument doc(512);
  doc["apMode"] = APMode;
  doc["ssid"] = ssid;
  
  String response;
  serializeJson(doc, response);
  
  sendCorsHeaders();
  server.send(200, "application/json", response);
}

void handleSetWifi() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      if (doc.containsKey("ssid") && doc.containsKey("password")) {
        ssid = doc["ssid"].as<String>();
        password = doc["password"].as<String>();
        
        writeConfig();
        
        sendCorsHeaders();
        server.send(200, "application/json", "{\"status\":\"OK\",\"message\":\"Повезивање на WiFi...\"}");
        
        // Attempt to connect to the new WiFi network
        delay(1000);
        connectToWiFi();
      } else {
        sendCorsHeaders();
        server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Missing SSID or password\"}");
      }
    } else {
      sendCorsHeaders();
      server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Invalid JSON\"}");
    }
  } else {
    sendCorsHeaders();
    server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"No data\"}");
  }
}

void handleScanWifi() {
  int networksFound = WiFi.scanNetworks();
  DynamicJsonDocument doc(2048);
  JsonArray networks = doc.createNestedArray("networks");
  
  for (int i = 0; i < networksFound; i++) {
    JsonObject network = networks.createNestedObject();
    network["ssid"] = WiFi.SSID(i);
    network["rssi"] = WiFi.RSSI(i);
    network["secured"] = WiFi.encryptionType(i) != ENC_TYPE_NONE;
    network["channel"] = WiFi.channel(i);
  }
  
  String response;
  serializeJson(doc, response);
  
  sendCorsHeaders();
  server.send(200, "application/json", response);
}

void handlePumpControl() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    DynamicJsonDocument doc(256);
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      if (doc.containsKey("active")) {
        bool active = doc["active"];
        if (active) {
          startPump();
          
          if (currentMode == TIMER) {
            timerStart = millis();
          }
        } else {
          stopPump();
        }
        
        sendCorsHeaders();
        server.send(200, "application/json", "{\"status\":\"OK\",\"pumpActive\":" + String(pumpActive ? "true" : "false") + "}");
      } else {
        sendCorsHeaders();
        server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Missing 'active' parameter\"}");
      }
    } else {
      sendCorsHeaders();
      server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Invalid JSON\"}");
    }
  } else {
    sendCorsHeaders();
    server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"No data\"}");
  }
}

void handleSetMode() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    DynamicJsonDocument doc(256);
    DeserializationError error = deserializeJson(doc, body);
    
    if (!error) {
      if (doc.containsKey("mode")) {
        String mode = doc["mode"];
        
        if (mode == "manual") {
          currentMode = MANUAL;
          stopPump();  // Turn off pump when switching to manual
        } else if (mode == "timer") {
          currentMode = TIMER;
          stopPump();  // Turn off pump when switching to timer
        } else if (mode == "auto") {
          currentMode = AUTO;
          stopPump();  // Reset pump state when switching to auto
        } else {
          sendCorsHeaders();
          server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Invalid mode\"}");
          return;
        }
        
        writeConfig();
        
        sendCorsHeaders();
        server.send(200, "application/json", "{\"status\":\"OK\",\"mode\":\"" + getModeString() + "\"}");
      } else {
        sendCorsHeaders();
        server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Missing 'mode' parameter\"}");
      }
    } else {
      sendCorsHeaders();
      server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"Invalid JSON\"}");
    }
  } else {
    sendCorsHeaders();
    server.send(400, "application/json", "{\"status\":\"Error\",\"message\":\"No data\"}");
  }
}

void handleReset() {
  sendCorsHeaders();
  server.send(200, "application/json", "{\"status\":\"OK\",\"message\":\"Ресетовање...\"}");
  delay(1000);
  resetToFactoryDefaults();
}

void handleOptions() {
  sendCorsHeaders();
  server.send(200);
}

void handleNotFound() {
  if (APMode) {
    // In AP mode, redirect all requests to the setup page
    server.sendHeader("Location", "/", true);
    server.send(302, "text/plain", "");
    return;
  }
  
  String message = "Страница није пронађена\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  
  server.send(404, "text/plain", message);
}

String getModeString() {
  switch (currentMode) {
    case MANUAL: return "manual";
    case TIMER: return "timer";
    case AUTO: return "auto";
    default: return "unknown";
  }
}

void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
}

void resetToFactoryDefaults() {
  Serial.println("Ресетовање на фабричка подешавања...");
  
  // Clear EEPROM
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  EEPROM.commit();
  
  // Reset variables
  ssid = "";
  password = "";
  currentMode = MANUAL;
  moistureThreshold = 30;
  timerDuration = 5;
  autoModeEnabled = false;
  
  // Stop pump
  stopPump();
  
  // Restart in AP mode
  APMode = true;
  setupAccessPoint();
}

void readConfig() {
  // EEPROM structure:
  // 0-31: SSID
  // 32-95: Password
  // 96: Operation mode
  // 97: Moisture threshold
  // 98: Timer duration
  // 99: Auto mode enabled
  
  // Read SSID
  ssid = "";
  for (int i = 0; i < 32; i++) {
    char c = EEPROM.read(i);
    if (c == 0) break;
    ssid += c;
  }
  
  // Read password
  password = "";
  for (int i = 32; i < 96; i++) {
    char c = EEPROM.read(i);
    if (c == 0) break;
    password += c;
  }
  
  // Read mode
  byte mode = EEPROM.read(96);
  if (mode >= 0 && mode <= 2) {
    currentMode = (Mode)mode;
  }
  
  // Read moisture threshold
  moistureThreshold = EEPROM.read(97);
  if (moistureThreshold < 10 || moistureThreshold > 90) {
    moistureThreshold = 30;  // Default if out of range
  }
  
  // Read timer duration
  timerDuration = EEPROM.read(98);
  if (timerDuration < 1 || timerDuration > 30) {
    timerDuration = 5;  // Default if out of range
  }
  
  // Read auto mode enabled
  autoModeEnabled = EEPROM.read(99) == 1;
  
  Serial.println("Конфигурација учитана");
}

void writeConfig() {
  // Clear EEPROM first
  for (int i = 0; i < EEPROM_SIZE; i++) {
    EEPROM.write(i, 0);
  }
  
  // Write SSID
  for (unsigned int i = 0; i < ssid.length() && i < 32; i++) {
    EEPROM.write(i, ssid[i]);
  }
  
  // Write password
  for (unsigned int i = 0; i < password.length() && i < 64; i++) {
    EEPROM.write(i + 32, password[i]);
  }
  
  // Write mode
  EEPROM.write(96, (byte)currentMode);
  
  // Write moisture threshold
  EEPROM.write(97, (byte)moistureThreshold);
  
  // Write timer duration
  EEPROM.write(98, (byte)timerDuration);
  
  // Write auto mode enabled
  EEPROM.write(99, autoModeEnabled ? 1 : 0);
  
  EEPROM.commit();
  Serial.println("Конфигурација сачувана");
}
