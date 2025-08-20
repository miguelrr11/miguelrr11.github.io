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
            node.evaluate();
        }
        
    }

    show(){
        for(let connection of this.connections){
            connection.show();
        }
        for(let node of this.nodes){
            node.show();
        }
    }
}
