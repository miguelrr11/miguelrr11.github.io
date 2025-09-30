//Intersection Maker Tool for pathTest
//Miguel Rodríguez
//25-09-2025

//almost all bezier code taken from chatgpt

//idea: a la hora de hacer las curvas, limitarlas hasta el punto de la interseccion en ese segmento, asi no te cargas las intersecciones con la curva
//idea: tool para hacer segmentos con bezier (en vez de lineas rectas)
//fix: go to 1187

p5.disableFriendlyErrors = true
const WIDTH = 800
const HEIGHT = 800

const MIN_ANGLE = 0.7   //0.65
let LANE_WIDTH = 20
let MIN_DIST_SEG = LANE_WIDTH * 4  //65
const RAD_BEZIER = 1000
const RES_BEZIER = 10
const MIN_N_SEGS_PER_CURVE = 2
const MAX_N_SEGS_PER_CURVE = 15

const MAX_UNDO = 50

//DEBUG
let showMain = true
let showIdxPaths = false
let showAllIdx = false
let showIntersections = false
let showOrder = false
let showNodes = true
let showBezierPoints = true
let showStateDebug = false
let showIntersectionsPoints = false
let showDiffColorsPerPath = false
let SHOW_DEBUG = false
let stateIndexShowDebug = 0

let anchor = undefined
let paths = [[], []]
let currPathIdx = 0
let mainPaths = [[]]
let hasToBeOrdered = []

let nodes = []
let nodeID = 0

let intersections = []
let segIntersections = []
let intersecPaths = []
let connectors = []
let diffPathsConnectors = []

let auxIntersec = []

let currMousePos = {x: 0, y: 0}

let undoStack = []

let oldState = getNewFreshState()

function setLineWidth(w){
    LANE_WIDTH = w
    MIN_DIST_SEG = LANE_WIDTH * 4
}

function getNewFreshState(){
    return {
        paths: [[], []],
        mainPaths: [[], []],
        currPathIdx: 0,
        hasToBeOrdered: [],
        nodes: [],
        intersections: [],
        intersecPaths: [],
        connectors: [],
        diffPathsConnectors: [],
        nodeID: 0,
        anchor: undefined
    }
}

function getCurrentState(){
    return {
        paths: paths,
        mainPaths: mainPaths,
        currPathIdx: currPathIdx,
        hasToBeOrdered: hasToBeOrdered,
        nodes: nodes,
        intersections: intersections,
        intersecPaths: intersecPaths,
        connectors: connectors,
        diffPathsConnectors: diffPathsConnectors,
        nodeID: nodeID,
        anchor: anchor
    }
}

function debugState(){
    console.log('Actual State:')
    console.log('Paths:', paths)
    console.log('Main Paths:', mainPaths)
    console.log('Current Path Index:', currPathIdx)
    console.log('Has to be Ordered:', hasToBeOrdered)
    console.log('Nodes:', nodes)
    console.log('Intersections:', intersections)
    console.log('Intersection Paths:', intersecPaths)
    console.log('Connectors:', connectors)
    console.log('-------------------')
    console.log('Old State:')
    console.log('Paths:', oldState.paths)
    console.log('Main Paths:', oldState.mainPaths)
    console.log('Current Path Index:', oldState.currPathIdx)
    console.log('Has to be Ordered:', oldState.hasToBeOrdered)
    console.log('Nodes:', oldState.nodes)
    console.log('Intersections:', oldState.intersections)
    console.log('Intersection Paths:', oldState.intersecPaths)
    console.log('Connectors:', oldState.connectors) 
}

function restoreState(state){
    paths = state.paths
    mainPaths = state.mainPaths
    currPathIdx = state.currPathIdx
    hasToBeOrdered = state.hasToBeOrdered
    nodes = state.nodes
    intersections = state.intersections
    intersecPaths = state.intersecPaths
    connectors = state.connectors
    nodeID = state.nodeID
    anchor = state.anchor
    diffPathsConnectors = state.diffPathsConnectors
}

function saveState(state){
    let oldPaths = []
    for(let p of paths){
        oldPaths.push([])
        for(let seg of p){
            oldPaths[oldPaths.length - 1].push(copySegment(seg))
        }
    }
    let oldMainPaths = []
    for(let p of mainPaths){
        oldMainPaths.push([])
        for(let seg of p){
            oldMainPaths[oldMainPaths.length - 1].push(copyMainPaths(seg))
        }
    }
    state.paths = oldPaths
    state.mainPaths = oldMainPaths
    state.currPathIdx = currPathIdx
    state.hasToBeOrdered = [...hasToBeOrdered]
    state.nodes = []
    for(let n of nodes){
        state.nodes.push({
            pos: n.pos.copy(),
            prev: n.prev,
            next: n.next,
            id: n.id,
            mainPathIdx: n.mainPathIdx
        })
    }
    state.intersections = new Map()
    state.intersecPaths = []
    for(let p of intersecPaths){
        let oldSegments = []
        for(let s of p.segments){
            oldSegments.push({
                a: {x: s.a.x, y: s.a.y},
                b: {x: s.b.x, y: s.b.y},
                id: s.id
            })
        }
        let corner = p.corner == undefined ? undefined : {x: p.corner.x, y: p.corner.y}
        state.intersecPaths.push({
            fromPos: {x: p.fromPos.x, y: p.fromPos.y},
            toPos: {x: p.toPos.x, y: p.toPos.y},
            dir: p.dir,
            segments: oldSegments,
            corner: corner,
            fromPath: {
                dir: p.fromPath.dir,
                from: p.fromPath.from.copy(),
                to: p.fromPath.to.copy(),
                mainPathIdx: p.fromPath.mainPathIdx,
                segIdx: p.fromPath.segIdx,
                pathIdx: p.fromPath.pathIdx
            },
            toPath: {
                dir: p.toPath.dir,
                from: p.toPath.from.copy(),
                to: p.toPath.to.copy(),
                mainPathIdx: p.toPath.mainPathIdx,
                segIdx: p.toPath.segIdx,
                pathIdx: p.toPath.pathIdx
            }
        })
    }
    state.connectors = []
    for(let c of connectors){
        state.connectors.push({
            fromPath: {
                dir: c.fromPath.dir,
                from: c.fromPath.from.copy(),
                to: c.fromPath.to.copy(),
                mainPathIdx: c.fromPath.mainPathIdx,
                segIdx: c.fromPath.segIdx,
                pathIdx: c.fromPath.pathIdx
            },
            toPath: {
                dir: c.toPath.dir,
                from: c.toPath.from.copy(),
                to: c.toPath.to.copy(),
                mainPathIdx: c.toPath.mainPathIdx,
                segIdx: c.toPath.segIdx,
                pathIdx: c.toPath.pathIdx
            },
            fromPos: c.fromPos.copy(),
            toPos: c.toPos.copy(),
            dir: c.dir,
            segments: c.segments.map(s => ({a: {x: s.a.x, y: s.a.y}, b: {x: s.b.x, y: s.b.y}, id: s.id}))
        })
    }
    state.diffPathsConnectors = []
    for(let c of diffPathsConnectors){
        state.diffPathsConnectors.push({
            fromPath: {
                dir: c.fromPath.dir,
                from: c.fromPath.from.copy(),
                to: c.fromPath.to.copy(),
                mainPathIdx: c.fromPath.mainPathIdx,
                segIdx: c.fromPath.segIdx,
                pathIdx: c.fromPath.pathIdx
            },
            toPath: {
                dir: c.toPath.dir,
                from: c.toPath.from.copy(),
                to: c.toPath.to.copy(),
                mainPathIdx: c.toPath.mainPathIdx,
                segIdx: c.toPath.segIdx,
                pathIdx: c.toPath.pathIdx
            },
            fromPos: c.fromPos.copy(),
            toPos: c.toPos.copy(),
            dir: c.dir,
            segments: c.segments.map(s => ({a: {x: s.a.x, y: s.a.y}, b: {x: s.b.x, y: s.b.y}, id: s.id}))
        })
    }
    state.nodeID = nodeID
    state.anchor = anchor === undefined ? undefined : anchor.copy()
}

