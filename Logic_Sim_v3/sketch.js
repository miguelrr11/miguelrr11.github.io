//Logic Sim (v3)
//Miguel Rodriguez
//09-10-2024

const WIDTH = 1100
const HEIGHT = 800

let chip;
//let chipRegistry = []; // Global registry for chips
//let savedChips = [];
let selectCustom;
let draggingConnection = false;
let dragStart = null;
let dragStartIndex = null;
let dragStartComponent = null;
let movingComp = {comp: null, offx: 0, offy: 0}
let compNames = 0;
let panel, panel_input, panel_remove, panel_display, panel_clock
let selectedComp = null

const tamBasicNodes = 30
const tamCompNodes = 18
const colorOn = [255, 0, 0]
const colorOff = [130, 0, 0]
const strokeOff = 3
const strokeOn = 4
const controlDist = 100


function setup() {
    createCanvas(WIDTH+300, HEIGHT);
    panel = new Panel({
        x: WIDTH,
        w: 300,
        automaticHeight: false,
        theme: 'mono',
        title: 'LOGIC SIM'
    })

    panel.createText("")
    panel.createText("Spawn basic Gates:")
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
    panel.createText("")
    panel.createText("Modify current chip I/O:")
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

    panel.createText("")
    panel.createText("Create Display:")
    panel_display = panel.createInput("Enter number of inputs", (f) => {
        chip.addComponent("DISPLAY" + compNames, "DISPLAY", "", constrain(parseInt(panel_display.getText()), 1, 10));
        compNames++;
    })

    panel.createText("")
    panel.createText("Create Clock:")
    panel_clock = panel.createInput("Enter number of outputs", (f) => {
        chip.addComponent("CLOCK" + compNames, "CLOCK", "", constrain(parseInt(panel_clock.getText()), 1, 10));
        compNames++;
    })

    panel.createText("")
    panel.createText("Remove selected component:")
    panel_remove = panel.createButton("Remove: ", (f) => {
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
            panel_remove.setText("Remove: ")
        }
    })

    panel.createText("")
    panel.createText("Create Chip:")
    panel_input = panel.createInput("Enter the name of the chip", (f) => {
        let newName = panel_input.getText()
        chip.externalName = newName
        console.log(chip.externalName)
        let chipString = JSON.stringify(chip)
        savedChips.push(chipString);
        chipRegistry.push(chip);
        let name = chip.name

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
        compNames++;
    })
    
    panel.createText("")
    panel.createText("Add Saved Chips:")




    chip = new Chip('chip' + compNames, 2, 1);
    compNames++;
    chipRegistry.push(chip);

    createFromSaved()
    chip.name = 'baseChip'
}

function draw() {
    background(45);

    if(!mouseIsPressed) movingComp = {comp: null, offx: 0, offy: 0}

    if (draggingConnection && dragStart) {
        stroke(colorOff);
        strokeWeight(strokeOff) 
        noFill()
        bezier(dragStart.x, dragStart.y, dragStart.x + controlDist, dragStart.y, mouseX - controlDist, mouseY, mouseX, mouseY);
    }



    chip.simulate();
    chip.show();

    panel.update()
    panel.show()
}

