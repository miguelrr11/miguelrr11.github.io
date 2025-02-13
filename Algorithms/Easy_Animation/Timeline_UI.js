class Timeline_UI{
    constructor(){
        this.x = 15
        this.y = 1000
        this.w = 1410
        this.h = 35

        this.w_frame = 20

        this.frames = this.initFrames()

        this.hovering = undefined
        this.selected = 0
        this.coolDownKey = 10

        this.playing = false
        this.fps = 8
        this.fpf = Math.round((1/this.fps) * 60)    //frames of draw per frame of timeline
    }

    initFrames(){
        let frames = []
        for(let i = 0; i < 5; i++){
            frames.push({canvas: undefined, prevCanvas: undefined, undoStack: []})
        }
        return frames
    }

    undo(){
        let frame = this.frames[this.selected]
        if(frame.undoStack.length == 0) return
        frame.canvas = frame.undoStack.pop()
    }

    pushToUndoStack(bool = false){
        let frame = this.frames[this.selected]
        if(!frame.prevCanvas) return
        if(!sameCanvas(frame.canvas, frame.prevCanvas) || bool){
            if(frame.undoStack.length > 25) frame.undoStack.shift()
            frame.undoStack.push(JSON.parse(JSON.stringify(frame.prevCanvas)))
        }
    }

    setFps(fps){
        this.fps = fps
        this.fpf = Math.round((1/this.fps) * 60)
    }

    setPrevCanvas(){
        let frame = this.frames[this.selected]
        if(!frame.canvas) return
        frame.prevCanvas = JSON.parse(JSON.stringify(frame.canvas))
    }

    duplicate(){
        this.addFrame()
        this.frames[this.selected+1].canvas = JSON.parse(JSON.stringify(this.frames[this.selected].canvas))
        this.frames[this.selected+1].prevCanvas = JSON.parse(JSON.stringify(this.frames[this.selected].prevCanvas))
    }

    play(){
        this.playing = !this.playing
    }

    checkExistingCanvas(){
        if(this.frames[this.selected].canvas == undefined){
            this.frames[this.selected].canvas = initCanvas()
            this.frames[this.selected].prevCanvas = initCanvas()
            this.frames[this.selected].undoStack.push(initCanvas())
        }
    }

    paint(i, j) {
        let canvas = this.frames[this.selected].canvas;
      
        for (let b = 0; b < brush.length; b++) {
            let pixelBrush = brush[b];
            let x = i + pixelBrush[0],
                y = j + pixelBrush[1];
            if (x >= cols || y >= rows || x < 0 || y < 0) continue;
        
            if (shade === 0) {
                canvas[x][y] = curColor;
            } 
            else {
                let threshold = shadeThresholds[shade]
                if (bayerMatrix[x % 4][y % 4] < threshold) canvas[x][y] = curColor;
                else {
                    if(curColor != 3) canvas[x][y] = 3;
                }
            }
        }
    }
      

    clear(){
        this.pushToUndoStack(true)
        this.frames[this.selected].canvas = undefined
    }

    removeFrame(){
        if(this.frames.length == 1) return  //at least one frame
        if(this.selected != undefined){ 
            this.frames.splice(this.selected, 1)
            this.selected = constrain(this.selected, 0, this.frames.length-1)
            if(this.frames.length == 0) this.selected = undefined
        }
        else{
            this.frames.pop()
            this.selected = constrain(this.selected, 0, this.frames.length-1)
            if(this.frames.length == 0) this.selected = undefined
        }
    }

    addFrame(){
        if(this.selected != undefined) this.frames.splice(this.selected+1, 0, 
            {canvas: undefined, prevCanvas: undefined, undoStack: []}
        )
        else this.frames.push( {canvas: undefined, prevCanvas: undefined, undoStack: []})
    }

    copy(){
        copyPasteBuffer = JSON.stringify(this.frames[this.selected].canvas)
    }
    
    paste(){
        if(copyPasteBuffer != undefined) this.frames[this.selected].canvas = JSON.parse(copyPasteBuffer)
    }

    previousFrame(){
        this.selected--
        if(this.selected < 0) this.selected = this.frames.length - 1
    }

    nextFrame(){
        this.selected++
        this.selected = this.selected % this.frames.length
    }


    update(){
        if(painting) return
        this.hovering = undefined
        if(mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h){
            let x = this.x
            for(let i = 0; i < this.frames.length; i++){
                if(mouseX > x && mouseX < x + this.w_frame){
                    this.hovering = i
                    break
                }
                x += this.w_frame
            }
        }
        if(mouseIsPressed){
            if(this.hovering != undefined) this.selected = this.hovering
        }
        if(keyIsPressed && this.coolDownKey < 0){
            if(keyCode == RIGHT_ARROW) this.nextFrame()
            else if(keyCode == LEFT_ARROW) this.previousFrame()
            this.coolDownKey = 5
        }
        this.coolDownKey--
    }

    showHoveredCell(){
        if(inBoundsCanvas()){
            let i = floor(mouseX / tamCell)
            let j = floor(mouseY / tamCell)
            push()
            noStroke()
            fill(0, 100)
            let radius = (brshSizeSel.getValue() + 1) * tamCell; 
            ellipse(i * tamCell + tamCell / 2, j * tamCell + tamCell / 2, radius * 2, radius * 2);
            pop()
        }
    }
// no, atras, adelante, atras 2, adelante 2, atras y adelante, todos
// 0,   1,       2,        3,       4,              5,           6
    show(){
        fill(col_light)
        rect(0, 0, WIDTH_canvas, HEIGHT_canvas)
        loadPixels()
        buf = new Uint32Array(pixels.buffer);
        if(!this.playing && onionOption != 0){
            if(onionOption == 3 || onionOption == 6) this.show_canvas(-2)
            if(onionOption == 4 || onionOption == 6) this.show_canvas(2)
            if(onionOption == 1 || onionOption == 3 || onionOption == 5 || onionOption == 6) this.show_canvas(-1)
            if(onionOption == 2 || onionOption == 4 || onionOption == 5 || onionOption == 6) this.show_canvas(1)
        }
        this.show_canvas(0)
        updatePixels()
    }

    show_canvas(layer) {
        let index = this.selected + layer;
        if (index < 0 || index >= this.frames.length) return;
      
        if (this.playing && frameCount % this.fpf === 0) {
          this.selected = (this.selected + 1) % this.frames.length;
          index = this.selected;
        }
      
        const canvas = this.frames[index].canvas;
        if (!canvas) return;
      
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const cellVal = canvas[i][j];
                if (cellVal === 0 || cellVal === 3) continue;
                
                if(layer != 0 && (this.frames[this.selected].canvas != undefined) && 
                (this.frames[this.selected].canvas[i][j] == 2 || 
                this.frames[this.selected].canvas[i][j] == 1)) continue
        
                let col;
                if (layer === 0) {
                col = (cellVal === 1)
                    ? col_dark_RGB
                    : (cellVal === 2)
                    ? col_medium_RGB
                    : col_light_RGB;
                } else if (layer === 1) {
                col = col_layer1_RGB;
                } else if (layer === -1) {
                col = col_layern1_RGB;
                } else {
                col = [155, 155, 155];
                }

                drawFastRect(i * tamCell, j * tamCell, tamCell, tamCell, col[0], col[1], col[2]);
            }
        }
    }



    show_timeline(){
        push()
        strokeWeight(2)
        translate(this.x, this.y)
        stroke(col_dark)
        fill(col_light)
        rect(-15, -30, this.w+15, this.h+75)
        strokeWeight(4)
        line(-15, 0, this.w, 0)
        line(-15, this.h, this.w, this.h)
        line(120, this.h, 120, this.h + 100)
        line(260, this.h, 260, this.h + 100)
        line(345, this.h, 345, this.h + 100)
        line(455, this.h, 455, this.h + 100)
        line(585, this.h, 585, this.h + 100)
        line(660, this.h, 660, this.h + 100)
        line(915, this.h, 915, this.h + 100)
        line(1070, this.h, 1070, this.h + 100)
        line(1148, this.h, 1148, this.h + 100)
        line(1255, this.h, 1255, this.h + 100)
        strokeWeight(2)
        textSize(17)
        textAlign(CENTER, CENTER)

        push()
        for(let i = 0; i < this.frames.length; i++){
            //rect of frame
            if(this.hovering == i) fill(col_light_medium)
            else fill(col_medium)
            stroke(col_dark)
            rect(0, 0, this.w_frame, this.h)

            //circle of frame
            push()
            if(this.frames[i].canvas == undefined) noFill()
            else fill(col_dark)
            strokeWeight(1.5)
            ellipse(this.w_frame/2, this.h*0.66, this.w_frame/2)
            pop()

            //text
            if(i % 5 == 0){
                push()
                stroke(col_dark_medium)
                strokeWeight(.8)
                fill(col_dark_medium)
                text(i, this.w_frame/2, -16)
                pop()
            }

            //for next frame
            translate(this.w_frame, 0)
        }
        pop()

        translate(this.selected * this.w_frame, 0)
        noFill()
        strokeWeight(4)
        noFill()
        rect(0, 0, this.w_frame, this.h)

        pop()
    }
}