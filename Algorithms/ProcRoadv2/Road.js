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

/**
    MEMORY OPTIMIZATIONS
 * Tests with AROUND_RADIUS of 7500 and from my home:
 * Before:                                                                      605 MB
 * After flattening corners and corners16 arrays in segments:                   580 MB
 * After flattening outline and outline16 arrays in intersections:              462 MB
 * After flattening bezierPoints array in intersection-segments:                447 MB
 * After removing object references array in connectors:                        424 MB
 * After removing IDs of paths arrays in intersections:                         421 MB
 * After removing IDs of connectors and intersecSegs arrays in intersections:   414 MB
 */

const NODE_RAD = 25
const NODE_RAD_SQ = NODE_RAD * NODE_RAD
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
const MAX_REASONABLE_TRIM_SQ = MAX_REASONABLE_TRIM * MAX_REASONABLE_TRIM

const MAX_ENTRIES_TREE = 200


class Road{
    constructor(tool){
        this.tool = tool

        this.segments = new Map()
        this.nodes = new Map()

        this.connectors = new Map()
        this.intersecSegs = new Map()
        this.intersections = new Map()
        this.paths = new Map()

        this.graphIndex = new GraphIndex()   //it stores two rtrees to store nodes and segments for spatial queries

        this.nodeIDcounter = getNextID()
        this.segmentIDcounter = getNextID()

        this.connectorIDcounter = getNextID()
        this.intersecSegIDcounter = getNextID()
    }


