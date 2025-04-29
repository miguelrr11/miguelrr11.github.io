class Plot {
    constructor(x, y, title, lightCol, darkCol) {
        this.title = title
        this.lightCol = lightCol
        this.darkCol = darkCol
        this.transCol = [...lightCol, 100]
        this.permanentPressed = false
        this.func = undefined

        this.pos = createVector(x, y)
        this.hasTitle = title !== ''
        this.plotOffset = this.hasTitle ? 20 : 0
        this.plotPos = createVector(x, y + this.plotOffset)

        this.height = 80
        this.h = this.height - this.plotOffset
        this.w = width_elementsMIGUI
        this.plotMargin = 5
        this.midPointY = (this.plotPos.y + this.h - this.plotMargin + this.plotPos.y + this.plotMargin) * .5

        this.data = []
        this.history = []
        this.limitData = 3000
        this.limitHistory = 30000

        this.maxData = 0
        this.minData = 0
        this.maxDataH = 0
        this.minDataH = 0

        document.addEventListener('dblclick', () => {
            if (this.hovering()) this.permanentPressed = !this.permanentPressed
        })
    }

    setFunc(func) {
        this.func = func
    }

    reposition(x, y, w = this.w, h = this.height) {
        this.pos.set(x, y)
        this.plotPos.set(x, y + (this.hasTitle ? 20 : 0))
        this.w = w
        this.height = h
        this.h = h - (this.hasTitle ? 20 : 0)
        this.midPointY = (this.plotPos.y + this.h - this.plotMargin + this.plotPos.y + this.plotMargin) * .5
    }

    feed(n) {
        if (n === undefined || n === null || isNaN(n)) return
        this.data.push(n)
        this.history.push(n)

        if (this.data.length > this.limitData) this.data.shift()
        if (this.history.length > this.limitHistory) this.history.shift()

        this.maxData = max(this.data)
        this.minData = min(this.data)
        this.maxDataH = max(this.history)
        this.minDataH = min(this.history)
    }

    getSimpleInt(n) {
        if (n === 0) return "0";
        
        const absN = Math.abs(n);
    
        if (absN < 0.001) return n.toExponential(2); // Very tiny, use scientific notation
        if (absN < 1) return n.toFixed(4);            // Small decimals, show 4 digits
        if (absN < 1000) return Math.floor(n);
        if (absN < 1000000) return (n / 1000).toFixed(2) + "K";
        if (absN < 1000000000) return (n / 1000000).toFixed(2) + "M";
        
        return (n / 1000000000).toFixed(2) + "B";
    }

    //independientemente del length de values, se dibujara un maximo de limitData vertices
    drawCurve(values, minVal, maxVal) {
        stroke(this.lightCol);
        noFill();
        
        const midAux = (maxVal === minVal) ? this.midPointY : undefined;
        
        const len         = values.length;
        const MAX_VERTS   = this.limitData;                             
        const skip        = len > MAX_VERTS
            ? Math.ceil(len / MAX_VERTS)                        
            : 1;
        
        beginShape();
        for (let i = 0; i < len; i += skip) {
            const x = map(
                i,
                0, len - 1,
                this.plotPos.x + this.plotMargin,
                this.plotPos.x + this.w       - this.plotMargin
            );
        
            const y = (midAux !== undefined)
            ? midAux
            : map(
                values[i],
                minVal, maxVal,
                this.plotPos.y + this.h - this.plotMargin,
                this.plotPos.y +            this.plotMargin
                );
            vertex(x, y);
        }
        endShape();
    }
      

    showPlot() {
        this.drawCurve(this.data, this.minData, this.maxData)
    }

    showHistory() {
        this.drawCurve(this.history, this.minDataH, this.maxDataH)
    }

    hovering() {
        return mouseX > this.plotPos.x && mouseX < this.plotPos.x + this.w &&
               mouseY > this.plotPos.y && mouseY < this.plotPos.y + this.h
    }

    showLabels() {
        if (!this.hovering()) return

        push()
        const showHist = mouseIsPressed || this.permanentPressed
        const max = this.getSimpleInt(showHist ? this.maxDataH : this.maxData)
        const min = this.getSimpleInt(showHist ? this.minDataH : this.minData)
        const cur = this.getSimpleInt(this.data[this.data.length - 1])

        const textSizeUsed = text_SizeMIGUI - 3
        textSize(textSizeUsed)

        const h = textAscent() * 2 - 5
        const col = [...this.darkCol, 200]

        const xLabel = this.plotPos.x + this.w - textWidth(max) / 2 - 12

        const posMax = createVector(xLabel, this.plotPos.y + h)
        const posMin = createVector(xLabel, this.plotPos.y + this.h - h)

        const yCur = this.maxVal == this.minVal ? 
        this.midPointY : 
        map(cur, showHist ? this.minDataH : this.minData, showHist ? this.maxDataH : this.maxData, posMin.y, posMax.y)

        const posCur = createVector(xLabel, yCur)

        rectMode(CENTER)
        textAlign(CENTER, CENTER)

        const drawLabel = (txt, pos, bgCol) => {
            fill(bgCol)
            rect(pos.x, pos.y, textWidth(txt) + 20, h + 10, radMIGUI)
            fill(this.lightCol)
            text(txt, pos.x, pos.y)
        }

        drawLabel(max, posMax, col)
        drawLabel(min, posMin, col)
        drawLabel(cur, posCur, this.darkCol)
        pop()
    }

    show() {
        if (this.func) this.feed(this.func())

        push()
        strokeWeight(bordeMIGUI)

        if ((this.hovering() && mouseIsPressed) || this.permanentPressed) {
            this.showHistory()
        } else {
            this.showPlot()
        }

        noFill()
        stroke(this.lightCol)
        rect(this.plotPos.x, this.plotPos.y, this.w, this.h, radMIGUI)

        if (this.hasTitle) {
            noStroke()
            fill(this.lightCol)
            textAlign(LEFT, CENTER)
            textSize(text_SizeMIGUI - 1)
            text(this.title, this.pos.x, this.pos.y + 7)
        }
        pop()

        this.showLabels()
    }
}
