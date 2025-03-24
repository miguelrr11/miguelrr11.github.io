// BrainFuck Visualizer
// Miguel Rodríguez
// 24-03-2025

p5.disableFriendlyErrors = true;
const WIDTH = 1000;
const HEIGHT = 800;

let iterPerFrame = 1; // Number of iterations per frame

let examples = [
    {name: 'Sierpinsky', code: '++++++++[>+>++++<<-]>++>>+<[-[>>+<<-]+>>]>+[-<<<[->[+[-]+>++>>>-<<]<[<]>>++++++[<<+++++>>-]+<<++.[-]<<]>.>+[>>]>+]'},
    {name: 'Squares', code: '++++[>+++++<-]>[<+++++>-]+<+[>[>+>+<<-]++>>[<<+>>-]>>>[-]++>[-]+>>>+[[-]++++++>>>]<<<[[<++++++++<++>>-]+<.<[>----<-]<]<<[>>>>>[>>>[-]+++++++++<[>-<-]+++++++++>[-[<->-]+[<<<]]<[>+<-]>]<<-]<<-]'},
    {name: 'Fibonacci', code: '>++++++++++>+>+[[+++++[>++++++++<-]>.<++++++[>--------<-]+<<<]>.>>[[-]<[>+<-]>>[<<+>+>-]<[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>[-]>+>+<<<-[>+<-]]]]]]]]]]]+>>>]<<<]'},
    {name: 'Golden ratio', code: '+>>>>>>>++>+>+>+>++<[+[--[++>>--]->--[+[+<+[-<<+]++<<[-[->-[>>-]++<[<<]++<<-]+<<]>>>>-<<<<<++<-<<++++++[<++++++++>-]<.---<[->.[-]+++++>]>[[-]>>]]+>>--]+<+[-<+<+]++>>]<<<<[[<<]>>[-[+++<<-]+>>-]++[<<]<<<<<+>]>[->>[[>>>[>>]+[-[->>+>>>>-[-[+++<<[-]]+>>-]++[<<]]+<<]<-]<]]>>>>>>>]'},
    {name: 'Thue morse', code: '>>++++++[>++++++++<-]+[[>.[>]+<<[->-<<<]>[>+<<]>]>++<++]'},
    {name: 'Impeccable', code: '>>>->+[[[<<+>+>-]++++++[<<++++++++>>-]<<-.[-]<]++++++++++.[-]>>>++<[[-[[>>>]<<<-[+>>>]<<<[<<<]+>]<-[+>++++++++++>>]>]>>>[[>+<-]>>>]<<[-[<++>-[<++>-[<++>-[<++>-[<[-]>-[<++>-]>>[<+<]>[->]<++<<]]]]]<+<<]>]>[>>>]<<<]'},
    //{name: 'Hello World', code: '+>>>>>>>>>>-[,+[-.----------[[-]>]<->]<]'},
];

let code = examples[0].code;
let cp = 0; 
let oldCp = 0;
let tamMem = 50000;
let memory = new Array(tamMem).fill(0);
let mp = Math.floor(tamMem/2); 
let oldMp = mp;
let output = '';
let maxIterations = 10000; 
let iterations = 0;
let curCode = 0;
let font, size;
let paused = false;
let awaitingInput = false; // New flag for input state
let inputChar = ''; // Store the input character

function reset(nCode){
    code = examples[nCode].code;
    cp = 0; 
    oldCp = 0;
    tamMem = 50000;
    memory = new Array(tamMem).fill(0);
    mp = Math.floor(tamMem/2); 
    oldMp = mp;
    output = '';
    maxIterations = 10000; 
    iterations = 0;
    paused = false;
    awaitingInput = false; // Reset input state
    inputChar = '';
    size = getSizeText(code, WIDTH - 30);
}

function preload(){
    font = loadFont('monocode.ttf');
}

