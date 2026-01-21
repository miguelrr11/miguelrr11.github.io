//Album Rating Generator for Social Media
//Miguel Rodríguez
//17-01-2026

p5.disableFriendlyErrors = true
const WIDTH = 1080
const HEIGHT = 1920

let uploadedFile = null
let albumData = null

let fontRegular, fontRegularItalic, fontRegularCrammed, fontRegularCondensed, fontHeavy, fontLight
let musicChar = '♫'
var utils = new p5.Utils();

// UI Elements
let titleInput, artistInput, yearInput, genreInput, funfactInput, imageUrlInput, albumGradeSelect;
let trackContainer, tracks = [];
const gradeOptions = ['GOAT', 'S', 'A', 'B', 'C', 'D', 'F', 'Interlude'];
let verticalOffsetSlider, verticalOffsetLabel;

// View toggle: 'ratings' or 'cover'
let currentView = 'ratings';
let viewToggleBtn, editorPanel, dragOverlay;

// Undo/Redo system
let historyStack = [], historyIndex = -1;
const MAX_HISTORY = 50;
let isUndoRedoAction = false;

// Text box selection and sizing
let textBoxes = [], selectedTextBox = null, sizeAdjustPanel = null;
let textSizeOffsets = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0 };
let textLeadingOffsets = { funfact: 0 };
let verticalOffsets = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0, tracks: 0, image: 0 };

// Image cache
let cachedImageUrl = null, cachedOriginalImage = null, cachedFilteredImage = null;

// Custom color map
let colorMap = { "GOAT": "#ffffff", "S": "#ffd21f", "A": "#ff1fa9", "B": "#bc3fde", "C": "#38b6ff", "D": "#14b60b", "F": "#902020", "Interlude": "#b2b2b2" };
const defaultColorMap = {...colorMap};
let colorPickers = {}, canvasScale = 1;

function calculateCanvasScale() {
    const scale = (window.innerHeight - 40) / HEIGHT;
    return Math.max(0.3, Math.min(1, scale));
}

function applyCanvasScale() {
    canvasScale = calculateCanvasScale();
    document.documentElement.style.setProperty('--canvas-scale', canvasScale);
    const container = document.getElementById('canvas-container');
    if (container) {
        container.style.width = (WIDTH * canvasScale) + 'px';
        container.style.height = (HEIGHT * canvasScale) + 'px';
    }
}

async function setup(){
    fontRegular = await loadFont('fonts/Vidaloka-Regular.ttf');
    fontRegularItalic = await loadFont('fonts/Coolvetica Rg It.otf');
    fontRegularCrammed = await loadFont('fonts/Coolvetica Rg Cram.otf');
    fontRegularCondensed = await loadFont('fonts/groteskMed.ttf');
    fontHeavy = await loadFont('fonts/grotesk.otf');
    fontLight = await loadFont('fonts/groteskLight.ttf');

    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('canvas-container');

    applyCanvasScale();
    window.addEventListener('resize', applyCanvasScale);

    editorPanel = select('#editor-panel');
    dragOverlay = select('#drag-overlay');

    setupDragDrop();
    createAlbumEditor();
    loadFromLocalStorage();
    loadCustomColors();
    captureState();

    setInterval(saveToLocalStorage, 1000);
    document.addEventListener('keydown', handleKeyboard);
}

function setupDragDrop() {
    document.addEventListener('dragover', (e) => { e.preventDefault(); dragOverlay.addClass('active'); });
    document.addEventListener('dragleave', (e) => { if (e.relatedTarget === null) dragOverlay.removeClass('active'); });
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
                        currentView === 'ratings' ? printAlbum() : printCoverScreen();
                    }
                } catch (err) { console.log("Invalid JSON file"); }
            };
            reader.readAsText(file);
        }
    });
}

function handleKeyboard(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
    }
}

function createAlbumEditor() {
    // Header
    let header = createDiv('').parent(editorPanel).class('panel-header');
    createElement('h2', 'Album Editor').parent(header);
    createElement('p', 'Drag & drop JSON or fill manually').parent(header);

    // Basic inputs
    titleInput = createFormInput('Album Title', 'Enter album title...');
    artistInput = createFormInput('Artist', 'Enter artist name...');

    let rowGroup = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');
    yearInput = createFormInput('Year', 'e.g. 1997', rowGroup);
    genreInput = createFormInput('Genre', 'e.g. Rock', rowGroup);

    funfactInput = createFormTextarea('Fun Fact', 'Add an interesting fact about the album...');
    imageUrlInput = createFormInput('Image URL', 'https://...');

    // Album Grade & Vertical Offset row
    let gradeOffsetRow = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');
    albumGradeSelect = createFormSelect('Album Grade', gradeOptions, gradeOffsetRow);
    createVerticalOffsetSlider(gradeOffsetRow);

    // Divider & Tracks
    createDiv('').parent(editorPanel).class('section-divider');
    createDiv('Tracks').parent(editorPanel).class('section-title');
    trackContainer = createDiv('').parent(editorPanel).class('track-container');
    addTrackRow();

    let addTrackBtn = createButton('+ Add Track').parent(editorPanel).class('btn btn-secondary');
    addTrackBtn.mousePressed(addTrackRow);

    // Button Grid
    createButtonGrid();
    createColorSection();
    createSizeAdjustPanel();
}

