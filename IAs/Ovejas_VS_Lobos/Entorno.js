class Entorno{
    constructor(){
        this.init()
    }

    init(){
        let bound = 0.6
        this.grid = []
        for(let i = 0; i < GRID_SIZE; i++){
            this.grid[i] = []
            for(let j = 0; j < GRID_SIZE; j++){
                let valor = noise(i/10, j/10)
                let finalVal = valor > bound ? mapp(valor, bound, 1, 0, 1) : mapp(valor, 0, bound, 0, 1)
                let isFood = Math.random() < FOOD_CHANCE && valor < bound
                this.grid[i][j] = {
                    type: valor > bound ? 'water' : 'grass',
                    val: finalVal,
                    col: valor > bound ? lerppColor(COL_LIGHT_BLUE, COL_DARK_BLUE, finalVal) :
                                         lerppColor(COL_LIGHT_GREEN, COL_DARK_GREEN, finalVal),
                    food: isFood ? 5 : 0
                }
            }
        }
    }

    regenerateFood(){
        for(let x = 0; x < GRID_SIZE; x++){
            let i = Math.floor(Math.random() * GRID_SIZE)
            let j = Math.floor(Math.random() * GRID_SIZE)
            if(this.grid[i][j].type == 'grass' && 
                this.grid[i][j].food < 5 && 
                this.grid[i][j].food > 0){ 
                    this.grid[i][j].food++
                    return
                }
        }
        let i = Math.floor(Math.random() * GRID_SIZE)
        let j = Math.floor(Math.random() * GRID_SIZE)
        if(this.grid[i][j].type == 'grass' && this.grid[i][j].food < 5) this.grid[i][j].food++
    }

    //BFS
    findClosest(realPos, realradius, type) {
        let grid = this.grid
        let radius = realradius / TAM_CELL
        let i = Math.floor(realPos.x / TAM_CELL)
        let j = Math.floor(realPos.y / TAM_CELL)
        const directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0], // cardinal directions
            [1, 1], [1, -1], [-1, 1], [-1, -1] // diagonal directions
        ];
    
        const rows = grid.length;
        const cols = grid[0].length;
    
        function isValid(x, y, visited) {
            const dist = Math.sqrt((x - i) ** 2 + (y - j) ** 2);
            return (
                x >= 0 &&
                y >= 0 &&
                x < rows &&
                y < cols &&
                dist <= radius &&
                !visited[x][y]
            );
        }
    
        const queue = [[i, j, 0]]; // [x, y, distance from origin]
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        visited[i][j] = true;
    
        while (queue.length > 0) {
            const [x, y, dist] = queue.shift();
    
            if ((type == 'water' && grid[x][y].type == type) ||
                (type == 'food' && grid[x][y].food > 0)) {
                return createVector(x*TAM_CELL + TAM_CELL/2, y*TAM_CELL + TAM_CELL/2)
            }
    
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
    
                if (isValid(newX, newY, visited)) {
                    visited[newX][newY] = true;
                    queue.push([newX, newY, dist + 1]);
                }
            }
        }
    
        return null;
    }

    isWater(realPos){
        let i = Math.floor(realPos.x / TAM_CELL)
        let j = Math.floor(realPos.y / TAM_CELL)
        return this.grid[i][j].type == 'water'
    }

    validSpawnOveja(i, j){
        return this.grid[i][j].type == 'grass'
    }

    eat(realPos){
        let i = Math.floor(realPos.x / TAM_CELL)
        let j = Math.floor(realPos.y / TAM_CELL)
        this.grid[i][j].food--
        this.regenerateFood()
    }

    growFood(realPos){
        let i = Math.floor(realPos.x / TAM_CELL)
        let j = Math.floor(realPos.y / TAM_CELL)
        if(this.grid[i][j].food < 5) this.grid[i][j].food++
    }

    drawFood(i, j, food){
        push()
        translate(i*TAM_CELL, j*TAM_CELL)
        stroke(COL_FOOD)
        strokeWeight(TAM_CELL*0.2)
        for(let i = 0; i < food; i++){ 
            let pos = FOOD_POS[i]
            point(pos.x*TAM_CELL, pos.y*TAM_CELL)
        }
        pop()
    }

    show(){
        push()
        noStroke()
        for(let i = 0; i < GRID_SIZE; i++){
            for(let j = 0; j < GRID_SIZE; j++){
                let cell = this.grid[i][j]
                fill(cell.col)
                rect(i*TAM_CELL, j*TAM_CELL, TAM_CELL, TAM_CELL)
                if(cell.food > 0) this.drawFood(i, j, cell.food)
            }
        }
        pop()
    }
}