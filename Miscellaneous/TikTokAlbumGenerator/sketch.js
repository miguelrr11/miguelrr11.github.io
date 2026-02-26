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
const gradeOptions = ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP', 'INTERLUDE', 'None'];
let verticalOffsetSlider, verticalOffsetLabel;
let horizontalOffsetSlider, horizontalOffsetLabel;
let imageSizeMultiplierSlider, imageSizeMultiplierLabel;
let maxTextboxWidthSlider, maxTextboxWidthLabel;
let positionXInput, positionYInput, positionXLabel, positionYLabel;

// Aspect Ratio options (for ratings screen only)
let aspectRatioSelect;
const aspectRatioOptions = {
    '9:16': { width: 1080, height: 1920 },   // Default - TikTok, Instagram Stories, YouTube Shorts
    '3:5': { width: 1080, height: 1800 },    // Medium vertical
    '8:13': { width: 1080, height: 1755 },   // Custom
    '2:3': { width: 1080, height: 1620 },    // Photo vertical
    '3:4': { width: 1080, height: 1440 },    // Classic Portrait
    '4:5': { width: 1080, height: 1350 },    // Instagram Portrait
    '5:6': { width: 1080, height: 1296 },    // Slight vertical
    '1:1': { width: 1080, height: 1080 }     // Square
};
let currentAspectRatio = '9:16';

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
let verticalOffsetsRatings = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0, tracks: 0, image: 0 };
let verticalOffsetsCover = { title: 0, artist: 0 };
let horizontalOffsetsRatings = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0, tracks: 0, image: 0 };
let horizontalOffsetsCover = { title: 0, artist: 0 };
let imageSizeMultiplier = 1.0;
let maxTextboxWidths = { title: 980, artist: 378, year: 378, genre: 378, funfact: 459 };
const defaultMaxTextboxWidths = { title: 980, artist: 450, year: 378, genre: 378, funfact: 480 };
let textAlignRatings = { title: 'left', artist: 'left', year: 'left', genre: 'left', funfact: 'left' };
let textAlignCover = { title: 'center', artist: 'center' };

// Track customization
let tracksTextSize = 60;
let tracksSpacing = 0; // Added to base spacing calculation
let tracksRectHeight = 40;
let tracksTextSizeSlider, tracksSpacingSlider, tracksRectHeightSlider;
let tracksTextSizeLabel, tracksSpacingLabel, tracksRectHeightLabel;
let automaticAlignmentCheckbox

// Export settings
let showGreenRectangle = true; // Only show when not downloading
let imageFormatSelect;
let currentImageFormat = 'png';
let showGradeLegend = true;
let gradeLegendCheckbox;

// Image cache
let cachedImageUrl = null, cachedOriginalImage = null, cachedFilteredImage = null;
let lastUrlChecked = null;

// Custom color map
let colorMap = { "GOAT": "#ffffff", "PEAK": "#ffd21f", "EXCEPTIONAL": "#ff1fa9", "STRONG": "#bc3fde", "DECENT": "#38b6ff", "OKAY": "#14b60b", "FLOP": "#902020", "INTERLUDE": "#b2b2b2" };
const defaultColorMap = {...colorMap};
let colorPickers = {}, canvasScale = 1;

// Profile system
let profiles = {};
let currentProfileName = 'Default';
let profileSelect, profileNameInput;

// Custom textboxes system
let customTextboxes = [];
let customTextboxContainer;
let isDraggingTextbox = false;
let draggedTextbox = null;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;
let shiftDragAxis = null; // null, 'x', or 'y' - for shift+drag constraint

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
    loadProfiles();
    updateProfileSelect();
    loadCustomColors();
    loadLastProfile(); // Apply profile first (sets defaults)
    loadFromLocalStorage(); // Then load album data (overrides profile settings)
    captureState();

    setInterval(saveToLocalStorage, 1000);
    document.addEventListener('keydown', handleKeyboard);
}

function createTracksFromPaste(texto){
    function getLastNumber(line){
        const match = line.match(/(\d+(?:[.,]\d+)?)\s*$/);

        if(match){
            const number = parseFloat(match[1].replace(',', '.'));
            const text = line.slice(0, match.index).trimEnd();
            return { number, text };
        }

        return { number: null, text: line };
    }

    for(let i = tracks.length-1; i > 0; i--) removeTrackRow(i)
    const lineas = texto.split(/\r?\n/);
    let trackIndex = 0
    for(let i = 0; i < lineas.length; i++){
        let linea = lineas[i]
        if(linea.trim() === '') continue
        let lineObj = getLastNumber(linea)
        let grade = lineObj.number
        let finalGrade
        let text = lineObj.text
        setTrackText(tracks[trackIndex], text)
        if(grade == null) finalGrade = 'Interlude'
        else if(grade >= 10.5) finalGrade = 'GOAT'
        else if(grade >= 10) finalGrade = 'PEAK'
        else if(grade >= 9) finalGrade = 'EXCEPTIONAL'
        else if(grade >= 8) finalGrade = 'STRONG'
        else if(grade >= 7) finalGrade = 'DECENT'
        else if(grade >= 5) finalGrade = 'OKAY'
        else finalGrade = 'FLOP'
        tracks[trackIndex].gradeSelect.value(finalGrade)
        if(i < lineas.length - 2) addTrackRowWithCapture()
        trackIndex++
    }
}

function setTrackText(trackObj, newText) {
    trackObj.titleInput.value(newText);
    const evt = new Event('input', { bubbles: true });
    trackObj.titleInput.elt.dispatchEvent(evt);
    trackObj.titleInput.elt.dispatchEvent(new Event('blur', { bubbles: true }));
}


function setupDragDrop() {
    document.addEventListener('dragover', (e) => {
        // Only show overlay if dragging files (not internal elements)
        if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            dragOverlay.addClass('active');
        }
    });
    document.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null) dragOverlay.removeClass('active');
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
    // Create 3-column layout
    let panel1 = createDiv('').parent(editorPanel).class('panel-column panel-metadata');
    let panel2 = createDiv('').parent(editorPanel).class('panel-column panel-tracks');
    let panel3 = createDiv('').parent(editorPanel).class('panel-column panel-settings');

    // === Panel 1: Album Metadata ===
    let header = createDiv('').parent(panel1).class('panel-header');
    createElement('h2', 'Album Editor').parent(header);
    createElement('p', 'Drag & drop JSON or fill manually').parent(header);

    let rowGroupAlbum = createDiv('').parent(panel1).style('display: flex; gap: 12px;');
    titleInput = createFormInput('Album Title', 'Enter album title...', rowGroupAlbum);
    artistInput = createFormInput('Artist', 'Enter artist name...', rowGroupAlbum);

    let rowGroup = createDiv('').parent(panel1).style('display: flex; gap: 12px;');
    yearInput = createFormInput('Year', 'e.g. 1997', rowGroup);
    genreInput = createFormInput('Genre', 'e.g. Rock', rowGroup);

    funfactInput = createFormTextarea('Description', 'Add a description or fun fact about the album...', panel1);
    createImageInputWithUpload(panel1);

    let gradeRow = createDiv('').parent(panel1).style('display: flex; gap: 35px; align-items: center;');
    let gradeGroup = createDiv('').parent(gradeRow).class('form-group').style('flex: 1;');
    createElement('label', 'Album Grade').parent(gradeGroup);
    albumGradeSelect = createSelect().parent(gradeGroup).class('form-select');
    gradeOptions.forEach(opt => albumGradeSelect.option(opt));
    albumGradeSelect.changed(() => { autoGeneratePreview(); captureState(); });

    createPositionControls(gradeRow);

    let addTextboxBtn = createButton('+ Add Textbox').parent(panel1).class('btn btn-secondary').style('margin-bottom: 20px;');
    addTextboxBtn.mousePressed(addCustomTextbox);
    customTextboxContainer = createDiv('').parent(panel1);

    // === Panel 2: Tracks ===
    createDiv('Tracks').parent(panel2).class('section-title');
    trackContainer = createDiv('').parent(panel2).class('track-container');
    addTrackRow();

    // Create a container for the buttons
    let trackButtonsRow = createDiv('').parent(panel2)
        .style('display: flex; gap: 8px; margin-top: 10px;');

    // Add Track button (half-width)
    let addTrackBtn = createButton('Add Track').parent(trackButtonsRow)
        .class('btn btn-secondary')
        .style('flex: 1');

    // Paste Tracks button (half-width)
    let pasteTracksBtn = createButton('Paste Tracks').parent(trackButtonsRow)
        .class('btn btn-secondary')
        .style('flex: 1');

    pasteTracksBtn.mousePressed(async () => {
        try {
            const texto = await navigator.clipboard.readText();
            createTracksFromPaste(texto);
        } catch (err) {
            console.error("No se pudo leer el clipboard:", err);
        }
    });

    // === Panel 3: Settings ===
    createButtonGrid(panel3);
    createProfileSection(panel3);
    createTracksCustomizationSection(panel3);
    createColorSection(panel3);
    createAdvancedOptionsSection(panel3);

    // Size adjust panel (fixed position, not in any column)
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

function createImageInputWithUpload(parent = editorPanel) {
    let group = createDiv('').parent(parent).class('form-group');
    createElement('label', 'Image (URL or Local)').parent(group);

    let inputRow = createDiv('').parent(group).class('image-input-row');

    imageUrlInput = createInput('').parent(inputRow).class('form-input');
    imageUrlInput.attribute('placeholder', 'https://... or upload →');
    imageUrlInput.elt.addEventListener('input', () => {
        lastUrlChecked = null;
        autoGeneratePreview();
    });
    imageUrlInput.elt.addEventListener('blur', captureState);

    // Hidden file input
    let fileInput = createElement('input').parent(inputRow);
    fileInput.attribute('type', 'file');
    fileInput.attribute('accept', 'image/*');
    fileInput.class('hidden-file-input');

    // Upload button
    let uploadBtn = createButton('📁').parent(inputRow).class('image-upload-btn');
    uploadBtn.attribute('title', 'Upload local image');
    uploadBtn.mousePressed(() => fileInput.elt.click());

    // Handle file selection
    fileInput.elt.addEventListener('change', (e) => {
        let file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            let reader = new FileReader();
            reader.onload = (event) => {
                imageUrlInput.value(event.target.result);
                lastUrlChecked = null;
                cachedImageUrl = null;
                cachedOriginalImage = null;
                cachedFilteredImage = null;
                autoGeneratePreview();
                captureState();
            };
            reader.readAsDataURL(file);
        }
    });
}

function createFormTextarea(label, placeholder, parent = editorPanel) {
    let group = createDiv('').parent(parent).class('form-group');
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

function createPositionControls(parent) {
    let group = createDiv('').parent(parent).class('form-group').style('flex', '1.2');
    createElement('label', 'Position').parent(group);
    let container = createDiv('').parent(group).class('position-controls');

    // X controls
    positionXLabel = createSpan('X').parent(container).class('position-label');
    setupLongPressButton(createButton('−').parent(container).class('position-btn'), 'x', -1);
    positionXInput = createInput('0').parent(container).class('position-input');
    positionXInput.attribute('type', 'number');
    positionXInput.elt.addEventListener('input', () => {
        if (!selectedTextBox) return;
        let value = parseInt(positionXInput.value()) || 0;
        applyPositionChange('x', value);
    });
    positionXInput.elt.addEventListener('blur', captureState);
    setupLongPressButton(createButton('+').parent(container).class('position-btn'), 'x', 1);

    // Y controls
    positionYLabel = createSpan('Y').parent(container).class('position-label').style('margin-left', '6px');
    setupLongPressButton(createButton('−').parent(container).class('position-btn'), 'y', -1);
    positionYInput = createInput('0').parent(container).class('position-input');
    positionYInput.attribute('type', 'number');
    positionYInput.elt.addEventListener('input', () => {
        if (!selectedTextBox) return;
        let value = parseInt(positionYInput.value()) || 0;
        applyPositionChange('y', value);
    });
    positionYInput.elt.addEventListener('blur', captureState);
    setupLongPressButton(createButton('+').parent(container).class('position-btn'), 'y', 1);

    // Initially disable
    disablePositionControls();
}

function setupLongPressButton(btn, axis, delta) {
    let longPressTimeout = null;
    let repeatInterval = null;
    let hasInteracted = false;

    const startAction = () => {
        hasInteracted = true;
        adjustPosition(axis, delta);

        // Start long press detection after 500ms
        longPressTimeout = setTimeout(() => {
            // Start rapid repeat at 50ms intervals
            repeatInterval = setInterval(() => {
                adjustPosition(axis, delta);
            }, 50);
        }, 500);
    };

    const stopAction = () => {
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
            longPressTimeout = null;
        }
        if (repeatInterval) {
            clearInterval(repeatInterval);
            repeatInterval = null;
        }
        if (hasInteracted) {
            captureState();
            hasInteracted = false;
        }
    };

    btn.elt.addEventListener('mousedown', startAction);
    btn.elt.addEventListener('mouseup', stopAction);
    btn.elt.addEventListener('mouseleave', stopAction);
    btn.elt.addEventListener('touchstart', (e) => { e.preventDefault(); startAction(); });
    btn.elt.addEventListener('touchend', stopAction);
    btn.elt.addEventListener('touchcancel', stopAction);
}

