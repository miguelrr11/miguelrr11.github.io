//Rigid Body Simulation
//Miguel Rodríguez
//13-02-2026

/*
static body: infinite mass, immovable
dynamic body: finite mass, affected by forces, collisions
spring: connects two anchor points on bodies (or world), 
        applies force based on displacement from rest length
bridge: special dynamic body that is very thin and meant to connect two points,
        they do not collide with each other to allow building structures.
        They can connect with each other through "bridge joints"
        They do collide with other bodies though
bridge joint: connects two bodies together. These two bodies will not collide with each other
*/

//descriptions
let staticDescription = "Static bodies are immovable objects with infinite mass. They are not affected by forces or collisions, but other bodies will collide with them and react accordingly. Use static bodies to create floors, walls, and other fixed structures in the simulation."
let dynamicDescription = "Dynamic bodies have finite mass and can move freely in response to forces and collisions. They are affected by gravity, air friction, and interactions with other bodies. Use dynamic bodies to create objects that can fall, bounce, and interact with the environment."
let springDescription = "Springs connect two anchor points, which can be on bodies or in the world. They apply a force based on how much they are stretched or compressed from their rest length. Springs can be used to create elastic connections between objects, like ropes, bouncy surfaces, or even simple machines."
let bridgeDescription = "Bridges are special dynamic bodies that are thin and designed to connect two points. They do not collide with each other, allowing you to build structures without them interfering with each other. Bridges can be connected to each other using 'bridge joints', which act like pin joints to maintain a fixed distance between the connected points."
let rectDescription = "Rectangles are dynamic bodies defined by their width and height. They can rotate and interact with other bodies in the simulation."
let circleDescription = "Circles are dynamic bodies defined by their radius. They can rotate and interact with other bodies in the simulation."
let deleteDescription = "Click on a body or spring to delete it."
let dragDescription = "Click and drag bodies to move them around."
let ropeDescription = "Ropes are made of multiple bridge elements connected by bridge joints."

p5.disableFriendlyErrors = true
let WIDTH = 600
let HEIGHT = 600

let startCircles = 50
let startRects = 15
let nCollisionsFrame = 0

// Spatial hash
const CELL_SIZE_SH = 20
let gridWidth = Math.ceil(WIDTH / CELL_SIZE_SH)
let gridHeight = Math.ceil(HEIGHT / CELL_SIZE_SH)

const gravity = 0.1
const airFriction = 0.005
let MAXSTEPS = 10

const percent = 0.8   // correction strength
const slop = 0.01     // penetration allowed before correction

const ROPE_SEGMENT_LENGTH = .75  // in cells

let bodies = []
let springs = []
let bridgeJoints = []
let jointConnectionSet = new Set() //to make lookup fast
let ropes = []  //just for rendering, they are actually made of bridges and bridge joints

let globalID = 0

const colBody = [180]
const colAnchor = [255, 100, 100]

const ENDPOINT_ANCHORS = [0, 1, 2, 3, 4] //body anchors that can be connected with joints (0-3 corners, 4 center)
let JOINT_CONNECT_DIST = 12  //distance at which bridge joints will automatically connect to nearby bridges when created
let JOINT_ITERATIONS = 6
let JOINT_STIFFNESS = 0.95
let JOINT_DAMPING = 0.95
let MAX_STRESS_JOINT = .5  //distance in cells at which bridge joints will break
let ACTIVE_MAX_STRESS_JOINT = .5

let gridMouseX = 0
let gridMouseY = 0
let cellSize = 30
let nCells = 30

let spatialHash = null

// Editor state
let dragStart = null  // {x, y} for body creation drag
let springRopeStart = null // {body, anchor} for spring first click
let fpsArr = Array(30).fill(60)
let collisionPoints = new Set()

let simState = {
    staticDynamicMode: 'dynamic',
    createMode: 'drag',
    running: true,
    snapGrid: false,
    showDebug: false,
    autoLengthSpring: false,
    lengthSpring: 10,  //in cells
    selectedBody: null,
    hoveredBody: null,
    unbreakableJoints: false,
    gravityEnabled: true
}

let tabs
let panel
let panelOptions
let panelAdvancedOptions
let createSelect, staticDynamicSelect, automaticLengthToggle, lengthSlider
let cteAngVelSlider, cteAngVelCB, unbreakJointsCB, gravityCB

function saveStateToLocal(){
    let savedBodies = bodies.map(b => {
        if(b.shape === 'rect' || b.shape === 'bridge') {
            return {
            id: b.id,
            pos: {x: b.pos.x - b.w/2, y: b.pos.y - b.h/2},
            w: b.w,
            h: b.h,
            shape: b.shape,
            radius: b.radius,
            isStatic: b.isStatic,
            cteAngVel: b.cteAngVel,
            cteAngVelToggle: b.cteAngVelToggle,
            angle: b.angle,
            isRope: b.isRope
        }}
        if(b.shape === 'circle') {
            return {
            id: b.id,
            pos: b.pos,
            r: b.r,
            shape: b.shape,
            radius: b.radius,
            isStatic: b.isStatic,
            cteAngVel: b.cteAngVel,
            cteAngVelToggle: b.cteAngVelToggle,
            angle: b.angle
        }}
    })
    let savedSprings = springs.map(s => {
        return {
            id: s.id,
            bodyA: s.bodyA != null ? s.bodyA.id : null,
            bodyB: s.bodyB != null ? s.bodyB.id : null,
            anchorA: s.anchorA,
            anchorB: s.anchorB,
            restLength: s.restLength,
            worldAnchorA: s.worldAnchorA,
            worldAnchorB: s.worldAnchorB,
        }
    })
    let savedBridgeJoints = bridgeJoints.map(j => {
        return {
            id: j.id,
            bodyA: j.bodyA != null ? j.bodyA.id : null,
            bodyB: j.bodyB != null ? j.bodyB.id : null,
            anchorA: j.anchorA,
            anchorB: j.anchorB,
        }
    })
    let savedRopes = ropes.map(r => {
        return {
            start: r.start ? {
                bodyID: r.start.body ? r.start.body.id : null,
                anchor: r.start.anchor
            } : null,
            end: r.end ? {
                bodyID: r.end.body ? r.end.body.id : null,
                anchor: r.end.anchor
            } : null,
            segments: r.segments.map(s => s.id),
            id: r.id
        }
    })
    localStorage.setItem("rigidBodySimState", JSON.stringify({simState, bodies: savedBodies, springs: savedSprings, bridgeJoints: savedBridgeJoints, ropes: savedRopes}))
}

function loadStateFromLocal(){
    let saved = localStorage.getItem("rigidBodySimState")
    if(saved){
        globalID = 0
        let parsed = JSON.parse(saved)
        simState = parsed.simState
        bodies = []
        springs = []
        bridgeJoints = []
        ropes = []
        parsed.bodies.forEach(b => {
            let newBody = null
            if(b.shape == "rect") newBody = createBodyFromRect(b.pos.x, b.pos.y, b.pos.x + b.w, b.pos.y + b.h, b.isStatic, b.angle)
            if(b.shape == "circle") newBody = createBodyFromCircle(b.pos.x, b.pos.y, b.r, b.isStatic, b.angle)
            if(b.shape == "bridge") newBody = createBridgeElement(b.pos.x, b.pos.y, b.pos.x + b.w, b.pos.y + b.h, b.isStatic, b.angle, false, b.w, b.h, b.isRope)
            if(b.cteAngVelToggle){
                newBody.cteAngVelToggle = b.cteAngVelToggle
                newBody.cteAngVel = b.cteAngVel
            }
            newBody.isRope = b.isRope
            newBody.id = b.id
        })
        parsed.springs.forEach(s => {
            let bodyA = bodies.find(b => b.id == s.bodyA)
            let bodyB = bodies.find(b => b.id == s.bodyB)
            let newSpring = createSpring(bodyA, s.anchorA, bodyB, s.anchorB, s.restLength, s.worldAnchorA, s.worldAnchorB)
            newSpring.id = s.id
        })
        parsed.bridgeJoints.forEach(j => {
            let bodyA = bodies.find(b => b.id == j.bodyA)
            let bodyB = bodies.find(b => b.id == j.bodyB)
            let newJoint = createBridgeJoint(bodyA, j.anchorA, bodyB, j.anchorB)
            newJoint.id = j.id
        })
        parsed.ropes.forEach(r => {
            let newRope = {
                start: r.start ? bodies.find(b => b.id == r.start.bodyID) : null,
                end: r.end ? bodies.find(b => b.id == r.end.bodyID) : null,
                segments: r.segments.map(s => bodies.find(b => b.id == s)),
            }
            newRope.id = r.id
            ropes.push(newRope)
        })
        setUIfromSimState()
    }
}

