class Chip {
  constructor(name, inputs = [], outputs = []) {
    this.name = name;
    this.inputs = inputs;   // Input names
    this.outputs = outputs; // Output names
    this.components = [];   // Components like AND, OR, NOT
  }

  // Add a new component (e.g., AND, OR, NOT, or another custom chip)
  addComponent(type, inputs = [], outputs = []) {
    let x = random(width);
    let y = random(height);
    let h = Math.max(inputs.length, outputs.length) * 25;
    let off = (h / inputs.length) / 2;
    
    let inpPos = {};
    let outPos = {};

    inputs.forEach((inp, idx) => {
      inpPos[idx] = (h / inputs.length) * idx + off;
    });

    off = (h / outputs.length) / 2;
    outputs.forEach((out, idx) => {
      outPos[idx] = (h / outputs.length) * idx + off;
    });

    // Track undefined inputs and outputs, and use null to signify unconnected
    let comp = new Component(
      type,
      inputs.map(inp => inp || null),  // Null for undefined inputs
      outputs.map(out => out || null), // Null for undefined outputs
      x,
      y,
      60,
      h,
      inpPos,
      outPos,
      {} // Empty connections object
    );
    this.components.push(comp);
  }

  // Manually connect inputs and outputs
  connect(inputComponent, inputName, outputComponent, outputName) {
    // Find the inputComponent and add a connection to the outputComponent
    let component = this.components.find(comp => comp === inputComponent);
    if (component) {
      component.connections[inputName] = { outputComponent, outputName };
      console.log(`Connected ${outputComponent.type}.${outputName} to ${inputComponent.type}.${inputName}`);
    } else {
      console.warn(`Input ${inputName} not found in component ${inputComponent.type}`);
    }
  }

  // Register the chip in the registry
  register() {
    chipRegistry[this.name] = {
      name: this.name,
      inputs: this.inputs,
      outputs: this.outputs,
      components: this.components
    };
  }

  // Show all components
  showAll(state) {
    this.components.forEach(component => {
      component.show(state);  // Pass the global state
    });
  }

   inBounds(x, y, comp){
    return x > comp.x && x < comp.x + 50 && y > comp.y && y < comp.y + 50
  }

  move(x, y, comp){
    comp.x = x - 25
    comp.y = y - 25
  }
}