function adjustPosition(axis, delta) {
    if (!selectedTextBox) return;

    if (selectedTextBox.isCustom) {
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            if (axis === 'x') textbox.x += delta;
            else textbox.y += delta;
        }
    } else {
        if (currentView === 'ratings') {
            if (axis === 'x') {
                horizontalOffsetsRatings[selectedTextBox.id] = (horizontalOffsetsRatings[selectedTextBox.id] || 0) + delta;
            } else {
                verticalOffsetsRatings[selectedTextBox.id] = (verticalOffsetsRatings[selectedTextBox.id] || 0) + delta;
            }
        } else {
            if (axis === 'x') {
                horizontalOffsetsCover[selectedTextBox.id] = (horizontalOffsetsCover[selectedTextBox.id] || 0) + delta;
            } else {
                verticalOffsetsCover[selectedTextBox.id] = (verticalOffsetsCover[selectedTextBox.id] || 0) + delta;
            }
        }
    }

    updatePositionControls();
    currentView === 'ratings' ? printAlbum() : printCoverScreen();
    // Note: captureState is called by setupLongPressButton after mouseup
}

function applyPositionChange(axis, value) {
    if (!selectedTextBox) return;

    if (selectedTextBox.isCustom) {
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            if (axis === 'x') textbox.x = value;
            else textbox.y = value;
        }
    } else {
        if (currentView === 'ratings') {
            if (axis === 'x') horizontalOffsetsRatings[selectedTextBox.id] = value;
            else verticalOffsetsRatings[selectedTextBox.id] = value;
        } else {
            if (axis === 'x') horizontalOffsetsCover[selectedTextBox.id] = value;
            else verticalOffsetsCover[selectedTextBox.id] = value;
        }
    }

    currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

function updatePositionControls() {
    if (!selectedTextBox) {
        disablePositionControls();
        return;
    }

    enablePositionControls();

    let xVal, yVal;
    if (selectedTextBox.isCustom) {
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            xVal = Math.round(textbox.x);
            yVal = Math.round(textbox.y);
        } else {
            xVal = yVal = 0;
        }
    } else {
        if (currentView === 'ratings') {
            xVal = horizontalOffsetsRatings[selectedTextBox.id] || 0;
            yVal = verticalOffsetsRatings[selectedTextBox.id] || 0;
        } else {
            xVal = horizontalOffsetsCover[selectedTextBox.id] || 0;
            yVal = verticalOffsetsCover[selectedTextBox.id] || 0;
        }
    }

    positionXInput.value(xVal);
    positionYInput.value(yVal);
}

function enablePositionControls() {
    if (positionXInput) {
        positionXInput.removeAttribute('disabled');
        positionXInput.removeClass('disabled');
    }
    if (positionYInput) {
        positionYInput.removeAttribute('disabled');
        positionYInput.removeClass('disabled');
    }
}

function disablePositionControls() {
    if (positionXInput) {
        positionXInput.attribute('disabled', '');
        positionXInput.addClass('disabled');
        positionXInput.value(0);
    }
    if (positionYInput) {
        positionYInput.attribute('disabled', '');
        positionYInput.addClass('disabled');
        positionYInput.value(0);
    }
}

function createButtonGrid(parent = editorPanel) {
    let buttonGrid = createDiv('').parent(parent).class('button-grid');

    // Aspect Ratio & Image Format selectors
    let aspectRatioRow = createDiv('').parent(buttonGrid).style('display: flex; gap: 12px; margin-bottom: 10px;');

    // Aspect Ratio selector (half width)
    let aspectRatioGroup = createDiv('').parent(aspectRatioRow).class('form-group').style('flex: 1; margin-bottom: 0; align-items: end;');
    createElement('label', 'Aspect Ratio').parent(aspectRatioGroup);
    aspectRatioSelect = createSelect().parent(aspectRatioGroup).class('form-select');
    Object.keys(aspectRatioOptions).forEach(opt => aspectRatioSelect.option(opt));
    aspectRatioSelect.selected('9:16');
    aspectRatioSelect.changed(() => {
        currentAspectRatio = aspectRatioSelect.value();
        autoGeneratePreview();
        captureState();
    });

    // Image Format selector (half width)
    let imageFormatGroup = createDiv('').parent(aspectRatioRow).class('form-group').style('flex: 1; margin-bottom: 0;');
    createElement('label', 'Image Format').parent(imageFormatGroup);
    imageFormatSelect = createSelect().parent(imageFormatGroup).class('form-select');
    ['png', 'jpg', 'jpeg', 'webp'].forEach(format => imageFormatSelect.option(format));
    imageFormatSelect.selected('png');
    imageFormatSelect.changed(() => {
        currentImageFormat = imageFormatSelect.value();
        captureState();
    });

    //let downloadRow = createDiv('').parent(buttonGrid).class('button-row');
    createButton('JSON').parent(aspectRatioRow).class('btn btn-blue').mousePressed(downloadJSON);
    createButton('Images').parent(aspectRatioRow).class('btn btn-purple').mousePressed(downloadBothImages);

    viewToggleBtn = createButton('View: Ratings').parent(buttonGrid).class('btn btn-orange');
    viewToggleBtn.mousePressed(toggleView);

    let undoRedoRow = createDiv('').parent(buttonGrid).class('button-row');
    createButton('↶ Undo').parent(undoRedoRow).class('btn btn-secondary').elt.addEventListener('click', (e) => { e.preventDefault(); undo(); });
    createButton('↷ Redo').parent(undoRedoRow).class('btn btn-secondary').elt.addEventListener('click', (e) => { e.preventDefault(); redo(); });

    createButton('Clear All').parent(buttonGrid).class('btn btn-danger').mousePressed(clearAll);
}

function createProfileSection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let profileSection = createDiv('').parent(parent).class('color-section');
    let profileHeader = createDiv('').parent(profileSection).class('color-section-header');
    let profileToggle = createSpan('▶').parent(profileHeader).class('color-toggle');
    createSpan(' Profiles').parent(profileHeader);

    let profileContent = createDiv('').parent(profileSection).class('color-content collapsed');

    profileHeader.mousePressed(() => {
        if (profileContent.hasClass('collapsed')) {
            profileContent.removeClass('collapsed');
            profileToggle.html('▼');
        } else {
            profileContent.addClass('collapsed');
            profileToggle.html('▶');
        }
    });

    // Profile selector and apply/delete row
    let selectRow = createDiv('').parent(profileContent).style('display: flex; gap: 8px; margin-bottom: 10px;');

    let selectGroup = createDiv('').parent(selectRow).class('form-group').style('flex: 1; margin-bottom: 0;');
    profileSelect = createSelect().parent(selectGroup).class('form-select');
    profileSelect.option('Default'); // Add default initially, will be updated after loadProfiles()

    createButton('Apply').parent(selectRow).class('btn btn-primary').style('width: 60px; padding: 8px;').mousePressed(applySelectedProfile);
    createButton('Update').parent(selectRow).class('btn btn-blue').style('width: 60px; padding: 8px;').mousePressed(updateSelectedProfile);
    createButton('Delete').parent(selectRow).class('btn btn-danger').style('width: 60px; padding: 8px;').mousePressed(deleteSelectedProfile);

    // Save new profile row
    let saveRow = createDiv('').parent(profileContent).style('display: flex; gap: 8px;');

    let nameGroup = createDiv('').parent(saveRow).class('form-group').style('flex: 1; margin-bottom: 0;');
    profileNameInput = createInput('').parent(nameGroup).class('form-input');
    profileNameInput.attribute('placeholder', 'New profile name...');

    createButton('Save').parent(saveRow).class('btn btn-secondary').style('width: 70px; padding: 8px;').mousePressed(saveNewProfile);
}

function alignMainElementsToImage(){
    if(automaticAlignmentCheckbox.checked() === false) return;
    let xWithNoOffset = width * 0.475

    let sizeSclMult = 0.425

    let imageHorizOffset = horizontalOffsetsRatings.image || 0;
    let imageX = width * 0.05 + imageHorizOffset;
    let imageSize = width * sizeSclMult * imageSizeMultiplier;

    let imageXRight = imageX + imageSize;

    let marginNeeded = Math.round(imageXRight - xWithNoOffset - 20)

    horizontalOffsetsRatings.artist = marginNeeded;
    horizontalOffsetsRatings.year = marginNeeded;
    horizontalOffsetsRatings.genre = marginNeeded;
    horizontalOffsetsRatings.funfact = marginNeeded;

    captureState();
    currentView === 'ratings' ? printAlbum() : printCoverScreen();    
}

function getDefaultProfile() {
    return {
        tracksTextSize: 44,
        tracksSpacing: -18,
        tracksRectHeight: 28,
        tracksVerticalOffset: 0,
        colorMap: {...defaultColorMap},
        aspectRatio: '3:4',
        imageFormat: 'jpg',
        showGradeLegend: true,
        verticalOffsetsRatings: {funfact: -21},
        verticalOffsetsCover: {artist: -15},
        horizontalOffsetsRatings: {artist: -40, funfact: -40, year: -40, genre: -40},
        horizontalOffsetsCover: {},
        imageSizeMultiplier: 0.95,
        maxTextboxWidths: {...defaultMaxTextboxWidths},
        textSizeOffsets: {funfact: -4},
        textLeadingOffsets: {funfact: -4},
        textAlignRatings: { title: 'left', artist: 'left', year: 'left', genre: 'left', funfact: 'left' },
        textAlignCover: { title: 'center', artist: 'center' },
        customTextboxes: [{
            "id": "album_review",
            "text": "Album Review",
            "x": width/2,
            "y": 335,
            "fontSize": 54,
            "fontType": "fontLight",
            "color": "#ffffff",
            "viewType": "cover",
            "leading": 0,
            "maxWidth": 980,
            "textAlign": "center"
        },
        {
            "color": "#ffffff",
            "fontSize": 44,
            "fontType": "fontRegular",
            "leading": 0,
            "maxWidth": 980,
            "text": "comentario",
            "viewType": "cover",
            "textAlign": "center",
            "x": width/2,
            "y": 1574,
            "id": "comentario"
        }]
    };
}

function getCurrentProfileData() {
    return {
        tracksTextSize: tracksTextSize,
        tracksSpacing: tracksSpacing,
        tracksRectHeight: tracksRectHeight,
        tracksVerticalOffset: verticalOffsetsRatings.tracks || 0,
        colorMap: {...colorMap},
        aspectRatio: currentAspectRatio,
        imageFormat: currentImageFormat,
        showGradeLegend: showGradeLegend,
        verticalOffsetsRatings: {...verticalOffsetsRatings},
        verticalOffsetsCover: {...verticalOffsetsCover},
        horizontalOffsetsRatings: {...horizontalOffsetsRatings},
        horizontalOffsetsCover: {...horizontalOffsetsCover},
        imageSizeMultiplier: imageSizeMultiplier,
        maxTextboxWidths: {...maxTextboxWidths},
        textSizeOffsets: {...textSizeOffsets},
        textLeadingOffsets: {...textLeadingOffsets},
        textAlignRatings: {...textAlignRatings},
        textAlignCover: {...textAlignCover},
        customTextboxes: getCustomTextboxesProperties()
    };
}

function getCustomTextboxesProperties(){
    return customTextboxes.map(tb => ({
        color: tb.color,
        fontSize: tb.fontSize,
        fontType: tb.fontType,
        leading: tb.leading,
        maxWidth: tb.maxWidth,
        text: tb.text,
        viewType: tb.viewType,
        textAlign: tb.textAlign || 'left',
        x: tb.x,
        y: tb.y,
        id: tb.id
    }));
}

