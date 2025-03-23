const CORNER = 0
const CENTER = 1

let width = undefined;
let height = undefined;
let canvas = undefined;
let ctx = undefined;
let curRectMode = CORNER
let curEllipseMode = CORNER

let lastTime = performance.now();
let targetFPS = 60;
let targetInterval = 1000 / targetFPS;
let accumulatedTime = 0;
let frameCount = 0;      // mimics p5.js frameCount (increments on each draw call)
let fps = 0;
let fpsDrawCount = 0;      // counts how many draw calls in a second
let fpsTimer = 0;

let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;
let key = ''
let mouseIsPressed = false;
let keyIsPressed = false;
let mouseIsDragged = false;

setup();
loop();

function loop() {
    let currentTime = performance.now();
    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    accumulatedTime += deltaTime;
    fpsTimer += deltaTime;

    if (accumulatedTime >= targetInterval) {
        frameCount++;      
        fpsDrawCount++;
        draw();        
        accumulatedTime -= targetInterval;
    }

    if (fpsTimer >= 1000) {
        fps = fpsDrawCount;
        fpsDrawCount = 0;
        fpsTimer -= 1000;
    }

    requestAnimationFrame(loop);
}

function frameRate(newfps = undefined) {
    if (newfps != undefined) {
        targetFPS = newfps;
        targetInterval = 1000 / targetFPS;
        return;
    }
    return fps;
}

function createCanvas(width, height) {
    canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx = getContext();
    ctx.scale(dpr, dpr);
    document.body.appendChild(canvas);
    initDefaults();
    return canvas;
}

function initDefaults(){
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
}

function getContext(){
    return canvas.getContext('2d');
}

function background(color){
    color = adaptColor(color);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function fill(color, transparency){
    color = adaptColor(color, transparency);
    ctx.fillStyle = color;
}

function stroke(color, transparency){
    color = adaptColor(color, transparency);
    ctx.strokeStyle = color;
}

function noFill(){
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
}

function noStroke(){
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
}

/*
Accpets these:
adaptColor('red')
adaptColor([255, 0, 0])
adaptColor([255, 0, 0, 0.5])
adaptColor(255)
adaptColor(255, 0.8)
*/
function adaptColor(color, transparency) {
    if (typeof color === 'number') {
        return `rgba(${color}, ${color}, ${color}, ${transparency ?? 1})`;
    }
    if (typeof color === 'string') {
        return color;
    }
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] ?? 1})`;
}


function strokeWeight(weight){
    ctx.lineWidth = weight;
}

function rectMode(mode){
    if (mode === CORNER || mode === CENTER) {
        curRectMode = mode;
    } 
    else {
        console.error('Invalid rectMode. Use CORNER or CENTER.');
    }
}

function ellipseMode(mode){
    if (mode === CORNER || mode === CENTER) {
        curEllipseMode = mode;
    } 
    else {
        console.error('Invalid ellipseMode. Use CORNER or CENTER.');
    }
}

function rect(x, y, width, height){
    let xPos = curRectMode === CENTER ? x - width / 2 : x;
    let yPos = curRectMode === CENTER ? y - height / 2 : y;
    ctx.fillRect(xPos, yPos, width, height);
    ctx.strokeRect(xPos, yPos, width, height);
}

function ellipse(x, y, width, height){
    let xPos = curEllipseMode === CENTER ? x - width / 2 : x;
    let yPos = curEllipseMode === CENTER ? y - height / 2 : y;
    ctx.beginPath();
    ctx.ellipse(xPos, yPos, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function point(x, y){
    const previousFillStyle = ctx.fillStyle;
    const radius = ctx.lineWidth / 2;
    
    ctx.fillStyle = ctx.strokeStyle;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.fillStyle = previousFillStyle;
}

function beginShape(){
    ctx.beginPath();
}

function vertex(x, y){
    ctx.lineTo(x, y);
}

function endShape(){
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

document.addEventListener('mousemove', function(event) {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY; 
    if(mouseIsPressed){
        mouseIsDragged = true;
        if (typeof mouseDragged === 'function') {
            mouseDragged(event);
        }
    }
});
document.addEventListener('click', function(event) {
    if (typeof mouseClicked === 'function') {
        mouseClicked(event);
    }
});
document.addEventListener('mouseup', function(event) {
    mouseIsPressed = false;
    mouseIsDragged = false;
    if (typeof mouseReleased === 'function') {
        mouseReleased(event);
    }
});
document.addEventListener('mousedown', function(event) {
    mouseIsPressed = true;
    if (typeof mousePressed === 'function') {
        mousePressed(event);
    }
});
document.addEventListener('keydown', function(event) {
    key = event.key;
    keyIsPressed = true;
    if (typeof keyPressed === 'function') {
        keyPressed(event);
    }
});
document.addEventListener('keyup', function(event) {
    keyIsPressed = false;
    if (typeof keyReleased === 'function') {
        keyReleased(event);
    }
});
document.addEventListener('keypress', function(event) {
    if (typeof keyTyped === 'function') {
        keyTyped(event);
    }
});
document.addEventListener('wheel', function(event) {
    if (typeof mouseWheel === 'function') {
        mouseWheel(event);
    }
});
document.addEventListener('wheel', function(event) {
    if (typeof mouseWheel === 'function') {
        mouseWheel(event.deltaY)
    }
});