import controlP5.*;
import oscP5.*;
import netP5.*;

OPC opc;
OscP5 oscP5;
ControlP5 cp5;

float qheight;
float qwidth;

boolean[] bass = new boolean[5];
boolean[] keys = new boolean[5];
boolean[] drums = new boolean[5];

ArrayList<Particle> particles = new ArrayList<Particle>();

void setup()
{
  frameRate(60);
  size(1200, 300);
  opc = new OPC(this, "127.0.0.1", 7890);
  oscP5 = new OscP5(this, 3333);
  cp5 = new ControlP5(this);


  cp5.addSlider("sliderValue")
    .setPosition(100, 50)
      .setRange(0, 255)
        ;

  rectMode(CENTER);

  qheight = height/4.0;
  qwidth = width/4.0;

  opc.ledStrip(0, 240, qwidth*1, qheight, width / 450, 0, false); //RIGHT TOP
  opc.ledStrip(240, 300, qwidth*1, qheight*2, width / 540, 0, false); // RIGHT BOTTOM 1
  opc.ledStrip(540, 300, qwidth*1, qheight*3, width / 540, 0, false); // RIGHT BOTTOM 2

  opc.ledStrip(840, 240, qwidth*3, qheight, width / 450, 0, true);  // LEFT TOP
  opc.ledStrip(1080, 300, qwidth*3, qheight*2, width / 540, 0, true); // LEFT BOTTOM 1
  opc.ledStrip(1380, 300, qwidth*3, qheight*3, width / 540, 0, true); // LEFT BOTTOM 2
}

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  String addr = theOscMessage.addrPattern();
  String data = theOscMessage.get(0).toString();
  JSONObject json = JSONObject.parse(data);

  if ( addr.equals("/bass_keyboard_1") ) {
    bass[0] = json.getInt("on") > 0;
  } else if ( addr.equals("/bass_keyboard_2") ) {
    bass[1] = json.getInt("on") > 0;
  } else if ( addr.equals("/bass_keyboard_3") ) {
    bass[2] = json.getInt("on") > 0;
  } else if ( addr.equals("/bass_keyboard_4") ) {
    bass[3] = json.getInt("on") > 0;
  }


  /* get and print the address pattern and the typetag of the received OscMessage */
  //println("### received an osc message with addrpattern "+theOscMessage.addrPattern()+" and typetag "+theOscMessage.typetag());
  //theOscMessage.print();
}

void draw()
{
  background(0);

  float t = millis() / 2000.0;
  float r = map(noise(t, 0.25), 0.0, 1.0, 150.0, 255.0);
  float g = map(noise(t, 0.75), 0.0, 1.0, 0.0, 100.0);
  float b = map(noise(t, 1.0), 0.0, 1.0, 0.0, 100.0);
  fill(r, g, b);

  if (bass_keyboard_2) {
    println("bass_keyboard_2");
    rect(100, qheight, 20, 20);
  }

  rect(mouseX, height/2, 20, height);
  // Draw each frame here
}

