//DosDos
//Miguel Rodríguez
//17-06-2026

p5.disableFriendlyErrors = true
const WIDTH  = 900
const HEIGHT = 900

// Virtual canvas dimensions (nodes are placed in world space, viewed via zoom/pan)
const V_WIDTH  = 4000
const V_HEIGHT = 1400

let states          = new Map()  // id -> state
let depths          = new Map()  // id -> BFS depth from start
let particles       = new Map()  // id -> Particle
let constraints     = []
let constraintLookup = new Map() // "from>to" -> Constraint
let pathNodes       = new Set()  // ids on the currently shown path
let selectedId      = null       // node the user last clicked

// Zoom / pan state
let zoom = 0.22
let xOff = 0
let yOff = HEIGHT / 2 - (V_HEIGHT / 2) * 0.22
let prevMX = 0, prevMY = 0

function setup(){
    createCanvas(WIDTH, HEIGHT)

    let startId = '2_2_2_2_0'
    states.set(startId, makeState(2, 2, 2, 2, 0))
    depths.set(startId, 0)

    buildGraph(startId)
    layoutGraph()
    spawnConstraints()
    runAStar(startId)
}

// ─── State helpers ────────────────────────────────────────────────────────────

function makeState(ah1, ah2, bh1, bh2, turn) {
    return { a:{hand_1:ah1, hand_2:ah2}, b:{hand_1:bh1, hand_2:bh2}, turn, to: new Set() }
}

function stateId(s) {
    return `${s.a.hand_1}_${s.a.hand_2}_${s.b.hand_1}_${s.b.hand_2}_${s.turn}`
}

function isWinA(s) { return s.b.hand_1 == -1 && s.b.hand_2 == -1 }
function isWinB(s) { return s.a.hand_1 == -1 && s.a.hand_2 == -1 }
function isTerminal(s) { return isWinA(s) || isWinB(s) }

// Returns undefined if either hand is dead or result is invalid
function addUp(from, to) {
    if (from == -1 || to == -1) return undefined
    let result = (from + to) % 5
    return result == 0 ? -1 : result
}

// ─── BFS graph construction (proper deduplication) ────────────────────────────

function buildGraph(startId) {
    let queue = [startId]
    while (queue.length > 0) {
        let id    = queue.shift()
        let state = states.get(id)
        if (isTerminal(state)) continue

        for (let [childId, childState] of getChildren(state)) {
            state.to.add(childId)
            if (!states.has(childId)) {
                states.set(childId, childState)
                depths.set(childId, depths.get(id) + 1)
                queue.push(childId)
            }
        }
    }
}

function getChildren(state) {
    let children = new Map()
    let { a, b, turn } = state

    if (turn == 0) {
        // A attacks B's hands
        let moves = [
            { atk: a.hand_1, def: b.hand_1, target: 'bh1' },
            { atk: a.hand_1, def: b.hand_2, target: 'bh2' },
            { atk: a.hand_2, def: b.hand_1, target: 'bh1' },
            { atk: a.hand_2, def: b.hand_2, target: 'bh2' },
        ]
        for (let { atk, def, target } of moves) {
            let result = addUp(atk, def)
            if (result === undefined) continue
            let bh1 = target == 'bh1' ? result : b.hand_1
            let bh2 = target == 'bh2' ? result : b.hand_2
            let child = makeState(a.hand_1, a.hand_2, bh1, bh2, 1)
            let id = stateId(child)
            if (!children.has(id)) children.set(id, child)
        }
    } else {
        // B attacks A's hands
        let moves = [
            { atk: b.hand_1, def: a.hand_1, target: 'ah1' },
            { atk: b.hand_1, def: a.hand_2, target: 'ah2' },
            { atk: b.hand_2, def: a.hand_1, target: 'ah1' },
            { atk: b.hand_2, def: a.hand_2, target: 'ah2' },
        ]
        for (let { atk, def, target } of moves) {
            let result = addUp(atk, def)
            if (result === undefined) continue
            let ah1 = target == 'ah1' ? result : a.hand_1
            let ah2 = target == 'ah2' ? result : a.hand_2
            let child = makeState(ah1, ah2, b.hand_1, b.hand_2, 0)
            let id = stateId(child)
            if (!children.has(id)) children.set(id, child)
        }
    }
    return children
}

// ─── Hierarchical layout (world-space positions grouped by BFS depth) ─────────

function layoutGraph() {
    let byDepth = new Map()
    depths.forEach((d, id) => {
        if (!byDepth.has(d)) byDepth.set(d, [])
        byDepth.get(d).push(id)
    })

    let maxDepth = Math.max(...byDepth.keys())
    let padX = 30, padY = 60

    byDepth.forEach((ids, depth) => {
        let n = ids.length
        for (let i = 0; i < n; i++) {
            let x = padX + (V_WIDTH  - 2 * padX) * (i + 0.5) / n
            let y = padY + (V_HEIGHT - 2 * padY) * depth / Math.max(maxDepth, 1)
            particles.set(ids[i], new Particle(x, y, true, ids[i]))
        }
    })
}

