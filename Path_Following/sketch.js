//Path Following Agents
//Miguel Rodríguez
//26-09-2024

p5.disableFriendlyErrors = true
const WIDTH = 1200
const HEIGHT = 600

let path
let nPath = 200
let agents = []
let nAgents = 150

function setup(){
    createCanvas(WIDTH, HEIGHT)
    for(let i = 0; i < nAgents; i++) agents.push(new Agent(map(i, 0, nAgents, 0, 100)))

    path = new Path()
    for(let i = 40; i <= WIDTH-40; i += WIDTH/nPath) path.addPoint(i, noise(i/250)*HEIGHT)
    //path.points.reverse()

    strokeJoin(ROUND);
    
}

function draw(){
    background(255)
    path.show()
    for(let a of agents){
        a.update()
        a.show()
    }
}

class Agent{
    constructor(lookAhead){
        this.pos = createVector(20, random(HEIGHT))
        this.vel = p5.Vector.fromAngle(random(360))
        this.maxSpeed = 2
        this.vel.setMag(this.maxSpeed)
        this.acc = createVector(0, 0)
        this.maxForce = 0.1
        this.size = 10

        this.lookAhead = lookAhead

        this.dir = 'right'
    }

    getNormal(future, a, b){
        let vectorA = p5.Vector.sub(future, a)
        let vectorB = p5.Vector.sub(b, a)
        vectorB.normalize()
        vectorB.mult(vectorA.dot(vectorB))
        let normalP = p5.Vector.add(a, vectorB)
        //ellipse(normalP.x, normalP.y, 20)
        return normalP
    }

    update(){
        let future = this.vel.copy()
        future.setMag(this.lookAhead)
        future.add(this.pos)

        let target = null
        let best = Infinity
        let ba, bb

        for(let i = 0; i < path.points.length - 1; i++){
            let a = this.dir == 'right' ? path.points[i] : path.points[i + 1]
            let b = this.dir == 'right' ? path.points[i + 1] : path.points[i]
            let normalP = this.getNormal(future, a, b)
            
            if(this.dir == 'right' && (normalP.x < a.x || normalP.x > b.x)) normalP = path.points[i+1].copy()
            else if(this.dir == 'left' && (normalP.x < b.x || normalP.x > a.x)) normalP = path.points[i].copy()

            let d = dist(future.x, future.y, normalP.x, normalP.y)
            if(d < best){
                ba = a  
                bb = b
                best = d 
                target = normalP.copy()
            }
        }

        if(mouseIsPressed){
            stroke(0, 50)
            fill(255, 50)
            line(this.pos.x, this.pos.y, future.x, future.y)
            ellipse(future.x, future.y, 8)
            line(target.x, target.y, future.x, future.y)
            ellipse(target.x, target.y, 8)
        }
        

        let distance = dist(this.pos.x, this.pos.y, target.x, target.y)
        if(distance > path.radius){
            if(mouseIsPressed) ellipse(target.x, target.y, 8)
            let dir = p5.Vector.sub(bb, ba)
            dir.setMag(55)
            target.add(dir)
            this.seek(target)
            
        }
        this.vel.add(this.acc)
        this.vel.limit(this.maxSpeed)
        this.pos.add(this.vel)
        this.acc.mult(0)

        let goal = this.dir == 'right' ? path.points[path.points.length-1] : path.points[0]
        if(dist(this.pos.x, this.pos.y, goal.x, goal.y) < 20 || dist(target.x, target.y, goal.x, goal.y) < 5){
            this.dir = this.dir == 'right' ? 'left' : 'right'
        }
    }

    applyForce(force){
        this.acc.add(force)
    }

    seek(target){
        let desired = p5.Vector.sub(target, this.pos)
        desired.setMag(this.maxSpeed)
        let steer = p5.Vector.sub(desired, this.speed)
        steer.limit(this.maxForce)
        this.applyForce(steer)
    }

    show(){
        push()
        colorMode(HSB)
        fill(map(this.lookAhead, 0, 100, 0, 200), 100, 100)
        strokeWeight(0.5)
        stroke(0, 100)

        translate(this.pos.x, this.pos.y)
        rotate(this.vel.heading());
        triangle(-this.size, -this.size / 2, -this.size, this.size / 2, this.size, 0)
        pop()
    }
}

class Path{
    constructor(){
        this.radius = 20
        this.points = []
    }

    addPoint(x, y){
        this.points.push(createVector(x, y))
    }

    show(){
        push()
        stroke(180)
        strokeWeight(this.radius * 2)
        noFill()
        beginShape()
        for(let p of this.points) vertex(p.x, p.y)
        endShape()
        stroke(0)
        strokeWeight(1)
        beginShape()
        for(let p of this.points) vertex(p.x, p.y)
        endShape()
        fill(0)
        noStroke()
        ellipse(this.points[0].x, this.points[0].y, 10)
        ellipse(this.points[this.points.length-1].x, this.points[this.points.length-1].y, 10)
        pop()
    }
}
