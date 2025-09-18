//Logic Sim (v3)
//Miguel Rodriguez
//09-10-2024

p5.disableFriendlyErrors = true

let chip
let chipStack = []

//connection logic
let draggingConnection = false;
let dragStart = null;
let dragStartIndex = null;
let dragStartComponent = null;
let dragPath = []
let draggingFromConn = undefined
let draggingFromBus = false

//moving comps and IO
let movingComp = {comp: null, offx: 0, offy: 0}
let movingInput = {node: undefined, off: 0}
let movingOutput = {node: undefined, off: 0}

//id managing
let compNames = 0
let idConn = 0

//ui elements
let panel
let panel_input, panel_remove, panel_edit, 
    panel_goBack, panel_fps, panel_color, simSpeedPicker
let panel_addIn, panel_addOut, panel_removeIn, panel_removeOut
let panel_display_np, panel_display_bt
let panel_clock_np, panel_clock_bt
let panel_route
let route = []
let showingTags = false

let input_text_In
let input_text_Out
let changing_name_in = undefined
let changing_name_out = undefined



//selection managing
let selectedComp = null
let hoveredNode = null
let hoveredComp = null
let hoveredConn = null
let frontComp = null
let addingInput = null
let addingOutput = null
let hoveredBus = null

//selection of multiple comps
let multiSelectionWindow = null
let multiSelectionComps = null
let multiSelectionCompsWindow = null
let multiSelectionCompsWindowOff = null
let multiSelectionOffsets = null

//creacion Bus
let pathBus = null
let creatingBus = false

//miscellaneous
let canvas
let beingHoveredGlobal = false
let currentCursorStyle
let fps = 60
let simSpeed = 10
let framesPerIter = 60 / simSpeed
let counterFrames = 0

