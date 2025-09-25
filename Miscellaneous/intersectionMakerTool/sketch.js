//Intersection Maker Tool for pathTest
//Miguel Rodríguez
//25-09-2025

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

const MIN_ANGLE = 0.65
const MIN_DIST_SEG = 65
const LANE_WIDTH = 30

let anchor = undefined
let paths = [[], []]
let currPathIdx = 0
let mainPaths = []
let nodes = []
let currPath = undefined

let bool = true

function inBoundsNodes(x, y, nodes){
    for(let n of nodes){
        let d = dist(x, y, n.pos.x, n.pos.y)
        if(d < 20) return n
    }
    return false
}

function tooSharp(A, B, C){
    const angle = angleAtVertex(B, A, C)
    return angle < MIN_ANGLE && angle > -MIN_ANGLE
}

function mouseClicked(){
    if(mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT) return
    if(anchor === undefined){
        anchor = createVector(mouseX, mouseY)
        nodes.push({pos: anchor.copy(), prev: null, next: null})
    } 
    else {
        let to = createVector(mouseX, mouseY)

        if(dist(anchor.x, anchor.y, to.x, to.y) < MIN_DIST_SEG) return

        let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
        if(inBoundNode){
            to = inBoundNode.pos.copy()
            if(dist(anchor.x, anchor.y, to.x, to.y) < MIN_DIST_SEG) return

            let A = mainPaths[mainPaths.length - 1].from;
            let B = mainPaths[mainPaths.length - 1].to;   
            let C = to;
            if (tooSharp(A, B, C)) {
                return
            }

            A = mainPaths[0].to
            B = mainPaths[0].from
            C = anchor
            if (tooSharp(A, B, C)) {
                return
            }

            nodes[nodes.length - 1].next = inBoundNode
            inBoundNode.prev = nodes[nodes.length - 1]
        }

        if (paths[currPathIdx].length > 0) {
            const A = mainPaths[mainPaths.length - 1].from;
            const B = mainPaths[mainPaths.length - 1].to;   
            const C = to;
            if (tooSharp(A, B, C)) {
                return
            }
        }

        mainPaths.push({from: anchor.copy(), to: to.copy()})

        anchor = createVector(mouseX, mouseY)
        
        if(!inBoundNode){
            nodes.push({pos: anchor.copy(), prev: nodes[nodes.length - 1], next: null})
            nodes[nodes.length - 2].next = nodes[nodes.length - 1]
        }

        let dir = p5.Vector.sub(mainPaths[mainPaths.length - 1].to, mainPaths[mainPaths.length - 1].from)
        dir.normalize()
        let perp = createVector(-dir.y, dir.x)
        perp.mult(LANE_WIDTH)

        let newFrom1 = p5.Vector.add(mainPaths[mainPaths.length - 1].from, perp)
        let newTo1 = p5.Vector.add(mainPaths[mainPaths.length - 1].to, perp)
        paths[currPathIdx].push({from: newFrom1, to: newTo1, dir: 'forward'})

        let newFrom2 = p5.Vector.sub(mainPaths[mainPaths.length - 1].from, perp)
        let newTo2 = p5.Vector.sub(mainPaths[mainPaths.length - 1].to, perp)
        paths[currPathIdx+1].unshift({from: newFrom2, to: newTo2, dir: 'backward'})

        if(paths[currPathIdx].length > 1){
            let forwardPaths = paths[currPathIdx]
            let backwardPaths = paths[currPathIdx+1]
            curveEndings(forwardPaths[forwardPaths.length - 2], forwardPaths[forwardPaths.length - 1],
                         backwardPaths[1], backwardPaths[0], 20, 8);
            if(inBoundNode){
                curveEndings(forwardPaths[forwardPaths.length - 1], forwardPaths[0],
                             backwardPaths[0], backwardPaths[backwardPaths.length - 1], 20, 8);
            }
        }
        if(inBoundNode){
            currPathIdx += 2
            paths.push([], [])
            anchor = undefined
            currPath = undefined
        }
    }
}


    

