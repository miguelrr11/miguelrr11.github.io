//Intersection Maker Tool for pathTest
//Miguel Rodríguez
//25-09-2025

//justo antes de exportarlo, hay que crear paths nuevos entre cada punto de interseccion de los paths (splicearlo)

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

const MIN_ANGLE = 0.65
const MIN_DIST_SEG = 65
const LANE_WIDTH = 10
const RAD_BEZIER = 1000
const RES_BEZIER = 2

let showMain = false
let showIdxPaths = false
let showAllIdx = true
let showIntersections = false

let anchor = undefined
let paths = [[], []]
let currPathIdx = 0
let mainPaths = [[]]

let nodes = []
let currPath = undefined

let intersections = []
let intersecPaths = []

let bool = true

function inBoundsNodes(x, y, nodes){
    for(let n of nodes){
        let d = dist(x, y, n.pos.x, n.pos.y)
        if(d < 20) return n
    }
    return false
}

function keyPressed(){
    if(keyCode == 32) finishPath()
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

            let A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
            let B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;   
            let C = to;
            if (tooSharp(A, B, C)) {
                return
            }

            A = mainPaths[currPathIdx][0].to
            B = mainPaths[currPathIdx][0].from
            C = anchor
            if (tooSharp(A, B, C)) {
                return
            }

            nodes[nodes.length - 1].next = inBoundNode
            inBoundNode.prev = nodes[nodes.length - 1]
        }

        if (paths[currPathIdx].length > 0) {
            const A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
            const B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;
            const C = to;
            if (tooSharp(A, B, C)) {
                return
            }
        }

        mainPaths[currPathIdx].push({from: anchor.copy(), to: to.copy()})

        anchor = createVector(mouseX, mouseY)
        
        if(!inBoundNode){
            nodes.push({pos: anchor.copy(), prev: nodes[nodes.length - 1], next: null})
            nodes[nodes.length - 2].next = nodes[nodes.length - 1]
        }

        let dir = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from)
        dir.normalize()
        let perp = createVector(-dir.y, dir.x)
        perp.mult(LANE_WIDTH)

        let newFrom1 = p5.Vector.add(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from, perp)
        let newTo1 = p5.Vector.add(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, perp)
        paths[currPathIdx].push({from: newFrom1, to: newTo1, dir: 'forward', mainPathIdx: currPathIdx, segIdx: mainPaths[currPathIdx].length - 1, pathIdx: currPathIdx})

        let newFrom2 = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from, perp)
        let newTo2 = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, perp)
        paths[currPathIdx+1].unshift({from: newFrom2, to: newTo2, dir: 'backward', mainPathIdx: currPathIdx, segIdx: mainPaths[currPathIdx].length - 1, pathIdx: currPathIdx+1})

        if(paths[currPathIdx].length > 1){
            let forwardPaths = paths[currPathIdx]
            let backwardPaths = paths[currPathIdx+1]
            curveEndings(forwardPaths[forwardPaths.length - 2], forwardPaths[forwardPaths.length - 1],
                         backwardPaths[1], backwardPaths[0], RAD_BEZIER, RES_BEZIER, forwardPaths.length - 2);
            if(inBoundNode){
                curveEndings(forwardPaths[forwardPaths.length - 1], forwardPaths[0],
                             backwardPaths[0], backwardPaths[backwardPaths.length - 1], RAD_BEZIER, RES_BEZIER, forwardPaths.length - 2);
            }
        }
        if(inBoundNode){
            finishPath()
        }

        calculateIntersections()
        generateInsideIntersections()
    }
}

function finishPath(){
    currPathIdx += 2
    paths.push([], [])
    mainPaths.push([], [])
    anchor = undefined
    currPath = undefined
}

