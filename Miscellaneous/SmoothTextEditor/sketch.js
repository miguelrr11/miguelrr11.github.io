//Smooth Text Editor
//Miguel Rodríguez
//31-03-2025

p5.disableFriendlyErrors = true;
const WIDTH = 600;
const HEIGHT = 600;

let font;
let scl = 4;
let sclTarget = 4;

let lines = ["Type..."];
let cursor = { line: 0, col: lines[0].length };

let camPos;
let camTarget;

function preload() {
    font = loadFont("font.ttf");
}

function setup() {
    createCanvas(WIDTH, HEIGHT);
    textAlign(LEFT, TOP);
    textFont(font);
    fill(255);
    noStroke();
    textSize(15);
    camPos = createVector(width / 2, height / 2);
    updateCameraTarget();
}

function draw() {
    background(0);
    updateCameraTarget();
    scl = lerp(scl, sclTarget, 0.1);
    camPos.lerp(camTarget, 0.1);
    translate(camPos.x, camPos.y);
    scale(scl);

    let wholeText = lines.join("\n");
    text(wholeText, 0, 0);

    let cursorX = textWidth(lines[cursor.line].substring(0, cursor.col));
    let cursorY = textLeading() * cursor.line;
    let cursorW = textWidth("M"); 
    let cursorH = textAscent() + textDescent();

    fill(255, Math.abs(Math.cos(frameCount / 25)) * 255);
    rect(cursorX, cursorY, cursorW, cursorH);
    
    fill(255);
}

function updateCameraTarget() {
    let cursorX = textWidth(lines[cursor.line].substring(0, cursor.col));
    let cursorY = textLeading() * cursor.line;
    camTarget = createVector(
        width / 2 - cursorX * scl,
        height / 2 - cursorY * scl
    );   
    
}

function updateScl(){
    let lineLength = lines[cursor.line].length;
    let factor = 0.2;
    sclTarget = 4 / (1 + factor * Math.log(1 + lineLength));
}

function insertChar(ch) {
    let lineStr = lines[cursor.line];
    lines[cursor.line] = lineStr.slice(0, cursor.col) + ch + lineStr.slice(cursor.col);
    cursor.col++;
    updateCameraTarget();
    updateScl()
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
    else if (key !== "Tab" && keyCode !== BACKSPACE) {
        insertChar(key);
    }
}

function keyPressed() {
    if (keyCode === BACKSPACE) {
        deleteChar();
    } 
    else if (key === "Tab") {
        insertChar(" ");
        insertChar(" ");
        insertChar(" ");
        insertChar(" ");
    } 
    else if (keyCode === LEFT_ARROW) {
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
    else if (keyCode === RIGHT_ARROW) {
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
