/** Resumen:
 * A road consists of nodes and segments connecting them.
 * The nodes and segments form a directed graph.
 * The paths are a way to group segments between two nodes, they do not affect the graph structure.
 * Paths modify the segments adding position for lanes and direction
 * Segments are separated by intersections on nodes. These intersections contain Connectors that tell the incomming segment what other 
 * intersection-segments there are to choose. 
 */

// It is extremely important to separate segments (array segments) from the intersection segments (array intersecSegs)
// because they have different ID pools

const NODE_RAD = 20
const GRID_CELL_SIZE = 15   //15
const OFFSET_RAD_INTERSEC = 25
const LENGTH_SEG_BEZIER = 3      //3
const TENSION_BEZIER_MIN = 0.1
const TENSION_BEZIER_MAX = 0.5
const MIN_DIST_INTERSEC = 40        //30
const LANE_WIDTH = 20

class Road{
    constructor(){
        this.paths = new Map()
        this.segments = []
        this.nodes = []
        this.connectors = [] 
        this.intersecSegs = []

        this.nodeIDcounter = 0
        this.segmentIDcounter = 0
        this.connectorIDcounter = 0
        this.intersecSegIDcounter = 0
    }

    setPaths(){
        this.paths = new Map()
        this.connectors = [] 
        this.intersecSegs = []
        this.connectorIDcounter = 0
        this.intersecSegIDcounter = 0
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
        this.trimAllIntersections()
    }

    trimAllIntersections(){
        this.nodes.forEach(n => this.trimSegmentsAtIntersection(n.id))

        // for(let seg of this.segments){
        //     let possibleIntersecSegsIDs = []

        // }
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
        let fromTo = this.getAllSegmentsBetweenNodesExclusively(nodeID1, nodeID2)
        let toFrom = this.getAllSegmentsBetweenNodesExclusively(nodeID2, nodeID1)
        return [...fromTo, ...toFrom]
    }

    getAllSegmentsBetweenNodesExclusively(nodeID1, nodeID2){
        return this.segments.filter(s => (s.fromNodeID == nodeID1 && s.toNodeID == nodeID2))
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
        let visualDir = segment.visualDir
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
        toNode.incomingSegmentIDs = toNode.incomingSegmentIDs.filter(id => id != segmentID)

        let segment1 = this.addSegment(fromNode.id, newNode.id, visualDir)
        let segment2 = this.addSegment(newNode.id, toNode.id, visualDir)

        return {segment1, segment2, newNode}
    }

    findNode(id){
        return this.nodes.find(n => n.id == id)
    }

    findSegment(id){
        return this.segments.find(s => s.id == id)
    }

    findConnector(id){
        return this.connectors.find(c => c.id == id)
    }

    findIntersecSeg(id){
        return this.intersecSegs.find(c => c.id == id)
    }
    
    addNode(x, y){
        const newNode = new Node(this.nodeIDcounter, x, y)
        this.nodes.push(newNode)
        newNode.road = this
        this.nodeIDcounter++
        return newNode
    }

    findHoverNode(x, y){
        return this.nodes.find(n => n.hover(x, y))
    }

    addSegment(fromNodeID, toNodeID, visualDir){
        const fromNode = this.findNode(fromNodeID)
        const toNode = this.findNode(toNodeID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error adding segment, node not found:\nfromNodeID = ' + fromNodeID + ' | toNodeID = ' + toNodeID)
            return
        }
        let newSegment = new Segment(this.segmentIDcounter, fromNodeID, toNodeID, visualDir)
        newSegment.road = this
        this.segments.push(newSegment)
        fromNode.outgoingSegmentIDs.push(newSegment.id)
        toNode.incomingSegmentIDs.push(newSegment.id)
        this.segmentIDcounter++
        return newSegment
    }

