class State{
    constructor(matrix, turn){
        this.matrix = matrix ? matrix : [   0, 0, 0,
                                            0, 0, 0, 
                                            0, 0, 0, 
                                        ]
        this.turn = turn != undefined ? turn : 1
    }

    getNewStates(){
        let newStatesMatrices = []
        for(let i = 0; i < this.matrix.length; i++){
            if(this.matrix[i] == 0) newStatesMatrices.push([...this.matrix.slice(0, i), this.turn, ...this.matrix.slice(i + 1)])
        }
        return newStatesMatrices
    }

    isEnding(){
        for(let i = 0; i < 3; i++){
            if(this.matrix[i*3] != 0 && this.matrix[i*3] == this.matrix[i*3 + 1] && this.matrix[i*3] == this.matrix[i*3 + 2]){
                return true
            }
        }

        for(let i = 0; i < 3; i++){
            if(this.matrix[i] != 0 && this.matrix[i] == this.matrix[i + 3] && this.matrix[i] == this.matrix[i + 6]){
                return true
            }
        }

        if(this.matrix[0] != 0 && this.matrix[0] == this.matrix[4] && this.matrix[0] == this.matrix[8]){
            return true
        }
        if(this.matrix[2] != 0 && this.matrix[2] == this.matrix[4] && this.matrix[2] == this.matrix[6]){
            return true
        }

        if(!this.matrix.includes(0)){
            return true
        }

        return false
    }

    show(isConn = false){
        push()
        let symbolMatrix = this.matrix.map(v => {
            if(v == 0) return ' '
            if(v == 1) return 'X'
            if(v == 2) return 'O'
        })
        textSize(12)
        textFont('monospace')
        let str = '[' + symbolMatrix.slice(0,3).join(' ') + ']\n' +
                  '[' + symbolMatrix.slice(3,6).join(' ') + ']\n' +
                  '[' + symbolMatrix.slice(6,9).join(' ') + ']'
        let bbox = textBounds(str, 0, -25)
        isConn ? fill(255, 0, 0, 200) : fill(0, 200)
        rectMode(CENTER)
        rect(0, -25, bbox.w + 10, bbox.h + 10, 5)
        fill(255)
        textAlign(CENTER, CENTER)
        text(str, 0, -25)
        pop()
    }
}