function inBoundsNodes(x, y, nodes){
    for(let n of nodes){
        let d = dist(x, y, n.pos.x, n.pos.y)
        if(d < 20) return n
    }
    return false
}

function undo(){
    if(undoStack.length == 0){
        restoreState(getNewFreshState())
        return
    }
    oldState = undoStack[undoStack.length - 1]
    undoStack.pop()
    restoreState(oldState)
    console.log('Restored state from undo stack. Stack size:', undoStack.length)
}

function keyPressed(){
    if(keyCode == 32){ 
        finishPath(true)
        saveToUndoStack()
    }
    if(key == ENTER) exportRoad()
    if(key == 'z') undo()
    if(key == UP_ARROW) stateIndexShowDebug = (stateIndexShowDebug + 1) % (undoStack.length)
}

function tooSharp(A, B, C){
    const angle = angleAtVertex(B, A, C)
    return angle < MIN_ANGLE && angle > -MIN_ANGLE
}


function mousePressed(){
    if(mouseX < 0 || mouseX > WIDTH || mouseY < 0 || mouseY > HEIGHT) return
    if(anchor === undefined){
        anchor = createVector(mouseX, mouseY)
        nodes.push({pos: anchor.copy(), prev: null, next: null, id: nodeID++, mainPathIdx: currPathIdx})
    } 
    else {
        let to = createVector(mouseX, mouseY)

        if(dist(anchor.x, anchor.y, to.x, to.y) < MIN_DIST_SEG) return

        let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
        //conect to the end of the same path
        if(inBoundNode.mainPathIdx == currPathIdx && inBoundNode.prev === null){
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

            nodes[nodes.length - 1].next = inBoundNode.id
            inBoundNode.prev = nodes[nodes.length - 1].id
        }
        else inBoundNode = undefined

        if(mouseIntersectsRoad() && !inBoundNode){
            to.x = currMousePos.x
            to.y = currMousePos.y
        }
        let inBoundNodeAux = inBoundsNodes(mouseX, mouseY, nodes)
        if(inBoundNodeAux){
            to = inBoundNodeAux.pos.copy()
        }

        if (paths[currPathIdx].length > 0) {
            const A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
            const B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;
            const C = to;
            if (tooSharp(A, B, C)) {
                return
            }
        }

        let mainAngle
        if(mainPaths[currPathIdx].length > 0) {
            const A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
            const B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;
            const C = to
            mainAngle = Math.abs(angleAtVertex(B, A, C))
        }

        mainPaths[currPathIdx].push({from: anchor.copy(), to: to.copy()})

        anchor = createVector(mouseX, mouseY)
        
        if(!inBoundsNodes(mouseX, mouseY, nodes)){
            nodes.push({pos: anchor.copy(), prev: nodes[nodes.length - 1].id, next: null, id: nodeID++, mainPathIdx: currPathIdx})
            nodes[nodes.length - 2].next = nodes[nodes.length - 1].id
        }

        let dir = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from)
        dir.normalize()
        let perp = createVector(-dir.y, dir.x)
        perp.mult(LANE_WIDTH)

        let newFrom1 = p5.Vector.add(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from, perp)
        let newTo1 = p5.Vector.add(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, perp)
        paths[currPathIdx].push(
            {from: newFrom1, 
                to: newTo1, 
                dir: 'forward', 
                mainPathIdx: currPathIdx, 
                segIdx: mainPaths[currPathIdx].length - 1, 
                pathIdx: currPathIdx
            })

        let newFrom2 = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from, perp)
        let newTo2 = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, perp)
        paths[currPathIdx+1].unshift({
            from: newFrom2, 
            to: newTo2, 
            dir: 'backward', 
            mainPathIdx: currPathIdx, 
            segIdx: mainPaths[currPathIdx].length - 1, 
            pathIdx: currPathIdx+1
        })

        
        if(true) {
            if(paths[currPathIdx].length > 1) {
                const forwardPaths = paths[currPathIdx];
                const backwardPaths = paths[currPathIdx + 1];
                const forPrev = forwardPaths[forwardPaths.length - 2];
                const forCurr = forwardPaths[forwardPaths.length - 1];
                const backPrev = backwardPaths[1];
                const backCurr = backwardPaths[0];
                prepareSegmentsForCurve(forPrev, forCurr, backPrev, backCurr, mainAngle)
                curveEndings(forPrev, forCurr, backPrev, backCurr, RAD_BEZIER, RES_BEZIER, forwardPaths.length - 2);
                //let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
                if(inBoundNode && inBoundNode.mainPathIdx == currPathIdx) {
                    prepareSegmentsForCurve(forCurr, forwardPaths[0], backCurr, backwardPaths[backwardPaths.length - 1], mainAngle);
                    curveEndings(forCurr, forwardPaths[0], backCurr, backwardPaths[backwardPaths.length - 1], RAD_BEZIER, RES_BEZIER, forwardPaths.length - 2);
                }
                // else { //connect to the end of the other path
                //     let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
                //     if(inBoundNode && inBoundNode.mainPathIdx != currPathIdx) connectToOtherPath(inBoundNode, forCurr, backCurr);
                // }
            }
        }    

        if(inBoundNode){
            finishPath(false)
        }


        calculateIntersections()
        calculateSegmentIntersections()
        generateInsideIntersections()
        generateUnconnectedIntersections()

        currMousePos.x = to.x
        currMousePos.y = to.y
    }
    saveToUndoStack()
}


function setCurrentSegment(){
    currMousePos.x = mouseX
    currMousePos.y = mouseY
    if(mainPaths.length === 0) {
        return
    } 
    else if(mainPaths[currPathIdx].length === 0){
        let closest = getClosestPointToPaths(currMousePos)
        if(closest && closest.point && dist(closest.point.x, closest.point.y, mouseX, mouseY) < LANE_WIDTH){
            line(currMousePos.x, currMousePos.y, closest.point.x, closest.point.y)
            currMousePos.x = closest.point.x
            currMousePos.y = closest.point.y
            
        }
    }
    if(anchor) {
        let to = createVector(mouseX, mouseY)
        if(dist(anchor.x, anchor.y, to.x, to.y) < MIN_DIST_SEG) return

        let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
        if(inBoundNode.mainPathIdx == currPathIdx && inBoundNode.prev === null){
            to = inBoundNode.pos.copy()
            

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

        }
        // if(inBoundNode && inBoundNode.mainPathIdx != currPathIdx){
        //     to = inBoundNode.pos.copy()
        //     currMousePos.x = to.x
        //     currMousePos.y = to.y
        //     inBoundNode = undefined
        // } 
        else inBoundNode = undefined

        if(mouseIntersectsRoad() && !inBoundNode){
            to.x = currMousePos.x
            to.y = currMousePos.y
        }
        let inBoundNodeAux = inBoundsNodes(mouseX, mouseY, nodes)
        if(inBoundNodeAux){
            to = inBoundNodeAux.pos.copy()
        }

        if (paths[currPathIdx].length > 0) {
            const A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
            const B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;
            const C = to;
            if (tooSharp(A, B, C)) {
                return
            }
        }

        let mainAngle
        if(mainPaths[currPathIdx].length > 0) {
            const A = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from;
            const B = mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to;
            const C = to;
            mainAngle = Math.abs(angleAtVertex(B, A, C))
        }

        mainPaths[currPathIdx].push({from: anchor.copy(), to: to.copy()})

        // anchor = createVector(mouseX, mouseY)
        
        // if(!inBoundNode){
        //     nodes.push({pos: anchor.copy(), prev: nodes[nodes.length - 1].id, next: null, id: nodeID++})
        //     nodes[nodes.length - 2].next = nodes[nodes.length - 1].id
        // }

        let dir = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from)
        dir.normalize()
        let perp = createVector(-dir.y, dir.x)
        perp.mult(LANE_WIDTH)

        let newFrom1 = p5.Vector.add(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from, perp)
        let newTo1 = p5.Vector.add(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, perp)
        paths[currPathIdx].push(
            {from: newFrom1, 
                to: newTo1, 
                dir: 'forward', 
                mainPathIdx: currPathIdx, 
                segIdx: mainPaths[currPathIdx].length - 1, 
                pathIdx: currPathIdx
            })

        let newFrom2 = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].from, perp)
        let newTo2 = p5.Vector.sub(mainPaths[currPathIdx][mainPaths[currPathIdx].length - 1].to, perp)
        paths[currPathIdx+1].unshift({
            from: newFrom2, 
            to: newTo2, 
            dir: 'backward', 
            mainPathIdx: currPathIdx, 
            segIdx: mainPaths[currPathIdx].length - 1, 
            pathIdx: currPathIdx+1
        })

        
        if(true) {
            if(paths[currPathIdx].length > 1) {
                const forwardPaths = paths[currPathIdx];
                const backwardPaths = paths[currPathIdx + 1];
                const forPrev = forwardPaths[forwardPaths.length - 2];
                const forCurr = forwardPaths[forwardPaths.length - 1];
                const backPrev = backwardPaths[1];
                const backCurr = backwardPaths[0];
                prepareSegmentsForCurve(forPrev, forCurr, backPrev, backCurr, mainAngle)
                curveEndings(forPrev, forCurr, backPrev, backCurr, RAD_BEZIER, RES_BEZIER, forwardPaths.length - 2);
                //let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
                if(inBoundNode && inBoundNode.mainPathIdx == currPathIdx) {
                    prepareSegmentsForCurve(forCurr, forwardPaths[0], backCurr, backwardPaths[backwardPaths.length - 1], mainAngle);
                    curveEndings(forCurr, forwardPaths[0], backCurr, backwardPaths[backwardPaths.length - 1], RAD_BEZIER, RES_BEZIER, forwardPaths.length - 2);
                }
                // else { //connect to the end of the other path
                //     let inBoundNode = inBoundsNodes(mouseX, mouseY, nodes)
                //     if(inBoundNode && inBoundNode.mainPathIdx != currPathIdx) connectToOtherPath(inBoundNode, forCurr, backCurr);
                // }
            }
        }
        

        // if(inBoundNode){
        //     finishPath(false)
        // }


        calculateIntersections()
        generateInsideIntersections()
        //generateOutsideIntersections()
        generateUnconnectedIntersections()

        currMousePos.x = to.x
        currMousePos.y = to.y

    }
}



