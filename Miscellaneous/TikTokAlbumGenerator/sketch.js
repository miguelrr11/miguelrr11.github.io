//Album Rating Generator for Social Media
//Miguel Rodríguez
//17-01-2026

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

// UI Elements
let titleInput, artistInput, yearInput, genreInput, funfactInput, imageUrlInput, albumGradeSelect;
let trackContainer;
let tracks = [];
const gradeOptions = ['GOAT', 'S', 'A', 'B', 'C', 'D', 'F', 'Interlude'];

async function setup(){
    fontRegular = await loadFont('fonts/Vidaloka-Regular.ttf');
    fontRegularItalic = await loadFont('fonts/Coolvetica Rg It.otf');
    fontRegularCrammed = await loadFont('fonts/Coolvetica Rg Cram.otf');
    fontRegularCondensed = await loadFont('fonts/groteskMed.ttf');
    fontHeavy = await loadFont('fonts/grotesk.otf');
    fontLight = await loadFont('fonts/groteskLight.ttf');

    createCanvas(WIDTH, HEIGHT)
    createFileInput(handleFile).position(width, 10).style('font-size', '20px');

    createAlbumEditor();
}

function createAlbumEditor() {
    let xPos = width + 10;
    let yPos = 50;
    let inputWidth = 300;
    let labelStyle = 'color: white; font-family: sans-serif; font-size: 14px;';
    let inputStyle = 'font-size: 16px; padding: 5px; width: ' + inputWidth + 'px;';

    // Title
    createElement('label', 'Album Title:').position(xPos, yPos).style(labelStyle);
    titleInput = createInput('').position(xPos, yPos + 20).style(inputStyle);
    yPos += 60;

    // Artist
    createElement('label', 'Artist:').position(xPos, yPos).style(labelStyle);
    artistInput = createInput('').position(xPos, yPos + 20).style(inputStyle);
    yPos += 60;

    // Year
    createElement('label', 'Year:').position(xPos, yPos).style(labelStyle);
    yearInput = createInput('').position(xPos, yPos + 20).style(inputStyle);
    yPos += 60;

    // Genre
    createElement('label', 'Genre:').position(xPos, yPos).style(labelStyle);
    genreInput = createInput('').position(xPos, yPos + 20).style(inputStyle);
    yPos += 60;

    // Fun Fact
    createElement('label', 'Fun Fact:').position(xPos, yPos).style(labelStyle);
    funfactInput = createElement('textarea').position(xPos, yPos + 20).style(inputStyle + ' height: 60px;');
    yPos += 100;

    // Image URL
    createElement('label', 'Image URL:').position(xPos, yPos).style(labelStyle);
    imageUrlInput = createInput('').position(xPos, yPos + 20).style(inputStyle);
    yPos += 60;

    // Album Grade
    createElement('label', 'Album Grade:').position(xPos, yPos).style(labelStyle);
    albumGradeSelect = createSelect().position(xPos, yPos + 20).style('font-size: 16px; padding: 5px;');
    for (let grade of gradeOptions) {
        albumGradeSelect.option(grade);
    }
    yPos += 60;

    // Tracks section
    createElement('label', 'Tracks:').position(xPos, yPos).style(labelStyle + ' font-weight: bold;');
    yPos += 25;

    // Track container div
    trackContainer = createDiv('').position(xPos, yPos).style('max-height: 400px; overflow-y: auto;');

    // Add initial track
    addTrackRow();
    yPos += 420;

    // Add Track button
    let addTrackBtn = createButton('+ Add Track').position(xPos, yPos).style('font-size: 16px; padding: 8px 16px; cursor: pointer;');
    addTrackBtn.mousePressed(addTrackRow);
    yPos += 50;

    // Generate & Preview button
    let generateBtn = createButton('Generate Preview').position(xPos, yPos).style('font-size: 16px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;');
    generateBtn.mousePressed(generateFromForm);
    yPos += 50;

    // Download JSON button
    let downloadBtn = createButton('Download JSON').position(xPos, yPos).style('font-size: 16px; padding: 10px 20px; background-color: #2196F3; color: white; border: none; cursor: pointer;');
    downloadBtn.mousePressed(downloadJSON);
}

