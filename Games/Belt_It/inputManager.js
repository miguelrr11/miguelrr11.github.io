let gameState = 0    //0 = nothing, 1 = buildingFrom
//state 1:
let buildingFrom = undefined
let prevBelt = undefined

function mouseReleased(){
    if(gameState == 0){
        buildingFrom = undefined
        prevBelt = undefined
    }
}

function mouseDragged(){
    if(gameState == 0){
        if(!buildingFrom){
            buildingFrom = getCenteredXY(mouseX, mouseY)
        }
        let posBuildingNow = getCenteredXY(mouseX, mouseY)
        if(dist(buildingFrom.x, buildingFrom.y, posBuildingNow.x, posBuildingNow.y) > tamCell/2){
            let dir
            let deltaX = abs(mouseX - buildingFrom.x)
            let deltaY = abs(mouseY - buildingFrom.y)
            if(deltaX > deltaY){
                if(mouseX > buildingFrom.x){
                    dir = 'E'
                }
                else{
                    dir = 'W'
                }
            }
            else{
                if(mouseY >  buildingFrom.y){
                    dir = 'S'
                }
                else{
                    dir = 'N'
                }
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
            buildingFrom = posBuildingNow.copy()
            let newBelt = game.grid.createBelt(mouseX, mouseY, dir)
            if(prevBelt) prevBelt.nextBelt = newBelt
            prevBelt = newBelt
            buildingFrom = posBuildingNow
        }
        
        //game.grid.createBelt(mouseX, mouseY, dir)
    }
}
/*
pmouseX = 100
mouseX = 300
deltaX = 200
pmouseY = 100
pmouseY = 200
deltaY = 100
deltaX > deltaY so dir = 'E'
*/