class Maze{
    constructor(){
        this.cellSize = 3
        this.nCells = Math.floor(WIDTH/this.cellSize)
        this.grid = this.initGrid()

        this.path = []
        this.started = false
        this.finished = false

        this.Astar = undefined
    }

    initGrid(){
        let grid = []
        for(let i = 0; i < this.nCells; i++){
            grid[i] = []
            for(let j = 0; j < this.nCells; j++){
                grid[i][j] = {visited: false, conns: new Set(), pos: {i, j}}
            }
        }
        return grid
    }

    generate(){
        this.grid = this.initGrid()
        this.path = []
        this.started = false
        this.finished = false
        while(!this.finished) this.step()
    }

    step(){
        if(this.finished) return
        if(!this.started){
            this.started = true
            this.grid[0][0].visited = true
            this.path.push(this.grid[0][0])  
        }
        else if(this.path.length > 0){
            let cur = this.path[this.path.length-1]
            let neighs = this.getNeighs(cur)
            if(neighs.length > 0){
                let next = neighs[Math.floor(Math.random() * neighs.length)]
                next.conns.add(cur)
                cur.conns.add(next)
                next.visited = true
                this.path.push(next)
            }
            else {
                this.path.pop()
            }
        }
        else this.finished = true

        if(this.finished && !this.Astar) this.Astar = new Astar(this.grid, this.cellSize)

            this.show()
    }
    
    getNeighs(cur){
        let neighs = []
        let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        for(let dir of dirs){
            let nx = cur.pos.i + dir[0]
            let ny = cur.pos.j + dir[1]
            if(nx < 0 || nx >= this.nCells) continue
            if(ny < 0 || ny >= this.nCells) continue
            if(!this.grid[nx][ny].visited) neighs.push(this.grid[nx][ny])
        }
        return neighs
    }

    show(){
        push()

        // draw connections (this is the important part)
        stroke(0, 150, 255)
        strokeWeight(1)
        
        // highlight current cell
        if(this.path.length > 0){
            let cur = this.path[this.path.length-1]
            for(let neighbor of cur.conns){
                line(
                    cur.pos.i * this.cellSize + this.cellSize/2,
                    cur.pos.j * this.cellSize + this.cellSize/2,
                    neighbor.pos.i * this.cellSize + this.cellSize/2,
                    neighbor.pos.j * this.cellSize + this.cellSize/2
                )
            }
        }

        if(this.Astar) this.Astar.show()

        pop()
    }
}