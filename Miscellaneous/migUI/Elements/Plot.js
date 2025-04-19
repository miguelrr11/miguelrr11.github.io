class Plot{
    constructor(x, y, title, lightCol, darkCol){
		this.darkCol = darkCol
		this.lightCol = lightCol
		this.transCol = [...lightCol, 100]
        this.pos = createVector(x, y)
        this.title = title
        this.plotPos = title == '' ? this.pos : createVector(x, y + 20)

        this.h = title == '' ? 100 : 100 - 20
        this.w = width_elementsMIGUI

        this.height = 100

        this.data = []
        this.history = []
        this.limitData = 250
        this.limitHistory = 10000
        this.maxData = 0
        this.minData = 0
        this.maxDataH = 0
        this.minDataH = 0

        this.plotMargin = 5

        this.func = undefined

        this.permanentPressed = false

        //bind the doubleClick function to a function that sets the value of this.permanentPressed to true
        document.addEventListener('dblclick', () => {
            if(this.hovering()) this.permanentPressed = !this.permanentPressed
        })
    }

    setFunc(func){
        this.func = func
    }

    reposition(x, y, w = undefined, h = undefined){
        this.pos = createVector(x, y)
        this.plotPos = this.title == '' ? this.pos : createVector(x, y + 20)
        this.w = w || this.w
        this.h = h || this.h
        this.height = h || this.height
    }

    feed(n){
        this.data.push(n)
        this.history.push(n)
        if(this.data.length > this.limitData){
            this.data.shift()
        }
        if(this.history.length > this.limitHistory){
            this.history.shift()
        }
        this.maxData = max(this.data)
        this.minData = min(this.data)
        this.maxDataH = max(this.history)
        this.minDataH = min(this.history)
    }

    showPlot(){
        stroke(this.lightCol)
        noFill()
        beginShape()
        for(let i = 0; i < this.data.length; i++){
            let x = map(i, 0, this.limitData, this.plotPos.x + this.plotMargin, this.plotPos.x + this.w - this.plotMargin)
            let y = map(this.data[i], this.minData, this.maxData, this.plotPos.y + this.h - this.plotMargin, this.plotPos.y + this.plotMargin)
            vertex(x, y)
        }
        endShape()
    }

    showHistory(){
        stroke(this.lightCol)
        noFill()
        beginShape()
        for(let i = 0; i < this.history.length; i++){
            let x = map(i, 0, this.history.length, this.plotPos.x + this.plotMargin, this.plotPos.x + this.w - this.plotMargin)
            let y = map(this.history[i], this.minDataH, this.maxDataH, this.plotPos.y + this.h - this.plotMargin, this.plotPos.y + this.plotMargin)
            vertex(x, y)
        }
        endShape()
    }

    hovering(){
        return (mouseX > this.plotPos.x && 
            mouseX < this.plotPos.x + this.w && 
            mouseY > this.plotPos.y && 
            mouseY < this.plotPos.y + this.h)
    }

    showLabels(){
        push()
        if(!this.hovering()) return
        let max = (mouseIsPressed || this.permanentPressed) ? this.maxDataH : this.maxData
        let min = (mouseIsPressed || this.permanentPressed) ? this.minDataH : this.minData
        let cur = this.data[this.data.length - 1]
        let curr = cur
        let col = [...this.darkCol, 200]
        max = max.toFixed(1)
        min = min.toFixed(1)
        cur = cur.toFixed(1)
        textSize(text_SizeMIGUI-3)
        let wmax = textWidth(max)/2
        let wmin = textWidth(min)/2
        let h = textAscent(max) * 2 - 5
        let posMax = createVector(this.plotPos.x + this.w - wmax - 12, this.plotPos.y + h)
        let posMin = createVector(this.plotPos.x + this.w - wmax - 12, this.plotPos.y + this.h - h)
        let y = (mouseIsPressed || this.permanentPressed) ? map(curr, this.minDataH, this.maxDataH, posMin.y, posMax.y) :
        map(curr, this.minData, this.maxData, posMin.y, posMax.y)
        let posCur = createVector(this.plotPos.x + this.w - wmax - 12, y)
        textAlign(CENTER, CENTER)
        rectMode(CENTER)
        noStroke()
        fill(col)
        rect(posMax.x, posMax.y, wmax + 20, h + 10, radMIGUI)
        fill(this.lightCol)
        text(max, posMax.x, posMax.y)
        fill(col)
        rect(posMin.x, posMin.y, wmin + 20, h + 10, radMIGUI)
        fill(this.lightCol)
        text(min, posMin.x, posMin.y)
        fill(this.darkCol)
        rect(posCur.x, posCur.y, wmax + 20, h + 10, radMIGUI)
        fill(this.lightCol)
        text(cur, posCur.x, posCur.y)
        pop()
    }

    show(){
        if(this.func) this.feed(this.func())
        push()
        strokeWeight(bordeMIGUI)
        if((this.hovering() && mouseIsPressed) || this.permanentPressed){
            this.showHistory()
        }
        else this.showPlot()
        noFill()
        stroke(this.lightCol)
        rect(this.plotPos.x, this.plotPos.y, this.w, this.h, radMIGUI)
        if(this.title != ''){
            noStroke()
            fill(this.lightCol)
            textAlign(LEFT, CENTER)
            textSize(text_SizeMIGUI-1)
            text(this.title, this.pos.x, this.pos.y + 7)
        }
        pop()
        this.showLabels()
    }
}