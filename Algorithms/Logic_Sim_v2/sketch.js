//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

const chipRegistry = {};

let complexChipJSON = {
    "name": "ComplexChip",
    "inputs": [
        "A",
        "B",
        "C",
        "D",
        "E"
    ],
    "outputs": [
        "Out1",
        "Out2",
        "Out3"
    ],
    "components": [
        {
            "type": "AND",
            "inputs": [
                "A",
                "B"
            ],
            "outputs": [
                "mid1"
            ],
            "x": 216,
            "y": 100,
            "h": 50,
            "w": 60,
            "inpPos": {
                "A": 12.5,
                "B": 37.5
            },
            "outPos": {
                "mid1": 25
            },
            "state": 0
        },
        {
            "type": "OR",
            "inputs": [
                "C",
                "D"
            ],
            "outputs": [
                "mid2"
            ],
            "x": 89,
            "y": 267,
            "h": 50,
            "w": 60,
            "inpPos": {
                "C": 12.5,
                "D": 37.5
            },
            "outPos": {
                "mid2": 25
            },
            "state": 0
        },
        {
            "type": "NOT",
            "inputs": [
                "mid1"
            ],
            "outputs": [
                "mid3"
            ],
            "x": 148,
            "y": 208,
            "h": 25,
            "w": 60,
            "inpPos": {
                "mid1": 12.5
            },
            "outPos": {
                "mid3": 12.5
            },
            "state": 1
        },
        {
            "type": "AND",
            "inputs": [
                "mid3",
                "E"
            ],
            "outputs": [
                "mid4"
            ],
            "x": 272,
            "y": 225,
            "h": 50,
            "w": 60,
            "inpPos": {
                "mid3": 12.5,
                "E": 37.5
            },
            "outPos": {
                "mid4": 25
            },
            "state": 0
        },
        {
            "type": "OR",
            "inputs": [
                "mid4",
                "mid2"
            ],
            "outputs": [
                "Out1",
                "Out2"
            ],
            "x": 414,
            "y": 246,
            "h": 50,
            "w": 60,
            "inpPos": {
                "mid4": 12.5,
                "mid2": 37.5
            },
            "outPos": {
                "Out1": 12.5,
                "Out2": 37.5
            },
            "state": 0
        },
        {
            "type": "NOT",
            "inputs": [
                "Out1"
            ],
            "outputs": [
                "Out3"
            ],
            "x": 414,
            "y": 141,
            "h": 25,
            "w": 60,
            "inpPos": {
                "Out1": 12.5
            },
            "outPos": {
                "Out3": 12.5
            },
            "state": 1
        }
    ]
}

let activeChip

let inputPositions = []
let inputStates = {A: 1, B: 0};

function setup(){
    createCanvas(WIDTH, HEIGHT)
    textFont(loadFont("mono.ttf"));
    textAlign(CENTER, CENTER)

    // chip = convertToChip(complexChipJSON);
    // chip.register()

    // let dualOutputChip = new Chip("DualOutputChip", ["A", "B"], ["Out1", "Out2"]);

    // // Add an OR gate component that produces two outputs
    // dualOutputChip.addComponent("OR", ["A", "B"], ["Out1", "Out2"]);

    // // Register the dual output chip
    // dualOutputChip.register();
    // let combinedChip = new Chip("CombinedChip", ["A", "B", "C"], ["FinalOut", "f2"]);

    // // Add the DualOutputChip as a component
    // combinedChip.addComponent("DualOutputChip", ["A", "B"], ["Out1", "Out2"]);

    // // Add an AND gate that connects "Out1" from DualOutputChip with input "C"
    // combinedChip.addComponent("AND", ["Out2", "C"], ["FinalOut"]);
    // combinedChip.addComponent("NOT", [undefined], [undefined])
    //  combinedChip.addComponent("NOT", [undefined], [undefined])

    // // Register the combined chip
    // combinedChip.register();
    // activeChip = combinedChip

    let chip = new Chip("TestChip", ["A", "B"], ["out1"]);  // Output is undefined

    chip.addComponent("AND", ["A", "B"], [null]);  // Undefined output
    chip.addComponent("OR", [null, "A"], ["out1"]);  // Undefined input

    chip.register();
    activeChip = chip

    for(let i = 0; i < activeChip.inputs.length; i++){
        let inp = activeChip.inputs[i]
        inputPositions[inp] = {x: 20, y: height / activeChip.inputs.length * i + (height / activeChip.inputs.length)/2}
    }
}

