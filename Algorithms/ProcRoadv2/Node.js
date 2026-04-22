class Node{
    constructor(id, x, y){
        if(id == undefined || x == undefined || y == undefined)
            console.log('Undefined values creating node:\nid = ' + id + ' | x = ' + x + ' | y = ' + y)
        this.id = id
        this.pos = {x, y}
        this.incomingSegmentIDs = []
        this.outgoingSegmentIDs = []
        this.incomingSegments = []  // Direct object references
        this.outgoingSegments = []  // Direct object references
        this.road = undefined

        this.curvePath = false

        this.OOB = false
    }

    setOOB(value){
        this.OOB = value == undefined ? this.outOfBounds() : value
    }

    outOfBounds(){
        return !inBoundsCorners(this.pos.x, this.pos.y, GLOBAL_EDGES, 100)
    }

    export(){
        return [round(this.pos.x, 2), round(this.pos.y, 2)]
    }

    moveTo(x, y){
        this.pos.x = x
        this.pos.y = y
    }

    hover(x, y){
        //if(this.curvePath) return false
        if(this.OOB) return false
        return squaredDistance(x, y, this.pos.x, this.pos.y) <= NODE_RAD_SQ
    }

    showTags(){
        if(!inBoundsCorners(this.pos.x, this.pos.y, GLOBAL_EDGES, NODE_RAD)) return
        push()
        noStroke()
        textAlign(CENTER)
        //let str = '[' + this.id + ']' + ': nIn: ' + this.incomingSegmentIDs.length + ' nOut: ' + this.outgoingSegmentIDs.length
        let str = '[' + this.id + ']'
        textSize(12)
        let bbox = textBounds(str, this.pos.x, this.pos.y - NODE_RAD)
        fill(255, 0, 0)
        rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
        fill(0)
        noStroke()
        text(str, this.pos.x, this.pos.y - NODE_RAD)
        pop()
    }

    show(selected = false, zoom = 1){
        //if(this.curvePath) return
        if(!inBoundsCorners(this.pos.x, this.pos.y, GLOBAL_EDGES, NODE_RAD)) return
        push()
        selected ? fill(255, 100) : noFill()
        strokeWeight(1.5 / zoom)
        stroke(255, 200)
        let mult = selected ? 1.8 : 2
        ellipse(this.pos.x, this.pos.y, NODE_RAD * mult)
        pop()
    }
}