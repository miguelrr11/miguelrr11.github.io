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
let verticalOffsetSlider;
let verticalOffsetLabel;

// View toggle: 'ratings' or 'cover'
let currentView = 'ratings';
let viewToggleBtn;

// Editor panel reference
let editorPanel;
let dragOverlay;

// Undo/Redo system
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 50;
let isUndoRedoAction = false;

// Custom color map (can be modified by user)
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

// Default colors for reset
const defaultColorMap = {
    "GOAT": "#ffffff",
    "S": "#ffd21f",
    "A": "#ff1fa9",
    "B": "#bc3fde",
    "C": "#38b6ff",
    "D": "#14b60b",
    "F": "#902020",
    "Interlude": "#b2b2b2"
};

// Color picker references
let colorPickers = {};

async function setup(){
    fontRegular = await loadFont('fonts/Vidaloka-Regular.ttf');
    fontRegularItalic = await loadFont('fonts/Coolvetica Rg It.otf');
    fontRegularCrammed = await loadFont('fonts/Coolvetica Rg Cram.otf');
    fontRegularCondensed = await loadFont('fonts/groteskMed.ttf');
    fontHeavy = await loadFont('fonts/grotesk.otf');
    fontLight = await loadFont('fonts/groteskLight.ttf');

    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('canvas-container');

    editorPanel = select('#editor-panel');
    dragOverlay = select('#drag-overlay');

    // Enable drag and drop on the entire document
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragOverlay.addClass('active');
    });
    document.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null) {
            dragOverlay.removeClass('active');
        }
    });
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dragOverlay.removeClass('active');
        let file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.json')) {
            let reader = new FileReader();
            reader.onload = (event) => {
                try {
                    let data = JSON.parse(event.target.result);
                    if (data.album) {
                        albumData = data.album;
                        fillFormFromData(albumData);
                        if (currentView === 'ratings') {
                            printAlbum();
                        } else {
                            printCoverScreen();
                        }
                    }
                } catch (err) {
                    console.log("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
    });

    createAlbumEditor();

    // Load saved data from localStorage
    loadFromLocalStorage();
    loadCustomColors();

    // Auto-save to localStorage every second
    setInterval(saveToLocalStorage, 1000);

    // Capture initial state for undo/redo
    captureState();

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
        }
    });
}