function setup(){
    createCanvas(WIDTH, HEIGHT)
}

function draw(){
    background(0)

    if(anchor){
        currPath = {from: anchor.copy(), to: createVector(mouseX, mouseY)}
    }

    if (paths[currPathIdx].length > 0) {
        let to = createVector(mouseX, mouseY)
        const A = mainPaths[mainPaths.length - 1].from;
        const B = mainPaths[mainPaths.length - 1].to;  
        const C = to;                                 

        const angle = angleAtVertex(B, A, C)

        bool = (angle > MIN_ANGLE || angle < -MIN_ANGLE) && dist(anchor.x, anchor.y, to.x, to.y) >= MIN_DIST_SEG
    }


    drawMainPaths()
    drawPaths()
    drawNodes()
}

function drawMainPaths(){
    stroke(255)
    for(let p of mainPaths){
        line(p.from.x, p.from.y, p.to.x, p.to.y)
    }
}

function drawPaths(){
    for(let p of paths){
        for(let p2 of p){
            if(p2.dir === 'forward') stroke(0, 255, 0)
            else stroke(255, 0, 0)
            line(p2.from.x, p2.from.y, p2.to.x, p2.to.y)
        }
    }
    if(currPath){
        bool ? stroke(0, 255, 0) : stroke(255, 0, 0)
        line(currPath.from.x, currPath.from.y, currPath.to.x, currPath.to.y)
    }
}

function drawNodes(){
    noFill()
    stroke(255, 50)
    for(let n of nodes){
        circle(n.pos.x, n.pos.y, 40)
    }
}

// Make a smooth fillet between two consecutive segments on both "forward" and "backward" sides.
// radius: how far from the corner to start/end the curve (in px)
// resolution: how many straight segments to approximate the bezier (>=2 strongly recommended)
function modifyEndingsCurved(forwardPrev, forwardCurr, backwardPrev, backwardCurr, radius = 20, resolution = 8) {
  const eps = 1e-6;

  function unit(v) {
    const m = Math.hypot(v.x, v.y);
    return m < eps ? createVector(0, 0) : createVector(v.x / m, v.y / m);
  }

  function segmentLength(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  // Trim a segment (A->B) back from intersection point P by dist "r" and return new end point T on AB
  function trimToward(A, B, P, r) {
    // direction from A to B
    const AB = p5.Vector.sub(B, A);
    const len = AB.mag();
    if (len < eps) return B.copy();
    const u = p5.Vector.div(AB, len);

    // Determine whether P lies closer to B or A in the direction of AB.
    // We always want to trim the endpoint that approaches P (for AB used as "prev", that's B,
    // for "curr", that's its 'from' point).
    // For prev (A->B): target is B' = P - u * r
    // For curr (C->D): target is C' = P + u * r  (since C->D goes away from P)
    return { u, len };
  }

  // Sample a cubic bezier p0->p3 with controls p1,p2 into N straight segments
  function bezierSegments(p0, p1, p2, p3, N, dirLabel) {
    const segs = [];
    let prev = p0.copy();
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const x =
        Math.pow(1 - t, 3) * p0.x +
        3 * Math.pow(1 - t, 2) * t * p1.x +
        3 * (1 - t) * Math.pow(t, 2) * p2.x +
        Math.pow(t, 3) * p3.x;
      const y =
        Math.pow(1 - t, 3) * p0.y +
        3 * Math.pow(1 - t, 2) * t * p1.y +
        3 * (1 - t) * Math.pow(t, 2) * p2.y +
        Math.pow(t, 3) * p3.y;
      const curr = createVector(x, y);
      segs.push({ from: prev.copy(), to: curr.copy(), dir: dirLabel });
      prev = curr;
    }
    return segs;
  }

  // Handle one pair (prev,curr) and return {trimPrevTo, trimCurrFrom, curveSegs[]}
  function makeCurve(prevSeg, currSeg, dirLabel) {
    const P = lineIntersection(prevSeg.from, prevSeg.to, currSeg.from, currSeg.to, true);
    if (!P) return null;

    const Pvec = createVector(P.x, P.y);

    const prevDir = unit(p5.Vector.sub(prevSeg.to, prevSeg.from)); // A->B
    const currDir = unit(p5.Vector.sub(currSeg.to, currSeg.from)); // C->D

    // Distances available for trimming so we don't overshoot short segments
    const prevAvail = segmentLength(prevSeg.from, Pvec); // distance from prev.from to the corner along prev
    const currAvail = segmentLength(currSeg.from, Pvec); // distance from curr.from to the corner along curr (but direction matters)

    const r = Math.max(0, Math.min(radius, prevAvail - eps, currAvail - eps));
    if (r < eps) return null; // not enough room to curve

    // New joint endpoints
    const prevEnd = p5.Vector.sub(Pvec, p5.Vector.mult(prevDir, r)); // B'
    const currStart = p5.Vector.add(Pvec, p5.Vector.mult(currDir, r)); // C'

    // Replace hard-corner by cubic bezier with tangents aligned to the segments
    // Good handle length for a circular-ish fillet: 0.55191502449 * r (classic circle-bezier approximation)
    const handle = r * 0.55191502449;

    const c1 = p5.Vector.add(prevEnd, p5.Vector.mult(prevDir, handle));       // along prev direction
    const c2 = p5.Vector.sub(currStart, p5.Vector.mult(currDir, handle));     // opposite curr direction

    const N = Math.max(2, Math.floor(resolution));

    const curveSegs = bezierSegments(prevEnd, c1, c2, currStart, N, dirLabel);

    return {
      prevEnd,        // set prevSeg.to = prevEnd
      currStart,      // set currSeg.from = currStart
      curveSegs
    };
  }

  const out = { forwardCurve: [], backwardCurve: [] };

  // FORWARD side
  const f = makeCurve(forwardPrev, forwardCurr, 'forward');
  if (f) {
    forwardPrev.to = f.prevEnd.copy();
    forwardCurr.from = f.currStart.copy();
    out.forwardCurve = f.curveSegs;
  }

  // BACKWARD side
  const b = makeCurve(backwardPrev, backwardCurr, 'backward');
  if (b) {
    backwardPrev.to = b.prevEnd.copy();
    backwardCurr.from = b.currStart.copy();
    out.backwardCurve = b.curveSegs;
  }

  return out;
}


