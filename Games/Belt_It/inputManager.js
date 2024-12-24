let gameState = 0    //0 = nothing or buildingFrom, 1 = deleting, 2: building furnace
//state 1:
let buildingFrom = undefined
let prevBelt = undefined
let firstBelt = undefined

function mouseReleased(){
    if(gameState == 0){
        buildingFrom = undefined
        prevBelt = undefined
        firstBelt = true
    }
}

function mousePressed(){
    if(gameState == 1){
        game.grid.deleteBelt(mouseX, mouseY)
        game.grid.deleteTransformer(mouseX, mouseY)
    }
    if(gameState == 2){
        game.grid.createFurnace(mouseX, mouseY)
    }
}

function mouseDragged(){
    if(gameState == 0){
        if(!buildingFrom){
            buildingFrom = getCenteredXY(mouseX, mouseY)
            prevBelt = game.grid.getBelt(mouseX, mouseY)
        }
        let posBuildingNow = getCenteredXY(mouseX, mouseY)
        if(dist(buildingFrom.x, buildingFrom.y, posBuildingNow.x, posBuildingNow.y) > tamCell/2){
            let dir
            let deltaX = abs(mouseX - buildingFrom.x)
            let deltaY = abs(mouseY - buildingFrom.y)
            if(deltaX > deltaY){
                if(mouseX > buildingFrom.x) dir = 'E'
                else dir = 'W'
            }
            else{
                if(mouseY >  buildingFrom.y) dir = 'S'
                else dir = 'N'
            }
            if(prevBelt){
                let prevDir = prevBelt.direction
                if(dir == 'N' && (prevDir == 'E' || prevDir == 'W')){
                    prevBelt.direction = prevDir + dir
                }
                if(dir == 'E' && (prevDir == 'N' || prevDir == 'S')){
                    prevBelt.direction = prevDir + dir
                }
                if(dir == 'S' && (prevDir == 'E' || prevDir == 'W')){
                    prevBelt.direction = prevDir + dir
                }
                if(dir == 'W' && (prevDir == 'N' || prevDir == 'S')){
                    prevBelt.direction = prevDir + dir
                }
            }
            let susituyendo = game.grid.getBelt(mouseX, mouseY)
            if(susituyendo) susituyendo = susituyendo.nextBelt
            //if(susituyendo) susituyendo.direction = dir
            // if(!firstBelt){
            //     firstBelt = game.grid.createBelt(buildingFrom.x, buildingFrom.y, dir)
            //     prevBelt = firstBelt
            // }
            // if(game.grid.getBelt(mouseX, mouseY)){
            //     buildingFrom = getCenteredXY(mouseX, mouseY)
            //     prevBelt = game.grid.getBelt(mouseX, mouseY)
            //     return
            // }
            // if(game.grid.getBelt(buildingFrom.x, buildingFrom.y)){
            //     prevBelt.direction = dir
            // }
            let newBelt = game.grid.createBelt(mouseX, mouseY, dir)
            if(prevBelt){ 
                prevBelt.nextBelt = newBelt
                newBelt.prevBelt = prevBelt
            }
            if(susituyendo) newBelt.nextBelt = susituyendo
            prevBelt = newBelt
            buildingFrom = posBuildingNow
        }
        
        //game.grid.createBelt(mouseX, mouseY, dir)
    }
    if(gameState == 1){
        game.grid.deleteBelt(mouseX, mouseY)
        game.grid.deleteTransformer(mouseX, mouseY)
    }
    if(gameState == 2){
        game.grid.createFurnace(mouseX, mouseY)
    }
}

function keyPressed(){
    if(key == ' '){
        gameState = (gameState + 1) % 3
    }
}