    nodeOnceConnected(node){
        //returns true if the node has only one connected NODE
        let connectedNodes = new Set()
        let connectedSegments = this.findConnectedSegments(node.id)
        connectedSegments.forEach(s => {
            if(s.fromNodeID != node.id) connectedNodes.add(s.fromNodeID)
            if(s.toNodeID != node.id) connectedNodes.add(s.toNodeID)
        })
        return connectedNodes.size <= 1
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
        let intersections = []
        connectedSegments.forEach(s1 => {
            connectedSegments.forEach(s2 => {
                if(s1.id == s2.id) return
                let intersection = lineIntersection(
                    s1.fromPos, s1.toPos,
                    s2.fromPos, s2.toPos, false
                )
                if(intersection == undefined){
                    if(s1.fromPos.x == s2.fromPos.x && s1.fromPos.y == s2.fromPos.y) intersection = s1.fromPos
                    else if(s1.fromPos.x == s2.toPos.x && s1.fromPos.y == s2.toPos.y) intersection = s1.fromPos
                    else if(s1.toPos.x == s2.fromPos.x && s1.toPos.y == s2.fromPos.y) intersection = s1.toPos
                    else if(s1.toPos.x == s2.toPos.x && s1.toPos.y == s2.toPos.y) intersection = s1.toPos
                    else intersection = this.findNode(nodeID).pos
                }
                if(intersection != undefined){
                    if(!arrHasPosition(intersections, intersection)) intersections.push(intersection)
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
        //if parallel doesn't work
        if(intersections.length == 0) return
        else if(intersections.length == 1){
            farthestIntersection = intersections[0]
            distInter = dist(node.pos.x, node.pos.y, farthestIntersection.x, farthestIntersection.y)
        }
        else {
            for(let inter of intersections){
                let node = this.findNode(nodeID)
                let d = dist(node.pos.x, node.pos.y, inter.x, inter.y)
                if(d > distInter){
                    distInter = d
                    farthestIntersection = inter
                }
            }
        }
        

        distInter += OFFSET_RAD_INTERSEC
        distInter = max(distInter, MIN_DIST_INTERSEC)
        //if(farthestIntersection) auxShow.push(farthestIntersection)
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
        this.connectIntersection(nodeID, this.nodeOnceConnected(node))
    }

    connectIntersection(nodeID, connectSelf = false){
        let node = this.findNode(nodeID)
        if(!node) return
        let segments = this.findConnectedSegments(nodeID)
        // if a segment ends in this node, we have to connect it to every other segment that starts in this node
        // also, if a segment starts in this node, we have to connect it to every other segment that ends in this node
        let incoming = node.incomingSegmentIDs.map(id => this.findSegment(id))
        let outgoing = node.outgoingSegmentIDs.map(id => this.findSegment(id)) 

        let connectorMap = new Map()

        incoming.forEach(inSeg => {
            outgoing.forEach(outSeg => {
                //avoid creating a connector between two segments that are already connected
                if(inSeg.fromNodeID == outSeg.toNodeID && !connectSelf) return
                //create connectors
                let inSegFromPos = inSeg.toPos
                let inSegToPos = inSeg.fromPos
                let outSegFromPos = outSeg.toPos
                let outSegToPos = outSeg.fromPos

                let conn1aux = connectorMap.get(inSeg.id)
                let connector1
                if(!conn1aux){
                    connector1 = new Connector(inSeg.id, undefined, inSegFromPos, this.connectorIDcounter)
                    connector1.road = this
                    this.connectors.push(connector1)
                    this.connectorIDcounter++
                    connectorMap.set(inSeg.id, connector1)
                }
                else {
                    connector1 = conn1aux
                    //connector1.outgoingSegmentIDs.push(outSeg.id)
                }
                
                let conn2aux = connectorMap.get(outSeg.id)
                let connector2
                if(!conn2aux){
                    connector2 = new Connector(undefined, outSeg.id, outSegToPos, this.connectorIDcounter)
                    connector2.road = this
                    this.connectors.push(connector2)
                    this.connectorIDcounter++
                    connectorMap.set(outSeg.id, connector2)
                }
                else{ 
                    connector2 = conn2aux
                    //connector2.incomingSegmentIDs.push(inSeg.id)
                }
                

                let tension = map(dist(inSegFromPos.x, inSegFromPos.y, outSegToPos.x, outSegToPos.y), 10, 150, TENSION_BEZIER_MIN, TENSION_BEZIER_MAX, true)

                let LENGTH_CONTROL_POINT = 120

                let controlPointBez1
                let dir1 = inSeg.dir
                controlPointBez1 = {x: inSegFromPos.x + Math.cos(dir1) * LENGTH_CONTROL_POINT, 
                                    y: inSegFromPos.y + Math.sin(dir1) * LENGTH_CONTROL_POINT}

                let controlPointBez2
                let dir2 = outSeg.dir + PI
                controlPointBez2 = {x: outSegToPos.x + Math.cos(dir2) * LENGTH_CONTROL_POINT, 
                                    y: outSegToPos.y + Math.sin(dir2) * LENGTH_CONTROL_POINT}

                let pointsBezier = bezierPoints(controlPointBez1, inSegFromPos, outSegToPos, controlPointBez2, LENGTH_SEG_BEZIER, tension)

                let seg = new Segment(this.intersecSegIDcounter, undefined, undefined, inSeg.visualDir)
                seg.fromConnectorID = connector1.id
                seg.toConnectorID = connector2.id
                seg.road = this
                seg.bezierPoints = pointsBezier
                seg.fromPos = inSegFromPos
                seg.toPos = outSegToPos
                this.intersecSegs.push(seg)
                this.intersecSegIDcounter++

                // connector1.outgoingSegmentID = seg.id
                // connector2.incomingSegmentID = seg.id

                connector1.outgoingSegmentIDs.push(seg.id)
                connector2.incomingSegmentIDs.push(seg.id)

                inSeg.toConnectorID = connector1.id
                outSeg.fromConnectorID = connector2.id
            })
        })
    }

    show(){
        this.segments.forEach(s => s.show())
    }

    showPaths(SHOW_TAGS, SHOW_SEGS_DETAILS){
        this.paths.forEach(p => p.show(SHOW_TAGS, SHOW_SEGS_DETAILS))
    }

    showConnectors(SHOW_TAGS){
        this.connectors.forEach(c => c.show(SHOW_TAGS))
    }

    showIntersecSegs(SHOW_TAGS){
        this.intersecSegs.forEach(s => s.showBezier(SHOW_TAGS))
    }

    showLanes(){
        this.paths.forEach(p => p.showLanes())
        this.intersecSegs.forEach(s => s.showLane())
    }

    showNodes(){
        this.nodes.forEach(n => n.show())
    }

    showNodesTags(){
        this.nodes.forEach(n => n.showTags())
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

function arrHasPosition(arr, pos){
    for(let p of arr){
        if(p.x == pos.x && p.y == pos.y) return true
    }
    return false
}