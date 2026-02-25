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

async function setup(){
    let fontPanel = await loadFont("migUI/main/bnr.ttf")

    WIDTH = windowWidth
    HEIGHT = windowHeight
    nCells = Math.floor(Math.max(WIDTH, HEIGHT) / cellSize)
    tree = new DynamicAABBTree(5)
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

    setPortalsButton = panel.createButton("Set Portals")
    setPortalsButton.setFunc(() => {
        startSettingPortals()
    })

    setThrusterButton = panel.createButton("Set Thruster")
    setThrusterButton.setFunc(() => {
        startSettingThruster()
    })

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
    panelAdvancedOptions.createSeparator()

    let restitutionSlider = panelAdvancedOptions.createSlider(0, 1, RESTITUTION, 'Restitution', true)
    restitutionSlider.setFunc((arg) => {RESTITUTION = arg})

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

let screenVelocity = { vx: 0, vy: 0 };

let _lastScreenPos = {
  x: window.screenX,
  y: window.screenY,
  time: performance.now()
};

function updateScreenVelocity() {
  const now = performance.now();

  const x = window.screenX;
  const y = window.screenY;

  const dt = (now - _lastScreenPos.time) / 1000;

  let newx = 0;
  let newy = 0;

  if (dt > 0) {
    newx = (x - _lastScreenPos.x) / dt;
    newy = (y - _lastScreenPos.y) / dt;
  }

  _lastScreenPos.x = x;
  _lastScreenPos.y = y;
  _lastScreenPos.time = now;

  return [newx, newy];
}

function draw(){
    background(0)

    const [newx, newy] = updateScreenVelocity();
    screenVelocity.vx = newx
    screenVelocity.vy = newy

    collisionPoints = new Set()
    nCollisionsFrame = 0

    if(simState.centerCameraOnBody && !simState.centerCameraOnBody.dragging){
        xOff = lerp(xOff, width/2 - simState.centerCameraOnBody.pos.x * zoom, 0.1)
        yOff = lerp(yOff, height/2 - simState.centerCameraOnBody.pos.y * zoom, 0.1)
    }

    let startTimePhysics = performance.now()

    setGridMousePos()
    
    handleDragBody()

    cleanupBridgeJoints()

    const STEPS = simState.running ? MAXSTEPS : 0
    let dt = 1 / STEPS
    let gravityDT = gravity * dt * (simState.gravityEnabled ? 1 : 0)
    for(let step = 0; step < STEPS; step++){

        for(let b of bodies){
            if(!b.isStatic) {
                b.vel.y += gravityDT
                if(Math.abs(screenVelocity.vx) > 0.1 || Math.abs(screenVelocity.vy) > 0.1) {
                    b.pos.x -= screenVelocity.vx * dt * 0.01
                    b.pos.y -= screenVelocity.vy * dt * 0.01
                }
            }
        }

        applyThrusters(dt)

        applySpringForces(dt)

        integrateBodies(dt)

        for(let b of bodies) updateCornerLocations(b)

        solveBridgeJoints()

        for(body of bodies){
            tree.update(body);
        }

        tree.computePairs((a,b) => {
            handleCollision(a,b);
        });

    }

    nCollisionsFrame = Math.floor(nCollisionsFrame / STEPS)

    calculateStressBodies()

    setHoveredBody()

    handleOutOfBounds()

    for(let b of bodies) b.canTransportThroughPortal = true  //reset portal transport flag each frame

    //set vel of dragging bodies
    let b = simState.hoveredBody
    if(b && b.dragging && !b.isStatic){
        b.vel.x = b.posFree.x - b.oldPosFree.x
        b.vel.y = b.posFree.y - b.oldPosFree.y
    }

    let endTimePhysics = performance.now()
    let physicsTime = endTimePhysics - startTimePhysics

    let startTimeRender = performance.now()


    // Draw
    push()

    translate(xOff, yOff)
    scale(zoom)

    if(simState.showDebug){ 
        push()
        noFill()
        stroke(255, 0, 0, 100)
        tree.visualize()
        pop()
    }
    if(zoom > 0.8 && simState.snapGrid) showGridPoints()
    for(let sp of springs) drawSpring(sp)
    for(let rope of ropes) drawRope(rope)
    for(let b of bodies){
        if(b.shape == 'rect' || b.shape == 'bridge') drawBody(b)
        if(b.shape == 'circle') drawBodyCircle(b)
    }
    for(let joint of bridgeJoints) drawBridgeJoint(joint)
    drawEditor()

    drawDebugAux()

    pop()

    push()  
    tabs.update();
    tabs.show();
    pop()

    let endTimeRender = performance.now()
    let renderTime = endTimeRender - startTimeRender

    simState.physicsTime = physicsTime
    simState.renderTime = renderTime

    drawFPSandINFO()

}

// handleCollision -> SAT -> modify Pos -> resolveCollision (modidies Vel)