function removeChild(child) {
    let parent = child.parent
    for(let i = 0; i < parent.children.length; i++) {
        if(parent.children[i] == child) {
            parent.children.splice(i, 1)
            return
        }
    }
}

function existsPrimordial(link) {
    for(let pri of primordials) {
        if(pri.link == link) return pri
    }
    return undefined
}

function createConnection(p1, p2) {
    constraints.push(new Constraint(p1, p2, dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y)))
}

function createGraph(link, p) {
    return extractAndFilterLinksCategorized(link)
        .then(categories => {
            let primordial = p
            primordial.isParent = true;
            primordial.isPinned = true;
            primordials.push(primordial);
            for(let i = 0; i < categories.length; i++) {
                initFirstGraphCategorized(categories[i].links, categories[i].title, primordial, categories.length == 1);
            }
            btnCenter.bool = true
            checkEndGame()
        })
        .catch(err => {
            throw err;
        });
}

function getP(p) {
    REST_DISTANCE = 250
    let parent = p.parent
    let a = atan2(p.pos.y - parent.pos.y, p.pos.x - parent.pos.x)

    let sep = (REST_DISTANCE + absoluteSeparationDistance)
    let x = p.pos.x + Math.cos(a) * sep
    let y = p.pos.y + Math.sin(a) * sep
    let pos = getFinalPos(createVector(cos(a), sin(a)), createVector(x, y), 0, REST_DISTANCE)
    let pCopy = new Particle(p.pos.x, p.pos.y, true, -1, p.link, p)


    let color
    if(Math.random() < 0.5) {
        color = random(colors)
    }
    else {
        let auxColor = random(colors)
        color = lerpColor(auxColor, p.color, 0.5)
    }

    pCopy.color = color

    animations.push({
        particle: pCopy,
        finalPos: pos
    })

    particles.push(pCopy)
    parentParticles.push({
        pos: pos.copy(),
        radius: 50
    })
    let constraint = new Constraint(parent, pCopy)
    constraints.push(constraint)
    parent.constraint = constraint
    pCopy.constraint = constraint

    removeParticle(p)
    removeConstraint(p)

    return pCopy
}

function removeParticle(p) {
    for(let i = 0; i < particles.length; i++) {
        if(particles[i] == p) {
            particles.splice(i, 1)
            break
        }
    }
    //remove from childrens array of parent
    for(let i = 0; i < p.parent.children.length; i++) {
        if(p.parent.children[i] == p) {
            p.parent.children.splice(i, 1)
            break
        }
    }
}

function removeConstraint(p) {
    let c;
    for(let i = 0; i < constraints.length; i++) {
        if(constraints[i].p1 == p || constraints[i].p2 == p) {
            c = constraints[i]
            constraints.splice(i, 1)
        }
    }
    if(c) {
        for(let p of particles) {
            if(p.constraint == c) {
                p.constraint = undefined
                break
            }
        }
    }
}

