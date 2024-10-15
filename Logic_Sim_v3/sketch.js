//Logic Sim (v3)
//Miguel Rodriguez
//09-10-2024

const widthPanel = 250
const WIDTH = 1400 - widthPanel
const HEIGHT = 880


let chip
let chipRegistry = []
let savedChips = []
let selectCustom

let draggingConnection = false;
let dragStart = null;
let dragStartIndex = null;
let dragStartComponent = null;
let dragPath = []
let draggingFromConn = undefined

let movingComp = {comp: null, offx: 0, offy: 0}
let compNames = 0;
let panel, panel_input, panel_remove, panel_display, panel_clock, panel_edit, panel_goBack
let panel_route
let route = []
//let dinPanel
let selectedComp = null
let hoveredNode = null

const tamBasicNodes = 30
const tamCompNodes = 18

const colorBack = "#0E212E"
const colorOn = "#1FF451"
const colorOff = "#14663F"
const colorDisconnected = "#102838"
//const colorComp = "#C7F9CC"
const colorComp = Math.random() * 150
const colorSelected = "#1FF451"

const colsComps = [Math.random() * 150,
                   Math.random() * 150,
                   Math.random() * 150,
                   Math.random() * 150,
                   Math.random() * 150]


const strokeOff = 4
const strokeOn = 4.5
const strokeLight = 2.5
const strokeSelected = 3
const controlDist = 100

const inputX = 30 + tamBasicNodes - tamCompNodes
const outputX = WIDTH - 60
const inputToggleX = 0
const outputToggleX = WIDTH - 30

const tamCollConn = 8

const radCurveConn = 15

let chipStack = []
let canvas

function setup() {
    canvas = createCanvas(WIDTH+widthPanel, HEIGHT);
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
    strokeJoin(ROUND);
    panel = new Panel({
        x: WIDTH,
        w: widthPanel,
        automaticHeight: false,
        lightCol: colorOn,
        darkCol: colorBack,
        title: 'LOGIC SIM'
    })
    panel.createSeparator()
    panel.createText("Click on an input to start a connection")
    panel.createText("Press Z to undo a segment")

    
    panel.createSeparator()
    panel.createText("Modify chip I/O:")
    panel.createButton("+ In", (f) => {
        chip.inputs.push(0)
    })
    panel.createButton("- In", (f) => {
       let indexToDelete = chip.inputs.length - 1
        chip.inputs.pop()
        let index = chip.connections.findIndex(c => c.fromComponent === 'INPUTS' && c.fromIndex === indexToDelete);
        if (index !== -1){
            let compName = chip.connections[index].toComponent
            let idx = chip.connections[index].toIndex
            for(let c of chip.components) if(c.name == compName){c.setInput(idx, 0); break}
            for(let c of chip.chips) if(c.name == compName){c.setInput(idx, 0); break}
            chip.connections.splice(index, 1);
        }
    })
    panel.createButton("+ Out", (f) => {
        chip.outputs.push(0)
    })
    panel.createButton("- Out", (f) => {
       let indexToDelete = chip.outputs.length - 1
        chip.outputs.pop()
        let index = chip.connections.findIndex(c => c.toComponent === 'OUTPUTS' && c.toIndex === indexToDelete);
        if (index !== -1){
            chip.connections.splice(index, 1);
        }
    })

    panel.createSeparator()
    panel.createText("Add basic gates:")
    panel.createButton("AND", (f) => {
        chip.addComponent("AND" + compNames, "AND");
        compNames++;
    })
    panel.createButton("OR", (f) => {
        chip.addComponent("OR" + compNames, "OR");
        compNames++;
    })
    panel.createButton("NOT", (f) => {
        chip.addComponent("NOT" + compNames, "NOT");
        compNames++;
    })

    panel.createSeparator()
    panel.createText("Add DISPLAY:")
    panel_display = panel.createInput("Enter number of inputs", (f) => {
        chip.addComponent("DISPLAY" + compNames, "DISPLAY", "", constrain(parseInt(panel_display.getText()), 1, 10));
        compNames++;
    })

    panel.createSeparator()
    panel.createText("Add CLOCK:")
    panel_clock = panel.createInput("Enter number of outputs", (f) => {
        chip.addComponent("CLOCK" + compNames, "CLOCK", "", constrain(parseInt(panel_clock.getText()), 1, 10));
        compNames++;
    })

    panel.createSeparator()
    panel.createText("Create CHIP:")
    panel_input = panel.createInput("Enter name", (f) => {
        let newName = panel_input.getText()
        let name = chip.name + compNames
        compNames++
        chip.externalName = newName
        chip.name = name
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

        chip = new Chip('chip' + compNames, 2, 1);
        compNames += 1;
    })

    panel.createSeparator()
    panel_remove = panel.createButton("REMOVE: ", (f) => {
        if(selectedComp){
            if(selectedComp.isSub){
                chip.chips = chip.chips.filter(chipItem => chipItem.name !== selectedComp.name);
                chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
            }
            else{
                chip.components = chip.components.filter(chipItem => chipItem.name !== selectedComp.name);
                chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
            }
            selectedComp = null
            panel_remove.setText("REMOVE: ")
        }
    })
    panel.createButton("REMOVE ALL components", (f) => {
        chip.components = []
        chip.chips = []
        chip.connections = []
    })

    panel.createSeparator()
    panel_edit = panel.createButton("EDIT: ", (f) => {
        if(selectedComp){
            if(selectedComp.isSub){
                chipStack.push(chip)
                chip = selectedComp
                panel_remove.setText("REMOVE: ");
                panel_edit.setText("EDIT: ")
                //panel_route.setText(panel_route.getText() + " > " + selectedComp.externalName)
                route.push(selectedComp.externalName)
                setPanelRouteText()
            }
            //selectedComp = null
            //panel_remove.setText("EDIT: ")
        }
    })
    panel.separate()
    panel_goBack = panel.createButton("Go back", (f) => {
        if(chipStack.length > 0){ 
            chip = chipStack.pop()
            route.pop()
            setPanelRouteText()
        }
    })
    panel_route = panel.createText("chip")
    
    panel.createSeparator()
    panel.createText("Add Saved Chips:")

    chip = new Chip('chip' + compNames, 2, 1);
    compNames++;
    chipRegistry.push(chip);

    //createFromSaved()
}

