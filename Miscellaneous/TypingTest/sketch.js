//Smooth Text Editor
//Miguel Rodríguez
//31-03-2025

p5.disableFriendlyErrors = true;
const WIDTH = 900;
const HEIGHT = 250;

let font;
let scl = 5;
let sclTarget = scl;

let lines = [""];
let lessonLines = []
let cursor = { line: 0, col: lines[0].length };

let currentWord
let wpm = 0
let wpmArr = []

let camPos;
let camTarget;


async function setup() {
    font = await loadFont("font.ttf");
    createCanvas(WIDTH, HEIGHT);
    textAlign(LEFT, TOP);
    textFont(font);
    fill(255);
    noStroke();
    textSize(15);
    camPos = createVector(width / 2, height / 2);
    updateCameraTarget();

    let str = ""
    for(let i = 0; i < 300; i++){
        let randomWord = random(words)
        str += randomWord + " ";
    }
    lessonLines = [str]

    
}

function draw() {
    background(0);

    fill(150)
    text(wpm.toFixed(1) + " WPM", 10, 10);

    updateCameraTarget();
    scl = lerp(scl, sclTarget, 0.1);
    camPos.lerp(camTarget, 0.1);
    translate(camPos.x, camPos.y);
    scale(scl);

    let displayLine = lines[cursor.line].replace(/ /g, "_");
    let cursorX = textWidth(displayLine.substring(0, cursor.col));
    let cursorY = (textLeading() * cursor.line) - 2;
    let cursorW = textWidth("M"); 
    let cursorH = textAscent() + textDescent();

    fill(255, Math.abs(Math.cos(frameCount / 25)) * 255);
    rect(cursorX, cursorY, cursorW, cursorH);

    let wholeLinesLesson = lessonLines.join("\n");
    fill(100);
    text(wholeLinesLesson, 0, 0);

    fill(255);
    let wholeText = lines.join("\n");
    text(wholeText, 0, 0);

    
    
    fill(255);
}

function updateCameraTarget() {
    let cursorX = textWidth(lines[cursor.line].substring(0, cursor.col));
    let cursorY = (textLeading() * cursor.line) - 2;
    camTarget = createVector(
        width / 2 - cursorX * scl,
        height / 2 - cursorY * scl
    );   
    
}

function updateScl(){
    let lineLength = lines[cursor.line].length;
    let factor = 0.2;
    sclTarget = 5 / (1 + factor * Math.log(1 + lineLength));
}

function insertChar(ch) {
    let lineStr = lines[cursor.line];
    lines[cursor.line] = lineStr.slice(0, cursor.col) + ch + lineStr.slice(cursor.col);
    cursor.col++;
    updateCameraTarget();
    updateScl()
    if(ch === " ") nextWord()
}

function nextWord(){
    //check if the current word is correct, if it is, calculate the wpm and update the current word to the next one
    let typedWord = lines[cursor.line].split(" ")[currentWord.wordIndex]
    console.log("Typed word: " + typedWord)
    console.log("Current word: " + currentWord.word)
    if(typedWord === currentWord.word){
        let timeTaken = (millis() - currentWord.timeStart) / 1000; 
        let wpmWord = (60 / timeTaken)
        wpmArr.push(wpmWord);
        if(wpmArr.length > 5) wpmArr.shift();
        wpm = wpmArr.reduce((a, b) => a + b, 0) / wpmArr.length;
        let nextWordIndex = currentWord.wordIndex + 1;
        currentWord = {
            wordIndex: nextWordIndex,
            word: lessonLines[0].split(" ")[nextWordIndex],
            timeStart: millis()
        }
    }

}

function deleteChar() {
    if (cursor.col > 0) {
        let lineStr = lines[cursor.line];
        lines[cursor.line] =
            lineStr.slice(0, cursor.col - 1) + lineStr.slice(cursor.col);
        cursor.col--;
    }
     else if (cursor.line > 0) {
        let removed = lines.splice(cursor.line, 1)[0];
        cursor.line--;
        cursor.col = lines[cursor.line].length;
        lines[cursor.line] += removed;
    }
    updateCameraTarget();
    updateScl()
}

function insertNewLine() {
    let lineStr = lines[cursor.line];
    let before = lineStr.slice(0, cursor.col);
    let after = lineStr.slice(cursor.col);
    lines[cursor.line] = before;
    lines.splice(cursor.line + 1, 0, after);
    cursor.line++;
    cursor.col = 0;
    updateCameraTarget();
    updateScl()
}

function keyTyped() {
    if (key === "Enter") {
        insertNewLine();
    } 
    else if (key !== "Tab" && keyCode !== 8) {
        let charOfLesson = lessonLines.join("\n").charAt(lines.join("\n").length);
        if(key === charOfLesson){ 
            insertChar(key);
            if(!currentWord) {
                currentWord = {
                    wordIndex: 0,
                    word: lessonLines[0].split(" ")[0],
                    timeStart: millis()
                }
            }
        }
    }
}

function keyPressed() {
    if (keyCode === 8) {
        deleteChar();
    } 
    else if (key === "Tab") {
        insertChar(" ");
        insertChar(" ");
        insertChar(" ");
        insertChar(" ");
    } 
    else if (keyCode === 37) {
        if (cursor.col > 0) {
            cursor.col--;
        } 
        else if (cursor.line > 0) {
            cursor.line--;
            cursor.col = lines[cursor.line].length;
        }
        updateCameraTarget();
        updateScl()
    } 
    else if (keyCode === 39) {
        if (cursor.col < lines[cursor.line].length) {
            cursor.col++;
        } 
        else if (cursor.line < lines.length - 1) {
            cursor.line++;
            cursor.col = 0;
        }
        updateCameraTarget();
        updateScl()
    } 
    else if (keyCode === UP_ARROW) {
        if (cursor.line > 0) {
            cursor.line--;
            cursor.col = min(cursor.col, lines[cursor.line].length);
        }
        updateCameraTarget();
        updateScl()
    } 
    else if (keyCode === DOWN_ARROW) {
        if (cursor.line < lines.length - 1) {
            cursor.line++;
            cursor.col = min(cursor.col, lines[cursor.line].length);
        }
        updateCameraTarget();
        updateScl()
    }
}
