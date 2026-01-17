//
//Miguel Rodríguez
//

p5.disableFriendlyErrors = true
const WIDTH = 1080
const HEIGHT = 1920

let uploadedFile = null
let albumData = null

let fontRegular;
let fontRegularItalic;
let fontRegularCrammed;
let fontRegularCondensed;
let fontHeavy;
let fontLight

let musicChar = '♫'

var utils = new p5.Utils();

async function setup(){
    fontRegular = await loadFont('fonts/Vidaloka-Regular.ttf');
    fontRegularItalic = await loadFont('fonts/Coolvetica Rg It.otf');
    fontRegularCrammed = await loadFont('fonts/Coolvetica Rg Cram.otf');
    fontRegularCondensed = await loadFont('fonts/groteskMed.ttf');
    fontHeavy = await loadFont('fonts/grotesk.otf');
    fontLight = await loadFont('fonts/groteskLight.ttf');

    createCanvas(WIDTH, HEIGHT)
    createFileInput(handleFile).position(width, 10).style('font-size', '34px');
}

function handleFile(file) {
    uploadedFile = file;
    processFile()
    printAlbum()
}

function processFile(){
    if(uploadedFile && uploadedFile.type === 'application' && uploadedFile.subtype === 'json'){
        albumData = uploadedFile.data.album
        console.log(albumData)
    } 
    else {
        console.log("Please upload a valid json file.")
    }
}

function shortenText(text, maxLength){
    if(textWidth(text) <= maxLength) return text;
    let newText = text.substring(0, text.length - 1)
    while(textWidth(newText + '...') > maxLength && newText.length > 0){
        newText = newText.substring(0, newText.length - 1)
        if(newText.length == 0) return '...';
    }
    return newText + '...';
}

function getMaxTextSize(text, maxWidth, maxStartSize){
    let textSizeValue = maxStartSize;
    textSize(textSizeValue);
    while(textWidth(text) > maxWidth && textSizeValue > 0){
        textSizeValue -= 1;
        textSize(textSizeValue);
    }
    return textSizeValue;
}