function draw() {
    background(colorBack);
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);

    if(!mouseIsPressed){
        setHoveredNode()
    }

    if (draggingConnection && dragStart) {
        push()
        stroke(75)
        strokeWeight(.9)
        line(mouseX, 0, mouseX, height)
        line(0, mouseY, width, mouseY)
        stroke(colorOff);
        strokeWeight(strokeOff) 
        noFill()
        let drawPath = []
        drawPath.push(createVector(dragStart.x, dragStart.y))
        for(let p of dragPath) drawPath.push(createVector(p.x, p.y))
        let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
        let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
        let [x, y] = [dx > dy ? mouseX : prev.x, dx > dy ? prev.y : mouseY ]
        drawPath.push(createVector(x, y))
        drawBezierPath(drawPath)
        strokeWeight(10)
        point(dragStart.x, dragStart.y)
        pop()

        // beginShape()
        // vertex(dragStart.x, dragStart.y)
        // for(let p of dragPath) vertex(p.x, p.y)
        // let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
        // let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
        // let [x, y] = [dx > dy ? mouseX : prev.x, dx > dy ? prev.y : mouseY ]
        // vertex(x, y)
        // endShape()
        //drawConnection(dragPath, dragStart.x, dragStart.y, mouseX, mouseY)
    }

    if(frameCount % 1 == 0) chip.simulate();
    chip.show();

    panel.update()
    panel.show()
}