function connectToOtherPath(node, forCurr, backCurr){
    auxIntersec = []
    for(let i = 0; i < paths.length; i++){
        let p = paths[i]
        if(i == currPathIdx || i == currPathIdx + 1) continue
        for(let seg of p){
            let inter1 = lineIntersection(forCurr.from, forCurr.to, seg.from, seg.to, false)
            let inter2 = lineIntersection(backCurr.from, backCurr.to, seg.from, seg.to, false)
            if(inter1){ 
                if(seg.dir == forCurr.dir){ 
                    //auxIntersec.push(inter1)
                    let forPrevFinal = forCurr
                    let backPrevFinal = backCurr
                    let forCurrFinal = seg
                    let backCurrFinal = paths[seg.mainPathIdx + 1][paths[seg.mainPathIdx + 1].length - 1]
                    //auxIntersec.push(backCurrFinal.to)
                    const A = forCurr.from.copy()
                    const B = createVector(inter1.x, inter1.y)
                    const C = backCurrFinal.to.copy()
                    let mainAngle = Math.abs(angleAtVertex(B, A, C))
                    prepareSegmentsForCurve(forPrevFinal, forCurrFinal, backPrevFinal, backCurrFinal, mainAngle);
                    let curves = curveEndings(forPrevFinal, forCurrFinal, backPrevFinal, backCurrFinal, RAD_BEZIER, RES_BEZIER, forCurrFinal.segIdx, true);
                    
                    let fromPath = paths[currPathIdx][paths[currPathIdx].length - 1]
                    let toPath = paths[node.mainPathIdx][0]
                    let toPos = toPath.from.copy()
                    let fromPos = fromPath.to.copy()


                    let fCurves = []
                    for(let seg of curves.forwardCurve){
                        fCurves.push({a: seg.from.copy(), b: seg.to.copy(), id: seg.segIdx})
                    }

                    diffPathsConnectors.push({
                        dir: 'forward',
                        fromPath: fromPath,
                        toPath: toPath,
                        segments: fCurves,
                        fromPos: fromPos,
                        toPos: toPos
                    })

                    //backward
                    fromPath = paths[node.mainPathIdx + 1][paths[node.mainPathIdx + 1].length - 1]
                    toPath = paths[currPathIdx + 1][0]
                    toPos = toPath.to.copy()
                    fromPos = fromPath.from.copy()

                    auxIntersec.push(fromPos)
                    auxIntersec.push(toPos)

                    let bCurves = []
                    for(let seg of curves.backwardCurve){
                        bCurves.push({a: seg.to.copy(), b: seg.from.copy(), id: seg.segIdx})
                    }

                    diffPathsConnectors.push({
                        dir: 'backward',
                        fromPath: fromPath,
                        toPath: toPath,
                        segments: bCurves,
                        fromPos: fromPos,
                        toPos: toPos
                    })

                    return
                }
            }
            if(inter2) {
                
            }
        }
    }
    console.log(auxIntersec.length)
}

function saveToUndoStack(){
    if(undoStack.length >= MAX_UNDO) undoStack.shift()
    let newState = getCurrentState()
    undoStack.push(newState)
}

function prepareSegmentsForCurve(forPrev, forCurr, backPrev, backCurr, mainAngle){
    const intersecFor = lineIntersection(forPrev.from, forPrev.to, forCurr.from, forCurr.to, false);
    const intersecBack = lineIntersection(backPrev.from, backPrev.to, backCurr.from, backCurr.to, false);
    if(intersecFor || intersecBack) {
        let primaryPrev, primaryCurr, secondaryPrev, secondaryCurr, primRadius, secRadius;
        if(intersecFor) {
            primaryPrev = forPrev;
            primaryCurr = forCurr;
            secondaryPrev = backPrev;
            secondaryCurr = backCurr;
            primRadius = mainAngle != undefined ? map(mainAngle, 0, PI, 1.5, 0.5) : 1;
            secRadius = mainAngle != undefined ? map(mainAngle, 0, PI, 1, 4.5) : 1;
        }
        else { 
            primaryPrev = backPrev;
            primaryCurr = backCurr;
            secondaryPrev = forPrev;
            secondaryCurr = forCurr;
            primRadius = mainAngle != undefined ? map(mainAngle, 0, PI, 1.5, 0.5) : 1;
            secRadius = mainAngle != undefined ? map(mainAngle, 0, PI, 1, 4.5) : 1;
        }
        const pt = lineIntersection(primaryPrev.from, primaryPrev.to, primaryCurr.from, primaryCurr.to, true);
        if(pt) {
            //.push(pt);
            // ----- Trim the secondary pair around the same point -----
            const distToSecEnd = p5.Vector.dist(createVector(pt.x, pt.y), secondaryPrev.to);
            const secPrevDir = p5.Vector.sub(secondaryPrev.to.copy ? secondaryPrev.to.copy() : secondaryPrev.to, secondaryPrev.from).normalize();
            secondaryPrev.to = p5.Vector.sub(secondaryPrev.to, secPrevDir.mult(Math.min(distToSecEnd * primRadius, p5.Vector.dist(secondaryPrev.from, secondaryPrev.to) - 1)));
            const secCurrDir = p5.Vector.sub(secondaryCurr.to, secondaryCurr.from).normalize();
            secondaryCurr.from = p5.Vector.add(secondaryCurr.from, secCurrDir.mult(Math.min(distToSecEnd * primRadius, p5.Vector.dist(secondaryCurr.from, secondaryCurr.to) - 1)));
            // auxIntersec.push(secondaryPrev.to);
            // auxIntersec.push(secondaryCurr.from);

            // ----- Trim the primary pair around the same point -----
            const distToPrimEnd = p5.Vector.dist(createVector(pt.x, pt.y), primaryPrev.to);
            const primPrevDir = p5.Vector.sub(primaryPrev.to, primaryPrev.from).normalize();
            primaryPrev.to = p5.Vector.sub(primaryPrev.to, primPrevDir.mult(Math.min(distToPrimEnd * secRadius, p5.Vector.dist(primaryPrev.from, primaryPrev.to) - 1)));
            const primCurrDir = p5.Vector.sub(primaryCurr.to, primaryCurr.from).normalize();
            primaryCurr.from = p5.Vector.add(primaryCurr.from, primCurrDir.mult(Math.min(distToPrimEnd * secRadius, p5.Vector.dist(primaryCurr.from, primaryCurr.to) - 1)));
            // auxIntersec.push(primaryPrev.to);
            // auxIntersec.push(primaryCurr.from);
        }
    }
}


