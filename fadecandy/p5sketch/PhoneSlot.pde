

class PhoneSlot {
  PVector pos =  new PVector();
  boolean on;

  PhoneSlot(float x) {
    pos.x = width * x;
    pos.y = qheight;
  }

  void draw() {
    if (on) {
      rect(pos.x, pos.y, 20, 20);
    }
  }

  void blink() {
  }
}

