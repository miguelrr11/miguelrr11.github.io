let state = undefined
let dragging = undefined
let offX = 0
let offY = 0
let connecting = undefined
let deletingConnections = undefined

let selected = undefined
let highlightedConns = new Set()
let highlightedNodes = new Set()

function toggleDelete(){
    if(state == undefined){ 
        state = 'deleting'
        cursor(CROSS)
    }
    else {
        state = undefined
        cursor(ARROW)
    }
}

function keyPressed(){
    if(keyCode == 68){
        toggleDelete()
    }
}


function mouseReleased(){
    if(state == 'dragNode'){ 
        state = undefined
        cursor(ARROW)
    }
    if(dragging){ 
        cursor(ARROW)
        dragging.moved = false
        dragging.move(mouseX + offX, mouseY + offY);
        dragging = undefined
        offX = 0
        offY = 0
    }
    else if(state != 'deleting') cursor(ARROW)
    //unselectNode();
}

function highLightNode(node){
    let high = getAllConnectionsFromNodeBoth(node);
    highlightedConns = high.connections;
    highlightedNodes = high.nodes;
    for(let conn of highlightedConns) conn.highlight = true;
    for(let n of highlightedNodes) n.highlight = true;
}

function selectNode(node){
    selected = node
    highLightNode(node);
}

function unselectNode(){
    for(let conn of highlightedConns) conn.highlight = false;
    for(let node of highlightedNodes) node.highlight = false;
    highlightedConns.clear();
    highlightedNodes.clear();
    selected = undefined;
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
            if(pin != undefined && pin.node.acceptsConnection(pin.side, pin.index) && pin.side != connecting.side){
                if(connecting.side == 'input'){
                    let newConn = new Connection(pin.node, pin.index, connecting.node, connecting.index)
                    graph.addConnection(newConn)
                }
                else{
                    let newConn = new Connection(connecting.node, connecting.index, pin.node, pin.index)
                    graph.addConnection(newConn)
                }
                if(selected) highLightNode(selected);
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
    if(state == undefined){
        for(let i = graph.nodes.length - 1; i >= 0; i--){
            let node = graph.nodes[i]
            if(inBounds(mouseX, mouseY, node.pos.x, node.pos.y, node.width, node.height)){
                selectNode(node);
                return
            }
        }
        for(let button of buttons){
            if(inBounds(mouseX, mouseY, button.pos.x, button.pos.y, button.w, button.h)){
                return
            }
        }
        selected = undefined
    }
}

function mouseDragged(){
    // dragging already dragging node
    if(dragging){
        dragging.move(mouseX + offX, mouseY + offY);
        cursor(HAND)
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
                cursor(HAND)
                return
            }
        }
    }

    // check if we are dragging a node
    if((state == undefined || state == 'dragNode') && !connecting){
        unselectNode();
        for(let i = graph.nodes.length - 1; i >= 0; i--){
            let node = graph.nodes[i]
            if(inBounds(mouseX, mouseY, node.pos.x, node.pos.y, node.width, node.height)){
                offX = node.pos.x - mouseX
                offY = node.pos.y - mouseY;
                node.move(mouseX + offX, mouseY + offY);
                node.moved = true
                state = 'dragNode'
                dragging = node
                selectNode(node)
                cursor(HAND)
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
        let pos = connecting.node.getPinPos(connecting.index, connecting.side)
        fill(VERY_DARK_COL)
        noStroke()
        showConnection(pixelateLine(pos, {x: mouseX, y: mouseY}))
    }
    if(deletingConnections){
        deletingConnections.to.x = mouseX;
        deletingConnections.to.y = mouseY;
        fill(255, 0, 0)
        noStroke()
        showConnection(pixelateLine(deletingConnections.from, deletingConnections.to))
    }
}