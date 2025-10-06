class Path{
    constructor(nodeA, nodeB, segmentIDs){
        if(nodeA == undefined || nodeB == undefined || segmentIDs == undefined)
            console.warn('Invalid arguments while creating Path:\nnodeA = ' + nodeA + ' | nodeB = ' + nodeB + ' | segmentIDs = ' + segmentIDs)
        // a Set of segment IDs that form this path
        this.segmentsIDs = segmentIDs
        this.road = undefined

        this.nodeA = nodeA
        this.nodeB = nodeB

        this.id = nodeA + '_' + nodeB
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
            segment.fromPos = segment.fromNodeID == nodeA.id ? laneFromPos : laneToPos
            segment.toPos = segment.toNodeID == nodeB.id ? laneToPos : laneFromPos
            segment.dir = dir

            i++
        })
    }

    showLanes(){
        this.segmentsIDs.forEach(segmentID => {
            let segment = this.road.findSegment(segmentID)
            segment.showLanes()
        })
    }

    showPath(SHOW_TAGS, SHOW_SEGS_DETAILS){
        this.segmentsIDs.forEach(segmentID => {
            let segment = this.road.findSegment(segmentID)
            segment.showPath(SHOW_TAGS, SHOW_SEGS_DETAILS)
        })
    }

    // gets all points of all lanes and draws the full road
    showWay(){
        push()
        noStroke()
        fill(50)
        for(let segID of this.segmentsIDs){
            let seg = this.road.findSegment(segID)
            seg.showCustomLanes([50], LANE_WIDTH * 1.4)
            seg.showCustomLanes([150], LANE_WIDTH * 1.2)
        }
        pop()
    }
}