    //recomputes all paths, connectors, intersections and intersection-segments, used for loading a road stored in local storage
    setPaths() {
        let activenessMap = new Map()

        for (let intersection of this.intersections.values()) {
            activenessMap.set(intersection.id, intersection.getActivenessMap())
        }

        this.paths = new Map()
        this.connectors = new Map()
        this.intersecSegs = new Map()
        this.intersections = new Map()
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
                } 
                else {
                    const segmentSet = new Set(segmentIDs)

                    path = new Path(nodeA.id, nodeB.id, segmentSet)
                    path.road = this

                    segmentSet.forEach(segmentID => {
                        const segment = this.segments.get(segmentID)
                        if (segment) {
                            segment.path = path
                        }
                    })

                    this.constructLanesOfPath(path)
                    path.setSegmentsIDs(segmentSet)

                    paths.set(keyAB, path)
                }
            }
        }

        // this.nodes.forEach((n) =>
        //     this.trimSegmentsAtIntersection({
        //         nodeID: n.id,
        //         activenessMap: activenessMap.get(n.id),
        //         connect: true,
        //         instantConvex: true
        //     })
        // )
        // this.nodes.forEach((n) => {
        //     this.updateNode(n.id)
        // })
        for(let path of this.paths.values()){
            this.updateRoad([path.nodeA, path.nodeB], path)
        }

    }

    //connect a node to another node
    //the current way to modify the road in the fly when wanting to connect two nodes
    //nodesIDs is an array of two node IDs
    updateRoad(nodesIDs, usePath = undefined, trim = true, straightMode = false){
        let segmentIDs = usePath ? new Set(usePath.segmentsIDs) : new Set(this.getAllSegmentsBetweenNodes(nodesIDs[0], nodesIDs[1]).map(s => s.id))
        let newPath 
        if(usePath) newPath = usePath
        else{
            newPath = this.findPathByNodes(nodesIDs[0], nodesIDs[1])
            if(!newPath) {
                newPath = new Path(nodesIDs[0], nodesIDs[1], segmentIDs)
                for(let segmentID of segmentIDs){
                    let segment = this.findSegment(segmentID)
                    if(segment) segment.path = newPath
                }
                newPath.road = this
                this.paths.set(nodesIDs[0] + '-' + nodesIDs[1], newPath)
            }
            else {
                newPath.setSegmentsIDs(segmentIDs)
                for(let segmentID of segmentIDs){
                    let segment = this.findSegment(segmentID)
                    if(segment) segment.path = newPath
                }
            }
        }

        if(newPath.segmentsIDs.size == 0){
            this.paths.delete(nodesIDs[0] + '-' + nodesIDs[1])
            this.paths.delete(nodesIDs[1] + '-' + nodesIDs[0])
        }
        
        this.constructLanesOfPath(newPath)

        let activenessMap = new Map()
        let activenessMaps = []

        for(let nodeID of nodesIDs){
            let node = this.findNode(nodeID)
            if(!node) continue
            let intersection = this.findIntersection(nodeID)
            if(intersection){
                activenessMaps.push(intersection.getActivenessMap())
                const connectors = intersection.connectors
                const intersecSegs = new Set(intersection.intersecSegs)
                for (const conn of connectors) {
                    this.connectors.delete(conn.id);
                }
                for(const inter of intersecSegs) {
                    this.intersecSegs.delete(inter.id);
                }
                this.intersections.delete(nodeID)
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

    constructLanesOfPath(path){
        path.constructRealLanes()
        for(let segmentID of path.segmentsIDs){
            let segment = this.findSegment(segmentID)
            this.graphIndex.deleteEdge(segmentID)
            this.graphIndex.insertEdge({
                id: segmentID,
                x1: segment.fromPos.x,
                y1: segment.fromPos.y,
                x2: segment.toPos.x,
                y2: segment.toPos.y,
                width: LANE_WIDTH
            })
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


    findClosestSegmentAndPos(x, y, useNodePositions = false){
        let closestSegmentsGI = this.graphIndex.nearestEdges(x, y, 20)
        let closestSegments = closestSegmentsGI.map(e => this.findSegment(e.data.id)).filter(s => s != undefined)


        if(closestSegments.length === 0) return {
            closestSegment: undefined,
            closestPoint: undefined,
            minDist: Infinity,
            closestPointMain: undefined
        }

        let pos = {x, y}
        let closestSegment = undefined
        let closestPoint = undefined
        let closestPointMain = undefined
        let minDist = Infinity

        closestSegments.forEach((s) => {
            let fromPos, toPos
            if(useNodePositions){
                fromPos = s.fromNode ? s.fromNode.pos 
                    : (s.fromNodeID != undefined ? this.findNode(s.fromNodeID).pos : null)
                toPos = s.toNode ? s.toNode.pos 
                    : (s.toNodeID != undefined ? this.findNode(s.toNodeID).pos : null)
            } 
            else {
                fromPos = s.fromPos
                toPos = s.toPos
            }
            if(!fromPos || !toPos) return

            let posFromNode = s.fromNode ? s.fromNode.pos 
                : this.findNode(s.fromNodeID).pos

            let apx = pos.x - fromPos.x
            let apy = pos.y - fromPos.y
            let abx = toPos.x - fromPos.x
            let aby = toPos.y - fromPos.y
            let ab2 = abx * abx + aby * aby
            let ap_ab = apx * abx + apy * aby
            let t = constrainn(ap_ab / ab2, 0, 1)

            let point = {
                x: fromPos.x + abx * t,
                y: fromPos.y + aby * t
            }
            let d = squaredDistance(pos.x, pos.y, point.x, point.y)

            if(d < minDist){
                minDist = d
                closestSegment = s
                closestPoint = point
                closestPointMain = {
                    x: posFromNode.x + (point.x - fromPos.x),
                    y: posFromNode.y + (point.y - fromPos.y)
                }
            }
        })

        minDist = Math.sqrt(minDist)
        return {closestSegment, closestPoint, minDist, closestPointMain}
    }

    getAllSegmentsBetweenNodes(nodeID1, nodeID2){
        // let fromTo = this.getAllSegmentsBetweenNodesExclusively(nodeID1, nodeID2)
        // let toFrom = this.getAllSegmentsBetweenNodesExclusively(nodeID2, nodeID1)
        // return [...fromTo, ...toFrom]
        let node1 = this.findNode(nodeID1)
        let node2 = this.findNode(nodeID2)
        let allSegs = [...node1.outgoingSegments, ...node1.incomingSegments, ...node2.outgoingSegments, ...node2.incomingSegments]
        return allSegs.filter(s => (s.fromNodeID == nodeID1 && s.toNodeID == nodeID2) || (s.fromNodeID == nodeID2 && s.toNodeID == nodeID1))
    }

    getAllSegmentsBetweenNodesExclusively(nodeID1, nodeID2){
        return Array.from(this.segments.values())
            .filter(s => s.fromNodeID == nodeID1 && s.toNodeID == nodeID2);
    }

    getAllPathsConnectedToNode(nodeID){
        // this.paths is a map
        let connectedPaths = []
        this.paths.forEach((path, key) => {
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
                for (const conn of intersection.connectors) {
                    this.connectors.delete(conn.id);
                }
                for (const inter of intersection.intersecSegs) {
                    this.intersecSegs.delete(inter.id);
                }
                this.intersections.delete(nodeID)
            }
        }
        this.deletePathByNodeID(nodeID)

        this._deleteNode(nodeID)

        for(let nodeID of affectedNodeIDs){
            let node = this.findNode(nodeID)
            if(!node) continue
            this.trimSegmentsAtIntersection({nodeID: nodeID, connect: true, instantConvex: true})
        }

    }

    moveNodeTo(node, x, y){
        node.moveTo(x, y)
        this.graphIndex.deleteNode(node.id)
        this.graphIndex.insertNode({id: node.id, x, y, radius: NODE_RAD})
    }


    _deleteNode(nodeID){
        this.nodes.delete(nodeID)
        this.graphIndex.deleteNode(nodeID)
    }

    deletePathByNodeID(nodeID){
        let pathsToDelete = []
        this.paths.forEach((path, key) => {
            if(path.nodeA == nodeID || path.nodeB == nodeID){
                pathsToDelete.push(key)
            }
        })
        pathsToDelete.reverse().forEach(key => this.paths.delete(key))
    }

    deletePathExact(nodeAID, nodeBID){
        this.paths.delete(nodeAID + '-' + nodeBID)
        this.paths.delete(nodeBID + '-' + nodeAID)
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
        this._deleteSegment(segmentID)
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
        this._deleteSegment(segmentID)
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

    _deleteSegment(segmentID){
        this.segments.delete(segmentID)
        this.graphIndex.deleteEdge(segmentID)
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
        let newNode = nodeAtSplit ? nodeAtSplit : this.addNode(x, y)

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
        segment1.path = path1
        segment2.path = path2
        this.constructLanesOfPath(path1)
        this.constructLanesOfPath(path2)

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
        return this.connectors.get(id)
    }

    findIntersecSeg(id){
        return this.intersecSegs.get(id)
    }

    findIntersection(id){
        return this.intersections.get(id)
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

    findConnectorBySegmentID(segmentID, type) {
        for (const c of this.connectors.values()) {
            if (type === 'incoming') {
                if (c.incomingSegmentIDs.includes(segmentID)) return c;
            } else {
                if (c.outgoingSegmentIDs.includes(segmentID)) return c;
            }
        }
    }

    findPathByNodes(nodeAID, nodeBID){
        return this.paths.get(nodeAID + '-' + nodeBID) || this.paths.get(nodeBID + '-' + nodeAID)
    }

    //slow (it does not use the path reference in segments, but looks for segments between the nodes and then for paths of those segments), used for when we dont trust the path references in segments, like when loading a road from local storage
    findAnyPathSlow(nodeID){
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

    findAnyPath(nodeID) {
        const node = this.findNode(nodeID)
        const segs = [...node.incomingSegments, ...node.outgoingSegments]
        const paths = new Set(segs.map(s => s.path).filter(Boolean))
        return paths.size > 0 ? Array.from(paths) : this.findAnyPathSlow(nodeID)
    }

    findPath(pathID){
        return this.paths.get(pathID)
    }

    addNode(x, y){
        const newNode = new Node(this.nodeIDcounter, x, y)
        newNode.road = this
        this.setNode(newNode.id, newNode)
        this.updateNodeIDcounter()
        return newNode
    }

    setNode(id, node){
        this.nodes.set(id, node)
        this.graphIndex.insertNode({id: node.id, x: node.pos.x, y: node.pos.y, radius: NODE_RAD})
    }


    updateNodeIDcounter(){
        this.prevNodeIDcounter = this.nodeIDcounter
        this.nodeIDcounter = getNextID(this.nodeIDcounter)
    }

    findHoverNode(x, y){
        let candidates = this.graphIndex.searchPoint(x, y)
        if(!candidates || candidates.nodes.length == 0) return undefined
        let graphNode = candidates.nodes.find(c => {
            const node = this.findNode(c.id)
            return node && node.hover(x, y)
        })
        if(graphNode) return this.findNode(graphNode.id)
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

        let path = this.findPathByNodes(fromNodeID, toNodeID)
        if(!path){
            path = new Path(fromNodeID, toNodeID, new Set([newSegment.id]))
            path.road = this
            this.paths.set(fromNodeID + '-' + toNodeID, path)
        }
        else path.segmentsIDs.add(newSegment.id)

        newSegment.path = path  // Set direct object reference

        if(updateR) this.updateRoad([fromNodeID, toNodeID], path, true, straightMode)

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
            this.paths.forEach((p, key) => {
                if(p.segmentsIDs.has(s.id)) paths.add(p)
            })
        })
        return paths
    }

    findConnectedPaths(nodeID){
        let connectedSegments = this.findConnectedSegments(nodeID)
        return this.getPathsOfSegments(connectedSegments)
    }

    // 7500
    // unopt: 11.6
    // opt: 10.8
    // 10000
    // opt: 16.5

    // for each path connected to the node, finds the farthest intersection from the node, taking into account also the edges of the sidewalks (corners)
   findIntersectionsOfNodev2(nodeID, straightMode = false) {
        let paths = this.findAnyPath(nodeID)
        if (!paths) return null

        // ── hoist node lookup completely out of all loops ──────────────────────
        const node = this.findNode(nodeID)
        const finalIntersections = new Map()

        // ── pre-compute segments + angles per path, once ────────────────────────
        const pathData = paths.map(path => {
            const segments = [...path.segmentsIDs]
                .map(id => this.findSegment(id))
                .filter(Boolean)

            const angles = new Map(segments.map(s => [
                s.id,
                Math.atan2(
                    s.originalToPos.y - s.originalFromPos.y,
                    s.originalToPos.x - s.originalFromPos.x
                ) * 180 / Math.PI
            ]))

            return { path, segments, angles }
        })

        // ── straightMode: build a seg→{path, index} lookup table once ───────────
        // Replaces findPathByNodes + indexOf inside the O(n⁴) loop
        let segMeta = null
        if (straightMode) {
            segMeta = new Map()
            for (const { path, segments } of pathData) {
                segments.forEach((s, idx) => segMeta.set(s.id, { path, index: idx }))
            }
        }

        const angleBetween = (a1, a2) => {
            let diff = Math.abs(((a1 - a2) + 540) % 360 - 180)
            return diff > 90 ? 180 - diff : diff
        }

        const nx = node.pos.x, ny = node.pos.y  // avoid repeated property lookups

        for (let i = 0; i < pathData.length; i++) {
            const { path, segments: segs1, angles: ang1 } = pathData[i]
            finalIntersections.set(path.id, [])
            const bucket = finalIntersections.get(path.id)

            for (let j = 0; j < pathData.length; j++) {
                if (i === j) continue
                const { segments: segs2, angles: ang2 } = pathData[j]

                for (const s1 of segs1) {
                    const a1 = ang1.get(s1.id)

                    for (const s2 of segs2) {
                        if (s1.id === s2.id) continue

                        // straightMode: O(1) lookup instead of findPathByNodes + indexOf
                        if (straightMode) {
                            const m1 = segMeta.get(s1.id)
                            const m2 = segMeta.get(s2.id)
                            if (m1.path === m2.path || m1.index !== m2.index) continue
                        }

                        if (angleBetween(a1, ang2.get(s2.id)) < MIN_ANGLE_DEG) continue

                        const intersection = lineIntersection(
                            s1.originalFromPos, s1.originalToPos,
                            s2.originalFromPos, s2.originalToPos, true
                        )

                        if (intersection !== undefined) {
                            if (squaredDistance(nx, ny, intersection.x, intersection.y) <= MAX_REASONABLE_TRIM_SQ) {
                                bucket.push(intersection)
                            }

                            for (const outer of this.getOuterIntersections(s1, s2)) {
                                if (squaredDistance(nx, ny, outer.x, outer.y) <= MAX_REASONABLE_TRIM_SQ) {
                                    bucket.push(outer)
                                }
                            }
                        }
                    }
                }
            }
        }

        // ── keep farthest intersection per path ──────────────────────────────────
        for (const [pathID, inters] of finalIntersections) {
            if (inters.length === 0) continue

            let maxDSq = -1, farthest = null
            for (const inter of inters) {
                const d = squaredDistance(nx, ny, inter.x, inter.y)
                if (d > maxDSq) { maxDSq = d; farthest = inter }
            }
            finalIntersections.set(pathID, Math.sqrt(maxDSq))
        }

        return finalIntersections
    }

    // trims all end of segments connected to the node to the farthest intersection found
    // the visual bug where the road is engulfed in both intersections is fixed.
    // what we do now is check if the other side of the road has enough space to also trim, 
    // if not we trim proportionally so both sides fit, and if there is no space at all we dont trim
    trimSegmentsAtIntersection(options) {
        let { nodeID, connect = true, instantConvex = true, straightMode = false, activenessMap = new Map() } = options

        // ── compute THIS node's distances once ──────────────────────────────────
        let distances = this.findIntersectionsOfNodev2(nodeID, straightMode)
        if (!distances) return

        const node = this.findNode(nodeID)
        const connectedSegments = this.findConnectedSegments(nodeID)

        const adjust = d => straightMode ? d : Math.max(d + OFFSET_RAD_INTERSEC, MIN_DIST_INTERSEC)
        const MIN_GAP = 1

        // ── batch: collect unique other-node IDs before the loop ────────────────
        // Avoids calling findIntersectionsOfNodev2 (expensive!) once per segment;
        // instead we call it once per unique neighbour node.
        const otherNodeIDs = new Set(
            connectedSegments.map(s => s.fromNodeID === nodeID ? s.toNodeID : s.fromNodeID)
        )
        const otherDistancesCache = new Map()
        for (const otherID of otherNodeIDs) {
            otherDistancesCache.set(otherID, this.findIntersectionsOfNodev2(otherID, straightMode))
        }

        // ── cache findPathByNodes per segment ────────────────────────────────────
        // Avoids an O(n) path search per iteration
        const pathCache = new Map()
        for (const s of connectedSegments) {
            const key = `${s.fromNodeID}:${s.toNodeID}`
            if (!pathCache.has(key)) {
                pathCache.set(key, this.findPathByNodes(s.fromNodeID, s.toNodeID))
            }
        }

        // ── main loop ────────────────────────────────────────────────────────────
        connectedSegments.forEach(s => {
            if (s.originalFromPos && s.originalToPos) {
                const pathOfSeg = pathCache.get(`${s.fromNodeID}:${s.toNodeID}`)
                if (!pathOfSeg) return

                let dHere = distances.get(pathOfSeg.id)
                if (dHere === undefined) return

                const otherNodeID = s.fromNodeID === nodeID ? s.toNodeID : s.fromNodeID
                const otherDistances = otherDistancesCache.get(otherNodeID)
                let dOther = otherDistances ? (otherDistances.get(pathOfSeg.id) ?? 0) : 0

                dHere  = adjust(dHere)
                dOther = adjust(dOther)

                const origLen = distt(
                    s.originalFromPos.x, s.originalFromPos.y,
                    s.originalToPos.x,   s.originalToPos.y
                )
                const available = origLen - MIN_GAP

                if (available <= 0) {
                    dHere = 0
                } else if (dHere + dOther > available) {
                    const k = available / (dHere + dOther)
                    dHere  *= k
                    dOther *= k
                }

                if (s.fromNodeID === nodeID) {
                    s.fromPos = shortenSegment({...s.originalToPos}, {...s.originalFromPos}, dHere)
                } else if (s.toNodeID === nodeID) {
                    s.toPos = shortenSegment({...s.originalFromPos}, {...s.originalToPos}, dHere)
                }
            }

            s.createArrows()
            s.constructCorners()
        })

        if (connect) {
            const once = this.nodeOnceConnected(node)
            this.connectIntersection(nodeID, once, instantConvex, straightMode, activenessMap)
        }
    }

    // straightMode: only connect segments that go straight through the intersection
    // connectSelf: if true, allows connecting segments that go from and to the same node (U-turns)
    connectIntersection(nodeID, connectSelf = false, instantConvex = true, straightMode = false, activenessMap = new Map()) {
        const node = this.findNode(nodeID)
        if (!node) return

        const intersection = new Intersection(nodeID)
        intersection.nodeObj = node
        intersection.road = this

        const incoming = node.incomingSegments.length > 0
            ? node.incomingSegments
            : node.incomingSegmentIDs.map(id => this.findSegment(id))

        const outgoing = node.outgoingSegments.length > 0
            ? node.outgoingSegments
            : node.outgoingSegmentIDs.map(id => this.findSegment(id))

        // ── straightMode: pre-compute path + index per segment, once ────────────
        // Replaces findPathByNodes + spread+indexOf inside O(in × out) loop
        let segPathMeta = null
        if (straightMode) {
            segPathMeta = new Map()
            const allSegs = [...incoming, ...outgoing]
            for (const s of allSegs) {
                if (segPathMeta.has(s.id)) continue
                const path = this.findPathByNodes(s.fromNodeID, s.toNodeID)
                if (!path) continue
                const index = [...path.segmentsIDs].indexOf(s.id)
                segPathMeta.set(s.id, { path, index })
            }
        }

        const connectorMap = new Map()
        const intersecSegObjects = []   // store objects directly — avoid findIntersecSeg lookup later

        for (const inSeg of incoming) {
            const inMeta = segPathMeta?.get(inSeg.id)

            for (const outSeg of outgoing) {
                if (inSeg.fromNodeID === outSeg.toNodeID && !connectSelf) continue

                if (straightMode) {
                    const outMeta = segPathMeta?.get(outSeg.id)
                    if (!inMeta || !outMeta) continue
                    if (inMeta.path === outMeta.path) continue
                    if (inMeta.index !== outMeta.index) continue
                }

                // ── connectors: reuse or create ──────────────────────────────────
                let connector1 = connectorMap.get(inSeg.id)
                if (!connector1) {
                    connector1 = new Connector(inSeg.id, undefined, inSeg.toPos, this.connectorIDcounter)
                    connector1.road = this
                    connector1.type = 'enter'
                    this.connectors.set(connector1.id, connector1)
                    this.connectorIDcounter = getNextID(this.connectorIDcounter)
                    connectorMap.set(inSeg.id, connector1)
                }

                let connector2 = connectorMap.get(outSeg.id)
                if (!connector2) {
                    connector2 = new Connector(undefined, outSeg.id, outSeg.fromPos, this.connectorIDcounter)
                    connector2.road = this
                    connector2.type = 'exit'
                    this.connectors.set(connector2.id, connector2)
                    this.connectorIDcounter = getNextID(this.connectorIDcounter)
                    connectorMap.set(outSeg.id, connector2)
                }

                // ── bezier curve ─────────────────────────────────────────────────
                const inSegFromPos  = inSeg.toPos
                const outSegToPos   = outSeg.fromPos
                const d      = distt(inSegFromPos.x, inSegFromPos.y, outSegToPos.x, outSegToPos.y)
                const length = d * LANE_WIDTH * 0.02

                const dir1 = inSeg.dir
                const dir2 = outSeg.dir + PI
                const cp1 = { x: inSegFromPos.x  + Math.cos(dir1) * length, y: inSegFromPos.y  + Math.sin(dir1) * length }
                const cp2 = { x: outSegToPos.x + Math.cos(dir2) * length, y: outSegToPos.y + Math.sin(dir2) * length }

                const pointsBezier = bezierPoints(cp1, inSegFromPos, outSegToPos, cp2, LENGTH_SEG_BEZIER, TENSION_BEZIER_MAX)

                // ── inter-segment ────────────────────────────────────────────────
                const seg = new InterSegment(this.intersecSegIDcounter, connector1.id, connector2.id, inSeg.visualDir, pointsBezier)
                seg.road          = this
                seg.fromPos       = inSegFromPos
                seg.toPos         = outSegToPos
                seg.len           = pointsBezier.length * LENGTH_SEG_BEZIER
                seg.fromConnector = connector1
                seg.toConnector   = connector2
                seg.fromtoKey     = `${connector1.id}_${connector2.id}`
                this.intersecSegs.set(seg.id, seg)
                this.intersecSegIDcounter = getNextID(this.intersecSegIDcounter)

                const activenessKey = `${inSeg.id}_${outSeg.id}`
                if (activenessMap.has(activenessKey)) seg.active = activenessMap.get(activenessKey)

                connector1.outgoingSegmentIDs.push(seg.id)
                connector2.incomingSegmentIDs.push(seg.id)

                inSeg.toConnectorID   = connector1.id
                outSeg.fromConnectorID = connector2.id
                inSeg.toConnector     = connector1
                outSeg.fromConnector  = connector2

                intersecSegObjects.push(seg)   // ← object, not ID
            }
        }

        // ── unpaired incoming (cul-de-sac) ───────────────────────────────────────
        for (const inSeg of incoming) {
            if (connectorMap.has(inSeg.id)) continue
            const connector = new Connector(inSeg.id, undefined, inSeg.toPos, this.connectorIDcounter)
            connector.road = this
            connector.type = 'enter'
            this.connectors.set(connector.id, connector)
            this.connectorIDcounter = getNextID(this.connectorIDcounter)
            connectorMap.set(inSeg.id, connector)
            inSeg.toConnectorID = connector.id
            inSeg.toConnector   = connector
        }

        // ── unpaired outgoing (cul-de-sac) ───────────────────────────────────────
        for (const outSeg of outgoing) {
            if (connectorMap.has(outSeg.id)) continue
            const connector = new Connector(undefined, outSeg.id, outSeg.fromPos, this.connectorIDcounter)
            connector.road = this
            connector.type = 'exit'
            this.connectors.set(connector.id, connector)
            this.connectorIDcounter = getNextID(this.connectorIDcounter)
            connectorMap.set(outSeg.id, connector)
            outSeg.fromConnectorID = connector.id
            outSeg.fromConnector   = connector
        }

        // ── finalise intersection ────────────────────────────────────────────────
        for (const c of connectorMap.values()) c.constructDirections()

        intersection.connectors  = Array.from(connectorMap.values())
        intersection.intersecSegs = intersecSegObjects          // no findIntersecSeg scan needed
        intersection.paths        = this.findAnyPath(nodeID) || []
        intersection.calculateOutlinesIntersection()
        intersection.calculateInnerEdges()
        this.intersections.set(nodeID, intersection)
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

    // optimized
    showMain(zoom, pathsInView){
        push()
        let ctx = drawingContext
        let scaledStrokeW = 1 / zoom
        ctx.strokeStyle = 'white'
        ctx.lineWidth = scaledStrokeW
        ctx.beginPath()
        pathsInView.forEach((p) => {
            let fromPos = p.nodeAObj.pos
            let toPos = p.nodeBObj.pos
            ctx.moveTo(fromPos.x, fromPos.y)
            ctx.lineTo(toPos.x, toPos.y)
        })
        ctx.stroke()
        pop()
    }

    showPaths(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID = undefined){
        this.paths.forEach((p, key) => p.showPath(SHOW_TAGS, SHOW_SEGS_DETAILS, hoveredSegID))
    }

    showConnectors(SHOW_TAGS){
        this.connectors.forEach((c, key) => c.show(SHOW_TAGS))
    }

    showIntersecSegs(SHOW_TAGS){
        this.intersecSegs.forEach((s, key) => s.showBezier(SHOW_TAGS))
    }

    showIntersectionArea(){
        this.intersections.forEach((i, key) => {i.drawOutlineDebug()})
    }

    showLanes(hoveredSegID = undefined){
        this.paths.forEach((p, key) => p.showLanes(hoveredSegID))
        this.intersecSegs.forEach((s, key) => s.showLane())
    }

    showNodes(zoom){
        if(zoom > 0.18) this.nodes.forEach((n, key) => n.show(false, zoom))
    }

    showNodesTags(){
        this.nodes.forEach((n, key) => n.showTags())
    }

    showGraph(zoom){
        push()
        strokeWeight(1/zoom);
        noFill();
        stroke(0, 255, 0, 75)
        for(let i = 0; i < 10; i++) {
            drawRTreeLayer(this.graphIndex.nodes, i);
        }
        stroke(255, 0, 0, 75)
        for(let i = 0; i < 10; i++) {
            drawRTreeLayer(this.graphIndex.edges, i);
        }
        pop()
    }

    // every function with  "type: showWays" as a comment must only be called from here, as this function sets the correct drawing modes for optimization purposes
    showWays(toolObj, pathsInView, intersectionsInViewIDs){
        let zoom = toolObj.zoom
        let hoveredID = toolObj.state.hoverSeg

        // this.paths.forEach((p, key) => p.setOOB())
        // this.nodes.forEach((n, key) => n.setOOB())

        let intersectionsInView = intersectionsInViewIDs.map(id => this.findIntersection(id)).filter(i => i != undefined)

        push()
        rectMode(CORNERS)
        fill(SIDE_WALK_COL)
        stroke(SIDE_WALK_COL)
        strokeWeight(1)
        if(zoom > 0.1) pathsInView.forEach((p, key) => p.showWayBase())
        pop()

        push()
        fill(SIDE_WALK_COL)
        stroke(SIDE_WALK_COL)
        strokeWeight(1)
        if(zoom > 0.1) intersectionsInView.forEach((p, key) => p.showWayBase())
        pop()

        push()
        fill(ROAD_COL)
        stroke(ROAD_COL)
        strokeWeight(1)
        if(zoom > 0.05) intersectionsInView.forEach((p, key) => p.showWayTop())
        stroke(MARKINGS_COL)
        strokeWeight(1.5)
        noFill()
        if(zoom > 0.18) intersectionsInView.forEach((p, key) => p.showOuterEdges())
        if(zoom > 0.18) intersectionsInView.forEach((p, key) => p.showInnerEdges())
        pop()
    
        push()
        rectMode(CORNERS)
        fill(ROAD_COL)
        stroke(ROAD_COL)
        strokeWeight(1)
        if(zoom > 0.05) pathsInView.forEach((p, key) => p.showWayTop(hoveredID))
        stroke(MARKINGS_COL)
        strokeWeight(WIDTH_YIELD_MARKING)
        strokeCap(SQUARE)
        if(zoom > 0.18) intersectionsInView.forEach((p, key) => p.showYieldMarkings())
        strokeWeight(1.5)
        stroke(MARKINGS_COL)
        strokeCap(SQUARE)
        if(zoom > 0.18) pathsInView.forEach((p, key) => p.showEdges())
        stroke(ARROWS_COL)
        strokeWeight(1.5)
        fill(ARROWS_COL)
        if(zoom > 0.35){ 
            pathsInView.forEach((p, key) => p.showArrows())
            intersectionsInView.forEach((i, key) => i.showDirectionsIntersection())
            strokeWeight(1.5)
            stroke(ROAD_COL)
            fill(SIDE_WALK_COL)
            textAlign(CENTER, CENTER)
            textSize(14)
            pathsInView.forEach((p, key) => p.showName())
        }
        if (zoom <= 0.05) {
            this.showMain(zoom, pathsInView)
        }

        if(zoom > 0.18 && toolObj.showOptions.SHOW_NODES){
            push()
            noFill()
            strokeWeight(1.5 / zoom)
            stroke(255, 200)
            blendMode(DIFFERENCE)
            intersectionsInView.forEach((n, key) => {
                this.findNode(n.id).show(true, zoom)
            })
            blendMode(BLEND)
            pop()
        }

        if(zoom > 0.18) {
            push()
            stroke(SIDE_WALK_COL)
            strokeWeight(2)
            noFill()
            strokeCap(ROUND)
            strokeWeight(2.5)
            //intersectionsInView.forEach(i => i.drawIntersectionAreaMarkings())
            pop()
        }
        pop()

        
    }
}




// the ids of any object are strings made of 94 characters
// the characters - and _ are reserved for special purposes (like path IDs are nodeAID-nodeBID), 
// so they are not included in the possible characters for the IDs of the objects
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{|}~!#$%&()*+./:;<=>?@[]^';
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