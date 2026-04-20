/** Resumen:
 * A road consists of nodes and segments connecting them.
 * The nodes and segments form a directed graph.
 * The paths are a way to group segments between two nodes, they do not affect the graph structure.
 * Paths modify the segments adding position for lanes and direction
 * Segments are separated by intersections on nodes. These intersections contain Connectors that tell the incomming segment what other 
 * intersection-segments there are to choose. 
 * Intersections are just a data structure to group intersections (they contain the nodeID, the connectors and the intersection-segments)
 * setPaths() recoomputes everything, so the convex hull calculations are relegated to the convexHullQueue that processes them one by one
 * Now convex hulls are not calculated anymore, they were too slow and ugly
 */

// It is extremely important to separate segments (array segments) from the intersection segments (array intersecSegs)
// because they have different ID pools

const NODE_RAD = 25
const GRID_CELL_SIZE = 40   //15

let OFFSET_RAD_INTERSEC = 25      //25 (intersec_rad)
let LENGTH_SEG_BEZIER = 12         //3
let LENGTH_SEG_BEZIER_INTER = LENGTH_SEG_BEZIER
let TENSION_BEZIER_MIN = 0.1
let TENSION_BEZIER_MAX = 0.75
let MIN_DIST_INTERSEC = 0        //30
let LANE_WIDTH = 30
let BIG_LANE_WIDTH = LANE_WIDTH * 1.6


const MIN_ANGLE_DEG = 20         // pairs closer to parallel than this are skipped
const MAX_REASONABLE_TRIM = 200  // intersections farther than this from the node are garbage


class Road{
    constructor(tool){
        this.tool = tool

        this.segments = new Map()
        this.nodes = new Map()

        this.connectors = [] 
        this.intersecSegs = new Map()
        this.intersections = []
        this.paths = new Map()

        //not used anymore
        this.convexHullQueue = new Set()

        this.nodeIDcounter = getNextID()
        this.segmentIDcounter = getNextID()

        this.connectorIDcounter = getNextID()
        this.intersecSegIDcounter = getNextID()
    }


    //recomputes all paths, connectors, intersections and intersection-segments, used for loading a road stored in local storage
    setPaths() {
        let activenessMap = new Map()

        for (let intersection of this.intersections) {
            activenessMap.set(intersection.id, intersection.getActivenessMap())
        }

        this.paths = new Map()
        this.connectors = []
        this.intersecSegs = new Map()
        this.intersections = []
        this.connectorIDcounter = 0
        this.intersecSegIDcounter = 0

        let tempPathMap = new Map()

        for (let s of this.segments.values()) {
            const a = s.fromNodeID
            const b = s.toNodeID

            if (!tempPathMap.has(a)) tempPathMap.set(a, new Map())
            if (!tempPathMap.has(b)) tempPathMap.set(b, new Map())

            if (!tempPathMap.get(a).has(b)) tempPathMap.get(a).set(b, [])
            if (!tempPathMap.get(b).has(a)) tempPathMap.get(b).set(a, [])

            tempPathMap.get(a).get(b).push(s)
            tempPathMap.get(b).get(a).push(s)
        }

        const paths = this.paths
        const tempMap = tempPathMap
        const nodeArray = Array.from(this.nodes.values())

        for (let i = 0; i < nodeArray.length; i++) {
            const nodeA = nodeArray[i]
            const mapA = tempMap.get(nodeA.id)
            if (!mapA) continue

            for (let j = i + 1; j < nodeArray.length; j++) {
                const nodeB = nodeArray[j]

                const mapAB = mapA.get(nodeB.id)
                if (!mapAB) continue

                const segmentIDs = mapAB.map(s => s.id)
                if (segmentIDs.length === 0) continue

                const keyAB = nodeA.id + '-' + nodeB.id
                const keyBA = nodeB.id + '-' + nodeA.id

                let path = paths.get(keyAB) || paths.get(keyBA)

                if (path) {
                    const set = path.segmentsIDs
                    for (let k = 0; k < segmentIDs.length; k++) {
                        set.add(segmentIDs[k])
                    }
                } else {
                    const segmentSet = new Set(segmentIDs)

                    path = new Path(nodeA.id, nodeB.id, segmentSet)
                    path.road = this
                    path.constructRealLanes()
                    path.setSegmentsIDs(segmentSet)

                    paths.set(keyAB, path)
                }
            }
        }

        this.nodes.forEach((n) =>
            this.trimSegmentsAtIntersection({
                nodeID: n.id,
                activenessMap: activenessMap.get(n.id),
                connect: true,
                instantConvex: true
            })
        )
    }

