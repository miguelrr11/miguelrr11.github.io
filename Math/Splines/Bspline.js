class Bspline {
    constructor(controlPoints){
        this.controlPoints = controlPoints ? controlPoints : this.loadFromData();
        this.points = [];
    }

    loadFromData(){
        let controlPoints = [];
        for (let i = 0; i < data.length; i++) {
                controlPoints.push(createVector(data[i].p0.x, data[i].p0.y),
            );
        }
        return controlPoints;
    }

    mirrorControlPoint(curveIndex, pointIndex) {
        if (pointIndex === 1) {
            if (curveIndex > 0) {
                let dragged = this.controlPoints[curveIndex].v0;
                this.controlPoints[curveIndex - 1].v1 = dragged;
            }
        } 
        else if (pointIndex === 2) {
            if (curveIndex < this.controlPoints.length - 1) { 
                let dragged = this.controlPoints[curveIndex].v1;
                this.controlPoints[curveIndex + 1].v0 = dragged;
            }
        }
    }

    getPoints(){
        this.points = []
        for(let i = 0; i < this.controlPoints.length - 3; i++) {
            this.points.push(...this.calculatePoints(this.controlPoints[i], this.controlPoints[i + 1], this.controlPoints[i + 2], this.controlPoints[i + 3], i));
        }
        return this.points
    }

    drawControlFading(t){
        this.drawControlLines(t*255)
        this.drawControlPoints(t*255)
    }

    show(){
        this.points = []
        this.drawControlLines(curve);
        for(let i = 0; i < this.controlPoints.length - 3; i++) {
            this.points.push(...this.drawCurve(this.controlPoints[i], this.controlPoints[i + 1], this.controlPoints[i + 2], this.controlPoints[i + 3], i));
        }
        this.drawControlPoints(curve);
    }

    drawCurve(p0, p1, p2, p3, i){
        let points = this.calculatePoints(p0, p1, p2, p3, i);
        strokeWeight(4);
        for(let i = 1; i < points.length; i++){
            stroke(col2);
            line(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
        }
        return points
    }
    
    drawControlPoints(trans = 255){
        stroke(255, trans)
        fill(50, trans)
        strokeWeight(2.5);
        for(let cp of this.controlPoints){
            ellipse(cp.x, cp.y, 11.5);
        }
    }
    
    drawControlLines(trans = 255){
        stroke(130, trans);
        strokeWeight(1.5);
        for(let i = 1; i < this.controlPoints.length; i++){
            let p0 = this.controlPoints[i - 1];
            let p1 = this.controlPoints[i];
            line(p0.x, p0.y, p1.x, p1.y);
        }
    }
    
    // Calculates and returns an array of points along the B-spline segment.
    calculatePoints(p0, p1, p2, p3, index) {
        let points = [];
        let tMax = (u * this.controlPoints.length) - index;
        tMax = Math.max(0, Math.min(tMax, 1));
        for (let t = 0; t < tMax; t += 0.01) {
            let t2 = t * t;
            let t3 = t2 * t;
            
            // Basis functions
            let b0 = (-t3 + 3*t2 - 3*t + 1) / 6;
            let b1 = (3*t3 - 6*t2 + 4) / 6; 
            let b2 = (-3*t3 + 3*t2 + 3*t + 1) / 6;  // Note: Equivalent to (-3*t3+3*t2+t+1)/6 if simplified differently.
            let b3 = (t3) / 6;
            
            // Compute the point on the curve by summing weighted control points
            let x = p0.x * b0 + p1.x * b1 + p2.x * b2 + p3.x * b3;
            let y = p0.y * b0 + p1.y * b1 + p2.y * b2 + p3.y * b3;
            
            points.push(createVector(x, y));
        }
        
        return points;
    }
    
    
}