function windowResized(){
    WIDTH = windowWidth
    HEIGHT = windowHeight
    nCells = Math.floor(Math.max(WIDTH, HEIGHT) / cellSize)
    resizeCanvas(WIDTH, HEIGHT)
}

async function setup(){
    let fontPanel = await loadFont("migUI/main/bnr.ttf")

    WIDTH = windowWidth
    HEIGHT = windowHeight
    gridWidth = Math.ceil(WIDTH / CELL_SIZE_SH)
    gridHeight = Math.ceil(HEIGHT / CELL_SIZE_SH)
    nCells = Math.floor(Math.max(WIDTH, HEIGHT) / cellSize)
    spatialHash = new SpatialHash(CELL_SIZE_SH)
    createCanvas(WIDTH, HEIGHT)

    tabs = new TabManager({
        x: 10,
        y: 10,
        w: 200,
        font: fontPanel,
        title: "Rigid Body Sim",
    })

    tabs.panel.createSeparator()
    let buttonPause = tabs.panel.createButton("Pause Sim")
    buttonPause.w += 15
    buttonPause.setFunc(() => {
        simState.running = !simState.running
        buttonPause.setText(simState.running ? "Pause Sim" : "Resume Sim")
    })
    let buttonClear = tabs.panel.createButton("Clear Sim")
    buttonClear.setFunc(clearSim)
    buttonClear.pos.x += 15
    tabs.panel.createSeparator()

    panel = tabs.createTab("Main")
    panel.darkCol[3] = 175

    panelOptions = tabs.createTab("Body")
    panelOptions.darkCol[3] = 175

    panelAdvancedOptions = tabs.createTab("Advanced")
    panelAdvancedOptions.darkCol[3] = 175
    
    panel.createText("Create Mode")
    createSelect = panel.createSelect(["Rect", "Circle", "Bridge", "Spring", "Rope", "Delete", "Drag"], "Drag")
    createSelect.setFunc((arg) => {
        simState.createMode = arg.toLowerCase()
        springRopeStart = null
        dragStart = null
    }, true)
    createSelect.setHoverText([rectDescription, circleDescription, bridgeDescription, springDescription, ropeDescription, deleteDescription, dragDescription])

    panel.createSeparator()
    panel.createText("Body Type")
    staticDynamicSelect = panel.createSelect(["Static", "Dynamic"], "Dynamic")
    staticDynamicSelect.setFunc((arg) => {simState.staticDynamicMode = arg.toLowerCase()}, true)
    staticDynamicSelect.setHoverText([staticDescription, dynamicDescription])
    

    automaticLengthToggle = panelOptions.createCheckbox("Auto-length Springs", false)
    automaticLengthToggle.setFunc((arg) => {simState.autoLengthSpring = arg})
    lengthSlider = panelOptions.createSlider(1, 30, 10, '', true)
    lengthSlider.setFunc((arg) => {simState.lengthSpring = arg})
    panelOptions.createSeparator()

    cteAngVelCB = panelOptions.createCheckbox("Constant Angular Vel", false)
    cteAngVelCB.setFunc((arg) => {
        if(simState.selectedBody){
            simState.selectedBody.cteAngVelToggle = arg
        }
    })
    cteAngVelSlider = panelOptions.createSlider(-0.5, 0.5, 0, '', true)
    cteAngVelSlider.setFunc((arg) => {
        if(simState.selectedBody){
            simState.selectedBody.cteAngVel = arg
        }
    })

    panelOptions.createSeparator()


    unbreakJointsCB = panelOptions.createCheckbox("Unbreakable Joints", false)
    unbreakJointsCB.setFunc((arg) => {
        if(arg){
            simState.unbreakableJoints = true
        } else {
            simState.unbreakableJoints = false
        }
    })

    gravityCB = panelOptions.createCheckbox("Gravity", true)
    gravityCB.setFunc((arg) => {
        simState.gravityEnabled = arg
    })

    panelOptions.createSeparator()

    let snapToggle = panelAdvancedOptions.createCheckbox("Snap to Grid", false)
    snapToggle.setFunc((arg) => {simState.snapGrid = arg})
    let debugToggle = panelAdvancedOptions.createCheckbox("Show Debug", false)
    debugToggle.setFunc((arg) => {simState.showDebug = arg})

    panelAdvancedOptions.createSeparator()

    let iterSlider = panelAdvancedOptions.createSlider(1, 20, MAXSTEPS, 'Solver Iterations', true)
    iterSlider.setFunc((arg) => {MAXSTEPS = arg})
    let iterJointSlider = panelAdvancedOptions.createSlider(1, 20, JOINT_ITERATIONS, 'Joint Iterations', true)
    iterJointSlider.setFunc((arg) => {JOINT_ITERATIONS = arg})

    panel.createSeparator()

    let buttonSave = panel.createButton("Save")
    buttonSave.setFunc(() => {saveStateToLocal()})
    let buttonLoad = panel.createButton("Load")
    buttonLoad.setFunc(() => {loadStateFromLocal()})

    createBodyFromRect(100, height - 50, width - 100, height - 30, true) // floor
    createBodyFromRect(30, 0, 90, height - 30, true) // left wall
    createBodyFromRect(width - 90, 0, width - 30, height - 30, true) // right wall


    for(let i = 0; i < startCircles; i++){
        let x = random(100, width - 100)
        let y = random(100, height - 200)
        createBodyFromCircle(x, y, random(5, 30), false)
    }
    for(let i = 0; i < startRects; i++){
        let x1 = random(100, width - 200)
        let y1 = random(100, height - 200)
        let x2 = x1 + random(30, 120)
        let y2 = y1 + random(30, 120)
        createBodyFromRect(x1, y1, x2, y2, false)
    }


    //connect random springs
    // for(let i = 0; i < 4; i++){
    //     let bodyA = random(bodies)
    //     let bodyB = random(bodies)
    //     if(bodyA === bodyB) continue
    //     let anchorA = floor(random(4))
    //     let anchorB = floor(random(4))
    //     createSpring(bodyA, anchorA, bodyB, anchorB)
    // }
}

function clearSim(){
    bodies = []
    springs = []
    bridgeJoints = []
    ropes = []
}

function computeAABB(body){
    if(body.shape != 'circle') {
        const hw = body.w * 0.5;
        const hh = body.h * 0.5;

        const cos = Math.cos(body.angle);
        const sin = Math.sin(body.angle);
        // rotated AABB half extents
        const ex = Math.abs(hw * cos) + Math.abs(hh * sin);
        const ey = Math.abs(hw * sin) + Math.abs(hh * cos);

        body.minX = body.pos.x - ex;
        body.maxX = body.pos.x + ex;
        body.minY = body.pos.y - ey;
        body.maxY = body.pos.y + ey;
    } 
    
    else {
        body.minX = body.pos.x - body.r
        body.maxX = body.pos.x + body.r
        body.minY = body.pos.y - body.r
        body.maxY = body.pos.y + body.r
    }
}

function setSelectedBody(body){
    simState.selectedBody = body
    cteAngVelSlider.setValue(body ? body.angVel : 0)
    cteAngVelCB.setValue(body ? body.cteAngVelToggle : false)
}

