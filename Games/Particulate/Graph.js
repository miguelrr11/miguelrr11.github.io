class Graph{
    constructor(){
        this.nodes = [];
        this.connections = [];
    }

    addNode(node){
        this.nodes.push(node);
    }

    addConnection(connection){
        this.connections.push(connection);
    }

    evaluate(){
        for(let connection of this.connections){
            //connection.toNode.inputs[connection.toPort] = connection.fromNode.outputs[connection.fromPort];
            connection.toNode.setInput(connection.toPort, connection.fromNode.outputs[connection.fromPort]);
        }
        for(let node of this.nodes){
            for(let i = 0; i < node.inputs.length; i++){
                if(!isPinConnected(node, 'input', i)){
                    node.inputs[i] = undefined
                }
            }
        }
        for(let node of this.nodes){
            node.evaluate();
        }
    }

    reset(){
        for(let node of this.nodes){
            node.reset();
        }
    }

    stringify(){
        let json = {
            nodes: this.nodes.map(node => ({
                id: node.id,
                type: node.constructor.name,
                inputs: node.inputs,
                outputs: node.outputs,
                value: node.value,
                pos: { x: round(node.pos.x), y: round(node.pos.y) }
            })),
            connections: this.connections.map(conn => ({
                from: { id: conn.fromNode.id, port: conn.fromPort },
                to: { id: conn.toNode.id, port: conn.toPort }
            }))
        };
        return JSON.stringify(json);
    }

    reconstruct(json) {
        let data = JSON.parse(json);
        this.nodes = [];
        this.connections = [];

        // Map node types to their corresponding constructors
        const nodeTypes = {
            NodeConstant: (data) => new NodeConstant(data.value),
            NodeVariable: () => new NodeVariable(),
            NodeSum: () => new NodeSum(),
            NodeSubtract: () => new NodeSubtract(),
            NodeMultiply: () => new NodeMultiply(),
            NodeDivide: () => new NodeDivide(),
            NodeSqrt: () => new NodeSqrt(),
            NodeLog: () => new NodeLog(),
            NodeExp: () => new NodeExp(),
            NodeRnd: () => new NodeRnd(),
            NodeParticulate: () => new NodeParticulate(),
            NodeEmitter: () => new NodeEmitter(),
            NodeChooser: () => new NodeChooser(),
            NodeCondMore: () => new NodeCondMore(),
            NodeCondLess: () => new NodeCondLess(),
            NodeCondEqual: () => new NodeCondEqual(),
            NodePow: () => new NodePow(),
            NodeSin: () => new NodeSin(),
            NodeCos: () => new NodeCos(),
        };

        let maxId = 0;
        for (let nodeData of data.nodes) {
            const createNode = nodeTypes[nodeData.type];
            if (!createNode) continue; // skip unknown node types

            let node = createNode(nodeData);
            node.id = nodeData.id;
            node.inputs = nodeData.inputs;
            node.outputs = nodeData.outputs;
            node.pos = createVector(nodeData.pos.x, nodeData.pos.y);
            node.value = nodeData.value !== undefined ? nodeData.value : random(10);

            this.addNode(node);

            if(node.id > maxId) maxId = node.id;
        }
        NodeID = maxId + 1;

        for (let connData of data.connections) {
            let fromNode = this.nodes.find(node => node.id === connData.from.id);
            let toNode = this.nodes.find(node => node.id === connData.to.id);
            if (fromNode && toNode) {
                this.addConnection(new Connection(fromNode, connData.from.port, toNode, connData.to.port));
            }
        }
    }



    show(){
        push()
        noStroke()
        rectMode(CENTER)
        for(let connection of this.connections){
            connection.update()
            connection.highlight ? fill(VERY_DARK_COL) : fill(MED_COL)
            showConnection(connection.pixels, connection.highlight ? SIZE_PIXEL * 1.5 : SIZE_PIXEL)
        }
        pop()
        for(let node of this.nodes){
            node.show();
        }
    }
}