function applyProfile(profileData) {
    // Apply tracks customization
    tracksTextSize = profileData.tracksTextSize || 60;
    tracksSpacing = profileData.tracksSpacing || 0;
    tracksRectHeight = profileData.tracksRectHeight || 40;
    verticalOffsetsRatings.tracks = profileData.tracksVerticalOffset || 0;
    customTextboxes = customTextboxes.filter(tb => tb.id !== 'album_review' && tb.id !== 'comentario');

    // Update track sliders
    if (tracksTextSizeSlider) {
        tracksTextSizeSlider.value(tracksTextSize);
        tracksTextSizeLabel.html(tracksTextSize);
    }
    if (tracksSpacingSlider) {
        tracksSpacingSlider.value(tracksSpacing);
        tracksSpacingLabel.html(tracksSpacing);
    }
    if (tracksRectHeightSlider) {
        tracksRectHeightSlider.value(tracksRectHeight);
        tracksRectHeightLabel.html(tracksRectHeight);
    }

    // Update vertical offset slider if tracks is selected
    if (selectedTextBox && selectedTextBox.id === 'tracks') {
        updateVerticalOffsetSlider();
    }

    // Apply colors
    if (profileData.colorMap) {
        Object.keys(profileData.colorMap).forEach(grade => {
            if (colorMap.hasOwnProperty(grade)) {
                colorMap[grade] = profileData.colorMap[grade];
                if (colorPickers[grade]) colorPickers[grade].value(profileData.colorMap[grade]);
            }
        });
        saveCustomColors();
    }

    // Apply aspect ratio
    if (profileData.aspectRatio && aspectRatioOptions[profileData.aspectRatio]) {
        currentAspectRatio = profileData.aspectRatio;
        aspectRatioSelect.selected(profileData.aspectRatio);
    }

    // Apply image format
    if (profileData.imageFormat) {
        currentImageFormat = profileData.imageFormat;
        imageFormatSelect.selected(profileData.imageFormat);
    }

    // Apply grade legend preference
    showGradeLegend = profileData.showGradeLegend !== undefined ? profileData.showGradeLegend : true;
    if (gradeLegendCheckbox) {
        gradeLegendCheckbox.checked(showGradeLegend);
    }

    // Clear existing offsets before applying profile
    Object.keys(verticalOffsetsRatings).forEach(k => delete verticalOffsetsRatings[k]);
    Object.keys(verticalOffsetsCover).forEach(k => delete verticalOffsetsCover[k]);
    Object.keys(horizontalOffsetsRatings).forEach(k => delete horizontalOffsetsRatings[k]);
    Object.keys(horizontalOffsetsCover).forEach(k => delete horizontalOffsetsCover[k]);
    Object.keys(textSizeOffsets).forEach(k => textSizeOffsets[k] = 0);
    Object.keys(textLeadingOffsets).forEach(k => textLeadingOffsets[k] = 0);
    Object.keys(maxTextboxWidths).forEach(k => maxTextboxWidths[k] = defaultMaxTextboxWidths[k] || 500);
    Object.keys(textAlignRatings).forEach(k => textAlignRatings[k] = 'left');
    Object.keys(textAlignCover).forEach(k => textAlignCover[k] = 'center');

    // Apply vertical offsets
    if (profileData.verticalOffsetsRatings) {
        Object.keys(profileData.verticalOffsetsRatings).forEach(key => {
            verticalOffsetsRatings[key] = profileData.verticalOffsetsRatings[key];
        });
    }
    if (profileData.verticalOffsetsCover) {
        Object.keys(profileData.verticalOffsetsCover).forEach(key => {
            verticalOffsetsCover[key] = profileData.verticalOffsetsCover[key];
        });
    }

    // Apply horizontal offsets
    if (profileData.horizontalOffsetsRatings) {
        Object.keys(profileData.horizontalOffsetsRatings).forEach(key => {
            horizontalOffsetsRatings[key] = profileData.horizontalOffsetsRatings[key];
        });
    }
    if (profileData.horizontalOffsetsCover) {
        Object.keys(profileData.horizontalOffsetsCover).forEach(key => {
            horizontalOffsetsCover[key] = profileData.horizontalOffsetsCover[key];
        });
    }

    // Apply image size multiplier
    if (profileData.imageSizeMultiplier !== undefined) {
        imageSizeMultiplier = profileData.imageSizeMultiplier;
        if (imageSizeMultiplierSlider) {
            imageSizeMultiplierSlider.value(imageSizeMultiplier);
            imageSizeMultiplierLabel.html(imageSizeMultiplier.toFixed(2) + 'x');
        }
    }

    // Apply max textbox widths
    if (profileData.maxTextboxWidths) {
        Object.keys(profileData.maxTextboxWidths).forEach(key => {
            maxTextboxWidths[key] = profileData.maxTextboxWidths[key];
        });
    }

    // Apply text size offsets
    if (profileData.textSizeOffsets) {
        Object.keys(profileData.textSizeOffsets).forEach(key => {
            textSizeOffsets[key] = profileData.textSizeOffsets[key];
        });
    }

    // Apply text leading offsets
    if (profileData.textLeadingOffsets) {
        Object.keys(profileData.textLeadingOffsets).forEach(key => {
            textLeadingOffsets[key] = profileData.textLeadingOffsets[key];
        });
    }

    // Apply text alignment settings
    if (profileData.textAlignRatings) {
        Object.keys(profileData.textAlignRatings).forEach(key => {
            textAlignRatings[key] = profileData.textAlignRatings[key];
        });
    }
    if (profileData.textAlignCover) {
        Object.keys(profileData.textAlignCover).forEach(key => {
            textAlignCover[key] = profileData.textAlignCover[key];
        });
    }

    // Update sliders if an item is selected
    if (selectedTextBox) {
        updateVerticalOffsetSlider();
        updateHorizontalOffsetSlider();
        updateMaxTextboxWidthSlider();
    }

    // Apply custom textboxes if any and if they aren't already applied
    if (profileData.customTextboxes) {
        for(let tbData of profileData.customTextboxes) {
            if (!customTextboxes.find(t => t.id === tbData.id)) {
                let newTextbox = addCustomTextbox(tbData);
            }
        }
    }

    // Update UI
    if (albumData) {
        currentView === 'ratings' ? printAlbum() : printCoverScreen();
    }
}

function saveNewProfile() {
    let name = profileNameInput.value().trim();
    if (!name) {
        showToast('Please enter a profile name', true);
        return;
    }
    if (name.toLowerCase() === 'default') {
        showToast('Cannot overwrite Default profile', true);
        return;
    }

    profiles[name] = getCurrentProfileData();
    saveProfiles();
    updateProfileSelect();
    profileSelect.selected(name);
    currentProfileName = name;
    saveLastProfile();
    profileNameInput.value('');
    showToast('Profile saved: ' + name);
}

function applySelectedProfile() {
    let selectedName = profileSelect.value();
    if (selectedName === 'Default') {
        applyProfile(getDefaultProfile());
    } else if (profiles[selectedName]) {
        applyProfile(profiles[selectedName]);
    }
    currentProfileName = selectedName;
    saveLastProfile();
    showToast('Profile applied: ' + selectedName);
    captureState();
}

function updateSelectedProfile() {
    let selectedName = profileSelect.value();
    if (selectedName === 'Default') {
        showToast('Cannot update Default profile', true);
        return;
    }
    if (!profiles[selectedName]) {
        showToast('Profile not found', true);
        return;
    }

    profiles[selectedName] = getCurrentProfileData();
    saveProfiles();
    showToast('Profile updated: ' + selectedName);
}

function deleteSelectedProfile() {
    let selectedName = profileSelect.value();
    if (selectedName === 'Default') {
        showToast('Cannot delete Default profile', true);
        return;
    }
    if (!profiles[selectedName]) {
        showToast('Profile not found', true);
        return;
    }

    delete profiles[selectedName];
    saveProfiles();
    updateProfileSelect();
    profileSelect.selected('Default');
    currentProfileName = 'Default';
    saveLastProfile();
    showToast('Profile deleted: ' + selectedName);
}

function updateProfileSelect() {
    profileSelect.html('');
    profileSelect.option('Default');
    Object.keys(profiles).sort().forEach(name => {
        profileSelect.option(name);
    });
}

function loadProfiles() {
    let savedProfiles = localStorage.getItem('albumGeneratorProfiles');
    if (savedProfiles) {
        try {
            profiles = JSON.parse(savedProfiles);
        } catch (err) {
            console.log("Error loading profiles");
            profiles = {};
        }
    }
}

function saveProfiles() {
    localStorage.setItem('albumGeneratorProfiles', JSON.stringify(profiles));
}

function loadLastProfile() {
    let lastProfile = localStorage.getItem('albumGeneratorLastProfile');
    if (lastProfile && (lastProfile === 'Default' || profiles[lastProfile])) {
        currentProfileName = lastProfile;
        profileSelect.selected(lastProfile);
        if (lastProfile === 'Default') {
            applyProfile(getDefaultProfile());
        } else {
            applyProfile(profiles[lastProfile]);
        }
    }
}

function saveLastProfile() {
    localStorage.setItem('albumGeneratorLastProfile', currentProfileName);
}

function createTracksCustomizationSection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let tracksSection = createDiv('').parent(parent).class('color-section');
    let tracksHeader = createDiv('').parent(tracksSection).class('color-section-header');
    let tracksToggle = createSpan('▶').parent(tracksHeader).class('color-toggle');
    createSpan(' Customize Tracks').parent(tracksHeader);

    let tracksContent = createDiv('').parent(tracksSection).class('color-content collapsed');

    tracksHeader.mousePressed(() => {
        if (tracksContent.hasClass('collapsed')) {
            tracksContent.removeClass('collapsed');
            tracksToggle.html('▼');
        } else {
            tracksContent.addClass('collapsed');
            tracksToggle.html('▶');
        }
    });

    // Text Size control
    let textSizeRow = createDiv('').parent(tracksContent).class('slider-row');
    createSpan('Text Size').parent(textSizeRow).class('slider-label');
    let textSizeContainer = createDiv('').parent(textSizeRow).class('slider-container');
    tracksTextSizeSlider = createSlider(30, 100, 60, 2).parent(textSizeContainer).class('form-slider');
    tracksTextSizeLabel = createSpan('60').parent(textSizeContainer).class('slider-value');

    tracksTextSizeSlider.input(() => {
        tracksTextSize = tracksTextSizeSlider.value();
        tracksTextSizeLabel.html(tracksTextSize);
        if (albumData && currentView === 'ratings') printAlbum();
    });
    tracksTextSizeSlider.changed(() => captureState());

    // Spacing control
    let spacingRow = createDiv('').parent(tracksContent).class('slider-row');
    createSpan('Spacing').parent(spacingRow).class('slider-label');
    let spacingContainer = createDiv('').parent(spacingRow).class('slider-container');
    tracksSpacingSlider = createSlider(-30, 50, 0, 1).parent(spacingContainer).class('form-slider');
    tracksSpacingLabel = createSpan('0').parent(spacingContainer).class('slider-value');

    tracksSpacingSlider.input(() => {
        tracksSpacing = tracksSpacingSlider.value();
        tracksSpacingLabel.html(tracksSpacing);
        if (albumData && currentView === 'ratings') printAlbum();
    });
    tracksSpacingSlider.changed(() => captureState());

    // Rectangle Height control
    let rectHeightRow = createDiv('').parent(tracksContent).class('slider-row');
    createSpan('Rect Height').parent(rectHeightRow).class('slider-label');
    let rectHeightContainer = createDiv('').parent(rectHeightRow).class('slider-container');
    tracksRectHeightSlider = createSlider(20, 80, 40, 2).parent(rectHeightContainer).class('form-slider');
    tracksRectHeightLabel = createSpan('40').parent(rectHeightContainer).class('slider-value');

    tracksRectHeightSlider.input(() => {
        tracksRectHeight = tracksRectHeightSlider.value();
        tracksRectHeightLabel.html(tracksRectHeight);
        if (albumData && currentView === 'ratings') printAlbum();
    });
    tracksRectHeightSlider.changed(() => captureState());

    // Reset button
    createButton('Reset to Default').parent(tracksContent).class('btn btn-secondary').style('margin-top', '12px').mousePressed(() => {
        tracksTextSize = 60;
        tracksSpacing = 0;
        tracksRectHeight = 40;
        tracksTextSizeSlider.value(60);
        tracksSpacingSlider.value(0);
        tracksRectHeightSlider.value(40);
        tracksTextSizeLabel.html('60');
        tracksSpacingLabel.html('0');
        tracksRectHeightLabel.html('40');
        if (albumData && currentView === 'ratings') printAlbum();
        captureState();
    });
}

function createColorSection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let colorSection = createDiv('').parent(parent).class('color-section');
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

