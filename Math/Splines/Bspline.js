class Bspline {
    constructor(curves){
        this.curves = curves ? curves : this.loadFromData();
    }

    loadFromData(){
        let curves = [];
        for (let i = 0; i < data.length; i++) {
            let prev = i == 0 ? createVector(data[i].p0.x, data[i].p0.y) : curves[i-1].p1;
            if(i == data.length - 1){
                let curve = {
                    p0: prev,
                    v0: createVector(data[i].p1.x, data[i].p1.y),
                    v1: createVector(data[i].p2.x, data[i].p2.y),
                    p1: createVector(data[i].p3.x, data[i].p3.y),
                    i: i
                };
                curves.push(curve);
                continue;
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
        for(let curve of this.curves) this.drawControlLines(curve);
        for(let curve of this.curves) this.drawCurve(curve);
        for(let curve of this.curves) this.drawControlPoints(curve);
    }

    drawCurve(curve){
        let minVal = curve.i / this.curves.length;
        let maxVal = (curve.i + 1) / this.curves.length;
        let points = this.calculatePoints(curve);
        strokeWeight(4);
        for(let i = 1; i < points.length; i++){
            let ratio = map(i, 0, points.length, minVal, maxVal);
            stroke(lerpColor(col2, col3, ratio));
            line(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
        }
    }
    
    drawControlPoints(curve){
        let p0 = curve.p0;
        let p1 = curve.p1;
        strokeWeight(2.5);
        stroke(0);
        fill(lerpColor(col2, col3, (curve.i) / this.curves.length));
        ellipse(p0.x, p0.y, 13);
        stroke(115);
        strokeWeight(10);
        strokeWeight(2.5);
        fill(lerpColor(col2, col3, (curve.i + 1) / this.curves.length));
        stroke(0);
        ellipse(p1.x, p1.y, 13);
    }
    
    drawControlLines(curve){
        let p0 = curve.p0;
        let v0 = curve.v0;
        let v1 = curve.v1;
        let p1 = curve.p1;
        let newCol = color(col4.levels[0], col4.levels[1], col4.levels[2], 100);
        stroke(newCol);
        strokeWeight(2);
        line(p0.x, p0.y, v0.x, v0.y);
        line(p1.x, p1.y, v1.x, v1.y);
        drawArrowTip(v0.x, v0.y, atan2(p0.y - v0.y, p0.x - v0.x), 10);
        drawArrowTip(v1.x, v1.y, atan2(p1.y - v1.y, p1.x - v1.x), 10);
        stroke(40);
        //line(v0.x, v0.y, v1.x, v1.y);
    }
    
    // Calculates and returns an array of points along the B-spline segment.
    calculatePoints(curve) {
        // Define the control points for this segment.
        let controlPoints = [curve.p0, curve.v0, curve.v1, curve.p1];
        const degree = 3;
        
        // For a B-spline with 4 control points, we need a different knot vector 
        // This will create a curve that doesn't necessarily pass through the endpoints
        // For a non-clamped B-spline, try:
        const knots = [0, 1, 2, 3, 4, 5, 6, 7];
        
        // B-spline basis function (Cox–de Boor).
        function basis(i, p, u) {
          if (p === 0) {
            return (knots[i] <= u && u < knots[i + 1]) ? 1 : 0;
          } else {
            let denom1 = knots[i + p] - knots[i];
            let term1 = 0;
            if (denom1 !== 0) {
              term1 = ((u - knots[i]) / denom1) * basis(i, p - 1, u);
            }
            let denom2 = knots[i + p + 1] - knots[i + 1];
            let term2 = 0;
            if (denom2 !== 0) {
              term2 = ((knots[i + p + 1] - u) / denom2) * basis(i + 1, p - 1, u);
            }
            return term1 + term2;
          }
        }
        
        const numPoints = 100;
        let pts = [];
        let isLastSegment = (curve.i === this.curves.length - 1);
        let sampleCount = isLastSegment ? (numPoints + 1) : numPoints;
        
        // The parameter range should be adjusted based on the knot vector
        // For cubic B-spline with 4 control points, parameter range is typically [3, 4]
        const paramStart = 3;
        const paramEnd = 4;
        
        for (let i = 0; i < sampleCount; i++) {
            // Map i to the parameter range
            let u = paramStart + (i / numPoints) * (paramEnd - paramStart);
            let point = createVector(0, 0);
            
            // Sum contributions from each control point
            for (let j = 0; j < controlPoints.length; j++) {
                let w = basis(j, degree, u);
                let weighted = controlPoints[j].copy().mult(w);
                point.add(weighted);
            }
            
            pts.push(point);
        }
        
        return pts;
    }
    
    
}
