/** Resumen:
 * A road consists of nodes and segments connecting them.
 * The nodes and segments form a directed graph.
 * The paths are a way to group segments between two nodes, they do not affect the graph structure.
 * Paths calculate 'lanes' from the segments they contain.
 * Lanes are the actual visual representation of the segments, they have a position and width.
 */

const NODE_RAD = 15
const GRID_CELL_SIZE = 15

class Road{
    constructor(){
        this.paths = []
        this.segments = []
        this.nodes = []
        this.nodeIDcounter = 0
        this.segmentIDcounter = 0
        cursor(CROSS)
    }

    setPaths(){
        this.paths = new Map()
        for(let i = 0; i < this.nodes.length; i++){
            for(let j = 0; j < this.nodes.length; j++){
                if(i == j) continue
                let nodeA = this.nodes[i]
                let nodeB = this.nodes[j]
                let segmentIDs = this.getAllSegmentsBetweenNodes(nodeA.id, nodeB.id).map(s => s.id)
                if(this.paths.has(nodeA.id + '-' + nodeB.id) || this.paths.has(nodeB.id + '-' + nodeA.id)){
                    this.paths.get(nodeA.id + '-' + nodeB.id)?.segmentsIDs.add(...segmentIDs)
                    this.paths.get(nodeB.id + '-' + nodeA.id)?.segmentsIDs.add(...segmentIDs)
                } 
                else if(segmentIDs.length > 0) {
                    let segmentSet = new Set(segmentIDs)
                    let path = new Path(nodeA.id, nodeB.id, segmentSet)
                    path.road = this
                    path.constructRealLanes()
                    this.paths.set(nodeA.id + '-' + nodeB.id, path)
                }
            }
        }
    }

    trimAllIntersections(){
        this.nodes.forEach(n => this.trimSegmentsAtIntersection(n.id))
    }

    findClosestSegmentAndPos(x, y){
        let pos = {x, y}
        let closestSegment = undefined
        let closestPoint = undefined
        let minDist = Infinity

        this.segments.forEach(s => {
            let fromPos = this.findNode(s.fromNodeID).pos
            let toPos = this.findNode(s.toNodeID).pos
            let ap = {x: pos.x - fromPos.x, y: pos.y - fromPos.y}
            let ab = {x: toPos.x - fromPos.x, y: toPos.y - fromPos.y}
            let ab2 = ab.x * ab.x + ab.y * ab.y
            let ap_ab = ap.x * ab.x + ap.y * ab.y
            let t = constrain(ap_ab / ab2, 0, 1)
            let point = {x: fromPos.x + ab.x * t, y: fromPos.y + ab.y * t}
            let d = dist(pos.x, pos.y, point.x, point.y)
            if(d < minDist){
                minDist = d
                closestSegment = s
                closestPoint = point
            }
        })

        return {closestSegment, closestPoint, minDist}
    }

    getAllSegmentsBetweenNodes(nodeID1, nodeID2){
        return this.segments.filter(s => (s.fromNodeID == nodeID1 && s.toNodeID == nodeID2) || (s.fromNodeID == nodeID2 && s.toNodeID == nodeID1))
    }

    deleteNode(nodeID){
        let node = this.findNode(nodeID)
        if(node == undefined){
            console.log('Error deleting node, node not found:\nnodeID = ' + nodeID)
            return
        }
        //delete all connected segments
        let connectedSegmentIDs = [...node.incomingSegmentIDs, ...node.outgoingSegmentIDs]
        connectedSegmentIDs.forEach(segmentID => this.deleteSegment(segmentID))
        //delete the node
        this.nodes = this.nodes.filter(n => n.id != nodeID)
    }

    deleteSegment(segmentID){
        let segment = this.findSegment(segmentID)
        if(segment == undefined){
            console.log('Error deleting segment, segment not found:\nsegmentID = ' + segmentID)
            return
        }
        let fromNode = this.findNode(segment.fromNodeID)
        let toNode = this.findNode(segment.toNodeID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error deleting segment, node not found:\nfromNodeID = ' + segment.fromNodeID + ' | toNodeID = ' + segment.toNodeID)
            return
        }
        //remove the segment
        this.segments = this.segments.filter(s => s.id != segmentID)
        fromNode.outgoingSegmentIDs = fromNode.outgoingSegmentIDs.filter(id => id != segmentID)
        toNode.incomingSegmentIDs = toNode.incomingSegmentIDs.filter(id => id != segmentID)
    }