function createAlbumEditor() {
    // Panel Header
    let header = createDiv('').parent(editorPanel).class('panel-header');
    createElement('h2', 'Album Editor').parent(header);
    createElement('p', 'Drag & drop JSON or fill manually').parent(header);

    // Title
    let titleGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Album Title').parent(titleGroup);
    titleInput = createInput('').parent(titleGroup).class('form-input');
    titleInput.attribute('placeholder', 'Enter album title...');
    titleInput.elt.addEventListener('blur', captureState);

    // Artist
    let artistGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Artist').parent(artistGroup);
    artistInput = createInput('').parent(artistGroup).class('form-input');
    artistInput.attribute('placeholder', 'Enter artist name...');
    artistInput.elt.addEventListener('blur', captureState);

    // Year & Genre row
    let rowGroup = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');

    let yearGroup = createDiv('').parent(rowGroup).class('form-group').style('flex: 1;');
    createElement('label', 'Year').parent(yearGroup);
    yearInput = createInput('').parent(yearGroup).class('form-input');
    yearInput.attribute('placeholder', 'e.g. 1997');
    yearInput.elt.addEventListener('blur', captureState);

    let genreGroup = createDiv('').parent(rowGroup).class('form-group').style('flex: 1;');
    createElement('label', 'Genre').parent(genreGroup);
    genreInput = createInput('').parent(genreGroup).class('form-input');
    genreInput.attribute('placeholder', 'e.g. Rock');
    genreInput.elt.addEventListener('blur', captureState);

    // Fun Fact
    let funfactGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Fun Fact').parent(funfactGroup);
    funfactInput = createElement('textarea').parent(funfactGroup).class('form-textarea');
    funfactInput.attribute('placeholder', 'Add an interesting fact about the album...');
    funfactInput.elt.addEventListener('blur', captureState);

    // Image URL
    let imageGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Image URL').parent(imageGroup);
    imageUrlInput = createInput('').parent(imageGroup).class('form-input');
    imageUrlInput.attribute('placeholder', 'https://...');
    imageUrlInput.elt.addEventListener('blur', captureState);

    // Album Grade & Vertical Offset row
    let gradeOffsetRow = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');

    let gradeGroup = createDiv('').parent(gradeOffsetRow).class('form-group').style('flex: 1;');
    createElement('label', 'Album Grade').parent(gradeGroup);
    albumGradeSelect = createSelect().parent(gradeGroup).class('form-select');
    for (let grade of gradeOptions) {
        albumGradeSelect.option(grade);
    }
    albumGradeSelect.changed(captureState);

    // Vertical Offset Slider
    let offsetGroup = createDiv('').parent(gradeOffsetRow).class('form-group').style('flex: 1;');
    createElement('label', 'Vertical Offset').parent(offsetGroup);
    let sliderContainer = createDiv('').parent(offsetGroup).class('slider-container');
    verticalOffsetSlider = createSlider(-500, 500, 0, 1).parent(sliderContainer).class('form-slider');
    verticalOffsetLabel = createSpan('0').parent(sliderContainer).class('slider-value');
    verticalOffsetSlider.input(() => {
        verticalOffsetLabel.html(verticalOffsetSlider.value());
    });

    // Divider
    createDiv('').parent(editorPanel).class('section-divider');

    // Tracks section
    createDiv('Tracks').parent(editorPanel).class('section-title');

    // Track container
    trackContainer = createDiv('').parent(editorPanel).class('track-container');

    // Add initial track
    addTrackRow();

    // Add Track button
    let addTrackBtn = createButton('+ Add Track').parent(editorPanel).class('btn btn-secondary');
    addTrackBtn.mousePressed(addTrackRow);

    // Button Grid
    let buttonGrid = createDiv('').parent(editorPanel).class('button-grid');

    // Generate Preview
    let generateBtn = createButton('Generate Preview').parent(buttonGrid).class('btn btn-primary');
    generateBtn.mousePressed(generateFromForm);

    // Download row
    let downloadRow = createDiv('').parent(buttonGrid).class('button-row');
    let downloadJsonBtn = createButton('JSON').parent(downloadRow).class('btn btn-blue');
    downloadJsonBtn.mousePressed(downloadJSON);
    let downloadImgBtn = createButton('Images').parent(downloadRow).class('btn btn-purple');
    downloadImgBtn.mousePressed(downloadBothImages);

    // View Toggle
    viewToggleBtn = createButton('View: Ratings').parent(buttonGrid).class('btn btn-orange');
    viewToggleBtn.mousePressed(toggleView);

    // Undo/Redo row
    let undoRedoRow = createDiv('').parent(buttonGrid).class('button-row');
    let undoBtn = createButton('↶ Undo').parent(undoRedoRow).class('btn btn-secondary');
    undoBtn.mousePressed(undo);
    let redoBtn = createButton('↷ Redo').parent(undoRedoRow).class('btn btn-secondary');
    redoBtn.mousePressed(redo);

    // Clear All button
    let clearBtn = createButton('Clear All').parent(buttonGrid).class('btn btn-danger');
    clearBtn.mousePressed(clearAll);

    // Divider before color customization
    createDiv('').parent(editorPanel).class('section-divider');

    // Color customization section (collapsible)
    let colorSection = createDiv('').parent(editorPanel).class('color-section');
    let colorHeader = createDiv('').parent(colorSection).class('color-section-header');
    let colorToggle = createSpan('▶').parent(colorHeader).class('color-toggle');
    createSpan(' Customize Colors').parent(colorHeader);

    let colorContent = createDiv('').parent(colorSection).class('color-content collapsed');

    // Toggle collapse
    colorHeader.mousePressed(() => {
        if (colorContent.hasClass('collapsed')) {
            colorContent.removeClass('collapsed');
            colorToggle.html('▼');
        } else {
            colorContent.addClass('collapsed');
            colorToggle.html('▶');
        }
    });

    // Color pickers for each grade
    for (let grade of gradeOptions) {
        let colorRow = createDiv('').parent(colorContent).class('color-row');
        createSpan(grade).parent(colorRow).class('color-label');
        let picker = createColorPicker(colorMap[grade]).parent(colorRow).class('color-picker');
        picker.input(() => {
            colorMap[grade] = picker.value();
            saveCustomColors();
        });
        colorPickers[grade] = picker;
    }

    // Reset colors button
    let resetColorsBtn = createButton('Reset to Default').parent(colorContent).class('btn btn-secondary');
    resetColorsBtn.style('margin-top', '12px');
    resetColorsBtn.mousePressed(resetColors);
}

