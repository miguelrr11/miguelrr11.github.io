/** Resumen:
 * A road consists of nodes and segments connecting them.
 * The nodes and segments form a directed graph.
 * The paths are a way to group segments between two nodes, they do not affect the graph structure.
 * Paths modify the segments adding position for lanes and direction
 * Segments are separated by intersections on nodes. These intersections contain Connectors that tell the incomming segment what other 
 * intersection-segments there are to choose. 
 * Intersections are just a data structure to group intersections (they contain the nodeID, the connectors and the intersection-segments)
 * setPaths() recoomputes everything, so the convex hull calculations are relegated to the convexHullQueue that processes them one by one
 */

// It is extremely important to separate segments (array segments) from the intersection segments (array intersecSegs)
// because they have different ID pools

const NODE_RAD = 20
const GRID_CELL_SIZE = 40   //15

let OFFSET_RAD_INTERSEC = 5      //25 (intersec_rad)
let LENGTH_SEG_BEZIER = 5         //3
let TENSION_BEZIER_MIN = 0.1
let TENSION_BEZIER_MAX = 0.8
let MIN_DIST_INTERSEC = 30        //30
let LANE_WIDTH = 30

// how many intersections to calculate per frame when updating convex hulls incrementally
const INTERSECTIONS_PER_FRAME = 2
// after this number of segments in a path in setPaths(), switch to incremental convex hull calculation
const N_SEG_TO_SWITCH_TO_INCREMENTAL = 200

  

function shortenSegment(A, B, length) {
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0){return { ...B }}  // no movement possible

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