function drawStatesDebug(){
    if(!showStateDebug) return
    let state = undoStack[stateIndexShowDebug]
    if(state === undefined) return
    let pathsToShow = state.mainPaths
    stroke(255, 200)
    strokeWeight(2)
    for(let p of pathsToShow){
        for(let seg of p){
            line(seg.from.x, seg.from.y, seg.to.x, seg.to.y)
        }
    }
    fill(255)
    noStroke()
    textSize(16)
    textAlign(LEFT, TOP)
    text(`State index: ${stateIndexShowDebug}`, 10, 10)
}


function isNan(x){
    return x !== x
}

function copySegment(seg){
    return {
        dir: seg.dir,
        from: createVector(seg.from.x, seg.from.y),
        to: createVector(seg.to.x, seg.to.y),
        pathIdx: seg.pathIdx == undefined ? undefined : seg.pathIdx,
        mainPathIdx: seg.mainPathIdx == undefined ? undefined : seg.mainPathIdx,
        segIdx: seg.segIdx == undefined ? undefined : seg.segIdx
    }
}
        
function getLargestSegIdx(path){
    let largestIdx = -1
    let largest = -1
    for(let i = 0; i < path.length; i++){
        if(path[i].segIdx > largest){
            largest = path[i].segIdx
            largestIdx = i
        }
    }
    return path[largestIdx]
}

function getSmallestSegIdx(path){
    let smallest = Infinity
    let smallestIdx = -1
    for(let i = 0; i < path.length; i++){
        if(path[i].segIdx < smallest){
            smallest = path[i].segIdx
            smallestIdx = i
        }
    }
    return path[smallestIdx]
}

function getClosest(pos, path){
    //gets the backward segment closes to the forward segment idx
    let closest = null
    let closestDist = Infinity
    for(let i = 0; i < path.length; i++){
        let d = dist(path[i].to.x, path[i].to.y, pos.x, pos.y)
        if(d < closestDist){
            closestDist = d
            closest = path[i]
        }
        
    }
    return closest
}

// if a path is finished is not connected all the way through, connect the ends
// if(p[0].dir === 'forward') {
//     pos1 = p[0].from
//     pos2 = p[p.length - 1].to
// }
// else{
//     pos1 = p[p.length - 1].from
//     pos2 = p[0].to
// }
function connectEndOfPaths(mainPathIndex){
    let forwardPaths = paths[mainPathIndex]
    let backwardPaths = paths[mainPathIndex+1]
    let startF = forwardPaths[0]
    let endF = forwardPaths[forwardPaths.length - 1]
    let startB = backwardPaths[backwardPaths.length - 1]
    let endB = backwardPaths[0]


    let segmentsFor = circularSemicircleSegments(endF.to, endB.to, 'left', RES_BEZIER)
    let segmentsBack = circularSemicircleSegments(startB.from, startF.from, 'left', RES_BEZIER)

    connectors.push({
        fromPos: endF.to.copy(),
        toPos: endB.to.copy(),
        fromPath: endF,
        toPath: endB,
        dir: 'forward',
        segments: segmentsFor
    })

    connectors.push({
        fromPos: startB.from.copy(),
        toPos: startF.from.copy(),
        fromPath: startB,
        toPath: startF,
        dir: 'backward',
        segments: segmentsBack
    })
}

function finishPath(unconnected){
    // if(unconnected){
    //     connectEndOfPaths(currPathIdx)
    // }
    if(!unconnected){
        hasToBeOrdered.push(currPathIdx)
        hasToBeOrdered.push(currPathIdx + 1)
    }
    currPathIdx += 2
    paths.push([], [])
    mainPaths.push([], [])
    anchor = undefined

}

function generateInsideIntersections() {
  intersecPaths = [];

  function cornerKey(entry){
    const [a,b] = entry.paths;
    const A = (a.dir === 'forward') ? 'F' : 'B';
    const B = (b.dir === 'forward') ? 'F' : 'B';
    return A + B; // "FF" | "FB" | "BF" | "BB"
  }

  function laneDirVector(seg){
    const v = (seg.dir === 'forward')
      ? p5.Vector.sub(seg.to, seg.from)
      : p5.Vector.sub(seg.from, seg.to);
    const m = v.mag();
    return (m === 0) ? createVector(1,0) : v.div(m);
  }

  // 2D cross of vectors
  function crossZVec(a, b){ return a.x * b.y - a.y * b.x; }

  // Signed side test for a point C w.r.t. directed line P->Q
  function crossZ(P, Q, C){
    const ABx = Q.x - P.x, ABy = Q.y - P.y;
    const ACx = C.x - P.x, ACy = C.y - P.y;
    return ABx * ACy - ABy * ACx;
  }

  // For a given diagonal, compute the other two corners and split into left/right of from->to
  function cornerLR(buckets, fromEntry, toEntry){
    const all = ['FF','FB','BF','BB'];
    const used = new Set([cornerKey(fromEntry), cornerKey(toEntry)]);
    const others = all.filter(k => !used.has(k)).map(k => buckets[k]).filter(Boolean);

    if (others.length < 2) return { left: null, right: null };

    const P = fromEntry.pos, Q = toEntry.pos;
    const c1 = others[0].pos, c2 = others[1].pos;

    let left = null, right = null;
    if (crossZ(P, Q, c1) > 0) left = c1; else right = c1;
    if (crossZ(P, Q, c2) > 0) left = left ?? c2; else right = right ?? c2;

    return { left, right };
  }

  function makeConnector(fromEntry, toEntry, buckets){
    const v = createVector(
      toEntry.pos.x - fromEntry.pos.x,
      toEntry.pos.y - fromEntry.pos.y
    );
    const vm  = v.mag();
    const dir = (vm === 0) ? createVector(1,0) : v.div(vm);

    const fromLane = chooseLaneForCorner(fromEntry, dir);
    const toLane   = chooseLaneForCorner(toEntry,   dir);

    // Determine left/right candidate corners for this diagonal
    const { left, right } = cornerLR(buckets, fromEntry, toEntry);

    // Choose one corner based on actual turn from source lane to target lane
    const u_from = laneDirVector(fromLane);
    const u_to   = laneDirVector(toLane);
    const z = crossZVec(u_from, u_to); // >0 left turn, <0 right turn

    let corner = null;
    const TURN_EPS = 1e-3;
    if (z >  TURN_EPS && left)  corner = right;
    else if (z < -TURN_EPS && right) corner = left;
    else corner = left || right || null; // near-straight or missing: pick available

      const P0 = { x: fromEntry.pos.x, y: fromEntry.pos.y };
        const P2 = { x: toEntry.pos.x,   y: toEntry.pos.y };

        const segs = corner
            ? curveSegmentsTowardCorner(P0, corner, P2, RES_BEZIER)
            : [{ a: P0, b: P2, id: 0 }]; // fallback straight

        return {
            fromPos: P0,
            toPos:   P2,
            fromPath: fromLane,
            toPath:   toLane,
            corner,                 // used only to bias curvature
            dir: (fromLane.dir === 'forward') ? 'forward' : 'backward',
            segments: segs
        };
        
  }

  function chooseLaneForCorner(entry, towardVec){
    let best = entry.paths[0], bestDot = -Infinity;
    for (const seg of entry.paths){
      const u = laneDirVector(seg);
      const dot = u.x * towardVec.x + u.y * towardVec.y;
      if (dot > bestDot){ bestDot = dot; best = seg; }
    }
    return best;
  }

  for (let [key, intersecs] of intersections) {
    // stable representative per bucket (closest to centroid)
    const cx = intersecs.reduce((s, it) => s + it.pos.x, 0) / intersecs.length;
    const cy = intersecs.reduce((s, it) => s + it.pos.y, 0) / intersecs.length;

    const buckets = { FF:null, FB:null, BF:null, BB:null };
    for (const e of intersecs){
      const k = cornerKey(e);
      if (!buckets[k]) buckets[k] = e;
      else {
        const dNew = dist(e.pos.x, e.pos.y, cx, cy);
        const dOld = dist(buckets[k].pos.x, buckets[k].pos.y, cx, cy);
        if (dNew < dOld) buckets[k] = e;
      }
    }

    const { FF, FB, BF, BB } = buckets;
    if (FF && BB){
      intersecPaths.push( makeConnector(FF, BB, buckets) ); // FF → BB
      intersecPaths.push( makeConnector(BB, FF, buckets) ); // BB → FF
    }
    if (FB && BF){
      intersecPaths.push( makeConnector(FB, BF, buckets) ); // FB → BF
      intersecPaths.push( makeConnector(BF, FB, buckets) ); // BF → FB
    }
  }
}

