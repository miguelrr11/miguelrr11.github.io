

class Plot {
    constructor(x, y, title, lightCol, darkCol) {
        this.title = title;
        this.lightCol = lightCol;
        this.darkCol = darkCol;
        this.transCol = [...lightCol, 100];
        this.transCol2 = [...lightCol, 30];
        this.permanentPressed = false;
        this.func = undefined;

        this.hasTitle = title !== '';
        this.plotOffset = this.hasTitle ? 20 : 0;
        this.pos = { x, y };
        this.plotPos = { x, y: y + this.plotOffset };

        this.height = 80;
        this.h = this.height - this.plotOffset;
        this.w = width_elementsMIGUI;
        this.plotMargin = 5;
        this.xStart = this.plotPos.x + this.plotMargin;
        this.xEnd = this.plotPos.x + this.w - this.plotMargin;
        this.yStart = this.plotPos.y + this.h - this.plotMargin;
        this.yEnd = this.plotPos.y + this.plotMargin;
        this.midY = (this.yStart + this.yEnd) * 0.5;

        this.data = [];
        this.history = [];
        this.limitData = 3000;
        this.limitHistory = 15000;
        this.whenSkip = 300

        this.maxData = 0;
        this.minData = 0;
        this.maxDataH = 0;
        this.minDataH = 0;

        document.addEventListener('dblclick', () => {
            if (this.hovering()) this.permanentPressed = !this.permanentPressed;
        });

        document.addEventListener('wheel', (e) => {
            if (this.hovering()) {
                this.limitData = constrain(this.limitData * (e.deltaY < 0 ? 1.1 : 0.9), 10, 10000);
                this.data = this.history.slice(-this.limitData);
            }
            e.preventDefault();
        }, { passive: false });
    }

    setFunc(func) {
        this.func = func;
    }

    reposition(x, y, w = this.w, h = this.height) {
        if (x != undefined && y != undefined) {
            this.pos.x = x;
            this.pos.y = y;
        }
        this.hasTitle = this.title !== '';
        this.plotOffset = this.hasTitle ? 20 : 0;
        this.plotPos.x = this.pos.x;
        this.plotPos.y = this.pos.y + this.plotOffset;
        this.w = w;
        this.height = h;
        this.h = h - this.plotOffset;
        this.xStart = this.plotPos.x + this.plotMargin;
        this.xEnd = this.plotPos.x + this.w - this.plotMargin;
        this.yStart = this.plotPos.y + this.h - this.plotMargin;
        this.yEnd = this.plotPos.y + this.plotMargin;
        this.midY = (this.yStart + this.yEnd) * 0.5;
    }

    feed(n) {
        if (n == null || isNaN(n)) return;
        this.data.push(n);
        this.history.push(n);

        if (this.data.length > this.limitData) this.data.shift();
        if (this.history.length > this.limitHistory) this.history.shift();

        this.maxData = Math.max(...this.data);
        this.minData = Math.min(...this.data);
        this.maxDataH = Math.max(...this.history);
        this.minDataH = Math.min(...this.history);
    }

    getSimpleInt(n) {
        if (n === 0) return "0";
        const abs = Math.abs(n);
        if (abs < 0.001) return n.toExponential(2);
        if (abs < 1) return n.toFixed(4);
        if (abs < 1000) return Math.floor(n);
        if (abs < 1e6) return (n / 1e3).toFixed(2) + "K";
        if (abs < 1e9) return (n / 1e6).toFixed(2) + "M";
        return (n / 1e9).toFixed(2) + "B";
    }

    drawCurve(values, minVal, maxVal) {
        stroke(this.lightCol);
        noFill();
    
        const len = values.length;
        if (len === 0) return;
    
        const skip = len > this.whenSkip ? Math.ceil(len / this.whenSkip) : 1;
        const constantLine = maxVal === minVal;
    
        beginShape();
        for (let i = 0; i < len; i += skip) {
            let x = mappMIGUI(i, 0, len - 1, this.xStart, this.xEnd);
    
            let avg = 0;
            if (constantLine) {
                avg = 0; // irrelevant
            } else {
                let count = 0;
                for (let j = i; j < i + skip && j < len; j++) {
                    avg += values[j];
                    count++;
                }
                avg /= count;
            }
    
            let y = constantLine
                ? this.midY
                : mappMIGUI(avg, minVal, maxVal, this.yStart, this.yEnd);
    
            vertex(x, y);
        }
        endShape();
    }
    

    showPlot() {
        this.drawCurve(this.data, this.minData, this.maxData);
    }

    showHistory() {
        this.drawCurve(this.history, this.minDataH, this.maxDataH);
    }

    hovering() {
        return mouseX > this.plotPos.x && mouseX < this.plotPos.x + this.w &&
               mouseY > this.plotPos.y && mouseY < this.plotPos.y + this.h;
    }

    showLabels() {
        if (!this.hovering()) return;

        push();
        rectMode(CENTER);
        const showHist = mouseIsPressed || this.permanentPressed;
        const max = this.getSimpleInt(showHist ? this.maxDataH : this.maxData);
        const min = this.getSimpleInt(showHist ? this.minDataH : this.minData);
        const curVal = this.data[this.data.length - 1];
        const cur = this.getSimpleInt(curVal);

        const textSizeUsed = text_SizeMIGUI - 3;
        textSize(textSizeUsed);

        const h = textAscent() * 2 - 5;
        const bgCol = [...this.darkCol, 200];
        const x = this.plotPos.x + this.w - textWidth(max) / 2 - 12;

        const yMax = this.plotPos.y + h;
        const yMin = this.plotPos.y + this.h - h;
        const yCur = (this.maxData === this.minData)
            ? (yMin + yMax) / 2
            : map(curVal, showHist ? this.minDataH : this.minData,
                          showHist ? this.maxDataH : this.maxData,
                          yMin, yMax);

        const drawLabel = (txt, y, bg) => {
            fill(bg);
            rect(x, y, textWidth(txt) + 20, h + 10, radMIGUI);
            fill(this.lightCol);
            textAlign(CENTER, CENTER);
            text(txt, x, y);
        };

        drawLabel(max, yMax, bgCol);
        drawLabel(min, yMin, bgCol);
        drawLabel(cur, yCur, this.darkCol);
        pop();
    }

    show() {
        if (this.func) this.feed(this.func());

        push();
        strokeWeight(bordeMIGUI);

        if ((this.hovering() && mouseIsPressed) || this.permanentPressed) {
            this.showHistory();
        } else {
            this.showPlot();
        }

        noFill();
        stroke(this.lightCol);
        rect(this.plotPos.x, this.plotPos.y, this.w, this.h, radMIGUI);

        fill(this.transCol2);
        noStroke();
        const off = 3.5;
        rect(this.plotPos.x + off, this.plotPos.y + off, this.w - off * 2, this.h - off * 2, radMIGUI);

        if (this.hasTitle) {
            noStroke();
            fill(this.lightCol);
            textAlign(LEFT, CENTER);
            textSize(text_SizeMIGUI - 1);
            text(this.title, this.pos.x, this.pos.y + 7);
        }
        pop();

        this.showLabels();
    }
}