async function printAlbum(){
    background(200)
    let imgBW = await loadImage(albumData.imageUrl);
    imgBW.filter(GRAY);
    imgBW.filter(BLUR, 2);
    imgBW.filter(ERODE);
    imgBW = dimImage(imgBW, 190);
    imageMode(CENTER)
    image(imgBW, width * 0.5, height * 0.5, height, height);

    
    imageMode(CORNER)
    let y = 50
    let img = await loadImage(albumData.imageUrl);
    utils.beginShadow("#000000", 50, 0, 0);
    rect(width * 0.45, y + 185, width * 0.5, width * 0.5);
    image(img, width * 0.45, y + 185, width * 0.5, width * 0.5);
    

    let leftMargin = 50
    let topMargin = 50
    let titleMaxWidth = width

    if(!albumData) return;

    //blendMode(DIFFERENCE);

    //TITLE
    utils.beginShadow("#000000", 20, 0, 0);
    textAlign(LEFT, TOP);
    textFont(fontHeavy);
    textSize(getMaxTextSize(albumData.title, titleMaxWidth - leftMargin * 2, 100));
    fill(255);
    textLeading(80);
    text(albumData.title, leftMargin, topMargin + y);
    textAlign(LEFT, TOP);


    // ARTIST
    textFont(fontRegularCondensed);
    textLeading(60);
    textSize(50);
    fill(255);
    text(albumData.artist, leftMargin, topMargin + y + 120, width * 0.35);

    let bbox = fontRegularCondensed.textBounds(albumData.artist, leftMargin, topMargin + y + 120, width * 0.35);

    // YEAR
    y += bbox.h;
    textFont(fontLight);
    textLeading(60);
    textSize(38);
    fill(230);
    text("\n" + 
        albumData.year + "\n", leftMargin, topMargin + y + 85, width * 0.35);
    
    // GENRES
    textSize(30)
    textLeading(40)
    text("\n" + 
        "\n" +
        "\n" +
        shortenText(albumData.genre, width * 0.35), leftMargin, topMargin + y + 75, width * 0.35);

    // funfact
    textSize(30)
    textLeading(40)
    fill(230)
    text("\n" + 
        "\n" +
        "\n" +
        "\n" +
        albumData.funfact, leftMargin, topMargin + y + 120, width * 0.35);
    utils.endShadow();

    // textFont(fontRegularItalic)
    // // textSize(40);
    // push()
    // textAlign(LEFT, BOTTOM);
    // //text(albumData.genres.join("\n"), leftMargin, y + 720, titleMaxWidth);
    // pop()

    y = 800
    let x = 275
    // fill(255)
    // textSize(60)
    // textFont(fontRegularCondensed)
    // text("Tracklist", leftMargin, y, titleMaxWidth);
    y += 80

    let spacing = Math.min(map(albumData.tracks.length, 5, 20, 80, 45, true), 70)

    let colorMap = {
        "GOAT": "#ffffff",
        "S": "#ffd21f",
        "A": "#ff1fa9",
        "B": "#bc3fde",
        "C": "#38b6ff",
        "D": "#14b60b",
        "F": "#902020",
        "Interlude": "#b2b2b2"
    };

    rectMode(CENTER);
    let w = (leftMargin + x) * 0.75;
    let h = 40;

    textSize(60)
    textFont(fontRegular);
    let textAscent_ = textAscent();
    let textDescent_ = textDescent();
    let textHeight = textAscent_ + textDescent_;
    let rectCenterOffset = textAscent_ - textHeight / 2;

    for(let i = 0; i < albumData.tracks.length; i++){
        let track = albumData.tracks[i];
        let trackY = y;

        // Draw rectangle aligned with text
        let gradeColor = colorMap[track.grade] || "#888888";
        fill(gradeColor);
        if(track.grade == 'GOAT'){
            utils.beginLinearGradient(
                ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd", ],//Colors
                (leftMargin + x) * 0.5 - w * 0.5,    // gradient begin point x
                trackY - rectCenterOffset,   // gradient begin point y
                (leftMargin + x) * 0.5 + w * 0.5,    // gradient end point x
                trackY - rectCenterOffset,   // gradient end point y
                [0, .2, .38, .59, 1]           // Position of each color.
            );
        }
        noStroke();
        if(track.grade == 'GOAT') utils.beginShadow("#ffffff", 50, 0, 0);
        if(track.grade == 'S') utils.beginShadow(colorMap[track.grade], 35, 0, 0);
        rect((leftMargin + x) * 0.5, trackY - rectCenterOffset, w, h, 20);
        if(track.grade == 'GOAT' || track.grade == 'S') utils.endShadow();

        if(track.grade == 'GOAT'){
            textAlign(CENTER, CENTER);
            blendMode(MULTIPLY)
            fill(255);
            textFont(fontRegular);
            textSize(50);
            text("GOAT", (leftMargin + x) * 0.5, trackY - rectCenterOffset);
            blendMode(BLEND)
            textSize(60);
        }

        // Draw text
        fill(255)
        textAlign(LEFT, BASELINE);
        text(shortenText((i + 1).toString() + ". " + track.title + (track.playing ? " " + musicChar : ""), 700), leftMargin + x, trackY);

        y += spacing;
    }

    // Album grade rectangle at bottom
    let gradeRectHeight = 150;
    let gradeColor = colorMap[albumData.albumGrade] || "#888888";
    fill(gradeColor);
    rectMode(CORNER);
    noStroke();

    if(albumData.albumGrade == 'GOAT'){
        utils.beginLinearGradient(
            ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
            0, height - gradeRectHeight,
            width, height - gradeRectHeight,
            [0, .2, .38, .59, 1]
        );
        utils.beginShadow("#ffffff", 50, 0, 0);
    } else if(albumData.albumGrade == 'S'){
        utils.beginShadow(colorMap[albumData.albumGrade], 35, 0, 0);
    }

    rect(0, height - gradeRectHeight, width, gradeRectHeight, 20, 20, 0, 0);

    if(albumData.albumGrade == 'GOAT' || albumData.albumGrade == 'S'){
        utils.endShadow();
    }

    let namingMap = {
        "GOAT": "GOAT",
        "S": "PEAK",
        "A": "EXCEPTIONAL",
        "B": "STRONG",
        "C": "DECENT",
        "D": "MEH",
        "F": "FLOP",
        "Interlude": "INTERLUDE"
    }

    textAlign(CENTER, CENTER);
    fill(255);
    textFont(fontHeavy);
    textSize(100);
    text(namingMap[albumData.albumGrade] || albumData.albumGrade, width * 0.5, height - gradeRectHeight * 0.43);

    //saveCanvas('tiktok_album_generator', 'png');
}

function dimImage(img, amount){
    let c = color(0, 0, 0, amount);
    img.loadPixels();
    for (let i = 0; i < img.pixels.length; i += 4) {
        img.pixels[i] = lerp(img.pixels[i], red(c), amount / 255);
        img.pixels[i + 1] = lerp(img.pixels[i + 1], green(c), amount / 255);
        img.pixels[i + 2] = lerp(img.pixels[i + 2], blue(c), amount / 255);
    }
    img.updatePixels();
    return img;
}

function draw(){
}