function createFormInput(label, placeholder, parent = editorPanel) {
    let group = createDiv('').parent(parent).class('form-group');
    if (parent !== editorPanel) group.style('flex', '1');
    createElement('label', label).parent(group);
    let input = createInput('').parent(group).class('form-input');
    input.attribute('placeholder', placeholder);
    input.elt.addEventListener('input', autoGeneratePreview);
    input.elt.addEventListener('blur', captureState);
    return input;
}

function createFormTextarea(label, placeholder) {
    let group = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', label).parent(group);
    let textarea = createElement('textarea').parent(group).class('form-textarea');
    textarea.attribute('placeholder', placeholder);
    textarea.elt.addEventListener('input', autoGeneratePreview);
    textarea.elt.addEventListener('blur', captureState);
    return textarea;
}

function createFormSelect(label, options, parent = editorPanel) {
    let group = createDiv('').parent(parent).class('form-group');
    if (parent !== editorPanel) group.style('flex', '1');
    createElement('label', label).parent(group);
    let select = createSelect().parent(group).class('form-select');
    options.forEach(opt => select.option(opt));
    select.changed(() => { autoGeneratePreview(); captureState(); });
    return select;
}

function createVerticalOffsetSlider(parent) {
    let group = createDiv('').parent(parent).class('form-group').style('flex', '1');
    createElement('label', 'Vertical Offset').parent(group);
    let container = createDiv('').parent(group).class('slider-container');
    verticalOffsetSlider = createSlider(-500, 500, 0, 1).parent(container).class('form-slider');
    verticalOffsetLabel = createSpan('0').parent(container).class('slider-value');

    let sliderTimeout = null;
    verticalOffsetSlider.input(() => {
        if (!selectedTextBox) return;
        let value = verticalOffsetSlider.value();
        verticalOffsetLabel.html(value);
        verticalOffsets[selectedTextBox.id] = value;
        if (albumData && currentView === 'ratings') printAlbum();

        // Debounce capture state
        if (sliderTimeout) clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => captureState(), 500);
    });

    // Initially disable
    verticalOffsetSlider.attribute('disabled', '');
    verticalOffsetSlider.addClass('disabled');
}

function createButtonGrid() {
    let buttonGrid = createDiv('').parent(editorPanel).class('button-grid');
    let downloadRow = createDiv('').parent(buttonGrid).class('button-row');
    createButton('JSON').parent(downloadRow).class('btn btn-blue').mousePressed(downloadJSON);
    createButton('Images').parent(downloadRow).class('btn btn-purple').mousePressed(downloadBothImages);

    viewToggleBtn = createButton('View: Ratings').parent(buttonGrid).class('btn btn-orange');
    viewToggleBtn.mousePressed(toggleView);

    let undoRedoRow = createDiv('').parent(buttonGrid).class('button-row');
    createButton('↶ Undo').parent(undoRedoRow).class('btn btn-secondary').elt.addEventListener('click', (e) => { e.preventDefault(); undo(); });
    createButton('↷ Redo').parent(undoRedoRow).class('btn btn-secondary').elt.addEventListener('click', (e) => { e.preventDefault(); redo(); });

    createButton('Clear All').parent(buttonGrid).class('btn btn-danger').mousePressed(clearAll);
}

function createColorSection() {
    createDiv('').parent(editorPanel).class('section-divider');
    let colorSection = createDiv('').parent(editorPanel).class('color-section');
    let colorHeader = createDiv('').parent(colorSection).class('color-section-header');
    let colorToggle = createSpan('▶').parent(colorHeader).class('color-toggle');
    createSpan(' Customize Colors').parent(colorHeader);

    let colorContent = createDiv('').parent(colorSection).class('color-content collapsed');

    colorHeader.mousePressed(() => {
        if (colorContent.hasClass('collapsed')) {
            colorContent.removeClass('collapsed');
            colorToggle.html('▼');
        } else {
            colorContent.addClass('collapsed');
            colorToggle.html('▶');
        }
    });

    gradeOptions.forEach(grade => {
        let row = createDiv('').parent(colorContent).class('color-row');
        createSpan(grade).parent(row).class('color-label');
        let picker = createColorPicker(colorMap[grade]).parent(row).class('color-picker');
        picker.input(() => { colorMap[grade] = picker.value(); saveCustomColors(); });
        colorPickers[grade] = picker;
    });

    createButton('Reset to Default').parent(colorContent).class('btn btn-secondary').style('margin-top', '12px').mousePressed(resetColors);
}