async function setup() {
    canvas = createCanvas(WIDTH+widthPanel+10, HEIGHT);
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
    strokeJoin(ROUND);

    let font = await loadFont("migUI/main/mono.ttf");
    panel = new Panel({
        x: WIDTH+10,
        y: 10,
        h: HEIGHT - 20,
        w: widthPanel,
        automaticHeight: false,
        lightCol: colorOn,
        darkCol: colorBackMenu,
        title: 'LOGIC SIM'
    })
    text_FontMIGUI = font
    if(textFont() != font){
        textFont(font);
    }
    textSize(text_SizeMIGUI);
    textAlign(LEFT);

    panel.createSeparator()
    //panel_fps = panel.createText()
    panel.createText("- Click on an input to start a connection")
    panel.createText("- Press Z to undo a segment")
    panel.createText("- Press T to toggle IO tags")
    panel.createText("- Double click on chip to edit it")

    panel.createSeparator()

    simSpeedPicker = panel.createNumberPicker('Sim Speed (Hz)', 0, 0, simSpeed)
    simSpeedPicker.setOptions([1, 5, 10, 30, 50], 2)

    panel.createSeparator()

    panel.createText("Add basic gates:")
    let andButton = panel.createButton("AND", (f) => {
        chip.addComponent("AND" + compNames, "AND");
        compNames++;
    })
    andButton.setHoverText('Click to add an AND logic gate')
    let orButton = panel.createButton("OR", (f) => {
        chip.addComponent("OR" + compNames, "OR");
        compNames++;
    })
    orButton.setHoverText('Click to add an OR logic gate')
    let notButton = panel.createButton("NOT", (f) => {
        chip.addComponent("NOT" + compNames, "NOT");
        compNames++;
    })
    notButton.setHoverText('Click to add a NOT logic gate')
    let busButton = panel.createButton("BUS", (f) => {
        //empezar creacion bus
        creatingBus = true
        // chip.addComponent("BUS" + compNames, "BUS");
        // compNames++;
    })
    busButton.setHoverText('Click to start creating a bus.\n- Click in the canvas to create segments\n- Double click to finish')
    let triButton = panel.createButton("TRI-STATE BUFFER", (f) => {
        chip.addComponent("TRI" + compNames, "TRI");
        compNames++;
    })
    triButton.setHoverText('Click to add a TRI-STATE buffer')

    panel.createSeparator()
    //panel.createText("Add DISPLAY:")
    panel_display_np = panel.createNumberPicker("Inputs", 1, 10)
    panel_display_bt = panel.createButton("CREATE DISPLAY", (f) => {
        chip.addComponent("DISPLAY" + compNames, "DISPLAY", "", panel_display_np.getValue());
        compNames++;
    })
    panel_display_bt.setHoverText('Click to add a display\nIt converts binary to decimal')

    panel.createSeparator()
    //panel.createText("Add CLOCK:")
    panel_clock_np = panel.createNumberPicker("Outputs", 1, 10)
    panel_clock_bt = panel.createButton("CREATE CLOCK", (f) => {
        chip.addComponent("CLOCK" + compNames, "CLOCK", "", panel_clock_np.getValue());
        compNames++;
    })
    panel_clock_bt.setHoverText('Click to add a clock')

    panel.createSeparator()
    panel.createText("Create CHIP:")
    panel_color = panel.createColorPicker("Enter color")
    panel_input = panel.createInput("Enter name", (f) => {
        frontComp = null
        multiSelectionWindow = null
        multiSelectionComps = null
        multiSelectionCompsWindow = null
        let newName = panel_input.getText()
        newName = newName.trimStart()
        newName = newName.trimEnd()
        let name = chip.name + compNames
        compNames++
        chip.externalName = newName
        chip.name = name
        chip.col = panel_color.interacted ? panel_color.getColor() : roundNum(Math.random() * 150)
        panel_color.interacted = false
        console.log(chip)
        let chipString = JSON.stringify(chip)
        savedChips.push(chipString);
        chipRegistry.push(chip);


        panel.createButton(newName, (f) => {
            let selectedName = name
            if (selectedName) {
                let savedChip = savedChips.find(chipData => JSON.parse(chipData).name === selectedName);
                if (savedChip) {
                    let newChip = JSON.parse(savedChip);
                    chip.addComponent(newChip.name, 'CHIP', newName);
                    compNames++
                }
            }
        })

        if(chipStack.length == 0) chip = new Chip('chip' + compNames, 2, 1);
        compNames += 1;
    })

    panel.createSeparator()
    panel.createButton("REMOVE ALL components", (f) => {
        chip.components = []
        chip.chips = []
        chip.connections = []
        frontComp = null
        selectedComp = null
        multiSelectionWindow = null
        multiSelectionComps = null
        multiSelectionCompsWindow = null
        movingComp = {comp: null, offx: 0, offy: 0}
        movingInput = {node: undefined, off: 0}
        movingOutput = {node: undefined, off: 0}
    })
    panel.createSeparator()

    // panel.createSeparator()
    // panel_edit = panel.createButton("EDIT", (f) => {
    //     if(selectedComp){
    //         if(selectedComp.isSub){
    //             frontComp = null
    //             multiSelectionWindow = null
    //             multiSelectionComps = null
    //             multiSelectionCompsWindow = null
    //             chipStack.push(chip)
    //             chip = selectedComp
    //             panel_goBack.enable()
    //             route.push(selectedComp.externalName)
    //             setPanelRouteText()
    //         }
    //     }
    // })
    // panel_edit.disable()
    panel.separate()
    panel_route = panel.createText("chip")
    panel_goBack = panel.createButton("Go back", (f) => {
        if(chipStack.length > 0){ 
            chip = chipStack.pop()
            route.pop()
            setPanelRouteText()
            selectedComp = null
            hoveredNode = null
            hoveredComp = null
            frontComp = null
        }
    })
    panel_goBack.disable()
    
    
    panel.createSeparator()
    panel.createText("Add saved chips:")

    chip = new Chip('chip' + compNames, 2, 1);
    compNames++;
    chipRegistry.push(chip);

    createFromSaved()
}

function draw() {
    background(colorOff)

    if(frameCount % 60 == 0) fps = Math.floor(frameRate())

    
    drawMargin()
    if(chipStack.length == 0){ 
        panel_goBack.disable()

        panel_input.enable()
        panel_input.setPlaceholder("Enter name")
    }
    else{
        panel_input.disable()
        panel_input.setPlaceholder("Can't save inside chip")
    }
        

    // if(chipStack.length > 0){
    //     disableButtons()
    // }
    // else enableButtons()

    beingHoveredGlobal = false
    if(!mouseIsPressed){
        setHoveredNode()
        setHoveredComp()
        setAddingIO()
        setHoveredConnection()
        setHoveredBus()
    }

    if (draggingConnection && dragStart) {
        drawCurrentConnection()
    }

    if(creatingBus){
        showBus()
    }

    showMultiSelection()

    let old = simSpeed
    simSpeed = simSpeedPicker.getValue()
    if(old != simSpeed){
        framesPerIter = 60 / simSpeed
    }
    counterFrames++
    if(counterFrames >= framesPerIter){
        chipStack.length == 0 ? chip.simulate() : chipStack[0].simulate()
        counterFrames = 0
    }
    
    chip.show();

    panel.update()
    panel.show()

    if(panel.beingHoveredHand || beingHoveredGlobal || draggingConnection || hoveredNode != null) cursor(HAND)

    if(input_text_In && changing_name_in != undefined){
        input_text_In.update()
        input_text_In.show()
    }
    if(input_text_Out && changing_name_out != undefined){
        input_text_Out.update()
        input_text_Out.show()
    }

}

