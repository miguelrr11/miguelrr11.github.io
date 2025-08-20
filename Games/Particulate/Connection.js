class Connection{
    constructor(fromNode, fromPort, toNode, toPort){
        this.fromNode = fromNode;
        this.fromPort = fromPort;
        this.toNode = toNode;
        this.toPort = toPort;
    }

    show(){
        stroke(0);
        strokeWeight(2);
        let posFrom = this.fromNode.getPinPos(this.fromPort, 'output');
        let posTo = this.toNode.getPinPos(this.toPort, 'input');
        line(posFrom.x, posFrom.y, posTo.x, posTo.y);
    }
}