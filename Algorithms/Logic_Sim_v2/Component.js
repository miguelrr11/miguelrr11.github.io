class Component {
  constructor(type, inputs, outputs, x, y, w, h, inpPos, outPos, connections) {
    this.type = type;
    this.inputs = inputs;
    this.outputs = outputs;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.inpPos = inpPos;
    this.outPos = outPos;
    this.connections = connections;  // Stores connections for inputs
    this.state = {};  // Output states are stored here after simulation
  }

  show(state) {
    push();
    fill(255);
    stroke(0);
    rect(this.x, this.y, this.w, this.h);

    this.inputs.forEach((input, idx) => {
      let inputState = this.getInputState(input, state);
      this.drawInput(inputState, idx);
    });

    this.outputs.forEach((output, idx) => {
      let outputState = this.state[output] !== undefined ? this.state[output] : 0;
      this.drawOutput(outputState, idx);
    });

    fill(0);
    textSize(20);
    text(this.type, this.x + this.w / 2, this.y + this.h / 2);  // Draw the component type inside the box
    pop();
  }

  // Get input state based on connections or global state
  getInputState(input, globalState) {
    let connection = this.connections[input];
    if (connection) {
      let connectedComponent = connection.outputComponent;
      let connectedOutput = connection.outputName;
      return connectedComponent.state[connectedOutput];  // Return the output state of the connected component
    }
    return globalState[input] !== undefined ? globalState[input] : 0;  // Return global input state if not connected
  }

  drawInput(state, idx) {
    let yOffset = this.y + this.inpPos[this.inputs[idx]];
    strokeWeight(2);
    stroke(state ? 0 : 255);
    fill(state ? 255 : 0);
    rect(this.x, yOffset, 15, 15);
  }

  drawOutput(state, idx) {
    let yOffset = this.y + this.outPos[this.outputs[idx]];
    strokeWeight(2);
    stroke(state ? 0 : 255);
    fill(state ? 255 : 0);
    rect(this.x + this.w, yOffset, 15, 15);
  }
}