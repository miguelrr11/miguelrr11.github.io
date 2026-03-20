class Astar{
    constructor(grid, cellSize){
        this.grid = grid
        this.openSet = new Set()
        this.openSet.add(this.grid[0][0])
        this.closedSet = new Set()
        this.cameFrom = new Map()
        this.gScore = new Map()
        this.fScore = new Map()

        this.start = this.grid[0][0]
        this.end = this.grid[this.grid.length-1][this.grid[0].length-1]

        this.cellSize = cellSize

        while(!this.road) this.step()
    }

    h(cell){
        return dist(cell.pos.i, cell.pos.j, this.end.pos.i, this.end.pos.j) * this.cellSize
    }

    step(){
        if(this.openSet.size === 0) return null

        let current = null
        for(let cell of this.openSet){
            if(current === null || this.fScore.get(cell) < this.fScore.get(current)){
                current = cell
            }
        }

        if(current === this.end){
            let path = []
            while(current){
                path.push(current)
                current = this.cameFrom.get(current)
            }
            this.road = path.reverse()
            return
        }
        this.openSet.delete(current)
        this.closedSet.add(current)
        for(let neighbor of current.conns){
            if(this.closedSet.has(neighbor)) continue
            let tentative_gScore = this.gScore.get(current) + 1
        
            if(!this.openSet.has(neighbor)) this.openSet.add(neighbor)
            else if(tentative_gScore >= this.gScore.get(neighbor)) continue
            this.gScore.set(neighbor, tentative_gScore)
            this.fScore.set(neighbor, tentative_gScore + this.h(neighbor))
            this.cameFrom.set(neighbor, current)
        }

    }

    show(){
        push()
        // fill(0, 255, 0, 100)
        // for(let cell of this.openSet){  
        //     rect(cell.pos.j * this.cellSize, cell.pos.i * this.cellSize, this.cellSize*.5, this.cellSize*.5)
        // }
        // fill(255, 0, 0, 100)
        // for(let cell of this.closedSet){
        //     rect(cell.pos.j * this.cellSize, cell.pos.i * this.cellSize, this.cellSize*.5, this.cellSize*.5)
        // }
        if(this.road){
            stroke(255, 0, 255, 100)
            strokeWeight(4)
            noFill()
            colorMode(HSB, 255)
            for(let i = 0; i < this.road.length-1; i++){
                let cell = this.road[i]
                let nextCell = this.road[i+1]
                stroke((i/this.road.length)*135, 255, 255)
                line(cell.pos.i * this.cellSize + this.cellSize/2, cell.pos.j * this.cellSize + this.cellSize/2,
                    nextCell.pos.i * this.cellSize + this.cellSize/2, nextCell.pos.j * this.cellSize + this.cellSize/2
                )
            }
        }
        pop()
    }
}