function createSizeAdjustPanel() {
    sizeAdjustPanel = createDiv('').id('size-adjust-panel');

    createSpan('Text Size:').parent(sizeAdjustPanel).class('label');
    createButton('−').parent(sizeAdjustPanel).class('btn-control').mousePressed(() => adjustTextSize(-2));
    let sizeDisplay = createSpan('0').parent(sizeAdjustPanel).id('size-display').class('display');
    createButton('+').parent(sizeAdjustPanel).class('btn-control').mousePressed(() => adjustTextSize(2));

    let leadingContainer = createDiv('').parent(sizeAdjustPanel).id('leading-container');
    createSpan('Leading:').parent(leadingContainer).class('label');
    createButton('−').parent(leadingContainer).class('btn-control').mousePressed(() => adjustTextLeading(-2));
    createSpan('0').parent(leadingContainer).id('leading-display').class('display');
    createButton('+').parent(leadingContainer).class('btn-control').mousePressed(() => adjustTextLeading(2));

    createButton('↻').parent(sizeAdjustPanel).class('btn-control btn-reset').mousePressed(resetTextBoxToDefault);
    createButton('✕').parent(sizeAdjustPanel).class('btn-control btn-close').mousePressed(() => {
        selectedTextBox = null;
        sizeAdjustPanel.style('display', 'none');
        currentView === 'ratings' ? printAlbum() : printCoverScreen();
    });
}

function clearAll() {
    [titleInput, artistInput, yearInput, genreInput, funfactInput, imageUrlInput].forEach(inp => inp.value(''));
    albumGradeSelect.selected('GOAT');
    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }
    addTrackRow();
    albumData = null;
    cachedImageUrl = cachedOriginalImage = cachedFilteredImage = null;
    background(200);
    localStorage.removeItem('albumGeneratorData');
}

function toggleView() {
    currentView = currentView === 'ratings' ? 'cover' : 'ratings';
    viewToggleBtn.html(currentView === 'ratings' ? 'View Ratings' : 'View Cover');
    if (albumData) currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

async function downloadBothImages() {
    let tracksData = collectTracksData();
    albumData = collectAlbumData(tracksData);
    if (!albumData.imageUrl) return;

    let baseFileName = getBaseFileName();
    await printAlbum();
    saveCanvas(baseFileName + ' - Ratings', 'png');
    await new Promise(resolve => setTimeout(resolve, 100));
    await printCoverScreen();
    saveCanvas(baseFileName + ' - Cover', 'png');
}

function makeNumberEditable(trackNumSpan, trackIndex) {
    trackNumSpan.elt.addEventListener('dblclick', () => {
        let currentText = trackNumSpan.html().replace('.', '');
        let input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'track-number-input';

        trackNumSpan.elt.replaceWith(input);
        input.focus();
        input.select();

        let finishEdit = () => {
            let newValue = input.value.trim() || (trackIndex + 1).toString();
            trackNumSpan.html(newValue + '.');
            input.replaceWith(trackNumSpan.elt);
            let track = tracks.find(t => t.numSpan === trackNumSpan);
            if (track) track.customNumber = newValue;
            autoGeneratePreview();
            captureState();
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); finishEdit(); }
            else if (e.key === 'Escape') { e.preventDefault(); trackNumSpan.html((trackIndex + 1) + '.'); input.replaceWith(trackNumSpan.elt); }
        });
    });
}

function addTrackRow() {
    addTrackRowWithCapture(true);
}

function addTrackRowWithoutCapture() {
    addTrackRowWithCapture(false);
}

function addTrackRowWithCapture(shouldCapture) {
    let trackIndex = tracks.length;
    let rowDiv = createDiv('').parent(trackContainer).class('track-row');
    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).class('track-number');

    makeNumberEditable(trackNumSpan, trackIndex);

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');
    titleIn.elt.addEventListener('input', autoGeneratePreview);
    titleIn.elt.addEventListener('blur', captureState);
    titleIn.elt.addEventListener('keydown', (e) => handleTrackNavigation(e, titleIn));

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    gradeOptions.forEach(grade => gradeSelect.option(grade));
    gradeSelect.selected('B');
    gradeSelect.changed(() => { autoGeneratePreview(); captureState(); });

    let textBtn = createButton('T').parent(rowDiv).class('track-text-btn');
    let textInputContainer = createDiv('').parent(rowDiv).class('track-text-input-container');
    textInputContainer.style('display', 'none');
    let textInput = createInput('').parent(textInputContainer).class('track-text-input');
    textInput.attribute('placeholder', 'Text inside rect...');
    textInput.elt.addEventListener('input', autoGeneratePreview);
    textInput.elt.addEventListener('blur', captureState);

    textBtn.mousePressed(() => {
        let isHidden = textInputContainer.style('display') === 'none';
        textInputContainer.style('display', isHidden ? 'block' : 'none');
        if (isHidden) textInput.elt.focus();
    });

    let removeBtn = createButton('×').parent(rowDiv).class('track-remove-btn');
    removeBtn.mousePressed(() => removeTrackRow(trackIndex));

    tracks.push({ titleInput: titleIn, gradeSelect, rowDiv, numSpan: trackNumSpan, customNumber: null, customText: null, textInput, textInputContainer });

    if (shouldCapture && historyStack.length > 0) captureState();
}