    splitSegmentAtPos(segmentID, x, y, nodeAtSplit = undefined){
        let segment = this.findSegment(segmentID)
        if(segment == undefined){
            console.log('Error splitting segment, segment not found:\nsegmentID = ' + segmentID)
            return
        }
        let fromNode = this.findNode(segment.fromNodeID)
        let toNode = this.findNode(segment.toNodeID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error splitting segment, node not found:\nfromNodeID = ' + segment.fromNodeID + ' | toNodeID = ' + segment.toNodeID)
            return
        }
        //create new node
        let newNode = nodeAtSplit ? nodeAtSplit : this.addNode(x, y)
        //remove old segment
        this.segments = this.segments.filter(s => s.id != segmentID)
        fromNode.outgoingSegmentIDs = fromNode.outgoingSegmentIDs.filter(id => id != segmentID)
        //fromNode.outgoingSegmentIDs.push(newNode.id)
        toNode.incomingSegmentIDs = toNode.incomingSegmentIDs.filter(id => id != segmentID)
        //toNode.incomingSegmentIDs.push(newNode.id)
        //create two new segments
        let segment1 = this.addSegment(fromNode.id, newNode.id)
        let segment2 = this.addSegment(newNode.id, toNode.id)
        return {segment1, segment2, newNode}
    }

    findNode(id){
        return this.nodes.find(n => n.id == id)
    }

    findSegment(id){
        return this.segments.find(s => s.id == id)
    }
    
    addNode(x, y){
        const newNode = new Node(this.nodeIDcounter, x, y)
        this.nodes.push(newNode)
        newNode.road = this
        this.nodeIDcounter++
        return newNode
    }

    findHoverNode(){
        return this.nodes.find(n => n.hover())
    }

    addSegment(fromNodeID, toNodeID){
        const fromNode = this.findNode(fromNodeID)
        const toNode = this.findNode(toNodeID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error adding segment, node not found:\nfromNodeID = ' + fromNodeID + ' | toNodeID = ' + toNodeID)
            return
        }
        let newSegment = new Segment(this.segmentIDcounter, fromNodeID, toNodeID)
        console.log(newSegment)
        newSegment.road = this
        this.segments.push(newSegment)
        fromNode.outgoingSegmentIDs.push(newSegment.id)
        toNode.incomingSegmentIDs.push(newSegment.id)
        this.segmentIDcounter++
        return newSegment
    }

    findConnectedSegments(nodeID){
        return this.segments.filter(s => s.fromNodeID == nodeID || s.toNodeID == nodeID)
    }

    getPathsOfSegments(segments){
        let paths = new Set()
        segments.forEach(s => {
            this.paths.forEach(p => {
                if(p.segmentsIDs.has(s.id)) paths.add(p)
            })
        })
        return paths
    }

    findConnectedPaths(nodeID){
        let connectedSegments = this.findConnectedSegments(nodeID)
        return this.getPathsOfSegments(connectedSegments)
    }

    findIntersectionsOfNode(nodeID){
        let connectedSegments = this.findConnectedSegments(nodeID)
        let connectedPaths = this.getPathsOfSegments(connectedSegments)
        let intersections = new Set()
        connectedSegments.forEach(s1 => {
            connectedSegments.forEach(s2 => {
                if(s1.id == s2.id) return
                let intersection = lineIntersection(
                    s1.fromPos, s1.toPos,
                    s2.fromPos, s2.toPos
                )
                if(intersection != undefined){
                    intersections.add(intersection)
                    //auxShow.push(intersection)
                }
            })
        })
        return intersections
    }

    //trims all end of segments connected to the node to the farthest intersection found
    trimSegmentsAtIntersection(nodeID){
        let intersections = this.findIntersectionsOfNode(nodeID)
        let distInter = 0
        let farthestIntersection = null
        let node = this.findNode(nodeID)
        for(let inter of intersections){
            let node = this.findNode(nodeID)
            let d = dist(node.pos.x, node.pos.y, inter.x, inter.y)
            if(d > distInter){
                distInter = d
                farthestIntersection = inter
            }
        }
        distInter += 5
        if(farthestIntersection) auxShow.push(farthestIntersection)
        if(farthestIntersection != null){
            let connectedSegments = this.findConnectedSegments(nodeID)
            connectedSegments.forEach(s => {
                if(s.fromNodeID == nodeID){
                    s.fromPos = shortenSegment(s.toPos, s.fromPos, distInter)
                } 
                else if(s.toNodeID == nodeID){
                    s.toPos = shortenSegment(s.fromPos, s.toPos, distInter)
                }
            })
        }
    }


    show(){
        this.segments.forEach(s => s.show())
    }

    showNodes(){
        this.nodes.forEach(n => n.show())
    }

    showPaths(){
        this.paths.forEach(p => p.show())
    }
}

function shortenSegment(A, B, length) {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return { ...B }; // no movement possible

    const factor = (distance - length) / distance;
    // clamp so it doesn't overshoot past A
    const newX = A.x + dx * Math.max(factor, 0);
    const newY = A.y + dy * Math.max(factor, 0);

    return { x: newX, y: newY };
}
