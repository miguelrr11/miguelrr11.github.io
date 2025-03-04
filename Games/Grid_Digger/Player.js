class Player{
    constructor(){
        this.pos = createVector(floor(cellsPerRow/2), floor(cellsPerCol/2))
        this.newPos = undefined
        this.state = 'resting'
        this.coolDownMovement = coolDownMovement
        this.coolDownMining = coolDownMining
        this.oldPos = undefined         //quick fix for lighting in transitions

        this.mat1Cap = 10
        this.mat2Cap = 10
        this.mat3Cap = 10
        this.mat1 = 100
        this.mat2 = Infinity
        this.mat3 = 1000

        this.nMatsGiven = 1
    }

    upgrade(upgrade){
        if(upgrade == 0){
            coolDownMovement -= 3
            if(coolDownMovement < 2) coolDownMovement = 2
        }
        else if(upgrade == 1){
            coolDownMining -= 3
            if(coolDownMining < 2) coolDownMining = 2
        }
        else if(upgrade == 2){
            fovRadiusWall++
            fovRadiusWallSq = fovRadiusWall * fovRadiusWall
            computeLightingGrid(curLightMap)
        }
    }

    give(material, maxx){
        let max = Math.min(maxx, this.nMatsGiven)
        if(material == 1){
            if(this.mat1 > 0){
                let give = Math.min(this.mat1, max)
                this.mat1 -= give
                this.updatenMatsGiven()
                return give
            }
            else this.nMatsGiven = 1
        }
        else if(material == 2){
            if(this.mat2 > 0){
                let give = Math.min(this.mat2, max)
                this.mat2 -= give
                this.updatenMatsGiven()
                return give
            }
            else this.nMatsGiven = 1
        }
        else if(material == 3){
            if(this.mat3 > 0){
                let give = Math.min(this.mat3, max)
                this.mat3 -= give
                this.updatenMatsGiven()
                return give
            }
            else this.nMatsGiven = 1
        }
        return 0
    }

    updatenMatsGiven(){
        this.nMatsGiven = Math.ceil(this.nMatsGiven * 1.0005)
    }

    receive(material){
        if(material == 1){
            this.mat1++
            if(this.mat1 > this.mat1Cap) this.mat1 = this.mat1Cap
        }
        else if(material == 2){
            this.mat2++
            if(this.mat2 > this.mat2Cap) this.mat2 = this.mat2Cap
        }
        else if(material == 3){
            this.mat3++
            if(this.mat3 > this.mat3Cap) this.mat3 = this.mat3Cap
        }
    }

    move(dx, dy) {
        const newPos = this.pos.copy().add(createVector(dx, dy));

        if (this.isWithinChunk(newPos)) {
            this.handleCurrentChunkMove(newPos);
        }
        else {
            this.handleChunkTransition(newPos);
        }
    }

    isWithinChunk(pos) {
        return pos.x >= 0 && pos.x < cellsPerRow && pos.y >= 0 && pos.y < cellsPerCol;
    }

    handleCurrentChunkMove(newPos) {
        if (currentChunk[newPos.x][newPos.y].transparent()) {
            this.setMovingState(newPos);
        }
        else {
            if(this.coolDownMining < 0) this.setMiningState(currentChunk, newPos.x, newPos.y);
        }
    }

    setMovingState(newPos) {
        if(this.miningPos != undefined) return
        this.state = 'moving';
        this.newPos = newPos;
        this.coolDownMovement = coolDownMovement;
        anims.addAnimation( this.pos.x * cellPixelSize + cellPixelSize/2, 
                            this.pos.y * cellPixelSize + cellPixelSize/2, 
                            {
                                type: 'walking', 
                                direction: createVector(this.pos.x - this.newPos.x, this.pos.y - this.newPos.y),
                                color: getCurrentFloorColor()
                            }, this.pos.x, this.pos.y
        );
    }

    setMiningState(chunk, x, y) {
        this.state = 'mining';
        this.coolDownMining = coolDownMining;
        this.miningPos = createVector(x, y);
        hitCell(chunk, x, y);
    }

    handleChunkTransition(newPos) {
        const offset = 1;

        if (newPos.x < 0) {
            this.processBoundaryTransition({
                targetChunk: chunkLeft,
                checkCoord: {
                    x: cellsPerRow - 1,
                    y: newPos.y
                },
                moveChunk: {
                    dx: -offset,
                    dy: 0
                },
                updatePlayerCoord: () => {
                    this.pos.x = cellsPerRow - 1;
                }
            });
        }
        else if (newPos.x >= cellsPerRow) {
            this.processBoundaryTransition({
                targetChunk: chunkRight,
                checkCoord: {
                    x: 0,
                    y: newPos.y
                },
                moveChunk: {
                    dx: offset,
                    dy: 0
                },
                updatePlayerCoord: () => {
                    this.pos.x = 0;
                }
            });
        }
        else if (newPos.y < 0) {
            this.processBoundaryTransition({
                targetChunk: chunkUp,
                checkCoord: {
                    x: newPos.x,
                    y: cellsPerCol - 1
                },
                moveChunk: {
                    dx: 0,
                    dy: offset
                },
                updatePlayerCoord: () => {
                    this.pos.y = cellsPerCol - 1;
                }
            });
        }
        else if (newPos.y >= cellsPerCol) {
            this.processBoundaryTransition({
                targetChunk: chunkDown,
                checkCoord: {
                    x: newPos.x,
                    y: 0
                },
                moveChunk: {
                    dx: 0,
                    dy: -offset
                },
                updatePlayerCoord: () => {
                    this.pos.y = 0;
                }
            });
        }
    }

    processBoundaryTransition({
        targetChunk,
        checkCoord,
        moveChunk,
        updatePlayerCoord
    }) {
        if (isThereAwall(targetChunk, checkCoord.x, checkCoord.y)) {
            this.setMiningState(targetChunk, checkCoord.x, checkCoord.y);
        }
        else {
            //computeLightingGrid(curLightMap)
            if(!checkPlayerBoundaries(moveChunk.dx, moveChunk.dy)) return
            this.oldPos = this.pos.copy()
            updatePlayerCoord();
            moveToChunk(moveChunk.dx, moveChunk.dy);
        }
    }
      

    update(){
        this.coolDownMining--
        if(this.coolDownMining < 0) this.miningPos = undefined
        if(this.state == 'resting' && !transitioning){
            if(keyIsDown(LEFT_ARROW)){
                this.move(-1, 0)
            }
            else if(keyIsDown(RIGHT_ARROW)){
                this.move(1, 0)
            }
            else if(keyIsDown(UP_ARROW)){
                this.move(0, -1)
            }
            else if(keyIsDown(DOWN_ARROW)){
                this.move(0, 1)
            }
            else if(frameCount % 5 == 0){
                currentChunk[this.pos.x][this.pos.y].onPlayerStanding()
            }
        }
        if(this.state == 'moving'){
            this.coolDownMovement--
            if(this.coolDownMovement < 0){
                this.pos = this.newPos.copy()
                computeLightingGrid(curLightMap)
                this.newPos = undefined
                this.state = 'resting'
            }
        }
        if(this.state == 'mining'){
            this.state = 'resting'
            if(this.coolDownMining < 0){
                this.state = 'mining'
                this.coolDownMining = coolDownMining
            }
        }
    }

    getSmoothDeltas() {
        let progress = 1 - this.coolDownMovement / coolDownMovement;
        let smoothFactor = 1 - Math.pow(1 - progress, 3);
        
        let deltaMovX = (this.newPos.x - this.pos.x) * smoothFactor;
        let deltaMovY = (this.newPos.y - this.pos.y) * smoothFactor;
        
        return [deltaMovX, deltaMovY];
    }
    

    show(){
        push()
        rectMode(CENTER)
        if(!transitioning){
            if(this.miningPos != undefined){
                translate(cellPixelSize/2, cellPixelSize/2)
                let dx = 0
                let dy = 0
                let progress
                if(this.coolDownMining > coolDownMining / 2){
                    progress = 1 - (this.coolDownMining) / (coolDownMining);
                    let smoothFactor = 1 - Math.pow(1 - progress, 3);
                    dx = (this.miningPos.x - this.pos.x) * 0.2 * cellPixelSize * smoothFactor
                    dy = (this.miningPos.y - this.pos.y) * 0.2 * cellPixelSize * smoothFactor
                }
                else{
                    progress = (this.coolDownMining) / (coolDownMining);
                    let smoothFactor = 1 - Math.pow(1 - progress, 3);
                    dx = (this.miningPos.x - this.pos.x) * 0.2 * cellPixelSize * smoothFactor
                    dy = (this.miningPos.y - this.pos.y) * 0.2 * cellPixelSize * smoothFactor
                }
                translate(this.pos.x * cellPixelSize + dx, this.pos.y * cellPixelSize + dy)
            }
            else if(this.state == 'resting'){
                translate(this.pos.x * cellPixelSize + cellPixelSize/2, this.pos.y * cellPixelSize + cellPixelSize/2)
            }
            else if(this.state == 'moving'){
                let [deltaMovX, deltaMovY] = this.getSmoothDeltas();
                translate((this.pos.x + deltaMovX) * cellPixelSize + cellPixelSize/2, (this.pos.y + deltaMovY) * cellPixelSize + cellPixelSize/2)
                computeLightingGrid(curLightMap)
                
            }
            
           
        }
        else{ 
            translate(this.pos.x * cellPixelSize + cellPixelSize/2, this.pos.y * cellPixelSize + cellPixelSize/2)
            translate(translationPlayer.x, translationPlayer.y)
        }
        fill(50)
        rect(0, 0, cellPixelSize*0.7, cellPixelSize*0.7)
        pop()
    }
}