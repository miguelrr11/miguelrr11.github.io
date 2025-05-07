//Self-avoiding Walk (backtracking)
//Miguel Rodríguez
//11-02-2024

const WIDTH = 600
const HEIGHT = 600
let n = 3
let widthN = WIDTH / n
let path = []
let board = []
let sumBoard = []
let tried = []
let timeData = [];
let maxSum = 0
let steps_per_update = 1
let startTime = 0;
let statsDiv;
let liveTimer;
let elapsedCpuTime = 0;


p5.disableFriendlyErrors = true // esta linea es magica

function reset() {
    path = [];
    tried = [];
    board = [];
    sumBoard = [];
    widthN = WIDTH / n;
    initB();
    let mid = 0
    let spot = board[mid][mid];
    sumBoard[mid][mid]++;
    maxSum = 1;
    path.push(spot);
    spot.visited = true;
    startTime = millis();
    steps_per_update *= 10
    steps_per_update = constrain(steps_per_update, 1, 750000)
    elapsedCpuTime = 0;
}



function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('canvas-holder');
    statsDiv = select('#stats');
    liveTimer = createP();            // create at the bottom
    liveTimer.parent(statsDiv);
    reset();
  }
  

function initB() {
    for (let i = 0; i < n; i++) {
        board[i] = new Array(n);
        sumBoard[i] = new Array(n);
        for (let j = 0; j < n; j++) {
            board[i][j] = new Spot(i, j);
            sumBoard[i][j] = 0;
        }
    }
}




function draw() {
    let cpuTimeStart = performance.now();

    for (let i = 0; i < steps_per_update; i++) {
        let current = path[path.length - 1];
        let spot = current.chooseNext();
    
        if (!spot) {
            let s = path.pop();
            s.clear();
            let val = ++sumBoard[s.i][s.j];
            if (val > maxSum) maxSum = val;
        } else {
            spot.visited = true;
            path.push(spot);
            let val = ++sumBoard[spot.i][spot.j];
            if (val > maxSum) maxSum = val;
        }
    
        if (path.length == n * n) break;
    }
    
    let cpuTimeEnd = performance.now();
    elapsedCpuTime += (cpuTimeEnd - cpuTimeStart); // milliseconds
    

    background(0);
    if (mouseIsPressed) drawSumBoard();
    if (path.length == n * n) {
        let elapsed = elapsedCpuTime / 1000; // convert to seconds
        timeData.push({ n: n, time: elapsed });

        // Finalize the live timer as a static line
        liveTimer.html(`n = ${n} → ${round(elapsed, 3)}s`);
        liveTimer = createP(); // Create new live timer for next n
        liveTimer.parent(statsDiv);


        n++;
        reset();
    }


    else {
        drawPath(0);
    }
    liveTimer.html(`n = ${n} → ${(millis() - startTime).toFixed(3) / 1000}s`);

}




function drawPath(n) {
    push()
    strokeWeight(widthN / 4)
    for (i = 0; i < path.length - 1; i++) {
        if (n == 0) stroke(map(i, 0, path.length - 1, 100, 255))
        else stroke(0, 255, 0)
        line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y)
    }
    strokeWeight(widthN / 2)
    point(path[path.length - 1].x, path[path.length - 1].y)
    pop()
}

function drawSumBoard() {
    push()
    noStroke()
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            fill(255, 0, 0, nonlinearMap(sumBoard[i][j], 0, maxSum, 0, 255))
            rect(i * widthN, j * widthN, widthN, widthN)
        }
    }
    pop()
}

function nonlinearMap(value, start1, stop1, start2, stop2, exponent = 0.25) {
    let norm = constrain((value - start1) / (stop1 - start1), 0, 1);
    let curved = Math.pow(norm, exponent);
    return start2 + curved * (stop2 - start2);
}