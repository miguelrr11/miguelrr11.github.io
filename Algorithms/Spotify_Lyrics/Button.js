const BASE_RAD_BUTTON = 12

class Button{
    constructor(pos, func){
        this.pos = pos
        this.func = func
        this.rad = BASE_RAD_BUTTON
        this.mult = 1
        this.cooldown = 0
        this.isBeingPressed = false
    }

    executeFunc(){
        let currentTime = millis()
        if(currentTime - this.cooldown > 200 && !this.isBeingPressed){ //200 ms cooldown
            this.func()
            this.cooldown = currentTime
            this.isBeingPressed = true
        }
    }

    hover(){
        return dist(mouseX, mouseY, this.pos.x, this.pos.y) < BASE_RAD_BUTTON
    }
}

class ButtonPlay extends Button{
    constructor(pos, func, funcState){
        super(pos, func)
        this.state = 'pause' // 'play', 'pause'
        this.funcState = funcState
    }

    setState(state){
        this.state = state
    }

    show(){
        if(!mouseIsPressed) this.isBeingPressed = false
        if(this.funcState()) this.setState('pause')
        else this.setState('play')
        if(this.hover()) this.mult = lerp(this.mult, 1.1, 0.25)
        else this.mult = lerp(this.mult, 1, 0.25)
        if(this.hover() && mouseIsPressed) this.executeFunc()
        let white = map(dist(mouseX, mouseY, this.pos.x, this.pos.y), 0, 100, 255, 100, true)
        if(this.state == 'play'){
            push()
            translate(this.pos.x, this.pos.y)
            stroke(white)
            strokeWeight(1)
            fill(white, map(this.mult, 1, 1.2, 0, 100))
            ellipse(0, 0, this.rad * 2 * this.mult, this.rad * 2 * this.mult)
            fill(white, 200)
            let lengthSideTriangle = this.rad * 0.4 * this.mult
            triangle(-lengthSideTriangle/2, -lengthSideTriangle * Math.sqrt(3)/2, -lengthSideTriangle/2, lengthSideTriangle * Math.sqrt(3)/2, lengthSideTriangle, 0)
            pop()
        }
        else if(this.state == 'pause'){
            push()
            translate(this.pos.x, this.pos.y)
            stroke(white)
            strokeWeight(1)
            fill(white, map(this.mult, 1, 1.2, 0, 100))
            ellipse(0, 0, this.rad * 2 * this.mult, this.rad * 2 * this.mult)
            fill(white, 200)
            let widthBar = this.rad * 0.2 * this.mult
            let heightBar = this.rad * 0.6 * this.mult
            rectMode(CENTER)
            rect(-widthBar, 0, widthBar, heightBar)
            rect(widthBar, 0, widthBar, heightBar)
            pop()
        }
    }
}

class ButtonNext extends Button{
    constructor(pos, func){
        super(pos, func)
    }

    show(){
        if(!mouseIsPressed) this.isBeingPressed = false
        if(this.hover()) this.mult = lerp(this.mult, 1.1, 0.25)
        else this.mult = lerp(this.mult, 1, 0.25)
        if(this.hover() && mouseIsPressed) this.executeFunc()
        let white = map(dist(mouseX, mouseY, this.pos.x, this.pos.y), 0, 100, 255, 100, true)
        push()
        translate(this.pos.x, this.pos.y)
        stroke(white)
        strokeWeight(1)
        fill(white, map(this.mult, 1, 1.2, 0, 100))
        ellipse(0, 0, this.rad * 2 * this.mult, this.rad * 2 * this.mult)
        translate(this.rad * 0.1 * this.mult, 0)
        fill(white, 200)
        let lengthSideTriangle = this.rad * 0.4 * this.mult 
        triangle(-lengthSideTriangle, -lengthSideTriangle * Math.sqrt(3)/2, -lengthSideTriangle, lengthSideTriangle * Math.sqrt(3)/2, 0, 0)
        rectMode(CENTER)
        rect(lengthSideTriangle/2, 0, this.rad * 0.12 * this.mult, this.rad * 0.7 * this.mult)
        pop()
    }
}