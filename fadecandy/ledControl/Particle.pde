

class Particle {
  PVector pos = new PVector();
  PVector vel = new PVector();
  color myColor;

  Particle() {
    int r = (int)random(0, particleColors.length);
    myColor = particleColors[r];
    pos.set(0, qheight*2.5);
    vel.x = 2.5;
  }

  void update(int deltaTime) {
    vel.x = particleSpeed;
    pos.add( vel );
  }

  void draw() {
    fill(myColor);
    rectMode(CENTER);
    rect(pos.x, pos.y, particleWidth, 100);
  }
}