function mousePressed() {
    if(mouseX > WIDTH) return
    // Check if clicking on a chip input or output
    if (!draggingConnection) {
        let mousePos = { x: mouseX, y: mouseY };

        // Check inputs
        for (let i = 0; i < chip.inputs.length; i++) {
            let inputPos = chip.getInputPosition(i);
            if (isWithinBounds(mousePos, inputPos, tamCompNodes)) {
                startDragging(inputPos, i, 'INPUTS', tamCompNodes);
                return
            }
        }

        // Check outputs
        let result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes, true) ||
                     checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes, true);
        if (result) {
            startDragging(result.component.isSub ? result.component.getOutputPositionSC(result.index) : 
                result.component.getOutputPosition(result.index), result.index, result.component.name, tamCompNodes);
            return
        }

        // Cut connections
        cutConnections(mousePos, chip.components, chip.connections, tamCompNodes);
        cutConnections(mousePos, chip.chips, chip.connections, tamCompNodes);

        // Cutting connections for chip outputs
        for (let i = 0; i < chip.outputs.length; i++) {
            let outputPos = chip.getOutputPosition(i);
            if (isWithinBounds(mousePos, outputPos, tamBasicNodes)) {
                for (let j = 0; j < chip.connections.length; j++) {
                    let conn = chip.connections[j];
                    if (conn.toComponent === 'OUTPUTS' && conn.toIndex === i) {
                        cutSubConnections(conn)
                        chip.connections.splice(j, 1);
                        chip.outputs[i] = 0;
                        return
                    }
                }
            }
        }

        //connection from existing connection
        for(let i = 0; i < chip.connections.length; i++){
            let conn = chip.connections[i]
            let seg = conn.inBoundConn()
            if(seg){
                draggingFromConn = seg.conn
                startDragging({x: seg.x, y: seg.y}, conn.fromIndex, conn.fromComponent, 0, true)
                break
            }
        }
    } 

    else {
        // Releasing a connection
        let mousePos = { x: mouseX, y: mouseY };
        let result = checkClickOnComponentInput(mousePos, chip.components, tamCompNodes) ||
                     checkClickOnComponentInput(mousePos, chip.chips, tamCompNodes) ||
                     (chip.outputs.some((_, i) => isWithinBounds(mousePos, chip.getOutputPosition(i), tamBasicNodes)) ?
                         { component: { name: 'OUTPUTS' }, index: chip.outputs.findIndex((_, i) =>
                            isWithinBounds(mousePos, chip.getOutputPosition(i), tamBasicNodes)) } : null);
        if (result) {
            let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
            let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
            dragPath.push({ x: dx > dy ? mouseX : prev.x, y: dx > dy ? prev.y : mouseY });
            if(draggingFromConn == undefined) chip.connect(dragStartComponent, dragStartIndex, result.component.name, result.index, dragPath);
            else chip.connect(dragStartComponent, dragStartIndex, result.component.name, result.index, dragPath, dragStart, draggingFromConn);
            draggingConnection = false;
            dragStart = null;
            dragStartIndex = null;
            dragStartComponent = null;
            dragPath = [];
            draggingFromConn = undefined
        } else {
            //right angles segments
            let prev = dragPath.length ? dragPath[dragPath.length - 1] : dragStart;
            let [dx, dy] = [Math.abs(prev.x - mouseX), Math.abs(prev.y - mouseY)];
            dragPath.push({ x: dx > dy ? mouseX : prev.x, y: dx > dy ? prev.y : mouseY });
        }
    }

    // Selecting components

    selectedComp = undefined; /////////////////////////////////////////
    let mousePos = { x: mouseX, y: mouseY };
    for (let c of chip.components.concat(chip.chips)) {
        if (c.inBounds(mousePos.x, mousePos.y)) {
            selectedComp = c;
            break;
        }
    }

    if (selectedComp) {
        let name = selectedComp.isSub ? selectedComp.externalName : selectedComp.type;
        panel_remove.setText("REMOVE: " + name);
        if(selectedComp.isSub) panel_edit.setText("EDIT: " + name)
    } else {
        panel_remove.setText("REMOVE: ");
        panel_edit.setText("EDIT: ")
    }
}

function mouseReleased() {
    movingComp = {comp: null, offx: 0, offy: 0}
}

function mouseClicked() {
    // Click chip inputs to toggle them
    let inp = chip.getInBoundsInputToggle()
    if(inp != undefined) chip.toggleInput(inp)

    for(let c of chip.components){
        if(c instanceof Display){
            if(c.inBoundsSign()) c.toggleSign()
        }
    }  
}

