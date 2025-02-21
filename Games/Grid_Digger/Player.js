class Player{
    constructor(){
        this.pos = createVector(floor(cellsPerRow/2), floor(cellsPerRow/2))
        this.newPos = undefined
        this.state = 'resting'
        this.coolDownMovement = coolDownMovement
        this.coolDownMining = coolDownMining
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
        return pos.x >= 0 && pos.x < cellsPerRow && pos.y >= 0 && pos.y < cellsPerRow;
    }

    handleCurrentChunkMove(newPos) {
        if (currentChunk[newPos.x][newPos.y].hp === 0) {
            this.setMovingState(newPos);
        }
        else {
            this.setMiningState(currentChunk, newPos.x, newPos.y);
        }
    }

    setMovingState(newPos) {
        this.state = 'moving';
        this.newPos = newPos;
        this.coolDownMovement = coolDownMovement;
    }

    setMiningState(chunk, x, y) {
        this.state = 'mining';
        this.coolDownMining = coolDownMining;
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
                    y: cellsPerRow - 1
                },
                moveChunk: {
                    dx: 0,
                    dy: offset
                },
                updatePlayerCoord: () => {
                    this.pos.y = cellsPerRow - 1;
                }
            });
        }
        else if (newPos.y >= cellsPerRow) {
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
            moveToChunk(moveChunk.dx, moveChunk.dy);
            updatePlayerCoord();
        }
    }
      

    update(){
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
        }
        if(this.state == 'moving'){
            this.coolDownMovement--
            if(this.coolDownMovement == 0){
                this.pos = this.newPos
                this.state = 'resting'
            }
        }
        if(this.state == 'mining'){
            this.coolDownMining--
            if(this.coolDownMining == 0){
                this.state = 'resting'
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
            if(this.state == 'resting'){
                translate(this.pos.x * cellPixelSize + cellPixelSize/2, this.pos.y * cellPixelSize + cellPixelSize/2)
            }
            else{
                let [deltaMovX, deltaMovY] = this.getSmoothDeltas();
                translate((this.pos.x + deltaMovX) * cellPixelSize + cellPixelSize/2, (this.pos.y + deltaMovY) * cellPixelSize + cellPixelSize/2)
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