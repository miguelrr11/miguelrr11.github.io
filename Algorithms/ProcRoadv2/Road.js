/** Resumen:
 * A road consists of nodes and segments connecting them.
 * The nodes and segments form a directed graph.
 * The paths are a way to group segments between two nodes, they do not affect the graph structure.
 * Paths modify the segments adding position for lanes and direction
 * Segments are separated by intersections on nodes. These intersections contain Connectors that tell the incomming segment what other 
 * intersection-segments there are to choose. 
 * Intersections are just a data structure to group intersections (they contain the nodeID, the connectors and the intersection-segments)
 */

// It is extremely important to separate segments (array segments) from the intersection segments (array intersecSegs)
// because they have different ID pools

const NODE_RAD = 20
const GRID_CELL_SIZE = 15   //15
const OFFSET_RAD_INTERSEC = 25
let LENGTH_SEG_BEZIER = 5      //3
const TENSION_BEZIER_MIN = 0.1
const TENSION_BEZIER_MAX = 0.5
const MIN_DIST_INTERSEC = 30        //30
const LANE_WIDTH = 30

class Road{
    constructor(tool){
        this.tool = tool

        this.segments = []
        this.nodes = []

        this.connectors = [] 
        this.intersecSegs = []
        this.intersections = []
        this.paths = new Map()

        this.nodeIDcounter = 0
        this.segmentIDcounter = 0

        this.connectorIDcounter = 0
        this.intersecSegIDcounter = 0
    }

    setPaths(){
        LENGTH_SEG_BEZIER = map(this.tool.zoom, 0.1, 8, 8, 3, true)

        this.paths = new Map()
        this.connectors = [] 
        this.intersecSegs = []
        this.intersections = []
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
    }

    // Incrementally updates only the paths affected by the given node IDs
    updateAffectedPaths(affectedNodeIDs){
        LENGTH_SEG_BEZIER = map(this.tool.zoom, 0.1, 8, 8, 3, true)

        //this.setPosSegs(affectedNodeIDs)

        // Convert to Set for efficient lookup
        let affectedSet = new Set(affectedNodeIDs)

        // Find all paths that involve any of the affected nodes
        let pathsToRemove = []
        this.paths.forEach((path, key) => {
            if(affectedSet.has(path.nodeA) || affectedSet.has(path.nodeB)){
                pathsToRemove.push(key)
            }
        })

        // Remove old paths
        pathsToRemove.forEach(key => this.paths.delete(key))

        // Rebuild only affected paths
        for(let affectedNodeID of affectedNodeIDs){
            let affectedNode = this.findNode(affectedNodeID)
            if(!affectedNode) continue

            for(let otherNode of this.nodes){
                if(otherNode.id == affectedNodeID) continue

                // Check path from affectedNode to otherNode
                let segmentIDs = this.getAllSegmentsBetweenNodes(affectedNodeID, otherNode.id).map(s => s.id)
                if(segmentIDs.length > 0){
                    let key1 = affectedNodeID + '-' + otherNode.id
                    let key2 = otherNode.id + '-' + affectedNodeID

                    if(!this.paths.has(key1) && !this.paths.has(key2)){
                        let segmentSet = new Set(segmentIDs)
                        let path = new Path(affectedNodeID, otherNode.id, segmentSet)
                        path.road = this
                        path.constructRealLanes()
                        this.paths.set(key1, path)
                    }
                }
            }
        }
    }


    setPosSegs(affectedNodeIDs){
        for(let affectedNodeID of affectedNodeIDs){
            let affectedNode = this.findNode(affectedNodeID)
            if(!affectedNode) continue

            this.trimSegmentsAtIntersection(affectedNodeID, false)
            
        }
    }

    // Incrementally updates only the intersections at the given node IDs
    updateAffectedIntersections(affectedNodeIDs){
        // Remove old intersections at affected nodes
        for(let nodeID of affectedNodeIDs){
            let intersection = this.findIntersection(nodeID)
            if(intersection){
                // Remove all connectors and intersecSegs associated with this intersection
                for(let connID of intersection.connectorsIDs){
                    let connector = this.findConnector(connID)
                    if(connector){
                        // Clear segment references to this connector
                        for(let segID of connector.incomingSegmentIDs){
                            let seg = this.findSegment(segID)
                            if(seg && seg.toConnectorID == connID) seg.toConnectorID = undefined
                        }
                        for(let segID of connector.outgoingSegmentIDs){
                            let seg = this.findSegment(segID)
                            if(seg && seg.fromConnectorID == connID) seg.fromConnectorID = undefined
                        }
                    }
                }

                // Remove connectors
                this.connectors = this.connectors.filter(c => !intersection.connectorsIDs.includes(c.id))

                // Remove intersection segments
                this.intersecSegs = this.intersecSegs.filter(is => !intersection.intersecSegsIDs.includes(is.id))

                // Remove intersection
                this.intersections = this.intersections.filter(i => i.nodeID != nodeID)
            }
        }

        // Rebuild intersections at affected nodes
        for(let nodeID of affectedNodeIDs){
            let node = this.findNode(nodeID)
            if(node){
                this.trimSegmentsAtIntersection(nodeID)
            }
        }
    }