    //connect a node to another node
    //the current way to modify the road in the fly when wanting to connect two nodes
    //nodesIDs is an array of two node IDs
    updateRoad(nodesIDs, usePath = undefined, trim = true, straightMode = false){
        let segmentIDs = new Set(this.getAllSegmentsBetweenNodes(nodesIDs[0], nodesIDs[1]).map(s => s.id))
        let newPath 
        if(usePath) newPath = usePath
        else{
            newPath = this.findPathByNodes(nodesIDs[0], nodesIDs[1])
            if(!newPath) {
                newPath = new Path(nodesIDs[0], nodesIDs[1], segmentIDs)
                newPath.road = this
                this.paths.set(nodesIDs[0] + '-' + nodesIDs[1], newPath)
            }
            else newPath.setSegmentsIDs(segmentIDs)
        }

        if(newPath.segmentsIDs.size == 0){
            this.paths.delete(nodesIDs[0] + '-' + nodesIDs[1])
            this.paths.delete(nodesIDs[1] + '-' + nodesIDs[0])
        }
        
        newPath.constructRealLanes()

        let activenessMap = new Map()
        let activenessMaps = []

        for(let nodeID of nodesIDs){
            let node = this.findNode(nodeID)
            if(!node) continue
            let intersection = this.findIntersection(nodeID)
            if(intersection){
                activenessMaps.push(intersection.getActivenessMap())
                const connectorIDsSet = new Set(intersection.connectorsIDs)
                const intersecSegsIDsSet = new Set(intersection.intersecSegsIDs)
                this.connectors = this.connectors.filter(c => !connectorIDsSet.has(c.id))
                this.intersecSegs = new Map(
                    Array.from(this.intersecSegs.entries())
                        .filter(([key, is]) => !intersecSegsIDsSet.has(is.id))
                );
                this.intersections = this.intersections.filter(i => i.nodeID != nodeID)
            }
        }

        for(let map of activenessMaps){
            for(let [key, value] of map.entries()){
                activenessMap.set(key, value)
            }
        }

        if(trim) {
            for(let nodeID of nodesIDs){
                let options = {
                    nodeID: nodeID,
                    activenessMap: activenessMap,
                    connect: true,
                    straightMode: straightMode,
                    instantConvex: true
                }
                if(this.nodeConnected(this.findNode(nodeID))) {
                    this.trimSegmentsAtIntersection(options)
                }
            }
        }
    }

    //updates paths connected to a node that has been moved
    updateNode(nodeID){
        // update all paths connected to this node
        let connectedPaths = this.getAllPathsConnectedToNode(nodeID)
        let connectedNodes = new Set()
        connectedPaths.forEach(path => {
            if(path.nodeA != nodeID) connectedNodes.add(path.nodeA)
            if(path.nodeB != nodeID) connectedNodes.add(path.nodeB)
        })

        let arr = [...connectedNodes]
        for(let n of arr){
            let path = this.findPathByNodes(n, nodeID)
            this.updateRoad([nodeID, n], path, true, false)
        }
    }

    // the edges of segments are the positions of the nodes
    findClosestSegmentAndPos(x, y){
        let pos = {x, y}
        let closestSegment = undefined
        let closestPoint = undefined
        let closestPointMain = undefined
        let minDist = Infinity

        this.segments.forEach((s, key) => {
            let fromPos = s.fromPos
            let toPos = s.toPos
            if(!fromPos || !toPos) return
            let posFromNode = s.fromNode ? s.fromNode.pos : this.findNode(s.fromNodeID).pos
            //let posToNode = s.toNode ? s.toNode.pos : this.findNode(s.toNodeID).pos
            if(!inBoundsCorners(fromPos.x, fromPos.y, GLOBAL_EDGES, NODE_RAD) && !inBoundsCorners(toPos.x, toPos.y, GLOBAL_EDGES, NODE_RAD)){
                //continue
            }
            else{
                let ap = {x: pos.x - fromPos.x, y: pos.y - fromPos.y}
                let ab = {x: toPos.x - fromPos.x, y: toPos.y - fromPos.y}
                let ab2 = ab.x * ab.x + ab.y * ab.y
                let ap_ab = ap.x * ab.x + ap.y * ab.y
                let t = constrainn(ap_ab / ab2, 0, 1)
                let point = {x: fromPos.x + ab.x * t, y: fromPos.y + ab.y * t}
                let d = dist(pos.x, pos.y, point.x, point.y)
                if(d < minDist){
                    minDist = d
                    closestSegment = s
                    closestPoint = point
                    closestPointMain = {
                        x: posFromNode.x + (point.x - fromPos.x),
                        y: posFromNode.y + (point.y - fromPos.y)
                    }
                }
            }
        })

        return {closestSegment, closestPoint, minDist, closestPointMain}
    }