function createSpring(bodyA, anchorA, bodyB, anchorB, restLength = null, worldAnchorA = null, worldAnchorB = null){
    let posA = worldAnchorA || getAnchorWorldPos(bodyA, anchorA) || { x: gridMouseX, y: gridMouseY }
    let posB = worldAnchorB || getAnchorWorldPos(bodyB, anchorB) || { x: gridMouseX, y: gridMouseY }
    let d = restLength !== null ? restLength : (simState.autoLengthSpring ? Math.hypot(posB.x - posA.x, posB.y - posA.y) : simState.lengthSpring * cellSize)
    let id = globalID++
    let newSpring = {
        bodyA, bodyB, anchorA, anchorB,
        worldAnchorA: posA,
        worldAnchorB: posB,
        restLength: d,
        stiffness: 3,
        damping: 0.3,
        id,
        shape: 'spring'
    }
    springs.push(newSpring)
    return newSpring
}

function createBodyFromCircle(x, y, r, isStatic, angle = 0){
    if(r < 3) return

    let area = Math.PI * r * r
    let m = isStatic ? Infinity : area / (cellSize * cellSize)
    let inv = isStatic ? 0 : 1 / m

    // Inertia of solid disk
    let iner = (1/2) * m * r * r
    let invI = isStatic ? 0 : 1 / iner

    let body = {
        shape: 'circle',
        area: area,
        r: r,
        pos: {x, y},
        vel: {x: 0, y: 0},
        angle: angle,
        angVel: 0,
        mass: m,
        invMass: inv,
        inertia: iner,
        invInertia: invI,
        isStatic: isStatic,
        friction: 1,
        cteAngVel: 0,
        cteAngVelToggle: false,
        id: globalID++,
        _pairStamp: -1,
        _pairWith: -1
    }

    bodies.push(body)
    return body
}

function createBodyFromRect(x1, y1, x2, y2, isStatic, angle = 0, isFromRope = false){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = Math.abs(x2 - x1)
    let h = Math.abs(y2 - y1)
    if(w < 5 || h < 5) return
    let m = isStatic ? Infinity : w * h / (cellSize * cellSize)
    if(isFromRope) m = 0.001  //bodies from ropes are lighter
    let inv = isStatic ? 0 : 1 / m
    let iner = (1/12) * m * (w*w + h*h)
    let invI = isStatic ? 0 : 1 / iner
    let id = globalID++
    let body = {
        area: w * h,
        shape: 'rect',
        w: w, h: h,
        pos: {x: cx, y: cy},
        vel: {x: 0, y: 0},
        angle: angle, angVel: 0,
        mass: m, invMass: inv,
        inertia: iner, invInertia: invI,
        isStatic: isStatic,
        friction: 1,
        cteAngVel: 0,
        cteAngVelToggle: false,
        id: id,
        _pairStamp: -1,
        _pairWith: -1
    }
    updateCornerLocations(body)
    bodies.push(body)
    return body
}

function createBridgeElement(x1, y1, x2, y2, isStatic = false, angle = undefined, autoConnect = true, defW = null, defH = null, isFromRope = false){
    let cx = (x1 + x2) / 2
    let cy = (y1 + y2) / 2
    let w = defW || Math.hypot(x2 - x1, y2 - y1)
    let h = defH || 6

    let rx1 = cx - w/2
    let ry1 = cy - h/2
    let rx2 = cx + w/2
    let ry2 = cy + h/2

    let bridge = createBodyFromRect(rx1, ry1, rx2, ry2, isStatic, angle, isFromRope)
    if(!bridge) return null
    bridge.shape = 'bridge'
    if(angle === undefined) bridge.angle = atan2(y2 - y1, x2 - x1)
    updateCornerLocations(bridge)
    if(autoConnect) autoConnectBridgeJoints(bridge)
    return bridge
}

function createRope(bodyA, anchorA, bodyB, anchorB, worldAnchorA = null, worldAnchorB = null){
    let posA = worldAnchorA || getAnchorWorldPos(bodyA, anchorA) || { x: gridMouseX, y: gridMouseY }
    let posB = worldAnchorB || getAnchorWorldPos(bodyB, anchorB) || { x: gridMouseX, y: gridMouseY }
    let x1 = posA.x
    let y1 = posA.y
    let x2 = posB.x
    let y2 = posB.y

    let start = bodyA && anchorA !== null ? {body: bodyA, anchor: anchorA} : null
    let end = bodyB && anchorB !== null ? {body: bodyB, anchor: anchorB} : null

    let rope = {start, end, segments: [], id: globalID++}
    ropes.push(rope)
    
    let segmentSize = ROPE_SEGMENT_LENGTH * cellSize
    let totalLength = Math.hypot(x2 - x1, y2 - y1)
    let numSegments = Math.ceil(totalLength / segmentSize)
    let ropeBodies = []
    //create briges of size segmentSize until we reach the end point and connect them with joints
    for(let i = 0; i < numSegments; i++){
        let t1 = i / numSegments
        let t2 = (i + 1) / numSegments
        let bx1 = lerp(x1, x2, t1)
        let by1 = lerp(y1, y2, t1)
        let bx2 = lerp(x1, x2, t2)
        let by2 = lerp(y1, y2, t2)
        let isStatic = false
        let angle = undefined
        let autoConnect = false
        let defW = null
        let defH = null
        let fromRope = true
        let bridge = createBridgeElement(bx1, by1, bx2, by2, isStatic, angle, autoConnect, defW, defH, fromRope)
        if(!bridge) continue
        bridge.isRope = true
        ropeBodies.push(bridge)
        if(i > 0){
            let prev = ropeBodies[i - 1]
            createBridgeJoint(prev, 1, bridge, 3)
        }
        rope.segments.push(bridge)
    }
    if(bodyA && anchorA !== null){
        createBridgeJoint(bodyA, anchorA, ropeBodies[0], 0)
    }
    if(bodyB && anchorB !== null){
        createBridgeJoint(bodyB, anchorB, ropeBodies[ropeBodies.length - 1], 2)
    }
    if(!bodyA && simState.staticDynamicMode == 'static') ropeBodies[0].isStatic = true
    if(!bodyB && simState.staticDynamicMode == 'static') ropeBodies[ropeBodies.length - 1].isStatic = true
    return ropeBodies.length > 0 ? ropeBodies[0] : null
}


function calculateStressBodies(){
    for(let b of bodies){
        b.stress = 0
        for(let sp of springs){
            if(sp.bodyA === b || sp.bodyB === b){
                let posA = getSpringEndPos(sp, 'A')
                let posB = getSpringEndPos(sp, 'B')
                let dx = posB.x - posA.x
                let dy = posB.y - posA.y
                let currentLength = Math.hypot(dx, dy)
                let displacement = currentLength - sp.restLength
                let forceMag = sp.stiffness * Math.abs(displacement)
                b.stress += forceMag / b.area
            }   
        }
        b.stress *= 10
    }
}

// Find the closest anchor point to the mouse within a threshold
function findNearestAnchor(mx, my, threshold, availableAnchors = null){
    let best = null
    let bestDist = threshold
    for(let b of bodies){
        for(let a = 0; a < 5; a++){
            let p = getAnchorWorldPos(b, a)
            let d = Math.hypot(mx - p.x, my - p.y)
            if(d < bestDist){
                if(availableAnchors && !availableAnchors.includes(a)) continue
                bestDist = d
                best = {body: b, anchor: a, pos: p}
            }
        }
    }
    return best
}

function findNearestAnchorGivenBody(mx, my, body, threshold, availableAnchors = null){
    if(!body) return null
    let best = null
    let bestDist = threshold
    for(let a = 0; a < 5; a++){
        let p = getAnchorWorldPos(body, a)
        let d = Math.hypot(mx - p.x, my - p.y)
        if(d < bestDist){
            if(availableAnchors && !availableAnchors.includes(a)) continue
            bestDist = d
            best = {body: body, anchor: a, pos: p}
        }
    }
    return best
}