function handleTrackNavigation(e, titleIn) {
    let currentIndex = tracks.findIndex(t => t.titleInput === titleIn);
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < tracks.length - 1) tracks[currentIndex + 1].titleInput.elt.focus();
        else if (e.key === 'Enter') { addTrackRow(); tracks[tracks.length - 1].titleInput.elt.focus(); }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) tracks[currentIndex - 1].titleInput.elt.focus();
    }
}

function removeTrackRow(index) {
    if (tracks.length <= 1) return;
    tracks[index].rowDiv.remove();
    tracks.splice(index, 1);
    tracks.forEach((t, i) => t.numSpan.html((i + 1) + '.'));
    captureState();
    autoGeneratePreview();
}

let autoGenerateTimeout = null;
function autoGeneratePreview() {
    if (autoGenerateTimeout) clearTimeout(autoGenerateTimeout);
    autoGenerateTimeout = setTimeout(generateFromForm, 300);
}

function collectTracksData() {
    return tracks.map(track => {
        let title = track.titleInput.value().trim();
        return title ? {
            title,
            grade: track.gradeSelect.value(),
            customNumber: track.customNumber || null,
            customText: track.textInput ? track.textInput.value().trim() : null
        } : null;
    }).filter(Boolean);
}

function collectAlbumData(tracksData) {
    return {
        title: titleInput.value() || '',
        artist: artistInput.value() || '',
        year: yearInput.value() || '',
        genre: genreInput.value() || '',
        funfact: funfactInput.value() || '',
        tracks: tracksData,
        imageUrl: imageUrlInput.value() || '',
        albumGrade: albumGradeSelect.value()
    };
}

function getBaseFileName() {
    let albumName = titleInput.value() || '';
    let artistName = artistInput.value() || '';
    return (artistName + ' - ' + albumName).replace(/[\/\\:*?"<>|]/g, '');
}

function generateFromForm() {
    albumData = collectAlbumData(collectTracksData());
    currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

function downloadJSON() {
    let tracksData = collectTracksData();
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
    saveJSON(jsonData, getBaseFileName() + '.json');
}

function fillFormFromData(data) {
    titleInput.value(data.title || '');
    artistInput.value(data.artist || '');
    yearInput.value(data.year || '');
    genreInput.value(data.genre || '');
    funfactInput.value(data.funfact || '');
    imageUrlInput.value(data.imageUrl || '');
    albumGradeSelect.selected(data.albumGrade || 'B');

    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }

    if (data.tracks && data.tracks.length > 0) {
        data.tracks.forEach(track => {
            addTrackRow();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'B');
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber + '.');
            }
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.style('display', 'block');
            }
        });
    } else addTrackRow();
}

