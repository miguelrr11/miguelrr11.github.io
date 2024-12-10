class MigPLOT{
    constructor(x, y, w, h, data = [], tagX = "", tagY = ""){
        this.x = x
        this.y = y
        this.h = h
        this.w = w
        this.backCol = "#274c77"
        this.axisCol = "#6096ba"
        this.graphCol = "#e7ecef"
        this.textCol = "#a3cef1"
        this.font = loadFont("MigPLOT/mono.ttf")
        this.data = data

        this.marginX = 35
        this.marginY = 30

        this.dataX = []
        this.dataY = []

        this.guidesY = []
        this.guidesX = []
        this.lastGuide = {y: undefined, data: undefined}
        this.steps = 4

        this.tagX = tagX
        this.tagY = tagY

        this.nData = this.data.length

        this.showX = false
        this.type = 'hist'

        //(0,0)
        this.p00 = createVector(this.x + this.marginX, this.y + this.h - this.marginY)
        //(0,1)
        this.p01 = createVector(this.x + this.marginX, this.y + this.marginY)
        //(1,0)
        this.p10 = createVector(this.x + this.w - this.marginX, this.y + this.h - this.marginY)

        this.maxGlobal = undefined
        this.minGlobal = undefined
        this.dataLimit = 500

        this.update()
        
    }

    feed(x){
        this.data.push(x)
        this.update()
    }

    clear(){
        this.data = []
        this.dataX = []
        this.dataY = []
        this.guidesY = []
        this.guidesX = []
        this.lastGuide = {y: undefined, data: undefined}
    }

    compressData(){
        let compressedData = []
        const max = Math.max(...this.data)
        const min = Math.min(...this.data)
        for(let i = 0; i < this.data.length-1; i += 2){
            let avg = (this.data[i] + this.data[i+1]) * 0.5
            if(this.data[i] == max || this.data[i+1] == max) avg = max
            if(this.data[i] == min || this.data[i+1] == min) avg = min
            compressedData.push(avg)
        }
        this.data = compressedData
    }


    //calcula coordenadas para dibujar
    update(){
        if(this.data.length > this.dataLimit) this.compressData()
        this.nData = this.data.length
        const max = this.maxGlobal ? this.maxGlobal : Math.max(...this.data)
        const min = this.minGlobal ? this.minGlobal : Math.min(...this.data)
        for(let i = 0; i < this.data.length; i++){
            let x, y
            let digit = this.data[i]
            y = mapp(digit, min, max, this.p00.y, this.p01.y)
            x = mapp(i, 0, this.data.length, this.p00.x, this.p10.x)
            this.dataX[i] = x
            this.dataY[i] = y
        }
        let step = 1
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

    drawPlot(){
        push()
        if(this.type == 'hist'){
            strokeWeight(2)
            noFill()
            stroke(this.graphCol)
            beginShape()
            this.data.forEach((_, i) => vertex(this.dataX[i], this.dataY[i]));
            endShape()
        }
        else if(this.type == 'bar'){
            fill(this.graphCol)
            stroke(this.graphCol)
            let sp = (this.w - this.marginX * 2) / this.nData
            this.data.forEach((_, i) => line(this.dataX[i], this.dataY[i], 
                                             this.dataX[i], this.p00.y));
            // this.data.forEach((_, i) => rect(this.dataX[i], this.dataY[i], 
            //                                  sp, this.p00.y-this.dataY[i]));
        }
        pop()
    }

    show(){
        

        push()
        textFont(this.font)
        textSize(12)

        //background
        fill(this.backCol)
        noStroke()
        rect(this.x, this.y, this.w, this.h)

        //horizontal guides
        strokeWeight(1)
        stroke(180)
        fill(this.textCol)
        textAlign(RIGHT, CENTER)
        for(let i = 0; i < this.guidesY.length; i++){
            let y = this.guidesY[i].y
            stroke(this.textCol)
            line(this.p00.x, y, this.p10.x, y)
            noStroke()
            text(this.guidesY[i].data, this.p00.x - 5, y)
            if(this.showX) text(this.guidesX[i].data, this.guidesX[i].x, this.p00.y + 10)
        }
        //horizontal guide for the last data
        strokeWeight(1.5)
        stroke(this.axisCol)
        let y = this.lastGuide.y
        line(this.p00.x, y, this.p10.x, y)
        noStroke()
        stroke(this.graphCol)
        strokeWeight(.5)
        text(this.lastGuide.data, this.p00.x - 5, y)
        noStroke()

        //tags
        textAlign(CENTER, BOTTOM)
        text(this.tagX, this.x + this.w*.5, this.p01.y - 10)
        textAlign(CENTER, TOP)
        text(this.tagY, this.p10.x, this.p00.y + 10)

        //axis
        stroke(this.axisCol)
        strokeWeight(3)
        line(this.p00.x, this.p00.y, this.p01.x, this.p01.y)
        line(this.p00.x, this.p00.y, this.p10.x, this.p10.y)

        //plot
        this.drawPlot()

        pop()
    }
}

function getRoundedValueMIGUI(value){
	if(Math.abs(value) < 1) return round(value, 2)
	if(Math.abs(value) < 10) return round(value, 1)
	return round(value)
}