function mousePressed() {
    // Check if clicking on a chip input
    for (let i = 0; i < chip.inputs.length; i++) {
        let inputPos = chip.getInputPosition(i);
        if (
            mouseX >= inputPos.x && mouseX <= inputPos.x + tamBasicNodes &&
            mouseY >= inputPos.y && mouseY <= inputPos.y + tamBasicNodes
        ) {
            draggingConnection = true;
            dragStart = { x: inputPos.x + tamBasicNodes/2, y: inputPos.y + tamBasicNodes/2 };
            dragStartIndex = i;
            dragStartComponent = 'INPUTS';
        }
    }

    // Check if clicking on a component output
    for (let component of chip.components) {
        for (let i = 0; i < component.outputs.length; i++) {
            let outputPos = component.getOutputPosition(i);
            if (
                mouseX >= outputPos.x && mouseX <= outputPos.x + tamCompNodes &&
                mouseY >= outputPos.y && mouseY <= outputPos.y + tamCompNodes
            ) {
                draggingConnection = true;
                dragStart = { x: outputPos.x + tamCompNodes / 2, y: outputPos.y + tamCompNodes / 2};
                dragStartIndex = i;
                dragStartComponent = component.name;
            }
        }
    }

    // Check if clicking on a subChip output
    for (let subChip of chip.chips) {
        for (let i = 0; i < subChip.outputs.length; i++) {
            let outputPos = subChip.getOutputPositionSC(i);
            if (
                mouseX >= outputPos.x && mouseX <= outputPos.x + tamCompNodes &&
                mouseY >= outputPos.y && mouseY <= outputPos.y + tamCompNodes
            ) {
                draggingConnection = true;
                dragStart = { x: outputPos.x + tamCompNodes / 2, y: outputPos.y + tamCompNodes / 2};
                dragStartIndex = i;
                dragStartComponent = subChip.name;
            }
        }
    }

    if(!draggingConnection){
        // cut connections of components inputs
        chip.components.forEach(component => {
            component.inputs.forEach((_, i) => {
                let inputPos = component.getInputPosition(i);
                if (
                    mouseX >= inputPos.x && mouseX <= inputPos.x + tamCompNodes &&
                    mouseY >= inputPos.y && mouseY <= inputPos.y + tamCompNodes
                ) {
                    // Find and remove the connection
                    let index = chip.connections.findIndex(conn =>
                        conn.toComponent === component.name && conn.toIndex === i
                    );
                    if (index !== -1) {
                        chip.connections.splice(index, 1);
                        component.inputs[i] = 0;
                    }
                }
            });
        });

        // cut connecetions of chips inputs
        chip.chips.forEach(subChip => {
            subChip.inputs.forEach((_, i) => {
                let inputPos = subChip.getInputPositionSC(i);
                if (
                    mouseX >= inputPos.x && mouseX <= inputPos.x + tamCompNodes &&
                    mouseY >= inputPos.y && mouseY <= inputPos.y + tamCompNodes
                ) {
                    // Find and remove the connection
                    let index = chip.connections.findIndex(conn => 
                        conn.toComponent === subChip.name && conn.toIndex === i
                    );
                    if (index !== -1) {
                        chip.connections.splice(index, 1);
                        subChip.inputs[i] = 0;
                    }
                }
            });
        });

        // cut connections of components inputs
        for (let i = 0; i < chip.outputs.length; i++) {
            let outputPos = chip.getOutputPosition(i);
            if (
                mouseX >= outputPos.x && mouseX <= outputPos.x + tamBasicNodes &&
                mouseY >= outputPos.y && mouseY <= outputPos.y + tamBasicNodes
            ) {
                for(let j = 0; chip.connections.length; j++){
                    let conn = chip.connections[j]
                    if(conn.toComponent == 'OUTPUTS' && conn.toIndex == i){
                        chip.connections.splice(j, 1)
                        chip.outputs[i] = 0
                        break
                    }
                }
            }
        }

    }

    if(mouseX < WIDTH) selectedComp = undefined
    for (let c of chip.components) {
        if (c.inBounds(mouseX, mouseY)){
            selectedComp = c
            break
        }
    }
    for (let c of chip.chips) {
        if (c.inBounds(mouseX, mouseY)){
            selectedComp = c
            break
        }
    }
    if(selectedComp){ 
        let name = selectedComp.isSub ? selectedComp.externalName : selectedComp.type
        panel_remove.setText("Remove: " + name)
    }
    else panel_remove.setText("Remove: ")
}

function mouseReleased() {
    if (draggingConnection) {
        // Check if releasing on a component input
        for (let component of chip.components) {
            for (let i = 0; i < component.inputs.length; i++) {
                let inputPos = component.getInputPosition(i);
                if (
                    mouseX >= inputPos.x && mouseX <= inputPos.x + tamCompNodes &&
                    mouseY >= inputPos.y && mouseY <= inputPos.y + tamCompNodes
                ) {
                    chip.connect(dragStartComponent, dragStartIndex, component.name, i);
                    draggingConnection = false;
                    dragStart = null;
                    dragStartIndex = null;
                    dragStartComponent = null;
                    return;
                }
            }
        }

        // Check if releasing on a chip input or output
        for (let c of chip.chips) {
            for (let i = 0; i < c.inputs.length; i++) {
                let inputPos = c.getInputPositionSC(i);

                if (
                    mouseX >= inputPos.x && mouseX <= inputPos.x + tamCompNodes &&
                    mouseY >= inputPos.y && mouseY <= inputPos.y + tamCompNodes
                ) {
                    chip.connect(dragStartComponent, dragStartIndex, c.name, i);
                    draggingConnection = false;
                    dragStart = null;
                    dragStartIndex = null;
                    dragStartComponent = null;
                    return;
                }
            }
        }
        
        // releasing on the outputs
        for (let i = 0; i < chip.outputs.length; i++) {
            let outputPos = chip.getOutputPosition(i);
            if (
                mouseX >= outputPos.x && mouseX <= outputPos.x + tamBasicNodes &&
                mouseY >= outputPos.y && mouseY <= outputPos.y + tamBasicNodes
            ) {
                chip.connect(dragStartComponent, dragStartIndex, 'OUTPUTS', i);
                draggingConnection = false;
                dragStart = null;
                dragStartIndex = null;
                dragStartComponent = null;
                return;
            }
        }
    }

    // Reset dragging state
    draggingConnection = false;
    dragStart = null;
    dragStartIndex = null;
    dragStartComponent = null;
}

function mouseClicked() {
    // Click chip inputs to toggle them
    for (let i = 0; i < chip.inputs.length; i++) {
        let inputPos = chip.getInputPosition(i);
        if (
            mouseX >= inputPos.x && mouseX <= inputPos.x + tamBasicNodes &&
            mouseY >= inputPos.y && mouseY <= inputPos.y + tamBasicNodes
        ) {
            chip.setInput(i, chip.inputs[i] === 0 ? 1 : 0);
        }
    }

    for(let c of chip.components){
        if(c instanceof Display){
            if(c.inBoundsSign()) c.toggleSign()
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
        console.log(newChip.externalName)
        panel.createButton(newChip.externalName, (f) => {
            chip.addComponent(newChip.name, 'CHIP', newChip.externalName);
            compNames++
        })
        compNames++
    }
}

