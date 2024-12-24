class Game{
    constructor(){
        this.grid = new Grid()
    }

    update(){
        this.grid.updateItems()
        this.grid.updateItemSources()
        this.grid.requestItemBelts()
    }

    show(){
        this.grid.showBelts()
        this.grid.showBeltItems()
        this.grid.showItemSources()
        this.grid.showHoveredCell()
        //this.grid.showBuildingFrom()
        this.showState()
        //this.grid.showConnecections()
    }

    showState(){
        push()
        fill(0)
        textSize(20)
        switch (gameState) {
            case 0:
                text("State: Building", 10, 20)
                break;
            case 1:
                text("State: Deleting", 10, 20)
                break;
            case 2:
                text("State: Furnace", 10, 20)
                break;
        }
        pop()
    }
}

function getCenteredXY(x, y){
    let i = floor(x / tamCell)
    let j = floor(y / tamCell)
    return createVector(i * tamCell + tamCell / 2, j * tamCell + tamCell / 2)
}

//returns relative position of item within belt 
function getPosItem(direction, relTravel) {
    let traveled = relTravel * tamCell;
    let auxDir = direction.length === 1 
        ? direction 
        : (relTravel < 0.5 ? direction.charAt(0) : direction.charAt(1));

    switch (auxDir) {
        case 'N':
            return [tamCell / 2, tamCell - traveled];
        case 'E':
            return [traveled, tamCell / 2];
        case 'S':
            return [tamCell / 2, traveled];
        case 'W':
            return [tamCell - traveled, tamCell / 2];
    }
}
