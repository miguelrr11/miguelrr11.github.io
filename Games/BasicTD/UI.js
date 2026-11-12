

class UI{
    constructor(game){
        this.game = game
        this.buttons = this.initButtons()
        this.selectedButton = undefined
    }

    initButtons(){
        let buttons = []
        let buttonAddCanon = {
            size: SIZE_CELL,
            tag: 'addCanon',
            pos: {x: 10 + SIZE_CELL/2, y: HEIGHT_UI/2},
            onClick: (tag) => this.game.doing(tag),       //action to execute when selecting the button
            onUnclick: () => this.game.doing(undefined),  //action  to execute when deselecting the button
            action: (x, y) => this.game.plantTower(x, y), //action to execute when this button is selected and there is a click elsewhere
            anim: 0
        }
        buttons.push(buttonAddCanon)

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
            }
        }
    }

    render(){
        push()
        rectMode(CENTER)
        stroke(0)
        strokeWeight(1.5)
        for(let b of this.buttons){
            if(this.selectedButton == b) fill(220)
            else noFill()

            b.anim = lerp(b.anim, 0, .5)

            square(b.pos.x, b.pos.y, b.size + b.anim*10)
            if(b.tag == 'addCanon') square(b.pos.x, b.pos.y, SIZE_CELL*.5)
        }
        pop()
    }
}