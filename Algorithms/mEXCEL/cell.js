class Cell{
    constructor(col, row){
        this.col = col
        this.row = row

        this.rawVal = ""
        this.pos = {x: col*widthCell, y: row*heightCell}

        this.enteredCellLast = false
        this.cellRefs = new Set()
    }

    computeReferences(){
        this.cellRefs = new Set()
        if(this.rawVal.startsWith("=")){
            const cellRefRegex = /([A-Z]+)(\d+)/g
            let match = null
            while((match = cellRefRegex.exec(this.rawVal)) !== null){
                const col = match[1].charCodeAt(0) - 65
                const row = parseInt(match[2])
                this.cellRefs.add(this.sheet.getCellKey(col, row))
            }
        }
    }

    compute(){
        if(!this.rawVal.startsWith("=")){
            // if its not a formula, try to compute the value (eg 2+2)
            try {
                this.value = eval(this.rawVal)
            } 
            catch(e) {
                this.value = this.rawVal
            }
        }
        else{
            //substitute cell references with their values
            let formula = this.rawVal.substring(1)
            const cellRefRegex = /([A-Z]+)(\d+)/g
            formula = formula.replace(cellRefRegex, (match, colLetters, rowNumber) => {
                const cell = this.sheet.cellsMap.get(this.sheet.getCellKey(colLetters.charCodeAt(0) - 65, parseInt(rowNumber)))
                return cell ? (cell.value || cell.rawVal || 0) : 0
            })
            try {
                this.value = eval(formula)
            }
            catch(e) {
                this.value = `#ERROR`
            }
        }
    }

    mouseInside(){
        return inBounds(mouseX, mouseY, this.pos.x, this.pos.y, widthCell, heightCell)
    }
}