function drawMargin(){
    const offy = 45
    const offx = 45 + marginWidth
    noFill()
    strokeWeight(70)
    stroke(colorOn)
    rect(offx, offy, WIDTH - offx*2, HEIGHT - offy*2)

    stroke(colorBack)
    strokeWeight(70)
    fill(colorBack)
    rect(offx+2, offy+2, WIDTH - (offx+2)*2, HEIGHT - (offy+2)*2)

    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
}

function showMultiSelection(){
    if(movingOutput.node != null || movingInput.node != null || movingComp.comp != null) return
    if(multiSelectionWindow){
        push()
        strokeWeight(1.5)
        stroke(150)
        fill(255, 50)
        rect(multiSelectionWindow.x1, multiSelectionWindow.y1, 
             multiSelectionWindow.x2 - multiSelectionWindow.x1,
             multiSelectionWindow.y2 - multiSelectionWindow.y1)
        pop()
    }
    if(multiSelectionCompsWindow){
        push()
        noStroke()
        fill(255, 50)
        rect(multiSelectionCompsWindow.x, multiSelectionCompsWindow.y,
             multiSelectionCompsWindow.w, multiSelectionCompsWindow.h)
        pop()
    }
}

function setMultiSelectionComps(){
    if(multiSelectionWindow != null){
        multiSelectionComps = []
        for(let comp of chip.components.concat(chip.chips)){
            if(!comp.isSub && comp.type == "BUS") continue
            if(getMultiSelectionComps(multiSelectionWindow, comp)) multiSelectionComps.push(comp)
        } 
    }
    if(multiSelectionComps && multiSelectionComps.length == 0) multiSelectionComps = null
    if(multiSelectionComps != null) setMultiSelectionCompsWindow()
}

function getMultiSelectionComps(multiSelectionWindow, comp) {
    const x1 = multiSelectionWindow.x1 > multiSelectionWindow.x2 ? multiSelectionWindow.x2 : multiSelectionWindow.x1
    const y1 = multiSelectionWindow.y1 > multiSelectionWindow.y2 ? multiSelectionWindow.y2 : multiSelectionWindow.y1
    const w1 = multiSelectionWindow.w
    const h1 = multiSelectionWindow.h

    function isColliding(rectA, rectB) {
        const xA = rectA.x1 > rectA.x2 ? rectA.x2 : rectA.x1
        const yA = rectA.y1 > rectA.y2 ? rectA.y2 : rectA.y1
        const wA = rectA.w
        const hA = rectA.h
        const { x: xB, y: yB, width: wB, height: hB } = rectB

        return (
            xA < xB + wB &&
            xA + wA > xB &&
            yA < yB + hB &&
            yA + hA > yB
        );
    }

    return isColliding(multiSelectionWindow, comp)
}

function setMultiSelectionCompsWindow(){
    let x1 = multiSelectionComps[0].x
    let y1 = multiSelectionComps[0].y
    let x2 = x1 + multiSelectionComps[0].width
    let y2 = y1 + multiSelectionComps[0].height
    for(let comp of multiSelectionComps){
        if(comp.x < x1) x1 = comp.x
        if(comp.y < y1) y1 = comp.y
        if(comp.x + comp.width > x2) x2 = comp.x + comp.width
        if(comp.y + comp.height > y2) y2 = comp.y + comp.height
    }
    let off = 10
    multiSelectionCompsWindow = {x: x1 - off, y: y1 - off, 
                                 w: x2 - x1 + 2 * off, h: y2 - y1 + 2 * off}
}


function removeConnectionsFromINPUTS(indexToDelete){
    let indices = chip.connections
    .map((c, i) => (c.fromComponent === 'INPUTS' && c.fromIndex === indexToDelete) ? i : -1)
    .filter(i => i !== -1); // Get all matching indices

    indices.forEach(index => {
        let compName = chip.connections[index].toComponent;
        let idx = chip.connections[index].toIndex;

        for (let c of chip.components) {
            if (c.name === compName) {
                c.setInput(idx, 0);
                break;
            }
        }

        for (let c of chip.chips) {
            if (c.name === compName) {
                c.setInput(idx, 0);
                break;
            }
        }
    });

    // Remove all matching connections (starting from the end to avoid shifting issues)
    for (let i = indices.length - 1; i >= 0; i--) {
        chip.connections.splice(indices[i], 1);
    }
}