function saveToLocalStorage() {
    let data = collectAlbumData(tracks.map(t => ({
        title: t.titleInput.value(),
        grade: t.gradeSelect.value(),
        customNumber: t.customNumber || null,
        customText: t.textInput ? t.textInput.value() : null
    })));
    localStorage.setItem('albumGeneratorData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    let savedData = localStorage.getItem('albumGeneratorData');
    if (savedData) {
        try {
            fillFormFromData(JSON.parse(savedData));
            generateFromForm();
        } catch (err) { console.log("Error loading saved data"); }
    }
}

async function loadImageSafe(url) {
    return new Promise((resolve, reject) => {
        loadImage(url, img => resolve(img), err => reject(err));
    });
}

async function loadAndCacheImages(url) {
    if (cachedImageUrl === url && cachedOriginalImage && cachedFilteredImage) {
        return { original: cachedOriginalImage, filtered: cachedFilteredImage };
    }

    let img = await loadImageSafe(url);
    let imgBW = img.get();
    imgBW.filter(GRAY);
    imgBW.filter(BLUR, 2);
    imgBW.filter(ERODE);
    imgBW = dimImage(imgBW, 190);

    cachedImageUrl = url;
    cachedOriginalImage = img;
    cachedFilteredImage = imgBW;

    return { original: img, filtered: imgBW };
}

function showToast(message, isError = false) {
    let existingToast = document.getElementById('toast-notification');
    if (existingToast) existingToast.remove();

    let toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
}

function drawImagePlaceholder(x, y, w, h, isCornerMode = true) {
    push();
    rectMode(isCornerMode ? CORNER : CENTER);
    fill(60); noStroke(); rect(x, y, w, h);
    let centerX = isCornerMode ? x + w / 2 : x;
    let centerY = isCornerMode ? y + h / 2 : y;
    fill(100); textAlign(CENTER, CENTER); textSize(w * 0.15); text('🖼', centerX, centerY - h * 0.1);
    textFont(fontLight); textSize(w * 0.06); fill(120); text('No Image', centerX, centerY + h * 0.15);
    pop();
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
    let size = maxStartSize;
    textSize(size);
    while(textWidth(text) > maxWidth && size > 0){ size--; textSize(size); }
    return size;
}

async function printAlbum(){
    background(200)
    let selectedId = selectedTextBox ? selectedTextBox.id : null;
    textBoxes = [];

    let y = 50, imgOff = 200, sizeSclMult = 0.425, hasImage = false, imgBW, img;

    if (albumData.imageUrl && albumData.imageUrl.trim() !== '') {
        try {
            let images = await loadAndCacheImages(albumData.imageUrl);
            img = images.original; imgBW = images.filtered; hasImage = true;
        } catch (err) {
            console.error('Failed to load image:', err);
            showToast('Failed to load image. Check the URL.', true);
        }
    }

    if (hasImage) { imageMode(CENTER); image(imgBW, width * 0.5, height * 0.5, height, height); }
    else background(50);

    imageMode(CORNER); rectMode(CORNER);

    // Apply image vertical offset
    let imageVertOffset = verticalOffsets.image || 0;
    let imageX = width * 0.52;
    let imageY = y + imgOff + imageVertOffset;
    let imageSize = width * sizeSclMult;

    utils.beginShadow("#000000", 50, 0, 0);
    if (hasImage) {
        rect(imageX, imageY, imageSize, imageSize);
        image(img, imageX, imageY, imageSize, imageSize);
    }
    else drawImagePlaceholder(imageX, imageY, imageSize, imageSize, true);
    utils.endShadow();

    // Add image box for selection
    textBoxes.push({
        id: 'image',
        x: imageX,
        y: imageY,
        w: imageSize,
        h: imageSize,
        sizeOffset: 0,
        currentSize: 0
    });

    if(!albumData) return;

    let leftMargin = 50, topMargin = 80;

    // Draw title, artist, year, genre, funfact with vertical offsets
    utils.beginShadow("#000000", 20, 0, 0);
    textFont(fontHeavy)

    let titleOffset = verticalOffsets.title || 0;
    drawTextWithBox('title', fontHeavy, getMaxTextSize(albumData.title, width - leftMargin * 2, 100) + textSizeOffsets.title,
                     albumData.title, leftMargin, topMargin + y + titleOffset, width - leftMargin * 2, 70);

    let artistOffset = verticalOffsets.artist || 0;
    let bbox = drawTextWithBox('artist', fontRegularCondensed, 45 + textSizeOffsets.artist,
                                albumData.artist, leftMargin, topMargin + y + 110 + artistOffset, width * 0.35, 50);
    y += bbox.h;

    let yearOffset = verticalOffsets.year || 0;
    let yearY = topMargin + y + 85 + 60 + yearOffset;
    textFont(fontLight); textLeading(60); textSize(38 + textSizeOffsets.year); fill(230);
    text("\n" + albumData.year + "\n", leftMargin, topMargin + y + 85 + yearOffset, width * 0.35);
    addTextBox('year', fontLight.textBounds(albumData.year, leftMargin, yearY, width * 0.35), 38 + textSizeOffsets.year);

    let genreOffset = verticalOffsets.genre || 0;
    textSize(30 + textSizeOffsets.genre); textLeading(40);
    let genreText = shortenText(albumData.genre, width * 0.35);
    let genreY = topMargin + y + 75 + (40 * 3) + genreOffset;
    text("\n\n\n" + genreText, leftMargin, topMargin + y + 75 + genreOffset, width * 0.35);
    addTextBox('genre', fontLight.textBounds(genreText, leftMargin, genreY, width * 0.35), 30 + textSizeOffsets.genre);

    let funfactOffset = verticalOffsets.funfact || 0;
    let funfactSize = 30 + textSizeOffsets.funfact;
    let funfactLeading = 40 + textLeadingOffsets.funfact;
    let funfactStartY = topMargin + y + 120 + (40 * 4) + funfactOffset;
    textLeading(40); text("\n\n\n\n", leftMargin, topMargin + y + 120 + funfactOffset, width * 0.35);
    textSize(funfactSize); textLeading(funfactLeading); text(albumData.funfact, leftMargin, funfactStartY, width * 0.425);
    addTextBox('funfact', fontLight.textBounds(albumData.funfact, leftMargin, funfactStartY, width * 0.425), funfactSize);
    utils.endShadow();

    // Draw tracks
    push()
    y = 820; let x = 275;
    let spacing = Math.min(map(albumData.tracks.length, 5, 20, 80, 45, true), 70);
    textFont(fontRegular); textSize(60); textAlign(LEFT, BASELINE);
    rectMode(CENTER); let w = (leftMargin + x) * 0.75, h = 40;
    let tracksVertOffset = verticalOffsets.tracks || 0;

    let tracksStartY = y + tracksVertOffset;
    let tracksMinX = leftMargin, tracksMaxX = leftMargin + x + 700;
    let tracksMinY = tracksStartY - 50, tracksMaxY = tracksStartY;

    for(let i = 0; i < albumData.tracks.length; i++){
        let track = albumData.tracks[i];
        let trackY = tracksStartY;
        textSize(60); textFont(fontRegular);
        let textHeight = textAscent() + textDescent();
        let rectCenterOffset = textAscent() - textHeight / 2;

        let gradeColor = colorMap[track.grade] || "#888888";
        fill(gradeColor);
        if(track.grade == 'GOAT'){
            utils.beginLinearGradient(["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
                (leftMargin + x) * 0.5 - w * 0.5, trackY - rectCenterOffset, (leftMargin + x) * 0.5 + w * 0.5, trackY - rectCenterOffset, [0, .2, .38, .59, 1]);
        }
        noStroke();
        if(track.grade == 'GOAT') utils.beginShadow("#ffffff", 50, 0, 0);
        if(track.grade == 'S') utils.beginShadow(colorMap[track.grade], 35, 0, 0);
        rect((leftMargin + x) * 0.5, trackY - rectCenterOffset, w, h, 20);
        if(track.grade == 'GOAT' || track.grade == 'S') utils.endShadow();

        if (track.customText && track.customText.trim() !== '') {
            push(); blendMode(BLEND); textAlign(CENTER, CENTER); fill(0, 160); textFont(fontRegularCondensed);
            let customTextSize = getMaxTextSize(track.customText, w - 40, 32);
            textSize(customTextSize); text(track.customText, (leftMargin + x) * 0.5, trackY - rectCenterOffset);
            textSize(60); pop();
        }

        fill(255); textAlign(LEFT, BASELINE);
        let trackNumber = track.customNumber || (i + 1).toString();
        text(shortenText(trackNumber + ". " + track.title + (track.playing ? " " + musicChar : ""), 700), leftMargin + x, trackY);
        tracksStartY += spacing;
    }

    tracksMaxY = tracksStartY + 50;
    pop()

    // Add tracks box for selection
    textBoxes.push({
        id: 'tracks',
        x: tracksMinX,
        y: tracksMinY,
        w: tracksMaxX - tracksMinX,
        h: tracksMaxY - tracksMinY,
        sizeOffset: 0,
        currentSize: 0
    });

    // Album grade at bottom
    let gradeRectHeight = 150;
    fill(colorMap[albumData.albumGrade] || "#888888");
    rectMode(CORNER); noStroke();
    if(albumData.albumGrade == 'GOAT'){
        utils.beginLinearGradient(["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
            0, height - gradeRectHeight, width, height - gradeRectHeight, [0, .2, .38, .59, 1]);
    }
    rect(0, height - gradeRectHeight, width, gradeRectHeight, 20, 20, 0, 0);

    push()
    let namingMap = { "GOAT": "GOAT", "S": "PEAK", "A": "EXCEPTIONAL", "B": "STRONG", "C": "DECENT", "D": "MEH", "F": "FLOP", "Interlude": "INTERLUDE" };
    textAlign(CENTER, CENTER); fill(255); textFont(fontHeavy); textSize(100);
    utils.beginShadow("#ffffffa3", 30, 0, 0);
    text(namingMap[albumData.albumGrade] || albumData.albumGrade, width * 0.5, height - gradeRectHeight * 0.43);
    utils.endShadow();
    pop()

    // Draw selection outline for any selected box
    if (selectedId) selectedTextBox = textBoxes.find(b => b.id === selectedId);
    if (selectedTextBox) {
        push();
        noFill();
        stroke(138, 180, 248);
        strokeWeight(3);
        rectMode(CORNER);
        let padding = 5;
        rect(selectedTextBox.x - padding, selectedTextBox.y - padding, selectedTextBox.w + padding * 2, selectedTextBox.h + padding * 2, 5);
        pop();
    }
}

function drawTextWithBox(id, font, size, textStr, x, y, maxWidth, leading) {
    size = max(10, size);
    textFont(font); 
    textSize(size); 
    fill(255); 
    textLeading(leading); 
    text(textStr, x, y, maxWidth);
    let bbox = font.textBounds(textStr, x, y, maxWidth);
    addTextBox(id, bbox, size);
    return bbox;
}

function addTextBox(id, bounds, size) {
    textBoxes.push({ id, x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h, sizeOffset: textSizeOffsets[id], currentSize: size });
}

async function printCoverScreen() {
    background(200);
    let selectedId = selectedTextBox ? selectedTextBox.id : null;
    textBoxes = [];

    let coverSize = width * 0.8, coverY = height * 0.42, hasImage = false, imgBW, img;

    if (albumData.imageUrl && albumData.imageUrl.trim() !== '') {
        try {
            let images = await loadAndCacheImages(albumData.imageUrl);
            img = images.original; imgBW = images.filtered; hasImage = true;
        } catch (err) {
            console.error('Failed to load image:', err);
            showToast('Failed to load image. Check the URL.', true);
        }
    }

    if (hasImage) { imageMode(CENTER); image(imgBW, width * 0.5, height * 0.5, height, height); }
    else background(50);

    utils.beginShadow("#000000", 30, 0, 0);
    textAlign(CENTER, TOP); textFont(fontLight); textSize(55); fill(255);
    text("Album Review", width * 0.5, 260);
    utils.endShadow();

    imageMode(CENTER); rectMode(CENTER);
    utils.beginShadow("#000000", 80, 0, 0);
    if (hasImage) { rect(width * 0.5, coverY, coverSize, coverSize); image(img, width * 0.5, coverY, coverSize, coverSize); }
    else drawImagePlaceholder(width * 0.5, coverY, coverSize, coverSize, false);
    utils.endShadow();

    push()
    textAlign(CENTER, TOP)

    utils.beginShadow("#000000", 20, 0, 0);
    let titleY = coverY + coverSize * 0.5 + 60;
    textFont(fontHeavy); 
    let titleSize = getMaxTextSize(albumData.title, width - 100, 100) + textSizeOffsets.title;
    titleSize = max(10, titleSize);
    console.log(titleSize)
    textSize(titleSize); fill(255); text(albumData.title, width * 0.5, titleY);
    addTextBox('title', fontHeavy.textBounds(albumData.title, width * 0.5, titleY, width - 100), titleSize);

    textFont(fontRegularCondensed);
    let artistSize = getMaxTextSize(albumData.artist, width - 100, 50) + textSizeOffsets.artist;
     textSize(artistSize); fill(230); text(albumData.artist, width * 0.5, titleY + 130);
    addTextBox('artist', fontRegularCondensed.textBounds(albumData.artist, width * 0.5, titleY + 130, width - 100), artistSize);
    utils.endShadow();

    if (selectedId) selectedTextBox = textBoxes.find(b => b.id === selectedId);
    if (selectedTextBox) {
        noFill(); stroke(255); strokeWeight(3); rectMode(CORNER);
        let padding = 5;
        rect(selectedTextBox.x - padding, selectedTextBox.y - padding, selectedTextBox.w + padding * 2, selectedTextBox.h + padding * 2, 5);
        noStroke();
    }
    pop()
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
    if(frameCount % 60 === 0) autoGeneratePreview();
}

function mousePressed() {
    let canvasEl = document.querySelector('canvas');
    let canvasRect = canvasEl.getBoundingClientRect();
    let scaledMouseX = mouseX / canvasScale;
    let scaledMouseY = mouseY / canvasScale;

    if (sizeAdjustPanel && sizeAdjustPanel.style('display') !== 'none') {
        let panel = sizeAdjustPanel.elt;
        let panelRect = panel.getBoundingClientRect();
        let mouseClientX = mouseX + canvasRect.left;
        let mouseClientY = mouseY + canvasRect.top;
        if (mouseClientX >= panelRect.left && mouseClientX <= panelRect.right &&
            mouseClientY >= panelRect.top && mouseClientY <= panelRect.bottom) return;
    }

    if (scaledMouseX < 0 || scaledMouseX > width || scaledMouseY < 0 || scaledMouseY > height) return;

    let clickedBox = textBoxes.find(box =>
        scaledMouseX >= box.x && scaledMouseX <= box.x + box.w &&
        scaledMouseY >= box.y && scaledMouseY <= box.y + box.h
    );

    if (clickedBox) {
        let selectionChanged = !selectedTextBox || selectedTextBox.id !== clickedBox.id;
        selectedTextBox = clickedBox;

        // Show size adjust panel only for text boxes (not for tracks or image)
        if (clickedBox.id !== 'tracks' && clickedBox.id !== 'image') {
            showSizeAdjustPanel(clickedBox);
        } else {
            // For tracks and image, just update the vertical offset slider
            sizeAdjustPanel.style('display', 'none');
            updateVerticalOffsetSlider();
        }

        if (selectionChanged) currentView === 'ratings' ? printAlbum() : printCoverScreen();
    } else {
        if (selectedTextBox) {
            selectedTextBox = null;
            sizeAdjustPanel.style('display', 'none');
            updateVerticalOffsetSlider();
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }
    }
}

function showSizeAdjustPanel(box) {
    let sizeDisplay = select('#size-display');
    sizeDisplay.html(box.sizeOffset >= 0 ? '+' + box.sizeOffset : box.sizeOffset);

    let leadingContainer = select('#leading-container');
    if (box.id === 'funfact') {
        leadingContainer.style('display', 'flex');
        let leadingDisplay = select('#leading-display');
        leadingDisplay.html((textLeadingOffsets.funfact || 0) >= 0 ? '+' + textLeadingOffsets.funfact : textLeadingOffsets.funfact);
    } else leadingContainer.style('display', 'none');

    sizeAdjustPanel.style('display', 'flex');

    // Update vertical offset slider
    updateVerticalOffsetSlider();
}

function updateVerticalOffsetSlider() {
    if (!verticalOffsetSlider) return;

    if (selectedTextBox) {
        // Enable slider and set value
        verticalOffsetSlider.removeAttribute('disabled');
        verticalOffsetSlider.removeClass('disabled');
        let offset = verticalOffsets[selectedTextBox.id] || 0;
        verticalOffsetSlider.value(offset);
        verticalOffsetLabel.html(offset);
    } else {
        // Disable slider
        verticalOffsetSlider.attribute('disabled', '');
        verticalOffsetSlider.addClass('disabled');
        verticalOffsetSlider.value(0);
        verticalOffsetLabel.html('0');
    }
}

function adjustTextSize(delta) {
    if (!selectedTextBox) return;
    if (textSizeOffsets.hasOwnProperty(selectedTextBox.id)) {
        textSizeOffsets[selectedTextBox.id] += delta;
        selectedTextBox.sizeOffset = textSizeOffsets[selectedTextBox.id];
    }
    captureState();
    showSizeAdjustPanel(selectedTextBox);
    currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

function adjustTextLeading(delta) {
    if (!selectedTextBox || selectedTextBox.id !== 'funfact') return;
    textLeadingOffsets.funfact += delta;
    captureState();
    showSizeAdjustPanel(selectedTextBox);
    currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

function resetTextBoxToDefault() {
    if (!selectedTextBox) return;
    if (textSizeOffsets.hasOwnProperty(selectedTextBox.id)) {
        textSizeOffsets[selectedTextBox.id] = 0;
        selectedTextBox.sizeOffset = 0;
    }
    if (selectedTextBox.id === 'funfact') textLeadingOffsets.funfact = 0;
    captureState();
    showSizeAdjustPanel(selectedTextBox);
    currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

// ============ UNDO/REDO FUNCTIONS ============

function captureState() {
    if (isUndoRedoAction) return;
    let state = {
        title: titleInput.value(), artist: artistInput.value(), year: yearInput.value(),
        genre: genreInput.value(), funfact: funfactInput.value(), imageUrl: imageUrlInput.value(),
        albumGrade: albumGradeSelect.value(),
        tracks: tracks.map(t => ({ title: t.titleInput.value(), grade: t.gradeSelect.value(),
                                    customNumber: t.customNumber || null, customText: t.textInput ? t.textInput.value() : null })),
        textSizeOffsets: {...textSizeOffsets},
        textLeadingOffsets: {...textLeadingOffsets},
        verticalOffsets: {...verticalOffsets}
    };

    if (historyIndex < historyStack.length - 1) historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(JSON.stringify(state));
    historyIndex = historyStack.length - 1;
    if (historyStack.length > MAX_HISTORY) { historyStack.shift(); historyIndex--; }
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
    titleInput.value(state.title || ''); artistInput.value(state.artist || '');
    yearInput.value(state.year || ''); genreInput.value(state.genre || '');
    funfactInput.value(state.funfact || ''); imageUrlInput.value(state.imageUrl || '');
    albumGradeSelect.selected(state.albumGrade || 'GOAT');

    if (state.textSizeOffsets) Object.assign(textSizeOffsets, state.textSizeOffsets);
    if (state.textLeadingOffsets) textLeadingOffsets.funfact = state.textLeadingOffsets.funfact || 0;
    if (state.verticalOffsets) Object.assign(verticalOffsets, state.verticalOffsets);

    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }

    if (state.tracks && state.tracks.length > 0) {
        state.tracks.forEach(track => {
            addTrackRowWithoutCapture();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'B');
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber + '.');
            }
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.style('display', 'block');
            }
        });
    } else addTrackRowWithoutCapture();

    generateFromForm();
    updateVerticalOffsetSlider();
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
            Object.keys(colors).forEach(grade => {
                if (colorMap.hasOwnProperty(grade)) colorMap[grade] = colors[grade];
            });
        } catch (err) { console.log("Error loading custom colors"); }
    }
}

function resetColors() {
    Object.keys(defaultColorMap).forEach(grade => {
        colorMap[grade] = defaultColorMap[grade];
        if (colorPickers[grade]) colorPickers[grade].value(defaultColorMap[grade]);
    });
    saveCustomColors();
}