// ─── Constraint creation ──────────────────────────────────────────────────────

function spawnConstraints() {
    states.forEach((state, fromId) => {
        for (let toId of state.to) {
            let p1 = particles.get(fromId)
            let p2 = particles.get(toId)
            if (!p1 || !p2) continue
            let c = new Constraint(p1, p2)
            constraints.push(c)
            constraintLookup.set(fromId + '>' + toId, c)
        }
    })
}

// ─── A* (shortest path from start to any A-wins state) ────────────────────────

function runAStar(startId) {
    // Admissible heuristic: number of B's alive hands remaining (0 = goal)
    function h(id) {
        let s = states.get(id)
        if (!s) return 999
        return (s.b.hand_1 != -1 ? 1 : 0) + (s.b.hand_2 != -1 ? 1 : 0)
    }

    let open    = [{ id: startId, f: h(startId) }]
    let gScore  = new Map([[startId, 0]])
    let cameFrom = new Map()
    let closed  = new Set()

    while (open.length > 0) {
        open.sort((a, b) => a.f - b.f)
        let current = open.shift()
        if (closed.has(current.id)) continue
        closed.add(current.id)

        let s = states.get(current.id)
        if (s && isWinA(s)) {
            // Reconstruct and mark the winning path
            let id = current.id
            while (cameFrom.has(id)) {
                pathNodes.add(id)
                let prev = cameFrom.get(id)
                let c    = constraintLookup.get(prev + '>' + id)
                if (c) c.special = true
                id = prev
            }
            pathNodes.add(startId)
            return
        }

        if (!s) continue
        for (let neighborId of s.to) {
            if (closed.has(neighborId)) continue
            let g = gScore.get(current.id) + 1
            if (!gScore.has(neighborId) || g < gScore.get(neighborId)) {
                gScore.set(neighborId, g)
                cameFrom.set(neighborId, current.id)
                open.push({ id: neighborId, f: g + h(neighborId) })
            }
        }
    }
}

// ─── Zoom / pan ───────────────────────────────────────────────────────────────

function mouseDragged() {
    if (prevMX) { xOff += mouseX - prevMX; yOff += mouseY - prevMY }
    prevMX = mouseX; prevMY = mouseY
}

function mouseReleased() { prevMX = 0; prevMY = 0 }

function mouseWheel(event) {
    let wx = (mouseX - xOff) / zoom
    let wy = (mouseY - yOff) / zoom
    zoom *= 1 - event.delta * 0.001
    zoom  = constrainn(zoom, 0.05, 8)
    xOff  = mouseX - wx * zoom
    yOff  = mouseY - wy * zoom
    return false
}

function mousePressed() {
    let w       = screenToWorld_(mouseX, mouseY)
    let clicked = null
    let hitDist = 14 / zoom   // 14 screen-pixel hit radius
    particles.forEach((p, id) => {
        let d = dist(w.x, w.y, p.pos.x, p.pos.y)
        if (d < hitDist) clicked = id
    })

    // Clear previous path markings
    for (let c of constraints) c.special = false
    pathNodes.clear()

    if (!clicked) { selectedId = null; return }

    selectedId = clicked
    let startId = '2_2_2_2_0'
    let path    = findPathBFS(startId, clicked)
    if (!path) return

    pathNodes.add(startId)
    for (let { from, to } of path) {
        pathNodes.add(to)
        let c = constraintLookup.get(from + '>' + to)
        if (c) c.special = true
    }
}

// Convert screen coords to world coords
function screenToWorld_(sx, sy) {
    return { x: (sx - xOff) / zoom, y: (sy - yOff) / zoom }
}

