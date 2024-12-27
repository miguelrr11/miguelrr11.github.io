//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 540
const HEIGHT = 540
const tamCell = WIDTH / 9
let font 

let panel, panel_takingNotes, panel_diff

let grid = []
let selected = {i: undefined, j: undefined}

function preload(){
    font = loadFont('tommy.otf')
}



function setup(){
    createCanvas(WIDTH+200, HEIGHT)
    initGrid()
    textFont(font)
    panel = new Panel({
        title: 'SUDOKU',
        x: WIDTH,
        w: 200,
        theme: 'light',
        automaticHeight: false
    })
    panel.createSeparator()
    panel_takingNotes = panel.createCheckbox("Taking notes", false)
    panel.createSeparator()
    panel_diff = panel.createSelect(['easy', 'medium', 'hard'], 'easy')
    panel.createButton('New Game', () => {
        generateGame(panel_diff.getSelected())
    })
    generateGame('easy')
}

function mouseClicked(){
    if(mouseX > WIDTH || mouseY > HEIGHT) return
    selected.i = Math.floor(mouseX / tamCell)
    selected.j = Math.floor(mouseY / tamCell)   
}

function keyPressed(){
    if(selected.i == undefined || selected.j == undefined) return
    
    if(keyCode == BACKSPACE){ 
        grid[selected.i][selected.j].value = undefined
        checkValidAll()
        return
    }
    let val = parseInt(String.fromCharCode(keyCode))
    if(!isFinite(val) || val == 0) return
    if(panel_takingNotes.isChecked() && grid[selected.i][selected.j].value == undefined){
        let cell = grid[selected.i][selected.j]
        if(cell.notes.has(val)) cell.notes.delete(val)
        else cell.notes.add(val)
        return
    }
    grid[selected.i][selected.j].value = val
    grid[selected.i][selected.j].valid = isValid(selected.i, selected.j, val)
    grid[selected.i][selected.j].notes.clear()
}

function initGrid(){
    for(let i = 0; i < 9; i++){
        grid[i] = []
        for(let j = 0; j < 9; j++){
            grid[i][j] = {
                //value: i + '' + j,
                value: undefined,
                valid: true,
                notes: new Set()
            }
        }
    }
}

function draw(){
    background(255)
    textFont(font)
    showSelected()
    showRowColSelected()
    showNotes()
    
    showLines()
    showValues()

    panel.update()
    panel.show()
}

function showLines(){
    push()
    stroke(150)
    strokeWeight(3)
    for(let i = 0; i < 10; i++){
        if(i % 3 == 0) strokeWeight(5)
        else strokeWeight(2.5)
        line(0, i*tamCell, WIDTH, i*tamCell)
        line(i*tamCell, 0, i*tamCell, HEIGHT)
    }
    pop()
}

function showSelected(){
    if(selected.i == undefined || selected.j == undefined) return
    push()
    fill(210)
    rect(selected.i*tamCell, selected.j*tamCell, tamCell, tamCell)
    pop()
}

function showRowColSelected(){
    if(selected.i == undefined || selected.j == undefined) return
    push()
    fill(0, 255, 0, 50)
    rect(selected.i*tamCell, 0, tamCell, HEIGHT)
    rect(0, selected.j*tamCell, WIDTH, tamCell)
    pop()
}

function showNotes(){
    push()
    noStroke()
    fill(170)
    textAlign(CENTER, CENTER)
    textSize(15)
    let off = tamCell * .17
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            let cell = grid[i][j]
            let notes = [...cell.notes]
            for(let k = 0; k < notes.length; k++){
                let note = notes[k]
                let offX = (((note+2) % 3) / 2) * (tamCell * .65)
                let offY = Math.floor((note - 1) / 3) * (tamCell * .29)
                text(note, i*tamCell + off + offX, j*tamCell + off + offY)
            }
            
        }
    }
    pop()
}

/*
0 -> 0
1 -> 1/2
2 -> 1
3 -> 0
4 -> 1/2
...
*/

function showValues(){
    push()
    noStroke()
    fill(0)
    textAlign(CENTER, CENTER)
    textSize(32)
    let off = tamCell * .5
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            let cell = grid[i][j]
            if(cell.value != undefined){
                if(cell.valid) fill(0)
                else fill(235, 0, 0)
                text(cell.value, i*tamCell + off, j*tamCell + off - 4)
            }
        }
    }
    pop()
}