function mouseClicked(){
    for(let inp of activeChip.inputs){
        let pos = inputPositions[inp]
        if(dist(mouseX, mouseY, pos.x, pos.y) < 50){ 
            inputStates[inp] = inputStates[inp] == 1 ? 0 : 1
        }
    }
}


function draw(){
    background(100)
    if(mouseIsPressed){
        for(let c of activeChip.components){
            if(activeChip.inBounds(mouseX, mouseY, c)) activeChip.move(mouseX, mouseY, c)
        }
    }
    
    const outputStates = simulateCustomChip(activeChip, inputStates);
    drawChip(activeChip, inputStates, outputStates);
}

function isBasicGate(type){
    return type == "AND" || type == "OR" || type == "NOT"
}

function simulateBasicGate(component, state) {
  const inputValues = component.inputs.map(input => state[input]);

  let result;
  switch (component.type) {
    case 'AND':
      result = inputValues.every(val => val === 1) ? 1 : 0;
      break;
    case 'OR':
      result = inputValues.some(val => val === 1) ? 1 : 0;
      break;
    case 'NOT':
      result = inputValues[0] === 1 ? 0 : 1;
      break;
    // Add more gate types as needed
  }

  // Propagate the result to all outputs (assuming the same result for all outputs)
  component.outputs.forEach(output => {
    state[output] = result;
  });

  // Store the result as the component state for rendering
  component.state = component.outputs.map(output => state[output]);
}




function loadCustomChip(type) {
  const chip = chipRegistry[type];
  if (!chip) {
    console.error(`Chip type '${type}' not found in registry.`);
    return null;
  }
  return chip;
}

function simulateCustomChip(customChip, inputs) {
  let state = { ...inputs };

  // Ensure connections are respected and manual connections are required
  customChip.components.forEach(component => {
    component.inputs.forEach((input, idx) => {
      if (input === null || !component.connections[input]) {
        // Undefined or unconnected input, leave it as open for manual connection
        state[`undefined_input_${idx}`] = null;
      }
    });

    component.outputs.forEach((output, idx) => {
      if (output === null) {
        // Undefined output, leave it as open for future manual connection
        state[`undefined_output_${idx}`] = null;
      }
    });
  });

  // Simulate each component in the custom chip
  customChip.components.forEach(component => {
    if (isBasicGate(component.type)) {
      // Collect input values based on connections
      const inputValues = component.inputs.map(input => {
        if (component.connections[input]) {
          // If there's a connection, use the connected output's value
          const { outputComponent, outputName } = component.connections[input];
          return state[outputName];  // Get the output value from the connected component
        } else {
          return state[input] || 0;  // Default to 0 if not connected
        }
      });

      // Simulate the basic gate logic (AND, OR, NOT)
      simulateBasicGate(component, state);

    } else {
      // For custom or nested chips, simulate them as well
      const nestedChip = loadCustomChip(component.type);
      const nestedInputValues = {};

      component.inputs.forEach((input, idx) => {
        if (component.connections[input]) {
          // Use the connected component's output value
          const { outputComponent, outputName } = component.connections[input];
          nestedInputValues[nestedChip.inputs[idx]] = state[outputName];
        } else {
          // Use the input state if not connected
          nestedInputValues[nestedChip.inputs[idx]] = state[input] || 0;
        }
      });

      // Recursively simulate the nested chip
      const nestedOutput = simulateCustomChip(nestedChip, nestedInputValues);

      // Map the nested chip's outputs to the current component's outputs
      nestedChip.outputs.forEach((output, idx) => {
        state[component.outputs[idx]] = nestedOutput[output];
      });
    }

    // Store the component's state for rendering and output propagation
    component.state = component.outputs.map(output => state[output]);
  });

  // Extract the output values after all components have been simulated
  const outputValues = {};
  customChip.outputs.forEach(output => {
    outputValues[output] = state[output];
  });

  return outputValues;  // Return the final output values of the chip
}