function createAdvancedOptionsSection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let advancedSection = createDiv('').parent(parent).class('color-section');
    let advancedHeader = createDiv('').parent(advancedSection).class('color-section-header');
    let advancedToggle = createSpan('▶').parent(advancedHeader).class('color-toggle');
    createSpan(' Advanced Options').parent(advancedHeader);

    let advancedContent = createDiv('').parent(advancedSection).class('color-content collapsed');

    advancedHeader.mousePressed(() => {
        if (advancedContent.hasClass('collapsed')) {
            advancedContent.removeClass('collapsed');
            advancedToggle.html('▼');
        } else {
            advancedContent.addClass('collapsed');
            advancedToggle.html('▶');
        }
    });

    // Vertical Offset slider
    let vertOffsetRow = createDiv('').parent(advancedContent).class('slider-row');
    createSpan('Vertical Offset').parent(vertOffsetRow).class('slider-label');
    let vertOffsetContainer = createDiv('').parent(vertOffsetRow).class('slider-container');
    verticalOffsetSlider = createSlider(-900, 900, 0, 1).parent(vertOffsetContainer).class('form-slider');
    verticalOffsetLabel = createSpan('0').parent(vertOffsetContainer).class('slider-value');

    // Initially disable
    verticalOffsetSlider.attribute('disabled', '');
    verticalOffsetSlider.addClass('disabled');

    let vertSliderTimeout = null;
    verticalOffsetSlider.input(() => {
        if (!selectedTextBox || selectedTextBox.isCustom) return;
        let value = verticalOffsetSlider.value();
        verticalOffsetLabel.html(value);

        if (currentView === 'ratings') {
            verticalOffsetsRatings[selectedTextBox.id] = value;
        } else {
            verticalOffsetsCover[selectedTextBox.id] = value;
        }

        updatePositionControls();

        if (albumData) {
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }

        if (vertSliderTimeout) clearTimeout(vertSliderTimeout);
        vertSliderTimeout = setTimeout(() => captureState(), 500);
    });

    // Horizontal Offset slider
    let horizOffsetRow = createDiv('').parent(advancedContent).class('slider-row');
    createSpan('Horizontal Offset').parent(horizOffsetRow).class('slider-label');
    let horizOffsetContainer = createDiv('').parent(horizOffsetRow).class('slider-container');
    horizontalOffsetSlider = createSlider(-600, 600, 0, 1).parent(horizOffsetContainer).class('form-slider');
    horizontalOffsetLabel = createSpan('0').parent(horizOffsetContainer).class('slider-value');

    // Initially disable
    horizontalOffsetSlider.attribute('disabled', '');
    horizontalOffsetSlider.addClass('disabled');

    horizontalOffsetSlider.input(() => {
        if (!selectedTextBox || selectedTextBox.isCustom) return;
        let value = horizontalOffsetSlider.value();
        horizontalOffsetLabel.html(value);

        if (currentView === 'ratings') {
            horizontalOffsetsRatings[selectedTextBox.id] = value;
        } else {
            horizontalOffsetsCover[selectedTextBox.id] = value;
        }

        updatePositionControls();

        if (albumData) {
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }
    });
    horizontalOffsetSlider.changed(() => captureState());

    // Image Size Multiplier slider
    let imageSizeRow = createDiv('').parent(advancedContent).class('slider-row');
    createSpan('Image Size').parent(imageSizeRow).class('slider-label');
    let imageSizeContainer = createDiv('').parent(imageSizeRow).class('slider-container');
    imageSizeMultiplierSlider = createSlider(0.5, 2, 1, 0.05).parent(imageSizeContainer).class('form-slider');
    imageSizeMultiplierLabel = createSpan('1.0x').parent(imageSizeContainer).class('slider-value');

    imageSizeMultiplierSlider.input(() => {
        imageSizeMultiplier = imageSizeMultiplierSlider.value();
        imageSizeMultiplierLabel.html(imageSizeMultiplier.toFixed(2) + 'x');

        if (albumData) {
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }
    });
    imageSizeMultiplierSlider.changed(() => {
        captureState()
        alignMainElementsToImage();
    });

    // Max Textbox Width slider
    let maxWidthRow = createDiv('').parent(advancedContent).class('slider-row');
    createSpan('Max Text Width').parent(maxWidthRow).class('slider-label');
    let maxWidthContainer = createDiv('').parent(maxWidthRow).class('slider-container');
    maxTextboxWidthSlider = createSlider(100, 1000, 500, 10).parent(maxWidthContainer).class('form-slider');
    maxTextboxWidthLabel = createSpan('500').parent(maxWidthContainer).class('slider-value');

    // Initially disable
    maxTextboxWidthSlider.attribute('disabled', '');
    maxTextboxWidthSlider.addClass('disabled');

    maxTextboxWidthSlider.input(() => {
        if (!selectedTextBox || selectedTextBox.id === 'tracks' || selectedTextBox.id === 'image') return;
        let value = maxTextboxWidthSlider.value();
        maxTextboxWidthLabel.html(value);
        maxTextboxWidths[selectedTextBox.id] = value;

        if (albumData) {
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }
    });
    maxTextboxWidthSlider.changed(() => captureState());

    // Grade Legend checkbox (moved here)
    let legendCheckboxRow = createDiv('').parent(advancedContent).style('margin-top: 12px;');
    gradeLegendCheckbox = createCheckbox('Show Grade Legend', true).parent(legendCheckboxRow).class('checkbox-input');
    gradeLegendCheckbox.changed(() => {
        showGradeLegend = gradeLegendCheckbox.checked();
        autoGeneratePreview();
        captureState();
    });

    let automaticAlignmentCheckboxRow = createDiv('').parent(advancedContent).style('margin-top: 12px;');
    automaticAlignmentCheckbox = createCheckbox('Auto-Align Main Text to Image', true).parent(automaticAlignmentCheckboxRow).class('checkbox-input');
        automaticAlignmentCheckbox.changed(() => {
        if(automaticAlignmentCheckbox.checked()){
            alignMainElementsToImage();
        }    
    });

    // Reset button
    createButton('Reset Advanced Options').parent(advancedContent).class('btn btn-secondary').style('margin-top', '12px').mousePressed(() => {
        imageSizeMultiplier = 1.0;
        imageSizeMultiplierSlider.value(1.0);
        imageSizeMultiplierLabel.html('1.0x');

        automaticAlignmentCheckbox.checked(true);

        // Reset horizontal offsets
        Object.keys(horizontalOffsetsRatings).forEach(k => horizontalOffsetsRatings[k] = 0);
        Object.keys(horizontalOffsetsCover).forEach(k => horizontalOffsetsCover[k] = 0);

        // Reset max textbox widths
        Object.keys(defaultMaxTextboxWidths).forEach(k => maxTextboxWidths[k] = defaultMaxTextboxWidths[k]);

        updateHorizontalOffsetSlider();
        updateMaxTextboxWidthSlider();

        if (albumData) {
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }
        captureState();
    });
}

function addCustomTextbox(tbData) {
    let id = 'custom_' + Date.now();
    let textbox = {
        id: tbData.id || id,
        text: tbData.text || '',
        x: tbData.x || 100,
        y: tbData.y || 100,
        fontSize: tbData.fontSize || 40,
        fontType: tbData.fontType || 'fontHeavy',
        color: tbData.color || '#ffffff',
        viewType: tbData.viewType || currentView,
        textAlign: tbData.textAlign || (currentView === 'cover' ? 'center' : 'left'),
        leading: tbData.leading || 0, // Additional spacing added to default line height
        maxWidth: tbData.maxWidth || width - 100 // Maximum width before text wraps
    };

    customTextboxes.push(textbox);
    addCustomTextboxUI(textbox);
    captureState();
    autoGeneratePreview();

    return textbox
}

function addCustomTextboxUI(textbox) {
    // Create a simple form group like the other inputs
    let group = createDiv('').parent(customTextboxContainer).class('form-group');
    textbox.rowDiv = group;

    // Label
    createElement('label', 'Custom Text').parent(group);

    // Row with textarea and remove button
    let inputRow = createDiv('').parent(group).style('display: flex; gap: 8px; align-items: flex-start;');

    // Text input (like fun fact textarea)
    let textarea = createElement('textarea').parent(inputRow).class('form-textarea');
    textarea.attribute('placeholder', 'Enter text... (click on canvas to edit)');
    textarea.style('min-height: 60px; flex: 1; margin-bottom: 0;');
    textbox.textInput = textarea;
    textarea.elt.value = textbox.text || '';
    textarea.elt.addEventListener('input', () => {
        textbox.text = textarea.elt.value;
        autoGeneratePreview();
    });
    textarea.elt.addEventListener('blur', captureState);

    // Remove button
    let removeBtn = createButton('×').parent(inputRow).class('track-remove-btn').style('width: 32px; height: 32px; font-size: 18px; flex-shrink: 0;');
    removeBtn.mousePressed(() => {
        let index = customTextboxes.findIndex(t => t.id === textbox.id);
        if (index !== -1) {
            // Deselect if this textbox is selected
            if (selectedTextBox && selectedTextBox.id === textbox.id) {
                selectedTextBox = null;
                sizeAdjustPanel.style('display', 'none');
            }
            customTextboxes.splice(index, 1);
            group.remove();
            captureState();
            autoGeneratePreview();
        }
    });
}

function updateHorizontalOffsetSlider() {
    if (!horizontalOffsetSlider) return;

    // Disable for custom textboxes (they use drag instead)
    if (selectedTextBox && !selectedTextBox.isCustom) {
        horizontalOffsetSlider.removeAttribute('disabled');
        horizontalOffsetSlider.removeClass('disabled');

        let offset;
        if (currentView === 'ratings') {
            offset = horizontalOffsetsRatings[selectedTextBox.id] || 0;
        } else {
            offset = horizontalOffsetsCover[selectedTextBox.id] || 0;
        }

        horizontalOffsetSlider.value(offset);
        horizontalOffsetLabel.html(offset);
    } else {
        horizontalOffsetSlider.attribute('disabled', '');
        horizontalOffsetSlider.addClass('disabled');
        horizontalOffsetSlider.value(0);
        horizontalOffsetLabel.html(selectedTextBox && selectedTextBox.isCustom ? 'Drag' : '0');
    }
}

function updateMaxTextboxWidthSlider() {
    if (!maxTextboxWidthSlider) return;

    // Disable for custom textboxes (they have their own control) and tracks/image
    if (selectedTextBox && !selectedTextBox.isCustom && selectedTextBox.id !== 'tracks' && selectedTextBox.id !== 'image') {
        maxTextboxWidthSlider.removeAttribute('disabled');
        maxTextboxWidthSlider.removeClass('disabled');

        let width = maxTextboxWidths[selectedTextBox.id] || defaultMaxTextboxWidths[selectedTextBox.id] || 500;
        maxTextboxWidthSlider.value(width);
        maxTextboxWidthLabel.html(width);
    } else {
        maxTextboxWidthSlider.attribute('disabled', '');
        maxTextboxWidthSlider.addClass('disabled');
        maxTextboxWidthSlider.value(500);
        maxTextboxWidthLabel.html('N/A');
    }
}

