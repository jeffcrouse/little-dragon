

class PhoneSlot {
  PVector pos =  new PVector();
  boolean on;
  color myColor;
  float alpha = 255;


  PhoneSlot(float x, color c) {
    pos.x = width * x;
    pos.y = qheight;
    myColor = c;
  }

  void update(int deltaTime) {
    alpha -= (alpha / 20.0);
  }

  void draw() {
    fill(myColor, (on ? 255 : alpha));
    rectMode(CENTER);
    rect(pos.x, pos.y, 20, 20);
  }

  void blink() {
    alpha = 255;
  }
}

