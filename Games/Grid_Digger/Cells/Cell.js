// Cell.js

let maxTam = cellPixelSize;
let minTam = cellPixelSize * 0.3;

class Cell {
  constructor(x, y, material, hp, illuminated, rnd) {
    this.x = x;
    this.y = y;
    this.material = material !== undefined ? material : 0;
    this.hp = hp !== undefined ? hp : maxHealthCell;
    this.illuminated = illuminated !== undefined ? illuminated : false;
    this.rnd = rnd !== undefined ? rnd : (Math.random() * 2 - 1).toFixed(2);
  }

  hit(animX, animY) {
    if (this.hp > 0) this.hp--;
    let anim;
    switch (this.material) {
      case 0:
        anim = 'mining';
        break;
      case 1:
        anim = 'miningMat1';
        break;
      case 2:
        anim = 'miningMat2';
        break;
      case 3:
        anim = 'miningMat3';
        break;
    }
    anims.addAnimation(
      animX * cellPixelSize + cellPixelSize / 2,
      animY * cellPixelSize + cellPixelSize / 2,
      anim
    );
    if (this.hp === 0) this.material = 0;
  }

  isMaterial() {
    return this.material !== 0;
  }

  convertIntoAir() {
    this.hp = 0;
  }

  illuminate() {
    if (this.hp === 0) this.illuminated = true;
  }

  translateToCenterMat() {
    let off = this.rnd * 2;
    translate(
      off + cellPixelSize / 2 + this.x * cellPixelSize,
      off + cellPixelSize / 2 + this.y * cellPixelSize
    );
  }

  showMat() {
    if (this.material === 0 || this.hp === 0) return;
    let off = this.rnd * 2;
    let col = colors[this.material - 1];
    let tam = map(this.hp, 0, maxHealthCell, minTam, cellPixelSize * 0.4);
    push();
    rectMode(CENTER);
    noStroke();
    fill(col);
    this.translateToCenterMat();
    rotate(off);
    if (this.material === 1) {
      ellipse(0, 0, tam, tam);
    }
    if (this.material === 2) {
      square(0, 0, tam);
    }
    if (this.material === 3) {
      drawTriangle(tam);
    }
    pop();
  }

  

  // The default showBasic() method calls the biome-specific showSuelo().
  showBasic() {
    push();
    rectMode(CENTER);
    translate(this.x * cellPixelSize + cellPixelSize / 2, this.y * cellPixelSize + cellPixelSize / 2);
    noStroke();
    let tam = cellPixelSize;
    this.showSuelo();
    if (this.hp > 0) {
      fill(this.colRoca); // set by the child class
      tam = map(this.hp, 0, maxHealthCell, minTam, maxTam);
      rect(0, 0, tam, tam);
    }
    pop();
  }

  // The show() method is common to both children.
  show(lightGrid) {
    this.showBasic();
    this.showMat();
    this.showLight(lightGrid);
  }

  showDebug() {
    this.showMat();
  }

}

// Global helper functions (common to both biomes)
function drawTriangle(tam) {
  beginShape();
  vertex(-tam / 2, -tam / 2);
  vertex(tam / 2, -tam / 2);
  vertex(0, tam / 2);
  endShape();
}

function showGrass() {
  push();
  translate(-cellPixelSize / 2, -cellPixelSize / 2);
  stroke("#365B64");
  strokeWeight(1.5);
  let p1 = createVector(0.25, 0.5);
  let p2 = createVector(0.35, 0.8);
  let p3 = createVector(0.5, 0.3);
  let p4 = createVector(0.5, 0.7);
  let p5 = createVector(0.67, 0.7);
  let p6 = createVector(0.76, 0.4);
  line(p1.x * cellPixelSize, p1.y * cellPixelSize, p2.x * cellPixelSize, p2.y * cellPixelSize);
  line(p3.x * cellPixelSize, p3.y * cellPixelSize, p4.x * cellPixelSize, p4.y * cellPixelSize);
  line(p5.x * cellPixelSize, p5.y * cellPixelSize, p6.x * cellPixelSize, p6.y * cellPixelSize);
  pop();
}

function showPebbles(rnd) {
  push();
  rotate(rnd * 10);
  translate(-cellPixelSize / 2, -cellPixelSize / 2);
  fill("#2C2D47");
  noStroke();
  let p1 = createVector(0.3, 0.5);
  let p2 = createVector(0.5, 0.75);
  let p3 = createVector(0.75, 0.4);
  ellipse(p1.x * cellPixelSize, p1.y * cellPixelSize, cellPixelSize * 0.16);
  ellipse(p2.x * cellPixelSize, p2.y * cellPixelSize, cellPixelSize * 0.18);
  ellipse(p3.x * cellPixelSize, p3.y * cellPixelSize, cellPixelSize * 0.2);
  pop();
}
