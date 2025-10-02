class Segment{
    constructor(id, fromNodeID, toNodeID){
        if(id == undefined || fromNodeID == undefined || toNodeID == undefined) 
            console.log('Undefined values creating segment:\nid = ' + id + ' | fromNodeID = ' + fromNodeID + ' | toNodeID = ' + toNodeID)
        this.id = id
        this.fromNodeID = fromNodeID
        this.toNodeID = toNodeID
        this.road = undefined


        //info updated by Path.js AFTER calling road.setPaths()
        this.fromPos = undefined
        this.toPos = undefined
        this.dir = undefined // direction in radians
    }

    showDirection(){
        push()
        strokeWeight(1.5)
        stroke(255)
        let fromPos = this.road.findNode(this.fromNodeID).pos
        let toPos = this.road.findNode(this.toNodeID).pos
        let midPos1 = lerppos(fromPos, toPos, 0.33)
        let midPos2 = lerppos(fromPos, toPos, 0.66)
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI
        drawArrowTip(midPos1.x, midPos1.y, angle, 10)
        drawArrowTip(midPos2.x, midPos2.y, angle, 10)
        pop()
    }

    show(){
        push()
        strokeWeight(1)
        stroke(255, 130)
        let fromPos = this.road.findNode(this.fromNodeID).pos
        let toPos = this.road.findNode(this.toNodeID).pos
        line(fromPos.x, fromPos.y, toPos.x, toPos.y)

        noStroke()
        fill(0, 255, 0)
        let midPos = {x: (fromPos.x + toPos.x) / 2, y: (fromPos.y + toPos.y) / 2}
        textAlign(CENTER)
        textSize(15)
        let str = this.id + ': ' + this.fromNodeID + '-' + this.toNodeID
        let bbox = textBounds(str, midPos.x, midPos.y)
        fill(0)
        rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
        fill(255)
        text(str, midPos.x, midPos.y)
        pop()

        this.showDirection()
    }
}

