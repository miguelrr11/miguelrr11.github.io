

class Plot {
    constructor(x, y, title, nSeries, lightCol, darkCol) {
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

        this.showValueInTitle = false;

        this.height = 80;
        this.h = this.height - this.plotOffset;
        this.w = width_elementsMIGUI;
        this.plotMargin = 5;
        this.xStart = this.plotPos.x + this.plotMargin;
        this.xEnd = this.plotPos.x + this.w - this.plotMargin;
        this.yStart = this.plotPos.y + this.h - this.plotMargin;
        this.yEnd = this.plotPos.y + this.plotMargin;
        this.midY = (this.yStart + this.yEnd) * 0.5;

        this.series = new Array(nSeries).fill().map((_, i) => ({
            data: [],
            history: [],
            maxData: 0,
            minData: 0,
            maxDataH: 0,
            minDataH: 0,
            col: i == 0 ? lightCol : randomizeColorMIGUI(lightCol, 70)
        }));

        this.limitData = 500;
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
                for(let series of this.series) {
                    series.data = series.history.slice(-this.limitData);
                }
            }
            e.preventDefault();
        }, { passive: false });

        this.absMax = undefined
        this.absMin = undefined;
    }

    clear(){
        for(let i = 0; i < this.series.length; i++){
            this.series[i].data = [];
            this.series[i].history = [];
            this.series[i].maxData = 0;
            this.series[i].minData = 0;
            this.series[i].maxDataH = 0;
            this.series[i].minDataH = 0;
        }
        this.maxData = 0;
        this.minData = 0;
        this.maxDataH = 0;
        this.minDataH = 0;
    }

    setMaxMinAbs(max, min) {
        this.absMax = max;
        this.absMin = min;
    }

    setLimitData(limit) {
        this.limitData = constrain(limit, 10, 10000);
    }

    setColors(colors){
        for(let i = 0; i < this.series.length; i++){
            this.series[i].col = colors[i] || this.series[i].col;
        }
    }

    setFunc(func) {
        this.func = func;
    }

    reposition(x, y, w = this.w, h = this.height) {
        if (x != undefined) {
            this.pos.x = x;
        }
        if (y != undefined) {
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

        this.lastY = this.midY;
    }

    addSeries(){
        let nZeros = this.series[0].data.length;
        this.series.push({
            data: Array(nZeros).fill(undefined),
            history: Array(nZeros).fill(undefined),
            maxData: 0,
            minData: 0,
            maxDataH: 0,
            minDataH: 0,
            col: [this.lightCol[0] + Math.random() * 70, 
                  this.lightCol[1] + Math.random() * 70, 
                  this.lightCol[2] + Math.random() * 70]
        });
    }

    feed(n, idx = 0) {
        if (n == null || isNaN(n)) return;

        let series = this.series[idx];
        if (!series) return

        series.data.push(n);
        series.history.push(n);

        if (series.data.length > this.limitData) series.data.shift();
        if (series.history.length > this.limitHistory) series.history.shift();

        const { min: minData, max: maxData } = computeMinMax(series.data);
        series.minData = minData;
        series.maxData = maxData;

        const { min: minDataH, max: maxDataH } = computeMinMax(series.history);
        series.minDataH = minDataH;
        series.maxDataH = maxDataH;

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

    drawCurve(values, minVal, maxVal, col, showingHistory = false) {
        stroke(col);
        noFill();
    
        //const len = values.length;
        const len = showingHistory ? this.limitHistory : this.limitData;
        if (len === 0) return;
    
        const skip = len > this.whenSkip ? Math.ceil(len / this.whenSkip) : 1;
        const constantLine = maxVal === minVal;
    
        beginShape();
        for (let i = 0; i < len; i += skip) {
            if(values[i] == undefined) {
                endShape();
                beginShape();
                continue;
            }

            let x = mappMIGUI(i, 0, len - 1, this.xStart, this.xEnd);
            
            let val = constrainnMIGUI(values[i], minVal, maxVal);
            let y = constantLine
                ? this.midY
                : mappMIGUI(val, minVal, maxVal, this.yStart, this.yEnd);
            

            vertex(x, y);
            this.lastY = y
        }
        endShape();
    }
    

    showPlot() {
        this.maxData = this.absMax != undefined ? this.absMax : Math.max(...this.series.map(s => s.maxData));
        this.minData = this.absMin != undefined ? this.absMin : Math.min(...this.series.map(s => s.minData));
        for(let i = 0; i < this.series.length; i++) {
            let data = this.series[i].data;
            this.drawCurve(data, this.minData, this.maxData, this.series[i].col);
        }
    }

    showHistory() {
        this.maxDataH = this.absMax != undefined ? this.absMax : Math.max(...this.series.map(s => s.maxDataH));
        this.minDataH = this.absMin != undefined ? this.absMin : Math.min(...this.series.map(s => s.minDataH));
        for(let i = 0; i < this.series.length; i++) {
            let data = this.series[i].history;
            this.drawCurve(data, this.minDataH, this.maxDataH, this.series[i].col, true);
        }
    }

    hovering() {
        return mouseX > this.plotPos.x && mouseX < this.plotPos.x + this.w &&
               mouseY > this.plotPos.y && mouseY < this.plotPos.y + this.h;
    }

    showLabels() {
        if (!this.hovering()) return;
        let data = this.series[0].data;
        push();
        rectMode(CENTER);
        const showHist = mouseIsPressed || this.permanentPressed;
        const max = this.getSimpleInt(showHist ? this.maxDataH : this.maxData);
        const min = this.getSimpleInt(showHist ? this.minDataH : this.minData);
        const curVal = data[data.length - 1];
        const cur = this.getSimpleInt(curVal);

        const textSizeUsed = text_SizeMIGUI - 3;
        textSize(textSizeUsed);

        const h = textAscent() * 2 - 5;
        const bgCol = [this.darkCol[0], this.darkCol[1], this.darkCol[2], 200];
        const x = this.plotPos.x + this.w - textWidth(max) / 2 - 12;

        const yMax = this.plotPos.y + h;
        const yMin = this.plotPos.y + this.h - h;
        // const yCur = (this.maxData === this.minData)
        //     ? (yMin + yMax) / 2
        //     : mappMIGUI(curVal, showHist ? this.minDataH : this.minData,
        //                   showHist ? this.maxDataH : this.maxData,
        //                   yMin, yMax, true);
        const yCur = constrainn(this.lastY, yMax, yMin);

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

    feedZeroes() {
        //get the SERIES with the larget history, not the length, the array
        let maxHistory = this.series.reduce((max, series) => {
            return series.history.length > max.history.length ? series : max;
        }
        , this.series[0]);
        for(let i = 0; i < this.series.length; i++){
            let series = this.series[i];
            let len = series.history.length
            let rem = maxHistory.history.length - len;
            if (rem > 0) {
                for (let j = 0; j < rem; j++) {
                    series.history.push(undefined);
                }
            }
            series.data = series.history.slice(-series.data.length);
        }
    }

    show() {
        if (this.func) this.feed(this.func());
        this.feedZeroes()
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
            let title = this.showValueInTitle ? `${this.title}: ${this.getSimpleInt(this.series[0].data[this.series[0].data.length - 1])}` : this.title;
            text(title, this.pos.x, this.pos.y + 7);
        }
        pop();

        
        this.showLabels();

        let hoveringBounds = inBoundsMIGUI(mouseX, mouseY, this.pos.x, this.pos.y, this.w, this.h)
		this.readyToShow = false
		if(this.hoverText && hoveringBounds && !mouseIsPressed){
			this.hoveringCounter++
			if(this.hoveringCounter > HOVER_TIME_MIGUI){
				this.readyToShow = true
			}
		}
		else if(this.hoverText && (!hoveringBounds || mouseIsPressed)){
			this.hoveringCounter = 0
		}

		return hoveringBounds ? this : false
	}

	setHoverText(text){
		this.hoverText = text
		this.hoveringCounter = 0
		this.readyToShow = false
	}

	showHoveredText(){
		if(!this.readyToShow) return
		showHoveredTextMIGUI(this.hoverText, this.panel)
	}
}

function computeMinMax(array) {
    const filtered = array.filter(v => v !== undefined);
    return {
        min: this.absMin != undefined ? this.absMin : (filtered.length ? Math.min(...filtered) : undefined),
        max: this.absMax != undefined ? this.absMax : (filtered.length ? Math.max(...filtered) : undefined)
    };
}
