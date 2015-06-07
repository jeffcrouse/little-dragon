import oscP5.*;
import netP5.*;

OPC opc;
OscP5 oscP5;


void setup()
{
  size(900, 300);
  opc = new OPC(this, "127.0.0.1", 7890);
  oscP5 = new OscP5(this, 3333);

  rectMode(CENTER);

  float qheight = height/4;
  float qwidth = width/4;


  opc.ledStrip(0, 240, (width/4)*1, qheight, width / 460, 0, false); //RIGHT TOP
  opc.ledStrip(240, 300, (width/4)*1, qheight*2, width / 600, 0, false); // RIGHT BOTTOM 1
  opc.ledStrip(540, 300, (width/4)*1, qheight*3, width / 600, 0, false); // RIGHT BOTTOM 2

  opc.ledStrip(840, 240, (width/4)*3, qheight, width / 460, 0, true);  // LEFT TOP
  opc.ledStrip(1080, 300, (width/4)*3, qheight*2, width / 600, 0, true); // LEFT BOTTOM 1
  opc.ledStrip(1380, 300, (width/4)*3, qheight*3, width / 600, 0, true); // LEFT BOTTOM 2
}

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  string addr = theOscMessage.addrPattern();
  JSONObject json = new JSONObject();
  json.parse( theOscMessage );
  
  if(addr == "/keys_keyboard_3") {
    
  } else if( addr == "/drum_button_1") {
    
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

  rect(mouseX, height/2, 20, height);
  // Draw each frame here
}

