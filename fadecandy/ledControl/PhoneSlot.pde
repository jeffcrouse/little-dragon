

class PhoneSlot {
  PVector pos =  new PVector();
  boolean on;
  color myColor;
  
  
  PhoneSlot(float x, color c) {
    pos.x = width * x;
    pos.y = qheight;
    myColor = c;
  }

  void update(int deltaTime) {
    
  }
  
  void draw() {
    if (on) {
      fill(myColor);
        rectMode(CENTER);
      rect(pos.x, pos.y, 20, 20);
    }
  }

  void blink() {
  }
}