function mousePressed(){
    if(gridMouseY < 0 || gridMouseX < 0 || gridMouseX > WIDTH || gridMouseY > HEIGHT || panel.isMouseInside()) return

    

    if(simState.createMode === 'rect' || simState.createMode === 'bridge' || simState.createMode === 'circle'){
        dragStart = {x: gridMouseX, y: gridMouseY}
    } 
    else if(simState.createMode === 'spring'){
        let hit = findNearestAnchorGivenBody(gridMouseX, gridMouseY, simState.hoveredBody, 20)
        if(hit){
            if(!springRopeStart){
                springRopeStart = hit
            } 
            else {
                if((hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor) && springRopeStart.body){
                    createSpring(springRopeStart.body, springRopeStart.anchor, hit.body, hit.anchor)
                }
                else if(hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor){
                    createSpring(null, null, hit.body, hit.anchor, null, springRopeStart, null)
                }
                springRopeStart = null
            }
        }
        else{
            if(springRopeStart && springRopeStart.body){
                createSpring(springRopeStart.body, springRopeStart.anchor, null, null)
                springRopeStart = null
            }
            else if(!springRopeStart){
                springRopeStart = {x: gridMouseX, y: gridMouseY}
            }
            else springRopeStart = null
        }
        return
    }
    else if(simState.createMode === 'rope'){
        let hit = findNearestAnchor(gridMouseX, gridMouseY, 20)
        if(hit){
            if(!springRopeStart){
                springRopeStart = hit
            } 
            else {
                if((hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor) && springRopeStart.body){
                    createRope(springRopeStart.body, springRopeStart.anchor, hit.body, hit.anchor)
                }
                else if(hit.body !== springRopeStart.body || hit.anchor !== springRopeStart.anchor){
                    createRope(null, null, hit.body, hit.anchor, springRopeStart, null)
                }
                springRopeStart = null
            }
        }
        else{
            if(springRopeStart && springRopeStart.body){
                createRope(springRopeStart.body, springRopeStart.anchor, null, null)
                springRopeStart = null
            }
            else if(springRopeStart){
                createRope(null, null, null, null, springRopeStart.start ? springRopeStart.start.pos : springRopeStart, {x: gridMouseX, y: gridMouseY})
                springRopeStart = null
            }
            else if(!springRopeStart){
                springRopeStart = {x: gridMouseX, y: gridMouseY}
            }
            else springRopeStart = null
        }
        return
    }

    setHoveredBody()
    let HB = simState.hoveredBody
    if(!HB) return
    let HBindex = HB.shape == 'spring' ? springs.indexOf(HB) : bodies.indexOf(HB)

    if(simState.createMode === 'delete'){
        // Check springs
        if(HB.shape === 'spring'){
            springs.splice(HBindex, 1)
            cleanupBridgeJoints()
            return
        }
        // Check bodies
        let segsToRemove = []
        let ropeIndexToRemove = null
        
        if((HB.shape === 'rect' || HB.shape === 'bridge')){
            bodies.splice(HBindex, 1)
            if(HB.isRope){
                for(let j = ropes.length - 1; j >= 0; j--){
                    if(ropeIndexToRemove !== null){
                        break
                    }
                    let rope = ropes[j]
                    rope.segments.forEach((seg, index) => {
                        if(seg === HB) {
                            console.log("Found rope segment to remove at index", index)
                            segsToRemove.push(seg)
                            ropeIndexToRemove = j
                        }
                    })
                }
            }
        }
        else if(HB.shape === 'circle'){
            bodies.splice(HBindex, 1)
        }

        //removes the rope associated with the segment if we removed a rope segment, and all its segments and joints
        if(segsToRemove.length > 0 && ropeIndexToRemove !== null){
            let rope = ropes[ropeIndexToRemove]
            for(let seg of rope.segments){
                segsToRemove.push(seg)
            }
            
            for(let seg of segsToRemove){
                for(let j of bridgeJoints){
                    if(j.bodyA === seg || j.bodyB === seg){
                        removeJoint(j)
                    }
                }
            }
            //and also remove the bodies
            bodies = bodies.filter(b => !segsToRemove.includes(b))
        }
        if(ropeIndexToRemove !== null) ropes.splice(ropeIndexToRemove, 1)
        cleanupBridgeJoints()
        return
    } 
    else {
        // No mode: drag bodies
        if((HB.shape === 'rect' || HB.shape === 'bridge')){
            HB.dragging = true
            HB.offsetDrag = {x: gridMouseX - HB.pos.x, y: gridMouseY - HB.pos.y}
            setSelectedBody(HB)
            return
        }
        if(HB.shape === 'circle'){
            HB.dragging = true
            HB.offsetDrag = {x: gridMouseX - HB.pos.x, y: gridMouseY - HB.pos.y}
            setSelectedBody(HB)
            return
        }
        
        setSelectedBody(null)

        return
    }
}

function setUIfromSimState(){
    cteAngVelSlider.setValue(simState.selectedBody ? simState.selectedBody.cteAngVel : 0)
    cteAngVelCB.setValue(simState.selectedBody ? simState.selectedBody.cteAngVelToggle : false)
    automaticLengthToggle.setValue(simState.automaticLength)
    lengthSlider.setValue(simState.lengthSpring)
    createSelect.setValue(simState.createMode.charAt(0).toUpperCase() + simState.createMode.slice(1))
    unbreakJointsCB.setValue(simState.unbreakableJoints)
    gravityCB.setValue(simState.gravityEnabled)
    staticDynamicSelect.setValue(simState.staticDynamicMode.charAt(0).toUpperCase() + simState.staticDynamicMode.slice(1))
}

function findHoveredSpring(){
    for(let i = springs.length - 1; i >= 0; i--){
        let sp = springs[i]
        let posA = getSpringEndPos(sp, 'A')
        let posB = getSpringEndPos(sp, 'B')
        let midX = (posA.x + posB.x) / 2
        let midY = (posA.y + posB.y) / 2
        let dx = posB.x - posA.x
        let dy = posB.y - posA.y
        let len = Math.hypot(dx, dy)
        let angle = atan2(dy, dx)
        let localMouseX = Math.cos(-angle) * (mouseX - midX) - Math.sin(-angle) * (mouseY - midY)
        let localMouseY = Math.sin(-angle) * (mouseX - midX) + Math.cos(-angle) * (mouseY - midY)
        if(localMouseX > -len/2 - 5 && localMouseX < len/2 + 5 && localMouseY > -10 && localMouseY < 10){
            return sp
        }
    }
}

function mouseReleased(){
    if(dragStart && simState.createMode === 'rect'){
        createBodyFromRect(dragStart.x, dragStart.y, gridMouseX, gridMouseY, simState.staticDynamicMode === 'static')
        dragStart = null
    }
    if(dragStart && simState.createMode === 'circle'){
        let r = Math.hypot(gridMouseX - dragStart.x, gridMouseY - dragStart.y)
        createBodyFromCircle(dragStart.x, dragStart.y, r, simState.staticDynamicMode === 'static')
        dragStart = null
    }
    if(dragStart && simState.createMode === 'bridge'){
        createBridgeElement(dragStart.x, dragStart.y, gridMouseX, gridMouseY, simState.staticDynamicMode === 'static')
        dragStart = null
    }
    for(let b of bodies) b.dragging = false
}

function setGridMousePos(){
    let gridMouseXFloor = Math.floor(mouseX / cellSize) * cellSize
    let gridMouseYFloor = Math.floor(mouseY / cellSize) * cellSize
    let gridMouseXCeil = Math.ceil(mouseX / cellSize) * cellSize
    let gridMouseYCeil = Math.ceil(mouseY / cellSize) * cellSize
    gridMouseX = simState.snapGrid ? (Math.abs(mouseX - gridMouseXFloor) < Math.abs(mouseX - gridMouseXCeil) ? 
        gridMouseXFloor : gridMouseXCeil) : mouseX
    gridMouseY = simState.snapGrid ? (Math.abs(mouseY - gridMouseYFloor) < Math.abs(mouseY - gridMouseYCeil) ? 
        gridMouseYFloor : gridMouseYCeil) : mouseY
}