function generateInsideIntersections() {
    intersecPaths = [];
    function cornerKey(entry) {
        const [a, b] = entry.paths;
        const A = (a.dir === 'forward') ? 'F' : 'B';
        const B = (b.dir === 'forward') ? 'F' : 'B';
        return A + B; // "FF" | "FB" | "BF" | "BB"
    }
    
    function laneDirVector(seg) {
        const v = (seg.dir === 'forward') ?
            p5.Vector.sub(seg.to, seg.from) // from -> to
            :
            p5.Vector.sub(seg.from, seg.to); // backward: to -> from
        const m = v.mag();
        return (m === 0) ? createVector(0, 0) : v.div(m);
    }

    function chooseLaneForCorner(entry, towardVec) {
        let best = entry.paths[0];
        let bestDot = -Infinity;
        for(const seg of entry.paths) {
            const u = laneDirVector(seg);
            const dot = u.x * towardVec.x + u.y * towardVec.y;
            if(dot > bestDot) {
                bestDot = dot;
                best = seg;
            }
        }
        return best;
    }

    function makeConnector(fromEntry, toEntry) {
        const v = createVector(
            toEntry.pos.x - fromEntry.pos.x,
            toEntry.pos.y - fromEntry.pos.y
        );
        const vm = v.mag();
        const dir = (vm === 0) ? createVector(1, 0) : v.div(vm); 
        const fromLane = chooseLaneForCorner(fromEntry, dir);
        const toLane = chooseLaneForCorner(toEntry, dir);
        return {
            fromPos: {
                x: fromEntry.pos.x,
                y: fromEntry.pos.y
            },
            toPos: {
                x: toEntry.pos.x,
                y: toEntry.pos.y
            },
            fromPath: fromLane,
            toPath: toLane,
            dir: (fromLane.dir === 'forward') ? 'forward' : 'backward'
        };
    }
    for(let [key, intersecs] of intersections) {
        const buckets = {
            FF: null,
            FB: null,
            BF: null,
            BB: null
        };
        for(const e of intersecs) {
            const k = cornerKey(e);
            if(!buckets[k]) {
                buckets[k] = e;
            }
            else {
                const cx = intersecs.reduce((s, it) => s + it.pos.x, 0) / intersecs.length;
                const cy = intersecs.reduce((s, it) => s + it.pos.y, 0) / intersecs.length;
                const dNew = dist(e.pos.x, e.pos.y, cx, cy);
                const dOld = dist(buckets[k].pos.x, buckets[k].pos.y, cx, cy);
                if(dNew < dOld) buckets[k] = e;
            }
        }
        const { FF, FB, BF, BB } = buckets;
        if(FF && BB) {
            intersecPaths.push(makeConnector(FF, BB)); // FF → BB
            intersecPaths.push(makeConnector(BB, FF)); // BB → FF (reverse movement)
        }
        if(FB && BF) {
            intersecPaths.push(makeConnector(FB, BF)); // FB → BF
            intersecPaths.push(makeConnector(BF, FB)); // BF → FB (reverse movement)
        }
    }
}


