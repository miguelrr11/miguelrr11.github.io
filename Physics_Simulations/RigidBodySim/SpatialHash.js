const CELL_SIZE = 100

class SpatialHash {
    constructor(cellSize){
        this.cellSize = cellSize
        this.map = new Map()
    }

    clear(){
        this.map.clear()
    }

    _hash(x, y){
        return `${x},${y}`
    }

    insert(body){
        let minX = Math.floor(body.aabb.minX / this.cellSize)
        let maxX = Math.floor(body.aabb.maxX / this.cellSize)
        let minY = Math.floor(body.aabb.minY / this.cellSize)
        let maxY = Math.floor(body.aabb.maxY / this.cellSize)

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                let key = this._hash(x, y)

                if(!this.map.has(key)){
                    this.map.set(key, [])
                }

                this.map.get(key).push(body)
            }
        }
    }

    getPotentialPairs(){
        let pairs = new Set()

        for(let cell of this.map.values()){
            for(let i = 0; i < cell.length; i++){
                for(let j = i + 1; j < cell.length; j++){
                    let a = cell[i]
                    let b = cell[j]

                    let id = a.id < b.id
                        ? `${a.id}-${b.id}`
                        : `${b.id}-${a.id}`

                    pairs.add(id)
                }
            }
        }

        return pairs
    }
}
