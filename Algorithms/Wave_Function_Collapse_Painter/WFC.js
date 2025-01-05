class WFC {
    constructor(canvas) {
        this.maxStates = numberOfCells * numberOfCells;
        this.createAdjMatrix(canvas);
        this.size = wfcSize;
        this.createWFC(canvas);

        this.canvasSize = this.size * pixelsPerCell
        this.pixelSize = WIDTH / this.canvasSize
        this.cellSize = WIDTH / this.size
    }

    generateAllStates() {
        let states = new Set();
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix.length; j++) {
                states.add({ i: i, j: j });
            }
        }
        return states;
    }

    getRandomUncollapsedCell() {
        let minStates = Infinity;
        let candidates = [];

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let cell = this.wfc[i][j];
                if (cell.state === undefined && cell.states.size < minStates) {
                    minStates = cell.states.size;
                    candidates = [[i, j]];
                } 
                else if (cell.state === undefined && cell.states.size === minStates) {
                    candidates.push([i, j]);
                }
            }
        }

        if (candidates.length > 0) {
            let randomIndex = Math.floor(Math.random() * candidates.length);
            let candidate = candidates[randomIndex];
            return this.wfc[candidate[0]][candidate[1]];
        } 
        else return null;
    }

    getAdjStates(state) {
        let i = state.i 
        let j = state.j
        let adjStates = new Set();
        let deltas = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];

        deltas.forEach(([dx, dy]) => {
            let ni = (i + dx + this.matrix.length) % this.matrix.length;
            let nj = (j + dy + this.matrix.length) % this.matrix.length;
            adjStates.add({ i: ni, j: nj });
        });

        return adjStates;
    }

    propagate(posI, posJ) {
        let deltas = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];

        let [ci, cj] = [posI, posJ]
        let collapsedCell = this.wfc[ci][cj];
        let collapsedState = collapsedCell.state;

        deltas.forEach(([di, dj]) => {
            let ni = (ci + di + this.size)
            let nj = (cj + dj + this.size)
            if(ni < 0 || ni >= this.size || nj < 0 || nj >= this.size) return
            let neighborCell = this.wfc[ni][nj];

            // Skip if the neighbor is already collapsed
            if (neighborCell.state !== undefined) return;

            let validStates = new Set();
            let adjStates = this.getAdjStates(collapsedState);

            adjStates.forEach(adjState => {
                if(isAinB(neighborCell.states, adjState)){
                    validStates.add(adjState);
                }
            });

            // If the states of the neighbor cell are reduced, propagate further
            if (validStates.size < neighborCell.states.size) {
                neighborCell.states = validStates;
                //queue.push([ni, nj]);
            }
        });
        
    }
    

    collapse() {
        let cell = this.getRandomUncollapsedCell();
        if (!cell) return;
        let state = getRandomElementFromSet(cell.states);
        cell.state = state;
        cell.states.clear()
        this.propagate(cell.pos[0], cell.pos[1]);
        console.log(cell)
    }

    createWFC(canvas) {
        this.wfc = [];
        for (let i = 0; i < this.size; i++) {
            this.wfc[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.wfc[i][j] = {
                    states: this.generateAllStates(),
                    state: undefined,
                    pos: [i, j]
                };
            }
        }
    }

    createAdjMatrix(canvas) {
        this.matrix = [];
        for (let i = 0; i < numberOfCells; i++) {
            this.matrix[i] = [];
            for (let j = 0; j < numberOfCells; j++) {
                this.matrix[i][j] = { i, j };
            }
        }
    }

    show(){
        push()
        noStroke()
        for(let i = 0; i < this.size; i++){
            for(let j = 0; j < this.size; j++){
                this.showCell(this.wfc[i][j].state, i, j)
            }
        }
        pop()
    }



    showCell(state, wfcI, wfcJ){
        push()
        let canvasPosI
        let canvasPosJ
        if(state != undefined){
            canvasPosI = state.i * pixelsPerCell
            canvasPosJ = state.j * pixelsPerCell
            noStroke()
            for(let i = canvasPosI; i < canvasPosI + pixelsPerCell; i++){
                for(let j = canvasPosJ; j < canvasPosJ + pixelsPerCell; j++){
                    if(canvas[i][j] == undefined) fill(0)
                    else fill(canvas[i][j])
                    let x = wfcI * this.cellSize + i * this.pixelSize
                    let y = wfcJ * this.cellSize + j * this.pixelSize
                    rect(x, y, this.pixelSize, this.pixelSize)
                }
            }
            pop()
        }
        else{
            canvasPosI = 0
            canvasPosJ = 0
            noStroke()
            for(let i = canvasPosI; i < canvasPosI + pixelsPerCell; i++){
                for(let j = canvasPosJ; j < canvasPosJ + pixelsPerCell; j++){
                    fill(255, 0, 0)
                    let x = wfcI * this.cellSize + i * this.pixelSize
                    let y = wfcJ * this.cellSize + j * this.pixelSize
                    rect(x, y, this.pixelSize, this.pixelSize)
                }
            }
            // stroke(255)
            // fill(0)
            // strokeWeight(3)
            // textSize(15)
            // text(this.wfc[wfcI][wfcJ].states.length, wfcI*this.cellSize, wfcJ*this.cellSize)
            pop()
        }
        
    }

}

function getRandomElementFromSet(set) {
    const items = Array.from(set);
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
}

function isAinB(set, element){
    for(let value of set){
        if(element.i == value.i && element.j == value.j) return true
    }
    return false
}