function draw(){
    background(0)

    collisionPoints = new Set()
    nCollisionsFrame = 0

    setGridMousePos()
    
    handleDragBody()

    cleanupBridgeJoints()

    const STEPS = simState.running ? MAXSTEPS : 0
    let dt = 1 / STEPS
    let gravityDT = gravity * dt * (simState.gravityEnabled ? 1 : 0)
    for(let step = 0; step < STEPS; step++){

        for(let b of bodies){
            if(!b.isStatic) b.vel.y += gravityDT
        }

        applySpringForces(dt)

        integrateBodies(dt)

        for(let b of bodies) updateCornerLocations(b)

        solveBridgeJoints()

        spatialHash.beginFrame();

        for(body of bodies){
            spatialHash.insertBody(body);
        }

        spatialHash.computePairs((a,b) => {
            handleCollision(a,b);
        });

    }

    nCollisionsFrame = Math.floor(nCollisionsFrame / STEPS)

    calculateStressBodies()

    setHoveredBody()

    handleOutOfBounds()

    //set vel of dragging bodies
    let b = simState.hoveredBody
    if(b && b.dragging && !b.isStatic){
        b.vel.x = b.posFree.x - b.oldPosFree.x
        b.vel.y = b.posFree.y - b.oldPosFree.y
    }


    // Draw
    push()

    if(simState.showDebug) spatialHash.visualizeGrid()
    drawGrid()
    for(let sp of springs) drawSpring(sp)
    for(let rope of ropes) drawRope(rope)
    for(let b of bodies){
        if(b.shape == 'rect' || b.shape == 'bridge') drawBody(b)
        if(b.shape == 'circle') drawBodyCircle(b)
    }
    for(let joint of bridgeJoints) drawBridgeJoint(joint)
    drawEditor()
    drawFPSandINFO()

    pop()

    tabs.update();
    tabs.show();

}

function drawFPSandINFO(){
    fpsArr.shift()
    fpsArr.push(frameRate())
    let fpsMean = round(fpsArr.reduce((a, b) => a + b, 0) / fpsArr.length)
    fill(255)
    noStroke()
    textSize(14)
    textAlign(RIGHT, TOP)
    textLeading(8)
    text(`FPS: ${fpsMean}\n
          N Bodies: ${bodies.length}\n
          N Springs: ${springs.length}\n
          N Ropes: ${ropes.length}\n
          N Collisions: ${nCollisionsFrame}\n
          `, width - 10, 10)
}

function handleOutOfBounds(){
    let removedBody = false
    for(let i = bodies.length - 1; i >= 0; i--){
        let body = bodies[i]
        if(body.pos.y > HEIGHT + 200){
            bodies.splice(i, 1)
            removedBody = true
        }
        if(body.pos.x < -200 || body.pos.x > WIDTH + 200){
            bodies.splice(i, 1)
            removedBody = true
        }
    }
    if(removedBody) cleanupBridgeJoints()
}

function drawGrid(){
    push()
    stroke(40)
    strokeWeight(1)
    for(let i = 0; i <= nCells; i++){
        line(i * cellSize, 0, i * cellSize, HEIGHT)
        line(0, i * cellSize, WIDTH, i * cellSize)
    }
    pop()
}

function integrateBodies(dt){
    let air = airFriction * dt
    for(let b of bodies){
        if(b.cteAngVelToggle){
            b.angVel = b.cteAngVel
        }
        b.angle += b.angVel * dt

        if(b.isStatic) continue

        b.pos.x += b.vel.x * dt
        b.pos.y += b.vel.y * dt

        b.vel.x -= b.vel.x * air
        b.vel.y -= b.vel.y * air
        b.angVel -= b.angVel * air

    }
}

function handleCollision(bodyA, bodyB){
    let a = bodyA
    let b = bodyB
    if(isBridge(a) && isBridge(b)) return
    if(jointConnectionSet.has(`${a.id}-${b.id}`) || jointConnectionSet.has(`${b.id}-${a.id}`)) return
    let collision = null
    if((a.shape === 'rect' || a.shape === 'bridge') && (b.shape === 'rect' || b.shape === 'bridge')){
        collision = satRectRect(a, b)
    }
    else if(a.shape === 'circle' && b.shape === 'circle'){ 
        collision = satCircleCircle(a, b)
    }
    else if((a.shape === 'rect' || a.shape === 'bridge') && b.shape === 'circle') collision = satRectCircle(a, b)
    else if(a.shape === 'circle' && (b.shape === 'rect' || b.shape === 'bridge')) {
        collision = satRectCircle(b, a)
        if(collision) {
            collision.normal.x *= -1
            collision.normal.y *= -1
        }
    }

    if(collision && !(isBridge(a) && isBridge(b))){
        collisionPoints.add(`${roundToNearest(collision.contact.x, 10)},${roundToNearest(collision.contact.y, 10)}`)
        nCollisionsFrame++

        let normal = collision.normal
        let depth = collision.depth

        // Split separation by inverse mass ratio
        let invMassSum = a.invMass + b.invMass
        if(invMassSum === 0) return

        const percent = 0.8
        const slop = 0.01

        let correctionMag = Math.max(depth - slop, 0) * percent / invMassSum

        let nx = normal.x * correctionMag
        let ny = normal.y * correctionMag

        a.pos.x += nx * a.invMass
        a.pos.y += ny * a.invMass
        b.pos.x -= nx * b.invMass
        b.pos.y -= ny * b.invMass


        updateCornerLocations(a)
        updateCornerLocations(b)
        resolveCollision(a, b, normal, collision.contact)
    }
}

function isBridge(body){
    return body.shape === 'bridge'
}


function isItConnectedByJoint(bodyA, bodyB){
    return jointConnectionSet.has(`${bodyA.id}-${bodyB.id}`);
}


// SAT collision between two rectangles
// Returns {normal, depth, contact} with normal pointing from bodyB toward bodyA
function satRectRect(bodyA, bodyB){
    if(bodyA.isStatic && bodyB.isStatic) return null

    let axes = [bodyA.axis1, bodyA.axis2, bodyB.axis1, bodyB.axis2]

    let minOverlap = Infinity
    let smallestAxis = null
    let smallestAxisIndex = -1

    for(let i = 0; i < 4; i++){
        let axis = axes[i]
        let projA = projectPoints(bodyA.corners, axis)
        let projB = projectPoints(bodyB.corners, axis)

        let overlap = Math.min(projA.max, projB.max)
                     - Math.max(projA.min, projB.min)

        if(overlap <= 0) return null

        if(overlap < minOverlap){
            minOverlap = overlap
            smallestAxis = {x: axis.x, y: axis.y}
            smallestAxisIndex = i
        }
    }

    // Orient normal from B toward A
    let BtoA = {
        x: bodyA.pos.x - bodyB.pos.x,
        y: bodyA.pos.y - bodyB.pos.y
    }
    if(BtoA.x * smallestAxis.x + BtoA.y * smallestAxis.y < 0){
        smallestAxis.x *= -1
        smallestAxis.y *= -1
    }

    // Contact point: corner of incident body penetrating reference body
    let contactPoint
    if(smallestAxisIndex < 2){
        // Axis from A (reference face): B's corner penetrates A
        contactPoint = bodyB.corners[0]
        let maxProj = -Infinity
        for(let c of bodyB.corners){
            let proj = c.x * smallestAxis.x + c.y * smallestAxis.y
            if(proj > maxProj){
                maxProj = proj
                contactPoint = c
            }
        }
    } else {
        // Axis from B (reference face): A's corner penetrates B
        contactPoint = bodyA.corners[0]
        let minProj = Infinity
        for(let c of bodyA.corners){
            let proj = c.x * smallestAxis.x + c.y * smallestAxis.y
            if(proj < minProj){
                minProj = proj
                contactPoint = c
            }
        }
    }

    return {
        normal: smallestAxis,
        depth: minOverlap,
        contact: contactPoint
    }
}

function satCircleCircle(a, b){
    let dx = a.pos.x - b.pos.x
    let dy = a.pos.y - b.pos.y
    let rSum = a.r + b.r

    if(Math.abs(dx) > rSum) return null
    if(Math.abs(dy) > rSum) return null

    let distSq = dx*dx + dy*dy
    if(distSq >= rSum*rSum) return null
    
    let dist = Math.sqrt(distSq)

    let normal = {
        x: dx / dist,
        y: dy / dist
    }

    let depth = rSum - dist

    let contact = {
        x: b.pos.x + normal.x * b.r,
        y: b.pos.y + normal.y * b.r
    }

    return { normal, depth, contact }
}

