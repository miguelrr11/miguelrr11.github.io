class Connection{
    constructor(fromNode, fromPort, toNode, toPort){
        this.fromNode = fromNode;
        this.fromPort = fromPort;
        this.toNode = toNode;
        this.toPort = toPort;
        this.pixels = pixelateLine(this.fromNode.getPinPos(this.fromPort, 'output'), this.toNode.getPinPos(this.toPort, 'input'), SIZE_PIXEL);
        this.highlight = false;
    }

    recalculatePixels(){
        if(this.fromNode.moved || this.toNode.moved) this.pixels = pixelateLine(this.fromNode.getPinPos(this.fromPort, 'output'), this.toNode.getPinPos(this.toPort, 'input'), SIZE_PIXEL);
    }

    update(){
        this.recalculatePixels();
    }
}

function pixelateLine(from, to, size = SIZE_PIXEL) {
    function snap(point) {
        return {
            x: Math.round(point.x / size) * size,
            y: Math.round(point.y / size) * size
        };
    }

    const start = snap(from);
    const end = snap(to);

    const positions = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) / size;

    for (let i = 0; i <= steps; i++) {
        const x = start.x + Math.round((dx / steps) * i / size) * size;
        const y = start.y + Math.round((dy / steps) * i / size) * size;
        positions.push({ x, y });
    }

    return positions;
}

function precomputeCirclePerimeters(size, maxRadius = 30) {
  const perimeters = {};

  for (let r = 1; r <= maxRadius; r++) {
    const uniq = new Set();

    let x = 0;
    let y = r;
    let d = 1 - r; // decision parameter for midpoint circle

    const add8 = (ix, iy) => {
      // 8-way symmetry; store as "x,y" in grid units (already scaled by `size`)
      const pts = [
        [ ix,  iy], [ iy,  ix],
        [-ix,  iy], [-iy,  ix],
        [-ix, -iy], [-iy, -ix],
        [ ix, -iy], [ iy, -ix],
      ];
      for (const [px, py] of pts) {
        uniq.add((px * size) + "," + (py * size));
      }
    };

    add8(x, y);
    while (x < y) {
      if (d < 0) {
        d += 2 * x + 3;
      } else {
        d += 2 * (x - y) + 5;
        y--;
      }
      x++;
      add8(x, y);
    }

    // Convert to array and order by angle (optional but handy for drawing)
    const points = Array.from(uniq, key => {
      const [sx, sy] = key.split(",").map(Number);
      return { x: sx, y: sy };
    }).sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x));

    perimeters[r] = points;
  }

  return perimeters;
}

const circles = precomputeCirclePerimeters(SIZE_PIXEL, 40);


function showConnection(pixels, size = SIZE_PIXEL){
    for(let pixel of pixels){
        rect(pixel.x, pixel.y, size, size)
    }
}

function showCircle(x, y, radius, size = SIZE_PIXEL){
    let circlePixels = circles[radius]
    for(let p of circlePixels){
        rect(x + p.x, y + p.y, size, size)
    }
}

function getAllConnectionsFromNode(node, direction = "both", connections = [], visited = new Set(), nodes = new Set()) {
  for (const conn of graph.connections) {
    let shouldUse = false;
    let nextNode = null;
    nodes.add(node);

    if (direction === "outputs") {
      // Follow edges going OUT from the current node
      if (conn.fromNode === node) {
        shouldUse = true;
        nextNode = conn.toNode;
      }
    } else if (direction === "inputs") {
      // Follow edges coming IN to the current node
      if (conn.toNode === node) {
        shouldUse = true;
        nextNode = conn.fromNode;
      }
    } else { // "both"
      if (conn.fromNode === node || conn.toNode === node) {
        shouldUse = true;
        nextNode = (conn.fromNode === node) ? conn.toNode : conn.fromNode;
      }
    }

    if (shouldUse && !visited.has(conn)) {
      visited.add(conn);
      connections.push(conn);
      nodes.add(nextNode);
      // Recurse in the SAME direction so we keep walking upstream or downstream consistently
      getAllConnectionsFromNode(nextNode, direction, connections, visited, nodes);
    }
  }
  return { connections, nodes };
}

function getAllConnectionsFromNodeBoth(node){
    let from = getAllConnectionsFromNode(node, "outputs");
    let to = getAllConnectionsFromNode(node, "inputs");
    return { connections: new Set([...from.connections, ...to.connections]), nodes: new Set([...from.nodes, ...to.nodes]) };
}
