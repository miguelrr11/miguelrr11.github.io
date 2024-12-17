const steps = 1000
const min = -10
const max = 10

const minRealX = 0
const maxRealX = WIDTH
const minRealY = HEIGHT
const maxRealY = 0

class Graph{
    constructor(expression){
        this.expression = expression
        this.adaptedExpression = adaptToX(expression)
        this.points = []
        this.calculatePoints()
        this.realPoints = []
        this.calculateRealPoints()
        this.col = "#ef476f"
    }

    calculatePoints(){
        const sizeStep = (Math.abs(min) + Math.abs(max)) / steps
        for(let i = 0; i < steps; i++){
            let y = min + i*sizeStep
            let val = min + i*sizeStep
            let x = getfx(this.adaptedExpression, val)
            if(x < min || x > max || y < min || y > max) continue
            let sep = false
            if(x*x + y*y > 100) sep = true
            else this.points.push({x: y, y: x, sep})
        }
    }

    calculateRealPoints(){
        for(let p of this.points){
            let x = mapp(p.x, min, max, minRealX, maxRealX)
            let y = mapp(p.y, min, max, minRealY, maxRealY)
            this.realPoints.push({x: x, y: y, sep: p.sep})
        }
    }

    // show(frameCount){
    //     push()
    //     stroke(this.col)
    //     strokeWeight(4)
    //     noFill()
    //     beginShape()
    //     let stop = frameCount % this.realPoints.length
    //     for(let i = 0; i < stop; i++){
    //         let p = this.realPoints[i] 
    //         if(p.sep){
    //             endShape()
    //             beginShape()
    //         }
    //         vertex(p.y, p.x)
    //     }
    //     endShape()
    //     pop()
    // }

    show(){
        push()
        stroke(this.col)
        strokeWeight(4)
        noFill()
        beginShape()
        for(let p of this.realPoints) vertex(p.x, p.y)
        endShape()
        pop()
    }

}

function showAxis(){
    push()
    strokeWeight(2)
    stroke(180)
    line(0, HEIGHT/2, WIDTH, HEIGHT/2)
    line(WIDTH/2, 0, WIDTH/2, HEIGHT)
    textSize(10)
    let sizeStepAxis = 1
    let stepsAxis = (Math.abs(min) + Math.abs(max)) / sizeStepAxis
    for(let i = 0; i < stepsAxis; i++){
        strokeWeight(2)
        stroke(180)
        fill(230)
        let realx = mapp(min+i*sizeStepAxis, min, max, minRealX, maxRealX)
        let realy = mapp(min+i*sizeStepAxis, min, max, minRealY, maxRealY)
        ellipse(realx, HEIGHT/2, 6)
        ellipse(WIDTH/2, realy, 6)
        noStroke()
        fill(100)
        textAlign(CENTER, TOP)
        if(i - stepsAxis/2 != 0) text(i - stepsAxis/2, realx, HEIGHT/2 - 20)
        textAlign(LEFT, CENTER)
        text(i - stepsAxis/2, WIDTH/2 + 10, realy)
    }
    pop()
}