function satRectCircle(rect, circle){

    let sinA = Math.sin(rect.angle)
    let cosA = Math.cos(rect.angle)

    // Transform circle center to rectangle local space
    let dx = circle.pos.x - rect.pos.x
    let dy = circle.pos.y - rect.pos.y

    let localX =  dx * cosA + dy * sinA
    let localY = -dx * sinA + dy * cosA

    let hw = rect.w * .5
    let hh = rect.h * .5

    // Check if circle center is inside rectangle
    let inside = Math.abs(localX) <= hw && Math.abs(localY) <= hh

    let closestX = localX < -hw ? -hw : (localX > hw ? hw : localX)
    let closestY = localY < -hh ? -hh : (localY > hh ? hh : localY)

    let normalLocal = {x: 0, y: 0}
    let depth = 0

    if(inside){
        // Circle center is inside rectangle
        // Push toward nearest face
        // Normal should point FROM circle TO rect (inward to rect)

        let dxFace = hw - Math.abs(localX)
        let dyFace = hh - Math.abs(localY)

        if(dxFace < dyFace){
            normalLocal.x = localX > 0 ? -1 : 1  // Flipped: points inward to rect
            depth = circle.r + dxFace
            // Set contact to the nearest vertical edge
            closestX = (localX > 0 ? hw : -hw)
            closestY = localY
        } else {
            normalLocal.y = localY > 0 ? -1 : 1  // Flipped: points inward to rect
            depth = circle.r + dyFace
            // Set contact to the nearest horizontal edge
            closestX = localX
            closestY = (localY > 0 ? hh : -hh)
        }
    }
    else {
        // Outside case
        // Normal should point FROM circle TO rect (toward closest point on rect)
        let diffX = localX - closestX
        let diffY = localY - closestY
        let distSq = diffX*diffX + diffY*diffY

        if(distSq > circle.r * circle.r) return null

        let dist = Math.sqrt(distSq)

        normalLocal.x = -diffX / dist  // Flipped: points from circle to rect
        normalLocal.y = -diffY / dist  // Flipped: points from circle to rect
        depth = circle.r - dist
    }

   

    // Convert normal back to world space
    let normal = {
        x: normalLocal.x * cosA - normalLocal.y * sinA,
        y: normalLocal.x * sinA + normalLocal.y * cosA
    }

    // Contact point on rectangle surface
    let contactLocal = {
        x: closestX,
        y: closestY
    }

    let contact = {
        x: rect.pos.x + contactLocal.x * cosA - contactLocal.y * sinA,
        y: rect.pos.y + contactLocal.x * sinA + contactLocal.y * cosA
    }

    return {
        normal,
        depth,
        contact
    }
}

function handleDragBody(){
    for(let b of bodies){
        b.oldPos = {x: b.pos.x, y: b.pos.y}
        b.posFree = b.posFree ? {x: b.posFree.x, y: b.posFree.y} : {x: b.pos.x, y: b.pos.y}
        b.oldPosFree = b.posFree ? {x: b.posFree.x, y: b.posFree.y} : {x: b.pos.x, y: b.pos.y}
        if(simState.createMode === 'drag' && b.dragging && mouseIsPressed){
            b.pos = {x: gridMouseX - b.offsetDrag.x, y: gridMouseY - b.offsetDrag.y}
            b.posFree = {x: mouseX, y: mouseY}
            b.vel = {x: 0, y: 0}
        }
    }
}

// Two-body impulse resolution
// Normal must point from bodyB toward bodyA
function resolveCollision(bodyA, bodyB, normal, contact){
    // Moment arms from centers to contact
    let rA = {
        x: contact.x - bodyA.pos.x,
        y: contact.y - bodyA.pos.y
    }
    let rB = {
        x: contact.x - bodyB.pos.x,
        y: contact.y - bodyB.pos.y
    }

    // Velocity at contact for each body
    let velA = {
        x: bodyA.vel.x - bodyA.angVel * rA.y,
        y: bodyA.vel.y + bodyA.angVel * rA.x
    }
    let velB = {
        x: bodyB.vel.x - bodyB.angVel * rB.y,
        y: bodyB.vel.y + bodyB.angVel * rB.x
    }

    // Relative velocity along normal (A relative to B)
    let relVelAlongNormal = (velA.x - velB.x) * normal.x + (velA.y - velB.y) * normal.y

    if(relVelAlongNormal > 0) return // separating

    let e = 0.2 // restitution

    let rACrossN = rA.x * normal.y - rA.y * normal.x
    let rBCrossN = rB.x * normal.y - rB.y * normal.x

    let denominator = bodyA.invMass + bodyB.invMass
                    + rACrossN * rACrossN * bodyA.invInertia
                    + rBCrossN * rBCrossN * bodyB.invInertia

    let j = -(1 + e) * relVelAlongNormal / denominator

    // Apply normal impulse to A (positive direction)
    bodyA.vel.x  += normal.x * j * bodyA.invMass
    bodyA.vel.y  += normal.y * j * bodyA.invMass
    bodyA.angVel += rACrossN * j * bodyA.invInertia

    // Apply normal impulse to B (negative direction)
    bodyB.vel.x  -= normal.x * j * bodyB.invMass
    bodyB.vel.y  -= normal.y * j * bodyB.invMass
    bodyB.angVel -= rBCrossN * j * bodyB.invInertia

    // Friction impulse (Coulomb model)
    let tangent = {
        x: (velA.x - velB.x) - relVelAlongNormal * normal.x,
        y: (velA.y - velB.y) - relVelAlongNormal * normal.y
    }
    let tangentLen = Math.hypot(tangent.x, tangent.y)
    if(tangentLen < 0.0001) return // no sliding
    tangent.x /= tangentLen
    tangent.y /= tangentLen

    let rACrossT = rA.x * tangent.y - rA.y * tangent.x
    let rBCrossT = rB.x * tangent.y - rB.y * tangent.x
    let frictionDenom = bodyA.invMass + bodyB.invMass
                      + rACrossT * rACrossT * bodyA.invInertia
                      + rBCrossT * rBCrossT * bodyB.invInertia

    let jt = -tangentLen / frictionDenom

    // Clamp by Coulomb's law: |jt| <= mu * |j|
    let mu = Math.sqrt(bodyA.friction * bodyB.friction)
    if(Math.abs(jt) > mu * j){
        jt = -mu * j
    }

    // Apply friction impulse
    bodyA.vel.x  += tangent.x * jt * bodyA.invMass
    bodyA.vel.y  += tangent.y * jt * bodyA.invMass
    bodyA.angVel += rACrossT * jt * bodyA.invInertia

    bodyB.vel.x  -= tangent.x * jt * bodyB.invMass
    bodyB.vel.y  -= tangent.y * jt * bodyB.invMass
    bodyB.angVel -= rBCrossT * jt * bodyB.invInertia
}

// Returns the world position of a body's anchor point
// 4 anchors at midpoints of all edges: 0=top, 1=right, 2=bottom, 3=left, 4=center
function getAnchorWorldPos(body, anchorIndex){
    if(!body || anchorIndex < 0 || anchorIndex > 4) return null
    if(anchorIndex === 4 || anchorIndex === null || anchorIndex === undefined){
        return {
            x: body.pos.x,
            y: body.pos.y
        }
    }
    if(body.shape === 'circle'){
        let angle = anchorIndex * (Math.PI/2) + body.angle
        return {
            x: body.pos.x + Math.cos(angle) * body.r,
            y: body.pos.y + Math.sin(angle) * body.r
        }
    }
    else if(body.shape === 'rect' || body.shape === 'bridge'){
        let offsets = [
            {x: 0,          y: -body.h/2}, // 0: top
            {x:  body.w/2,  y: 0},         // 1: right
            {x: 0,          y:  body.h/2}, // 2: bottom
            {x: -body.w/2,  y: 0}          // 3: left
        ]
        let lx = offsets[anchorIndex].x
        let ly = offsets[anchorIndex].y
        let c = Math.cos(body.angle)
        let s = Math.sin(body.angle)
        return {
            x: body.pos.x + lx * c - ly * s,
            y: body.pos.y + lx * s + ly * c
        }
    }
    console.log('Unknown shape in getAnchorWorldPos')
    return null
}