function createSizeAdjustPanel() {
    sizeAdjustPanel = createDiv('').id('size-adjust-panel');

    // Text Size controls (for predefined textboxes)
    let sizeContainer = createDiv('').parent(sizeAdjustPanel).id('size-container');
    createSpan('Text Size:').parent(sizeContainer).class('label');
    createButton('−').parent(sizeContainer).class('btn-control').mousePressed(() => adjustTextSize(-2));
    createSpan('0').parent(sizeContainer).id('size-display').class('display');
    createButton('+').parent(sizeContainer).class('btn-control').mousePressed(() => adjustTextSize(2));

    // Leading controls (for predefined textboxes with leading)
    let leadingContainer = createDiv('').parent(sizeAdjustPanel).id('leading-container');
    createSpan('Leading:').parent(leadingContainer).class('label');
    createButton('−').parent(leadingContainer).class('btn-control').mousePressed(() => adjustTextLeading(-2));
    createSpan('0').parent(leadingContainer).id('leading-display').class('display');
    createButton('+').parent(leadingContainer).class('btn-control').mousePressed(() => adjustTextLeading(2));

    // Custom textbox controls container
    let customContainer = createDiv('').parent(sizeAdjustPanel).id('custom-textbox-controls');
    customContainer.style('display', 'none');
    customContainer.style('gap', '10px');
    customContainer.style('align-items', 'center');

    // Font Size slider for custom textboxes
    createSpan('Size:').parent(customContainer).class('label');
    let customFontSizeSlider = createSlider(10, 150, 40, 2).parent(customContainer).id('custom-font-size-slider').class('form-slider').style('width', '80px');
    createSpan('40').parent(customContainer).id('custom-font-size-display').class('display');

    customFontSizeSlider.input(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            textbox.fontSize = customFontSizeSlider.value();
            select('#custom-font-size-display').html(textbox.fontSize);
            autoGeneratePreview();
        }
    });
    customFontSizeSlider.changed(() => captureState());

    // Leading slider for custom textboxes
    createSpan('Lead:').parent(customContainer).class('label');
    let customLeadingSlider = createSlider(-30, 50, 0, 1).parent(customContainer).id('custom-leading-slider').class('form-slider').style('width', '60px');
    createSpan('0').parent(customContainer).id('custom-leading-display').class('display');

    customLeadingSlider.input(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            textbox.leading = customLeadingSlider.value();
            select('#custom-leading-display').html(textbox.leading);
            autoGeneratePreview();
        }
    });
    customLeadingSlider.changed(() => captureState());

    // Font type select for custom textboxes
    let customFontSelect = createSelect().parent(customContainer).id('custom-font-select').class('form-select').style('width', '100px');
    ['fontHeavy', 'fontLight', 'fontRegular', 'fontRegularCondensed', 'fontRegularItalic', 'fontRegularCrammed'].forEach(f => customFontSelect.option(f));
    customFontSelect.changed(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            textbox.fontType = customFontSelect.value();
            autoGeneratePreview();
            captureState();
        }
    });

    // Color picker for custom textboxes
    let customColorPicker = createColorPicker('#ffffff').parent(customContainer).id('custom-color-picker').class('color-picker');
    customColorPicker.input(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            textbox.color = customColorPicker.value();
            autoGeneratePreview();
        }
    });
    customColorPicker.changed(() => captureState());

    // Max width slider for custom textboxes
    createSpan('Width:').parent(customContainer).class('label');
    let customMaxWidthSlider = createSlider(100, 1000, 500, 10).parent(customContainer).id('custom-max-width-slider').class('form-slider').style('width', '80px');
    createSpan('500').parent(customContainer).id('custom-max-width-display').class('display');

    customMaxWidthSlider.input(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            textbox.maxWidth = customMaxWidthSlider.value();
            select('#custom-max-width-display').html(textbox.maxWidth);
            autoGeneratePreview();
        }
    });
    customMaxWidthSlider.changed(() => captureState());

    // Alignment selector (shared for all textboxes)
    let alignContainer = createDiv('').parent(sizeAdjustPanel).id('align-container').style('display', 'flex').style('align-items', 'center').style('gap', '4px');
    createSpan('Align:').parent(alignContainer).class('label');
    let alignSelect = createSelect().parent(alignContainer).id('align-select').class('form-select').style('width', '75px');
    alignSelect.option('left');
    alignSelect.option('center');
    alignSelect.option('right');
    alignSelect.changed(() => {
        if (!selectedTextBox) return;
        let align = alignSelect.value();
        if (selectedTextBox.isCustom) {
            let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
            if (textbox) { textbox.textAlign = align; autoGeneratePreview(); captureState(); }
        } else {
            if (currentView === 'ratings') textAlignRatings[selectedTextBox.id] = align;
            else textAlignCover[selectedTextBox.id] = align;
            autoGeneratePreview(); captureState();
        }
    });

    createButton('↻').parent(sizeAdjustPanel).class('btn-control btn-reset').mousePressed(resetTextBoxToDefault);
    createButton('✕').parent(sizeAdjustPanel).class('btn-control btn-close').mousePressed(() => {
        selectedTextBox = null;
        sizeAdjustPanel.style('display', 'none');
        updateVerticalOffsetSlider();
        currentView === 'ratings' ? printAlbum() : printCoverScreen();
    });
}

function clearAll() {
    [titleInput, artistInput, yearInput, genreInput, funfactInput, imageUrlInput].forEach(inp => inp.value(''));
    albumGradeSelect.selected('GOAT');
    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }
    addTrackRow();
    customTextboxes = [];
    if (customTextboxContainer) customTextboxContainer.html('');
    albumData = null;
    cachedImageUrl = cachedOriginalImage = cachedFilteredImage = null;
    lastUrlChecked = null;
    selectedTextBox = null;
    if (sizeAdjustPanel) sizeAdjustPanel.style('display', 'none');
    updateVerticalOffsetSlider();
    background(200);
    localStorage.removeItem('albumGeneratorData');
}

function toggleView() {
    currentView = currentView === 'ratings' ? 'cover' : 'ratings';
    viewToggleBtn.html(currentView === 'ratings' ? 'View Ratings' : 'View Cover');
    // Deselect textbox when switching views
    selectedTextBox = null;
    if (sizeAdjustPanel) sizeAdjustPanel.style('display', 'none');
    updateVerticalOffsetSlider();
    if (albumData) currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

async function downloadBothImages() {
    let tracksData = collectTracksData();
    albumData = collectAlbumData(tracksData);
    if (!albumData.imageUrl) return;

    let baseFileName = getBaseFileName();

    // Download ratings screen with aspect ratio crop
    showGreenRectangle = false; // Hide green rectangle for download
    await printAlbum();
    let exportHeight = aspectRatioOptions[currentAspectRatio].height;

    // Create a temporary canvas for the cropped version
    let tempCanvas = createGraphics(WIDTH, exportHeight);
    tempCanvas.image(get(0, 0, WIDTH, exportHeight), 0, 0);

    // Get the data URL and download it manually with the correct extension
    let dataURL = tempCanvas.canvas.toDataURL('image/' + (currentImageFormat === 'jpg' ? 'jpeg' : currentImageFormat));
    let link = document.createElement('a');
    link.download = baseFileName + ' - Ratings.' + currentImageFormat;
    link.href = dataURL;
    link.click();

    tempCanvas.remove(); // Clean up
    showGreenRectangle = true; // Show it again

    await new Promise(resolve => setTimeout(resolve, 100));

    // Download cover screen (full size)
    await printCoverScreen();
    saveCanvas(baseFileName + ' - Cover', currentImageFormat);

    // Restore the view
    await printAlbum();
}

function makeNumberEditable(trackNumSpan, trackIndex) {
    trackNumSpan.elt.addEventListener('dblclick', () => {
        let currentText = trackNumSpan.html();
        let input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'track-number-input';

        trackNumSpan.elt.replaceWith(input);
        input.focus();
        input.select();

        let finishEdit = () => {
            let newValue = input.value.trim() || ((trackIndex + 1) + '.');
            trackNumSpan.html(newValue);
            input.replaceWith(trackNumSpan.elt);
            let track = tracks.find(t => t.numSpan === trackNumSpan);
            if (track) track.customNumber = newValue;
            autoGeneratePreview();
            captureState();
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); finishEdit(); }
            else if (e.key === 'Escape') { e.preventDefault(); let track = tracks.find(t => t.numSpan === trackNumSpan); trackNumSpan.html(track && track.customNumber ? track.customNumber : (trackIndex + 1) + '.'); input.replaceWith(trackNumSpan.elt); }
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

    // Make row draggable
    rowDiv.attribute('draggable', 'true');
    setupTrackDragAndDrop(rowDiv);

    // Add drag handle
    let dragHandle = createSpan('⋮⋮').parent(rowDiv).class('track-drag-handle');

    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).class('track-number');

    makeNumberEditable(trackNumSpan, trackIndex);

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');
    titleIn.elt.addEventListener('input', autoGeneratePreview);
    titleIn.elt.addEventListener('blur', captureState);
    titleIn.elt.addEventListener('keydown', (e) => handleTrackNavigation(e, titleIn));

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    gradeOptions.forEach(grade => gradeSelect.option(grade));
    gradeSelect.selected('STRONG');
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
    removeBtn.mousePressed(() => {
        let currentIndex = tracks.findIndex(t => t.rowDiv === rowDiv);
        if (currentIndex !== -1) removeTrackRow(currentIndex);
    });

    tracks.push({ titleInput: titleIn, gradeSelect, rowDiv, numSpan: trackNumSpan, customNumber: null, customText: null, textInput, textInputContainer, dragHandle });

    if (shouldCapture && historyStack.length > 0) captureState();
}

let draggedTrackIndex = null;

function setupTrackDragAndDrop(rowDiv) {
    rowDiv.elt.addEventListener('dragstart', (e) => {
        draggedTrackIndex = tracks.findIndex(t => t.rowDiv === rowDiv);
        e.dataTransfer.effectAllowed = 'move';
        rowDiv.addClass('dragging');
    });

    rowDiv.elt.addEventListener('dragend', (e) => {
        rowDiv.removeClass('dragging');
        draggedTrackIndex = null;
        // Remove all drag-over classes
        tracks.forEach(t => t.rowDiv.removeClass('drag-over'));
    });

    rowDiv.elt.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedTrackIndex !== null) {
            let targetIndex = tracks.findIndex(t => t.rowDiv === rowDiv);
            if (targetIndex !== draggedTrackIndex) {
                rowDiv.addClass('drag-over');
            }
        }
    });

    rowDiv.elt.addEventListener('dragleave', (e) => {
        rowDiv.removeClass('drag-over');
    });

    rowDiv.elt.addEventListener('drop', (e) => {
        e.preventDefault();
        rowDiv.removeClass('drag-over');

        if (draggedTrackIndex !== null) {
            let targetIndex = tracks.findIndex(t => t.rowDiv === rowDiv);

            if (targetIndex !== draggedTrackIndex && targetIndex !== -1) {
                // Reorder tracks array
                let draggedTrack = tracks[draggedTrackIndex];
                tracks.splice(draggedTrackIndex, 1);
                tracks.splice(targetIndex, 0, draggedTrack);

                // Reorder DOM elements
                if (targetIndex === 0) {
                    trackContainer.elt.insertBefore(draggedTrack.rowDiv.elt, trackContainer.elt.firstChild);
                } else if (targetIndex >= tracks.length - 1) {
                    trackContainer.elt.appendChild(draggedTrack.rowDiv.elt);
                } else {
                    trackContainer.elt.insertBefore(draggedTrack.rowDiv.elt, tracks[targetIndex + 1].rowDiv.elt);
                }

                // Update track numbers
                updateTrackNumbers();
                autoGeneratePreview();
                captureState();
            }
        }
    });
}

function updateTrackNumbers() {
    tracks.forEach((t, i) => {
        if (!t.customNumber) {
            t.numSpan.html((i + 1) + '.');
        }
    });
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
    updateTrackNumbers();
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
            albumGrade: albumGradeSelect.value(),
            customTextboxes: customTextboxes.map(t => ({
                id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
                fontType: t.fontType, color: t.color, viewType: t.viewType,
                textAlign: t.textAlign || 'left', leading: t.leading || 0, maxWidth: t.maxWidth || width - 100
            }))
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
    albumGradeSelect.selected(data.albumGrade || 'STRONG');

    if (data.aspectRatio && aspectRatioOptions[data.aspectRatio]) {
        currentAspectRatio = data.aspectRatio;
        aspectRatioSelect.selected(data.aspectRatio);
    }

    if (data.imageFormat) {
        currentImageFormat = data.imageFormat;
        imageFormatSelect.selected(data.imageFormat);
    }

    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }

    if (data.tracks && data.tracks.length > 0) {
        data.tracks.forEach(track => {
            addTrackRow();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'STRONG');
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber);
            }
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.style('display', 'block');
            }
        });
    } else addTrackRow();

    // Load custom textboxes
    customTextboxes = [];
    if (customTextboxContainer) customTextboxContainer.html('');
    if (data.customTextboxes && data.customTextboxes.length > 0) {
        data.customTextboxes.forEach(textboxData => {
            let textbox = {
                id: textboxData.id,
                text: textboxData.text || '',
                x: textboxData.x || 100,
                y: textboxData.y || 100,
                fontSize: textboxData.fontSize || 40,
                fontType: textboxData.fontType || 'fontHeavy',
                color: textboxData.color || '#ffffff',
                viewType: textboxData.viewType || 'both',
                textAlign: textboxData.textAlign || 'left',
                leading: textboxData.leading || 0,
                maxWidth: textboxData.maxWidth || width - 100
            };
            customTextboxes.push(textbox);
            addCustomTextboxUI(textbox);
        });
    }

    // Load all offsets and advanced options - clear first, then load
    // Clear existing offsets
    Object.keys(verticalOffsetsRatings).forEach(k => delete verticalOffsetsRatings[k]);
    Object.keys(verticalOffsetsCover).forEach(k => delete verticalOffsetsCover[k]);
    Object.keys(horizontalOffsetsRatings).forEach(k => delete horizontalOffsetsRatings[k]);
    Object.keys(horizontalOffsetsCover).forEach(k => delete horizontalOffsetsCover[k]);
    Object.keys(textSizeOffsets).forEach(k => textSizeOffsets[k] = 0);
    Object.keys(textLeadingOffsets).forEach(k => textLeadingOffsets[k] = 0);
    Object.keys(maxTextboxWidths).forEach(k => maxTextboxWidths[k] = defaultMaxTextboxWidths[k] || 500);
    Object.keys(textAlignRatings).forEach(k => textAlignRatings[k] = 'left');
    Object.keys(textAlignCover).forEach(k => textAlignCover[k] = 'center');

    // Load saved offsets
    if (data.verticalOffsetsRatings) {
        Object.keys(data.verticalOffsetsRatings).forEach(key => {
            verticalOffsetsRatings[key] = data.verticalOffsetsRatings[key];
        });
    }
    if (data.verticalOffsetsCover) {
        Object.keys(data.verticalOffsetsCover).forEach(key => {
            verticalOffsetsCover[key] = data.verticalOffsetsCover[key];
        });
    }
    if (data.horizontalOffsetsRatings) {
        Object.keys(data.horizontalOffsetsRatings).forEach(key => {
            horizontalOffsetsRatings[key] = data.horizontalOffsetsRatings[key];
        });
    }
    if (data.horizontalOffsetsCover) {
        Object.keys(data.horizontalOffsetsCover).forEach(key => {
            horizontalOffsetsCover[key] = data.horizontalOffsetsCover[key];
        });
    }
    if (data.imageSizeMultiplier !== undefined) {
        imageSizeMultiplier = data.imageSizeMultiplier;
        if (imageSizeMultiplierSlider) {
            imageSizeMultiplierSlider.value(imageSizeMultiplier);
            imageSizeMultiplierLabel.html(imageSizeMultiplier.toFixed(2) + 'x');
        }
    }
    if (data.maxTextboxWidths) {
        Object.keys(data.maxTextboxWidths).forEach(key => {
            maxTextboxWidths[key] = data.maxTextboxWidths[key];
        });
    }
    if (data.textSizeOffsets) {
        Object.keys(data.textSizeOffsets).forEach(key => {
            textSizeOffsets[key] = data.textSizeOffsets[key];
        });
    }
    if (data.textLeadingOffsets) {
        Object.keys(data.textLeadingOffsets).forEach(key => {
            textLeadingOffsets[key] = data.textLeadingOffsets[key];
        });
    }
    if (data.textAlignRatings) {
        Object.keys(data.textAlignRatings).forEach(key => { textAlignRatings[key] = data.textAlignRatings[key]; });
    }
    if (data.textAlignCover) {
        Object.keys(data.textAlignCover).forEach(key => { textAlignCover[key] = data.textAlignCover[key]; });
    }
    if (data.showGradeLegend !== undefined) {
        showGradeLegend = data.showGradeLegend;
        if (gradeLegendCheckbox) gradeLegendCheckbox.checked(showGradeLegend);
    }
    if (data.tracksTextSize !== undefined) {
        tracksTextSize = data.tracksTextSize;
        if (tracksTextSizeSlider) {
            tracksTextSizeSlider.value(tracksTextSize);
            tracksTextSizeLabel.html(tracksTextSize);
        }
    }
    if (data.tracksSpacing !== undefined) {
        tracksSpacing = data.tracksSpacing;
        if (tracksSpacingSlider) {
            tracksSpacingSlider.value(tracksSpacing);
            tracksSpacingLabel.html(tracksSpacing);
        }
    }
    if (data.tracksRectHeight !== undefined) {
        tracksRectHeight = data.tracksRectHeight;
        if (tracksRectHeightSlider) {
            tracksRectHeightSlider.value(tracksRectHeight);
            tracksRectHeightLabel.html(tracksRectHeight);
        }
    }
}