function setup() {
    createCanvas(WIDTH, HEIGHT);
    textFont(font);
    size = getSizeText(code, WIDTH - 30);
    frameRate(60);
}

function getSizeText(text, w){
    let size = 20;
    textSize(size);
    fill(255);
    noStroke();
    while(textWidth(text) > w){
        size -= 0.1;
        textSize(size);
    }
    return size;
}

function drawCodeText(){
    push();
    textAlign(CENTER, CENTER);
    let s = textWidth(code[0]);
    let hChar = textAscent() + textDescent();
    rectMode(CENTER);
    for(let i = 0; i < code.length; i++){
        let x = 20 + i * s + s/2;
        let y = 75;
        if(i == cp){
            fill(0, 255, 0);
            rect(x, y, s, hChar);
            fill(255);
        }
        text(code[i], x, y);
    }
    pop();
}

function keyPressed() {
    if (keyCode === 32) { // Space
        paused = !paused;
        if (!paused) awaitingInput = false; // Resume clears input wait
    }
    else if (keyCode === 83) { // 'S' key
        iterPerFrame *= 10;
        if(iterPerFrame > 10000) iterPerFrame = 1;
    }
    else if (keyCode === RIGHT_ARROW && paused) {
        iteration();
    }
    else if (keyCode === ENTER) {
        curCode = (curCode + 1) % examples.length;
        reset(curCode);
    }
    else if (awaitingInput && key.length === 1) { // Accept single character input
        inputChar = key;
        memory[mp] = inputChar.charCodeAt(0); // Store ASCII value
        awaitingInput = false; // Resume execution
        paused = false; // Continue running
        cp++; // Move past the comma
        iterations++;
    }
}

function draw() {
    background(30);

    textAlign(CENTER);
    fill(200);
    noStroke();
    textSize(17);
    text('- B R A I N F U C K -', width/2, 40);
    textAlign(LEFT);

    translate(0, 30);

    fill(255);
    noStroke();
    textSize(32);
    text('Code:', 20, 50);
    textSize(size);
    drawCodeText();
    textSize(11);
    text('Program: ' + examples[curCode].name, 20, 150);

    drawCode();

    fill(255);
    noStroke();
    textSize(32);
    text('Memory:', 20, 215);

    drawMemory(paused);

    fill(255);
    noStroke();
    textSize(11);
    text('Iteration: ' + iterations, 20, 300);
    textSize(32);
    text('Output:', 20, 370);
    textSize(10);
    text(output, 20, 400);

    if (awaitingInput) {
        fill(255, 255, 0);
        textSize(20);
        text('Enter a character:', 20, 450);
        textSize(16);
        text('(Type a key)', 20, 480);
    }

    if(dist(mouseX, mouseY, width, 0) >= 50){
        textAlign(RIGHT);
        fill(90);
        textSize(10);
        text('Controls', width-15, -10);
    }
    else{
        textAlign(RIGHT);
        fill(255);
        textSize(10);
        text('[SPACE] to pause\n[ARROW] to advance\n[ENTER] to change program\n[S] to change speed\nCurrent speed: ' + iterPerFrame, width-15, -10);
    }
    textAlign(LEFT);

    if (!paused && !awaitingInput) {
        for(let i = 0; i < iterPerFrame; i++) iteration();
    }
}

function drawCode(){
    let rectW = 35;
    let rectH = 25;
    let off = 2;
    let dupOff = off * 2;
    push();
    textAlign(CENTER, CENTER);
    oldCp = lerp(oldCp, cp, 0.1);
    translate(width/2 - oldCp*rectW, 100);
    textSize(20);
    for(let i = 0; i < code.length; i++){
        let realX = i * rectW - oldCp * rectW + width/2;
        let trans = map(Math.abs(realX - width/2), 0, width/2, 255, 30);
        if(realX < -50 || realX > width) continue;
        let char = code[i];
        fill(60, trans);
        stroke(255, trans);
        strokeWeight(2);
        rect(i * rectW + off, 0, rectW - dupOff, rectH);
        fill(255);
        noStroke();
        text(char, i * rectW + rectW/2, rectH / 2);
    }
    stroke(255);
    strokeWeight(2);
    line(oldCp * rectW + rectW/2, rectH+15, oldCp * rectW - 8 + rectW/2, rectH+30);
    line(oldCp * rectW + rectW/2, rectH+15, oldCp * rectW + 8 + rectW/2, rectH+30);
    pop();
}