function localPointToWorld(body, localPoint){
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    return {
        x: body.pos.x + localPoint.x * c - localPoint.y * s,
        y: body.pos.y + localPoint.x * s + localPoint.y * c
    }
}

function worldPointToLocal(body, worldPoint){
    let dx = worldPoint.x - body.pos.x
    let dy = worldPoint.y - body.pos.y
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    return {
        x: dx * c + dy * s,
        y: -dx * s + dy * c
    }
}

function hasBridgeJoint(bodyA, anchorA, bodyB, anchorB){
    for(let joint of bridgeJoints){
        let sameOrder = joint.bodyA === bodyA
                     && joint.anchorA === anchorA
                     && joint.bodyB === bodyB
                     && joint.anchorB === anchorB
        let reverseOrder = joint.bodyA === bodyB
                        && joint.anchorA === anchorB
                        && joint.bodyB === bodyA
                        && joint.anchorB === anchorA
        if(sameOrder || reverseOrder) return true
    }
    return false
}

function createBridgeJoint(bodyA, anchorA, bodyB, anchorB){
    if(!bodyA || !bodyB || bodyA === bodyB) return null
    //if(!isBridge(bodyA) || !isBridge(bodyB)) return null
    if(hasBridgeJoint(bodyA, anchorA, bodyB, anchorB)) return null

    let worldA = getAnchorWorldPos(bodyA, anchorA)
    let worldB = getAnchorWorldPos(bodyB, anchorB)
    if(!worldA || !worldB) return null

    let joint = {
        bodyA,
        bodyB,
        anchorA,
        anchorB,
        localA: worldPointToLocal(bodyA, worldA),
        localB: worldPointToLocal(bodyB, worldB),
        id: globalID++,
        stress: 0
    }
    addJoint(joint)
    return joint
}

function setHoveredBody(){
    //iterate through all bodies and springs and find if mouse is hovering over any of them, and set simState.hoveredBody
    simState.hoveredBody = null
    simState.hoveredSpring = null
    for(let b of bodies){
        if((b.shape == 'rect' || b.shape == 'bridge') && pointInRect({x: mouseX, y: mouseY}, b, true)){
            simState.hoveredBody = b
            return
        }
        if(b.shape === 'circle' && pointInCircle({x: mouseX, y: mouseY}, b, true)){
            simState.hoveredBody = b
            return
        }
    }
    let hoveredSpring = findHoveredSpring()
    if(hoveredSpring){
        simState.hoveredSpring = hoveredSpring
        return
    }
}

function addJoint(joint){
    bridgeJoints.push(joint)
    jointConnectionSet.add(`${joint.bodyA.id}-${joint.bodyB.id}`);
    jointConnectionSet.add(`${joint.bodyB.id}-${joint.bodyA.id}`);
}

function removeJoint(joint){
    let index = bridgeJoints.indexOf(joint)
    if(index !== -1) bridgeJoints.splice(index, 1)
    jointConnectionSet.delete(`${joint.bodyA.id}-${joint.bodyB.id}`);
    jointConnectionSet.delete(`${joint.bodyB.id}-${joint.bodyA.id}`);
}

function autoConnectBridgeJoints(newBridge){
    if(!newBridge || !isBridge(newBridge)) return

    let usedTargets = []

    for(let anchorA of ENDPOINT_ANCHORS){
        let posA = getAnchorWorldPos(newBridge, anchorA)
        if(!posA) continue

        let best = null
        let bestDist = JOINT_CONNECT_DIST

        for(let bodyB of bodies){
            if(bodyB === newBridge) continue

            for(let anchorB of ENDPOINT_ANCHORS){
                let targetAlreadyUsed = usedTargets.some((target) => target.body === bodyB && target.anchor === anchorB)
                if(targetAlreadyUsed) continue
                if(hasBridgeJoint(newBridge, anchorA, bodyB, anchorB)) continue

                let posB = getAnchorWorldPos(bodyB, anchorB)
                let d = Math.hypot(posB.x - posA.x, posB.y - posA.y)

                if(d <= bestDist){
                    bestDist = d
                    best = {bodyB, anchorB}
                }
            }
        }

        if(best){
            createBridgeJoint(newBridge, anchorA, best.bodyB, best.anchorB)
            usedTargets.push({body: best.bodyB, anchor: best.anchorB})
        }
    }
}

function solveBridgeJoints(){
    const jointCount = bridgeJoints.length;
    if(jointCount === 0) return;

    const stiffness = JOINT_STIFFNESS;
    const damping = JOINT_DAMPING;
    const minDist = 0.0001;

    for(let iter = 0; iter < JOINT_ITERATIONS; iter++){
        const forward = iter % 2 === 0;
        const start = forward ? 0 : jointCount - 1;
        const end = forward ? jointCount : -1;
        const step = forward ? 1 : -1;

        for(let i = start; i !== end; i += step){
            const joint = bridgeJoints[i];
            const bodyA = joint.bodyA;
            const bodyB = joint.bodyB;
            
            // Early exit conditions
            if(!bodyA || !bodyB) continue;
            const aStatic = bodyA.isStatic;
            const bStatic = bodyB.isStatic;
            //if(aStatic && bStatic) continue;

            // Compute world positions inline to avoid function call overhead
            const localA = joint.localA;
            const localB = joint.localB;
            const cosA = Math.cos(bodyA.angle);
            const sinA = Math.sin(bodyA.angle);
            const cosB = Math.cos(bodyB.angle);
            const sinB = Math.sin(bodyB.angle);
            
            const worldAx = bodyA.pos.x + (localA.x * cosA - localA.y * sinA);
            const worldAy = bodyA.pos.y + (localA.x * sinA + localA.y * cosA);
            const worldBx = bodyB.pos.x + (localB.x * cosB - localB.y * sinB);
            const worldBy = bodyB.pos.y + (localB.x * sinB + localB.y * cosB);

            const dx = worldBx - worldAx;
            const dy = worldBy - worldAy;
            const distSq = dx * dx + dy * dy;
            
            if(distSq < minDist * minDist) continue;
            
            const dist = Math.sqrt(distSq);

            joint.stress = (dist * stiffness) / cellSize
            if(aStatic && bStatic) continue;

            const invDist = 1 / dist;
            const nx = dx * invDist;
            const ny = dy * invDist;

            // Relative positions
            const rAx = worldAx - bodyA.pos.x;
            const rAy = worldAy - bodyA.pos.y;
            const rBx = worldBx - bodyB.pos.x;
            const rBy = worldBy - bodyB.pos.y;

            const rACrossN = rAx * ny - rAy * nx;
            const rBCrossN = rBx * ny - rBy * nx;
            
            const invMassSum = bodyA.invMass + bodyB.invMass
                             + rACrossN * rACrossN * bodyA.invInertia
                             + rBCrossN * rBCrossN * bodyB.invInertia;
            
            if(invMassSum === 0) continue;

            const invMassSumRecip = 1 / invMassSum;
            //const positionImpulse = dist * stiffness * invMassSumRecip

            // Apply position correction

            // XPBD compliance — set to 0 for rigid, small value for slight softness
            const compliance = 0; // try 0.0001 if you want a little give
            const lambda = -dist / (invMassSum + compliance);

            if(!aStatic){
                bodyA.pos.x -= nx * lambda * bodyA.invMass;
                bodyA.pos.y -= ny * lambda * bodyA.invMass;
                bodyA.angle -= rACrossN * lambda * bodyA.invInertia;
            }
            if(!bStatic){
                bodyB.pos.x += nx * lambda * bodyB.invMass;
                bodyB.pos.y += ny * lambda * bodyB.invMass;
                bodyB.angle += rBCrossN * lambda * bodyB.invInertia;
            }

            // Compute velocities inline
            const velAx = bodyA.vel.x - rAy * bodyA.angVel;
            const velAy = bodyA.vel.y + rAx * bodyA.angVel;
            const velBx = bodyB.vel.x - rBy * bodyB.angVel;
            const velBy = bodyB.vel.y + rBx * bodyB.angVel;
            
            const relVelAlongJoint = (velBx - velAx) * nx + (velBy - velAy) * ny;
            const dampingImpulse = relVelAlongJoint * damping * invMassSumRecip;

            // Apply damping
            if(!aStatic){
                const dampA = dampingImpulse * bodyA.invMass;
                bodyA.vel.x += nx * dampA;
                bodyA.vel.y += ny * dampA;
                bodyA.angVel += rACrossN * dampingImpulse * bodyA.invInertia;
            }
            if(!bStatic){
                const dampB = dampingImpulse * bodyB.invMass;
                bodyB.vel.x -= nx * dampB;
                bodyB.vel.y -= ny * dampB;
                bodyB.angVel -= rBCrossN * dampingImpulse * bodyB.invInertia;
            }

            updateCornerLocations(bodyA);
            updateCornerLocations(bodyB); 
        }
    }
    handleBreakingJoints();
}

