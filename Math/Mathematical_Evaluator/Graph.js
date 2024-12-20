let steps = 10000
let min = -11
let max = 11

const margin = 0
const jump_thresh = 0.26
const jump_thresh2 = 0.008

const minRealX = 0
const maxRealX = WIDTH
const minRealY = HEIGHT
const maxRealY = 0

let variables = new Map()
let sliders = new Map()

class Graph{
    constructor(expression, col){
        this.expression = expression
        //this.adaptedExpression = rearrangeEquation(adaptToX(expression))
        this.adaptedExpression = (adaptToVariable(expression, 'x')) 
        let [left, right] = this.adaptedExpression.split('=');
        //this.adaptedExpression = left
        this.adaptedExpression = right
        this.variables = setVariables(this.adaptedExpression) //this.variables are the varioables in the expression
        if(variables.size > 0){ 
            this.createSliders()
            this.adaptToVariables()
            this.feedInitialValuesToVariables()
        }
        console.log(this.adaptedExpression)
        this.points = []
        this.calculatePoints()
        this.realPoints = []
        this.calculateRealPoints()
        this.col = col
    }

    createSliders(){
        let i = 0
        variables.forEach((value, key) => {
            if (!sliders.has(key)) {
                sliders.set(key, panel.createSlider(-10, 10, 1, key, true, () => {
                    variables.set(key, sliders.get(key).getValue())
                    graphs.forEach(graph => {
                        if (graph.graph.variables.has(key) && graph.cb.isChecked()) {
                            graph.graph.update()
                        }
                    })
                }))
            }
            i++
        });
    }

    feedInitialValuesToVariables(){
        this.feeded = this.adaptedExpression
        variables.forEach((value, key) => {
            this.feeded = feedVar(this.feeded, value.toString(), key)
        });
    }

    adaptToVariables(){
        variables.forEach((value, key) => {
            this.adaptedExpression = adaptToVariable(this.adaptedExpression, key)
        });
    }

    update(){
        this.feedInitialValuesToVariables()
        this.points = []
        this.calculatePoints()
        this.realPoints = []
        this.calculateRealPoints()
    }

    // calculatePoints(){
    //     const sizeStep = (Math.abs(min) + Math.abs(max)) / steps
    //     let prevx = undefined
    //     for(let i = 0; i < steps; i++){
    //         let y = min + i*sizeStep
    //         let val = min + i*sizeStep
    //         let feededXexpr = feedX(this.adaptedExpression, val)
    //         let x = newtonRaphson(0, feededXexpr)
    //         if(x == null) break
    //         if(prevx == undefined) prevx = x
    //         if(x < min - margin || x > max + margin || y < min - margin || y > max + margin) this.points.push({x: y, y: x, sep: true})
    //         else{ 
    //             let sep = Math.abs(prevx - x) > jump_thresh
    //             this.points.push({x: y, y: x, sep})
    //         }
    //         prevx = x
    //     }
    //     //this.separatePoints()
    // }

    calculatePoints(){
        let minCP = min
        let maxCP = max
        const sizeStep = ((Math.abs(minCP) + Math.abs(maxCP)) / steps) 
        let expre = this.variables.size > 0 ? this.feeded : this.adaptedExpression
        let prevx = undefined
        let prevy = undefined
        for(let i = 0; i < steps; i++){
            let y = minCP + i*sizeStep
            let x = getfx(expre, y)
            let diff = Math.abs(prevx - x)
            if(prevx == undefined) prevx = x
            if(prevy == undefined) prevy = y
            if(x < minCP - margin || x > maxCP + margin || y < minCP - margin || y > maxCP + margin) {}
            else{ 
                let sep = diff > jump_thresh || x == NaN
                this.points.push({x: y, y: x, sep})
            }
            prevx = x
            prevy = y
            if(diff < jump_thresh2 && !animating) i += mapp(diff, 0.0001, jump_thresh2, 1, 3)
        }
        console.log(this.points.length)
        //this.separatePoints()
    }

    separatePoints(){
        for(let i = 0; i < this.realPoints.length-1; i++){
            let p1 = this.realPoints[i]
            let p2 = this.realPoints[i+1]
            if(squaredDistance(p1.x, p1.y, p2.x, p2.y) > jump_thresh*jump_thresh){
                this.points[i].sep = true
            }
        }
    }

    calculateRealPoints(){
        for(let p of this.points){
            let x = mapp(p.x, min, max, minRealX, maxRealX)
            let y = mapp(p.y, min, max, minRealY, maxRealY)
            this.realPoints.push({x, y, sep: p.sep})
        }
        this.separatePoints()
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
        // stroke(this.col)
        // strokeWeight(3)
        // noFill()
        // strokeCap(ROUND)
        // beginShape()
        // for(let i = 0; i < this.realPoints.length; i++){
        //     let p = this.realPoints[i] 
        //     if(p.sep || (this.realPoints[i+1] && this.realPoints[i+1].sep) || (this.realPoints[i-1] && this.realPoints[i-1].sep)){
        //         endShape()
        //         beginShape()
        //     }
        //     vertex(p.x, p.y)
        // }
        // endShape()
        fill(this.col)
        strokeWeight(2)
        stroke(this.col)
        let stop = animating ? (frameCount*30) % this.realPoints.length : this.realPoints.length
        for(let i = 0; i < stop; i++){ 
            let p = this.realPoints[i]
            point(p.x, p.y, 3)
        }
        pop()
    }

}

function showAxis(){
    this.showGrid()
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
        ellipse(realx, HEIGHT/2, 5)
        ellipse(WIDTH/2, realy, 5)
        noStroke()
        fill(130)
        textAlign(CENTER, TOP)
        if(i - stepsAxis/2 != 0) text(i - stepsAxis/2, realx, HEIGHT/2 - 20)
        textAlign(LEFT, CENTER)
        text(i - stepsAxis/2, WIDTH/2 + 10, realy)
    }
    pop()
}

function showGrid(){
    push()
    strokeWeight(1)
    stroke(210)
    let sizeStepAxis = 1
    let stepsAxis = (Math.abs(min) + Math.abs(max)) / sizeStepAxis
    for(let i = 0; i < stepsAxis; i++) line(mapp(min+i*sizeStepAxis, min, max, minRealX, maxRealX), 0,
                                            mapp(min+i*sizeStepAxis, min, max, minRealX, maxRealX), HEIGHT)
    for(let i = 0; i < stepsAxis; i++) line(0, mapp(min+i*sizeStepAxis, min, max, minRealY, maxRealY),
                                            WIDTH, mapp(min+i*sizeStepAxis, min, max, minRealY, maxRealY))
    pop()
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2
}

function getStepSize(){
    let distance = Math.abs(max - min)  
    return Math.ceil(distance / 20)
}

function setVariables(input) {
    const variableRegex = /[A-Z]/g;
    const localVars = new Map();

    input.match(variableRegex)?.forEach(variable => {
        if (!variables.has(variable)) {
            variables.set(variable, '1');
        }
        localVars.set(variable, variables.get(variable));
    });

    return localVars;
}