function initFirstGraphCategorized(links, title, primordial, fromPrimordial = false) {
    REST_DISTANCE = Math.max(getRadiusFromCircumference(links.length * RADIUS_PARTICLE * 2), RADIUS_PARTICLE * 2)
    let rAngle = random(TWO_PI)
    let finalPos = primordial.pos.copy()
    for(let anim of animations) {
        if(anim.particle == primordial) {
            finalPos = anim.finalPos.copy()
            break
        }
    }
    let x, y
    if(!fromPrimordial) {
        x = Math.cos(rAngle) * (REST_DISTANCE + 150) + finalPos.x
        y = Math.sin(rAngle) * (REST_DISTANCE + 150) + finalPos.y
    }
    else {
        x = finalPos.x
        y = finalPos.y
    }

    let pos = fromPrimordial ? primordial.pos.copy() :
        getFinalPos(createVector(Math.cos(rAngle), Math.sin(rAngle)), createVector(x, y), 0, REST_DISTANCE)
    parentParticles.push({
        pos: pos,
        radius: REST_DISTANCE + RADIUS_PARTICLE * 2
    })

    let p1
    if(!fromPrimordial) {
        p1 = new Particle(primordial.pos.x, primordial.pos.y, true, -1, primordial.link)
        p1.link = primordial.link + '#' + replaceBlankWithBarraBaja(title)
        let constraint = new Constraint(primordial, p1)
        constraints.push(constraint)
        p1.str = (title)
        p1.isParent = true
        p1.parent = primordial
        p1.color = color(255)
        p1.constraint = constraint
        primordial.constraint = constraint

        animations.push({
            particle: p1,
            finalPos: pos
        })

        firstParents.push(p1)
    }
    else p1 = primordial

    primordial.children.push(p1)

    let deltaAngle = TWO_PI / links.length
    let col = randomizeColor(primordial.color, 50)
    let siblings = []
    let newParticles = []



    let radius = (REST_DISTANCE + 5)
    let deltaFrames = Math.max(Math.floor(framesPerAnimation / links.length), 1)
    for(let i = 0; i < links.length; i++) {
        let sameLinks = findAllParticlesByLink(links[i])

        let x2 = pos.x + Math.cos(deltaAngle * i) * radius
        let y2 = pos.y + Math.sin(deltaAngle * i) * radius
        let particle = new Particle(p1.pos.x, p1.pos.y, true, particles.length, links[i].url, p1, links[i].context)
        particle.color = col
        if(title == 'Images') particle.setImage()
        newParticles.push(particle)
        let constraint = new Constraint(p1, particle, radius)
        constraints.push(constraint)
        siblings.push(particle)
        particle.constraint = constraint
        particle.relations = sameLinks

        animations.push({
            particle: particle,
            finalPos: createVector(x2, y2),
            parent: p1,
            framesTillStart: -(i * deltaFrames)
        })


    }
    for(let p of newParticles) {
        p.siblings = siblings
        particles.push(p)
    }
    p1.children = siblings
    particles.push(p1)
}

function showRelationsHovered() {
    let part = draggedParticle || hoveredParticle
    if(part) {
        part.showRelations()
    }
}

function showHovered() {
    let part = draggedParticle || hoveredParticle
    if(part) {
        part.show(true)
        part.showRelationsCircles()
    }
}

function removeCluster() {
    //choose random particle that is not a parent or, if it is it cant have children
    if(firstParents.length == 0) return
    //else get the first one
    let parentToRemove = firstParents.shift()

    for(let child of parentToRemove.children) {
        child.isPinned = true
        let anim = {
            particle: child,
            finalPos: child.parent
        }
        removeAnimations.push(anim)
    }
    let finalAnim = {
        particle: parentToRemove,
        finalPos: parentToRemove.parent
    }
    removeAnimations.push(finalAnim)

}

function parentExists(str, avoid) {
    for(let p of particles) {
        if(p != avoid && p.isParent && p.str == str) return true
    }
    return false
}

function findParticleByLink(link) {
    for(let p of particles) {
        if(p.link == link) return p
    }
    return undefined
}

function findAllParticlesByLink(link) {
    let arr = []
    for(let p of particles) {
        if(p.link == link) arr.push(p)
    }
    return arr
}

function getMinMaxPos() {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for(let p of particles) {
        if(p.pos.x < minX) minX = p.pos.x
        if(p.pos.y < minY) minY = p.pos.y
        if(p.pos.x > maxX) maxX = p.pos.x
        if(p.pos.y > maxY) maxY = p.pos.y
    }
    return [
        minX,
        maxX,
        minY,
        maxY
    ]
}

function showGraph() {
    for(let c of constraints) c.show()
    for(let p of particles) {
        if(hoveredParticle == p) continue
        if(hoveredParticle && (hoveredParticle.relations.length > 1 || hoveredParticle.isParent)) {
            if(hoveredParticle.relations.includes(p)) p.show()
            else p.show(false, true)
        }
        else {
            p.show()
        }
    }
}