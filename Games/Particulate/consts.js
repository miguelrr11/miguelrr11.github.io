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

const TRANSPARENCY_PARTICLE_THRESHOLD = 0.9

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

const saved = {"nodes":[{"id":19,"type":"NodeConstant","inputs":[],"outputs":[0],"value":0,"pos":{"x":390,"y":300}},{"id":20,"type":"NodeConstant","inputs":[],"outputs":[1],"value":1,"pos":{"x":20,"y":120}},{"id":21,"type":"NodeConstant","inputs":[],"outputs":[2],"value":2,"pos":{"x":20,"y":190}},{"id":22,"type":"NodeConstant","inputs":[],"outputs":[3],"value":3,"pos":{"x":20,"y":260}},{"id":23,"type":"NodeConstant","inputs":[],"outputs":[4],"value":4,"pos":{"x":20,"y":330}},{"id":24,"type":"NodeConstant","inputs":[],"outputs":[5],"value":5,"pos":{"x":20,"y":400}},{"id":25,"type":"NodeConstant","inputs":[],"outputs":[6],"value":6,"pos":{"x":20,"y":470}},{"id":26,"type":"NodeConstant","inputs":[],"outputs":[7],"value":7,"pos":{"x":20,"y":540}},{"id":27,"type":"NodeConstant","inputs":[],"outputs":[8],"value":8,"pos":{"x":20,"y":610}},{"id":28,"type":"NodeConstant","inputs":[],"outputs":[9],"value":9,"pos":{"x":20,"y":680}},{"id":31,"type":"NodeEmitter","inputs":[{"options":{"color":78.77777777852407,"vel":{"isPInst":true,"dimensions":2,"_values":[0.8418790690632773,-0.5396662237653471]},"acc":{"isPInst":true,"dimensions":2,"_values":[0,0]}},"NtoSpawn":1}],"outputs":[],"value":5.445535409095694,"inputTags":["Properties"],"pos":{"x":970,"y":280}},{"id":32,"type":"NodeParticulate","inputs":[78.88888888963538,0.7768480195633435,-0.6296881406700551,0],"outputs":[{"options":{"color":78.88888888963538,"vel":{"isPInst":true,"dimensions":2,"_values":[0.7768480195633435,-0.6296881406700551]},"acc":{"isPInst":true,"dimensions":2,"_values":[0,0]}},"NtoSpawn":1}],"value":2.706461124324109,"inputTags":["Color","Vel_X","Vel_Y","Acc_Y"],"pos":{"x":730,"y":230}},{"id":34,"type":"NodeDivide","inputs":[1,9],"outputs":[0.1111111111111111,1],"value":2.2186102069973748,"pos":{"x":180,"y":420}},{"id":35,"type":"NodeSum","inputs":[0.1111111111111111,2679.0000000007467],"outputs":[2679.111111111858],"value":7.595163668735406,"pos":{"x":280,"y":420}},{"id":36,"type":"NodeCos","inputs":[2679.0000000007467],"outputs":[-0.711944124489529],"value":4.605562153076967,"pos":{"x":390,"y":490}},{"id":37,"type":"NodeSin","inputs":[2679.0000000007467],"outputs":[0.7022361167049428],"value":8.664500187187828,"pos":{"x":390,"y":390}},{"id":41,"type":"NodeSum","inputs":[1,9],"outputs":[10],"value":1.8516032226594958,"pos":{"x":160,"y":120}},{"id":42,"type":"NodePow","inputs":[2,10],"outputs":[100],"value":1.4935307763768624,"inputTags":["exp","base"],"pos":{"x":270,"y":120}},{"id":43,"type":"NodeDivide","inputs":[2679.0000000007467,100],"outputs":[26.790000000007467,79.0000000007467],"value":7.168309852646674,"pos":{"x":420,"y":130}}],"connections":[{"from":{"id":32,"port":0},"to":{"id":31,"port":0}},{"from":{"id":20,"port":0},"to":{"id":34,"port":0}},{"from":{"id":28,"port":0},"to":{"id":34,"port":1}},{"from":{"id":34,"port":0},"to":{"id":35,"port":0}},{"from":{"id":35,"port":0},"to":{"id":35,"port":1}},{"from":{"id":35,"port":0},"to":{"id":36,"port":0}},{"from":{"id":35,"port":0},"to":{"id":37,"port":0}},{"from":{"id":37,"port":0},"to":{"id":32,"port":1}},{"from":{"id":36,"port":0},"to":{"id":32,"port":2}},{"from":{"id":19,"port":0},"to":{"id":32,"port":3}},{"from":{"id":20,"port":0},"to":{"id":41,"port":0}},{"from":{"id":28,"port":0},"to":{"id":41,"port":1}},{"from":{"id":21,"port":0},"to":{"id":42,"port":0}},{"from":{"id":41,"port":0},"to":{"id":42,"port":1}},{"from":{"id":42,"port":0},"to":{"id":43,"port":1}},{"from":{"id":43,"port":1},"to":{"id":32,"port":0}},{"from":{"id":35,"port":0},"to":{"id":43,"port":0}}]}