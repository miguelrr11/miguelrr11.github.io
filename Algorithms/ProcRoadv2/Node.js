class Node{
    constructor(id, x, y){
        if(id == undefined || x == undefined || y == undefined) 
            console.log('Undefined values creating node:\nid = ' + id + ' | x = ' + x + ' | y = ' + y)
        this.id = id
        this.pos = {x, y}
        this.incomingSegmentIDs = []
        this.outgoingSegmentIDs = []
        this.road = undefined
    }

    hover(){
        return dist(mouseX, mouseY, this.pos.x, this.pos.y) <= NODE_RAD
    }

    show(SHOW_TAGS){
        push()
        if(SHOW_TAGS) fill(0)
        else noFill()
        textSize(15)
        this.hover() ? strokeWeight(3) : strokeWeight(1.5)
        stroke(255, 150)
        ellipse(this.pos.x, this.pos.y, NODE_RAD * 2)
        fill(255, 0, 0)
        textAlign(CENTER)
        if(SHOW_TAGS) text(this.id + '\n' + this.incomingSegmentIDs.length + '-' + this.outgoingSegmentIDs.length, this.pos.x, this.pos.y)
        pop()
    }
}