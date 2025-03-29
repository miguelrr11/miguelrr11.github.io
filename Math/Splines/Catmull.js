class Catmull{
    constructor(curves){
        this.curves = curves ? curves : this.loadFromData()
    }

    loadFromData(){
        let curves = [];
        for (let i = 0; i < data.length; i++) {
            let prev = i == 0 ? createVector(data[i].p0.x, data[i].p0.y) : curves[i-1].p1
            if(i == data.length - 1){
                let curve = {
                    p0: prev,
                    v0: createVector(data[i].p1.x, data[i].p1.y),
                    v1: createVector(data[i].p2.x, data[i].p2.y),
                    p1: createVector(data[i].p3.x, data[i].p3.y),
                    i: i
                };
                curves.push(curve);
                continue
            }
            let curve = {
                p0: prev,
                v0: createVector(data[i].p2.x, data[i].p2.y),
                v1: createVector(data[i+1].p2.x, data[i+1].p2.y),
                p1: createVector(data[i].p3.x, data[i].p3.y),
                i: i
            };
            curves.push(curve);
        }
        return curves;
    }

    mirrorControlPoint(curveIndex, pointIndex) {
        if (pointIndex === 1) {
            if (curveIndex > 0) {
                let dragged = this.curves[curveIndex].v0;
                this.curves[curveIndex - 1].v1 = dragged;
            }
        } 
        else if (pointIndex === 2) {
            if (curveIndex < this.curves.length - 1) { 
                let dragged = this.curves[curveIndex].v1;
                this.curves[curveIndex + 1].v0 = dragged;
            }
        }
    }

    show(){
        for(let curve of this.curves) this.drawControlLines(curve)
        for(let curve of this.curves) this.drawCurve(curve)
        for(let curve of this.curves) this.drawControlPoints(curve)
    }


    drawCurve(curve){
        let minVal = curve.i / this.curves.length;
        let maxVal = (curve.i + 1) / this.curves.length;
        let points = this.calculatePoints(curve);
        strokeWeight(4)
        for(let i = 1; i < points.length; i++){
            let ratio = map(i, 0, points.length, minVal, maxVal);
            stroke(lerpColor(col2, col3, ratio));
            line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
        }
    }
    
    drawControlPoints(curve){
        let p0 = curve.p0
        let p1 = curve.p1
        strokeWeight(2.5);
        stroke(0)
        fill(lerpColor(col2, col3, (curve.i) / this.curves.length));
        ellipse(p0.x, p0.y, 13);
        stroke(115)
        strokeWeight(10)
        strokeWeight(2.5)
        fill(lerpColor(col2, col3, (curve.i + 1) / this.curves.length));
        stroke(0)
        ellipse(p1.x, p1.y, 13);
    }

    drawCurveUsingP5(){
        for(let cur of this.curves){
            let x1 = cur.v0.x
            let y1 = cur.v0.y
            let x2 = cur.p0.x
            let y2 = cur.p0.y
            let x3 = cur.p1.x
            let y3 = cur.p1.y
            let x4 = cur.v1.x
            let y4 = cur.v1.y
            stroke(255);
            strokeWeight(1)
            noFill()
            curve(x1, y1, x2, y2, x3, y3, x4, y4)
        }
    }
    
    drawControlLines(curve){
        let p0 = curve.p0
        let v0 = curve.v0
        let v1 = curve.v1
        let p1 = curve.p1
        let newCol = color(col4.levels[0], col4.levels[1], col4.levels[2], 100)
        stroke(newCol)
        strokeWeight(2);
        line(p0.x, p0.y, v0.x, v0.y);
        line(p1.x, p1.y, v1.x, v1.y);
        drawArrowTip(v0.x, v0.y, atan2(p0.y - v0.y, p0.x - v0.x), 10);
        drawArrowTip(v1.x, v1.y, atan2(p1.y - v1.y, p1.x - v1.x), 10);
        stroke(40)
        //line(v0.x, v0.y, v1.x, v1.y);
    }
    
    calculatePoints(curve) {
        let p0 = curve.p0; 
        let p1 = curve.p1; 
        
        let v0 = p5.Vector.mult(p5.Vector.sub(p1, curve.v0), 0.5); 
        let v1 = p5.Vector.mult(p5.Vector.sub(curve.v1, p0), 0.5); 
        
        let index = curve.i;
        let points = [];
        let tMax = (u * this.curves.length) - index;
        tMax = Math.max(0, Math.min(tMax, 1));
    
        let step = 0.001;
        for (let t = 0; t <= tMax; t += step) {
            let tCubed = t * t * t;
            let tSquared = t * t;
            
            let h00 = 2 * tCubed - 3 * tSquared + 1;
            let h10 = tCubed - 2 * tSquared + t;
            let h01 = -2 * tCubed + 3 * tSquared;
            let h11 = tCubed - tSquared;
            
            let x = h00 * p0.x + h10 * v0.x + h01 * p1.x + h11 * v1.x;
            let y = h00 * p0.y + h10 * v0.y + h01 * p1.y + h11 * v1.y;
            points.push(createVector(x, y));
        }
        return points;
    }
    
      
}