// BFS shortest path from startId to targetId; returns [{from,to}, ...] or null
function findPathBFS(startId, targetId) {
    if (startId === targetId) return []
    let queue    = [startId]
    let cameFrom = new Map()
    let visited  = new Set([startId])

    while (queue.length > 0) {
        let id = queue.shift()
        if (id === targetId) {
            let path = [], curr = targetId
            while (cameFrom.has(curr)) {
                let prev = cameFrom.get(curr)
                path.unshift({ from: prev, to: curr })
                curr = prev
            }
            return path
        }
        let s = states.get(id)
        if (!s) continue
        for (let neighborId of s.to) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId)
                cameFrom.set(neighborId, id)
                queue.push(neighborId)
            }
        }
    }
    return null
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function draw(){
    background(0)

    push()
    translate(xOff, yOff)
    scale(zoom)

    // Normal edges (dim white)
    strokeWeight(1 / zoom)
    stroke(255, 35)
    noFill()
    for (let c of constraints) {
        if (!c.special) line(c.p1.pos.x, c.p1.pos.y, c.p2.pos.x, c.p2.pos.y)
    }

    // A* path edges (bright red, 2px on screen)
    strokeWeight(2 / zoom)
    stroke(255, 60, 60)
    for (let c of constraints) {
        if (c.special) line(c.p1.pos.x, c.p1.pos.y, c.p2.pos.x, c.p2.pos.y)
    }

    // Nodes — fixed 5px screen radius regardless of zoom
    let nodeDiam = RAD_PART * 2 / zoom
    noStroke()
    particles.forEach((p, id) => {
        let s = states.get(id)
        if      (id == '2_2_2_2_0')                   fill(180, 100, 255) // start: purple
        else if (pathNodes.has(id) && s && isWinA(s)) fill(0, 255, 120)  // goal on path: bright green
        else if (pathNodes.has(id))                    fill(255, 220, 0)  // A* path: yellow
        else if (s && isWinA(s))                       fill(0, 160, 80)   // A wins: dark green
        else if (s && isWinB(s))                       fill(200, 50, 50)  // B wins: red
        else                                            fill(180)          // normal: grey
        ellipse(p.pos.x, p.pos.y, nodeDiam)
    })

    // Selection ring around the clicked node
    if (selectedId) {
        let sp = particles.get(selectedId)
        if (sp) {
            noFill()
            stroke(255)
            strokeWeight(1.5 / zoom)
            ellipse(sp.pos.x, sp.pos.y, nodeDiam + 8 / zoom)
        }
    }

    pop()

    // Hover label (drawn in screen space, after pop)
    let hovered = getHovered()
    if (hovered) showLabel(hovered)

    // Legend
    drawLegend()
}

function getHovered() {
    let w = screenToWorld_(mouseX, mouseY)
    let closest = null
    let closestDist = 10 / zoom   // 10 screen pixels in world units
    particles.forEach((p, id) => {
        let d = dist(w.x, w.y, p.pos.x, p.pos.y)
        if (d < closestDist) { closest = id; closestDist = d }
    })
    return closest
}

function showLabel(id) {
    let p = particles.get(id)
    let s = states.get(id)
    if (!p || !s) return

    let sx = p.pos.x * zoom + xOff
    let sy = p.pos.y * zoom + yOff

    let ah1 = s.a.hand_1 == -1 ? 'X' : s.a.hand_1
    let ah2 = s.a.hand_2 == -1 ? 'X' : s.a.hand_2
    let bh1 = s.b.hand_1 == -1 ? 'X' : s.b.hand_1
    let bh2 = s.b.hand_2 == -1 ? 'X' : s.b.hand_2
    let typeStr = isWinA(s) ? '✓ A wins' : isWinB(s) ? '✗ B wins' : s.turn == 0 ? 'A moves' : 'B moves'
    let depthStr = `depth ${depths.get(id) ?? '?'}`

    let lines = [
        `A: ${ah1} ${ah2}   B: ${bh1} ${bh2}`,
        `${typeStr}   ${depthStr}`,
        isTerminal(s) ? 'click to show route' : 'click to trace path',
    ]

    let lx  = constrainn(sx + 8, 4, WIDTH  - 148)
    let ly  = constrainn(sy - 44, 4, HEIGHT - 54)
    let lw  = 144, lh = lines.length * 14 + 6
    noStroke()
    fill(0, 210)
    rect(lx - 3, ly - 2, lw, lh, 4)
    textSize(11)
    textAlign(LEFT, TOP)
    lines.forEach((line, i) => {
        fill(i == 0 ? 255 : i == 1 && isWinA(s) ? color(0, 220, 120) : i == 1 && isWinB(s) ? color(220, 80, 80) : 190)
        text(line, lx, ly + i * 14)
    })
}

function drawLegend() {
    let entries = [
        { col: [180, 100, 255], label: 'Start' },
        { col: [255, 220, 0],   label: 'Route nodes' },
        { col: [0, 255, 120],   label: 'Goal (route end)' },
        { col: [0, 160, 80],    label: 'A wins' },
        { col: [200, 50, 50],   label: 'B wins' },
        { col: [180, 180, 180], label: 'Normal' },
    ]
    let x = 10, y = HEIGHT - 10 - entries.length * 17 - 20
    noStroke()
    fill(0, 160)
    rect(x - 4, y - 6, 152, entries.length * 17 + 28, 5)
    entries.forEach((e, i) => {
        fill(...e.col)
        ellipse(x + 6, y + i * 17 + 5, 10)
        fill(220)
        textSize(10)
        textAlign(LEFT, CENTER)
        text(e.label, x + 16, y + i * 17 + 5)
    })
    fill(150)
    textSize(9)
    textAlign(LEFT, TOP)
    text('Scroll: zoom   Drag: pan', x, y + entries.length * 17 + 8)
    text('Click node: show route', x, y + entries.length * 17 + 18)
}