function clearAll() {
    // Clear all input fields
    titleInput.value('');
    artistInput.value('');
    yearInput.value('');
    genreInput.value('');
    funfactInput.value('');
    imageUrlInput.value('');
    albumGradeSelect.selected('GOAT');

    // Clear all tracks
    while (tracks.length > 0) {
        tracks[0].rowDiv.remove();
        tracks.shift();
    }
    addTrackRow();

    // Clear albumData
    albumData = null;

    // Clear canvas
    background(200);

    // Clear localStorage
    localStorage.removeItem('albumGeneratorData');
}

function toggleView() {
    if (currentView === 'ratings') {
        currentView = 'cover';
        viewToggleBtn.html('View: Cover');
    } else {
        currentView = 'ratings';
        viewToggleBtn.html('View: Ratings');
    }
    if (albumData) {
        if (currentView === 'ratings') {
            printAlbum();
        } else {
            printCoverScreen();
        }
    }
}

async function downloadBothImages() {
    // Update albumData from UI before downloading
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

    if (!albumData.imageUrl) return;

    let albumName = titleInput.value() || 'Untitled';
    let artistName = artistInput.value() || 'Unknown';
    let baseFileName = (artistName + ' - ' + albumName).replace(/[\/\\:*?"<>|]/g, '');

    // Save ratings screen
    await printAlbum();
    saveCanvas(baseFileName + ' - Ratings', 'png');

    // Small delay to ensure first save completes
    await new Promise(resolve => setTimeout(resolve, 100));

    // Save cover screen
    await printCoverScreen();
    saveCanvas(baseFileName + ' - Cover', 'png');
}

function addTrackRow() {
    let trackIndex = tracks.length;
    let rowDiv = createDiv('').parent(trackContainer).class('track-row');

    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).class('track-number');

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');
    titleIn.elt.addEventListener('blur', captureState);

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    for (let grade of gradeOptions) {
        gradeSelect.option(grade);
    }
    gradeSelect.selected('B');
    gradeSelect.changed(captureState);

    let removeBtn = createButton('×').parent(rowDiv).class('track-remove-btn');
    removeBtn.mousePressed(() => removeTrackRow(trackIndex));

    tracks.push({ titleInput: titleIn, gradeSelect: gradeSelect, rowDiv: rowDiv, numSpan: trackNumSpan });

    captureState();
}

function removeTrackRow(index) {
    if (tracks.length <= 1) return;

    tracks[index].rowDiv.remove();
    tracks.splice(index, 1);

    // Update track numbers
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].numSpan.html((i + 1) + '.');
    }

    captureState();
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

    if (currentView === 'ratings') {
        printAlbum();
    } else {
        printCoverScreen();
    }
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

    let albumName = titleInput.value() || 'Untitled';
    let artistName = artistInput.value() || 'Unknown';
    let fileName = (artistName + ' - ' + albumName).replace(/[\/\\:*?"<>|]/g, '') + '.json';
    saveJSON(jsonData, fileName);
}

function handleFile(file) {
    uploadedFile = file;
    processFile();
    if (currentView === 'ratings') {
        printAlbum();
    } else {
        printCoverScreen();
    }
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

function saveToLocalStorage() {
    let tracksData = [];
    for (let track of tracks) {
        tracksData.push({
            title: track.titleInput.value(),
            grade: track.gradeSelect.value()
        });
    }

    let data = {
        title: titleInput.value(),
        artist: artistInput.value(),
        year: yearInput.value(),
        genre: genreInput.value(),
        funfact: funfactInput.value(),
        imageUrl: imageUrlInput.value(),
        albumGrade: albumGradeSelect.value(),
        tracks: tracksData
    };

    localStorage.setItem('albumGeneratorData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    let savedData = localStorage.getItem('albumGeneratorData');
    if (savedData) {
        try {
            let data = JSON.parse(savedData);
            fillFormFromData(data);
        } catch (err) {
            console.log("Error loading saved data");
        }
    }
}

// Safe image loading with error handling
async function loadImageSafe(url) {
    return new Promise((resolve, reject) => {
        loadImage(url,
            (img) => resolve(img),
            (err) => reject(err)
        );
    });
}

function showToast(message, isError = false) {
    // Remove existing toast if any
    let existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    let toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function drawErrorState(message) {
    background(40);

    // Error icon
    fill(239, 68, 68);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(120);
    text('⚠', width / 2, height / 2 - 100);

    // Error message
    fill(255);
    textFont(fontHeavy);
    textSize(48);
    text('Image Load Failed', width / 2, height / 2 + 50);

    textFont(fontLight);
    textSize(28);
    fill(180);
    text(message, width / 2, height / 2 + 120, width - 100);

    textSize(24);
    fill(120);
    text('Check the image URL and try again', width / 2, height / 2 + 200);
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

    let imgBW, img;
    try {
        imgBW = await loadImageSafe(albumData.imageUrl);
        img = await loadImageSafe(albumData.imageUrl);
    } catch (err) {
        console.error('Failed to load image:', err);
        drawErrorState(albumData.imageUrl || 'No URL provided');
        showToast('Failed to load image. Check the URL.', true);
        return;
    }

    imgBW.filter(GRAY);
    imgBW.filter(BLUR, 2);
    imgBW.filter(ERODE);
    imgBW = dimImage(imgBW, 190);
    imageMode(CENTER)
    image(imgBW, width * 0.5, height * 0.5, height, height);


    imageMode(CORNER)
    rectMode(CORNER)
    let y = 50
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
    textLeading(70);
    text(albumData.title, leftMargin, topMargin + y);
    textAlign(LEFT, TOP);


    // ARTIST
    textFont(fontRegularCondensed);
    textLeading(50);
    textSize(45);
    fill(255);
    text(albumData.artist, leftMargin, topMargin + y + 110, width * 0.35);

    let bbox = fontRegularCondensed.textBounds(albumData.artist, leftMargin, topMargin + y + 100, width * 0.35);

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

    // Reset text state before drawing tracks
    textFont(fontRegular);
    textSize(60);
    textAlign(LEFT, BASELINE);

    rectMode(CENTER);
    let w = (leftMargin + x) * 0.75;
    let h = 40;

    let vertOffset = verticalOffsetSlider ? verticalOffsetSlider.value() : 0;

    for(let i = 0; i < albumData.tracks.length; i++){
        let track = albumData.tracks[i];
        let trackY = y + vertOffset;

        // Set font and size fresh for each track to ensure consistent metrics
        textSize(60);
        textFont(fontRegular);
        let textAscent_ = textAscent();
        let textDescent_ = textDescent();
        let textHeight = textAscent_ + textDescent_;
        let rectCenterOffset = textAscent_ - textHeight / 2;

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
        
    }

    rect(0, height - gradeRectHeight, width, gradeRectHeight, 20, 20, 0, 0);

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
    utils.beginShadow("#ffffffa3", 30, 0, 0);
    text(namingMap[albumData.albumGrade] || albumData.albumGrade, width * 0.5, height - gradeRectHeight * 0.43);
    utils.endShadow();
}

async function printCoverScreen() {
    background(200);

    let imgBW, img;
    try {
        imgBW = await loadImageSafe(albumData.imageUrl);
        img = await loadImageSafe(albumData.imageUrl);
    } catch (err) {
        console.error('Failed to load image:', err);
        drawErrorState(albumData.imageUrl || 'No URL provided');
        showToast('Failed to load image. Check the URL.', true);
        return;
    }

    // Draw blurred background (same as ratings screen)
    imgBW.filter(GRAY);
    imgBW.filter(BLUR, 2);
    imgBW.filter(ERODE);
    imgBW = dimImage(imgBW, 190);
    imageMode(CENTER);
    image(imgBW, width * 0.5, height * 0.5, height, height);

    // "Album Review" text at top
    utils.beginShadow("#000000", 30, 0, 0);
    textAlign(CENTER, TOP);
    textFont(fontLight);
    textSize(55);
    fill(255);
    text("Album Review", width * 0.5, 260);
    utils.endShadow();
    let coverSize = width * 0.8;
    let coverY = height * 0.42;
    imageMode(CENTER);
    rectMode(CENTER);
    utils.beginShadow("#000000", 80, 0, 0);
    rect(width * 0.5, coverY, coverSize, coverSize);
    image(img, width * 0.5, coverY, coverSize, coverSize);
    utils.endShadow();

    // Album title below image
    utils.beginShadow("#000000", 20, 0, 0);
    textAlign(CENTER, TOP);
    textFont(fontHeavy);
    let titleY = coverY + coverSize * 0.5 + 60;
    textSize(getMaxTextSize(albumData.title, width - 100, 100));
    fill(255);
    text(albumData.title, width * 0.5, titleY);

    // Artist name below title
    textFont(fontRegularCondensed);
    textSize(45);
    fill(230);
    text(albumData.artist, width * 0.5, titleY + 130);
    utils.endShadow();
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

// ============ UNDO/REDO FUNCTIONS ============

function captureState() {
    if (isUndoRedoAction) return;

    let tracksData = [];
    for (let track of tracks) {
        tracksData.push({
            title: track.titleInput.value(),
            grade: track.gradeSelect.value()
        });
    }

    let state = {
        title: titleInput.value(),
        artist: artistInput.value(),
        year: yearInput.value(),
        genre: genreInput.value(),
        funfact: funfactInput.value(),
        imageUrl: imageUrlInput.value(),
        albumGrade: albumGradeSelect.value(),
        verticalOffset: verticalOffsetSlider ? verticalOffsetSlider.value() : 0,
        tracks: tracksData
    };

    // Remove any states after current index (for new branch)
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }

    // Add new state
    historyStack.push(JSON.stringify(state));
    historyIndex = historyStack.length - 1;

    // Limit history size
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex <= 0) return;

    isUndoRedoAction = true;
    historyIndex--;
    restoreState(JSON.parse(historyStack[historyIndex]));
    isUndoRedoAction = false;
}

function redo() {
    if (historyIndex >= historyStack.length - 1) return;

    isUndoRedoAction = true;
    historyIndex++;
    restoreState(JSON.parse(historyStack[historyIndex]));
    isUndoRedoAction = false;
}

function restoreState(state) {
    titleInput.value(state.title || '');
    artistInput.value(state.artist || '');
    yearInput.value(state.year || '');
    genreInput.value(state.genre || '');
    funfactInput.value(state.funfact || '');
    imageUrlInput.value(state.imageUrl || '');
    albumGradeSelect.selected(state.albumGrade || 'GOAT');

    if (verticalOffsetSlider && state.verticalOffset !== undefined) {
        verticalOffsetSlider.value(state.verticalOffset);
        verticalOffsetLabel.html(state.verticalOffset);
    }

    // Restore tracks
    while (tracks.length > 0) {
        tracks[0].rowDiv.remove();
        tracks.shift();
    }

    if (state.tracks && state.tracks.length > 0) {
        for (let track of state.tracks) {
            addTrackRowWithoutCapture();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'B');
        }
    } else {
        addTrackRowWithoutCapture();
    }
}

function addTrackRowWithoutCapture() {
    let trackIndex = tracks.length;
    let rowDiv = createDiv('').parent(trackContainer).class('track-row');

    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).class('track-number');

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    for (let grade of gradeOptions) {
        gradeSelect.option(grade);
    }
    gradeSelect.selected('B');

    let removeBtn = createButton('×').parent(rowDiv).class('track-remove-btn');
    removeBtn.mousePressed(() => {
        removeTrackRow(tracks.indexOf(tracks.find(t => t.rowDiv === rowDiv)));
    });

    tracks.push({ titleInput: titleIn, gradeSelect: gradeSelect, rowDiv: rowDiv, numSpan: trackNumSpan });
}

// ============ COLOR CUSTOMIZATION FUNCTIONS ============

function saveCustomColors() {
    localStorage.setItem('albumGeneratorColors', JSON.stringify(colorMap));
}

function loadCustomColors() {
    let savedColors = localStorage.getItem('albumGeneratorColors');
    if (savedColors) {
        try {
            let colors = JSON.parse(savedColors);
            for (let grade in colors) {
                if (colorMap.hasOwnProperty(grade)) {
                    colorMap[grade] = colors[grade];
                }
            }
        } catch (err) {
            console.log("Error loading custom colors");
        }
    }
}

function resetColors() {
    for (let grade in defaultColorMap) {
        colorMap[grade] = defaultColorMap[grade];
        if (colorPickers[grade]) {
            colorPickers[grade].value(defaultColorMap[grade]);
        }
    }
    saveCustomColors();
}