function generateInsideIntersectionsToGoBack(){
  // Assumes: intersections (Map), intersecPaths (Array), p5.Vector, createVector,
  //          dist, curveSegmentsTowardCorner(P0, corner, P2, RES_BEZIER), RES_BEZIER
  // NOTE: We DO NOT reset intersecPaths here; we just push more connectors.

  function cornerKey(entry){
    const [a,b] = entry.paths;
    const A = (a.dir === 'forward') ? 'F' : 'B';
    const B = (b.dir === 'forward') ? 'F' : 'B';
    return A + B; // "FF" | "FB" | "BF" | "BB"
  }

  function laneDirVector(seg){
    const v = (seg.dir === 'forward')
      ? p5.Vector.sub(seg.to, seg.from)
      : p5.Vector.sub(seg.from, seg.to);
    const m = v.mag();
    return (m === 0) ? createVector(1,0) : v.div(m);
  }

  // 2D cross of vectors
  function crossZVec(a, b){ return a.x * b.y - a.y * b.x; }

  // Signed side test for a point C w.r.t. directed line P->Q
  function crossZ(P, Q, C){
    const ABx = Q.x - P.x, ABy = Q.y - P.y;
    const ACx = C.x - P.x, ACy = C.y - P.y;
    return ABx * ACy - ABy * ACx;
  }

  // For a given edge (fromEntry → toEntry), compute the two *other* corners
  // and split them by left/right of the edge line.
  function cornerLR(buckets, fromEntry, toEntry){
    const all = ['FF','FB','BF','BB'];
    const used = new Set([cornerKey(fromEntry), cornerKey(toEntry)]);
    const others = all.filter(k => !used.has(k)).map(k => buckets[k]).filter(Boolean);

    if (others.length < 2) return { left: null, right: null };

    const P = fromEntry.pos, Q = toEntry.pos;
    const c1 = others[0].pos, c2 = others[1].pos;

    let left = null, right = null;
    if (crossZ(P, Q, c1) > 0) left = c1; else right = c1;
    if (crossZ(P, Q, c2) > 0) left = left ?? c2; else right = right ?? c2;

    return { left, right };
  }

  function chooseLaneForCorner(entry, towardVec){
    let best = entry.paths[0], bestDot = -Infinity;
    for (const seg of entry.paths){
      const u = laneDirVector(seg);
      const dot = u.x * towardVec.x + u.y * towardVec.y;
      if (dot > bestDot){ bestDot = dot; best = seg; }
    }
    return best;
  }

  function makeConnector(fromEntry, toEntry, buckets){
    const v = createVector(
      toEntry.pos.x - fromEntry.pos.x,
      toEntry.pos.y - fromEntry.pos.y
    );
    const vm  = v.mag();
    const dir = (vm === 0) ? createVector(1,0) : v.div(vm);

    const fromLane = chooseLaneForCorner(fromEntry, dir);
    const toLane   = chooseLaneForCorner(toEntry,   dir);

    // Determine left/right candidate corners for THIS edge
    const { left, right } = cornerLR(buckets, fromEntry, toEntry);

    // Turn direction from source lane to target lane
    const u_from = laneDirVector(fromLane);
    const u_to   = laneDirVector(toLane);
    const z = crossZVec(u_from, u_to); // >0 left turn, <0 right turn

    // Bias curvature AWAY from the turning side to keep connector on the "outside"
    // (mirrors your inside logic’s choice, which yields nice smoothness)
    let corner = null;
    const TURN_EPS = 1e-3;
    if (z >  TURN_EPS && left)  corner = right;
    else if (z < -TURN_EPS && right) corner = left;
    else corner = left || right || null; // near-straight or missing: pick available

    const P0 = { x: fromEntry.pos.x, y: fromEntry.pos.y };
    const P2 = { x: toEntry.pos.x,   y: toEntry.pos.y };

    const segs = corner
      ? curveSegmentsTowardCorner(P0, corner, P2, RES_BEZIER)
      : [{ a: P0, b: P2, id: 0 }]; // fallback straight

    return {
      fromPos: P0,
      toPos:   P2,
      fromPath: fromLane,
      toPath:   toLane,
      corner,                 // used only to bias curvature
      dir: (fromLane.dir === 'forward') ? 'forward' : 'backward',
      segments: segs,
      type: 'outside'
    };
  }

  for (let [key, intersecs] of intersections) {
    // stable representative per bucket (closest to centroid)
    const cx = intersecs.reduce((s, it) => s + it.pos.x, 0) / intersecs.length;
    const cy = intersecs.reduce((s, it) => s + it.pos.y, 0) / intersecs.length;

    const buckets = { FF:null, FB:null, BF:null, BB:null };
    for (const e of intersecs){
      const k = cornerKey(e);
      if (!buckets[k]) buckets[k] = e;
      else {
        const dNew = dist(e.pos.x, e.pos.y, cx, cy);
        const dOld = dist(buckets[k].pos.x, buckets[k].pos.y, cx, cy);
        if (dNew < dOld) buckets[k] = e;
      }
    }

    const { FF, FB, BF, BB } = buckets;
    console.log({FF, FB, BF, BB});

    // Four perimeter edges of the rhombus; add both directions for each edge.
    if (FF && FB){
      intersecPaths.push( makeConnector(FF, FB, buckets) ); // FF → FB
      intersecPaths.push( makeConnector(FB, FF, buckets) ); // FB → FF
    }
    if (FB && BB){
      intersecPaths.push( makeConnector(FB, BB, buckets) ); // FB → BB
      intersecPaths.push( makeConnector(BB, FB, buckets) ); // BB → FB
    }
    if (BB && BF){
      intersecPaths.push( makeConnector(BB, BF, buckets) ); // BB → BF
      intersecPaths.push( makeConnector(BF, BB, buckets) ); // BF → BB
    }
    if (BF && FF){
      intersecPaths.push( makeConnector(BF, FF, buckets) ); // BF → FF
      intersecPaths.push( makeConnector(FF, BF, buckets) ); // FF → BF
    }
  }
}

function generateOutsideIntersections(){
    
}


//EXACTLY before
function aBeforeb(a, b){
    if(a.to.x == b.from.x && a.to.y == b.from.y) return true
    return false
}

//EXACTLY after
function aAfterb(a, b){
    if(a.from.x == b.to.x && a.from.y == b.to.y) return true
    return false
}

