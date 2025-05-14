function resetState() {
    hoveredParticle = null
    draggedParticle = null
    winningParticle = null

    parentParticles = []

    constraints = []
    particles = []
    primordials = []

    animConn = []

    xOff = 0
    yOff = 0
    prevMouseX, prevMouseY
    zoom = 1
    currentEdges

    framesPerAnimation = 60 * 1.5

    started = false
    errorFrames = 0

    dimmingLines = 1
    transLines = 255

    btnReset.bool = false

    resetGame()

    input.removeText()
}

function manageAnimConn() {
    for(let i = animConn.length - 1; i >= 0; i--) {
        let conn = animConn[i]
        conn.from.pos.lerp(conn.to.pos, 0.1)
        if(squaredDistance(conn.from.pos.x, conn.from.pos.y, conn.to.pos.x, conn.to.pos.y) < 1) {
            let parent = conn.from.parent
            let to = conn.to
            constraints.push(new Constraint(parent, to, dist(parent.pos.x, parent.pos.y, to.pos.x, to.pos.y)))
            removeParticle(conn.from)
            removeConstraint(conn.from)
            animConn.splice(i, 1)
        }
    }
}

function manageDimming() {
    let p = draggedParticle || hoveredParticle
    if(dimmingLines == 1 && p && (p.relations.length > 1 || p.isParent)) {
        dimmingLines = -1
    }
    if(p == undefined || (p && p.relations.length <= 1 && !p.isParent)) {
        dimmingLines = 1
    }
}

function updateReset() {
    let aux = worldToCanvas(width / 2, height / 2)
    let mid = createVector(aux.x, aux.y)
    if(btnReset.bool) {
        for(let part of particles) {
            part.isPinned = true
            part.pos.lerp(mid, 0.1)
            part.color.levels[3] = lerpp(part.color.levels[3], 0, 0.99)
        }
        if(squaredDistance(particles[1].pos.x, particles[1].pos.y, mid.x, mid.y) < 1) {
            resetState()
        }
    }
}

function updateGraph() {
    let bool = zoom > 0.2
    for(let i = 0; i < particles.length; i++) {
        let p = particles[i]
        p.setOut()
        if(bool) {
            if(p.closest.length == 0) p.closest = getTwoClosestParticles(p.siblings, p)
            if(p.closest[0] && p.closest[1]) {
                p.repel(p.closest)
                p.update(0.01)      
            }
        }
        p.updateHovering()
    }
    for(let c of constraints) {
        c.satisfy()
    }
}

function updateAnimations() {
    if(btnReset.bool) return;

    const activeParticles = new Set(animations.map(anim => anim.particle));

    for(let i = animations.length - 1; i >= 0; i--) {
        let anim = animations[i];
        let p = anim.particle;

        if(!p) {
            animations.splice(i, 1);
            continue;
        }

        if(anim.parent && activeParticles.has(anim.parent)) {
            p.pos = anim.parent.pos.copy();
            continue;
        }
        let finalPos = anim.finalPos;
        if(anim.framesTillStart === undefined || anim.framesTillStart > 0)
            p.pos.lerp(finalPos, 0.05);
        if(anim.framesTillStart !== undefined)
            anim.framesTillStart++;
        let d = squaredDistance(p.pos.x, p.pos.y, finalPos.x, finalPos.y);
        if(d < 0.1) {
            if(anim.parent) p.isPinned = false;
            p.removeInertia();
            animations.splice(i, 1);
            if(anim.remove) {
                removeParticle(p)
                removeConstraint(p)
            }
        }
    }

    for(let i = removeAnimations.length - 1; i >= 0; i--) {
        let anim = removeAnimations[i];
        let p = anim.particle;

        if(!p) {
            removeAnimations.splice(i, 1);
            continue;
        }

        let finalPos = anim.finalPos.pos.copy()
        p.pos.lerp(finalPos, 0.02);
        let d = squaredDistance(p.pos.x, p.pos.y, finalPos.x, finalPos.y);
        if(d < 0.1) {
            removeAnimations.splice(i, 1);
            removeParticle(p)
            removeConstraint(p)
        }
    }
}

function getTwoClosestParticles(particles, p){
    let closest = null
    let secondClosest = null
    let minDist = Infinity
    let secondMinDist = Infinity
    for(let other of particles){
        if(other == p) continue
        let d = squaredDistance(p.pos.x, p.pos.y, other.pos.x, other.pos.y)
        if(d < minDist){
            secondClosest = closest
            secondMinDist = minDist
            closest = other
            minDist = d
        }
        else if(d < secondMinDist){
            secondClosest = other
            secondMinDist = d
        }
    }
    return [closest, secondClosest]
}