function saveToLocalStorage() {
    let data = collectAlbumData(tracks.map(t => ({
        title: t.titleInput.value(),
        grade: t.gradeSelect.value(),
        customNumber: t.customNumber || null,
        customText: t.textInput ? t.textInput.value() : null
    })));
    data.aspectRatio = currentAspectRatio;
    data.imageFormat = currentImageFormat;
    data.showGradeLegend = showGradeLegend;
    data.customTextboxes = customTextboxes.map(t => ({
        id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
        fontType: t.fontType, color: t.color, viewType: t.viewType,
        textAlign: t.textAlign || 'left', leading: t.leading || 0, maxWidth: t.maxWidth || 500
    }));
    // Save all offsets and advanced options
    data.verticalOffsetsRatings = {...verticalOffsetsRatings};
    data.verticalOffsetsCover = {...verticalOffsetsCover};
    data.horizontalOffsetsRatings = {...horizontalOffsetsRatings};
    data.horizontalOffsetsCover = {...horizontalOffsetsCover};
    data.imageSizeMultiplier = imageSizeMultiplier;
    data.maxTextboxWidths = {...maxTextboxWidths};
    data.textSizeOffsets = {...textSizeOffsets};
    data.textLeadingOffsets = {...textLeadingOffsets};
    data.tracksTextSize = tracksTextSize;
    data.tracksSpacing = tracksSpacing;
    data.tracksRectHeight = tracksRectHeight;
    data.textAlignRatings = {...textAlignRatings};
    data.textAlignCover = {...textAlignCover};
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
            lastUrlChecked = albumData.imageUrl; // Update on success
        }
        catch (err) {
            console.error('Failed to load image:', err);
            // Only show toast if this URL hasn't been checked before
            if (lastUrlChecked !== albumData.imageUrl) {
                showToast('Failed to load image. Check the URL.', true);
                lastUrlChecked = albumData.imageUrl;
            }
        }
    }

    if (hasImage) { imageMode(CENTER); image(imgBW, width * 0.5, height * 0.5, height, height); }
    else background(50);

    imageMode(CORNER); rectMode(CORNER);

    // Apply image offsets and size multiplier
    let imageVertOffset = verticalOffsetsRatings.image || 0;
    let imageHorizOffset = horizontalOffsetsRatings.image || 0;
    let imageX = width * 0.05 + imageHorizOffset;
    let imageY = y + imgOff + imageVertOffset;
    let imageSize = width * sizeSclMult * imageSizeMultiplier;

    utils.beginShadow("#000000", 50, 0, 0);
    if (hasImage) {
        rect(imageX+1, imageY+1, imageSize-2, imageSize-2);
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

    let titleOffset = verticalOffsetsRatings.title || 0;
    let titleHorizOffset = (horizontalOffsetsRatings.title || 0) + 0;
    let titleMaxWidth = maxTextboxWidths.title || defaultMaxTextboxWidths.title;
    drawTextWithBox('title', fontHeavy, getMaxTextSize(albumData.title, titleMaxWidth, 100) + textSizeOffsets.title,
                     albumData.title, leftMargin + titleHorizOffset, topMargin + y + titleOffset, titleMaxWidth, 70, textAlignRatings.title || 'left');

    let artistOffset = verticalOffsetsRatings.artist || 10;
    let artistHorizOffset = (horizontalOffsetsRatings.artist || 0) + width * .475;
    let artistMaxWidth = maxTextboxWidths.artist || defaultMaxTextboxWidths.artist;
    let bbox = drawTextWithBox('artist', fontRegularCondensed, 45 + textSizeOffsets.artist,
                                albumData.artist, leftMargin + artistHorizOffset, topMargin + y + 110 + artistOffset, artistMaxWidth, 50, textAlignRatings.artist || 'left');
    y += bbox.h;

    let yearOffset = verticalOffsetsRatings.year || 0;
    let yearHorizOffset = (horizontalOffsetsRatings.year || 0) + width * .475;
    let yearMaxWidth = maxTextboxWidths.year || defaultMaxTextboxWidths.year;
    let yearY = topMargin + y + 85 + 60 + yearOffset;
    textFont(fontLight); textLeading(60); textSize(38 + textSizeOffsets.year); fill(230);
    textAlign(getP5Align(textAlignRatings.year || 'left'), BASELINE);
    text("\n" + albumData.year + "\n", leftMargin + yearHorizOffset, topMargin + y + 85 + yearOffset, yearMaxWidth);
    addTextBox('year', getAlignedBounds(fontLight.textBounds(albumData.year, leftMargin + yearHorizOffset, yearY, yearMaxWidth), leftMargin + yearHorizOffset, textAlignRatings.year || 'left'), 38 + textSizeOffsets.year);

    let genreOffset = verticalOffsetsRatings.genre || 0;
    let genreHorizOffset = (horizontalOffsetsRatings.genre || 0) + width * .475;
    let genreMaxWidth = maxTextboxWidths.genre || defaultMaxTextboxWidths.genre;
    textSize(30 + textSizeOffsets.genre); textLeading(40);
    textAlign(getP5Align(textAlignRatings.genre || 'left'), BASELINE);
    let genreText = shortenText(albumData.genre, genreMaxWidth);
    let genreY = topMargin + y + 75 + (40 * 3) + genreOffset;
    text("\n\n\n" + genreText, leftMargin + genreHorizOffset, topMargin + y + 75 + genreOffset, genreMaxWidth);
    addTextBox('genre', getAlignedBounds(fontLight.textBounds(genreText, leftMargin + genreHorizOffset, genreY, genreMaxWidth), leftMargin + genreHorizOffset, textAlignRatings.genre || 'left'), 30 + textSizeOffsets.genre);

    let funfactOffset = verticalOffsetsRatings.funfact || 0;
    let funfactHorizOffset = (horizontalOffsetsRatings.funfact || 0) + width * .475;
    let funfactMaxWidth = maxTextboxWidths.funfact || defaultMaxTextboxWidths.funfact;
    let funfactSize = 30 + textSizeOffsets.funfact;
    let funfactLeading = 40 + textLeadingOffsets.funfact;
    let funfactStartY = topMargin + y + 120 + (40 * 4) + funfactOffset;
    textAlign(getP5Align(textAlignRatings.funfact || 'left'), BASELINE);
    textLeading(40); text("\n\n\n\n", leftMargin + funfactHorizOffset, topMargin + y + 120 + funfactOffset, funfactMaxWidth);
    textSize(funfactSize); textLeading(funfactLeading); text(albumData.funfact, leftMargin + funfactHorizOffset, funfactStartY, funfactMaxWidth);
    addTextBox('funfact', getAlignedBounds(fontLight.textBounds(albumData.funfact, leftMargin + funfactHorizOffset, funfactStartY, funfactMaxWidth), leftMargin + funfactHorizOffset, textAlignRatings.funfact || 'left'), funfactSize);
    utils.endShadow();

    // Draw tracks
    push()
    y = 820; let x = 275;
    let spacing = Math.min(map(albumData.tracks.length, 5, 20, 80, 45, true), 70) + tracksSpacing;
    textFont(fontRegular); textSize(tracksTextSize); textAlign(LEFT, BASELINE);
    rectMode(CENTER); let w = (leftMargin + x) * 0.75, h = tracksRectHeight;
    let tracksVertOffset = verticalOffsetsRatings.tracks || 0;
    let tracksHorizOffset = horizontalOffsetsRatings.tracks || 0;
    tracksHorizOffset += 10 //offset fix

    let tracksStartY = y + tracksVertOffset;
    let tracksMinX = leftMargin + tracksHorizOffset, tracksMaxX = leftMargin + x + 700 + tracksHorizOffset;
    let tracksMinY = tracksStartY - 50, tracksMaxY = tracksStartY;

    for(let i = 0; i < albumData.tracks.length; i++){
        let track = albumData.tracks[i];
        let trackY = tracksStartY;
        textSize(tracksTextSize); textFont(fontRegular);
        let textHeight = textAscent() + textDescent();
        let rectCenterOffset = textAscent() - textHeight / 2;

        let gradeColor = colorMap[track.grade] || "#888888";
        fill(gradeColor);
        if(track.grade == 'GOAT'){
            utils.beginLinearGradient(["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
                (leftMargin + x) * 0.5 + tracksHorizOffset - w * 0.5, trackY - rectCenterOffset, (leftMargin + x) * 0.5 + tracksHorizOffset + w * 0.5, trackY - rectCenterOffset, [0, .2, .38, .59, 1]);
        }
        noStroke();
        if(track.grade == 'GOAT') utils.beginShadow("#ffffff", 50, 0, 0);
        if(track.grade == 'PEAK') utils.beginShadow(colorMap[track.grade], 35, 0, 0);
        rect((leftMargin + x) * 0.5 + tracksHorizOffset, trackY - rectCenterOffset, w, h, 20);
        if(track.grade == 'GOAT' || track.grade == 'PEAK') utils.endShadow();

        if (track.customText && track.customText.trim() !== '') {
            push(); blendMode(BLEND); textAlign(CENTER, CENTER); fill(0, 160); textFont(fontRegularCondensed);
            let customTextSize = getMaxTextSize(track.customText, w - 40, 28);
            textSize(customTextSize); text(track.customText, (leftMargin + x) * 0.5 + tracksHorizOffset, trackY - rectCenterOffset);
            textSize(tracksTextSize); pop();
        }

        fill(255); textAlign(LEFT, BASELINE);
        let trackNumber = track.customNumber || ((i + 1) + '.');
        text(shortenText(trackNumber + " " + track.title + (track.playing ? " " + musicChar : ""), 700), leftMargin + x + tracksHorizOffset, trackY);
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

    // Get export dimensions based on aspect ratio
    let exportHeight = aspectRatioOptions[currentAspectRatio].height;

    // Album grade at bottom (positioned according to export height)
    let gradeRectHeight = 115;
    let gradeRectY = exportHeight - gradeRectHeight;

    // Draw grade legend above the big rectangle
    if (showGradeLegend) {
        push()
        let allLegendGrades = ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP'];
        let allLegendLabels = ['GOAT', '10', '9', '8', '7', '<7', '<5'];
        let maxIndex = 4; // Minimum: GOAT through DECENT
        for (let track of albumData.tracks) {
            let idx = allLegendGrades.indexOf(track.grade);
            if (idx > maxIndex) maxIndex = idx;
        }
        let legendGrades = allLegendGrades.slice(0, maxIndex + 1);
        let legendLabels = allLegendLabels.slice(0, maxIndex + 1);
        if (legendGrades.length > 6) legendLabels[0] = 'G';
        let nOfGrades = legendGrades.length
        let legendPadding = 15; // Padding between legend and big rectangle
        let legendRectHeight = tracksRectHeight;
        let legendY = imageY + imageSize + legendPadding * 1

        let leftMargin = imageX
        let totalWidth = imageSize
        let gapBetween = 12;
        let rectWidth = (totalWidth - (gapBetween * (nOfGrades - 1))) / nOfGrades;

        push();
        rectMode(CORNER);
        textAlign(CENTER, CENTER);
        textFont(fontRegularCondensed);

        for (let i = 0; i < legendGrades.length; i++) {
            let grade = legendGrades[i];
            let label = legendLabels[i];
            let x = leftMargin + i * (rectWidth + gapBetween);
            let y = legendY

            // Draw rectangle
            let gradeColor = colorMap[grade] || "#888888";
            fill(gradeColor);
            noStroke();

            if (grade == 'GOAT') {
                utils.beginLinearGradient(["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
                    x, y, x + rectWidth, y, [0, .2, .38, .59, 1]);
            }
            rect(x, y, rectWidth, legendRectHeight, 20);

            // Draw label
            fill(0, 180);
            stroke(0, 180)
            strokeWeight(.5)
            textSize(getMaxTextSize(label, rectWidth - 10, 26));
            text(label, x + rectWidth / 2, y + legendRectHeight / 2 + 2);
        }
        pop();
        pop()
    }

    // Only draw grade rectangle if grade is not "None"
    if (albumData.albumGrade !== 'None') {
        fill(colorMap[albumData.albumGrade] || "#888888");
        rectMode(CORNER); noStroke();
        if(albumData.albumGrade == 'GOAT'){
            utils.beginLinearGradient(["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"],
                0, gradeRectY, width, gradeRectY, [0, .2, .38, .59, 1]);
        }
        rect(0, gradeRectY, width, gradeRectHeight, 20, 20, 0, 0);

        push()
        textAlign(CENTER, CENTER); fill(255); textFont(fontHeavy); textSize(85);
        utils.beginShadow("#ffffffa3", 30, 0, 0);
        text(albumData.albumGrade, width * 0.5, gradeRectY + gradeRectHeight * 0.57);
        utils.endShadow();
        pop()
    }

    // Draw custom textboxes
    push();
    customTextboxes.forEach(textbox => {
        if (textbox.viewType === 'ratings' || textbox.viewType === 'both') {
            let fontObj;
            switch(textbox.fontType) {
                case 'fontHeavy': fontObj = fontHeavy; break;
                case 'fontLight': fontObj = fontLight; break;
                case 'fontRegular': fontObj = fontRegular; break;
                case 'fontRegularItalic': fontObj = fontRegularItalic; break;
                case 'fontRegularCrammed': fontObj = fontRegularCrammed; break;
                case 'fontRegularCondensed': fontObj = fontRegularCondensed; break;
                default: fontObj = fontHeavy;
            }

            let tbAlign = textbox.textAlign || 'left';
            textFont(fontObj);
            textSize(textbox.fontSize);
            fill(textbox.color);
            textAlign(getP5Align(tbAlign), TOP);

            // Apply leading (spacing) if set
            let baseLeading = textbox.fontSize * 1.25; // Default line height
            textLeading(baseLeading + (textbox.leading || 0));

            if (textbox.text) {
                utils.beginShadow("#000000", 20, 0, 0);
                text(textbox.text, textbox.x, textbox.y, textbox.maxWidth || 500);
                utils.endShadow();

                // Add to textBoxes for selection
                let bounds = fontObj.textBounds(textbox.text, textbox.x, textbox.y, textbox.maxWidth || 500);
                let alignedBounds = getAlignedBounds(bounds, textbox.x, tbAlign);
                textBoxes.push({
                    id: textbox.id,
                    x: alignedBounds.x,
                    y: alignedBounds.y,
                    w: Math.max(alignedBounds.w, 50),
                    h: Math.max(alignedBounds.h, 30),
                    sizeOffset: 0,
                    currentSize: textbox.fontSize,
                    isCustom: true
                });
            } else {
                // Empty textbox - show placeholder for dragging
                textBoxes.push({
                    id: textbox.id,
                    x: textbox.x,
                    y: textbox.y,
                    w: 100,
                    h: 40,
                    sizeOffset: 0,
                    currentSize: textbox.fontSize,
                    isCustom: true
                });
            }
        }
    });
    pop();

    // Draw green rectangle to visualize export area (only when not downloading)
    if (showGreenRectangle) {
        push();
        noFill();
        stroke(0, 255, 0);
        strokeWeight(4);
        rectMode(CORNER);
        rect(0, 0, WIDTH, exportHeight);
        pop();
    }

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

function getP5Align(align) {
    if (align === 'center') return CENTER;
    if (align === 'right') return RIGHT;
    return LEFT;
}

function getAlignedBounds(bounds, anchorX, align) {
    return bounds //it just works, trust me
}

function drawTextWithBox(id, font, size, textStr, x, y, maxWidth, leading, align = 'left') {
    size = max(10, size);
    textFont(font);
    textSize(size);
    fill(255);
    textLeading(leading);
    textAlign(getP5Align(align), BASELINE);
    text(textStr, x, y, maxWidth);
    let bbox = font.textBounds(textStr, x, y, maxWidth);
    addTextBox(id, getAlignedBounds(bbox, x, align), size);
    return bbox;
}

function addTextBox(id, bounds, size) {
    textBoxes.push({ id, x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h, sizeOffset: textSizeOffsets[id], currentSize: size });
}

async function printCoverScreen() {
    push()
    background(200);
    let selectedId = selectedTextBox ? selectedTextBox.id : null;
    textBoxes = [];

    let coverSize = width * 0.8, coverY = height * 0.46, hasImage = false, imgBW, img;

    if (albumData.imageUrl && albumData.imageUrl.trim() !== '') {
        try {
            let images = await loadAndCacheImages(albumData.imageUrl);
            img = images.original; imgBW = images.filtered; hasImage = true;
            lastUrlChecked = albumData.imageUrl; // Update on success
        } catch (err) {
            console.error('Failed to load image:', err);
            // Only show toast if this URL hasn't been checked before
            if (lastUrlChecked !== albumData.imageUrl) {
                showToast('Failed to load image. Check the URL.', true);
                lastUrlChecked = albumData.imageUrl;
            }
        }
    }

    if (hasImage) { imageMode(CENTER); image(imgBW, width * 0.5, height * 0.5, height, height); }
    else background(50);

    // utils.beginShadow("#000000", 30, 0, 0);
    // textAlign(CENTER, TOP); textFont(fontLight); textSize(55); fill(255);
    // text("Album Review", width * 0.5, 260);
    // utils.endShadow();

    imageMode(CENTER); rectMode(CENTER);
    utils.beginShadow("#000000", 80, 0, 0);
    if (hasImage) { rect(width * 0.5, coverY, coverSize, coverSize); image(img, width * 0.5, coverY, coverSize, coverSize); }
    else drawImagePlaceholder(width * 0.5, coverY, coverSize, coverSize, false);
    utils.endShadow();

    push()

    utils.beginShadow("#000000", 20, 0, 0);
    let titleVertOffset = verticalOffsetsCover.title || 0;
    let titleHorizOffset = horizontalOffsetsCover.title || 0;
    let titleY = coverY + coverSize * 0.5 + 60 + titleVertOffset;
    let titleAlignCover = textAlignCover.title || 'center';
    textFont(fontHeavy);
    textAlign(getP5Align(titleAlignCover), TOP);
    let titleSize = getMaxTextSize(albumData.title, width - 100, 100) + textSizeOffsets.title;
    titleSize = max(10, titleSize);
    textSize(titleSize); fill(255); text(albumData.title, width * 0.5 + titleHorizOffset, titleY);
    let titleBounds = fontHeavy.textBounds(albumData.title, width * 0.5 + titleHorizOffset, titleY, width - 100);
    addTextBox('title', getAlignedBounds(titleBounds, width * 0.5 + titleHorizOffset, titleAlignCover), titleSize);

    let artistVertOffset = verticalOffsetsCover.artist || 0;
    let artistHorizOffset = horizontalOffsetsCover.artist || 0;
    let artistY = coverY + coverSize * 0.5 + 60 + 130 + artistVertOffset;
    let artistAlignCover = textAlignCover.artist || 'center';
    textFont(fontRegularCondensed);
    textAlign(getP5Align(artistAlignCover), TOP);
    let artistSize = getMaxTextSize(albumData.artist, width - 100, 50) + textSizeOffsets.artist;
    textSize(artistSize); fill(230); text(albumData.artist, width * 0.5 + artistHorizOffset, artistY);
    let artistBounds = fontRegularCondensed.textBounds(albumData.artist, width * 0.5 + artistHorizOffset, artistY, width - 100);
    addTextBox('artist', getAlignedBounds(artistBounds, width * 0.5 + artistHorizOffset, artistAlignCover), artistSize);
    utils.endShadow();

    // Draw custom textboxes
    customTextboxes.forEach(textbox => {
        if (textbox.viewType === 'cover' || textbox.viewType === 'both') {
            let fontObj;
            switch(textbox.fontType) {
                case 'fontHeavy': fontObj = fontHeavy; break;
                case 'fontLight': fontObj = fontLight; break;
                case 'fontRegular': fontObj = fontRegular; break;
                case 'fontRegularItalic': fontObj = fontRegularItalic; break;
                case 'fontRegularCrammed': fontObj = fontRegularCrammed; break;
                case 'fontRegularCondensed': fontObj = fontRegularCondensed; break;
                default: fontObj = fontHeavy;
            }

            let tbAlign = textbox.textAlign || 'left';
            textFont(fontObj);
            textSize(textbox.fontSize);
            fill(textbox.color);
            textAlign(getP5Align(tbAlign), TOP);

            // Apply leading (spacing) if set
            let baseLeading = textbox.fontSize * 1.25; // Default line height
            textLeading(baseLeading + (textbox.leading || 0));

            if (textbox.text) {
                utils.beginShadow("#000000", 20, 0, 0);
                text(textbox.text, textbox.x, textbox.y, textbox.maxWidth || 500);
                utils.endShadow();

                // Add to textBoxes for selection
                let bounds = fontObj.textBounds(textbox.text, textbox.x, textbox.y, textbox.maxWidth || 500);
                let alignedBounds = getAlignedBounds(bounds, textbox.x, tbAlign);
                textBoxes.push({
                    id: textbox.id,
                    x: alignedBounds.x,
                    y: alignedBounds.y,
                    w: Math.max(alignedBounds.w, 50),
                    h: Math.max(alignedBounds.h, 30),
                    sizeOffset: 0,
                    currentSize: textbox.fontSize,
                    isCustom: true
                });
            } else {
                // Empty textbox - show placeholder for dragging
                textBoxes.push({
                    id: textbox.id,
                    x: textbox.x,
                    y: textbox.y,
                    w: 100,
                    h: 40,
                    sizeOffset: 0,
                    currentSize: textbox.fontSize,
                    isCustom: true
                });
            }
        }
    });

    if (selectedId) selectedTextBox = textBoxes.find(b => b.id === selectedId);
    if (selectedTextBox) {
        noFill(); 
        stroke(255); 
        strokeWeight(3); 
        rectMode(CORNER);
        let padding = 5;
        rect(selectedTextBox.x - padding, selectedTextBox.y - padding, selectedTextBox.w + padding * 2, selectedTextBox.h + padding * 2, 5);
        noStroke();
    }
    pop()
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
    //if(frameCount % 60 === 0) autoGeneratePreview();
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

        // Enable dragging for all textboxes
        isDraggingTextbox = true;
        draggedTextbox = clickedBox;
        dragStartX = scaledMouseX;
        dragStartY = scaledMouseY;
        shiftDragAxis = null; // Reset axis constraint

        // Store starting positions/offsets
        if (clickedBox.isCustom) {
            let textbox = customTextboxes.find(t => t.id === clickedBox.id);
            if (textbox) {
                dragStartOffsetX = textbox.x;
                dragStartOffsetY = textbox.y;
            }
        } else {
            if (currentView === 'ratings') {
                dragStartOffsetX = horizontalOffsetsRatings[clickedBox.id] || 0;
                dragStartOffsetY = verticalOffsetsRatings[clickedBox.id] || 0;
            } else {
                dragStartOffsetX = horizontalOffsetsCover[clickedBox.id] || 0;
                dragStartOffsetY = verticalOffsetsCover[clickedBox.id] || 0;
            }
        }

        // Show size adjust panel for text boxes (not for tracks or image)
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

function mouseDragged() {
    if (isDraggingTextbox && draggedTextbox) {
        let scaledMouseX = mouseX / canvasScale;
        let scaledMouseY = mouseY / canvasScale;

        let deltaX = scaledMouseX - dragStartX;
        let deltaY = scaledMouseY - dragStartY;

        // Shift+drag: constrain to X or Y axis
        if (keyIsDown(SHIFT)) {
            // Determine axis on first significant movement
            if (shiftDragAxis === null && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
                shiftDragAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
            }
            // Apply constraint
            if (shiftDragAxis === 'x') deltaY = 0;
            else if (shiftDragAxis === 'y') deltaX = 0;
        } else {
            shiftDragAxis = null; // Reset if shift released
        }

        if (draggedTextbox.isCustom) {
            // Custom textbox: update x, y directly
            let textbox = customTextboxes.find(t => t.id === draggedTextbox.id);
            if (textbox) {
                if (keyIsDown(SHIFT) && shiftDragAxis) {
                    // Constrained drag
                    if (shiftDragAxis === 'x') {
                        textbox.x = dragStartOffsetX + deltaX;
                    } else {
                        textbox.y = dragStartOffsetY + deltaY;
                    }
                } else {
                    // Unconstrained drag
                    textbox.x = dragStartOffsetX + deltaX;
                    textbox.y = dragStartOffsetY + deltaY;
                }
            }
        } else {
            // Predefined textbox: update offsets
            if (currentView === 'ratings') {
                horizontalOffsetsRatings[draggedTextbox.id] = Math.round(dragStartOffsetX + deltaX);
                verticalOffsetsRatings[draggedTextbox.id] = Math.round(dragStartOffsetY + deltaY);
            } else {
                horizontalOffsetsCover[draggedTextbox.id] = Math.round(dragStartOffsetX + deltaX);
                verticalOffsetsCover[draggedTextbox.id] = Math.round(dragStartOffsetY + deltaY);
            }

            if(draggedTextbox.id === 'image' && automaticAlignmentCheckbox.checked){
                alignMainElementsToImage()
                captureState()
                currentView === 'ratings' ? printAlbum() : printCoverScreen();
            }

            // Update sliders
            updateVerticalOffsetSlider();
            updateHorizontalOffsetSlider();
        }

        // Update position controls
        updatePositionControls();

        currentView === 'ratings' ? printAlbum() : printCoverScreen();
    }
}

function mouseReleased() {
    if (isDraggingTextbox) {
        isDraggingTextbox = false;
        draggedTextbox = null;
        shiftDragAxis = null; // Reset axis constraint
        captureState();
    }
}

function showSizeAdjustPanel(box) {
    let sizeContainer = select('#size-container');
    let leadingContainer = select('#leading-container');
    let customContainer = select('#custom-textbox-controls');

    if (box.isCustom) {
        // Show custom textbox controls, hide predefined ones
        sizeContainer.style('display', 'none');
        leadingContainer.style('display', 'none');
        customContainer.style('display', 'flex');

        // Update custom controls with current values
        let textbox = customTextboxes.find(t => t.id === box.id);
        if (textbox) {
            select('#custom-font-size-slider').value(textbox.fontSize);
            select('#custom-font-size-display').html(textbox.fontSize);
            select('#custom-leading-slider').value(textbox.leading || 0);
            select('#custom-leading-display').html(textbox.leading || 0);
            select('#custom-font-select').selected(textbox.fontType);
            select('#custom-color-picker').value(textbox.color);
            select('#custom-max-width-slider').value(textbox.maxWidth || 500);
            select('#custom-max-width-display').html(textbox.maxWidth || 500);
        }
    } else {
        // Show predefined textbox controls, hide custom ones
        sizeContainer.style('display', 'flex');
        customContainer.style('display', 'none');

        let sizeDisplay = select('#size-display');
        let offset = box.sizeOffset || 0;
        sizeDisplay.html(offset >= 0 ? '+' + offset : offset);

        if (box.id === 'funfact') {
            leadingContainer.style('display', 'flex');
            let leadingDisplay = select('#leading-display');
            let leadingOffset = textLeadingOffsets.funfact || 0;
            leadingDisplay.html(leadingOffset >= 0 ? '+' + leadingOffset : leadingOffset);
        } else {
            leadingContainer.style('display', 'none');
        }
    }

    // Sync alignment selector
    let alignSelect = select('#align-select');
    if (alignSelect) {
        let align;
        if (box.isCustom) {
            let textbox = customTextboxes.find(t => t.id === box.id);
            align = textbox ? (textbox.textAlign || 'left') : 'left';
        } else {
            align = currentView === 'ratings' ? (textAlignRatings[box.id] || 'left') : (textAlignCover[box.id] || 'center');
        }
        alignSelect.selected(align);
    }

    sizeAdjustPanel.style('display', 'flex');

    // Update vertical offset slider
    updateVerticalOffsetSlider();
}

function updateVerticalOffsetSlider() {
    if (verticalOffsetSlider) {
        // Disable for custom textboxes (they use drag instead)
        if (selectedTextBox && !selectedTextBox.isCustom) {
            // Enable slider and set value from correct offset object
            verticalOffsetSlider.removeAttribute('disabled');
            verticalOffsetSlider.removeClass('disabled');

            let offset;
            if (currentView === 'ratings') {
                offset = verticalOffsetsRatings[selectedTextBox.id] || 0;
            } else {
                offset = verticalOffsetsCover[selectedTextBox.id] || 0;
            }

            verticalOffsetSlider.value(offset);
            verticalOffsetLabel.html(offset);
        } else {
            // Disable slider
            verticalOffsetSlider.attribute('disabled', '');
            verticalOffsetSlider.addClass('disabled');
            verticalOffsetSlider.value(0);
            verticalOffsetLabel.html(selectedTextBox && selectedTextBox.isCustom ? 'N/A' : '0');
        }
    }

    // Update position controls
    updatePositionControls();

    // Also update the advanced options sliders
    updateHorizontalOffsetSlider();
    updateMaxTextboxWidthSlider();
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

    if (selectedTextBox.isCustom) {
        // Reset custom textbox to defaults
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) {
            textbox.fontSize = 40;
            textbox.leading = 0;
            textbox.fontType = 'fontHeavy';
            textbox.color = '#ffffff';
            textbox.maxWidth = width - 100;
            textbox.x = 100;
            textbox.y = 100;
        }
    } else {
        // Reset predefined textbox
        if (textSizeOffsets.hasOwnProperty(selectedTextBox.id)) {
            textSizeOffsets[selectedTextBox.id] = 0;
            selectedTextBox.sizeOffset = 0;
        }
        if (selectedTextBox.id === 'funfact') textLeadingOffsets.funfact = 0;
    }

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
        aspectRatio: currentAspectRatio,
        imageFormat: currentImageFormat,
        showGradeLegend: showGradeLegend,
        tracks: tracks.map(t => ({ title: t.titleInput.value(), grade: t.gradeSelect.value(),
                                    customNumber: t.customNumber || null, customText: t.textInput ? t.textInput.value() : null })),
        customTextboxes: customTextboxes.map(t => ({
            id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
            fontType: t.fontType, color: t.color, viewType: t.viewType,
            leading: t.leading || 0, maxWidth: t.maxWidth || 500
        })),
        textSizeOffsets: {...textSizeOffsets},
        textLeadingOffsets: {...textLeadingOffsets},
        verticalOffsetsRatings: {...verticalOffsetsRatings},
        verticalOffsetsCover: {...verticalOffsetsCover},
        horizontalOffsetsRatings: {...horizontalOffsetsRatings},
        horizontalOffsetsCover: {...horizontalOffsetsCover},
        imageSizeMultiplier: imageSizeMultiplier,
        maxTextboxWidths: {...maxTextboxWidths},
        tracksTextSize: tracksTextSize,
        tracksSpacing: tracksSpacing,
        tracksRectHeight: tracksRectHeight,
        textAlignRatings: {...textAlignRatings},
        textAlignCover: {...textAlignCover}
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

    if (state.aspectRatio) {
        currentAspectRatio = state.aspectRatio;
        aspectRatioSelect.selected(state.aspectRatio);
    }

    if (state.imageFormat) {
        currentImageFormat = state.imageFormat;
        imageFormatSelect.selected(state.imageFormat);
    }

    if (state.showGradeLegend !== undefined) {
        showGradeLegend = state.showGradeLegend;
        if (gradeLegendCheckbox) gradeLegendCheckbox.checked(showGradeLegend);
    }

    // Clear existing offsets before restoring
    Object.keys(verticalOffsetsRatings).forEach(k => delete verticalOffsetsRatings[k]);
    Object.keys(verticalOffsetsCover).forEach(k => delete verticalOffsetsCover[k]);
    Object.keys(horizontalOffsetsRatings).forEach(k => delete horizontalOffsetsRatings[k]);
    Object.keys(horizontalOffsetsCover).forEach(k => delete horizontalOffsetsCover[k]);
    Object.keys(textSizeOffsets).forEach(k => textSizeOffsets[k] = 0);
    Object.keys(textLeadingOffsets).forEach(k => textLeadingOffsets[k] = 0);
    Object.keys(maxTextboxWidths).forEach(k => maxTextboxWidths[k] = defaultMaxTextboxWidths[k] || 500);
    Object.keys(textAlignRatings).forEach(k => textAlignRatings[k] = 'left');
    Object.keys(textAlignCover).forEach(k => textAlignCover[k] = 'center');

    if (state.textSizeOffsets) Object.assign(textSizeOffsets, state.textSizeOffsets);
    if (state.textLeadingOffsets) Object.assign(textLeadingOffsets, state.textLeadingOffsets);
    if (state.textAlignRatings) Object.assign(textAlignRatings, state.textAlignRatings);
    if (state.textAlignCover) Object.assign(textAlignCover, state.textAlignCover);
    if (state.verticalOffsetsRatings) Object.assign(verticalOffsetsRatings, state.verticalOffsetsRatings);
    if (state.verticalOffsetsCover) Object.assign(verticalOffsetsCover, state.verticalOffsetsCover);
    if (state.horizontalOffsetsRatings) Object.assign(horizontalOffsetsRatings, state.horizontalOffsetsRatings);
    if (state.horizontalOffsetsCover) Object.assign(horizontalOffsetsCover, state.horizontalOffsetsCover);
    if (state.imageSizeMultiplier !== undefined) {
        imageSizeMultiplier = state.imageSizeMultiplier;
        if (imageSizeMultiplierSlider) {
            imageSizeMultiplierSlider.value(imageSizeMultiplier);
            imageSizeMultiplierLabel.html(imageSizeMultiplier.toFixed(2) + 'x');
        }
    }
    if (state.maxTextboxWidths) Object.assign(maxTextboxWidths, state.maxTextboxWidths);
    if (state.tracksTextSize !== undefined) tracksTextSize = state.tracksTextSize;
    if (state.tracksSpacing !== undefined) tracksSpacing = state.tracksSpacing;
    if (state.tracksRectHeight !== undefined) tracksRectHeight = state.tracksRectHeight;

    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }

    if (state.tracks && state.tracks.length > 0) {
        state.tracks.forEach(track => {
            addTrackRowWithoutCapture();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'STRONG');
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber);
            }
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.style('display', 'block');
            }
        });
    } else addTrackRowWithoutCapture();

    // Restore custom textboxes
    customTextboxes = [];
    if (customTextboxContainer) customTextboxContainer.html('');
    if (state.customTextboxes && state.customTextboxes.length > 0) {
        state.customTextboxes.forEach(textboxData => {
            let textbox = {
                id: textboxData.id,
                text: textboxData.text || '',
                x: textboxData.x || 100,
                y: textboxData.y || 100,
                fontSize: textboxData.fontSize || 40,
                fontType: textboxData.fontType || 'fontHeavy',
                color: textboxData.color || '#ffffff',
                viewType: textboxData.viewType || 'both',
                textAlign: textboxData.textAlign || 'left',
                leading: textboxData.leading || 0,
                maxWidth: textboxData.maxWidth || width - 100
            };
            customTextboxes.push(textbox);
            addCustomTextboxUI(textbox);
        });
    }

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