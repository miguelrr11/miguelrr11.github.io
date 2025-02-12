class Timeline_UI{
    constructor(){
        this.x = 0
        this.y = 1050
        this.w = 1410
        this.h = 30

        this.w_frame = 25

        this.frames = [{canvas: undefined}]

        this.hovering = undefined
        this.selected = 0
        this.coolDownKey = 10
    }

    checkExistingCanvas(){
        if(this.frames[this.selected].canvas == undefined){
            this.frames[this.selected].canvas = initCanvas()
        }
    }

    paint(i, j){
        let canvas = this.frames[this.selected].canvas
        for(let b = 0; b < brush.length; b++) {
            let pixelBrush = brush[b]
            let x = i + pixelBrush[0],
                y = j + pixelBrush[1]
            if(x >= cols || y >= rows || x < 0 || y < 0) continue
            canvas[x][y] = curColor
        }
    }

    clear(){
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
        if(this.selected != undefined) this.frames.splice(this.selected+1, 0, {canvas: undefined})
        else this.frames.push({canvas: undefined})
    }

    update(){
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
            if(keyCode == RIGHT_ARROW) this.selected = constrain(this.selected+1, 0, this.frames.length-1)
            if(keyCode == LEFT_ARROW) this.selected = constrain(this.selected-1, 0, this.frames.length-1)
            this.coolDownKey = 10
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

    show_canvas(){
        push()
        translate(0, 0)
        noStroke()
        fill(col_light)
        let canvas = this.frames[this.selected].canvas
        rect(0, 0, WIDTH_canvas, HEIGHT_canvas)
        if(canvas == undefined){
            pop()
            return
        }
        else{
            for(let i = 0; i < cols; i++){
                for(let j = 0; j < rows; j++){
                    if(canvas[i][j] != 0){
                        canvas[i][j] == 1 ? fill(col_dark) : canvas[i][j] == 2 ? fill(col_medium) : fill(col_light)
                        rect(i*tamCell, j*tamCell, tamCell, tamCell)
                    }
                }
            }
        }
        pop()
    }

    show_timeline(){
        push()
        strokeWeight(2)
        translate(this.x, this.y)
        stroke(col_dark)
        fill(col_light)
        rect(0, 0, this.w, this.h)

        push()
        for(let i = 0; i < this.frames.length; i++){
            //rect of frame
            if(this.hovering == i) fill(col_light_medium)
            else fill(col_medium)
            if(this.selected == i){ 
                strokeWeight(4)
                fill(col_dark_medium)
            }
            else strokeWeight(2)
            stroke(col_dark)
            rect(0, 0, this.w_frame, this.h)

            //circle of frame
            push()
            if(this.frames[i].canvas == undefined) noFill()
            else fill(col_dark)
            strokeWeight(1.5)
            ellipse(this.w_frame/2, this.h/2, this.w_frame/2)
            pop()

            //for next frame
            translate(this.w_frame, 0)
        }
        pop()

        pop()
    }
}