function checkWin(){
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            let cell = grid[i][j]
            if(!cell.valid) return false
        }
    }
    return true
}

function checkValidAll(){
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            let cell = grid[i][j]
            if(cell.value != undefined && !cell.valid){
                cell.valid = isValid(i, j, cell.value)
            }
        }
    }
}

function isValid(x, y, val){
    if(!isValidRowCol(x, y, val) || 
       !isValidQuadrant(x, y, val)) return false
    return true
}

function isValidRowCol(x, y, val){
    for(let i = 0; i < 9; i++){
        if(i == x) continue
        if(grid[i][y].value == val) return false
    }
    for(let j = 0; j < 9; j++){
        if(j == y) continue
        if(grid[x][j].value == val) return false
    }
    return true
}


function isValidQuadrant(x, y, val){
    let startI = Math.floor(x/3) * 3
    let startJ = Math.floor(y/3) * 3
    for(let i = startI; i < startI + 3; i++){
        for(let j = startJ; j < startJ + 3; j++){
            if(x == i && y == j) continue
            if(grid[i][j].value == val) return false
        }
    }
    return true
}

function generateGame(difficulty){
    initGrid()
    let clues = 0
    let min, max
    if(difficulty == 'easy'){min = 36, max = 49}
    if(difficulty == 'medium') {min = 30, max = 35}
    if(difficulty == 'hard') {min = 17, max = 29}
    clues = Math.floor(random(min, max))

    generateSolvedGrid(grid)
    removeNumbers(grid, clues)
    let filled = 81 - countEmptyCells()
    if(filled < min || filled > max) generateGame(difficulty)
}

function countEmptyCells(){
    let empty = 0
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col].value === undefined) {
                empty++;
            }
        }
    }
    return empty
}

function generateSolvedGrid(grid, row = 0, col = 0) {
    if (row === 9) return true;
    if (col === 9) return generateSolvedGrid(grid, row + 1, 0);
    if (grid[row][col].value !== undefined) return generateSolvedGrid(grid, row, col + 1);

    let numbers = [...Array(9).keys()].map(x => x + 1).sort(() => Math.random() - 0.5);
    for (let num of numbers) {
        if (isValidAux(grid, row, col, num)) {
            grid[row][col].value = num;
            if (generateSolvedGrid(grid, row, col + 1)) return true;
            grid[row][col].value = undefined;
        }
    }

    return false;
}

function removeNumbers(grid, clues) {
    let totalCells = 81;
    let removedCells = 0;

    while (removedCells < totalCells - clues) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);

        if (grid[row][col].value !== undefined) {
            let backup = grid[row][col].value;
            grid[row][col].value = undefined;

            // Ensure the puzzle still has a unique solution
            if (countSolutions(grid) !== 1) {
                grid[row][col].value = backup; // Restore if not unique
            } 
            else {
                removedCells++;
            }
        }
    }
}

function findCandidates(grid, row, col) {
    let candidates = new Set(Array.from({ length: 9 }, (_, i) => i + 1));

    // Remove numbers in the row
    for (let x = 0; x < 9; x++) candidates.delete(grid[row][x].value);

    // Remove numbers in the column
    for (let x = 0; x < 9; x++) candidates.delete(grid[x][col].value);

    // Remove numbers in the 3x3 subgrid
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            candidates.delete(grid[startRow + i][startCol + j].value);
        }
    }

    return Array.from(candidates);
}

function countSolutions(grid) {
    let solutions = 0;

    function solve(grid) {
        // Find the next empty cell
        let emptyCell = null;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col].value === undefined) {
                    emptyCell = { row, col };
                    break;
                }
            }
            if (emptyCell) break;
        }
    
        if (!emptyCell) {
            solutions++;
            return solutions > 1; // Stop if more than 1 solution
        }
    
        let { row, col } = emptyCell;
        let candidates = findCandidates(grid, row, col); // Get valid candidates
    
        for (let num of candidates) {
            grid[row][col].value = num;
            if (solve(grid)) return true;
            grid[row][col].value = undefined; // Backtrack
        }
    
        return false; // No solution found
    }

    solve(grid);
    return solutions;
}

function hasUniqueSolution(grid) {
    return countSolutions(grid) === 1;
}

function isValidAux(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x].value === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col].value === num) return false;
    }

    // Check 3x3 subgrid
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j].value === num) return false;
        }
    }

    return true;
}