function startDragging(inputPos, index, componentName, size, isFromConn = false) {
    draggingConnection = true;
    if(!isFromConn) dragStart = { x: inputPos.x + size / 2, y: inputPos.y + size / 2 };
    if(isFromConn) dragStart = {x: inputPos.x, y: inputPos.y};
    dragStartIndex = index;
    dragStartComponent = componentName;
}

function checkClickOnComponentInput(point, componentList, size, output = false) {
    for (let component of componentList) {
        for (let i = 0; i < (output ? component.outputs.length : component.inputs.length); i++) {
            let position
            if(component.isSub && output) position = component.getOutputPositionSC(i)
            if(component.isSub && !output) position = component.getInputPositionSC(i)
            if(!component.isSub && output && component.type != "BUS") position = component.getOutputPosition(i)
            if(!component.isSub && !output && component.type != "BUS") position = component.getInputPosition(i)
            if (position && isWithinBounds(point, position, size)) {
                return { component, index: i };
            }
        }
    }
    return null;
}

function checkClickOnBus(){
    for(let bus of chip.components){
        if(bus.type != "BUS") continue
        let collide = bus.inBoundConn()
        if(collide) return collide
    }
    return undefined
}

function cutConnections(point, componentList, connections, size) {
    for (let component of componentList) {
        if(component.type == 'BUS') continue
        for (let i = 0; i < component.inputs.length; i++) {
            let inputPos = component.isSub ? component.getInputPositionSC(i) : component.getInputPosition(i);
            if (!isWithinBounds(point, inputPos, size)) continue;

            let index = connections.findIndex(conn =>
                conn.toComponent === component.name && conn.toIndex === i
            );
            if (index === -1) continue;

            let conn = connections[index];
            //cutSubConnections(conn);///////////////////
            
            let fromConn = chip.getConnection(conn);
            //removeSubConnection(conn); ///////////////////

            connections.splice(index, 1);
            component.inputs[i] = 0;
        }
    }
}

function isInputConnectedToMainChip(component, index, output, isMain = false){
    for(let c of chip.connections){
        if(!isMain && !output && c.toComponent == component.name && c.toIndex == index) return true
        if(!isMain && output && c.fromComponent == component.name && c.fromIndex == index) return true
        if(isMain && !output && c.fromComponent == 'INPUTS' && c.fromIndex == index) return true
        if(isMain && output && c.toComponent == 'OUTPUTS' && c.toIndex == index) return true
    }
    return false
}

function setHoveredNode(){
    //inputs chip
    let inp = chip.getInBoundsInputToggle()
    if(inp != undefined){
        hoveredNode = {comp: 'INPUTS', index: inp}
        return
    }
    inp = chip.getInBoundsInput()
    if(inp != undefined){
        hoveredNode = {comp: 'INPUTS', index: inp}
        return
    }
    //outputs chip
    inp = chip.getInBoundsOutputToggle()
    if(inp != undefined){
        hoveredNode = {comp: 'OUTPUTS', index: inp}
        return
    }
    inp = chip.getInBoundsOutput()
    if(inp != undefined){
        hoveredNode = {comp: 'OUTPUTS', index: inp}
        return
    }

    //components and chips inputs
    inp = checkClickOnComponentInput({x: mouseX, y: mouseY}, chip.components, tamCompNodes, false) ||
          checkClickOnComponentInput({x: mouseX, y: mouseY}, chip.chips, tamCompNodes, false)
    if(inp != undefined){
        hoveredNode = {comp: inp.component, index: inp.index, side: 'input'}
        return
    }

    //components and chips outputs
    inp = checkClickOnComponentInput({x: mouseX, y: mouseY}, chip.components, tamCompNodes, true) ||
          checkClickOnComponentInput({x: mouseX, y: mouseY}, chip.chips, tamCompNodes, true)
    if(inp != undefined){
        hoveredNode = {comp: inp.component, index: inp.index, side: 'output'}
        return
    }


    else hoveredNode = null
}

function setHoveredComp(){
    for(let c of chip.components){
        if(c.inBounds(mouseX, mouseY)){
            hoveredComp = c.name
            return
        }
    }   
    for(let c of chip.chips){
        if(c.inBounds(mouseX, mouseY)){
            hoveredComp = c.name
            return
        }
    }
    hoveredComp = null
}

function setHoveredConnection(){
    for(let conn of chip.connections){
        if(conn.inBoundConn()){
            hoveredConn = conn
            return
        }
    }
    hoveredConn = null
}