function calculateIntersections(){
    intersections = new Map()
    for(let i = 0; i < paths.length; i++){
        for(let j = 0; j < paths.length; j++){
            for(let p1 of paths[i]){
                if(p1.pathIdx == undefined) continue
                for(let p2 of paths[j]){
                    if(p2.pathIdx == undefined) continue
                    //continue if p1 is before or after p2 in the same path
                    if(p1.pathIdx === p2.pathIdx){
                        if(aBeforeb(p1, p2) || aAfterb(p1, p2)) continue
                    }
                    let intersec = lineIntersection(p1.from, p1.to, p2.from, p2.to, false)
                    if(intersec){
                        // let key = p1.mainPathIdx + '-' + p1.segIdx + '_' + p2.mainPathIdx + '-' + p2.segIdx
                        // let revKey = p2.mainPathIdx + '-' + p2.segIdx + '_' + p1.mainPathIdx + '-' + p1.segIdx
                        // let hasKey = intersections.has(key)
                        // let hasRevKey = intersections.has(revKey)
                        // let finalKey = hasKey ? key : (hasRevKey ? revKey : key)
                        let finalKey = p1.mainPathIdx + '-' + p1.segIdx + '_' + p2.mainPathIdx + '-' + p2.segIdx
                        if(!intersections.has(finalKey)){
                            intersections.set(finalKey, [{pos: {x: intersec.x, y: intersec.y}, paths: [p1, p2]}])
                        } 
                        else {
                            intersections.get(finalKey).push({pos: {x: intersec.x, y: intersec.y}, paths: [p1, p2]})
                        }
                    }
                }
            }
        }
    }
}

function calculateSegmentIntersections(){
    segIntersections = []
    for(let i = 0; i < paths.length; i++){
        for(let j = 0; j < paths.length; j++){
            for(let p1 of paths[i]){
                if(p1.pathIdx == undefined) continue
                for(let p2 of paths[j]){
                    if(p2.pathIdx == undefined) continue
                    //continue if p1 is before or after p2 in the same path
                    if(p1.pathIdx === p2.pathIdx){
                        if(aBeforeb(p1, p2) || aAfterb(p1, p2)) continue
                    }
                    let intersec = lineIntersection(p1.from, p1.to, p2.from, p2.to, false)
                    if(intersec){
                        segIntersections.push({
                            pos: {x: intersec.x, y: intersec.y},
                            segments: [p1, p2]
                        })
                        auxIntersec.push(createVector(intersec.x, intersec.y))
                    }
                }
            }
        }
    }
}

function generateUnconnectedIntersections(){
    connectors = []
    for(let main of mainPaths){
        if(main.length == 0) continue
        //check if there is a diffIntersection involving the start or end of this main path
        //wrong
        for(let inter of diffPathsConnectors){
            if((inter.fromPath.mainPathIdx == mainPaths.indexOf(main) && inter.fromPath.segIdx == 0) ||
               (inter.toPath.mainPathIdx == mainPaths.indexOf(main) && inter.toPath.segIdx == 0) ||
               (inter.fromPath.mainPathIdx == mainPaths.indexOf(main) && inter.fromPath.segIdx == main.length - 1) ||
               (inter.toPath.mainPathIdx == mainPaths.indexOf(main) && inter.toPath.segIdx == main.length - 1)
            ) {
                //this means this intersection is already connected to the start or end of this main path
                return
            }
        }
        if(dist(main[0].from.x, main[0].from.y, main[main.length - 1].to.x, main[main.length - 1].to.y) > 1) {
            //this means the path is not closed
            connectEndOfPaths(mainPaths.indexOf(main))
        }
    }
}


function setup(){
    createCanvas(WIDTH, HEIGHT)
    //create button to export
    //text with info
    let infoText = createDiv('Press SPACE to end the current path. Press Z to undo.')
    infoText.position(10, HEIGHT + 10)
    let btnExport = createButton('Export road and go to Simulator')
    btnExport.mousePressed(() => {
        exportRoad()
        window.open('https://miguelrr11.github.io/Algorithms/pathTest/', "_blank");
    })
    btnExport.position(10, HEIGHT + 40)
}

function copyMainPaths(seg){
    return {from: createVector(seg.from.x, seg.from.y), to: createVector(seg.to.x, seg.to.y)}
}

function draw(){
    background(0)
    auxIntersec = [];

    saveState(oldState)

    setCurrentSegment()


    if(showMain) drawMainPaths()
    drawPaths()
    drawNodes()

    drawIntersections()
    drawIntersectionsPaths()

    drawBezierPointsDebug()

    drawStatesDebug()

    noFill()
    stroke(255, 100)
    ellipse(currMousePos.x, currMousePos.y, LANE_WIDTH * 2)
    let closest = getClosestPointToPaths(currMousePos)
    if(closest){
        if(closest.point && dist(closest.point.x, closest.point.y, currMousePos.x, currMousePos.y) < LANE_WIDTH) line(currMousePos.x, currMousePos.y, closest.point.x, closest.point.y)
    }


    restoreState(oldState)
}

function drawBezierPointsDebug(){
    if(!showBezierPoints) return
    if(auxIntersec.length > 0){
        stroke(255, 100)
        strokeWeight(15)
        for(let intersec of auxIntersec){
            point(intersec.x, intersec.y)
        }
        strokeWeight(1)
    }
}

function drawIntersectionsPaths(){
    let hoverP = null
    let all = [...intersecPaths, ...connectors, ...diffPathsConnectors]
    for(let p of all){
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
        stroke(0, 255, 0, 180)
        strokeWeight(7)
        line(hoverP.fromPath.from.x, hoverP.fromPath.from.y, hoverP.fromPath.to.x, hoverP.fromPath.to.y)
        stroke(255, 0, 0, 180)
        line(hoverP.toPath.from.x, hoverP.toPath.from.y, hoverP.toPath.to.x, hoverP.toPath.to.y)
        stroke(0, 0, 255)
        strokeWeight(2)
        for(let seg of hoverP.segments){
            line(seg.a.x, seg.a.y, seg.b.x, seg.b.y)
        }
        stroke(0, 0, 255)
        fill(0, 0, 255, 100)
        if(hoverP.corner) ellipse(hoverP.corner.x, hoverP.corner.y, 8)
        strokeWeight(1)
        noFill()
        return
    }
    strokeWeight(2)
    for(let p of all){
        let off  = 0
        stroke(0, 0, 255)
        //line(p.fromPos.x + off, p.fromPos.y, p.toPos.x + off, p.toPos.y)
        for(let seg of p.segments){
            line(seg.a.x + off, seg.a.y, seg.b.x + off, seg.b.y)
        }
        fill(0, 0, 255, 100)
        if(showIntersectionsPoints) ellipse(p.fromPos.x + off, p.fromPos.y, 8)
    }
}

function drawIntersections(){
    if(!showIntersections) return
    calculateIntersections()
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
    stroke(255, 100)
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
            let col = 0
            if(!showDiffColorsPerPath){
                col = showOrder ? map(i, 0, p.length, 50, 255) : 255
                if(p2.dir === 'forward') stroke(0, col, 0)
                else stroke(col, 0, 0)
                line(p2.from.x, p2.from.y, p2.to.x, p2.to.y)
            }
            else{
                push()
                colorMode(HSB)
                col = map(floor(paths.indexOf(p)/2), 0, paths.length/2, 0, 255)
                if(p2.dir === 'forward') strokeWeight(3.5)
                else strokeWeight(2)
                stroke(col, 255, 255)
                line(p2.from.x, p2.from.y, p2.to.x, p2.to.y)
                pop()
            }
            fill(255)
            let mainindex = p2.pathIdx !== undefined ? p2.pathIdx : '_'
            let idx = p2.segIdx !== undefined ? p2.segIdx : '_'
            if(showIdxPaths) text(mainindex + ' ' + idx, (p2.from.x + p2.to.x)/2, (p2.from.y + p2.to.y)/2)
            if(showAllIdx){
                let index = p2.segIdx != undefined ? p2.segIdx : '?'
                text(index, (p2.from.x + p2.to.x)/2, (p2.from.y + p2.to.y)/2 - 10)
            }
            noFill()
        }
    }
    
    for(let p of paths){
        noStroke()
        if(p.length === 0) continue
        let pos1, pos2
        if(p[0].dir === 'forward') {
            pos1 = p[0].from
            pos2 = p[p.length - 1].to
        }
        else{
            pos1 = p[p.length - 1].from
            pos2 = p[0].to
        }
        if(p[0].dir === 'forward') fill(0, 255, 0)
        else fill(255, 0, 0)
        circle(pos1.x, pos1.y, 8)
        square(pos2.x - 4, pos2.y - 4, 8)

        stroke(255)
        strokeWeight(3)
        // line(p[0].from.x, p[0].from.y, p[0].to.x, p[0].to.y)
        // line(p[p.length - 1].from.x, p[p.length - 1].from.y, p[p.length - 1].to.x, p[p.length - 1].to.y)
    }
}

