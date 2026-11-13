

class UI{
    constructor(game){
        this.game = game
        this.buttons = this.initButtons()
        this.selectedButton = undefined
    }

    initButtons(){
        let buttons = []

        let baseHeight = HEIGHT_UI/2 - 10

        let buttonAddCanon = {
            size: SIZE_CELL,
            tag: 'addCanon',
            pos: {x: 10 + (SIZE_CELL)*2, y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            anim: 0,
            subtitle: CANON_BASE_PRICE,
            hint: 'Add Cannon'
        }
        buttons.push(buttonAddCanon)

        let buttonMiner = {
            size: SIZE_CELL,
            tag: 'addMiner',
            pos: {x: 10 + SIZE_CELL/2, y: baseHeight},
            anim: 0,
            onClick: (tag) => this.game.doing(tag),
            onUnclick: () => this.game.doing(undefined),
            action: (x, y) => this.game.plantTower(x, y),
            subtitle: MINER_BASE_PRICE,
            hint: 'Add Miner'
        }
        buttons.push(buttonMiner)

        let buttonAddCrossBow = {
            size: SIZE_CELL,
            tag: 'addCrossBow',
            pos: {x: 10 + SIZE_CELL*0.5 + (SIZE_CELL)*3, y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            anim: 0,
            subtitle: CROSSBOW_BASE_PRICE,
            hint: 'Add CrossBow'
        }
        buttons.push(buttonAddCrossBow)

        let buttonAddBomber = {
            size: SIZE_CELL,
            tag: 'addBomber',
            pos: {x: 10 + SIZE_CELL + (SIZE_CELL)*4, y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            anim: 0,
            subtitle: BOMBER_BASE_PRICE,
            hint: 'Add Bomber'
        }
        buttons.push(buttonAddBomber)

        return buttons
    }

    click(x, y){
        if(y < HEIGHT_SCENE){
            this.game.clickAction(x, y)
            return
        }
        let actualX = x
        let actualY = y - HEIGHT_SCENE
        for(let b of this.buttons){
            let m = b.size * .5
            if(inBounds(actualX, actualY, b.pos.x-m, b.pos.y-m, b.size, b.size)){
                if(this.selectedButton == b){
                    this.selectedButton = undefined
                    if(b.onUnclick) b.onUnclick()
                }
                else {
                    this.selectedButton = b
                    if(b.onClick) b.onClick(b.tag)
                }
                break
            }
        }

    }

    update(){
        let actualX = mouseX
        let actualY = mouseY - HEIGHT_SCENE
        for(let b of this.buttons){
            let m = b.size * .5
            if(inBounds(actualX, actualY, b.pos.x-m, b.pos.y-m, b.size, b.size)){
                b.anim = 1
                b.inBounds = true
            }
            else b.inBounds = false
        }
    }

    render(){
        push()
        rectMode(CENTER)
        stroke(0)
        strokeWeight(2)
        textAlign(CENTER)
        textSize(20)
        for(let b of this.buttons){
            if(this.selectedButton == b) fill(220)
            else noFill()

            b.anim = lerp(b.anim, 0, .5)

            square(b.pos.x, b.pos.y, b.size + (b.inBounds ? b.anim * 10 : 0))
            if(b.tag == 'addCanon') square(b.pos.x, b.pos.y, SIZE_CELL*.5)
            if(b.tag == 'addMiner'){
                ellipse(b.pos.x, b.pos.y, SIZE_CELL*0.65)
                drawCross(b.pos.x, b.pos.y, SIZE_CELL*0.6)
            }
            if(b.tag == 'addCrossBow'){
                rect(b.pos.x, b.pos.y, SIZE_CELL*.55, SIZE_CELL*.25)
            }
            if(b.tag == 'addBomber'){
                circle(b.pos.x, b.pos.y, SIZE_CELL*.55)
            }
            if(b.subtitle){
                push()
                noStroke()
                fill(0)
                text(b.subtitle, b.pos.x, b.pos.y + b.size + 5)
                pop()
            }
    
        }

        for(let b of this.buttons){
            if(b.inBounds && b.hint){
                push()
                translate(0, -HEIGHT_SCENE)
                noStroke()
                fill(0)
                textSize(15)
                let bbox = textFont().textBounds(b.hint, mouseX+5, mouseY-5)
                fill(0)
                rectMode(CORNER)
                rect(bbox.x-3, bbox.y-3, bbox.w+6, bbox.h+6)
                fill(255)
                text(b.hint, mouseX+5, mouseY-5)
                pop()
            }
        }

        fill(0)
        noStroke()
        textSize(40)
        textAlign(RIGHT, CENTER)
        text(this.game.currentOre, WIDTH - 20, HEIGHT_UI*.5)
        pop()
    }
}