class Bezier{
    constructor(curves){
        this.curves = curves ? curves : this.loadFromData()
    }

    loadFromData(){
        let curves = [];
        for (let i = 0; i < data.length; i++) {
            let prev = i == 0 ? createVector(data[i].p0.x, data[i].p0.y) : curves[i-1].p3
            let curve = {
                p0: prev,
                p1: createVector(data[i].p1.x, data[i].p1.y),
                p2: createVector(data[i].p2.x, data[i].p2.y),
                p3: createVector(data[i].p3.x, data[i].p3.y),
                i: i
            };
            curves.push(curve);
        }
        return curves;
    }

    mirrorControlPoint(curveIndex, pointIndex) {
        if (pointIndex === 1) {
            if (curveIndex > 0) {
                let anchor = this.curves[curveIndex].p0; 
                let dragged = this.curves[curveIndex].p1;
                let mirrorPoint = p5.Vector.sub(p5.Vector.mult(anchor, 2), dragged);
                this.curves[curveIndex - 1].p2 = mirrorPoint;
            }
        } else if (pointIndex === 2) {
            if (curveIndex < this.curves.length - 1) { 
                let anchor = this.curves[curveIndex].p3;
                let dragged = this.curves[curveIndex].p2;
                let mirrorPoint = p5.Vector.sub(p5.Vector.mult(anchor, 2), dragged);
                this.curves[curveIndex + 1].p1 = mirrorPoint;
            }
        }
    }
      
      
    
    //sets the control points of the next curve to be the same distance and direction from the anchor point as the previous curve
    mirrorDistancesControlPoints(reveresed = true){
        let startIndex = 0
        let endIndex = this.curves.length - 1
        if(reveresed){
            for (let i = startIndex; i < endIndex; i++) {
                let current = this.curves[i]
                let nextCurve = this.curves[i + 1]
                let anchor = current.p3;
                let diff = p5.Vector.sub(anchor, nextCurve.p1);
                current.p2 = p5.Vector.add(anchor, diff);
            }
            return
        }
        for (let i = startIndex; i < endIndex; i++) {
            let current = this.curves[i]
            let nextCurve = this.curves[i + 1]
            let anchor = current.p3;
            let diff = p5.Vector.sub(anchor, current.p2);
            nextCurve.p1 = p5.Vector.add(anchor, diff);
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
            stroke(lerpColor(col0, col2, ratio));
            line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
        }
    }

    drawControlPoints(curve){
        let p0 = curve.p0
        let p1 = curve.p1
        let p2 = curve.p2
        let p3 = curve.p3
        strokeWeight(2.5);
        stroke(0)
        fill(lerpColor(col0, col2, (curve.i) / this.curves.length));
        ellipse(p0.x, p0.y, 13);
        stroke(115)
        strokeWeight(10)
        point(p1.x, p1.y);
        point(p2.x, p2.y);
        strokeWeight(2.5)
        fill(lerpColor(col0, col2, (curve.i + 1) / this.curves.length));
        stroke(0)
        ellipse(p3.x, p3.y, 13);
    }

    drawControlLines(curve){
        let p0 = curve.p0
        let p1 = curve.p1
        let p2 = curve.p2
        let p3 = curve.p3
        stroke(115)
        strokeWeight(1);
        line(p0.x, p0.y, p1.x, p1.y);
        line(p3.x, p3.y, p2.x, p2.y);
        stroke(40)
        //line(p1.x, p1.y, p2.x, p2.y);
    }

    calculatePoints(curve) {
        let p0 = curve.p0
        let p1 = curve.p1
        let p2 = curve.p2
        let p3 = curve.p3
        let index = curve.i
        let points = [];
        let t = (u * this.curves.length) - index;
        t = Math.max(0, Math.min(t, 1));
        for (let i = 0; i < t; i += 0.001) {
            let a = p5.Vector.lerp(p0, p1, i);
            let b = p5.Vector.lerp(p1, p2, i);
            let c = p5.Vector.lerp(p2, p3, i);
            let d = p5.Vector.lerp(a, b, i);
            let e = p5.Vector.lerp(b, c, i);
            points.push(p5.Vector.lerp(d, e, i));
        }
        return points;
    }
}