function angleAtVertex(V, P, Q) {
  const v1 = p5.Vector.sub(P, V);
  const v2 = p5.Vector.sub(Q, V);
  const m1 = v1.mag();
  const m2 = v2.mag();
  if (m1 === 0 || m2 === 0) return 0; // degenerate
  return v1.angleBetween(v2); // radians
}


function curveEndings(forwardPrev, forwardCurr, backwardPrev, backwardCurr, rad, res){
    const curves = modifyEndingsCurved(forwardPrev, forwardCurr, backwardPrev, backwardCurr, rad, res);
    let forwardPaths = paths[currPathIdx]
    let backwardPaths = paths[currPathIdx+1]
    if (curves.forwardCurve.length) {
        forwardPaths.splice(forwardPaths.length - 1, 0, ...curves.forwardCurve);
    }
    if (curves.backwardCurve.length) {
        backwardPaths.splice(1, 0, ...curves.backwardCurve);
    }
}

function modifyEndings(forwardPrev, forwardCurr, backwardPrev, backwardCurr){
    let intersec1 = lineIntersection(forwardPrev.from, forwardPrev.to, forwardCurr.from, forwardCurr.to, true)
    if(intersec1){
        forwardPrev.to = createVector(intersec1.x, intersec1.y)
        forwardCurr.from = createVector(intersec1.x, intersec1.y)
    }

    let intersec2 = lineIntersection(backwardPrev.from, backwardPrev.to, backwardCurr.from, backwardCurr.to, true)
    if(intersec2){
        backwardPrev.to = createVector(intersec2.x, intersec2.y)
        backwardCurr.from = createVector(intersec2.x, intersec2.y)
    }
}