class Catmull{
    constructor(curves){
        this.curves = curves ? curves : this.loadFromData()
        this.points = []
        this.draggingPoints = []
    }

    release(){
        this.draggingPoints = []
    }

    move(){
        if(this.draggingPoints.length > 0){
            for(let p of this.draggingPoints){
                p.x = mouseX;
                p.y = mouseY;
            }
            return
        }
        else{
            for(let j = 0; j < this.curves.length; j++){
                let curve = this.curves[j]
                let points = [curve.p0, curve.v0, curve.v1, curve.p1];
                for (let i = 0; i < points.length; i++) {
                    let point = points[i]
                    if (dist(mouseX, mouseY, point.x, point.y) < 15) {
                        this.draggingPoints.push(point);
                        break;
                    }
                }
            }
            for(let p of this.draggingPoints){
                p.x = mouseX;
                p.y = mouseY;
            }
        }
    }

    createPoint(){
        let prevCurve = this.curves[this.curves.length - 1]
        let newv1 = p5.Vector.sub(createVector(mouseX, mouseY), prevCurve.p1).mult(2).add(prevCurve.p1)
        let curve = {
            p0: prevCurve.p1,
            v0: prevCurve.v1,
            v1: newv1,
            p1: createVector(mouseX, mouseY),
            i: this.curves.length
        };
        this.curves.push(curve);
        this.mirrorDistancesControlPoints()
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
            if(i == data.length - 2){
                let curve = {
                    p0: prev,
                    v0: createVector(data[i].p2.x, data[i].p2.y),
                    v1: createVector(data[i+1].p1.x, data[i+1].p1.y),
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

    getPoints(){
        this.points = []
        for(let curve of this.curves) {
            this.points.push(...this.calculatePoints(curve));
        }
        return this.points
    }

    drawControlFading(t){
        for(let curve of this.curves) this.drawControlLines(curve, t*255)
        for(let curve of this.curves) this.drawControlPoints(curve, t*255)
    }

    show(){
        this.points = []
        for(let curve of this.curves) this.drawControlLines(curve)
        for(let curve of this.curves){ 
            this.points.push(...this.drawCurve(curve))
        }
        for(let curve of this.curves) this.drawControlPoints(curve)
    }


    drawCurve(curve){
        let points = this.calculatePoints(curve);
        strokeWeight(4)
        stroke(col2)
        for(let i = 1; i < points.length; i++){
            line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
        }
        return points
    }
    
    drawControlPoints(curve, trans = 255){
        stroke(255, trans)
        fill(50, trans)
        strokeWeight(2.5);
        ellipse(curve.p0.x, curve.p0.y, 11.5);
        ellipse(curve.p1.x, curve.p1.y, 11.5);
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
    
    drawControlLines(curve, trans = 255){
        stroke(115, trans)
        strokeWeight(1.5);
        drawDashedLine(curve.p0.x, curve.p0.y, curve.v0.x, curve.v0.y);
        drawDashedLine(curve.p1.x, curve.p1.y, curve.v1.x, curve.v1.y);
        let p1 = curve.v0
        let p2 = curve.v1
        stroke(70, trans)
        fill(70, trans)
        strokeWeight(2.5);
        ellipse(p1.x, p1.y, 11.5);
        ellipse(p2.x, p2.y, 11.5);
        // push()
        // fill(255)
        // noStroke()
        // textSize(12)
        // text('v0', p1.x + 10, p1.y - 10)
        // text('v1', p2.x + 10, p2.y - 10)
        // pop()
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