function drawMemory(paused) {
    let rectW = 35;
    let rectH = 25;
    let off = 2;
    let dupOff = off * 2;
    push();
    textAlign(CENTER, CENTER);
    
    let start, end, pointerX;
    
    if (paused) {
        oldMp = lerp(oldMp, mp, 0.1);
        let startIndex = Math.floor(oldMp) - 25;
        if (startIndex < 0) startIndex = 0;
        if (startIndex + 50 > memory.length) {
            startIndex = memory.length - 50;
            if (startIndex < 0) startIndex = 0;
        }
        translate(width/2 - (oldMp - startIndex) * rectW, 250);
        
        start = startIndex;
        end = startIndex + 50;
        pointerX = (oldMp - startIndex) * rectW;
    } else {
        start = mp - 25;
        end = mp + 25;
        if (start < 0) start = 0;
        if (end > memory.length) end = memory.length;
        translate(width/2 - (25 * rectW), 250);
        
        pointerX = (mp - start) * rectW;
    }
    
    textSize(18);
    for (let i = start; i < end; i++) {
        let realX = (i - start) * rectW - (paused ? (oldMp - start) * rectW : (mp - start) * rectW) + width/2;
        let trans = map(Math.abs(realX - width/2), 0, width/2, 255, 30);
        let cellValue = memory[i];
        fill(60, trans);
        stroke(255, trans);
        strokeWeight(2);
        rect((i - start) * rectW + off, 0, rectW - dupOff, rectH);
        cellValue === 0 ? fill(90, trans) : fill(255, trans);
        noStroke();
        text(cellValue, (i - start) * rectW + rectW/2, rectH/2);
    }
    
    stroke(255);
    strokeWeight(2);
    line(pointerX + rectW/2, rectH+15, pointerX - 8 + rectW/2, rectH+30);
    line(pointerX + rectW/2, rectH+15, pointerX + 8 + rectW/2, rectH+30);
    
    pop();
}

function iteration(){
    if (cp >= code.length) {
        return;
    }

    let command = code[cp];
    let enteredLoop = false;
        
    switch(command) {
        case '+': 
            memory[mp]++;
            break;
        case '-': 
            memory[mp]--;
            break;
        case '>': 
            oldMp = mp;
            mp++;
            break;
        case '<': 
            oldMp = mp;
            mp--;
            break;
        case '.':
            output += String.fromCharCode(memory[mp]);
            break;
        case ',':
            paused = true; // Pause execution
            awaitingInput = true; // Wait for user input
            return; // Exit iteration until input is provided
        case '[':
            if (memory[mp] === 0) {
                oldCp = cp;
                let nest = 1;
                enteredLoop = true;
                while (nest > 0 && cp < code.length) {
                    cp++;
                    if (cp >= code.length) {
                        console.log('Unmatched [');
                        return;
                    }
                    if (code[cp] === '[') nest++;
                    if (code[cp] === ']') nest--;
                }
            }
            break;
        case ']':
            if (memory[mp] !== 0) {
                oldCp = cp;
                let nest = 1;
                enteredLoop = true;
                while (nest > 0 && cp > 0) {
                    cp--;
                    if (cp < 0) {
                        console.log('Unmatched ]');
                        return;
                    }
                    if (code[cp] === ']') nest++;
                    if (code[cp] === '[') nest--;
                }
            }
            break;
    }
    if (!enteredLoop) oldCp = cp;
    cp++;
    iterations++;
}