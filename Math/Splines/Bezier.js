class Bezier{
    constructor(curves){
        this.curves = curves ? curves : this.loadFromData()
        this.points = []
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

    getPoints(){
        this.points = []
        for(let curve of this.curves) {
            this.points.push(...this.calculatePoints(curve));
        }
        return this.points
    }

    show(){
        this.points = []
        for(let curve of this.curves) this.drawControlLines(curve)
        for(let curve of this.curves){ 
            this.points.push(...this.drawCurve(curve))
        }
        for(let curve of this.curves) this.drawControlPoints(curve)
    }

    drawControlFading(t){
        for(let curve of this.curves) this.drawControlLines(curve, t*255)
        for(let curve of this.curves) this.drawControlPoints(curve, t*255)
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
        ellipse(curve.p2.x, curve.p2.y, 11.5);
        ellipse(curve.p3.x, curve.p3.y, 11.5);
    }

    drawControlLines(curve, trans = 255){
        let p0 = curve.p0
        let p1 = curve.p1
        let p2 = curve.p2
        let p3 = curve.p3
        stroke(115, trans)
        strokeWeight(1.5);
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