function handleBreakingJoints(){
    ACTIVE_MAX_STRESS_JOINT = simState.unbreakableJoints ? Infinity : MAX_STRESS_JOINT
    for(let i = bridgeJoints.length - 1; i >= 0; i--){
        let joint = bridgeJoints[i]
        if(joint.stress > ACTIVE_MAX_STRESS_JOINT){
            divideRope(joint.bodyA, joint.bodyB)
            removeJoint(joint)
        }
    }
}

function divideRope(bodyA, bodyB){
    if(!bodyA.isRope || !bodyB.isRope) return
    let ropeIndex = findRopeIndexByBody(bodyA)
    if(ropeIndex === -1) ropeIndex = findRopeIndexByBody(bodyB)
    if(ropeIndex === -1) return
    let rope = ropes[ropeIndex]
    let segments = rope.segments
    let indexBodyA = segments.findIndex((seg) => seg.id === bodyA.id)
    let indexBodyB = segments.findIndex((seg) => seg.id === bodyB.id)
    let segmentsA = segments.slice(0, indexBodyA + 1)
    let segmentsB = segments.slice(indexBodyB)
    rope.segments = segmentsA
    let newRope = {
        start: (segmentsB[0] && segmentsB[0].body) ? segmentsB[0].body : null,
        end: (segmentsB[segmentsB.length - 1] && segmentsB[segmentsB.length - 1].body) ? segmentsB[segmentsB.length - 1].body : null,
        segments: segmentsB,
        id: globalID++
    }
    ropes.push(newRope)
}

function findRopeIndexByBody(body){
    return ropes.findIndex((rope) => rope.segments.some((seg) => seg.id === body.id))
}

function cleanupBridgeJoints(){
    bridgeJoints = bridgeJoints.filter((joint) => bodies.includes(joint.bodyA) && bodies.includes(joint.bodyB))
}

// Returns the velocity at a body's anchor point (linear + angular contribution)
function getAnchorVelocity(body, anchorWorldPos){
    let rx = anchorWorldPos.x - body.pos.x
    let ry = anchorWorldPos.y - body.pos.y
    return {
        x: body.vel.x - body.angVel * ry,
        y: body.vel.y + body.angVel * rx
    }
}

// Get the world position of either end of a spring
function getSpringEndPos(spring, side){
    let body = side === 'A' ? spring.bodyA : spring.bodyB
    let anchor = side === 'A' ? spring.anchorA : spring.anchorB
    let worldAnchor = side === 'A' ? spring.worldAnchorA : spring.worldAnchorB
    if(body === null || body === undefined) return {x: worldAnchor.x, y: worldAnchor.y}
    return getAnchorWorldPos(body, anchor)
}

function applySpringForces(dt){
    for(let sp of springs){
        let posA = getSpringEndPos(sp, 'A')
        let posB = getSpringEndPos(sp, 'B')

        let dx = posB.x - posA.x
        let dy = posB.y - posA.y
        let currentLength = Math.hypot(dx, dy)
        if(currentLength < 0.0001) continue

        // Unit direction A → B
        let dirX = dx / currentLength
        let dirY = dy / currentLength

        // Spring force: pulls together when stretched, pushes apart when compressed
        let displacement = currentLength - sp.restLength
        let forceMag = sp.stiffness * displacement

        // Damping: project relative velocity onto spring axis
        let velA = sp.bodyA ? getAnchorVelocity(sp.bodyA, posA) : {x: 0, y: 0}
        let velB = sp.bodyB ? getAnchorVelocity(sp.bodyB, posB) : {x: 0, y: 0}
        let relVelAlongSpring = (velB.x - velA.x) * dirX + (velB.y - velA.y) * dirY
        forceMag += sp.damping * relVelAlongSpring

        let fx = forceMag * dirX
        let fy = forceMag * dirY

        // Apply to body A (force toward B)
        if(sp.bodyA && !sp.bodyA.isStatic){
            let rAx = posA.x - sp.bodyA.pos.x
            let rAy = posA.y - sp.bodyA.pos.y
            sp.bodyA.vel.x += fx * sp.bodyA.invMass * dt
            sp.bodyA.vel.y += fy * sp.bodyA.invMass * dt
            sp.bodyA.angVel += (rAx * fy - rAy * fx) * sp.bodyA.invInertia * dt
        }

        // Apply to body B (force toward A, opposite)
        if(sp.bodyB && !sp.bodyB.isStatic){
            let rBx = posB.x - sp.bodyB.pos.x
            let rBy = posB.y - sp.bodyB.pos.y
            sp.bodyB.vel.x -= fx * sp.bodyB.invMass * dt
            sp.bodyB.vel.y -= fy * sp.bodyB.invMass * dt
            sp.bodyB.angVel -= (rBx * fy - rBy * fx) * sp.bodyB.invInertia * dt
        }
    }
}

function pointInRect(point, body, increaseHitBox = false){
    let effectiveHeight = increaseHitBox ? body.h + 15 : body.h
    let effectiveWidth = increaseHitBox ? body.w + 15 : body.w
    let localX = point.x - body.pos.x
    let localY = point.y - body.pos.y
    let c = Math.cos(-body.angle)
    let s = Math.sin(-body.angle)
    let rotatedX = localX * c - localY * s
    let rotatedY = localX * s + localY * c
    return Math.abs(rotatedX) <= effectiveWidth / 2 && Math.abs(rotatedY) <= effectiveHeight / 2
}

function pointInCircle(point, body, increaseHitBox = false){
    let dx = point.x - body.pos.x
    let dy = point.y - body.pos.y
    let effectiveRadius = increaseHitBox ? body.r + 7 : body.r
    return dx*dx + dy*dy <= effectiveRadius * effectiveRadius
}


function projectPoints(points, axis){
    let min = Infinity
    let max = -Infinity

    for(let p of points){
        let dot = p.x * axis.x + p.y * axis.y
        min = Math.min(min, dot)
        max = Math.max(max, dot)
    }

    return {min, max}
}


function updateCornerLocations(body){
    if(body.shape === 'circle') return
    let hw = body.w * .5
    let hh = body.h * .5
    let c = Math.cos(body.angle)
    let s = Math.sin(body.angle)
    let hhc = hh * c
    let hhs = hh * s
    let hwc = hw * c
    let hws = hw * s
    body.corners = [
        {x: body.pos.x + (-hwc + hhs), y: body.pos.y + (-hws - hhc)},
        {x: body.pos.x + ( hwc + hhs), y: body.pos.y + ( hws - hhc)},
        {x: body.pos.x + ( hwc -  hhs), y: body.pos.y + ( hws +  hhc)},
        {x: body.pos.x + (-hwc -  hhs), y: body.pos.y + (-hws +  hhc)}
    ]
    body.edges = [
        {start: body.corners[0], end: body.corners[1]},
        {start: body.corners[1], end: body.corners[2]},
        {start: body.corners[2], end: body.corners[3]},
        {start: body.corners[3], end: body.corners[0]}
    ]
    body.axis1 = { x: c, y: s }
    body.axis2 = { x: -s, y: c }
}

function logStateAndEverything(){
    console.log('Bodies:', JSON.parse(JSON.stringify(bodies)))
    console.log('Springs:', JSON.parse(JSON.stringify(springs)))
    console.log('Ropes:', JSON.parse(JSON.stringify(ropes)))
    console.log('Bridge Joints:', JSON.parse(JSON.stringify(bridgeJoints)))
}