function addTrackRow() {
    let trackIndex = tracks.length;
    let rowDiv = createDiv('').parent(trackContainer).style('margin-bottom: 8px; display: flex; gap: 5px; align-items: center;');

    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).style('color: white; font-family: sans-serif; min-width: 25px;');

    let titleIn = createInput('').parent(rowDiv).style('font-size: 14px; padding: 4px; width: 180px;');
    titleIn.attribute('placeholder', 'Track title');

    let gradeSelect = createSelect().parent(rowDiv).style('font-size: 14px; padding: 4px;');
    for (let grade of gradeOptions) {
        gradeSelect.option(grade);
    }
    gradeSelect.selected('B');

    let removeBtn = createButton('X').parent(rowDiv).style('font-size: 12px; padding: 4px 8px; background-color: #f44336; color: white; border: none; cursor: pointer;');
    removeBtn.mousePressed(() => removeTrackRow(trackIndex));

    tracks.push({ titleInput: titleIn, gradeSelect: gradeSelect, rowDiv: rowDiv, numSpan: trackNumSpan });
}

function removeTrackRow(index) {
    if (tracks.length <= 1) return;

    tracks[index].rowDiv.remove();
    tracks.splice(index, 1);

    // Update track numbers
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].numSpan.html((i + 1) + '.');
    }
}

function generateFromForm() {
    let tracksData = [];
    for (let track of tracks) {
        let title = track.titleInput.value().trim();
        if (title) {
            tracksData.push({
                title: title,
                grade: track.gradeSelect.value()
            });
        }
    }

    albumData = {
        title: titleInput.value() || 'Untitled Album',
        artist: artistInput.value() || 'Unknown Artist',
        year: yearInput.value() || new Date().getFullYear().toString(),
        genre: genreInput.value() || 'Unknown',
        funfact: funfactInput.value() || '',
        tracks: tracksData,
        imageUrl: imageUrlInput.value() || '',
        albumGrade: albumGradeSelect.value()
    };

    printAlbum();
}

function downloadJSON() {
    let tracksData = [];
    for (let track of tracks) {
        let title = track.titleInput.value().trim();
        if (title) {
            tracksData.push({
                title: title,
                grade: track.gradeSelect.value()
            });
        }
    }

    let jsonData = {
        album: {
            title: titleInput.value() || 'Untitled Album',
            artist: artistInput.value() || 'Unknown Artist',
            year: yearInput.value() || new Date().getFullYear().toString(),
            runtime: '',
            genre: genreInput.value() || 'Unknown',
            funfact: funfactInput.value() || '',
            tracks: tracksData,
            imageUrl: imageUrlInput.value() || '',
            albumGrade: albumGradeSelect.value()
        }
    };

    saveJSON(jsonData, 'album.json');
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
        fillFormFromData(albumData);
    }
    else {
        console.log("Please upload a valid json file.")
    }
}

function fillFormFromData(data) {
    // Fill basic fields
    titleInput.value(data.title || '');
    artistInput.value(data.artist || '');
    yearInput.value(data.year || '');
    genreInput.value(data.genre || '');
    funfactInput.value(data.funfact || '');
    imageUrlInput.value(data.imageUrl || '');
    albumGradeSelect.selected(data.albumGrade || 'B');

    // Clear existing tracks
    while (tracks.length > 0) {
        tracks[0].rowDiv.remove();
        tracks.shift();
    }

    // Add tracks from data
    if (data.tracks && data.tracks.length > 0) {
        for (let track of data.tracks) {
            addTrackRow();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'B');
        }
    } else {
        addTrackRow();
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
