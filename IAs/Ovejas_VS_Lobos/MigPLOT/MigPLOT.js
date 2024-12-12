class MigPLOT{
    constructor(x, y, w, h, data = [], tagX = "", tagY = ""){
        this.x = x
        this.y = y
        this.h = h
        this.w = w
        this.backCol = "#495057"
        this.axisCol = "#ced4da"
        this.graphCol1 = "#e5e5e5"
        this.graphCol2 = "#fca311"
        this.textCol = "#ced4da"
        this.font = loadFont("MigPLOT/mono.ttf")
        //this.data = data

        this.marginX = 37
        this.marginY = 30

        this.nData = data[0] ? data[0].length : data[1].length
        this.tagX = tagX
        this.tagY = tagY
        this.guidesX = []
        this.guidesY = []

        if(data[0] != undefined){
            this.graph1 = {
                data : data[0],
                dataX : [],
                dataY : [],
                lastGuide : {y: undefined, data: undefined},
                col: this.graphCol1
            }
        }
        

        if(data[1] != undefined){
            this.graph2 = {
                data : data[1],
                dataX : [],
                dataY : [],
                lastGuide : {y: undefined, data: undefined},
                col: this.graphCol2
            }
        }
        

        this.steps = 4

        this.showX = false
        this.type = 'bar'

        //(0,0)
        this.p00 = createVector(this.x + this.marginX, this.y + this.h - this.marginY)
        //(0,1)
        this.p01 = createVector(this.x + this.marginX, this.y + this.marginY)
        //(1,0)
        this.p10 = createVector(this.x + this.w - this.marginX, this.y + this.h - this.marginY)

        this.maxGlobal = undefined
        this.minGlobal = undefined
        this.dataLimit = 500

        this.both = this.graph2 != undefined

        if(this.graph1) this.update(this.graph1)
        if(this.graph2) this.update(this.graph2)
        
    }

    feed(val1 = undefined, val2 = undefined){
        if(val1 != undefined) this.graph1.data.push(val1)
        if(val2 != undefined) this.graph2.data.push(val2)
        if(this.graph1) this.update(this.graph1)
        if(this.graph2) this.update(this.graph2)
    }

    clear(graph){
        graph.data = []
        graph.dataX = []
        graph.dataY = []
        this.guidesY = []
        this.guidesX = []
        graph.lastGuide = {y: undefined, data: undefined}
    }

    //todo
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

    computeMaxBothGraphs(){
        if(this.graph2 && this.graph1) return Math.max(Math.max(...this.graph1.data), Math.max(...this.graph2.data))
        if(this.graph1) return Math.max(...this.graph1.data)
        return Math.max(...this.graph2.data)
    }

    computeMinBothGraphs(){
        if(this.graph2 && this.graph1) return Math.min(Math.min(...this.graph1.data), Math.min(...this.graph2.data))
        if(this.graph1) return Math.min(...this.graph1.data)
        return Math.min(...this.graph2.data)
    }


    //calcula coordenadas para dibujar
    update(graph){
        //if(this.data.length > this.dataLimit) this.compressData()
        if(this.graph1) this.nData = this.graph1.data.length
        if(this.graph2) this.nData = this.graph2.data.length
        const max = this.maxGlobal ? this.maxGlobal : this.computeMaxBothGraphs()
        const min = this.minGlobal ? this.minGlobal : this.computeMinBothGraphs()
        for(let i = 0; i < this.nData; i++){
            let x, y
            let digit =  graph.data[i]
            y = mapp_PLOT(digit, min, max, this.p00.y, this.p01.y, true)
            x = mapp_PLOT(i, 0, this.nData-1, this.p00.x, this.p10.x, true)
            graph.dataX[i] = x
            graph.dataY[i] = y
        }
        this.updateGuides()
    }

    updateGuides(){
        const max = this.maxGlobal ? this.maxGlobal : this.computeMaxBothGraphs()
        const min = this.minGlobal ? this.minGlobal : this.computeMinBothGraphs()
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
        if(this.graph1){
            this.graph1.lastGuide.y = this.graph1.dataY[this.nData-1]
            this.graph1.lastGuide.data = getRoundedValueMIGUI(this.graph1.data[this.nData-1])
        }
        if(this.graph2){
            this.graph2.lastGuide.y = this.graph2.dataY[this.nData-1]
            this.graph2.lastGuide.data = getRoundedValueMIGUI(this.graph2.data[this.nData-1])
        }
    }

    drawPlot(graph){
        push()
        strokeWeight(2)
        noFill()
        stroke(graph.col)
        beginShape()
        graph.data.forEach((_, i) => vertex(graph.dataX[i], graph.dataY[i]));
        endShape()
        pop()
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

    drawLastGuide(graph){
        textAlign(LEFT, CENTER)
        strokeWeight(1.5)
        stroke(this.axisCol)
        let y = graph.lastGuide.y
        line(this.p00.x, y, this.p10.x, y)
        noStroke()
        stroke(graph.col)
        strokeWeight(.5)
        let tx = formatLargeNumber(graph.lastGuide.data)
        this.resize(tx)
        text(tx, this.p10.x + 5, y)
        noStroke()
    }

    drawGuides(){
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
        if(this.graph1) this.drawLastGuide(this.graph1)
        if(this.graph2) this.drawLastGuide(this.graph2)
    }

    show(){
        

        push()
        textFont(this.font)
        textSize(12)
        

        //background
        fill(this.backCol)
        //noStroke()
        strokeWeight(2)
        stroke(this.textCol)
        rect(this.x, this.y, this.w, this.h)

        
        this.drawGuides()
        

        //tags
        textSize(12)
        fill(this.axisCol)
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
        if(this.graph1) this.drawPlot(this.graph1)
        if(this.graph2) this.drawPlot(this.graph2)

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