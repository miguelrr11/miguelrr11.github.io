class border{
  constructor(sx, sy, ex, ey, id){
    this.start = createVector(sx, sy)
    this.end = createVector(ex, ey)
    this.dist = Infinity
    this.id = id
  }
  
  createCircuit(){
    circuit.push(new border(570, 513, 570, 88),
                 new border(570, 88, 513, 32),
                 new border(513, 32, 108, 32),
                 new border(108, 32, 38, 101),
                 new border(38, 101, 38, 282),
                 new border(38, 282, 100, 343),
                 new border(100, 343, 177, 343),
                 new border(177, 343, 236, 284),
                 new border(236, 284, 236, 230),
                 new border(236, 230, 264, 212),
                 new border(264, 212, 304, 262),
                 new border(304, 262, 304, 297),
                 new border(304, 297, 239, 363),
                 new border(239, 363, 100, 363),
                 new border(100, 363, 38, 430),
                 new border(38, 430, 38, 510),
                 new border(38, 510, 100, 572),
                 new border(308, 540, 512, 572),
                 new border(100, 572, 308, 540),
                 new border(512, 572, 570, 513),
                
                 new border(486, 457, 486, 122),
                 new border(486, 122, 469, 106),
                 new border(469, 106, 141, 106),
                 new border(141, 106, 123, 123),
                 new border(123, 123, 123, 251),
                 new border(123, 251, 137, 264),
                 new border(137, 264, 150, 251),
                 new border(150, 251, 150, 194),
                 new border(150, 194, 217, 128),
                 new border(217, 128, 342, 128),
                 new border(342, 128, 427, 163),
                 new border(427, 163, 462, 247),
                 new border(462, 247, 462, 311),
                 new border(462, 311, 427, 397),
                 new border(427, 397, 334, 438),
                 new border(334, 438, 142, 438),
                 new border(142, 438, 123, 457),
                 new border(123, 457, 142, 476),
                 new border(142, 476, 310, 510),
                 new border(310, 510, 467, 476),
                 new border(467, 476, 486, 457))

}

  createCheckPoints(){
    let loaded = '{"values":[  {    "x": 487,    "y": 381  },  {    "x": 575,    "y": 382  },  {    "x": 483,    "y": 332  },  {    "x": 576,    "y": 331  },  {    "x": 482,    "y": 282  },  {    "x": 578,    "y": 281  },  {    "x": 481,    "y": 232  },  {    "x": 582,    "y": 231  },  {    "x": 481,    "y": 181  },  {    "x": 580,    "y": 180  },  {    "x": 480,    "y": 131  },  {    "x": 582,    "y": 130  },  {    "x": 476,    "y": 120  },  {    "x": 551,    "y": 40  },  {    "x": 462,    "y": 109  },  {    "x": 459,    "y": 23  },  {    "x": 408,    "y": 114  },  {    "x": 406,    "y": 22  },  {    "x": 360,    "y": 110  },  {    "x": 359,    "y": 25  },  {    "x": 310,    "y": 117  },  {    "x": 308,    "y": 24  },  {    "x": 258,    "y": 112  },  {    "x": 257,    "y": 23  },  {    "x": 208,    "y": 116  },  {    "x": 208,    "y": 23  },  {    "x": 157,    "y": 117  },  {    "x": 155,    "y": 23  },  {    "x": 141,    "y": 126  },  {    "x": 54,    "y": 45  },  {    "x": 132,    "y": 139  },  {    "x": 29,    "y": 139  },  {    "x": 134,    "y": 189  },  {    "x": 24,    "y": 188  },  {    "x": 132,    "y": 239  },  {    "x": 27,    "y": 241  },  {    "x": 134,    "y": 246  },  {    "x": 47,    "y": 330  },  {    "x": 139,    "y": 249  },  {    "x": 138,    "y": 349  },  {    "x": 143,    "y": 243  },  {    "x": 222,    "y": 320  },  {    "x": 141,    "y": 238  },  {    "x": 252,    "y": 240  },  {    "x": 155,    "y": 138  },  {    "x": 248,    "y": 236  },  {    "x": 260,    "y": 120  },  {    "x": 260,    "y": 223  },  {    "x": 350,    "y": 116  },  {    "x": 278,    "y": 248  },  {    "x": 440,    "y": 160  },  {    "x": 286,    "y": 262  },  {    "x": 473,    "y": 226  },  {    "x": 287,    "y": 273  },  {    "x": 475,    "y": 316  },  {    "x": 288,    "y": 289  },  {    "x": 436,    "y": 405  },  {    "x": 284,    "y": 298  },  {    "x": 347,    "y": 450  },  {    "x": 271,    "y": 304  },  {    "x": 255,    "y": 453  },  {    "x": 257,    "y": 325  },  {    "x": 209,    "y": 451  },  {    "x": 210,    "y": 349  },  {    "x": 157,    "y": 449  },  {    "x": 163,    "y": 354  },  {    "x": 144,    "y": 455  },  {    "x": 55,    "y": 367  },  {    "x": 145,    "y": 453  },  {    "x": 26,    "y": 459  },  {    "x": 146,    "y": 462  },  {    "x": 44,    "y": 559  },  {    "x": 158,    "y": 464  },  {    "x": 160,    "y": 586  },  {    "x": 213,    "y": 460  },  {    "x": 205,    "y": 583  },  {    "x": 262,    "y": 458  },  {    "x": 257,    "y": 581  },  {    "x": 312,    "y": 456  },  {    "x": 309,    "y": 588  },  {    "x": 354,    "y": 462  },  {    "x": 355,    "y": 587  },  {    "x": 410,    "y": 458  },  {    "x": 408,    "y": 582  },  {    "x": 455,    "y": 454  },  {    "x": 453,    "y": 585  },  {    "x": 462,    "y": 450  },  {    "x": 565,    "y": 555  },  {    "x": 469,    "y": 433  },  {    "x": 584,    "y": 431  }]}'
    let loadedJSON = JSON.parse(loaded)
    let values = loadedJSON.values
    for(let i = 0; i < values.length-1; i += 2){
      checkpoints.push(new border(values[i].x, values[i].y, values[i+1].x, values[i+1].y, i/2))
    }
  }

  
  inter(ls, le) {
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.end.x;
    const y2 = this.end.y;
    const x3 = ls.x;
    const y3 = ls.y;
    const x4 = le.x;
    const y4 = le.y;

    const den = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    const num1 = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
    const num2 = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));

    if (den == 0) {
        return false;
    }

    const t1 = num1 / den;
    const t2 = num2 / den;

    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
        const ix = x1 + (t1 * (x2 - x1));
        const iy = y1 + (t1 * (y2 - y1));
        return createVector(ix, iy);
    } else {
        return false;
    }
}
  
  show(){
    push()
    stroke(0)
    strokeWeight(2)
    line(this.start.x, this.start.y, this.end.x, this.end.y)
    noStroke()
    if(this.id) text(this.id, (this.start.x+this.end.x)/2, (this.start.y+this.end.y)/2)
    pop()
  }
  
}