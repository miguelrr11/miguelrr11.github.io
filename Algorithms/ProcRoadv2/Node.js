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

    hover(x, y){
        return dist(x, y, this.pos.x, this.pos.y) <= NODE_RAD
    }

    showTags(){
        push()
        noStroke()
        textAlign(CENTER)
        let str = '[' + this.id + ']' + ': nIn: ' + this.incomingSegmentIDs.length + ' nOut: ' + this.outgoingSegmentIDs.length
        textSize(4)
        let bbox = textBounds(str, this.pos.x, this.pos.y - NODE_RAD)
        fill(255, 0, 0)
        rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
        fill(0)
        noStroke()
        text(str, this.pos.x, this.pos.y - NODE_RAD)
        pop()
    }

    show(selected = false){
        push()
        selected ? fill(255, 100) : noFill()
        textSize(15)
        strokeWeight(1.5)
        stroke(255, 200)
        let mult = selected ? 1.8 : 2
        ellipse(this.pos.x, this.pos.y, NODE_RAD * mult)
        pop()
    }
}