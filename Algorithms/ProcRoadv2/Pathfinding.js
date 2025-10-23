// doesn't take into account if an intersec segment is active or not
// not used
function Astar(startNodeID, goalNodeID, road) {
    function h(startNodeID, goalNodeID, road) {
        const start = road.findNode(startNodeID);
        const goal = road.findNode(goalNodeID);
        return dist(start.pos.x, start.pos.y, goal.pos.x, goal.pos.y);
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

// traverses through connectors (lanes), much more realistic
function AstarConnectors(startConnID, goalConnID, road){
    function h(startConnID, goalConnID, road) {
        const start = road.findConnector(startConnID);
        const goal = road.findConnector(goalConnID);
        return dist(start.pos.x, start.pos.y, goal.pos.x, goal.pos.y);
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

  const openSet = new Set([startConnID]);

  const cameFrom = new Map();

  const gScore = new Map();
  gScore.set(startConnID, 0);

  const fScore = new Map();
  fScore.set(startConnID, h(startConnID, goalConnID, road));

  while (openSet.size > 0) {
    const current = getLowest(openSet, fScore);

    if (current === goalConnID) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(current);
  
    let currentConn = road.findConnector(current)
    const outGoingSegs = currentConn.getOutgoingActiveIntersegs()
    let neighboursSet = new Set()
    for(let outseg of outGoingSegs){
      let seg = currentConn.type == 'exit' ? road.findSegment(outseg) : road.findIntersecSeg(outseg) 
      neighboursSet.add(seg.toConnectorID)
    }
    let neighbours = [...neighboursSet]
    for (const neighbor of neighbours) {
      const tentativeG = (gScore.get(current) ?? Infinity) + h(current, neighbor, road);

      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + h(neighbor, goalConnID, road));

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }
  }
  return undefined; // no hay camino
}