function parseSVG(svg) {
    let pathElements = svg.getChildren("path");
    let paths = [];
    for (let path of pathElements) {
        let d = path.getString("d");
        if (d) {
            let parsedPath = parsePathData(d);
            paths.push(parsedPath);
        }
    }
    console.log(paths)

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let path of paths) {
        for (let p of path) {
            if (p.pos) {
                minX = Math.min(minX, p.pos.x);
                minY = Math.min(minY, p.pos.y);
                maxX = Math.max(maxX, p.pos.x);
                maxY = Math.max(maxY, p.pos.y);
            } else if (p.type === "C") {
                minX = Math.min(minX, p.cp1.x, p.cp2.x, p.end.x);
                minY = Math.min(minY, p.cp1.y, p.cp2.y, p.end.y);
                maxX = Math.max(maxX, p.cp1.x, p.cp2.x, p.end.x);
                maxY = Math.max(maxY, p.cp1.y, p.cp2.y, p.end.y);
            }
        }
    }

    let centerX = (minX + maxX) / 2;
    let centerY = (minY + maxY) / 2;

    return [paths, centerX, centerY];
}

function parsePathData(d) {
    let commands = d.match(/[a-df-z][^a-df-z]*/gi);
    let points = [];
    
    let currentPoint = createVector(0, 0);
    
    for (let command of commands) {
        let type = command.charAt(0);
        let values = command.slice(1).trim().split(/[\s,]+/).map(parseFloat);
        
        switch (type) {
            case "M": 
                currentPoint.set(values[0], values[1]);
                points.push({ type: "M", pos: currentPoint.copy() });
                break;
            case "L":
                currentPoint.set(values[0], values[1]);
                points.push({ type: "L", pos: currentPoint.copy() });
                break;
            case "C":
                let cp1 = createVector(values[0], values[1]);
                let cp2 = createVector(values[2], values[3]);
                let end = createVector(values[4], values[5]);
                points.push({ type: "C", cp1, cp2, end });
                currentPoint.set(end);
                break;
            case "Z":
                points.push({ type: "Z" });
                break;
        }
    }
    return points;
}

function drawPaths(paths, x, y, size, centerX, centerY) {
    if (paths.length === 0) return;

    push();
    translate(x, y);
    scale(size);
    translate(-centerX, -centerY)

    for (let path of paths) {
        beginShape();
        for (let p of path) {
            if (p.type === "M") {
                beginShape();
                vertex(p.pos.x, p.pos.y);
            } 
            else if (p.type === "L") {
                vertex(p.pos.x, p.pos.y);
            } 
            else if (p.type === "C") {
                bezierVertex(p.cp1.x, p.cp1.y, p.cp2.x, p.cp2.y, p.end.x, p.end.y);
            } 
            else if (p.type === "Z") {
                endShape(CLOSE);
            }
        }
        endShape();
    }

    pop();
}