function setHoveredBus(){
    for(let bus of chip.components){
        if(bus.type == 'BUS' && bus.inBoundConn()){
            hoveredBus = bus
            return
        }
    }
    hoveredBus = null
}

function setAddingIO(){
    if(draggingConnection){
        addingInput = null
        addingOutput = null
        return
    }
    if((hoveredNode && hoveredNode.comp != 'INPUTS') || hoveredNode == null){
        let inBoundsInputs = inBounds(0, 50, marginWidth*2, height-100)
        if(inBoundsInputs){
            addingInput = mouseY
        }
        else addingInput = null
    }
    else addingInput = null

    if((hoveredNode && hoveredNode.comp != 'OUTPUTS') || hoveredNode == null){
        let inBoundsOutputs = inBounds(WIDTH-marginWidth*2, 50, marginWidth*2, height-100)
        if(inBoundsOutputs){
            addingOutput = mouseY
        }
        else addingOutput = null
    }
    else addingOutput = null

    for(let inp of chip.inputsPos){
        if(mouseY >= inp.y - 15 && mouseY <= inp.y + tamBasicNodes + 5){
            addingInput = null
            break
        }
    }

    for(let inp of chip.outputsPos){
        if(mouseY >= inp.y - 15 && mouseY <= inp.y + tamBasicNodes + 5){
            addingOutput = null
            break
        }
    }
}

function setPanelRouteText(){
    let string = 'chip'
    for(let c of route){
        string += " > " + c
    }
    panel_route.setText(string)
}

function disableButtons(){
    panel_addIn.disable()
    panel_addOut.disable()
    panel_removeIn.disable()
    panel_removeOut.disable()
}

function enableButtons(){
    panel_addIn.enable()
    panel_addOut.enable()
    panel_removeIn.enable()
    panel_removeOut.enable()
}

function restartMultiSelection(){
    multiSelectionWindow = null
    multiSelectionComps = null
    multiSelectionCompsWindow = null
    multiSelectionCompsWindowOff = null
    multiSelectionOffsets = null
}

function showBus(){
    fill(0)
    noStroke()
    if(pathBus == null){
        push()
        rectMode(CENTER)
        rect(mouseX, mouseY, 12)
        pop()
    }
    else{
        let x = mouseX
        let y = mouseY
        if(keyIsPressed && keyCode == 16 && pathBus.length > 0){  //SHIFT
            let prev = pathBus[pathBus.length - 1]
            let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
            [x, y] = [dx > dy ? mouseX : prev.x, dx > dy ? prev.y : mouseY ]
        }

        push()
        rectMode(CENTER)
        rect(pathBus[0].x, pathBus[0].y, 12, 12, 3)
        rect(x, y, 12, 12, 3)
        stroke(0)
        strokeWeight(5)
        noFill()

        let drawPath = []
        for(let p of pathBus) drawPath.push(createVector(p.x, p.y))
        drawPath.push(createVector(x, y))
        drawBezierPath(drawPath)

        pop()
    }
}

function calculateBusState(connectedComponents) {
    let firstValue = null
    let isUniform = true
    
    for (let val of connectedComponents) {
        if (val === 2) {
            continue
        }
        if (firstValue === null) {
            firstValue = val;
        } 
        else if (val !== firstValue) {
            isUniform = false;
            break
        }
    }
    
    if (firstValue === null) {
        return 2
    }
    
    return isUniform ? firstValue : undefined;
}

function drawCurrentConnection(){
    drawCrosshair()
    push()
    stroke(colorFloating);
    strokeWeight(strokeOff) 
    noFill()
    let drawPath = []
    drawPath.push(createVector(roundNum(dragStart.x), roundNum(dragStart.y)))
    for(let p of dragPath) drawPath.push(createVector(roundNum(p.x), roundNum(p.y)))
    let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
    let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
    let [x, y] = [dx > dy ? mouseX : prev.x, dx > dy ? prev.y : mouseY ]
    drawPath.push(createVector(roundNum(x), roundNum(y)))
    drawBezierPath(drawPath)
    strokeWeight(10)
    point(dragStart.x, dragStart.y)
    pop()
}

function drawCrosshair(){
    push()
    stroke(80)
    strokeWeight(.9)
    line(mouseX, 0, mouseX, height)
    line(0, mouseY, width, mouseY)
    pop()
}


function debug(){
    console.log("debug")
    console.log(multiSelectionWindow)
    console.log(multiSelectionComps)
    console.log(multiSelectionCompsWindow)
    console.log(multiSelectionCompsWindowOff)
    console.log(multiSelectionOffsets)
}



