const NODE_RAD = 15
const GRID_CELL_SIZE = 15

class Road{
    constructor(){
        this.segments = []
        this.nodes = []
        this.nodeIDcounter = 0
        this.segmentIDcounter = 0
        cursor(CROSS)
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

    show(){
        this.segments.forEach(s => s.show())
        this.nodes.forEach(n => n.show())
    }
}