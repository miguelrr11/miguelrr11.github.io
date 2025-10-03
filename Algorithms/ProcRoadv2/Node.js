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

    showTags(){
        push()
        noStroke()
        textAlign(CENTER)
        let str = this.id + ': ' + this.incomingSegmentIDs.length + '-' + this.outgoingSegmentIDs.length
        textSize(12)
        let bbox = textBounds(str, this.pos.x, this.pos.y)
        fill(255, 0, 0)
        rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
        fill(0)
        noStroke()
        text(str, this.pos.x, this.pos.y)
        pop()
    }

    show(){
        push()
        noFill()
        textSize(15)
        this.hover() ? strokeWeight(3) : strokeWeight(1.5)
        stroke(255, 200)
        ellipse(this.pos.x, this.pos.y, NODE_RAD * 2)
        pop()
    }
}