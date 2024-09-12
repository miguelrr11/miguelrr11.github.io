//ASCII Camera
//Miguel Rodríguez
//12-09-2024

p5.disableFriendlyErrors = true
let div
let cam
const deg = "Ñ@#W$90?!abc;:+=-,._              ";
//const deg = '  .:░▒▓█';

function setup(){
    noCanvas()
    div = createDiv(0, 0)
    let constraints = {
    video: {
      mandatory: {
        maxWidth: 100,
        maxHeight: 50
      }
    },
    audio: false,
    flipped: true
    };
    cam = createCapture(constraints)
    //cam.hide()
}

function draw(){
    background(0)
    cam.loadPixels()
    let ascii = ""
    for(let j = 0; j < cam.height; j++){
        for(let i = 0; i < cam.width; i++){
            const pixelIndex = (i + j * cam.width) * 4;
            let r = cam.pixels[pixelIndex]
            let g = cam.pixels[pixelIndex+1]
            let b = cam.pixels[pixelIndex+2]
            let avg = (r+b+g)/3
            if(b == undefined) console.log(pixelIndex)
            let c = deg[floor(map(avg, 0, 255, 0, deg.length-1))]
            if (c == " ") ascii += "&nbsp;";
            else ascii += c
        }
        ascii += "<br/>"
    }
    div.html(ascii)
    cam.updatePixels()
}
