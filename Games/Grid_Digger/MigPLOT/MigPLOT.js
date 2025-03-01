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

        this.marginX = 37
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

    setScroll(amt){
        this.dataScroll = amt
    }

    feed(x){
        this.data.push(x)
        //remove the first element if the data array is too long
        if(this.data.length > this.dataScroll) this.data.shift()
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
        const max = this.maxGlobal != undefined ? this.maxGlobal : Math.max(...this.data)
        const min = this.minGlobal != undefined ? this.minGlobal : Math.min(...this.data)
        for(let i = 0; i < this.data.length; i++){
            let x, y
            let digit = this.data[i]
            y = mapp_PLOT(digit, min, max, this.p00.y, this.p01.y, true)
            x = mapp_PLOT(i, 0, this.data.length-1, this.p00.x, this.p10.x, true)
            this.dataX[i] = x
            this.dataY[i] = y
        }
        for(let i = 0; i < this.steps+1; i++){
            let y = mapp_PLOT(i, 0, this.steps, this.p00.y, this.p01.y, true)
            this.guidesY[i] = {y:0, data:0}
            this.guidesY[i].y = y
            this.guidesY[i].data = getRoundedValueMIGUI(mapp_PLOT(y, this.p00.y, this.p01.y, min, max, true))
            let x = mapp_PLOT(i, 0, this.steps, this.p00.x, this.p10.x, true)
            this.guidesX[i] = {x:0, data:0}
            this.guidesX[i].x = x
            this.guidesX[i].data = getRoundedValueMIGUI(mapp_PLOT(x, this.p00.x, this.p10.x, 0, this.nData, true))
        }
        this.lastGuide.y = this.dataY[this.nData-1]
        this.lastGuide.data = getRoundedValueMIGUI(this.data[this.nData-1])
    }

    drawPlot(){
        push();
        if(this.type == 'hist'){
            strokeWeight(2);
            noFill();
            stroke(this.graphCol);
            beginShape();
            curveVertex(this.dataX[0], this.dataY[0]);
            for(let i = 0; i < this.data.length; i++){
                curveVertex(this.dataX[i], this.dataY[i]);
            }
            curveVertex(this.dataX[this.data.length - 1], this.dataY[this.data.length - 1]);
            endShape();
        }
        else if(this.type == 'bar'){
            fill(this.graphCol);
            stroke(this.graphCol);
            let sp = (this.w - this.marginX * 2) / this.nData;
            this.data.forEach((_, i) => line(this.dataX[i], this.dataY[i], 
                                             this.dataX[i], this.p00.y));
        }
        pop();
    }
    

    resize(string){
        if(textWidth(string) > this.marginX){
            for(let i = 11; i > 0; i--){
                textSize(i)
                let w = textWidth(string)
                if(w < (this.marginX-10)) break
            }
        }
    }

    show(){
        

        push()
        textFont(this.font)
        textSize(12)
        

        //background
        fill(this.backCol)
        //noStroke()
        strokeWeight(2)
        stroke(this.graphCol)
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
            //this.resize(this.guidesY[i].data)
            let tx = formatLargeNumber(this.guidesY[i].data)
            this.resize(tx)
            text(tx, this.p00.x - 5, y)
            if(this.showX) text(tx, this.guidesX[i].x, this.p00.y + 10)
        }
        //horizontal guide for the last data
        textAlign(LEFT, CENTER)
        strokeWeight(1.5)
        stroke(this.axisCol)
        let y = this.lastGuide.y
        line(this.p00.x, y, this.p10.x, y)
        noStroke()
        stroke(this.graphCol)
        strokeWeight(.5)
        let tx = formatLargeNumber(this.lastGuide.data)
        this.resize(tx)
        text(tx, this.p10.x + 5, y)
        noStroke()

        //tags
        textSize(12)
        fill(this.graphCol)
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

function mapp_PLOT(value, start1, stop1, start2, stop2, withinBounds = false) {
    let mappedValue = start2 + ( (value - start1) / (stop1 - start1) ) * (stop2 - start2);
    
    if (withinBounds) {
        if (start2 < stop2) {
            mappedValue = Math.max(Math.min(mappedValue, stop2), start2);
        } else {
            mappedValue = Math.max(Math.min(mappedValue, start2), stop2);
        }
    }

    return mappedValue;
}

function formatLargeNumber(value) {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
  }