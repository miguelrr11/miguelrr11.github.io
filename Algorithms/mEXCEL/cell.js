class Cell{
    constructor(col, row){
        this.col = col
        this.row = row

        this.rawVal = ""
        this.pos = {x: col*widthCell, y: row*heightCell}

        this.enteredCellLast = false
        this.dependingOn = new Set()
        this.dependencyOf = new Set()
    }

    computeDepencyOf(){
        //check if this.dependencyOf still holds, if not remove it
        for(let cellRef of this.dependencyOf){
            let cell = this.sheet.cellsMap.get(cellRef)
            if(cell && cell.dependingOn.has(this.sheet.getCellKey(this.col, this.row))){
                cell.dependingOn.delete(this.sheet.getCellKey(this.col, this.row))
            }
            else{
                this.dependencyOf.delete(cellRef)
            }
        }
    }

    computeDependingOn(){
        this.dependingOn = new Set()
        if(this.rawVal.startsWith("=")){
            //turn range syntax into individual cell references (eg A1:A5 -> A1, A2, A3, A4, A5)
            let newRawVal = this.rawVal.replace(/([A-Z]+\d+):([A-Z]+\d+)/g, (match, startRef, endRef) => {
                const startCol = startRef.charCodeAt(0) - 65
                const startRow = parseInt(startRef.substring(1))
                const endCol = endRef.charCodeAt(0) - 65
                const endRow = parseInt(endRef.substring(1))
                let result = ""
                for(let i = startRow; i <= endRow; i++){
                    for(let j = startCol; j <= endCol; j++){
                        result += this.sheet.getCellKey(j, i) + "+"
                    }
                }
                return result.slice(0, -1) // Remove trailing comma
            })
            const cellRefRegex = /([A-Z]+)(\d+)/g
            let match = null
            while((match = cellRefRegex.exec(newRawVal)) !== null){
                const col = match[1].charCodeAt(0) - 65
                const row = parseInt(match[2])
                const cellKey = this.sheet.getCellKey(col, row)
                this.dependingOn.add(cellKey)
                // Update the dependencyOf set of the referenced cell
                const referencedCell = this.sheet.cellsMap.get(cellKey)
                if(referencedCell){
                    referencedCell.dependencyOf.add(this.sheet.getCellKey(this.col, this.row))
                }
            }
        }
    }

    updateDepenencies(){
        //when a cell changes, we need to update the cells that depend on it
        for(let cellRef of this.dependencyOf){
            let cell = this.sheet.cellsMap.get(cellRef)
            if(cell) cell.compute()
        }
    }

    compute(){
        if(!this.rawVal.startsWith("=")){
            // if its not a formula, try to compute the value (eg 2+2)
            try {
                this.value = eval(this.rawVal)
                this.updateDepenencies()
            } 
            catch(e) {
                this.value = this.rawVal
            }
        }
        else{
            //substitute cell references with their values
            let formula = this.rawVal.substring(1)
            formula = this.sheet.replaceFunctions(formula)
            const cellRefRegex = /([A-Z]+)(\d+)/g
            formula = formula.replace(cellRefRegex, (match, colLetters, rowNumber) => {
                const cell = this.sheet.cellsMap.get(this.sheet.getCellKey(colLetters.charCodeAt(0) - 65, parseInt(rowNumber)))
                return cell ? (cell.value || cell.rawVal || 0) : 0
            })
            try {
                this.value = eval(formula)
                this.updateDepenencies()
            }
            catch(e) {
                this.value = `#ERROR`
            }
        }
    }

    mouseInside(x = mouseX, y = mouseY){
        return inBounds(x-heightCell, y-heightCell, this.pos.x, this.pos.y, widthCell, heightCell)
    }
}