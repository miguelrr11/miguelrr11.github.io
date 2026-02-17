class SpatialHash {
    constructor(cellSize){
        this.cellSize = cellSize
        this.grid = new Array(gridWidth * gridHeight);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = {
                bodies: [],
                frame: -1
            }
        }
        this.frameId = 0;
        this.pairFrame = 0;
    }

    beginFrame(){
        this.frameId++;
    }


    computePairs(callback){
        this.pairFrame++;

        for(let i = 0; i < this.grid.length; i++){

            const cell = this.grid[i];

            if(cell.frame !== this.frameId) continue;

            for(let a = 0; a < cell.bodies.length; a++){
                const bodyA = cell.bodies[a];

                for(let b = a + 1; b < cell.bodies.length; b++){
                    const bodyB = cell.bodies[b];

                    if(bodyA.id < bodyB.id){
                        if(bodyB._pairStamp === this.pairFrame && bodyB._pairWith === bodyA.id) continue;

                        bodyB._pairStamp = this.pairFrame;
                        bodyB._pairWith = bodyA.id;
                    } 
                    else {
                        if(bodyA._pairStamp === this.pairFrame && bodyA._pairWith === bodyB.id) continue;

                        bodyA._pairStamp = this.pairFrame;
                        bodyA._pairWith = bodyB.id;
                    }

                    callback(bodyA, bodyB);
                }
            }
        }
    }


    visualizeGrid(){
        push()
        noStroke()
        fill(0, 255, 0, 100)
        for(let y = 0; y <= gridHeight - 1; y++){
            for(let x = 0; x <= gridWidth - 1; x++){
                const index = y * gridWidth + x;
                const cell = this.grid[index];
                if(cell.frame === this.frameId){
                    rect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize)
                }
            }
        }
        pop()
    }


    insertBody(body){
        computeAABB(body);

        const invCell = 1 / this.cellSize;

        const minCellX = Math.floor(body.minX * invCell);
        const maxCellX = Math.floor(body.maxX * invCell);
        const minCellY = Math.floor(body.minY * invCell);
        const maxCellY = Math.floor(body.maxY * invCell);

        for(let y = minCellY; y <= maxCellY; y++){
            for(let x = minCellX; x <= maxCellX; x++){

                if(x < 0 || x >= gridWidth) continue;
                if(y < 0 || y >= gridHeight) continue;

                const index = y * gridWidth + x;
                const cell = this.grid[index];

                if(cell.frame !== this.frameId){
                    cell.bodies.length = 0;
                    cell.frame = this.frameId;
                }

                cell.bodies.push(body);
            }
        }
    }



}
