//Load Animation
//Miguel Rodríguez
//05-06-2025

p5.disableFriendlyErrors = true
const WIDTH = 600
const HEIGHT = 600

//Solo merece la pena si vas a cargar muchos assets, porque es muy rapido y casi no se aprecia la barra de carga
let assets = new Array(1000).fill().map(() => `fonts/1.otf`);
let loadedFonts = [];
let assetsLoaded = 0;

function loadFontAsync(path) {
    return new Promise((resolve, reject) => {
        loadFont(
            path,
            img => {
                assetsLoaded++
                resolve(img);
            },
            err => reject(new Error(path))
        );
    });
}

async function loadAllAssets() {
    try {
        const promises = assets.map(loadFontAsync);
        loadedFonts = await Promise.all(promises);
        console.log("All assets loaded via p5.js");
    } 
    catch (error) {
        console.error("Error loading asset:", error);
    }
}

function setup() {
    createCanvas(WIDTH, HEIGHT);
    angleMode(DEGREES); 
    textAlign(CENTER, CENTER);
    textSize(24);
    loadAllAssets();
}

function draw() {
    background(240);

    let cx = WIDTH / 2;
    let cy = HEIGHT / 2;
    let radius = 100;
    let percentage = assetsLoaded / assets.length;
    let angle = percentage * 360;

    // Draw base circle
    noFill();
    stroke(150);
    strokeWeight(20);
    arc(cx, cy, radius * 2, radius * 2, -90, -90 + angle);

    // Draw text
    noStroke();
    fill(0);
    if (assetsLoaded < assets.length) {
        text(`${Math.floor(percentage * 100)}%\n${assetsLoaded} / ${assets.length}`, cx, cy);
    } else {
        text("Assets loaded!", cx, cy);
    }
}