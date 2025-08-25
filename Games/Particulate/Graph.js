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
            connection.toNode.inputs[connection.toPort] = connection.fromNode.outputs[connection.fromPort];
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

    reconstruct(json){
        let data = JSON.parse(json);
        this.nodes = []
        this.connections = []
        for(let nodeData of data.nodes){
            let node;
            switch(nodeData.type){
                case 'NodeConstant':
                    node = new NodeConstant(nodeData.value);
                    break;
                case 'NodeVariable':
                    node = new NodeVariable();
                    break;
                case 'NodeSum':
                    node = new NodeSum();
                    break;
                case 'NodeSubtract':
                    node = new NodeSubtract();
                    break;
                case 'NodeMultiply':
                    node = new NodeMultiply();
                    break;
                case 'NodeDivide':
                    node = new NodeDivide();
                    break;
                case 'NodeSqrt':
                    node = new NodeSqrt();
                    break;
                case 'NodeLog':
                    node = new NodeLog();
                    break;
                case 'NodeExp':
                    node = new NodeExp();
                    break;
                case 'NodeRnd':
                    node = new NodeRnd();
                    break;
                case 'NodeParticulate':
                    node = new NodeParticulate();
                    break;
                case 'NodeEmitter':
                    node = new NodeEmitter();
                    break;
                case 'NodeChooser':
                    node = new NodeChooser();
                    break;
                case 'NodeCondMore':
                    node = new NodeCondMore();
                    break;
                case 'NodeCondLess':
                    node = new NodeCondLess();
                    break;
                case 'NodeCondEqual':
                    node = new NodeCondEqual();
                    break;
            }
            node.id = nodeData.id;
            node.inputs = nodeData.inputs;
            node.outputs = nodeData.outputs;
            node.pos = createVector(nodeData.pos.x, nodeData.pos.y);
            node.value = nodeData.value !== undefined ? nodeData.value : random(10);
            this.addNode(node);
        }
        for(let connData of data.connections){
            let fromNode = this.nodes.find(node => node.id === connData.from.id);
            let toNode = this.nodes.find(node => node.id === connData.to.id);
            if(fromNode && toNode){
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
