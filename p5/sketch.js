console.log("sketch");

let serial; // variable to hold an instance of the serialport library
let portName = "/dev/tty.usbmodem14101"; // fill in your serial port name here

let width = window.innerWidth;
let height = window.innerHeight;

const beats = ['beat1.mp3', 'beat2.mp3', 'beat3.mp3'] // ajouter ici le nom des nouveaux morceaux
let choice = 0;
let sounds = [];
let amplitude;

let msg = [];
let modeBrightness, modeMp3;

let poppinsBlack, poppinsLight;
let angle;

let select;

function preload() {
  for (let i = 0; i < beats.length; i++) {
    sounds.push(loadSound(`assets/music/${beats[i]}`));
  }
  poppinsBlack = loadFont('assets/fonts/Poppins-Black.ttf');
  poppinsLight = loadFont('assets/fonts/Poppins-Light.ttf');
  img = loadImage('assets/img/image.svg');
}

function setup() {
  console.log("Setup sketch");
  createCanvas(width, height);

  // serial
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on("list", printList); // set a callback function for the serialport list event
  serial.on("connected", serverConnected); // callback for connecting to the server
  serial.on("open", portOpen); // callback for the port opening
  serial.on("data", serialEvent); // callback for when new data arrives
  serial.on("error", serialError); // callback for errors
  serial.on("close", portClose); // callback for the port closing

  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port

  let cnv = createCanvas(width, height);
  cnv.mouseClicked(togglePlay);
  amplitude = new p5.Amplitude();
  frameRate(30);

  angle = 0;

  select = createSelect();
  for (let i = 0; i < beats.length; i++) {
    select.option(beats[i], i)
  }
  select.changed(selectChanged);
}

function touchStarted() {
  getAudioContext().resume();
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (let i = 0; i < portList.length; i++) {
    console.log(i + ": " + portList[i]);
  }
}

function serverConnected() {
  console.log("connected to server.");
}

function portOpen() {
  console.log("the serial port is opened.");
}

function serialEvent() {
  msg = split(serial.readLine(), ',');
}

function serialError(err) {
  console.log("Something went wrong with the serial port. " + err);
}

function portClose() {
  console.log("The serial port is closed.");
}

function togglePlay() {
  if (sounds[choice].isPlaying()) {
    sounds[choice].pause();
  } else {
    sounds[choice].loop();
    amplitude = new p5.Amplitude();
    amplitude.setInput(sounds[choice]);
  }
}

function draw() {
  clear();

  background('#191919');
  fill('#fafafa');

  textFont(poppinsBlack);
  textSize(50);
  text("COLORBEAT", 40, 70);

  textFont(poppinsLight);
  textSize(20);
  text('tap to play', 40, 100);

  textFont(poppinsLight);
  textSize(15);
  fill(250, 250, 250, 127);
  text('un projet par adriana, héloïse & salomé', 40, height - 30);

  textSize(20);
  fill('#fafafa');
  if (modeBrightness) {
    text('intensité', width - 150, height - 70);
    fill(250, 250, 250, 127);
    text('linéaire', width - 330, height - 70);
    fill(255, 0, 61);
    circle(width - 190, height - 75, 20);
    fill(255, 0, 61, 127);
    circle(width - 220, height - 75, 20);
  } else {
    text('linéaire', width - 330, height - 70);
    fill(250, 250, 250, 127);
    text('intensité', width - 150, height - 70);
    fill(255, 0, 61, 127);
    circle(width - 190, height - 75, 20);
    fill(255, 0, 61);
    circle(width - 220, height - 75, 20);
  }

  fill('#fafafa');

  if (modeMp3) {
    text('MP3', width - 150, height - 30);
    fill(250, 250, 250, 127);
    text('microphone', width - 380, height - 30);
    fill(250, 250, 250);
    circle(width - 190, height - 35, 20);
    fill(250, 250, 250, 127);
    circle(width - 220, height - 35, 20);
  } else {
    text('microphone', width - 380, height - 30);
    fill(250, 250, 250, 127);
    text('MP3', width - 150, height - 30);
    circle(width - 190, height - 35, 20);
    fill(250, 250, 250);
    circle(width - 220, height - 35, 20);
  }

  let level = amplitude.getLevel();
  let size = map(level, 0, 1, 300, 400);
  noStroke();

  translate(width / 2, height / 2);
  if (sounds[choice].isPlaying()) {
    angle++
  }
  angleMode(DEGREES);
  rotate(angle);
  image(img, 0 - size / 2, 0 - size / 2, size, size);

  let volBrightness = map(level, 0, 1, 0, 255);
  let volume_string = volBrightness + "\n";
  if (sounds[choice].isPlaying()) {
    serial.write(volume_string);
    //console.log(volume_string)
  }

  if (msg.length !== 1) {
    modeBrightness = parseInt(msg[0])
    modeMp3 = parseInt(msg[1])
  }
}

function selectChanged() {
  if (sounds[choice].isPlaying()) {
    sounds[choice].pause();
    choice = select.value();
    sounds[choice].loop();
    amplitude = new p5.Amplitude();
    amplitude.setInput(sounds[choice]);
  } else {
    choice = select.value()
  }
}