function drawNodes(){
    if(!showNodes) return
    noFill()
    stroke(255, 50)
    for(let n of nodes){
        circle(n.pos.x, n.pos.y, 40)
        let hover = dist(mouseX, mouseY, n.pos.x, n.pos.y) < 20
        if(hover){
            circle(n.pos.x, n.pos.y, 22)
        }
    }
}

function toggleShowdebug(){
    if(SHOW_DEBUG){
        SHOW_DEBUG = false
        showMain = false
        showIdxPaths = false
        showAllIdx = false
        showIntersections = false
        showOrder = false
        showNodes = false
        showBezierPoints = false
        showStateDebug = false
        showIntersectionsPoints = false
    }
    else{
        SHOW_DEBUG = true
        showMain = true
        showIdxPaths = true
        showAllIdx = true
        showIntersections = true
        showOrder = true
        showNodes = true
        showBezierPoints = true
        showStateDebug = true
        showIntersectionsPoints = true
    }
}


function modifyEndingsCurved(forwardPrev, forwardCurr, backwardPrev, backwardCurr, radius = 20, resolution = 8, id) {
    const eps = 1e-6;
    let acum = id + 0.001
    acum = Math.round(acum * 10000) / 10000
    let distanceForward = p5.Vector.dist(forwardPrev.to, forwardCurr.from)
    let distanceBackward = p5.Vector.dist(backwardPrev.to, backwardCurr.from)
    let NF = Math.floor(Math.max(1, map(distanceForward, 0, LANE_WIDTH * 4, MIN_N_SEGS_PER_CURVE, MAX_N_SEGS_PER_CURVE, true)))
    let NB = Math.floor(Math.max(1, map(distanceBackward, 0, LANE_WIDTH * 4, MIN_N_SEGS_PER_CURVE, MAX_N_SEGS_PER_CURVE, true)))

    function unit(v) {
        const m = Math.hypot(v.x, v.y);
        return m < eps ? createVector(0, 0) : createVector(v.x / m, v.y / m);
    }

    function segmentLength(a, b) {
        return Math.hypot(b.x - a.x, b.y - a.y);
    }
    // Sample a cubic bezier p0->p3 with controls p1,p2 into NF or NB segments
    function bezierSegments(p0, p1, p2, p3, NF, NB, dirLabel) {
        const Nf = Math.max(2, Math.floor(NF ?? 2));
        const Nb = Math.max(2, Math.floor(NB ?? 2));
        const N = (dirLabel === 'forward') ? Nf : Nb;
        const segs = [];
        let prev = p0.copy();
        for(let i = 1; i <= N; i++) {
            const t = i / N;
            const x = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
            const y = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;
            const curr = createVector(x, y);
            if(dirLabel === 'forward') {
                segs.push({
                    from: prev.copy(),
                    to: curr.copy(),
                    dir: dirLabel,
                    segIdx: acum
                });
            }
            else {
                segs.unshift({
                    from: prev.copy(),
                    to: curr.copy(),
                    dir: dirLabel,
                    segIdx: acum
                });
            }
            acum += 0.001;
            acum = Math.round(acum * 10000) / 10000;
            prev = curr;
        }
        return segs;
    }
    // Handle one pair (prev,curr) and return {trimPrevTo, trimCurrFrom, curveSegs[]}
    function makeCurve(prevSeg, currSeg, dirLabel) {
        const P = lineIntersection(prevSeg.from, prevSeg.to, currSeg.from, currSeg.to, true);
        if(!P) return null;
        const Pvec = createVector(P.x, P.y);
        const prevDir = unit(p5.Vector.sub(prevSeg.to, prevSeg.from)); // A->B
        const currDir = unit(p5.Vector.sub(currSeg.to, currSeg.from)); // C->D
        // Distances available for trimming so we don't overshoot short segments
        const prevAvail = segmentLength(prevSeg.from, Pvec); // distance from prev.from to the corner along prev
        const currAvail = segmentLength(currSeg.from, Pvec); // distance from curr.from to the corner along curr (but direction matters)
        const r = Math.max(0, Math.min(radius, prevAvail - eps, currAvail - eps));
        if(r < eps) return null; // not enough room to curve
        // New joint endpoints
        const prevEnd = p5.Vector.sub(Pvec, p5.Vector.mult(prevDir, r)); // B'
        const currStart = p5.Vector.add(Pvec, p5.Vector.mult(currDir, r)); // C'
        // Replace hard-corner by cubic bezier with tangents aligned to the segments
        // Good handle length for a circular-ish fillet: 0.55191502449 * r (classic circle-bezier approximation)
        const handle = r * 0.55191502449;
        const c1 = p5.Vector.add(prevEnd, p5.Vector.mult(prevDir, handle)); // along prev direction
        const c2 = p5.Vector.sub(currStart, p5.Vector.mult(currDir, handle)); // opposite curr direction
        //const N = Math.max(2, Math.floor(resolution));
        const curveSegs = bezierSegments(prevEnd, c1, c2, currStart, NF, NB, dirLabel);
        return {
            prevEnd, // set prevSeg.to = prevEnd
            currStart, // set currSeg.from = currStart
            curveSegs
        };
    }
    const out = {
        forwardCurve: [],
        backwardCurve: []
    };
    // FORWARD side
    const f = makeCurve(forwardPrev, forwardCurr, 'forward');
    if(f) {
        forwardPrev.to = f.prevEnd.copy();
        forwardCurr.from = f.currStart.copy();
        out.forwardCurve = f.curveSegs;
    }
    // BACKWARD side
    const b = makeCurve(backwardPrev, backwardCurr, 'backward');
    if(b) {
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


function curveEndings(forwardPrev, forwardCurr, backwardPrev, backwardCurr, rad, res, id, dontModify = false){
    const curves = modifyEndingsCurved(forwardPrev, forwardCurr, backwardPrev, backwardCurr, rad, res, id);
    if(dontModify) return curves
    let forwardPaths = paths[currPathIdx]
    let backwardPaths = paths[currPathIdx+1]
    for(let p of forwardPaths) p.pathIdx = currPathIdx
    for(let p of backwardPaths) p.pathIdx = currPathIdx + 1
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

function getPathIdx(p){
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
        if(!hasToBeOrdered.includes(getPathIdx(p))) continue
        orderPath(p)
        console.log('ordered path ' + getId(p))
        if(p.length > 0 && p[0].dir === 'backward'){ 
            p.reverse()
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
    intersecPaths.push(...connectors, ...diffPathsConnectors)
    for(let inter of intersecPaths){
        let fromPath = inter.fromPath.pathIdx
        let fromSeg = inter.fromPath.segIdx
        let toPath = inter.toPath.pathIdx
        let toSeg = inter.toPath.segIdx

        //create a new path for the intersection segment
        //outputPaths.push({segments: [], id: outputPaths.length})
        // outputPaths[outputPaths.length - 1].segments.push({
        //     a: {x: inter.fromPos.x, y: inter.fromPos.y},
        //     b: {x: inter.toPos.x, y: inter.toPos.y},
        //     id: 0
        // })
        let arr = [...inter.segments]
        console.log(arr)
        outputPaths.push({segments: arr, id: outputPaths.length})

        let lastSegIdx = arr[arr.length - 1].id

        let interPathIdx = outputPaths.length - 1
        let interPath = outputPaths[interPathIdx]

        outputIntersections.push({
            from: {path: fromPath, segment: fromSeg},
            to: {path: interPathIdx, segment: interPath.segments[0].id},
            point: {x: inter.fromPos.x, y: inter.fromPos.y}
        })
        outputIntersections.push({
            from: {path: interPathIdx, segment: lastSegIdx},
            to: {path: toPath, segment: toSeg},
            point: {x: inter.toPos.x, y: inter.toPos.y}
        })

        console.log(fromPath + ' ' + fromSeg + ' ' + interPathIdx + ' ' + '0 ')
        console.log(interPathIdx + ' ' + '0 ' + toPath + ' ' + toSeg)

    }
    storeItem('laneWidth', LANE_WIDTH)
    storeItem('mainPaths', JSON.stringify(mainPaths))
    storeItem('paths', JSON.stringify(outputPaths))
    storeItem('intersections', JSON.stringify({outputIntersections}))

    console.log('exported')
}

function isInteger(value) {
    return Number.isInteger(value);
}

function curveSegmentsTowardCorner(P0, corner, P2, N, maxBendFrac = 0.3){
  const n = Math.max(2, Math.floor(N || 8));

  // Midpoint of chord and bias vector toward corner
  const mid = { x: (P0.x + P2.x) * 0.5, y: (P0.y + P2.y) * 0.5 };
  let vx = corner.x - mid.x;
  let vy = corner.y - mid.y;

  // Clamp control offset length
  const chord = Math.hypot(P2.x - P0.x, P2.y - P0.y);
  const maxLen = maxBendFrac * chord;
  const vlen = Math.hypot(vx, vy) || 1e-9;
  const scale = Math.min(1, maxLen / vlen);
  vx *= scale; vy *= scale;

  // Single quadratic control point (does NOT force passing through corner)
  const C = { x: mid.x + vx, y: mid.y + vy };

  function quadPoint(t){
    const u = 1 - t;
    return {
      x: u*u*P0.x + 2*u*t*C.x + t*t*P2.x,
      y: u*u*P0.y + 2*u*t*C.y + t*t*P2.y
    };
  }

  const segs = [];
  let prev = quadPoint(0);
  for (let i = 1; i <= n; i++){
    const t = i / n;
    const curr = quadPoint(t);
    segs.push({ a: {x: prev.x, y: prev.y}, b: {x: curr.x, y: curr.y}, id: i-1 });
    prev = curr;
  }
  return segs;
}

function equilateralCandidates(A, B, d){
  // A, B are {x,y}, d is how far from AB you want C
  const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

  const vx = B.x - A.x;
  const vy = B.y - A.y;

  // perpendicular directions
  let px = -vy;
  let py = vx;

  // normalize
  const len = Math.hypot(px, py) || 1e-9;
  px /= len;
  py /= len;

  // two possible C points
  const C1 = { x: M.x + px * d, y: M.y + py * d };
  const C2 = { x: M.x - px * d, y: M.y - py * d };

  return [C1, C2];
}

function circularSemicircleSegments(A, B, side = 'left', N = RES_BEZIER){
  const n = Math.max(2, Math.floor(N || 8));
  const vx = B.x - A.x, vy = B.y - A.y;
  const d  = Math.hypot(vx, vy);
  if (d < 1e-9) {
    // Degenerate: A and B coincide — return a tiny stub
    return [{ a: {x: A.x, y: A.y}, b: {x: A.x, y: A.y}, id: 0 }];
  }

  // Circle center and radius
  const M = { x: (A.x + B.x) * 0.5, y: (A.y + B.y) * 0.5 };
  const r = d * 0.5;

  // Orthonormal frame: u along A→B, n_left = +90° of u
  const ux = vx / d, uy = vy / d;
  const nLx = -uy, nLy = ux;                // left-normal
  const nx  = (side === 'left') ? nLx : -nLx;
  const ny  = (side === 'left') ? nLy : -nLy;

  // Parametric arc: θ goes from π (A) to 0 (B)
  function pointAtTheta(theta){
    const c = Math.cos(theta), s = Math.sin(theta);
    return {
      x: M.x + r * (c * ux + s * nx),
      y: M.y + r * (c * uy + s * ny)
    };
  }

  const segs = [];
  let prev = pointAtTheta(Math.PI); // A
  for (let i = 1; i <= n; i++){
    const theta = Math.PI - (i * Math.PI / n);
    const curr = pointAtTheta(theta);
    segs.push({ a: {x: prev.x, y: prev.y}, b: {x: curr.x, y: curr.y}, id: i-1 });
    prev = curr;
  }
  return segs;
}


function pointOnSegment(p, a, b){
    // Check if point p is on the line segment a-b
    const crossProduct = (p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y);
    if (Math.abs(crossProduct) > 1e-6) return false; // Not on the line

    const dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
    if (dotProduct < 0) return false; // Before a

    const squaredLengthAB = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
    if (dotProduct > squaredLengthAB) return false; // After b

    return true; // On the segment
}

function mouseIntersectsRoad(){
    //checks if the node at the mouse intersects with any segment with the only exception of the current path, final segments
    if(paths.length == 0 || paths[0].length < 2) return false
    let mousePos = {x: mouseX, y: mouseY}
    let radNodeMain = LANE_WIDTH * 2
    let radNodeBase = LANE_WIDTH
    for(let i = 0; i < mainPaths.length; i+=2){
        for(let seg of mainPaths[i]){
            let inters = circleIntersection(mousePos, radNodeMain, seg.from, seg.to)
            if(inters.length > 0){
                for(let inter of inters){
                    if(pointOnSegment(inter, seg.from, seg.to)){
                        //auxIntersec.push(inter)
                        return true
                    }
                }
            }
        }
        for(let seg of paths[i]){
            let inters = circleIntersection(mousePos, radNodeBase, seg.from, seg.to)
            if(inters.length > 0){
                for(let inter of inters){
                    if(pointOnSegment(inter, seg.from, seg.to)){
                        //auxIntersec.push(inter)
                        return true
                    }
                }
            }
        } 
        for(let seg of paths[i+1]){
            let inters = circleIntersection(mousePos, radNodeBase, seg.from, seg.to)
            if(inters.length > 0){
                for(let inter of inters){
                    if(pointOnSegment(inter, seg.from, seg.to)){
                        //auxIntersec.push(inter)
                        return true
                    }
                }
            }
        } 
    }
    return false
}

function circleIntersection(C, r, A, B){
    // C is center {x,y}, r is radius, A and B are endpoints of the segment
    const d = { x: B.x - A.x, y: B.y - A.y };
    const f = { x: A.x - C.x, y: A.y - C.y };

    const a = d.x * d.x + d.y * d.y;
    const b = 2 * (f.x * d.x + f.y * d.y);
    const c = (f.x * f.x + f.y * f.y) - r * r;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return []; // No intersection
    } else {
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDiscriminant) / (2 * a);
        const t2 = (-b + sqrtDiscriminant) / (2 * a);
        const intersections = [];
        if (t1 >= 0 && t1 <= 1) {
            intersections.push({ x: A.x + t1 * d.x, y: A.y + t1 * d.y });
        }
        if (t2 >= 0 && t2 <= 1 && discriminant > 0) {
            intersections.push({ x: A.x + t2 * d.x, y: A.y + t2 * d.y });
        }
        return intersections;
    }
}

function getClosestPointAndDisttoSeg(P, A, B){
    // P is point {x,y}, A and B are endpoints of the segment
    const AP = { x: P.x - A.x, y: P.y - A.y };
    const AB = { x: B.x - A.x, y: B.y - A.y };
    const ab2 = AB.x * AB.x + AB.y * AB.y;
    const ap_ab = AP.x * AB.x + AP.y * AB.y;
    let t = ap_ab / ab2;
    t = Math.max(0, Math.min(1, t)); // Clamp t to the segment
    const closest = { x: A.x + AB.x * t, y: A.y + AB.y * t };
    const dist = Math.hypot(P.x - closest.x, P.y - closest.y);
    return { point: closest, distance: dist };
}

function getClosestPointToPaths(P){
    let closestPoint = null
    let minDist = Infinity
    let mainPathIdx = -1
    for(let path of mainPaths){
        for(let seg of path){
            let res = getClosestPointAndDisttoSeg(P, seg.from, seg.to)
            if(res.distance < minDist){
                minDist = res.distance
                closestPoint = res.point
                mainPathIdx = path[0].mainPathIdx
            }
        }
    }
    return {point: closestPoint, distance: minDist, mainPathIdx: mainPathIdx}
}