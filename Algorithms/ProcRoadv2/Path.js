class Path{
    constructor(nodeA, nodeB, segmentIDs){
        if(nodeA == undefined || nodeB == undefined || segmentIDs == undefined)
            console.warn('Invalid arguments while creating Path:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB + ' | segmentIDs = ' + segmentIDs)
        // a Set of segment IDs that form this path
        this.segmentsIDs = segmentIDs
        this.road = undefined

        this.nodeA = nodeA
        this.nodeB = nodeB
    }

    // Coje la posicion de los nodos, y el numero de lanes y construye sus propios carriles reales con posiciones calculadas
    constructRealLanes(){
        let nodeA = this.road.findNode(this.nodeA)
        let nodeB = this.road.findNode(this.nodeB)
        if(!nodeA || !nodeB) {
            console.warn('Invalid nodes in path while constructing real lanes:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB)
            return
        }
        
        let fromPos = nodeA.pos
        let toPos = nodeB.pos
        let angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) - PI / 2
        let numLanes = this.segmentsIDs.size
        let totalWidth = numLanes * LANE_WIDTH
        let startOffset = -totalWidth / 2 + LANE_WIDTH / 2

        let i = 0
        this.segmentsIDs.forEach(segmentID => {
            let offset = startOffset + i * LANE_WIDTH
            let laneFromPos = {x: fromPos.x + Math.cos(angle) * offset, y: fromPos.y + Math.sin(angle) * offset}
            let laneToPos = {x: toPos.x + Math.cos(angle) * offset, y: toPos.y + Math.sin(angle) * offset}
            let segment = this.road.findSegment(segmentID)
            let nodeFrom = this.road.findNode(segment.fromNodeID)
            let nodeTo = this.road.findNode(segment.toNodeID)
            let dir = Math.atan2(nodeTo.pos.y - nodeFrom.pos.y, nodeTo.pos.x - nodeFrom.pos.x) - PI

            //also we modify the segment to have the new calculated positions
            segment.fromPos = segment.fromNodeID == nodeB.id ? laneFromPos : laneToPos
            segment.toPos = segment.toNodeID == nodeA.id ? laneToPos : laneFromPos
            segment.dir = dir

            i++
        })
    }

    show(){
        push()
        strokeWeight(2.5)
        stroke(255)
        this.segmentsIDs.forEach(segmentID => {
            let segment = this.road.findSegment(segmentID)
            if(segment.fromPos){
                stroke(255)
                strokeWeight(2.5)
                line(segment.fromPos.x, segment.fromPos.y, segment.toPos.x, segment.toPos.y)
                let midPos = {x: (segment.fromPos.x + segment.toPos.x) / 2, y: (segment.fromPos.y + segment.toPos.y) / 2}
                drawArrowTip(midPos.x, midPos.y, segment.dir, 7)

                if(SHOW_SEGS_DETAILS){
                    
                    stroke(0, 255, 0)
                    strokeWeight(8)
                    point(segment.fromPos.x, segment.fromPos.y)
                    stroke(255, 0, 0)
                    point(segment.toPos.x, segment.toPos.y)
                }
                

                if(SHOW_TAGS){
                    let str = segment.id + ': ' + segment.fromNodeID + '-' + segment.toNodeID
                    textAlign(CENTER)
                    textSize(12)
                    let bbox = textBounds(str, midPos.x, midPos.y - 10)
                    fill(255, 0, 0)
                    noStroke()
                    rect(bbox.x - 2, bbox.y - 2, bbox.w + 4, bbox.h + 4)
                    fill(255)
                    noStroke()
                    text(str, midPos.x, midPos.y - 10)
                }
                
            }
        })
        pop()
    }
}