function keyPressed(){
    //press z
    if(keyCode == 90){
        if(!draggingConnection) return
        if(dragPath.length == 0) draggingConnection = false
        else dragPath.pop()
    }
    //press backspace
    if(keyCode == 8){
        if(selectedComp){
            if(selectedComp.isSub){
                chip.chips = chip.chips.filter(chipItem => chipItem.name !== selectedComp.name);
                chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
            }
            else{
                chip.components = chip.components.filter(chipItem => chipItem.name !== selectedComp.name);
                chip.connections = chip.connections.filter(conn => conn.toComponent !== selectedComp.name && conn.fromComponent !== selectedComp.name);
            }
            selectedComp = null
            panel_remove.setText("REMOVE: ")
        }
    }
}

function mouseDragged(){
    if (!draggingConnection) {
        if(movingComp.comp) movingComp.comp.move(mouseX, mouseY, movingComp.offx, movingComp.offy)
        else{
            for (let c of chip.components) {
                if (c.inBounds(mouseX, mouseY)){
                    let offx = c.x - mouseX
                    let offy = c.y - mouseY
                    c.move(mouseX, mouseY, offx, offy);
                    movingComp = {comp: c, offx, offy}
                    break
                }
            }
            if(!movingComp.comp){
                for (let c of chip.chips) {
                    if (c.inBounds(mouseX, mouseY)){
                        let offx = c.x - mouseX
                        let offy = c.y - mouseY
                        c.move(mouseX, mouseY, offx, offy);
                        movingComp = {comp: c, offx, offy}
                        break
                    }
                }
            }   
        }
    }
}

function startDragging(inputPos, index, componentName, size, isFromConn = false) {
    draggingConnection = true;
    if(!isFromConn) dragStart = { x: inputPos.x + size / 2, y: inputPos.y + size / 2 };
    if(isFromConn) dragStart = {x: inputPos.x, y: inputPos.y};
    dragStartIndex = index;
    dragStartComponent = componentName;
}

function getLongestLineLength(inputString) {
    // Split the string by newline characters into an array of lines
    const lines = inputString.split('\n');

    // Find the length of the longest line
    let maxLength = 0;
    for (let line of lines) {
        if (line.length > maxLength) {
            maxLength = line.length;
        }
    }

    return [maxLength, lines.length];
}

function fitTextToRect(text, rectWidth, rectHeight, lineHeight) {
  // Split text into lines
  let lines = text.split('\n');
  
  // Shorten lines that exceed the rectangle width
  for (let i = 0; i < lines.length; i++) {
    while (textWidth(lines[i]) > rectWidth) {
      lines[i] = lines[i].slice(0, -1); // Remove the last character
      if (lines[i].length === 0) {
        lines.splice(i, 1); // If line becomes empty, remove it
        i--;
        break;
      }
    }
  }

  // Check total height and splice lines if necessary
  while (lines.length * lineHeight > rectHeight) {
    lines.pop(); // Remove the last line until it fits
  }

  return lines.join('\n');
}

function createFromSaved(){
    for(let i = 0; i < savedChips.length; i++){
        let newChip = JSON.parse(savedChips[i]);
        panel.createButton(newChip.externalName, (f) => {
            chip.addComponent(newChip.name, 'CHIP', newChip.externalName);
            compNames++
        })
        compNames++
    }
}

function isWithinBounds(point, rectStart, rectSize) {
    return (
        point.x >= rectStart.x && point.x <= rectStart.x + rectSize &&
        point.y >= rectStart.y && point.y <= rectStart.y + rectSize
    );
}



function checkClickOnComponentInput(point, componentList, size, output = false) {
    for (let component of componentList) {
        for (let i = 0; i < (output ? component.outputs.length : component.inputs.length); i++) {
            let position
            if(component.isSub && output) position = component.getOutputPositionSC(i)
            if(component.isSub && !output) position = component.getInputPositionSC(i)
            if(!component.isSub && output) position = component.getOutputPosition(i)
            if(!component.isSub && !output) position = component.getInputPosition(i)
            if (isWithinBounds(point, position, size)) {
                return { component, index: i };
            }
        }
    }
    return null;
}

