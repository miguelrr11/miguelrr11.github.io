class MigPLOT{
    constructor(x, y, w, h, data = []){
        this.x = x
        this.y = y
        this.h = h
        this.w = w
        this.backCol = "#fdf0d5"
        this.darkCol = "#003049"
        this.midCol = "#669bbc"
        this.lightCol = "#c1121f"
        this.font = loadFont("mono.ttf")
        this.data = data

        this.marginX = 40
        this.marginY = 30

        this.dataX = []
        this.dataY = []

        this.guidesY = []
        this.guidesX = []
        this.lastGuide = {y: undefined, data: undefined}
        this.steps = 4

        this.nData = this.data.length

        this.showX = false

        //(0,0)
        this.p00 = createVector(this.x + this.marginX, this.y + this.h - this.marginY)
        //(0,1)
        this.p01 = createVector(this.x + this.marginX, this.y + this.marginY)
        //(1,0)
        this.p10 = createVector(this.x + this.w - this.marginX, this.y + this.h - this.marginY)

        this.update()
    }

    feed(x){
        this.data.push(x)
        this.update()
    }


    //calcula coordenadas para dibujar
    update(){
        this.nData = this.data.length
        const max = Math.max(...this.data)
        const min = Math.min(...this.data)
        for(let i = 0; i < this.data.length; i++){
            let x, y
            let digit = this.data[i]
            y = mapp(digit, min, max, this.p00.y, this.p01.y)
            x = mapp(i, 0, this.data.length, this.p00.x, this.p10.x)
            this.dataX[i] = x
            this.dataY[i] = y
        }
        let step = Math.floor(max / 5)
        for(let i = 0; i < this.steps+1; i++){
            let y = mapp(i*step, 0, step*this.steps, this.p00.y, this.p01.y)
            this.guidesY[i] = {y:0, data:0}
            this.guidesY[i].y = y
            this.guidesY[i].data = getRoundedValueMIGUI(mapp(y, this.p00.y, this.p01.y, min, max))
            let x = mapp(i*step, 0, step*this.steps, this.p00.x, this.p10.x)
            this.guidesX[i] = {x:0, data:0}
            this.guidesX[i].x = x
            this.guidesX[i].data = getRoundedValueMIGUI(mapp(x, this.p00.x, this.p10.x, 0, this.nData))
        }
        this.lastGuide.y = this.dataY[this.nData-1]
        this.lastGuide.data = getRoundedValueMIGUI(this.data[this.nData-1])
    }

    show(){
        push()
        textFont(this.font)

        //background
        fill(this.backCol)
        rect(this.x, this.y, this.w, this.h)

        //horizontal guides
        strokeWeight(1)
        stroke(180)
        fill(this.midCol)
        textAlign(RIGHT, CENTER)
        for(let i = 0; i < this.guidesY.length; i++){
            let y = this.guidesY[i].y
            stroke(180)
            line(this.p00.x, y, this.p10.x, y)
            noStroke()
            text(this.guidesY[i].data, this.p00.x - 5, y)
            if(this.showX) text(this.guidesX[i].data, this.guidesX[i].x, this.p00.y + 10)
        }
        //horizontal guide for the last data
        strokeWeight(1.5)
        stroke(180)
        let y = this.lastGuide.y
        line(this.p00.x, y, this.p10.x, y)
        noStroke()
        text(this.lastGuide.data, this.p00.x - 5, y)

        //axis
        stroke(this.midCol)
        strokeWeight(3)
        line(this.p00.x, this.p00.y, this.p01.x, this.p01.y)
        line(this.p00.x, this.p00.y, this.p10.x, this.p10.y)

        //plot
        noFill()
        stroke(this.lightCol)
        beginShape()
        this.data.forEach((_, i) => vertex(this.dataX[i], this.dataY[i]));
        endShape()

        

        pop()
    }
}

function getRoundedValueMIGUI(value){
	if(Math.abs(value) < 1) return round(value, 2)
	if(Math.abs(value) < 10) return round(value, 1)
	return round(value)
}