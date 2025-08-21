let state = undefined
let dragging = undefined
let connecting = undefined
let deletingConnections = undefined

function keyPressed(){
    if(keyCode == 68){
        if(state == undefined) state = 'deleting'
        else state = undefined
    }
}


function mouseReleased(){
    if(state == 'dragNode') state = undefined
    dragging = undefined
}

function mouseClicked(){
    if(state == 'deleting'){
        for(let node of graph.nodes){
            if(inBounds(mouseX, mouseY, node.pos.x, node.pos.y, node.width, node.height)){
                graph.nodes.splice(graph.nodes.indexOf(node), 1);
                deleteConnectionsOfNode(node);
                return
            }
        }
    }
    if(state == undefined && !connecting){
        for(let node of graph.nodes){
            let pin = node.pinInBounds()
            if(pin != undefined){
                if(isPinConnected(pin.node, pin.side, pin.index) && pin.side == 'input') return
                connecting = pin
                state = 'connecting'
                return
            }
        }
    }
    if(connecting){
        for(let node of graph.nodes){
            let pin = node.pinInBounds()
            if(pin != undefined && pin.node == connecting.node && pin.side == connecting.side && pin.index == connecting.index){
                connecting = undefined
                state = undefined
                return
            }
            if(pin != undefined && !isPinConnected(pin.node, pin.side, pin.index) && pin.side != connecting.side){
                if(connecting.side == 'input'){
                    let newConn = new Connection(pin.node, pin.index, connecting.node, connecting.index)
                    graph.addConnection(newConn)
                }
                else{
                    let newConn = new Connection(connecting.node, connecting.index, pin.node, pin.index)
                    graph.addConnection(newConn)
                }
                connecting = undefined
                state = undefined
                return
            }
        }
    }
    if(deletingConnections){
        let connsToDelete = [];
        for(let connection of graph.connections){
            let posFrom = connection.fromNode.getPinPos(connection.fromPort, 'output');
            let posTo = connection.toNode.getPinPos(connection.toPort, 'input');
            if(lineIntersection(deletingConnections.from, deletingConnections.to, posFrom, posTo)){
                connsToDelete.push(connection);
            }
        }
        for(let conn of connsToDelete){
            graph.connections.splice(graph.connections.indexOf(conn), 1);
        }
        deletingConnections = undefined
        return
    }
}

function mouseDragged(){
    // dragging already dragging node
    if(dragging){
        dragging.pos.x = mouseX - dragging.width / 2;
        dragging.pos.y = mouseY - dragging.height / 2;
        return
    }

    // check if we are connecting pins
    if(state == undefined){
        for(let node of graph.nodes){
            let pin = node.pinInBounds()
            if(pin != undefined){
                if(isPinConnected(pin.node, pin.side, pin.index) && pin.side == 'input') return
                connecting = pin
                state = 'connecting'
                return
            }
        }
    }

    // check if we are dragging a node
    if((state == undefined || state == 'dragNode') && !connecting){
        for(let node of graph.nodes){
            if(inBounds(mouseX, mouseY, node.pos.x, node.pos.y, node.width, node.height)){
                node.pos.x = mouseX - node.width / 2;
                node.pos.y = mouseY - node.height / 2;
                state = 'dragNode'
                dragging = node
                return
            }
        }
    }

    // check if we are deleting connections
    if(state == 'deleting' && deletingConnections == undefined){
        deletingConnections = {from: {x: mouseX, y: mouseY}, to: {x: mouseX, y: mouseY}}
    }

}

function showInputManager(){
    if(connecting){
        stroke(20, 230, 40)
        let pos = connecting.node.getPinPos(connecting.index, connecting.side)
        line(pos.x, pos.y, mouseX, mouseY)
    }
    if(deletingConnections){
        deletingConnections.to.x = mouseX;
        deletingConnections.to.y = mouseY;
        stroke(255, 0, 0)
        line(deletingConnections.from.x, deletingConnections.from.y, deletingConnections.to.x, deletingConnections.to.y)
    }
}