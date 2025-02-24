// Cell_2.js

// Ensure Cell.js is loaded before this file

class Cell_2 extends Cell {
    constructor(x, y, material, hp, illuminated, rnd) {
      super(x, y, material, hp, illuminated, rnd);
      // Define biome-specific color properties
      this.colSuelo = colSueloBioma2;
      this.colRoca = colRocaBioma2;
      this.colOscuridad = colOscuridad2;
    }
    
    showLight(lightGrid) {
        push();
        rectMode(CENTER);
        translate(this.x * cellPixelSize + cellPixelSize / 2, this.y * cellPixelSize + cellPixelSize / 2);
        noStroke();
        let light = lightGrid[this.x][this.y].light;
        let visible = lightGrid[this.x][this.y].visible;
        let sensor = lightGrid[this.x][this.y].sensor;
        let col = color(this.colOscuridad);
        col.setAlpha(255 - light * 255);
        fill(col);
        if (!visible) fill(this.colOscuridad);
        if (sensor && !visible) {
          col.setAlpha(200);
          fill(col);
        }
        rect(0, 0, cellPixelSize, cellPixelSize);
        pop();
      }

    // Override the biome-specific suelo rendering
    showSuelo() {
      fill(this.colSuelo);
      rect(0, 0, cellPixelSize, cellPixelSize);
      if (this.rnd > 0.85 && this.hp === 0) showGrass();
      if (this.rnd < -0.85 && this.hp === 0) showPebbles(this.rnd);
    }
  }
  