function drawChip(chip, inputStates, outputStates) {
  chip.components.forEach(component => {

    component.inputs.forEach((input, i) => {
      let yOffset = component.y + component.inpPos[input];

      // Draw undefined inputs as open inputs
      if (chip.inputs.includes(input)) {
        drawInputConnection(input, component.x, yOffset, inputStates[input]);
      } 
    });

    // Draw all outputs (including undefined ones)
    component.outputs.forEach((output, i) => {
      let yOffset = component.y + component.outPos[output];

      // Draw undefined outputs as open outputs
      if (chip.outputs.includes(output)) {
        drawOutputConnection(component.x, yOffset, output, outputStates[output], i, chip.outputs.length, component);
      } 
    });
  });

  activeChip.showAll(inputStates)
}


function drawInputs() {
    push()
    rectMode(CENTER)
    for (let input in inputPositions) {
        let pos = inputPositions[input];
        let state = inputStates[input];

        strokeWeight(2)
        // Draw input and component as rectangles
        fill(state ? 255 : 0);
        stroke(state ? 0 : 255);
        rect(pos.x, pos.y, 25, 25); // Chip input

    }
    pop()
}


function drawInputConnection(input, x, y, inputState) {
  const pos = inputPositions[input];
  if (pos) {
    // Set up drawing style based on input state
    push();
    stroke(255);
    strokeWeight(inputState ? 4 : 2);  // Thicker lines for active inputs
    rectMode(CENTER);

    // Draw line between input and component
    line(pos.x, pos.y, x, y);  // Use inpPos for vertical positioning

    strokeWeight(2)
    // Draw input and component as rectangles
    fill(inputState ? 255 : 0);
    stroke(inputState ? 0 : 255);
    rect(x, y, 15, 15);    // Component input
    rect(pos.x, pos.y, 25, 25); // Chip input
    pop();
  }
}

function drawConnection(x1, y1, x2, y2, stateArray, outputName, comp) {

    const state = stateArray[comp.outputs.indexOf(outputName)];
  push();
  stroke(255);
  strokeWeight(state ? 4 : 2);  // Thicker lines for active connections
  rectMode(CENTER);

  // Optionally use bezier or curve for a smoother connection
  // bezier(x1 + comp.w, y1, x1 + 75, y1, x2 - 75, y2, x2, y2);
  line(x1 + comp.w, y1, x2, y2);  // Straight line
  // Optionally use bezier or curve for a smoother connection
  noFill()
    //bezier(x1 + comp.w, y1, x1 + 75, y1, x2 - 75, y2, x2, y2);

  // strokeWeight(2)
  // stroke(state ? 0 : 255);
  // fill(state ? 255 : 0);
  // rect(x1 + comp.w, y1, 15, 15);  // Output side
  // rect(x2, y2, 15, 15);  // Input side
  pop();
}

function drawOutputConnection(x, y, output, outputState, index, totalOutputs, comp) {
    const outputX = WIDTH - 20;  // Fixed output position
    push();
    stroke(255);
    strokeWeight(outputState ? 4 : 2);
    rectMode(CENTER);

    // Draw line from component to output position
    line(x + comp.w, y, outputX, y);
    strokeWeight(2)
    stroke(outputState ? 0 : 255);
    // Draw output markers
    fill(outputState ? 255 : 0);
    rect(outputX, y, 25, 25);  // Output position
    rect(x + comp.w, y, 15, 15);  // Component output side
    pop();
}


function convertToChip(chipObject) {
  // Create a new Chip instance with the name, inputs, and outputs
  const chip = new Chip(chipObject.name, chipObject.inputs, chipObject.outputs);

  // Add each component with its type, inputs, output, and position
  chipObject.components.forEach(component => {
    chip.addComponent(component.type, component.inputs, component.outputs, component.x, component.y);
  });

  return chip;
}
