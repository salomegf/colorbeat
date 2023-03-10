#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>  // Required for 16 MHz Adafruit Trinket
#endif

#define LED_PIN 6
#define NUMPIXELS 24
#define MIC_PIN A0
#define SENSITIVITY 300
#define MINVAL 60

Adafruit_NeoPixel pixels(NUMPIXELS, LED_PIN, NEO_GRB + NEO_KHZ800);
#define DELAYVAL 500

float level;
float nbPixels;
float brightness;
int valueMic;

const int colors = 3;
int potentis[] = { A1, A2, A3 };
int values[] = { 0, 0, 0 };

const int buttonLight = 7;
int btnLightState = 0;
int prevBtnLightState = 0;

const int buttonSound = 5;
int btnSoundState = 0;
int prevBtnSoundState = 0;

bool modeBrightness = false;
bool modeMp3 = false;

void setup() {
  Serial.begin(9600);
  Serial.println("Début de mon code");
  pixels.begin();
  for (int i = 0; i < colors; i++) {
    pinMode(potentis[i], INPUT);
  }
  pinMode(buttonLight, INPUT);
  pinMode(MIC_PIN, INPUT);
}

void loop() {
  // lecture des potentiomètres
  for (int i = 0; i < colors; i++) {
    values[i] = map(analogRead(potentis[i]), 0, 1023, 0, 255);
  }

  // modes de son
  btnSoundState = digitalRead(buttonSound);
  if (btnSoundState == 1 && btnSoundState != prevBtnSoundState) {
    modeMp3 = !modeMp3;
  }
  prevBtnSoundState = btnSoundState;

  if (modeMp3) {
    if (Serial.available() > 0) {
      String s = Serial.readStringUntil('\n');
      int delim = s.indexOf(',');
      brightness = s.substring(0, delim).toInt();
    }
    nbPixels = map(brightness, 0, 255, 0, NUMPIXELS);
  } else {
    valueMic = analogRead(MIC_PIN);
    if (valueMic > SENSITIVITY) {
      valueMic = SENSITIVITY;
    }
    if (valueMic < MINVAL) {
      valueMic = 0;
    }
    brightness = map(valueMic, 0, 300, 0, 255);
    nbPixels = map(valueMic, 0, 300, 0, NUMPIXELS);
  }

  // modes de lumière
  btnLightState = digitalRead(buttonLight);
  if (btnLightState == 1 && btnLightState != prevBtnLightState) {
    modeBrightness = !modeBrightness;
  }
  prevBtnLightState = btnLightState;

  if (modeBrightness) {
    changeBrightness(brightness);
  } else {
    pixels.clear();
    changeNbLeds(nbPixels);
  }

  // envoi au JS
  Serial.println((String)modeBrightness + "," + modeMp3);
}

// mode de lumière "intensité"
void changeBrightness(int brightness) {
  for (int i = 0; i < NUMPIXELS; i++) {
    pixels.setPixelColor(i, values[0], values[1], values[2]);
    pixels.setBrightness(brightness);
    pixels.show();
  }
}

// mode de lumière "linéaire"
void changeNbLeds(int nbPixelsAllumes) {
  pixels.setBrightness(255);
  for (int i = 0; i < nbPixelsAllumes; i++) {
    pixels.setPixelColor(i, values[0], values[1], values[2]);
    pixels.show();
  }
}