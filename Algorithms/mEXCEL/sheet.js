const widthCell = 100
const heightCell = 20
const WIDTH = widthCell * 12 + heightCell
const HEIGHT = heightCell * 30 + heightCell



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
        document.addEventListener("mousedown", () => { this.onMouseDown() })
    }

    onMouseDown(){
        this.positionStartedClick = {x: mouseX, y: mouseY}
    }

    replaceFunctions(formula){
        //replace things like SUM(A1:A5) with the actual sum
        const sumRegex = /SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/g
        let newFormula = formula.replace(sumRegex, (match, startRef, endRef) => {
            const startCol = startRef.charCodeAt(0) - 65
            const startRow = parseInt(startRef.substring(1))
            const endCol = endRef.charCodeAt(0) - 65
            const endRow = parseInt(endRef.substring(1))
            let sum = 0
            for(let i = startRow; i <= endRow; i++){
                for(let j = startCol; j <= endCol; j++){
                    const cell = this.cellsMap.get(this.getCellKey(j, i))
                    if(cell && typeof cell.value === "number"){
                        sum += cell.value
                    }
                }
            }
            return sum
        })
        //if the formula doesnt include :, then return the value of the cell reference, eg SUM(A1) -> A1's value
        const sumSingleRegex = /SUM\(([A-Z]+\d+)\)/g
        newFormula = newFormula.replace(sumSingleRegex, (match, cellRef) => {
            const col = cellRef.charCodeAt(0) - 65
            const row = parseInt(cellRef.substring(1))
            const cell = this.cellsMap.get(this.getCellKey(col, row))
            return cell && typeof cell.value === "number" ? cell.value : 0
        })

        const avgRegex = /AVG\(([A-Z]+\d+):([A-Z]+\d+)\)/g
        newFormula = newFormula.replace(avgRegex, (match, startRef, endRef) => {
            const startCol = startRef.charCodeAt(0) - 65
            const startRow = parseInt(startRef.substring(1))
            const endCol = endRef.charCodeAt(0) - 65
            const endRow = parseInt(endRef.substring(1))
            let sum = 0
            let count = 0
            for(let i = startRow; i <= endRow; i++){
                for(let j = startCol; j <= endCol; j++){
                    const cell = this.cellsMap.get(this.getCellKey(j, i))
                    if(cell && typeof cell.value === "number"){
                        sum += cell.value
                        count++
                    }
                }
            }
            return count > 0 ? sum / count : 0
        })
        const avgSingleRegex = /AVG\(([A-Z]+\d+)\)/g
        newFormula = newFormula.replace(avgSingleRegex, (match, cellRef) => {
            const col = cellRef.charCodeAt(0) - 65
            const row = parseInt(cellRef.substring(1))
            const cell = this.cellsMap.get(this.getCellKey(col, row))
            return cell && typeof cell.value === "number" ? cell.value : 0
        })

        return newFormula
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
        //else if(this.selectedCell) this.selectedCell.compute()
        // else if(e.key === "Backspace" && this.selectedCell){
        //     this.selectedCell.rawVal = ""
        //     this.cellsMap.delete(this.getCellKey(this.selectedCell.col, this.selectedCell.row))
        //     this.selectedCell.updateDepenencies()
        // }
    }

    onClick(){
        if(this.selectedCell && !this.inputingACellInFormula) this.selectedCell.compute()
        let endClickCell = undefined
        let startClickCell = undefined
        for(let i = 0; i < this.nRows; i++){
            for(let j = 0; j < this.nCols; j++){
                if(this.grid[i][j].mouseInside()){
                    endClickCell = this.grid[i][j]
                }
                if(this.positionStartedClick && this.grid[i][j].mouseInside(this.positionStartedClick.x, this.positionStartedClick.y)){
                        startClickCell = this.grid[i][j]
                }
                if(endClickCell && startClickCell) break
            }
        }
        console.log("startClickCell:", startClickCell, "endClickCell:", endClickCell)
        if(startClickCell && endClickCell && startClickCell == endClickCell){
            let clickedCell = endClickCell
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
                this.selectedRange = undefined
            }
        }
        else{
            //insert <startCellRef>:<endCellRef> if the user dragged across cells while clicking
            if(startClickCell && endClickCell && startClickCell != endClickCell){
                let startCellRef = String.fromCharCode(65 + startClickCell.col) + startClickCell.row
                let endCellRef = String.fromCharCode(65 + endClickCell.col) + endClickCell.row
                this.inputText.value(this.inputText.value() + startCellRef + ":" + endCellRef)
                if(!this.selectedCell.enteredCellLast) this.selectedCell.rawVal += startCellRef + ":" + endCellRef
                else{
                    //replace the last cell reference with the new one
                    let rawVal = this.selectedCell.rawVal
                    let lastCellRefRegex = /([A-Z]+)(\d+)(:([A-Z]+)(\d+))?$/
                    rawVal = rawVal.replace(lastCellRefRegex, startCellRef + ":" + endCellRef)
                    this.selectedCell.rawVal = rawVal
                    this.inputText.value(rawVal)
                }
                this.selectedCell.enteredCellLast = true
                this.inputingACellInFormula = false
                this.inputText.elt.focus()
                this.selectedRange = {start: startClickCell, end: endClickCell}
            }
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
        this.selectedCell = grid[0][0]
        return grid
    }

    showGrid(){
        push()
        fill("#00a6ff1c")
        noStroke()
        rect(0, 0, WIDTH, heightCell)
        rect(0, 0, heightCell, HEIGHT)
        translate(heightCell, heightCell)
        noFill()
        stroke(130)
        strokeWeight(1)
        for(let i = 0; i < this.nCols; i++){
            line(i*widthCell, -heightCell, i*widthCell, HEIGHT)
        }
        for(let i = 0; i < this.nRows; i++){
            line(-heightCell, i*heightCell, WIDTH, i*heightCell)
        }
        fill(0)
        noStroke()
        textSize(13)
        textAlign(CENTER, CENTER)
        for(let i = 0; i < this.nCols; i++){
            text(String.fromCharCode(65 + i), i*widthCell + widthCell/2, -heightCell/2)
        }
        for(let i = 0; i < this.nRows; i++){
            text(i, -heightCell/2, i*heightCell + heightCell/2)
        }
        noFill()
        if(this.selectedCell && !this.selectedRange){
            fill("#00a6ff1c")
            strokeWeight(2.5)
            stroke("#00a6ff")
            rect(this.selectedCell.pos.x, this.selectedCell.pos.y, widthCell, heightCell)
            strokeWeight(9)
            point(this.selectedCell.pos.x, this.selectedCell.pos.y)
        }
        if(this.selectedRange){
            fill("#00a6ff1c")
            strokeWeight(2.5)
            stroke("#00a6ff")
            let x = Math.min(this.selectedRange.start.pos.x, this.selectedRange.end.pos.x)
            let y = Math.min(this.selectedRange.start.pos.y, this.selectedRange.end.pos.y)
            let w = Math.abs(this.selectedRange.start.pos.x - this.selectedRange.end.pos.x) + widthCell
            let h = Math.abs(this.selectedRange.start.pos.y - this.selectedRange.end.pos.y) + heightCell
            rect(x, y, w, h)
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

