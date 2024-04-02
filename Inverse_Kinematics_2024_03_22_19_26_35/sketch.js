const WIDTH = 700
const HEIGHT = 500

let seg1
let seg2

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0)
  
                   //x,  y,  angle, length
  seg1 = new Segment(350, 300, 0, 100)
  seg2 = new Segment(seg1.b.x, seg1.b.y, 0, 100)
  
}

function draw() {
  background(0)
  
  seg1.follow(mouseX, mouseY)
  seg1.update()
  seg2.follow(seg1.b.x, seg1.b.y)
  seg2.update()
  seg2.show()
  seg1.show()
}