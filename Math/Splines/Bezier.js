class Bezier{
    constructor(curves){
        this.curves = curves ? curves : this.loadFromData()
        this.points = []
        this.draggingPoint = null
        this.draggingPointIndex = null
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

    createPoint(){
        let newPos = createVector(mouseX, mouseY)
        let prev = this.curves.length == 0 ? newPos : this.curves[this.curves.length - 1].p3
        let prevCurve = this.curves[this.curves.length - 1]
        let newp1 = p5.Vector.sub(p5.Vector.mult(prevCurve.p3, 2), prevCurve.p2);
        let newp2 = p5.Vector.sub(p5.Vector.mult(prevCurve.p3, 2), prevCurve.p1);
        newp2 = p5.Vector.add(prev, newp2).div(2)
        let newCurve = {
            p0: prev,
            p1: newp1,
            p2: newp2,
            p3: createVector(mouseX, mouseY),
            i: this.curves.length
        }
        this.curves.push(newCurve)
        this.mirrorDistancesControlPoints()
    }

    mirrorControlPoint(curveIndex, pointIndex) {
        if (pointIndex === 1) {
            if (curveIndex > 0) {
                let anchor = this.curves[curveIndex].p0; 
                let dragged = this.curves[curveIndex].p1;
                let mirrorPoint = p5.Vector.sub(p5.Vector.mult(anchor, 2), dragged);
                this.curves[curveIndex - 1].p2 = mirrorPoint;
            }
        } 
        else if (pointIndex === 2) {
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

    release(){
        this.draggingPoint = null
        this.draggingPointIndex = null
    }

    //when moving the anchor, the control points move with it
    moveControls(curveIndex, dx, dy){
        let control1 = this.curves[curveIndex].p2
        control1.x += dx
        control1.y += dy 
        if(curveIndex >= this.curves.length-1) return
        let control2 = this.curves[curveIndex+1].p1;
        control2.x += dx
        control2.y += dy
    }

    move() {
        for(let j = 0; j < this.curves.length; j++){
            let curve = this.curves[j]
            let points = [curve.p0, curve.p1, curve.p2, curve.p3];
            if (!this.draggingPoint) {
                for (let i = 0; i < points.length; i++) {
                    let point = points[i]
                    if (dist(mouseX, mouseY, point.x, point.y) < 15) {
                        if(i == 3) this.moveControls(j, mouseX - point.x, mouseY - point.y)
                        this.draggingPoint = point;
                        this.draggingPointIndex = {
                            curveIndex: j,
                            pointIndex: i
                        }
                        this.mirrorControlPoint(j, i)
                        break;
                    }
                }
            } 
            else {
                if(this.draggingPointIndex.pointIndex == 3) this.moveControls(this.draggingPointIndex.curveIndex, mouseX - this.draggingPoint.x, mouseY - this.draggingPoint.y)
                this.draggingPoint.x = mouseX;
                this.draggingPoint.y = mouseY;
                this.mirrorControlPoint(this.draggingPointIndex.curveIndex, this.draggingPointIndex.pointIndex)
            }
            if(this.draggingPointIndex != null) console.log(this.draggingPointIndex.pointIndex)
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
        let col1 = color(135, trans)
        let col2 = color(55, trans)
        gradientLine(p0.x, p0.y, p1.x, p1.y, [col1, col2]);
        gradientLine(p3.x, p3.y, p2.x, p2.y,  [col1, col2])
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

