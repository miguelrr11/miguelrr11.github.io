const widthCell = 100
const heightCell = 20
const WIDTH = widthCell * 12
const HEIGHT = heightCell * 30



class Sheet{
    constructor(){
        this.cellsMap = new Map() // key example: B5
        this.selectedCell = undefined
        this.nCols = Math.floor(WIDTH / widthCell)
        this.nRows = Math.floor(HEIGHT / heightCell)
        this.grid = this.createGrid()

        this.inputingACellInFormula = false

        this.inputText = createInput()
            .style(`width: ${WIDTH}px;
                    font-size: 18px;
                    padding: 8px 12px;
                    border-radius: 12px;
                    border: 1px solid #ccc;
                    outline: none;
                    box-sizing: border-box;
                    margin-bottom: 6px;`)

        // Bind methods so "this" works correctly
        this.inputNewText = this.inputNewText.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)

        this.inputText.elt.addEventListener('input', this.inputNewText)
        this.inputText.elt.addEventListener('keydown', this.handleKeyDown)

        document.addEventListener("click", () => { this.onClick() })
    }

    inputNewText(e){
        if (this.selectedCell){
            this.selectedCell.rawVal = this.inputText.value()
            this.selectedCell.enteredCellLast = false
            if(this.inputText.value().trim() !== ""){
                this.cellsMap.set(this.getCellKey(this.selectedCell.col, this.selectedCell.row), this.selectedCell)
            }
        }
        this.inputingACellInFormula = this.selectedCell && this.selectedCell.rawVal.startsWith("=")
    }

    getCellKey(col, row){
        const colLetter = String.fromCharCode(65 + col) // Convert 0 -> A, 1 -> B, etc.
        return `${colLetter}${row}`
    }

    handleKeyDown(e){
        if (e.key === "Enter" && this.selectedCell){
            this.selectedCell.compute()
            let nextRow = this.selectedCell.row + 1
            if(nextRow < this.nRows){
                this.selectCell(this.grid[nextRow][this.selectedCell.col])
            }
        }
        if(e.key === "ArrowDown" && this.selectedCell){
            let nextRow = this.selectedCell.row + 1
            if(nextRow < this.nRows){
                this.selectCell(this.grid[nextRow][this.selectedCell.col])
            }
        }
        if(e.key === "ArrowUp" && this.selectedCell){
            let nextRow = this.selectedCell.row - 1
            if(nextRow >= 0){
                this.selectCell(this.grid[nextRow][this.selectedCell.col])
            }
        }
        if(e.key === "ArrowRight" && this.selectedCell){
            let nextCol = this.selectedCell.col + 1
            if(nextCol < this.nCols){
                this.selectCell(this.grid[this.selectedCell.row][nextCol])
            }
        }
        if(e.key === "ArrowLeft" && this.selectedCell){
            let nextCol = this.selectedCell.col - 1
            if(nextCol >= 0){
                this.selectCell(this.grid[this.selectedCell.row][nextCol])
            }
        }
        else if(this.selectedCell) this.selectedCell.compute()
        // else if(e.key === "Backspace" && this.selectedCell){
        //     this.selectedCell.rawVal = ""
        //     this.cellsMap.delete(this.getCellKey(this.selectedCell.col, this.selectedCell.row))
        //     this.selectedCell.updateDepenencies()
        // }
    }

    onClick(){
        if(this.selectedCell) this.selectedCell.compute()
        let clickedCell = undefined
        for(let i = 0; i < this.nRows; i++){
            for(let j = 0; j < this.nCols; j++){
                if(this.grid[i][j].mouseInside()){
                    clickedCell = this.grid[i][j]
                    break
                }
            }
        }
        if(clickedCell && this.selectedCell && this.selectedCell.rawVal.startsWith("=")){
            let cellRef = String.fromCharCode(65 + clickedCell.col) + clickedCell.row
            this.inputText.value(this.inputText.value() + cellRef)
            if(!this.selectedCell.enteredCellLast) this.selectedCell.rawVal += cellRef
            else{
                //replace the last cell reference with the new one
                let rawVal = this.selectedCell.rawVal
                let lastCellRefRegex = /([A-Z]+)(\d+)$/
                rawVal = rawVal.replace(lastCellRefRegex, cellRef)
                this.selectedCell.rawVal = rawVal
                this.inputText.value(rawVal)
            }
            this.selectedCell.enteredCellLast = true
            this.inputingACellInFormula = false
            this.inputText.elt.focus()
            return
        }
        if(clickedCell){
            this.selectCell(clickedCell)
        }
    }

    selectCell(cell){
        this.selectedCell = cell

        if (this.selectedCell) {
            this.inputText.value(this.selectedCell.rawVal || "")
            this.inputText.elt.focus()
        }
    }

    createGrid(){
        let grid = []
        for(let i = 0; i < this.nRows; i++){
            grid[i] = []
            for(let j = 0; j < this.nCols; j++){
                grid[i][j] = new Cell(j, i)
                grid[i][j].sheet = this
            }
        }
        return grid
    }

    showGrid(){
        push()
        noFill()
        stroke(130)
        strokeWeight(1)
        for(let i = 0; i < this.nCols; i++){
            line(i*widthCell, 0, i*widthCell, HEIGHT)
        }
        for(let i = 0; i < this.nRows; i++){
            line(0, i*heightCell, WIDTH, i*heightCell)
        }
        if(this.selectedCell){
            strokeWeight(2.5)
            stroke("#00a6ff")
            rect(this.selectedCell.pos.x, this.selectedCell.pos.y, widthCell, heightCell)
            strokeWeight(9)
            point(this.selectedCell.pos.x, this.selectedCell.pos.y)
        }
        push()
        translate(widthCell - 5, heightCell * .5)
        fill(0)
        noStroke()
        textSize(13)
        textAlign(RIGHT, CENTER)
        for(let i = 0; i < this.nRows; i++){
            for(let j = 0; j < this.nCols; j++){
                let cell = this.grid[i][j]
                cell.computeDependingOn()
                cell.computeDepencyOf()
                let tx = cell.value == undefined ? "" : cell.value
                if(cell == this.selectedCell) tx = cell.rawVal || ""
                text(tx, cell.pos.x, cell.pos.y)
            }
        }
        pop()
        if(this.selectedCell && this.selectedCell.dependingOn.size > 0){
            stroke("#aa49ff")
            strokeWeight(2)
            noFill()
            for(let cellRef of this.selectedCell.dependingOn){
                let refCell = this.cellsMap.get(cellRef)
                if(refCell){
                    rect(refCell.pos.x, refCell.pos.y, widthCell, heightCell)
                }
            }
        }
        pop()
    }
}