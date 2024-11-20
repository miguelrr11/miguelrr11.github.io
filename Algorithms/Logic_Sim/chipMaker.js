// Assuming your classes (component, chip, nodo) are already defined

// JSON string (for simplicity, assuming it's already available in a variable)

// Step 1: Parse the JSON string into an object
// Helper function to recreate 'nodo' instances
function createNodos(nodoDataArray) {
    return nodoDataArray.map(nodoData => {
        const newNodo = new nodo(nodoData.type);
        newNodo.pos = createVector(nodoData.pos.x, nodoData.pos.y, nodoData.pos.z);
        newNodo.val = nodoData.val;
        newNodo.connected = nodoData.connected; // Assuming it's an array of connections
        newNodo.compsConnected = nodoData.compsConnected; // Assuming it's an array of components
        return newNodo;
    });
}

// Helper function to recreate 'component' instances
function createComponents(componentsDataArray) {
    return componentsDataArray.map(componentData => {
        const newComponent = new component(
            componentData.type,
            componentData.n_in,
            componentData.n_out,
            componentData.isEdge,
            componentData.dir
        );
        
        // Set properties like position, color, width, and height
        newComponent.pos = createVector(componentData.pos.x, componentData.pos.y, componentData.pos.z);
        newComponent.color = color(
            componentData.color.levels[0],
            componentData.color.levels[1],
            componentData.color.levels[2]
        );
        newComponent.width = componentData.width;
        newComponent.height = componentData.height;

        // Set inputs and outputs as nodos
        newComponent.inputs = createNodos(componentData.inputs || []);
        newComponent.outputs = createNodos(componentData.outputs || []);
        
        return newComponent;
    });
}

function makeChip(parsedData){
	// Step 2: Create the 'chip' instance using parsed data
	const inputs = createNodos(parsedData.inputs);
	const outputs = createNodos(parsedData.outputs);
	const components = createComponents(parsedData.components);

	const newChip = new chip(parsedData.type, components, inputs, outputs);
	newChip.pos = createVector(parsedData.pos.x, parsedData.pos.y, parsedData.pos.z);
	newChip.color = color(
	    parsedData.color.levels[0],
	    parsedData.color.levels[1],
	    parsedData.color.levels[2]
	);
	newChip.width = parsedData.width;
	newChip.height = parsedData.height;

	console.log(newChip);
	return newChip
}


