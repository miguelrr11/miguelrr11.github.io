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

        this.idCounter = 0

        this.showValueInTitle = true;

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
            id: this.idCounter++,
            data: [],
            history: [],
            maxData: 0,
            minData: 0,
            maxDataH: 0,
            minDataH: 0,
            col: i == 0 ? lightCol : randomizeColorMIGUI(lightCol, 70)
        }));

        this.ctx = null;          // set via setCtx(ctx)
        this._area = {
            dirty: true,
            // geometry & sampling
            n: 0,
            step: 1,
            xDec: new Float32Array(0), // decimated x pixels
            // per series y-bounds (pixel-space), decimated
            upY: [],   // Array<Float32Array>
            lowY: [],  // Array<Float32Array>
            // styles
            fills: [], // Array<string>
            // canvas mapping
            sy0: 0, syK: 1,
            // cache keys
            chartX: 0, chartY: 0, chartW: 0, chartH: 0,
            baseline: 0
        };


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

    markAreaDirty(){ this._area.dirty = true; }

    lock(){
        this.permanentPressed = true;
    }

    setShowValueInTitle(arg){
        this.showValueInTitle = arg;
    }

    removeSeries(id){
        this.series = this.series.filter(s => s.id !== id);
        this.markAreaDirty();
    }

    hasSeries(id){
        return this.series.some(s => s.id === id);
    }

    clear(deep = false){
        if(deep){
            this.series = []
            this.idCounter = 0;
        }
        else{
            for(let i = 0; i < this.series.length; i++){
                this.series[i].data = [];
                this.series[i].history = [];
                this.series[i].maxData = 0;
                this.series[i].minData = 0;
                this.series[i].maxDataH = 0;
                this.series[i].minDataH = 0;
            }
        }
        this._area = {
            dirty: true,
            // geometry & sampling
            n: 0,
            step: 1,
            xDec: new Float32Array(0), // decimated x pixels
            // per series y-bounds (pixel-space), decimated
            upY: [],   // Array<Float32Array>
            lowY: [],  // Array<Float32Array>
            // styles
            fills: [], // Array<string>
            // canvas mapping
            sy0: 0, syK: 1,
            // cache keys
            chartX: 0, chartY: 0, chartW: 0, chartH: 0,
            baseline: 0
        };
        this.maxData = 0;
        this.minData = 0;
        this.maxDataH = 0;
        this.minDataH = 0;
        this.markAreaDirty();
    }

    setMaxMinAbs(max, min) {
        this.absMax = max;
        this.absMin = min;
        this.markAreaDirty();
    }

    setLimitData(limit) {
        this.limitData = constrain(limit, 10, 10000);
        // mirror data windows immediately
        for (const s of this.series) {
        const dl = Math.min(this.limitData, s.history.length);
        s.data = s.history.slice(-dl);
        }
        this.markAreaDirty && this.markAreaDirty();
    }

    setColorIdx(colors, idx){
        let series = this.series.find(s => s.id === idx);
        if (series) {
            series.col = colors;
        }
        this.markAreaDirty();
    }


    setColors(colors){
        for(let i = 0; i < this.series.length; i++){
            this.series[i].col = colors[i] || this.series[i].col;
        }
        this.markAreaDirty();
    }

    setColorsMinMax(i1, i2){
        this.series[i1].col = '#ec7b86'
        this.series[i2].col = '#86ca78ff'
        this.markAreaDirty();
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
        this.markAreaDirty();
    }

    addSeries(colors){
        const maxHist = this.getMaxData(); // current global timeline length
        const dl = Math.min(this.limitData, maxHist);

        this.series.push({
            id: this.idCounter++,
            // match timeline length; new series contributes 0 until fed
            history: Array(maxHist),           // all undefined
            data: Array(dl),                   // all undefined
            maxData: 0, minData: 0, maxDataH: 0, minDataH: 0,
            col: colors ? colors : [
                this.lightCol[0] + Math.random() * 70,
                this.lightCol[1] + Math.random() * 70,
                this.lightCol[2] + Math.random() * 70
            ]
        });

        this.markAreaDirty && this.markAreaDirty();
    }


    feed(n, idx = 0) {
        if (n == null || isNaN(n)) return;

        let series = this.series.find(s => s.id === idx);
        if (!series) return

        let input = n > 100 ? Math.floor(n) : n;
        series.data.push(input);
        series.history.push(input);

        if (series.data.length > this.limitData) series.data.shift();
        //if (series.history.length > this.limitHistory) series.history.shift();

        const { min: minData, max: maxData } = computeMinMax(series.data);
        series.minData = minData;
        series.maxData = maxData;

        const { min: minDataH, max: maxDataH } = computeMinMax(series.history);
        series.minDataH = minDataH;
        series.maxDataH = maxDataH;
        this.markAreaDirty();
    }

    syncHistories_() {
        // 1) Bring all histories to the same length by appending placeholders on the RIGHT
        let maxLen = 0;
        for (const s of this.series) if (s.history.length > maxLen) maxLen = s.history.length;

        if (maxLen === 0) return;

        for (const s of this.series) {
        const rem = maxLen - s.history.length;
        if (rem > 0) {
            // Append 'rem' undefineds to represent missed frames (contribute 0 to stack)
            // eslint-disable-next-line no-sparse-arrays
            s.history.push(...Array(rem)); // undefineds
        }
        }

        // 2) If we exceed the global history cap, trim the FRONT uniformly for every series
        if (maxLen > this.limitHistory) {
        const cut = maxLen - this.limitHistory;
        for (const s of this.series) {
            if (cut > 0) s.history.splice(0, cut);
        }
        maxLen = this.limitHistory;
        }

        // 3) Keep 'data' windows mirrored from history (right-aligned)
        for (const s of this.series) {
            const dl = Math.min(this.limitData, s.history.length);
            s.data = s.history.slice(-dl);
        }

        // 4) If you use cached area geometry, mark dirty
        this.markAreaDirty && this.markAreaDirty();
    }


    getSimpleInt(n) {
        if(n == undefined || n == null || isNaN(n)) return 'N/A';
        if (n === 0) return "0";
        const abs = Math.abs(n);
        if (abs < 0.00001) return n.toExponential(4);
        if (abs < 0.001) return n.toFixed(4);
        if (abs < 1) return n.toFixed(2);
        if (abs < 1000) return Math.floor(n);
        if (abs < 1e6) return (n / 1e3).toFixed(2) + "K";
        if (abs < 1e9) return (n / 1e6).toFixed(2) + "M";
        return (n / 1e9).toFixed(2) + "B";
    }

    drawAreaChart(){
        const ctx = this.ctx;
        if (!ctx) return;

        const A = this._area;
        if (A.dirty) this.updateAreaCache(); // safety net

        const m = A.xDec.length;
        if (m === 0) return;

        const x = A.xDec;

        for (let s = 0; s < this.series.length; s++){
            const up = A.upY[s];
            const low = A.lowY[s];
            if (!up || !low) continue;

            ctx.beginPath();
            // forward: upper boundary
            ctx.moveTo(x[0], up[0]);
            for (let k = 1; k < m; k++) ctx.lineTo(x[k], up[k]);
            // backward: lower boundary
            for (let k = m - 1; k >= 0; k--) ctx.lineTo(x[k], low[k]);
            ctx.closePath();
                
            ctx.fillStyle = A.fills[s];
            ctx.fill();
        }
    }

    drawCurve(values, minVal, maxVal, col, showingHistory = false, firstSeries) {
        stroke(col);
        noFill();
    
        //const len = values.length;
        const len = showingHistory ? Math.min(this.getMaxData(), this.limitHistory) : this.limitData;
        if (len === 0) return;
    
        const skip = len > this.whenSkip ? Math.ceil(len / this.whenSkip) : 1;
        const constantLine = maxVal === minVal;
    
        beginShape();
        for (let i = 0; i < len; i += skip) {
            while(values[i] == undefined && i < len) {
                i += skip
            }
            if(values[i] == undefined) {
                endShape();
                beginShape();
                continue
            }

            let x = mappMIGUI(i, 0, len - 1, this.xStart, this.xEnd);
            
            let val = constrainnMIGUI(values[i], minVal, maxVal);
            let y = constantLine
                ? this.midY
                : mappMIGUI(val, minVal, maxVal, this.yStart, this.yEnd);
            

            vertex(x, y);
            if(firstSeries) this.lastY = y
        }
        endShape();
    }
    
    getMaxData(){
        let max = 0
        for(let serie of this.series){
            if(serie.history.length > max) max = serie.history.length;
        }
        return max
    }

    getMinData(){
        let min = Infinity
        for(let serie of this.series){
            if(serie.history.length < min) min = serie.history.length;
        }
        return min
    }

    showPlot() {
        this.maxData = this.absMax != undefined ? this.absMax : Math.max(...this.series.map(s => s.maxData));
        this.minData = this.absMin != undefined ? this.absMin : Math.min(...this.series.map(s => s.minData));
        if(this.isAreaChart){
            this.drawAreaChart(this.minData, this.maxData)
            return
        }
        for(let i = 0; i < this.series.length; i++) {
            let data = this.series[i].data;
            this.drawCurve(data, this.minData, this.maxData, this.series[i].col, false, i == 0);
        }
    }

    showHistory() {
        this.maxDataH = this.absMax != undefined ? this.absMax : Math.max(...this.series.map(s => s.maxDataH));
        this.minDataH = this.absMin != undefined ? this.absMin : Math.min(...this.series.map(s => s.minDataH));
        if(this.isAreaChart){
            this.drawAreaChart(this.minDataH, this.maxDataH)
            return
        }
        for(let i = 0; i < this.series.length; i++) {
            let data = this.series[i].history;
            this.drawCurve(data, this.minDataH, this.maxDataH, this.series[i].col, true, i == 0);
        }
    }

    hovering() {
        return mouseX > this.plotPos.x && mouseX < this.plotPos.x + this.w &&
               mouseY > this.plotPos.y && mouseY < this.plotPos.y + this.h;
    }

    showLabels() {
        if (!this.hovering() || this.isAreaChart) return;
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
            rect(x, y, textWidth(txt) + 8, h + 5, radMIGUI);
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

    update(){
        if (this.func) this.feed(this.func());
        //this.feedZeroes()
        this.syncHistories_();     
        if (this.isAreaChart) this.updateAreaCache();
    }

    updateAreaCache(){
        const A = this._area;
        if (!this.isAreaChart) return;

        const series = this.series;
        if (!series || series.length === 0) { A.dirty = false; return; }

        // geometry
        const chartX = this.plotPos.x;
        const chartY = this.plotPos.y;
        const chartW = this.w;
        const chartH = this.h;

        // detect geometry changes
        const geomChanged = (
            A.chartX !== chartX || A.chartY !== chartY ||
            A.chartW !== chartW || A.chartH !== chartH
        );

        // number of samples (ensure equalized by feedZeroes)
        const n = this.getMaxData();
        if (n <= 1) { A.dirty = false; return; }

        // ensure all series have same length
        for (let s = 0; s < series.length; s++){
        const h = series[s].history;
        if (!h || h.length !== n) return; // wait for feedZeroes next tick
        }

        // Recompute only if dirty or geometry changed
        if (!A.dirty && !geomChanged) return;

        // Compute stacked y-range
        const baseline = 0;
        let yMin = baseline;
        let yMax = baseline;

        // Allow hard clamps if provided
        // (Area chart uses baseline; absMin/absMax override if defined)
        // We'll still ensure range != 0
        if (this.absMax != null && !isNaN(this.absMax)) yMax = this.absMax;
        if (this.absMin != null && !isNaN(this.absMin)) yMin = this.absMin;

        if (this.absMax == null || this.absMin == null){
        // find column-wise sums for max if not fully clamped
        for (let i = 0; i < n; i++){
            let sum = baseline;
            for (let s = 0; s < series.length; s++){
                const v = series[s].history[i];
                sum += (v == null || isNaN(v)) ? 0 : v;
            }
            if (this.absMax == null && sum > yMax) yMax = sum;
        }
        }

        if (yMax === yMin) yMax = yMin + 1;

        // Adaptive decimation: keep vertices ~ min(w, whenSkip * 2)
        const targetVerts = Math.max(this.whenSkip, chartW|0);
        const step = Math.max(1, Math.ceil(n / targetVerts));
        const m = Math.ceil(n / step);

        // Precompute mapping
        const sy0 = chartY + chartH;
        const syK = chartH / (yMax - yMin);

        // Build decimated x pixels
        if (A.xDec.length !== m) A.xDec = new Float32Array(m);
        const dx = (n > 1) ? chartW / (n - 1) : 0;
        for (let k = 0, i = 0; k < m; k++, i += step){
            const ii = i < n ? i : (n - 1);
            A.xDec[k] = chartX + ii * dx;
        }

        // Prepare per-series y arrays
        A.upY.length = series.length;
        A.lowY.length = series.length;
        A.fills.length = series.length;

        // cumulative baseline at decimated samples
        let lower = new Float32Array(m);

        // helper: color to css string
        const toFill = (col) => {
        if (Array.isArray(col)) {
            const r = col[0]|0, g = col[1]|0, b = col[2]|0;
            const a = col.length > 3 ? (col[3] / 255) : 1;
            return `rgba(${r},${g},${b},${a})`;
        }
        return col || '#000';
        };

        for (let s = 0; s < series.length; s++){
        const hist = series[s].history;

        // allocate
        let up = A.upY[s];
        let low = A.lowY[s];
        if (!up || up.length !== m) up = A.upY[s] = new Float32Array(m);
        if (!low || low.length !== m) low = A.lowY[s] = new Float32Array(m);

        // fill y arrays in pixel space
        for (let k = 0, i = 0; k < m; k++, i += step){
            const ii = i < n ? i : (n - 1);
            const v = hist[ii];
            const vi = (v == null || isNaN(v)) ? 0 : v;

            const l = lower[k];
            const u = l + vi;

            low[k] = sy0 - (l - yMin) * syK;
            up[k]  = sy0 - (u - yMin) * syK;

            // advance cumulative baseline for next layers
            lower[k] = u;
        }

        // style
        A.fills[s] = toFill(series[s].col);
        }

        // store keys/state
        A.n = n;
        A.step = step;
        A.sy0 = sy0;
        A.syK = syK;
        A.chartX = chartX; A.chartY = chartY; A.chartW = chartW; A.chartH = chartH;
        A.baseline = baseline;

        A.dirty = false;
    }


    show() {
        push();

        let hasData = this.series.length > 0

        strokeWeight(bordeMIGUI);

        if (((this.hovering() && mouseIsPressed) || this.permanentPressed) && hasData) {
            this.showHistory();
        } 
        else if(hasData) {
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
            let title = this.showValueInTitle && hasData ? (this.isAreaChart ? 
                `${this.title}` : 
                `${this.title}: ${this.getSimpleInt(this.series[0].data[this.series[0].data.length - 1])}`) : this.title;
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