function calculateIntersections(){
    intersections = new Map()
    for(let i = 0; i < paths.length; i++){
        for(let j = i+1; j < paths.length; j++){
            for(let p1 of paths[i]){
                for(let p2 of paths[j]){
                    let intersec = lineIntersection(p1.from, p1.to, p2.from, p2.to, false)
                    if(intersec){
                        let key = p1.mainPathIdx + '-' + p1.segIdx + '_' + p2.mainPathIdx + '-' + p2.segIdx
                        if(!intersections.has(key)){
                            intersections.set(key, [{pos: {x: intersec.x, y: intersec.y}, paths: [p1, p2]}])
                        } 
                        else {
                            intersections.get(key).push({pos: {x: intersec.x, y: intersec.y}, paths: [p1, p2]})
                        }
                    }
                }
            }
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
        const A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
        const B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;  
        const C = to;                                 

        const angle = angleAtVertex(B, A, C)

        bool = (angle > MIN_ANGLE || angle < -MIN_ANGLE) && dist(anchor.x, anchor.y, to.x, to.y) >= MIN_DIST_SEG
    }


    if(showMain) drawMainPaths()
    drawPaths()
    drawNodes()

    drawIntersections()
    drawIntersectionsPaths()
}

function drawIntersectionsPaths(){
    let hoverP = null
    for(let p of intersecPaths){
        let hover = dist(mouseX, mouseY, p.fromPos.x, p.fromPos.y) < 10
        if(hover){
            hoverP = p
            break
        }
    }
    if(hoverP){
        stroke(0, 0, 255)
        line(hoverP.fromPos.x, hoverP.fromPos.y, hoverP.toPos.x, hoverP.toPos.y)
        fill(0, 0, 255, 100)
        ellipse(hoverP.fromPos.x, hoverP.fromPos.y, 12)
        stroke(0, 255, 0, 80)
        strokeWeight(7)
        line(hoverP.fromPath.from.x, hoverP.fromPath.from.y, hoverP.fromPath.to.x, hoverP.fromPath.to.y)
        stroke(255, 0, 0, 80)
        line(hoverP.toPath.from.x, hoverP.toPath.from.y, hoverP.toPath.to.x, hoverP.toPath.to.y)
        strokeWeight(1)
        noFill()
        return
    }
    for(let p of intersecPaths){
        let off  = 0
        stroke(0, 0, 255)
        line(p.fromPos.x + off, p.fromPos.y, p.toPos.x + off, p.toPos.y)
        fill(0, 0, 255, 100)
        ellipse(p.fromPos.x + off, p.fromPos.y, 8)
    }
}

function drawIntersections(){
    if(!showIntersections) return
    push()
    for(let [key, intersec] of intersections){
        for(let intersecObj of intersec){
            intersec = intersecObj.pos
            stroke(255, 120)
            strokeWeight(8)
            point(intersec.x, intersec.y)
            fill(255)
            noStroke()
            text(key, intersec.x + 10, intersec.y + 10)
            noFill()    
        }
    }
    pop()
}

function drawMainPaths(){
    stroke(255)
    for(let p of mainPaths){
        for(let p2 of p){
            line(p2.from.x, p2.from.y, p2.to.x, p2.to.y)
            fill(255)
            let idx = p.indexOf(p2)
            if(showIdxPaths) text(idx, (p2.from.x + p2.to.x)/2, (p2.from.y + p2.to.y)/2)
            noFill()
        }
    }
}

function drawPaths(){
    strokeWeight(2)
    for(let p of paths){
        for(let i = 0; i < p.length; i++){
            let p2 = p[i]
            let col = i / p.length * 255
            col = 255
            if(p2.dir === 'forward') stroke(0, col, 0)
            else stroke(col, 0, 0)
            line(p2.from.x, p2.from.y, p2.to.x, p2.to.y)
            fill(255)
            let mainindex = p2.mainPathIdx !== undefined ? p2.mainPathIdx : ''
            let idx = p2.segIdx !== undefined ? p2.segIdx : ''
            if(showIdxPaths) text(mainindex + ' ' + idx, (p2.from.x + p2.to.x)/2, (p2.from.y + p2.to.y)/2)
            if(showAllIdx){
                let index = p2.segIdx != undefined ? p2.segIdx : '?'
                text(index, (p2.from.x + p2.to.x)/2, (p2.from.y + p2.to.y)/2 - 10)
            }
            noFill()
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

function modifyEndingsCurved(forwardPrev, forwardCurr, backwardPrev, backwardCurr, radius = 20, resolution = 8, id) {
  const eps = 1e-6;
  let acum = id + 0.1
  acum = Math.round(acum * 100) / 100

  function unit(v) {
    const m = Math.hypot(v.x, v.y);
    return m < eps ? createVector(0, 0) : createVector(v.x / m, v.y / m);
  }

  function segmentLength(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
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
      segs.push({ from: prev.copy(), to: curr.copy(), dir: dirLabel, segIdx: acum});
      acum += .1
      acum = Math.round(acum * 100) / 100
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


function curveEndings(forwardPrev, forwardCurr, backwardPrev, backwardCurr, rad, res, id){
    const curves = modifyEndingsCurved(forwardPrev, forwardCurr, backwardPrev, backwardCurr, rad, res, id);
    let forwardPaths = paths[currPathIdx]
    let backwardPaths = paths[currPathIdx+1]
    //curves.backwardCurve.reverse(); // to maintain correct order when inserting
    if (curves.forwardCurve.length) {
        forwardPaths.splice(forwardPaths.length - 1, 0, ...curves.forwardCurve);
    }
    if (curves.backwardCurve.length) {
        backwardPaths.splice(1, 0, ...curves.backwardCurve);
    }
}


function orderPath(p){
    //order path segments so that the "to" of one is the "from" of the next
    if(p.length === 0) return
    let ordered = [p[0]]
    p.splice(0, 1)
    while(p.length > 0){
        let last = ordered[ordered.length - 1]
        let found = false
        for(let i = 0; i < p.length; i++){
            let seg = p[i]
            if(dist(last.to.x, last.to.y, seg.from.x, seg.from.y) < 1e-6){
                ordered.push(seg)
                p.splice(i, 1)
                found = true
                break
            }
            else if(dist(last.to.x, last.to.y, seg.to.x, seg.to.y) < 1e-6){
                //reverse segment
                let newSeg = {from: seg.to.copy(), to: seg.from.copy(), dir: seg.dir, mainPathIdx: seg.mainPathIdx, segIdx: seg.segIdx}
                ordered.push(newSeg)
                p.splice(i, 1)
                found = true
                break
            }
        }
        if(!found) break
    }
    p.push(...ordered)
}

function getId(p){
    if(p.length === 0) return -1
    let i = 0
    let id = p[0].pathIdx
    while(id == undefined || id == null){
        i++
        if(i >= p.length) return -1
        id = p[i].pathIdx
    }
    return id
}

function exportRoad(){
    for(let p of paths){
        orderPath(p)
        if(p.length > 0 && p[0].dir === 'backward'){ 
            p.reverse()
            console.log('reversed')
        }
    }

    let outputPaths = []
    for(let p of paths){
        if(p.length === 0) continue
        outputPaths.push({segments: [], id: getId(p)})
        for(let p2 of p){
            if(p2.dir == 'backward'){
                outputPaths[outputPaths.length - 1].segments.push({
                    b: {x: p2.from.x, y: p2.from.y},
                    a: {x: p2.to.x, y: p2.to.y},
                    id: p2.segIdx
                })
            }
            else{
                outputPaths[outputPaths.length - 1].segments.push({
                    a: {x: p2.from.x, y: p2.from.y},
                    b: {x: p2.to.x, y: p2.to.y},
                    id: p2.segIdx
                })
            }
        }
    }
    let outputIntersections = []
    for(let inter of intersecPaths){
        let fromPath = inter.fromPath.pathIdx
        let fromSeg = inter.fromPath.segIdx
        let toPath = inter.toPath.pathIdx
        let toSeg = inter.toPath.segIdx

        //create a new path for the intersection segment
        outputPaths.push({segments: [], id: outputPaths.length})
        outputPaths[outputPaths.length - 1].segments.push({
            a: {x: inter.fromPos.x, y: inter.fromPos.y},
            b: {x: inter.toPos.x, y: inter.toPos.y},
            id: 0
        })

        let interPath = outputPaths.length - 1

        outputIntersections.push({
            from: {path: fromPath, segment: fromSeg},
            to: {path: interPath, segment: 0},
            point: {x: inter.fromPos.x, y: inter.fromPos.y}
        })
        outputIntersections.push({
            from: {path: interPath, segment: 0},
            to: {path: toPath, segment: toSeg},
            point: {x: inter.toPos.x, y: inter.toPos.y}
        })

        console.log(fromPath + ' ' + fromSeg + ' ' + interPath + ' ' + '0 ')
        console.log(interPath + ' ' + '0 ' + toPath + ' ' + toSeg)
        
    }
    storeItem('paths', JSON.stringify(outputPaths))
    storeItem('intersections', JSON.stringify({outputIntersections}))
}