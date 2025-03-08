class Creature{
    constructor(x, y){
        this.pos = createVector(x, y);
        this.angle = random(TWO_PI)
        this.w = 50
        this.h = 30
        this.speed = 1.5
        this.rotSpeed = 0.05

        //gx and gy are the goal points of the limbs (respective from the creature)
        //sx and sy are the start points of the limbs (respective from the creature)
        //x and y are the current points of the limbs (absolute coordinates)
        //maxDist is the maximum distance of the limb
        let xC = 25
        this.limbs = [
            {gx: 10, gy: -xC, x: 0, y: 0, maxDist: 20, sx: 20, sy: 0},
            {gx: 10, gy: xC, x: 0, y: 0, maxDist: 20, sx: 20, sy: 0},

            {gx: -10, gy: -xC, x: 0, y: 0, maxDist: 20, sx: 10, sy: 0},
            {gx: -10, gy: xC, x: 0, y: 0, maxDist: 20, sx: 10, sy: 0},

            {gx: -30, gy: -xC, x: 0, y: 0, maxDist: 20, sx: -10, sy: 0},
            {gx: -30, gy: xC, x: 0, y: 0, maxDist: 20, sx: -10, sy: 0},
        ] 
    }

    update(){
        this.followMouse()
        let vel = p5.Vector.fromAngle(this.angle).mult(this.speed)
        this.pos.add(vel)
        if(this.pos.x > width)  this.pos.x = 0
        if(this.pos.x < 0) this.pos.x = width
        if(this.pos.y > height) this.pos.y = 0
        if(this.pos.y < 0) this.pos.y = height
        this.updateLimbs()
    }

    followMouse(){
        let mouse = createVector(mouseX, mouseY)
        let dir = p5.Vector.sub(mouse, this.pos)
        let ang = dir.heading()
        let diff = ang - this.angle
        if (diff > PI) diff -= TWO_PI;
        if (diff < -PI) diff += TWO_PI;
        if (abs(diff) > 0.1){
            this.angle += diff * this.rotSpeed
        }

    }

    updateLimbs(){
        for(let limb of this.limbs){
            let realGoalX = this.pos.x + limb.gx * cos(this.angle) - limb.gy * sin(this.angle)
            let realGoalY = this.pos.y + limb.gx * sin(this.angle) + limb.gy * cos(this.angle)
            let limbX = limb.x
            let limbY = limb.y
            if(dist(realGoalX, realGoalY, limbX, limbY) > limb.maxDist){
                // limb.x = realGoalX
                // limb.y = realGoalY
                limb.x = lerp(limb.x, realGoalX, 0.7);
                limb.y = lerp(limb.y, realGoalY, 0.7);
            }
        }
    }

    showLimbs(){
        push()
        stroke(150)
        strokeWeight(3)
        for (let i = 0; i < this.limbs.length; i++){
            let limbX = this.limbs[i].sx
            let limbY = this.limbs[i].sy
            let x = this.pos.x + limbX * cos(this.angle) - limbY * sin(this.angle)
            let y = this.pos.y + limbX * sin(this.angle) + limbY * cos(this.angle)
            let endLimbX = this.limbs[i].x
            let endLimbY = this.limbs[i].y
            line(x, y, endLimbX, endLimbY)
        }
        pop()
    }

    showDistances(){
        push()
        stroke(255, 0, 0, 100)
        strokeWeight(3)
        for (let i = 0; i < this.limbs.length; i++){
            let limbX = this.limbs[i].gx
            let limbY = this.limbs[i].gy
            let x = this.pos.x + limbX * cos(this.angle) - limbY * sin(this.angle)
            let y = this.pos.y + limbX * sin(this.angle) + limbY * cos(this.angle)
            let endLimbX = this.limbs[i].x
            let endLimbY = this.limbs[i].y
            let red = map(dist(x, y, endLimbX, endLimbY), 0, this.limbs[i].maxDist, 0, 255)
            stroke(255, red, 0, 100)
            line(x, y, endLimbX, endLimbY)
        }
        pop()
    }

    showLimbsPos(){
        push()
        stroke(255, 20, 0, 100)
        strokeWeight(7)
        for (let i = 0; i < this.limbs.length; i++){
            let limbX = this.limbs[i].x
            let limbY = this.limbs[i].y
            point(limbX, limbY)
        }
        pop()
    }

    showGoalPoints(){
        push()
        stroke(20, 0, 255, 100)
        strokeWeight(7)
        //it has to take into account the angle of the creature
        for (let i = 0; i < this.limbs.length; i++){
            let goalPointX = this.limbs[i].gx
            let goalPointY = this.limbs[i].gy
            let x = this.pos.x + goalPointX * cos(this.angle) - goalPointY * sin(this.angle)
            let y = this.pos.y + goalPointX * sin(this.angle) + goalPointY * cos(this.angle)
            point(x, y)
        }
        pop()
    }

    showStartLimbsPos(){
        push()
        stroke(0, 255, 0, 100)
        strokeWeight(7)
        for (let i = 0; i < this.limbs.length; i++){
            let limbX = this.limbs[i].sx
            let limbY = this.limbs[i].sy
            let x = this.pos.x + limbX * cos(this.angle) - limbY * sin(this.angle)
            let y = this.pos.y + limbX * sin(this.angle) + limbY * cos(this.angle)
            point(x, y)
        }
        pop()
    }

    show(){
        this.showLimbs()
        push()
        rectMode(CENTER)
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)
        translate(-this.pos.x, -this.pos.y)
        fill(220)
        stroke(140)
        strokeWeight(3.5)
        rect(this.pos.x, this.pos.y, this.w, this.h, 9)
        pop()
        // this.showLimbs()
        // this.showStartLimbsPos()
    }
}