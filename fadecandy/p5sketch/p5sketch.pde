// This is an empty Processing sketch with support for Fadecandy.

OPC opc;

void setup()
{
  size(600, 300);
  opc = new OPC(this, "127.0.0.1", 7890);


  rectMode(CENTER);
  opc.ledStrip(0, 240, (width/4)*1, height/2, width / 480, 0, false); // top 1
  opc.ledStrip(576, 240, (width/4)*3, height/2, width / 480, 0, true);  // top 2
  
  opc.ledStrip(240, 300, width/2, (height/4)*3, width / 350, 0, false); // bottom 1
  opc.ledStrip(816, 300, width/2, (height/4)*3.5, width / 350, 0, true); // bottom 2
}

void draw()
{
  background(0);

  fill(255, 0, 0);

  rect(mouseX, height/2, 10, height);
  // Draw each frame here
}