    findClosestPosToSegmentBetweenNodes(x, y){
        let pos = {x, y}
        let closestSegment = undefined
        let closestPoint = undefined
        let minDist = Infinity

        this.segments.forEach((s, key) => {
            let fromPos = s.fromNode ? s.fromNode.pos : (s.fromNodeID != undefined ? this.findNode(s.fromNodeID).pos : null)
            let toPos = s.toNode ? s.toNode.pos : (s.toNodeID != undefined ? this.findNode(s.toNodeID).pos : null)
            if(!fromPos || !toPos) return
            let ap = {x: pos.x - fromPos.x, y: pos.y - fromPos.y}
            let ab = {x: toPos.x - fromPos.x, y: toPos.y - fromPos.y}
            let ab2 = ab.x * ab.x + ab.y * ab.y
            let ap_ab = ap.x * ab.x + ap.y * ab.y
            let t = constrainn(ap_ab / ab2, 0, 1)
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

    findAllNodesInArea(corner1, corner2){
        let c1 = corner1.y < corner2.y ? corner1 : corner2
        let c2 = corner1.y < corner2.y ? corner2 : corner1
        let nodesInArea = []
        this.nodes.forEach((node, key) => {
            if(inBoundsCorners(node.pos.x, node.pos.y, GLOBAL_EDGES, NODE_RAD) && 
            node.pos.x > c1.x && node.pos.x < c2.x && 
            node.pos.y > c1.y && node.pos.y < c2.y){
                nodesInArea.push(node)
            }
        })
        return nodesInArea
    }

    getAllSegmentsBetweenNodes(nodeID1, nodeID2){
        // let path = this.findPathByNodes(nodeID1, nodeID2)
        // if(path) return [...path.segments]
        let fromTo = this.getAllSegmentsBetweenNodesExclusively(nodeID1, nodeID2)
        let toFrom = this.getAllSegmentsBetweenNodesExclusively(nodeID2, nodeID1)
        return [...fromTo, ...toFrom]
    }

    getAllSegmentsBetweenNodesExclusively(nodeID1, nodeID2){
        // let path = this.findPathByNodes(nodeID1, nodeID2)
        // if(path) return [...path.segments].filter(s => s.fromNodeID == nodeID1)
        return Array.from(this.segments.values())
            .filter(s => s.fromNodeID == nodeID1 && s.toNodeID == nodeID2);
    }

    getAllPathsConnectedToNode(nodeID){
        // this.paths is a map
        let connectedPaths = []
        this.paths.forEach(path => {
            if(path.nodeA == nodeID || path.nodeB == nodeID){
                connectedPaths.push(path)
            }
        })
        return connectedPaths
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

        for(let nodeID of affectedNodeIDs){
            let node = this.findNode(nodeID)
            if(!node) continue
            let intersection = this.findIntersection(nodeID)
            if(intersection){
                this.connectors = this.connectors.filter(c => !intersection.connectorsIDs.includes(c.id))
                for (const id of intersection.intersecSegsIDs) {
                    this.intersecSegs.delete(id);
                }
                this.intersections = this.intersections.filter(i => i.nodeID != nodeID)
            }
        }
        this.deletePath(nodeID)

        this.nodes.delete(nodeID)

        for(let nodeID of affectedNodeIDs){
            let node = this.findNode(nodeID)
            if(!node) continue
            this.trimSegmentsAtIntersection({nodeID: nodeID, connect: true, instantConvex: true})
        }

    }

    deletePath(nodeID){
        let pathsToDelete = []
        this.paths.forEach((path, key) => {
            if(path.nodeA == nodeID || path.nodeB == nodeID){
                pathsToDelete.push(key)
            }
        })
        pathsToDelete.reverse().forEach(key => this.paths.delete(key))
    }

    deletePathExact(nodeAID, nodeBID){
        this.paths.forEach((path, key) => {
            if((path.nodeA == nodeAID && path.nodeB == nodeBID) || (path.nodeA == nodeBID && path.nodeB == nodeAID)){
                this.paths.delete(key)
            }
        })
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
        this.segments.delete(segmentID)
        fromNode.outgoingSegmentIDs = fromNode.outgoingSegmentIDs.filter(id => id != segmentID)
        toNode.incomingSegmentIDs = toNode.incomingSegmentIDs.filter(id => id != segmentID)
        fromNode.outgoingSegments = fromNode.outgoingSegments.filter(s => s.id != segmentID)
        toNode.incomingSegments = toNode.incomingSegments.filter(s => s.id != segmentID)

        this.checkAndDeletePath(fromNode.id, toNode.id)

        this.updateRoad([fromNode.id, toNode.id])

    }

    checkAndDeletePath(nodeAID, nodeBID){
        let path = this.findPathByNodes(nodeAID, nodeBID)
        if(path && path.segmentsIDs.size == 0){
            this.paths.delete(nodeAID + '-' + nodeBID)
        }
    }

    deleteSegmentNoUpdate(segmentID){
        let segment = this.findSegment(segmentID)
        if(segment == undefined){
            console.log('Error deleting segment, segment not found:\nsegmentID = ' + segmentID)
            return
        }
        let fromNode = this.findNode(segment.fromNodeID)
        let toNode = this.findNode(segment.toNodeID)
        this.segments.delete(segmentID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error deleting segment, node not found:\nfromNodeID = ' + segment.fromNodeID + ' | toNodeID = ' + segment.toNodeID)
            return
        }
        //remove the segment without triggering updates

        fromNode.outgoingSegmentIDs = fromNode.outgoingSegmentIDs.filter(id => id != segmentID)
        toNode.incomingSegmentIDs = toNode.incomingSegmentIDs.filter(id => id != segmentID)
        fromNode.outgoingSegments = fromNode.outgoingSegments.filter(s => s.id != segmentID)
        toNode.incomingSegments = toNode.incomingSegments.filter(s => s.id != segmentID)
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
        let newNode = nodeAtSplit ? nodeAtSplit : this.addNodeNoUpdate(x, y)

        this.deleteSegmentNoUpdate(segmentID)
        this.deletePathExact(fromNode.id, toNode.id)

        let segment1 = this.addSegment(fromNode.id, newNode.id, visualDir, false)
        let segment2 = this.addSegment(newNode.id, toNode.id, visualDir, false)

        let path1 = this.findPathByNodes(fromNode.id, newNode.id)
        let path2 = this.findPathByNodes(newNode.id, toNode.id)
        if(!path1){
            path1 = new Path(fromNode.id, newNode.id, new Set([segment1.id]))
            path1.road = this
            this.paths.set(fromNode.id + '-' + newNode.id, path1)
        }
        else path1.segmentsIDs.add(segment1.id)
        if(!path2){
            path2 = new Path(newNode.id, toNode.id, new Set([segment2.id]))
            path2.road = this
            this.paths.set(newNode.id + '-' + toNode.id, path2)
        }
        else path2.segmentsIDs.add(segment2.id)
        path1.constructRealLanes()
        path2.constructRealLanes()

        this.updateRoad([fromNode.id, newNode.id])
        this.updateRoad([newNode.id, toNode.id])


        return {segment1, segment2, newNode}
    }

    findNode(id){
        return this.nodes.get(id)
    }

    findSegment(id){
        return this.segments.get(id)
    }

    findConnector(id){
        return this.connectors.find(c => c.id == id)
    }

    findIntersecSeg(id){
        return this.intersecSegs.get(id)
    }

    findIntersection(id){
        return this.intersections.find(i => i.nodeID == id)
    }

    findIntersecSegByFromToConnectorIDs(fromConnectorID, toConnectorID){
        return Array.from(this.intersecSegs.values()).find(c => c.fromConnectorID == fromConnectorID && c.toConnectorID == toConnectorID)
    }

    findSegByFromToConnectorsIDs(fromConnectorID, toConnectorID){
        return Array.from(this.segments.values()).find(s => s.fromConnectorID == fromConnectorID && s.toConnectorID == toConnectorID)
    }

    findSegOrIntersegBetween2Conns(fromConnectorID, toConnectorID){
        return this.findIntersecSegByFromToConnectorIDs(fromConnectorID, toConnectorID) ||
               this.findSegByFromToConnectorsIDs(fromConnectorID, toConnectorID)
    }

    findConnectorBySegmentID(segmentID, type){
        if(type == 'incoming'){
            return this.connectors.find(c => c.incomingSegmentIDs.includes(segmentID))
        } 
        else if(type == 'outgoing'){
            return this.connectors.find(c => c.outgoingSegmentIDs.includes(segmentID))
        }
    }

    findPathByNodes(nodeAID, nodeBID){
        return this.paths.get(nodeAID + '-' + nodeBID) || this.paths.get(nodeBID + '-' + nodeAID)
    }

    findAnyPath(nodeID){
        let paths = new Set()
        let pathsVisited = new Set()
        let node = this.findNode(nodeID)
        let segsOfNode = [...node.incomingSegments, ...node.outgoingSegments]
        segsOfNode.forEach(s => {
            if(pathsVisited.has(s.fromNodeID + '-' + s.toNodeID) || pathsVisited.has(s.toNodeID + '-' + s.fromNodeID)) return
            let path = this.findPathByNodes(s.fromNodeID, s.toNodeID)
            pathsVisited.add(s.fromNodeID + '-' + s.toNodeID)
            pathsVisited.add(s.toNodeID + '-' + s.fromNodeID)
            if(path) paths.add(path)
        })
        return paths.size > 0 ? Array.from(paths) : undefined
    }

    findPath(pathID){
        return this.paths.get(pathID)
    }

    addNode(x, y){
        const newNode = new Node(this.nodeIDcounter, x, y)
        this.nodes.set(newNode.id, newNode)
        newNode.road = this
        this.updateNodeIDcounter()
        return newNode
    }

    addNodeNoUpdate(x, y){
        const newNode = new Node(this.nodeIDcounter, x, y)
        this.nodes.set(newNode.id, newNode)
        newNode.road = this
        this.updateNodeIDcounter()
        return newNode
    }

    updateNodeIDcounter(){
        this.prevNodeIDcounter = this.nodeIDcounter
        this.nodeIDcounter = getNextID(this.nodeIDcounter)
    }

    findHoverNode(x, y){
        return Array.from(this.nodes.values()).find(n => n.hover(x, y))
    }

    findHoverConnector(x, y){
        return this.connectors.find(c => c.hover(x, y))
    }

    addSegment(fromNodeID, toNodeID, visualDir, updateR = true, straightMode = false){
        const fromNode = this.findNode(fromNodeID)
        const toNode = this.findNode(toNodeID)
        if(fromNode == undefined || toNode == undefined){
            console.log('Error adding segment, node not found:\nfromNodeID = ' + fromNodeID + ' | toNodeID = ' + toNodeID)
            return
        }
        let newSegment = new Segment(this.segmentIDcounter, fromNodeID, toNodeID, visualDir)
        newSegment.road = this
        newSegment.fromNode = fromNode  // Set direct object reference
        newSegment.toNode = toNode      // Set direct object reference
        this.segments.set(newSegment.id, newSegment)
        fromNode.outgoingSegmentIDs.push(newSegment.id)
        toNode.incomingSegmentIDs.push(newSegment.id)
        fromNode.outgoingSegments.push(newSegment)  // Add direct object reference
        toNode.incomingSegments.push(newSegment)    // Add direct object reference
        this.segmentIDcounter = getNextID(this.segmentIDcounter)

        if(updateR) this.updateRoad([fromNodeID, toNodeID], undefined, true, straightMode)

        return newSegment
    }

    nodeConnected(node){
        //returns true if the node has at least one connected NODE
        let connectedNodes = new Set()
        let connectedSegments = this.findConnectedSegments(node.id)
        connectedSegments.forEach(s => {
            if(s.fromNodeID != node.id) connectedNodes.add(s.fromNodeID)
            if(s.toNodeID != node.id) connectedNodes.add(s.toNodeID)
        })
        return connectedNodes.size > 0
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
        let node = this.findNode(nodeID)
        return node ? [...node.incomingSegments, ...node.outgoingSegments] : []
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

    // not in use
    findIntersectionsOfNode(nodeID){
        const connectedSegments = this.findConnectedSegments(nodeID);
        const intersections = [];
        const seen = new Set(); 

        connectedSegments.forEach(s1 => {
            connectedSegments.forEach(s2 => {
                if (s1.id == s2.id) return;

                let intersection = lineIntersection(
                    s1.originalFromPos, s1.originalToPos,
                    s2.originalFromPos, s2.originalToPos, false
                );

                if (intersection == undefined){
                    if (s1.originalFromPos.x == s2.originalFromPos.x && s1.originalFromPos.y == s2.originalFromPos.y) intersection = s1.originalFromPos;
                    else if (s1.originalFromPos.x == s2.originalToPos.x && s1.originalFromPos.y == s2.originalToPos.y) intersection = s1.originalFromPos;
                    else if (s1.originalToPos.x == s2.originalFromPos.x && s1.originalToPos.y == s2.originalFromPos.y) intersection = s1.originalToPos;
                    else if (s1.originalToPos.x == s2.originalToPos.x && s1.originalToPos.y == s2.originalToPos.y) intersection = s1.originalToPos;
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

    // for each path connected to the node, finds the farthest intersection from the node, taking into account also the edges of the sidewalks (corners)
    findIntersectionsOfNodev2(nodeID, straightMode = false){
        let paths = this.findAnyPath(nodeID)
        if(!paths) return null
        let finalIntersections = new Map()

        

        const segmentAngleDeg = (seg) => {
            return Math.atan2(
                seg.originalToPos.y - seg.originalFromPos.y,
                seg.originalToPos.x - seg.originalFromPos.x
            ) * 180 / Math.PI
        }

        const angleBetween = (a1, a2) => {
            // smallest angle between two undirected lines, in [0, 90]
            let diff = Math.abs(((a1 - a2) + 540) % 360 - 180)
            if (diff > 90) diff = 180 - diff
            return diff
        }

        for(let path of paths){
            finalIntersections.set(path.id, [])
            for(let otherPath of paths){
                if(path == otherPath) continue
                let segments1 = [...path.segmentsIDs].map(id => this.findSegment(id))
                let segments2 = [...otherPath.segmentsIDs].map(id => this.findSegment(id))

                for(let s1 of segments1){
                    for(let s2 of segments2){
                        if(s1.id == s2.id) continue

                        if(straightMode){
                            let pathInSeg = this.findPathByNodes(s1.fromNodeID, s1.toNodeID)
                            let pathOutSeg = this.findPathByNodes(s2.fromNodeID, s2.toNodeID)
                            let indexInPathofInSeg = [...pathInSeg.segmentsIDs].indexOf(s1.id)
                            let indexInPathofOutSeg = [...pathOutSeg.segmentsIDs].indexOf(s2.id)
                            if(pathInSeg == pathOutSeg) continue
                            if(indexInPathofInSeg != indexInPathofOutSeg) continue
                        }

                        // reject near-parallel pairs — they produce garbage intersection points
                        let a1 = segmentAngleDeg(s1)
                        let a2 = segmentAngleDeg(s2)
                        if(angleBetween(a1, a2) < MIN_ANGLE_DEG) continue

                        let intersection = lineIntersection(
                            s1.originalFromPos, s1.originalToPos,
                            s2.originalFromPos, s2.originalToPos, true
                        );

                        if(intersection != undefined){
                            let node = this.findNode(nodeID)
                            let dMain = dist(node.pos.x, node.pos.y, intersection.x, intersection.y)
                            if(dMain <= MAX_REASONABLE_TRIM){
                                finalIntersections.get(path.id).push(intersection)
                            }

                            // outer (corner) intersections get the same sanity check
                            let outerIntersections = this.getOuterIntersections(s1, s2)
                            for(let outer of outerIntersections){
                                let dOuter = dist(node.pos.x, node.pos.y, outer.x, outer.y)
                                if(dOuter <= MAX_REASONABLE_TRIM){
                                    finalIntersections.get(path.id).push(outer)
                                }
                            }
                        }
                    }
                }
            }
        }

        // for each path, keep the farthest intersection from the node
        for(let [pathID, inters] of finalIntersections){
            let distInter = 0
            let farthestIntersection = null
            let node = this.findNode(nodeID)
            if(inters.length == 0) continue
            else if(inters.length == 1){
                farthestIntersection = inters[0]
                distInter = dist(node.pos.x, node.pos.y, farthestIntersection.x, farthestIntersection.y)
            }
            else {
                for(let inter of inters){
                    let d = dist(node.pos.x, node.pos.y, inter.x, inter.y)
                    if(d > distInter){
                        distInter = d
                        farthestIntersection = inter
                    }
                }
            }
            finalIntersections.set(pathID, distInter)
        }
        return finalIntersections
    }

    // trims all end of segments connected to the node to the farthest intersection found
    // the visual bug where the road is engulfed in both intersections is fixed.
    // what we do now is check if the other side of the road has enough space to also trim, 
    // if not we trim proportionally so both sides fit, and if there is no space at all we dont trim
    trimSegmentsAtIntersection(options){
        let {nodeID, connect = true, instantConvex = true, straightMode = false, activenessMap = new Map()} = options

        let distances = this.findIntersectionsOfNodev2(nodeID, straightMode)
        if(!distances) return

        let node = this.findNode(nodeID)
        let connectedSegments = this.findConnectedSegments(nodeID)

        const adjust = d => {
            if(straightMode) return d
            return Math.max(d + OFFSET_RAD_INTERSEC, MIN_DIST_INTERSEC)
        }
        const MIN_GAP = 1

        connectedSegments.forEach(s => {
            if(s.originalFromPos && s.originalToPos){
                let pathOfSeg = this.findPathByNodes(s.fromNodeID, s.toNodeID)
                if(!pathOfSeg) return

                let dHere = distances.get(pathOfSeg.id)
                if(dHere == undefined) return

                // desired trim at the OTHER end of this segment
                let otherNodeID = (s.fromNodeID === nodeID) ? s.toNodeID : s.fromNodeID
                let otherDistances = this.findIntersectionsOfNodev2(otherNodeID, straightMode)
                let dOther = otherDistances ? (otherDistances.get(pathOfSeg.id) ?? 0) : 0

                dHere  = adjust(dHere)
                dOther = adjust(dOther)

                // use ORIGINAL length so repeated trims don't drift
                let origLen = dist(
                    s.originalFromPos.x, s.originalFromPos.y,
                    s.originalToPos.x,   s.originalToPos.y
                )
                let available = origLen - MIN_GAP

                if(available <= 0){
                    // segment too short to trim at all
                    dHere = 0
                } else if(dHere + dOther > available){
                    // proportional scale so both ends fit
                    let k = available / (dHere + dOther)
                    dHere  *= k
                    dOther *= k
                }

                let distInter = dHere

                let origFrom = {...s.originalFromPos}
                let origTo   = {...s.originalToPos}

                if(s.fromNodeID == nodeID){
                    s.fromPos = shortenSegment(origTo, origFrom, distInter)
                }
                else if(s.toNodeID == nodeID){
                    s.toPos = shortenSegment(origFrom, origTo, distInter)
                }
            }
            s.createArrows()
            s.constructCorners()
        })

        if(connect){ 
            let once = this.nodeOnceConnected(node)
            this.connectIntersection(nodeID, once, instantConvex, straightMode, activenessMap)
        }
    }

    // straightMode: only connect segments that go straight through the intersection
    // connectSelf: if true, allows connecting segments that go from and to the same node (U-turns)
    connectIntersection(nodeID, connectSelf = false, instantConvex = true, straightMode = false, activenessMap = new Map()){
        let node = this.findNode(nodeID)
        let intersection = new Intersection(nodeID, [], [])
        intersection.road = this
        if(!node) return
        // if a segment ends in this node, we have to connect it to every other segment that starts in this node
        // also, if a segment starts in this node, we have to connect it to every other segment that ends in this node
        let incoming = node.incomingSegments.length > 0 ? node.incomingSegments : node.incomingSegmentIDs.map(id => this.findSegment(id))
        let outgoing = node.outgoingSegments.length > 0 ? node.outgoingSegments : node.outgoingSegmentIDs.map(id => this.findSegment(id)) 

        let connectorMap = new Map()
        let intersecSegs = []

        incoming.forEach(inSeg => {
            outgoing.forEach(outSeg => {
                //avoid creating a connector between two segments that are already connected
                if(inSeg.fromNodeID == outSeg.toNodeID && !connectSelf){ 
                    return
                }
                if(straightMode){
                    let pathInSeg = this.findPathByNodes(inSeg.fromNodeID, inSeg.toNodeID)
                    let pathOutSeg = this.findPathByNodes(outSeg.fromNodeID, outSeg.toNodeID)
                    let indexInPathofInSeg = [...pathInSeg.segmentsIDs].indexOf(inSeg.id)
                    let indexInPathofOutSeg = [...pathOutSeg.segmentsIDs].indexOf(outSeg.id)
                    if(pathInSeg == pathOutSeg) return
                    if(indexInPathofInSeg != indexInPathofOutSeg) return
                }
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
                    connector1.type = 'enter'
                    connector1.incomingSegments = [inSeg]  // Populate direct reference immediately
                    this.connectors.push(connector1)
                    this.connectorIDcounter = getNextID(this.connectorIDcounter)
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
                    connector2.type = 'exit'
                    connector2.outgoingSegments = [outSeg]  // Populate direct reference immediately (this will be an intersegment later)
                    this.connectors.push(connector2)
                    this.connectorIDcounter = getNextID(this.connectorIDcounter)
                    connectorMap.set(outSeg.id, connector2)
                }
                else{
                    connector2 = conn2aux
                    //connector2.incomingSegmentIDs.push(inSeg.id)
                }
                

                let tension = TENSION_BEZIER_MAX
                let d = dist(inSegFromPos.x, inSegFromPos.y, outSegToPos.x, outSegToPos.y)
                let length = d * LANE_WIDTH * 0.02

                // let LENGTH_CONTROL_POINT = dist(inSegToPos.x, inSegToPos.y, outSegFromPos.x, outSegFromPos.y) * .1
                // let tension = LENGTH_CONTROL_POINT / 300

                let controlPointBez1
                let dir1 = inSeg.dir
                controlPointBez1 = {x: inSegFromPos.x + Math.cos(dir1) * length, 
                                    y: inSegFromPos.y + Math.sin(dir1) * length}

                let controlPointBez2
                let dir2 = outSeg.dir + PI
                controlPointBez2 = {x: outSegToPos.x + Math.cos(dir2) * length, 
                                    y: outSegToPos.y + Math.sin(dir2) * length}

                let pointsBezier = bezierPoints(controlPointBez1, inSegFromPos, outSegToPos, controlPointBez2, LENGTH_SEG_BEZIER, tension)

                let totalLen = pointsBezier.length * LENGTH_SEG_BEZIER
                // let totalLen = 0
                // for(let i = 1; i < pointsBezier.length; i++){
                //     totalLen += dist(pointsBezier[i].x, pointsBezier[i].y, pointsBezier[i-1].x, pointsBezier[i-1].y)
                // }

                let seg = new InterSegment(this.intersecSegIDcounter, connector1.id, connector2.id, inSeg.visualDir, pointsBezier)
                seg.road = this
                seg.fromPos = inSegFromPos
                seg.toPos = outSegToPos
                seg.len = totalLen
                seg.fromConnector = connector1  // Set direct object reference
                seg.toConnector = connector2    // Set direct object reference
                seg.fromtoKey = connector1.id + '_' + connector2.id
                this.intersecSegs.set(seg.id, seg)
                this.intersecSegIDcounter = getNextID(this.intersecSegIDcounter)

                let activenessKey = inSeg.id + '_' + outSeg.id
                if(activenessMap.has(activenessKey)){
                    seg.active = activenessMap.get(activenessKey)
                }

                // connector1.outgoingSegmentID = seg.id
                // connector2.incomingSegmentID = seg.id

                connector1.outgoingSegmentIDs.push(seg.id)
                connector2.incomingSegmentIDs.push(seg.id)
                connector1.outgoingSegments.push(seg)  // Add direct object reference
                connector2.incomingSegments.push(seg)  // Add direct object reference

                inSeg.toConnectorID = connector1.id
                outSeg.fromConnectorID = connector2.id
                inSeg.toConnector = connector1  // Set direct object reference
                outSeg.fromConnector = connector2  // Set direct object reference

                intersecSegs.push(seg.id)

                //intersection.calculateOutlinesIntersection() calls seg.constructOutline()
                //seg.constructOutline()
            })
        })

        // Create connectors for any incoming segment that was never paired (like cul-de-sac)
        for(const inSeg of incoming){
            if(!connectorMap.has(inSeg.id)){
                let connector = new Connector(inSeg.id, undefined, inSeg.toPos, this.connectorIDcounter)
                connector.road = this
                connector.type = 'enter'
                connector.incomingSegments = [inSeg]
                this.connectors.push(connector)
                this.connectorIDcounter = getNextID(this.connectorIDcounter)
                connectorMap.set(inSeg.id, connector)

                inSeg.toConnectorID = connector.id
                inSeg.toConnector = connector
            }
        }

        // Create connectors for any outgoing segment that was never paired (like cul-de-sac in the other direction)
        for(const outSeg of outgoing){
            if(!connectorMap.has(outSeg.id)){
                let connector = new Connector(undefined, outSeg.id, outSeg.fromPos, this.connectorIDcounter)
                connector.road = this
                connector.type = 'exit'
                connector.outgoingSegments = [outSeg]
                this.connectors.push(connector)
                this.connectorIDcounter = getNextID(this.connectorIDcounter)
                connectorMap.set(outSeg.id, connector)

                outSeg.fromConnectorID = connector.id
                outSeg.fromConnector = connector
            }
        }


        for(let c of connectorMap.values()) c.constructDirections()
        let connectorsArray = Array.from(connectorMap.values())
        intersection.connectorsIDs = connectorsArray.map(c => c.id)
        intersection.connectors = connectorsArray  // Set direct object references
        intersection.intersecSegsIDs = intersecSegs
        intersection.intersecSegs = intersecSegs.map(id => this.findIntersecSeg(id))  // Set direct object references

        // Optimized: directly get paths connected to this node instead of nested loop
        let anyPath = this.findAnyPath(nodeID)
        intersection.pathsIDs = anyPath?.map(p => p.id) || []
        intersection.paths = anyPath || []  // Set direct object references
        //intersection.debugOrder() not working
        intersection.calculateOutlinesIntersection();
        intersection.calculateInnerEdges();
        //if(instantConvex) intersection.calculateOutlinesIntersection();
        //else this.pushToConvexQueue(intersection)
        //this.pushToConvexQueue(intersection)
        this.intersections.push(intersection)
    }

    // pushToConvexQueue(intersection){
    //     if(!this.convexHullQueue) this.convexHullQueue = new Set()
    //     this.convexHullQueue.add(intersection.id)
    // }

    // returns intersections of the segments formed by connecting the corners of the two segments
    getOuterIntersections(s1, s2){
        let corners1 = getCornersOfLine(s1.originalFromPos, s1.originalToPos, BIG_LANE_WIDTH)
        let corners2 = getCornersOfLine(s2.originalFromPos, s2.originalToPos, BIG_LANE_WIDTH)
        let intersections = []
        for(let i = 0; i < corners1.length; i++){
            let nexti = (i + 1) % corners1.length
            for(let j = 0; j < corners2.length; j++){
                let nextj = (j + 1) % corners2.length
                let inter = lineIntersection(corners1[i], corners1[nexti], corners2[j], corners2[nextj])
                if(inter) intersections.push(inter)
            }
        }
        return intersections
    }

    //not used
    // updateConvexHullsIncremental() {
        
    //     //if(frameCount % 10 == 0) return false; // update every other frame for performance

    //     if(mouseIsPressed) return false; // pause while editing
        
    //     if (!this.convexHullQueue) {
    //         this.convexHullQueue = new Set(this.intersections.filter(i => !i.convexHullCalculated).map(i => i.id));
    //     }

    //     for (let i = 0; i < INTERSECTIONS_PER_FRAME && this.convexHullQueue.size > 0; i++) {
    //         const intersectionID = this.convexHullQueue.values().next().value;
    //         this.convexHullQueue.delete(intersectionID);
    //         const intersection = this.intersections.find(i => i.id === intersectionID);
    //         intersection.calculateOutlinesIntersection();
    //     }

    //     return this.convexHullQueue.size === 0
    // }

    showMain(SHOW_TAGS){
        //this.segments.forEach(s => s.showMain(SHOW_TAGS))
        push()
        stroke(230)
        strokeWeight(5)
        this.paths.forEach(s => s.showSimple())
        pop()
    }

    showPaths(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined){
        this.paths.forEach(p => p.showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID))
    }

    showConnectors(SHOW_TAGS){
        this.connectors.forEach(c => c.show(SHOW_TAGS))
    }

    showIntersecSegs(SHOW_TAGS){
        this.intersecSegs.forEach((s, key) => s.showBezier(SHOW_TAGS))
    }

    showIntersectionArea(){
        this.intersections.forEach(i => {i.drawOutlineDebug()})
    }

    showLanes(hoveredSegID = undefined){
        this.paths.forEach(p => p.showLanes(hoveredSegID))
        this.intersecSegs.forEach((s, key) => s.showLane())
    }

    showNodes(zoom){
        if(zoom > 0.18) this.nodes.forEach((n, key) => n.show(false, zoom))
    }

    showNodesTags(){
        this.nodes.forEach((n, key) => n.showTags())
    }

    // every function with  "type: showWays" as a comment must only be called from here, as this function sets the correct drawing modes for optimization purposes
    showWays(toolObj){
        let zoom = toolObj.zoom
        let hoveredID = toolObj.state.hoverSeg

        push()
        rectMode(CORNERS)
        fill(SIDE_WALK_COL)
        stroke(SIDE_WALK_COL)
        strokeWeight(1)
        if(zoom > 0.1) this.paths.forEach(p => p.showWayBase())
        pop()

        push()
        fill(SIDE_WALK_COL)
        stroke(SIDE_WALK_COL)
        strokeWeight(1)
        if(zoom > 0.1) this.intersections.forEach(p => p.showWayBase())
        pop()

        push()
        fill(ROAD_COL)
        stroke(ROAD_COL)
        strokeWeight(1)
        if(zoom > 0.05) this.intersections.forEach(p => p.showWayTop())
        stroke(MARKINGS_COL)
        strokeWeight(1.5)
        noFill()
        if(zoom > 0.18) this.intersections.forEach(p => p.showOuterEdges())
        if(zoom > 0.18) this.intersections.forEach(p => p.showInnerEdges())
        pop()
    
        push()
        rectMode(CORNERS)
        fill(ROAD_COL)
        stroke(ROAD_COL)
        strokeWeight(1)
        if(zoom > 0.05) this.paths.forEach(p => p.showWayTop(hoveredID))
        stroke(MARKINGS_COL)
        strokeWeight(WIDTH_YIELD_MARKING)
        strokeCap(SQUARE)
        if(zoom > 0.18) this.intersections.forEach(p => p.showYieldMarkings())
        strokeWeight(1.5)
        stroke(MARKINGS_COL)
        strokeCap(SQUARE)
        if(zoom > 0.18) this.paths.forEach(p => p.showEdges())
        stroke(ARROWS_COL)
        strokeWeight(1.5)
        fill(ARROWS_COL)
        if(zoom > 0.35){ 
            this.paths.forEach(p => p.showArrows())
            this.intersections.forEach(i => i.showDirectionsIntersection())
            strokeWeight(1.5)
            stroke(ROAD_COL)
            fill(SIDE_WALK_COL)
            textAlign(CENTER, CENTER)
            textSize(14)
            this.paths.forEach(p => p.showName())
        }
        if(zoom <= 0.05){
            push()
            stroke(230)
            strokeWeight(5)
            this.paths.forEach(s => s.showSimple())
            pop()
        }

        if(zoom > 0.18) {
            push()
            stroke(SIDE_WALK_COL)
            strokeWeight(2)
            noFill()
            strokeCap(ROUND)
            strokeWeight(2.5)
            //this.intersections.forEach(i => i.drawIntersectionAreaMarkings())
            pop()
        }
        pop()
    }
}




// the ids of any object are strings made of 94 characters
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{|}~!"#$%&\'()*+,./:;<=>?@[\\]^`';
const base = chars.length; // 94
function getNextID(id){
    if (id === undefined) return chars[0];

    let num = 0;
    for (let i = 0; i < id.length; i++) {
        num = num * base + chars.indexOf(id[i]);
    }
    num++;

    if (num === 0) return chars[0];
    let result = '';
    while (num > 0) {
        result = chars[num % base] + result;
        num = Math.floor(num / base);
    }
    return result;
}