    // the edges of segments are the positions of the nodes
    findClosestSegmentAndPos(x, y){
        let pos = {x, y}
        let closestSegment = undefined
        let closestPoint = undefined
        let minDist = Infinity

        this.segments.forEach(s => {
            let fromPos = this.findNode(s.fromNodeID).pos
            let toPos = this.findNode(s.toNodeID).pos
            if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES, NODE_RAD) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES, NODE_RAD)){
                //continue
            }
            else{
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
            }
        })

        return {closestSegment, closestPoint, minDist}
    }

    // the edges of segments are the real positions of the segments (after path modification)
    findClosestSegmentAndPosRealPos(x, y){
        let pos = {x, y}
        let closestSegment = undefined
        let closestPoint = undefined
        let minDist = Infinity

        this.segments.forEach(s => {
            let fromPos = s.fromPos
            let toPos = s.toPos
            if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES, NODE_RAD) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES, NODE_RAD)){
                //continue
            }
            else{
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

        // Collect all connected nodes before deletion
        let affectedNodeIDs = new Set([nodeID])
        let connectedSegments = this.findConnectedSegments(nodeID)
        connectedSegments.forEach(seg => {
            if(seg.fromNodeID != nodeID) affectedNodeIDs.add(seg.fromNodeID)
            if(seg.toNodeID != nodeID) affectedNodeIDs.add(seg.toNodeID)
        })

        //delete all connected segments (without triggering updates for each)
        let connectedSegmentIDs = [...node.incomingSegmentIDs, ...node.outgoingSegmentIDs]
        connectedSegmentIDs.forEach(segmentID => this.deleteSegmentNoUpdate(segmentID))

        //delete the node
        this.nodes = this.nodes.filter(n => n.id != nodeID)

        // Update only affected paths and intersections
        this.updateAffectedPaths(Array.from(affectedNodeIDs))
        this.updateAffectedIntersections(Array.from(affectedNodeIDs))
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

        // Update only affected paths and intersections
        this.updateAffectedPaths([fromNode.id, toNode.id])
        this.updateAffectedIntersections([fromNode.id, toNode.id])
    }

    deleteSegmentNoUpdate(segmentID){
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
        //remove the segment without triggering updates
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
        let newNode = nodeAtSplit ? nodeAtSplit : this.addNodeNoUpdate(x, y)
        //remove old segment
        this.segments = this.segments.filter(s => s.id != segmentID)
        fromNode.outgoingSegmentIDs = fromNode.outgoingSegmentIDs.filter(id => id != segmentID)
        toNode.incomingSegmentIDs = toNode.incomingSegmentIDs.filter(id => id != segmentID)

        let segment1 = this.addSegmentNoUpdate(fromNode.id, newNode.id, visualDir)
        let segment2 = this.addSegmentNoUpdate(newNode.id, toNode.id, visualDir)
        // segment1.fromPos = {...fromNode.pos}
        // segment1.toPos = {x, y}
        // segment2.fromPos = {x, y}
        // segment2.toPos = {...toNode.pos}

        // Update all three affected nodes at once
        this.updateAffectedPaths([fromNode.id, newNode.id, toNode.id])
        this.updateAffectedIntersections([fromNode.id, newNode.id, toNode.id])

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

    findIntersection(id){
        return this.intersections.find(i => i.nodeID == id)
    }

    findIntersecSegByFromToConnectorIDs(fromConnectorID, toConnectorID){
        return this.intersecSegs.find(c => c.fromConnectorID == fromConnectorID && c.toConnectorID == toConnectorID)
    }

    findConnectorBySegmentID(segmentID, type){
        if(type == 'incoming'){
            return this.connectors.find(c => c.incomingSegmentIDs.includes(segmentID))
        } 
        else if(type == 'outgoing'){
            return this.connectors.find(c => c.outgoingSegmentIDs.includes(segmentID))
        }
    }

    
    addNode(x, y){
        const newNode = new Node(this.nodeIDcounter, x, y)
        this.nodes.push(newNode)
        newNode.road = this
        this.nodeIDcounter++
        return newNode
    }

    addNodeNoUpdate(x, y){
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
        // newSegment.fromPos = {...fromNode.pos}
        // newSegment.toPos = {...toNode.pos}
        newSegment.road = this
        this.segments.push(newSegment)
        fromNode.outgoingSegmentIDs.push(newSegment.id)
        toNode.incomingSegmentIDs.push(newSegment.id)
        this.segmentIDcounter++

        // Update affected paths and intersections
        this.updateAffectedPaths([fromNodeID, toNodeID])
        this.updateAffectedIntersections([fromNodeID, toNodeID])

        return newSegment
    }

    addSegmentNoUpdate(fromNodeID, toNodeID, visualDir){
        const fromNode = this.findNode(fromNodeID)
        const toNode = this.findNode(toNodeID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error adding segment, node not found:\nfromNodeID = ' + fromNodeID + ' | toNodeID = ' + toNodeID)
            return
        }
        let newSegment = new Segment(this.segmentIDcounter, fromNodeID, toNodeID, visualDir)
        // newSegment.fromPos = {...fromNode.pos}
        // newSegment.toPos = {...toNode.pos}
        console.log(newSegment)
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
        const connectedSegments = this.findConnectedSegments(nodeID);
        const intersections = [];
        const seen = new Set(); 

        connectedSegments.forEach(s1 => {
            connectedSegments.forEach(s2 => {
                if (s1.id == s2.id) return;

                let intersection = lineIntersection(
                    s1.fromPos, s1.toPos,
                    s2.fromPos, s2.toPos, false
                );

                if (intersection == undefined){
                    if (s1.fromPos.x == s2.fromPos.x && s1.fromPos.y == s2.fromPos.y) intersection = s1.fromPos;
                    else if (s1.fromPos.x == s2.toPos.x && s1.fromPos.y == s2.toPos.y) intersection = s1.fromPos;
                    else if (s1.toPos.x == s2.fromPos.x && s1.toPos.y == s2.fromPos.y) intersection = s1.toPos;
                    else if (s1.toPos.x == s2.toPos.x && s1.toPos.y == s2.toPos.y) intersection = s1.toPos;
                    else intersection = this.findNode(nodeID).pos;
                }

                if (intersection != undefined){
                    const key = `${intersection.x},${intersection.y}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        intersections.push(intersection);
                    }
                }
            });
        });

        return intersections;
    }


    //trims all end of segments connected to the node to the farthest intersection found
    trimSegmentsAtIntersection(nodeID, connect = true){
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
        if(connect) this.connectIntersection(nodeID, this.nodeOnceConnected(node))
    }

    connectIntersection(nodeID, connectSelf = false){
        let node = this.findNode(nodeID)
        let intersection = new Intersection(nodeID, [], [])
        intersection.road = this
        if(!node) return
        // if a segment ends in this node, we have to connect it to every other segment that starts in this node
        // also, if a segment starts in this node, we have to connect it to every other segment that ends in this node
        let incoming = node.incomingSegmentIDs.map(id => this.findSegment(id))
        let outgoing = node.outgoingSegmentIDs.map(id => this.findSegment(id)) 

        let connectorMap = new Map()
        let intersecSegs = []

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
                

                let tension = map(dist(inSegFromPos.x, inSegFromPos.y, outSegToPos.x, outSegToPos.y), 10, 250, TENSION_BEZIER_MIN, TENSION_BEZIER_MAX, true)
                let LENGTH_CONTROL_POINT = 120

                // let LENGTH_CONTROL_POINT = dist(inSegToPos.x, inSegToPos.y, outSegFromPos.x, outSegFromPos.y) * .1
                // let tension = LENGTH_CONTROL_POINT / 300

                let controlPointBez1
                let dir1 = inSeg.dir
                controlPointBez1 = {x: inSegFromPos.x + Math.cos(dir1) * LENGTH_CONTROL_POINT, 
                                    y: inSegFromPos.y + Math.sin(dir1) * LENGTH_CONTROL_POINT}

                let controlPointBez2
                let dir2 = outSeg.dir + PI
                controlPointBez2 = {x: outSegToPos.x + Math.cos(dir2) * LENGTH_CONTROL_POINT, 
                                    y: outSegToPos.y + Math.sin(dir2) * LENGTH_CONTROL_POINT}

                let pointsBezier = bezierPoints(controlPointBez1, inSegFromPos, outSegToPos, controlPointBez2, LENGTH_SEG_BEZIER, tension)

                let totalLen = 0
                for(let i = 1; i < pointsBezier.length; i++){
                    totalLen += dist(pointsBezier[i].x, pointsBezier[i].y, pointsBezier[i-1].x, pointsBezier[i-1].y)
                }

                let seg = new InterSegment(this.intersecSegIDcounter, connector1.id, connector2.id, inSeg.visualDir, pointsBezier)
                seg.road = this
                seg.fromPos = inSegFromPos
                seg.toPos = outSegToPos
                seg.len = totalLen
                this.intersecSegs.push(seg)
                this.intersecSegIDcounter++

                // connector1.outgoingSegmentID = seg.id
                // connector2.incomingSegmentID = seg.id

                connector1.outgoingSegmentIDs.push(seg.id)
                connector2.incomingSegmentIDs.push(seg.id)

                inSeg.toConnectorID = connector1.id
                outSeg.fromConnectorID = connector2.id

                intersecSegs.push(seg.id)

                seg.constructOutline()
            })
        })
        intersection.connectorsIDs = Array.from(connectorMap.values()).map(c => c.id)
        intersection.intersecSegsIDs = intersecSegs
        let pathsIDs = new Set()
        for(let i = 0; i < this.nodes.length; i++){
            for(let j = 0; j < this.nodes.length; j++){
                if(i == j) continue
                if(i == nodeID || j == nodeID){
                    let foundPath = this.paths.get(this.nodes[i].id + '-' + this.nodes[j].id) || this.paths.get(this.nodes[j].id + '-' + this.nodes[i].id)
                    if(foundPath){
                        pathsIDs.add(foundPath.id)
                    }
                }
            }
        }
        intersection.pathsIDs = Array.from(pathsIDs)
        this.intersections.push(intersection)
    }

    showMain(SHOW_TAGS){
        this.segments.forEach(s => s.showMain(SHOW_TAGS))
    }

    showPaths(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined){
        this.paths.forEach(p => p.showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID))
    }

    showConnectors(SHOW_TAGS){
        this.connectors.forEach(c => c.show(SHOW_TAGS))
    }

    showIntersecSegs(SHOW_TAGS){
        this.intersecSegs.forEach(s => s.showBezier(SHOW_TAGS))
    }

    showLanes(hoveredSegID = undefined){
        this.paths.forEach(p => p.showLanes(hoveredSegID))
        this.intersecSegs.forEach(s => s.showLane())
    }

    showNodes(){
        this.nodes.forEach(n => n.show())
    }

    showNodesTags(){
        this.nodes.forEach(n => n.showTags())
    }

    showWays(){
        this.paths.forEach(p => p.showWayBase())
        this.intersections.forEach(p => p.showWayBase())
        this.paths.forEach(p => p.showWayTop())
        this.intersections.forEach(p => p.showWayTop())
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

function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current);
    totalPath.unshift(current);
  }
  return totalPath;
}

function getLowest(openSet, fScore) {
  let best = null;
  let bestScore = Infinity;
  for (const id of openSet) {
    const s = fScore.get(id) ?? Infinity;
    if (s < bestScore) {
      bestScore = s;
      best = id;
    }
  }
  return best;
}

function Astar(startNodeID, goalNodeID, road) {
  const openSet = new Set([startNodeID]);

  const cameFrom = new Map();

  const gScore = new Map();
  gScore.set(startNodeID, 0);

  const fScore = new Map();
  fScore.set(startNodeID, h(startNodeID, goalNodeID, road));

  while (openSet.size > 0) {
    const current = getLowest(openSet, fScore);

    if (current === goalNodeID) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(current);
  
    let currentNode = road.findNode(current)
    const outGoingSegs = currentNode.outgoingSegmentIDs
    let neighboursSet = new Set()
    for(let outseg of outGoingSegs){
      let seg = road.findSegment(outseg)
      neighboursSet.add(seg.toNodeID)
    }
    let neighbours = [...neighboursSet]
    for (const neighbor of neighbours) {
      const tentativeG = (gScore.get(current) ?? Infinity) + h(current, neighbor, road);

      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + h(neighbor, goalNodeID, road));

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }
  }
  return undefined; // no hay camino
}

function h(startNodeID, goalNodeID, road) {
  const start = road.findNode(startNodeID);
  const goal = road.findNode(goalNodeID);
  return dist(start.pos.x, start.pos.y, goal.pos.x, goal.pos.y);
}


