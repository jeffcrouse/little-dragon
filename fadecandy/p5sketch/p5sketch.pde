import controlP5.*;
import oscP5.*;
import netP5.*;

OPC opc;
OscP5 oscP5;
ControlP5 cp5;

float qheight;
float qwidth;


ArrayList<Particle> particles = new ArrayList<Particle>();
PhoneSlot[] slots = new PhoneSlot[18];



// -------------------------------
void setup()
{
  registerPre(this);
  frameRate(60);
  size(1200, 300);
  opc = new OPC(this, "127.0.0.1", 7890);
  oscP5 = new OscP5(this, 3333);
  cp5 = new ControlP5(this);

  qheight = height / 4.0;
  qwidth = width / 4.0;

  color greenish = color(10, 255, 10);
  color white = color(255, 255, 255);
  color red = color(255, 20, 50);

  slots[0] = new PhoneSlot(0.074, greenish);
  slots[1] = new PhoneSlot(0.1, greenish);
  slots[2] = new PhoneSlot(0.123, greenish);
  slots[3] = new PhoneSlot(0.147, greenish);
  slots[4] = new PhoneSlot(0.171, greenish);
  slots[5] = new PhoneSlot(0.193, greenish);
  slots[6] = new PhoneSlot(0.277, white);
  slots[7] = new PhoneSlot(0.304, white);
  slots[8] = new PhoneSlot(0.329, white);
  slots[9] = new PhoneSlot(0.352, white);
  slots[10] = new PhoneSlot(0.376, white);
  slots[11] = new PhoneSlot(0.399, white);
  slots[12] = new PhoneSlot(0.599, white);
  slots[13] = new PhoneSlot(0.623, red);
  slots[14] = new PhoneSlot(0.647, red);
  slots[15] = new PhoneSlot(0.672, red);
  slots[16] = new PhoneSlot(0.695, red);
  slots[17] = new PhoneSlot(0.72, red);


  //  cp5.addSlider("sliderValue")
  //    .setPosition(100, 50)
  //      .setRange(0, 255)
  //        ;

  rectMode(CENTER);

  opc.ledStrip(0, 240, qwidth, qheight, width / 450, 0, false); //RIGHT TOP
  opc.ledStrip(256, 300, qwidth, qheight*2, width / 540, 0, false); // RIGHT BOTTOM 1
  opc.ledStrip(576, 300, qwidth, qheight*3, width / 540, 0, false); // RIGHT BOTTOM 2

  opc.ledStrip(1024, 240, qwidth*3, qheight, width / 450, 0, true);  // LEFT TOP
  opc.ledStrip(1280, 300, qwidth*3, qheight*2, width / 540, 0, true); // LEFT BOTTOM 1
  opc.ledStrip(1600, 300, qwidth*3, qheight*3, width / 540, 0, true); // LEFT BOTTOM 2
}





// -------------------------------
/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  String addr = theOscMessage.addrPattern();
  String data = theOscMessage.get(0).toString();
  JSONObject json = JSONObject.parse(data);
  println(addr);
  println(data);

  if (addr.equals("/bass_multislider_1")) {
    slots[0].on = json.getInt("on")>1;
  } else if (addr.equals("/bass_keyboard_1")) {
    slots[1].on = json.getInt("on")>1;
  } else if (addr.equals("/bass_keyboard_2")) {
    slots[2].on = json.getInt("on")>1;
  } else if (addr.equals("/bass_keyboard_3")) {
    slots[3].on = json.getInt("on")>1;
  } else if (addr.equals("/bass_keyboard_4")) {
    slots[4].on = json.getInt("on")>1;
  } else if (addr.equals("/bass_keyboard_5")) {
    slots[5].on = json.getInt("on")>1;
  } else if (addr.equals("/bass_tilt_1")) {
    slots[6].on = true;
  } else if (addr.equals("/keys_multislider_1")) {
    slots[7].on = true;
  } else if (addr.equals("/keys_keyboard_1")) {
    slots[8].on = json.getInt("on")>1;
  } else if (addr.equals("/keys_keyboard_2")) {
    slots[9].on = json.getInt("on")>1;
  } else if (addr.equals("/keys_keyboard_3")) {
    slots[10].on = json.getInt("on")>1;
  } else if (addr.equals("/keys_keyboard_4")) {
    slots[11].on = json.getInt("on")>1;
  } else if (addr.equals("/keys_tilt_1")) {
    slots[12].on = true;
  } else if (addr.equals("/drums_button_1")) {
    slots[13].on = json.getInt("press", -1)==1;
  } else if (addr.equals("/drums_button_2")) {
    slots[14].on = json.getInt("press", -1)==1;
  } else if (addr.equals("/drums_button_3")) {
    slots[15].on = json.getInt("press", -1)==1;
  } else if (addr.equals("/drums_button_4")) {
    slots[16].on = json.getInt("press", -1)==1;
  } else if (addr.equals("/drums_button_5")) {
    slots[17].on = json.getInt("press", -1)==1;
  } else if (addr.equals("/drums_tilt_1")) {
    slots[18].on = json.getInt("press", -1)==1;
  } 

  /* get and print the address pattern and the typetag of the received OscMessage */
  //println("### received an osc message with addrpattern "+theOscMessage.addrPattern()+" and typetag "+theOscMessage.typetag());
  //theOscMessage.print();
}

// -------------------------------
void pre() {
  int now = millis();

  for (int i = 0; i < particles.size (); i++) {
    particles.get(i).update();
  }
  for (int i=0; i<slots.length; i++) {
    slots[i].update();
  }
}

// -------------------------------
void draw()
{
  background(0);

  float t = millis() / 2000.0;
  float r = map(noise(t, 0.25), 0.0, 1.0, 150.0, 255.0);
  float g = map(noise(t, 0.75), 0.0, 1.0, 0.0, 100.0);
  float b = map(noise(t, 1.0), 0.0, 1.0, 0.0, 100.0);
  fill(r, g, b);

  for (int i=0; i<slots.length; i++) {
    slots[i].draw();
  }


  for (int i = 0; i < particles.size (); i++) {
    particles.get(i).draw();
  }

  fill(255, 100, 100);
  rect(mouseX, height/2, 22, height);

  fill(255);
  textSize(12);

  float x = mouseX/(float)width;
  text(x, mouseX, 20); 
  // Draw each frame here
}


// -------------------------------
void keyPressed() {
  if (key=='p') {
    particles.add( new Particle() );
  }
}