function cutConnections(point, componentList, connections, size) {
    for (let component of componentList) {
        for (let i = 0; i < component.inputs.length; i++) {
            let inputPos = component.isSub ? component.getInputPositionSC(i) : component.getInputPosition(i);
            if (!isWithinBounds(point, inputPos, size)) continue;

            let index = connections.findIndex(conn =>
                conn.toComponent === component.name && conn.toIndex === i
            );
            if (index === -1) continue;

            let conn = connections[index];
            cutSubConnections(conn);
            
            let fromConn = chip.getConnection(conn);
            removeSubConnection(conn);

            connections.splice(index, 1);
            component.inputs[i] = 0;
        }
    }
}

function removeSubConnection(conn) {
    for (let auxConn of chip.connections) {
        let subIndex = auxConn.subConnections.findIndex(auxConnSC => 
            conn.fromComponent === auxConnSC.fromComponent &&
            conn.toComponent === auxConnSC.toComponent &&
            conn.fromIndex === auxConnSC.fromIndex &&
            conn.toIndex === auxConnSC.toIndex
        );

        if (subIndex !== -1) {

            auxConn.subConnections.splice(subIndex, 1);
            break;
        }
    }
}


function cutSubConnections(conn){
    for(let sc of conn.subConnections){
        for(let i = 0; i < chip.connections.length; i++){
            let auxConn = chip.connections[i]
            if(auxConn == conn) continue
            if(auxConn.fromComponent == sc.fromComponent &&
               auxConn.toComponent == sc.toComponent &&
               auxConn.fromIndex == sc.fromIndex &&
               auxConn.toIndex == sc.toIndex){

                //apagar inputs que son desconectados
                let comp = chip._getComponentOrChip(auxConn.toComponent)
                comp.setInput(auxConn.toIndex, 0)

                //desconectar recursivamente
                cutSubConnections(auxConn)
                chip.connections.splice(i, 1)
                i--
            }
        }
    }
}

function drawBezierPath(points, curveSize = radCurveConn, resolution = 10) {
  if (points.length < 1) return
  if (points.length < 3) {
    line(points[0].x, points[0].y, points[1].x, points[1].y)
    //console.error("Need at least 3 points to draw a Bezier curve");
    return;
  }

  let drawPoints = [];
  drawPoints.push(points[0]);

  for (let i = 1; i < points.length - 1; i++) {
    let targetPoint = points[i];
    let targetDir = p5.Vector.sub(points[i], points[i - 1]).normalize();
    let dstToTarget = p5.Vector.dist(points[i], points[i - 1]);
    let dstToCurveStart = Math.max(dstToTarget - curveSize, dstToTarget / 2);

    let nextTarget = points[i + 1];
    let nextTargetDir = p5.Vector.sub(points[i + 1], points[i]).normalize();
    let nextLineLength = p5.Vector.dist(points[i + 1], points[i]);

    let curveStartPoint = p5.Vector.add(points[i - 1], targetDir.mult(dstToCurveStart));
    let curveEndPoint = p5.Vector.add(targetPoint, nextTargetDir.mult(Math.min(curveSize, nextLineLength / 2)));

    for (let j = 0; j < resolution; j++) {
      let t = j / (resolution - 1);
      let a = p5.Vector.lerp(curveStartPoint, targetPoint, t);
      let b = p5.Vector.lerp(targetPoint, curveEndPoint, t);
      let p = p5.Vector.lerp(a, b, t);

      if (drawPoints.length === 0 || p.dist(drawPoints[drawPoints.length - 1]) > 0.001) {
        drawPoints.push(p);
      }
    }
  }
  drawPoints.push(points[points.length - 1]);


  beginShape();
  for (let p of drawPoints) {
    vertex(p.x, p.y);
  }
  endShape();
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

function setPanelRouteText(){
    let string = 'chip'
    for(let c of route){
        string += " > " + c
    }
    panel_route.setText(string)
}













