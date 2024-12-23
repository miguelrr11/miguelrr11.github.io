class Game{
    constructor(){
        this.grid = new Grid()
    }

    update(){
        this.grid.updateItems()
    }

    show(){
        this.grid.showBelts()
        this.grid.showItems()
        this.grid.showHoveredCell()
        this.grid.showBuildingFrom()
        this.showState()
    }

    showState(){
        push()
        fill(0)
        textSize(20)
        text("State: " + gameState, 10, 20)
        pop()
    }
}

function getCenteredXY(x, y){
    let i = floor(x / tamCell)
    let j = floor(y / tamCell)
    return createVector(i * tamCell + tamCell / 2, j * tamCell + tamCell / 2)
}