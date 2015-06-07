

class Particle {
  PVector pos = new PVector();
  PVector vel = new PVector();
  color myColor;
  
  Particle() {
    myColor = color(random(200, 255), random(100), random(100));
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


