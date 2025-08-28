const HEIGHT_NODE = 25
const RAD_PIN = 8
const SIZE_PIXEL = 2
const SNAP_PIXEL_SIZE = 10
const GRID_SIZE = 70 + 8

const VERY_LIGHT_COL = 240
const LIGHT_COL = 225
const MED_COL = 190
const DARK_COL = 140
const VERY_DARK_COL = 90

function isPinConnected(node, side, index){
    for(let connection of graph.connections){
        if(side == 'input' && connection.toNode == node && connection.toPort == index) return true;
        if(side == 'output' && connection.fromNode == node && connection.fromPort == index) return true;
    }
    return false;
}

function deleteConnectionsOfNode(node){
    graph.connections = graph.connections.filter(conn => {
        return conn.fromNode !== node && conn.toNode !== node;
    });
}

function lineIntersection(p1, p2, p3, p4) {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0) return undefined; // Lines are parallel

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return undefined; // Intersection not within line segments

    return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y)
    };
}