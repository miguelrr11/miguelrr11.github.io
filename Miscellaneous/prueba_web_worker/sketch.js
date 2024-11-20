//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600
const N = 600
const spacing = WIDTH/N

let arr = []
let new_arr = []

let arr1, arr2, arr3, arr4
let fin1 = false
let fin2 = false
let fin3 = false
let fin4 = false
let started = false

let multi = true

const neigh = [[-1, 0], [1, 0], [0, 1], [0, -1], [0, 0]]

let worker1 = new Worker("worker.js")
worker1.onmessage = function(message){
    fin1 = true
    arr1 = message.data
}

let worker2 = new Worker("worker.js")
worker2.onmessage = function(message){
    fin2 = true
    arr2 = message.data
}

let worker3 = new Worker("worker.js")
worker3.onmessage = function(message){
    fin3 = true
    arr3 = message.data
}

let worker4 = new Worker("worker.js")
worker4.onmessage = function(message){
    fin4 = true
    arr4 = message.data
}

function setup(){
    createCanvas(WIDTH, HEIGHT)

    for(let i = 0; i < N; i++){
        arr[i] = []
        new_arr[i] = []
        for(let j = 0; j < N; j++){
            arr[i][j] = noise(i*0.05, j*0.05)
            //arr[i][j] = 0.5
        }
    }
    noStroke()
}

function draw() {
    background(0);

    if(multi){
        if (!started) {
            arr1 = arr.slice(0, N / 4 + 1);  // Include extra row from arr2 for worker1
            arr2 = arr.slice((N / 4) - 1, 2*(N / 4) + 1);
            arr3 = arr.slice(2*(N / 4) - 1, 3*(N / 4) + 1);
            arr4 = arr.slice(3*(N / 4) - 1, N);  // Include extra row from arr1 for worker2

            worker1.postMessage([arr1, neigh]);
            worker2.postMessage([arr2, neigh]);
            worker3.postMessage([arr3, neigh]);
            worker4.postMessage([arr4, neigh]);
            
            started = true;
        }

        if (fin1 && fin2) {
            // Merge arr1 and arr2 without modifying them
            //let newArr = arr1.slice(0, arr1.length - 1).concat(arr2.slice(0, arr2.length - 1)).concat(arr3.slice(0, arr3.length - 1)).concat(arr4.slice(0, arr4.length-1))
            arr = arr1.concat(arr2.slice(1, arr2.length - 1).concat(arr3.slice(1, arr3.length - 1).concat(arr4.slice(0, arr4.length - 1))))
            
            // Reset flags
            started = false;
            fin1 = false;
            fin2 = false;
        }
    }
    

    else{
        let new_arr = [];
        for (let i = 0; i < arr.length; i++) {
            new_arr[i] = [];
        }

        let sum, div;
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[0].length; j++) {
                sum = 0;
                div = 0;
                for (let n of neigh) {
                    let ni = i + n[0];
                    let nj = j + n[1];

                    if (ni >= 0 && ni < arr.length && nj >= 0 && nj < arr[0].length) {
                        sum += arr[ni][nj];
                        div++;
                    }
                }

                new_arr[i][j] = sum / div;
            }
        }

        SWAP(arr, new_arr)
    }
    

    // Render the array
    loadPixels()
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[0].length; j++) {
            let col = arr[i][j] * 255;
            drawFastRect(i * spacing, j * spacing, spacing, spacing, col, col, col)
            //fill(col);
            //rect(i * spacing, j * spacing, spacing, spacing);
        }
    }
    updatePixels()
}



function SWAP(x0, x) {
    let temp = x0.slice();  // Copy contents of x0
    x0.length = 0;          // Clear x0
    x0.push(...x);          // Copy contents of x to x0
    x.length = 0;           // Clear x
    x.push(...temp);        // Copy contents of temp (old x0) to x
}
