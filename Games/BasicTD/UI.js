

class UI{
    constructor(game){
        this.game = game
        this.buttons = this.initButtons()
        this.selectedButton = undefined
    }

    initButtons(){
        let buttons = []

        let baseHeight = HEIGHT_UI/2 - 10

        let a = 0.5
        let b = 1.75

        let buttonAddCanon = {
            size: SIZE_CELL,
            tag: 'addCanon',
            pos: {x: 10 + SIZE_CELL * (a + b * 2), y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            active: () => this.game.currentOre >= CANON_BASE_PRICE,
            anim: 0,
            subtitle: CANON_BASE_PRICE + CURRENCY_SYMBOL,
            hint: 'Add Cannon †'
        }
        buttons.push(buttonAddCanon)

        let buttonMiner = {
            size: SIZE_CELL,
            tag: 'addMiner',
            pos: {x: 10 + SIZE_CELL * (a + b * 1), y: baseHeight},
            anim: 0,
            onClick: (tag) => this.game.doing(tag),
            onUnclick: () => this.game.doing(undefined),
            action: (x, y) => this.game.plantTower(x, y),
            active: () => this.game.currentOre >= MINER_BASE_PRICE,
            subtitle: MINER_BASE_PRICE + CURRENCY_SYMBOL,
            hint: 'Add Miner'
        }
        buttons.push(buttonMiner)

        let buttonAddCrossBow = {
            size: SIZE_CELL,
            tag: 'addCrossBow',
            pos: {x: 10 + SIZE_CELL * (a + b * 3), y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            active: () => this.game.currentOre >= CROSSBOW_BASE_PRICE,
            anim: 0,
            subtitle: CROSSBOW_BASE_PRICE + CURRENCY_SYMBOL,
            hint: 'Add CrossBow'
        }
        buttons.push(buttonAddCrossBow)

        let buttonAddBomber = {
            size: SIZE_CELL,
            tag: 'addBomber',
            pos: {x: 10 + SIZE_CELL * (a + b * 4), y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            active: () => this.game.currentOre >= BOMBER_BASE_PRICE,
            anim: 0,
            subtitle: BOMBER_BASE_PRICE + CURRENCY_SYMBOL,
            hint: 'Add Bomber'
        }
        buttons.push(buttonAddBomber)

        let buttonAddPeaShooter = {
            size: SIZE_CELL,
            tag: 'addPeaShooter',
            pos: {x: 10 + SIZE_CELL * (a + b * 5), y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            active: () => this.game.currentOre >= PEA_SHOOTER_BASE_PRICE,
            anim: 0,
            subtitle: PEA_SHOOTER_BASE_PRICE + CURRENCY_SYMBOL,
            hint: 'Add Pea Shooter'
        }
        buttons.push(buttonAddPeaShooter)

        let buttonAddGenerator = {
            size: SIZE_CELL,
            tag: 'addGenerator',
            pos: {x: 10 + SIZE_CELL * (a + b * 0), y: baseHeight},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            active: () => this.game.currentOre >= GENERATOR_BASE_PRICE,
            anim: 0,
            subtitle: GENERATOR_BASE_PRICE + CURRENCY_SYMBOL,
            hint: 'Add Generator'
        }
        buttons.push(buttonAddGenerator)

        return buttons
    }

    deselectButton(){
        this.selectedButton = undefined
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
        strokeWeight(2)
        textAlign(CENTER)
        textSize(20)
        for(let b of this.buttons){
            if(this.selectedButton == b && b.active()) fill(220)
            else noFill()

            stroke(b.active() ? 0 : 200)

            b.anim = lerp(b.anim, 0, .5)

            square(b.pos.x, b.pos.y, b.size + (b.inBounds ? b.anim * 10 : 0))
            if(b.tag == 'addCanon') square(b.pos.x, b.pos.y, SIZE_CELL*.5)
            if(b.tag == 'addPeaShooter') square(b.pos.x, b.pos.y, SIZE_CELL*.35)
            if(b.tag == 'addMiner'){
                fill(COLOR_MINER)
                ellipse(b.pos.x, b.pos.y, SIZE_CELL*0.65)
                drawCross(b.pos.x, b.pos.y, SIZE_CELL*0.6)
            }
            if(b.tag == 'addCrossBow'){
                rect(b.pos.x, b.pos.y, SIZE_CELL*.55, SIZE_CELL*.25)
            }
            if(b.tag == 'addBomber'){
                circle(b.pos.x, b.pos.y, SIZE_CELL*.55)
            }
            if(b.tag == 'addGenerator'){
                fill(COLOR_ENERGY_CELL)
                ellipse(b.pos.x, b.pos.y, SIZE_CELL*0.65)
                let m = (SIZE_CELL*0.65)*.5
                arc(b.pos.x, b.pos.y-m*.5, m, m, -PI/2, PI/2)
                arc(b.pos.x, b.pos.y+m*.5, m, m, PI/2, -PI/2)
            }
            if(b.subtitle){
                push()
                noStroke()
                fill(b.active() ? 0 : 200)
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
        text(this.game.currentOre + CURRENCY_SYMBOL, WIDTH - 20, HEIGHT_UI*.5)
        pop()
    }
}