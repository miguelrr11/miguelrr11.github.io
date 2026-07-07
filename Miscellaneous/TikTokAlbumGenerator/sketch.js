//Album Rating Generator for Social Media
//Miguel Rodríguez
//17-01-2026

//Esta webapp la hice para agilizar el proceso de subir mis reviews a tiktok (@thethirdeye)
//esta completamente vibe-codeada, con 100% mis ideas y direccion creativa


p5.disableFriendlyErrors = true
const WIDTH = 1080
const HEIGHT = 1920

let uploadedFile = null
let albumData = null

let fontRegular, fontRegularItalic, fontRegularCrammed, fontRegularCondensed, fontHeavy, fontLight
var utils = new p5.Utils();

// UI Elements
let titleInput, artistInput, yearInput, genreInput, funfactInput, imageUrlInput, albumGradeSelect;
let trackContainer, tracks = [];
const gradeOptions = ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP', 'SHIT', 'INTERLUDE', 'None'];
// Grades selectable in the album/track dropdowns. INTERLUDE is no longer a grade —
// it's a per-track boolean toggle — but it stays in gradeOptions/colorMap so the grey
// pill colour remains customizable in the color section.
const selectableGradeOptions = gradeOptions.filter(g => g !== 'INTERLUDE');
let allLegendGrades = ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP', 'SHIT'];
let allLegendLabels = ['GOAT', '10', '9', '8', '7', '<7', '<5', '<2'];
let verticalOffsetSlider, verticalOffsetLabel;
let horizontalOffsetSlider, horizontalOffsetLabel;
let imageSizeMultiplierSlider, imageSizeMultiplierLabel;
let maxTextboxWidthSlider, maxTextboxWidthLabel;
let positionXInput, positionYInput, positionXLabel, positionYLabel;

const IA_MODEL = 'gpt-5.4-mini'

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

let aspectRatioCoverSelect
let currentAspectRatioCover = '3:4';

// View toggle: 'ratings' or 'cover'
let currentView = 'ratings';
let viewToggleBtn, editorPanel, dragOverlay;

// Undo/Redo system
let historyStack = [], historyIndex = -1;
const MAX_HISTORY = 300;
let isUndoRedoAction = false;

// Monaco sync flags
let isUpdatingMonacoFromUI = false;
let isUpdatingEditorFromMonaco = false;
let monacoInitStarted = false; // persists across JSON-mode toggles so the editor is created only once

// Text box selection and sizing
let textBoxes = [], selectedTextBox = null, sizeAdjustPanel = null, tracksAdjustPanel = null;
let textSizeOffsets = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0 };
let textLeadingOffsets = { funfact: 0 };
let verticalOffsetsRatings = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0, tracks: 0, image: 0 };
let verticalOffsetsCover = { title: 0, artist: 0 };
let horizontalOffsetsRatings = { title: 0, artist: 0, year: 0, genre: 0, funfact: 0, tracks: 0, image: 0 };
let horizontalOffsetsCover = { title: 0, artist: 0 };
let imageSizeMultiplier = 1.0;
let maxTextboxWidths = { title: 980, artist: 378, year: 378, genre: 378, funfact: 459 };
const defaultMaxTextboxWidths = { title: 980, artist: 480, year: 480, genre: 480, funfact: 490 };
let textAlignRatings = { title: 'left', artist: 'left', year: 'left', genre: 'left', funfact: 'left' };
let textAlignCover = { title: 'center', artist: 'center' };

// Track customization
let tracksTextSize = 60;
let tracksSpacing = 0; // Added to base spacing calculation
let tracksRectHeight = 40;
let tracksTwoColumns = false; // Split the tracklist into two columns
let tracksTextSizeSlider, tracksSpacingSlider, tracksRectHeightSlider, tracksTwoColumnsCheckbox;
let tracksTextSizeLabel, tracksSpacingLabel, tracksRectHeightLabel;
let automaticAlignmentCheckbox
let showTrackNumbersCheckbox

// Export settings
let showGreenRectangle = true; // Only show when not downloading
let imageFormatSelect;
let currentImageFormat = 'png';
let downloadImageSelect;
let downloadImageOption = 'both'; // 'both' | 'cover' | 'ratings' — which screens the image download exports
let showGradeLegend = true;
let gradeLegendCheckbox;

// Image cache
let cachedImageUrl = null, cachedOriginalImage = null, cachedFilteredImage = null;
let lastUrlChecked = null;

// Custom color map
let colorMap = { "GOAT": "#05668d", "PEAK": "#ffd21f", "EXCEPTIONAL": "#ff1fa9", "STRONG": "#bc3fde", "DECENT": "#38b6ff", "OKAY": "#14b60b", "FLOP": "#CC0000", "SHIT": "#7a4900", "INTERLUDE": "#b2b2b2", "None": "#5c5c5c" };
let goatGradient = ["#05668d", "#028090", "#00a896", "#02c39a", "#f0f3bd"]
const GOAT_GRADIENT_STOPS = [0, .2, .38, .59, 1];
const defaultColorMap = {...colorMap};
let colorPickers = {}, canvasScale = 1;

// Profile system
let profiles = {};
let currentProfileName = 'Default';
let profileSelect, profileNameInput;

// Glitch Options UI controls
let glitchTargetSel;
let glSideLeft, glSideRight, glSideTop, glSideBottom;
let glTypeSelect;
let glAmpSlider, glAmpLabel;
let glScaleSlider, glScaleLabel;
let glSymChk;
let glBlurSlider, glBlurLabel;
let glColorChks = {};
let glColorAmtSlider, glColorAmtLabel;
let glColorTint;
let glColorShiftSlider, glColorShiftLabel;
let glColorLvlSlider, glColorLvlLabel;
let glColorBandScaleSlider, glColorBandScaleLabel;
let glColorBandSeedSlider, glColorBandSeedLabel;
let glWarpMosaicSlider, glWarpMosaicLabel;
let glWarpShearSlider, glWarpShearLabel;
let glWarpEchoSlider, glWarpEchoLabel;
let glWarpHazeSlider, glWarpHazeLabel;
let glWarpBandSlider, glWarpBandLabel;
let glEdgesModeSelect;
let glEdgesSampleChk;
let glEdgesCommonColorsChk;
let glEdgesSfSlider, glEdgesSfLabel;
let glEdgesScaleSlider, glEdgesScaleLabel;
let glEdgesSeedSlider, glEdgesSeedLabel;
let glEdgesOffsetSlider, glEdgesOffsetLabel;
// rows whose visibility depends on the active mode (kept so the panel only shows relevant controls)
let glTintRow, glShiftRow, glLvlRow, glBandScaleRow, glBandSeedRow;
let glSfRow, glEdgeScaleRow, glEdgeSeedRow;

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

let draggedTrackIndex = null;
let autoGenerateTimeout = null;
let selectedTrackRow = null; // rowDiv element of the currently selected track (shows its button row)



// Mark a track row as the selected one in the UI so only its button row is shown.
function selectTrackRowUI(rowDiv) {
    selectedTrackRow = rowDiv;
    tracks.forEach(t => {
        if (t.rowDiv === rowDiv) t.rowDiv.addClass('selected');
        else t.rowDiv.removeClass('selected');
    });
}

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
    updateVisibilityCustomTextBoxesUI()
    if(localStorage.getItem('albumGeneratorData') == undefined) applySelectedProfile()

    setInterval(saveToLocalStorage, 1000);
    document.addEventListener('keydown', handleKeyboard);

    const ua = navigator.userAgent;
    const isSafari = ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Chromium');
    if (isSafari) {
        const banner = document.createElement('div');
        banner.id = 'safari-warning-banner';
        banner.innerHTML = '⚠️ You are using Safari. Some features may not work correctly — for the best experience, use Chrome or Firefox. <button onclick="this.parentElement.remove()" style="margin-left:12px;background:rgba(255,255,255,0.25);border:none;color:inherit;padding:2px 10px;border-radius:4px;cursor:pointer;font-size:13px;">Dismiss</button>';
        Object.assign(banner.style, {
            position: 'fixed', top: '0', left: '0', right: '0', zIndex: '9999',
            background: '#b45309', color: '#fff', textAlign: 'center',
            padding: '10px 16px', fontSize: '14px', fontFamily: 'sans-serif',
        });
        document.body.prepend(banner);
    }
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
        let doesntHaveDecimal = grade !== null && grade !== undefined && Number.isInteger(grade)
        if(grade && grade < 10) setTrackMiniDescription(tracks[trackIndex], doesntHaveDecimal ? '' : grade.toString())
        // No number on the line → treat it as an interlude with no grade (just a grey pill)
        let isInterlude = grade == null
        if(isInterlude) finalGrade = 'None'
        else if(grade >= 10.5) finalGrade = 'GOAT'
        else if(grade >= 10) finalGrade = 'PEAK'
        else if(grade >= 9) finalGrade = 'EXCEPTIONAL'
        else if(grade >= 8) finalGrade = 'STRONG'
        else if(grade >= 7) finalGrade = 'DECENT'
        else if(grade >= 5) finalGrade = 'OKAY'
        else if(grade >= 2) finalGrade = 'FLOP'
        else finalGrade = 'SHIT'
        tracks[trackIndex].gradeSelect.value(finalGrade)
        setTrackInterlude(tracks[trackIndex], isInterlude)
        if(i < lineas.length - 1) addTrackRowWithCapture()
        trackIndex++
    }
}

// Toggle a track's interlude flag and keep its button's visual state in sync.
function setTrackInterlude(trackObj, val) {
    trackObj.interlude = !!val;
    if (trackObj.interludeBtn) trackObj.interludeBtn.elt.classList.toggle('active', trackObj.interlude);
}

function setTrackMiniDescription(trackObj, newDescription) {
    trackObj.textInput.value(newDescription);
    const evt = new Event('input', { bubbles: true });
    trackObj.textInput.elt.dispatchEvent(evt);
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
                    let loadData = data.album || data;
                    fillFormFromData(loadData);
                    generateFromForm();
                    captureState();
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

    //const json = window.monacoEditor.getValue();
    
    let panelEditor = createDiv('').parent(editorPanel).class('panel-column panel-editor').id('panel-editor');
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

    // Focusing a metadata field selects its matching canvas textbox so the adjustment bar appears
    titleInput.elt.addEventListener('focus', () => selectTextBoxById('title'));
    artistInput.elt.addEventListener('focus', () => selectTextBoxById('artist'));
    yearInput.elt.addEventListener('focus', () => selectTextBoxById('year'));
    genreInput.elt.addEventListener('focus', () => selectTextBoxById('genre'));
    funfactInput.elt.addEventListener('focus', () => selectTextBoxById('funfact'));

    createImageInputWithUpload(panel1);

    let gradeRow = createDiv('').parent(panel1).style('display: flex; gap: 35px; align-items: center;');
    let gradeGroup = createDiv('').parent(gradeRow).class('form-group').style('flex: 1;');
    createElement('label', 'Album Grade').parent(gradeGroup);
    albumGradeSelect = createSelect().parent(gradeGroup).class('form-select');
    selectableGradeOptions.forEach(opt => albumGradeSelect.option(opt));
    let options = albumGradeSelect.elt.options;
    for(let i = 0; i < selectableGradeOptions.length; i++) {
        options[i].style.backgroundColor = colorMap[selectableGradeOptions[i]];
        options[i].style.color = getContrastYIQ(colorMap[selectableGradeOptions[i]]);
    }
    albumGradeSelect.changed(() => { autoGeneratePreview(); captureState(); });

    createPositionControls(gradeRow);

     createDiv('').parent(panel1).class('section-divider')

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
    addTrackBtn.mousePressed(() => {
        addTrackRow();
    });

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
    createGlitchOptionsSection(panel3);
    createColorSection(panel3);
    createAdvancedOptionsSection(panel3);
    createIASection(panel3);

    // Floating panels (fixed position, not in any column)
    createSizeAdjustPanel();   // shown when a textbox is selected
    createTracksAdjustPanel(); // shown when the tracks block is selected
}

function setDataEditor(data){
    window.monacoEditor.setValue(JSON.stringify(data, null, 2));
}

function getDataEditor(){
    try {
        const data = JSON.parse(window.monacoEditor.getValue());
        return data;
    } catch (e) {
        console.error('Invalid JSON:', e);
    }
}

function syncEditorFromUI() {
    if (!window.monacoEditor || isUpdatingEditorFromMonaco) return;
    let data = {
        title: titleInput.value(), artist: artistInput.value(), year: yearInput.value(),
        genre: genreInput.value(), funfact: funfactInput.value(), imageUrl: imageUrlInput.value(),
        albumGrade: albumGradeSelect.value(),
        aspectRatio: currentAspectRatio,
        aspectRatioCover: currentAspectRatioCover,
        imageFormat: currentImageFormat,
        downloadImageOption: downloadImageOption,
        showGradeLegend: showGradeLegend,
        tracks: tracks.map(t => ({
            title: t.titleInput.value(), grade: t.gradeSelect.value(), interlude: t.interlude || false,
            customNumber: t.customNumber || null, customText: t.textInput ? t.textInput.value() : null,
            customTextLarge: t.textLargeInput ? t.textLargeInput.value() : null
        })),
        customTextboxes: customTextboxes.map(t => ({
            id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
            fontType: t.fontType, color: t.color, viewType: t.viewType,
            textAlign: t.textAlign || 'left', leading: t.leading || 0, maxWidth: t.maxWidth || width - 100
        })),
        verticalOffsetsRatings: {...verticalOffsetsRatings},
        verticalOffsetsCover: {...verticalOffsetsCover},
        horizontalOffsetsRatings: {...horizontalOffsetsRatings},
        horizontalOffsetsCover: {...horizontalOffsetsCover},
        imageSizeMultiplier,
        maxTextboxWidths: {...maxTextboxWidths},
        textSizeOffsets: {...textSizeOffsets},
        textLeadingOffsets: {...textLeadingOffsets},
        tracksTextSize, tracksSpacing, tracksRectHeight, tracksTwoColumns,
        textAlignRatings: {...textAlignRatings},
        textAlignCover: {...textAlignCover},
        glitchOpts: {...glitchOpts},
        glitchOptsTitle: {...glitchOptsTitle}
    };
    isUpdatingMonacoFromUI = true;
    window.monacoEditor.setValue(JSON.stringify(data, null, 2));
    isUpdatingMonacoFromUI = false;
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

    viewToggleBtn = createButton('View: Ratings').parent(buttonGrid).class('btn btn-blue')
    viewToggleBtn.mousePressed(toggleView);

    createDiv('').parent(buttonGrid).class('section-divider')

    let buttonToggleJSONeditor = createButton('Switch to JSON Mode').parent(buttonGrid).class('btn btn-secondary')
    buttonToggleJSONeditor.mousePressed(() => {
        editorPanel.toggleClass('editor-open');
        buttonToggleJSONeditor.html(editorPanel.hasClass('editor-open') ? 'Switch to UI Mode' : 'Switch to JSON Mode');

        if (editorPanel.hasClass('editor-open')) {
            // Create the Monaco editor only once; subsequent toggles just re-sync it.
            // Creating it on every toggle stacks editors in #panel-editor, whose
            // overlapping hidden textareas break keyboard editing (arrows/delete/overwrite).
            if (!monacoInitStarted) {
                monacoInitStarted = true;
                require(['vs/editor/editor.main'], function() {
                    window.monacoEditor = monaco.editor.create(document.getElementById('panel-editor'), {
                        value: '{}',
                        language: 'json',
                        theme: 'vs-dark',
                        automaticLayout: true
                    });

                    syncEditorFromUI();

                    window.monacoEditor.onDidChangeModelContent(() => {
                        if (isUpdatingMonacoFromUI) return;
                        try {
                            const data = JSON.parse(window.monacoEditor.getValue());
                            isUpdatingEditorFromMonaco = true;
                            isUndoRedoAction = true;
                            fillFormFromData(data);
                            glitchOpts = data.glitchOpts ? data.glitchOpts : glitchOpts
                            glitchOptsTitle = data.glitchOptsTitle ? data.glitchOptsTitle : glitchOptsTitle
                            isUndoRedoAction = false;
                            generateFromForm();
                            captureState();
                            isUpdatingEditorFromMonaco = false;
                        } catch (e) {
                            // user is mid-typing, JSON not valid yet
                        }
                    });
                });
            } else {
                syncEditorFromUI();
            }
        }
    });

    createDiv('').parent(buttonGrid).class('section-divider')

    // Aspect Ratio & Image Format selectors
    let aspectRatioRow = createDiv('')
        .parent(buttonGrid)
        .style('display: flex; gap: 12px; margin-bottom: 10px; align-items: flex-end;');

    // Aspect Ratio selector (half width)
    let aspectRatioGroup = createDiv('')
        .parent(aspectRatioRow)
        .class('form-group')
        .style('flex: 1; margin-bottom: 0; display: flex; gap: 8px; align-items: flex-end;');
    

    

    let ap1Wrapper = createDiv('')
        .parent(aspectRatioGroup)
        .style('display: flex; flex-direction: column; flex: 1;');

    createElement('label', 'Ratings').parent(ap1Wrapper);
    aspectRatioSelect = createSelect().parent(ap1Wrapper).class('form-select');
    Object.keys(aspectRatioOptions).forEach(opt => aspectRatioSelect.option(opt));
    aspectRatioSelect.selected('9:16');
    aspectRatioSelect.changed(() => {
        currentAspectRatio = aspectRatioSelect.value();
        autoGeneratePreview();
        captureState();
    });

    let ap2Wrapper = createDiv('')
        .parent(aspectRatioGroup)
        .style('display: flex; flex-direction: column; flex: 1;');

    createElement('label', 'Cover').parent(ap2Wrapper);
    aspectRatioCoverSelect = createSelect().parent(ap2Wrapper).class('form-select');
    Object.keys(aspectRatioOptions).forEach(opt => aspectRatioCoverSelect.option(opt));
    aspectRatioCoverSelect.selected('3:4');
    aspectRatioCoverSelect.changed(() => {
        currentAspectRatioCover = aspectRatioCoverSelect.value();
        if(currentView === 'cover') autoGeneratePreview();
        captureState();
    });

    // Image Format selector (half width)
    let imageFormatGroup = createDiv('')
        .parent(aspectRatioRow)
        .class('form-group')
        .style('flex: 0.5; margin-bottom: 0;');
    createElement('label', 'Format').parent(imageFormatGroup);
    imageFormatSelect = createSelect().parent(imageFormatGroup).class('form-select');
    ['png', 'jpg', 'jpeg', 'webp'].forEach(format => imageFormatSelect.option(format));
    imageFormatSelect.selected('png');
    imageFormatSelect.changed(() => {
        currentImageFormat = imageFormatSelect.value();
        captureState();
    });

    
    let downloadRow = createDiv('')
        .parent(aspectRatioRow)
        .style('flex: 1; display: flex; gap: 8px; align-items: end;')

    let downloadImgGroup = createDiv('').parent(downloadRow).class('form-group').style('flex: 1; margin-bottom: 0; align-items: end;');
    createElement('label', 'Image').parent(downloadImgGroup).style('margin-right: 8px;');
    createButton('<i class="fa-solid fa-download"></i>')
        .parent(downloadImgGroup)
        .class('btn btn-secondary')
        .mousePressed(downloadBothImages)
        .style('flex: 0.6;')

    let downloadJsonGroup = createDiv('').parent(downloadRow).class('form-group').style('flex: 1; margin-bottom: 0; align-items: end;');
    createElement('label', 'JSON').parent(downloadJsonGroup).style('margin-right: 8px;');
    createButton('<i class="fa-solid fa-download"></i>')
        .parent(downloadJsonGroup)
        .class('btn btn-secondary')
        .mousePressed(downloadJSON)
        .style('flex: 0.6;')
    
    createDiv('').parent(buttonGrid).class('section-divider'); 

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
        "tracksTextSize": 40,
        "tracksSpacing": -30,
        "tracksRectHeight": 28,
        "tracksTwoColumns": false,
        "tracksVerticalOffset": 0,
        "colorMap": {
            "GOAT": "#05668d",
            "PEAK": "#ffd21f",
            "EXCEPTIONAL": "#ff1fa9",
            "STRONG": "#bc3fde",
            "DECENT": "#38b6ff",
            "OKAY": "#14b60b",
            "FLOP": "#CC0000",
            "SHIT": "#7a4900",
            "INTERLUDE": "#b2b2b2",
            "None": "#5c5c5c"
        },
        "aspectRatio": "3:4",
        "aspectRatioCover": "3:4",
        "imageFormat": "jpg",
        "downloadImageOption": "both",
        "showGradeLegend": true,
        "verticalOffsetsRatings": {
            "funfact": -21,
            "title": 100,
            "tracks": -41
        },
        "verticalOffsetsCover": {
            "artist": -500,
            "title": 23
        },
        "horizontalOffsetsRatings": {
            "artist": -40,
            "funfact": -40,
            "year": -40,
            "genre": -40,
            "tracks": -29
        },
        "horizontalOffsetsCover": {
            "title": 0,
            "artist": 2597
        },
        "imageSizeMultiplier": 0.95,
        "maxTextboxWidths": {
            "title": 980,
            "artist": 480,
            "year": 480,
            "genre": 520,
            "funfact": 490
        },
        "textSizeOffsets": {
            "title": 0,
            "artist": 4,
            "year": 0,
            "genre": 0,
            "funfact": -6
        },
        "textLeadingOffsets": {
            "funfact": -6
        },
        "textAlignRatings": {
            "title": "left",
            "artist": "left",
            "year": "left",
            "genre": "left",
            "funfact": "justify"
        },
        "textAlignCover": {
            "title": "center",
            "artist": "center"
        },
        "customTextboxes": [
            {
                "color": "#f2f2f2",
                "fontSize": 48,
                "fontType": "fontRegularCondensed",
                "leading": 0,
                "maxWidth": 980,
                "text": "Album Review #nnn",
                "viewType": "cover",
                "textAlign": "center",
                "x": 49,
                "y": 292,
                "id": "album_review"
            },
            {
                "color": "#ffffff",
                "fontSize": 24,
                "fontType": "fontRegularCondensed",
                "leading": 0,
                "maxWidth": 980,
                "text": "Songs added to GOAT Playlist: - (link in bio)",
                "viewType": "ratings",
                "textAlign": "left",
                "x": 56.94990391440638,
                "y": 1284.4670669176778,
                "id": "songsAddedToGOATPlaylist"
            },
            {
                "color": "#cccccc",
                "fontSize": 30,
                "fontType": "fontLight",
                "leading": 0,
                "maxWidth": 980,
                "text": "$(js: albumData.genre.split(/,s*/g)[0])$",
                "viewType": "cover",
                "textAlign": "center",
                "x": 55.02164222708063,
                "y": 1266.3363191721955,
                "id": "genreInCover"
            },
            {
                "color": "#ededed",
                "fontSize": 36,
                "fontType": "fontRegularCondensed",
                "leading": 0,
                "maxWidth": 980,
                "text": "$artist$, $year$",
                "viewType": "cover",
                "textAlign": "center",
                "x": 50.7153196622437,
                "y": 1209.336460532268,
                "id": "artistAndYearInCover"
            }
        ],
        "glitchOpts": {
            "sides": {"left": true, "right": true, "top": false, "bottom": false},
            "type": "sine",
            "amp": 50,
            "scale": 0.005,
            "symmetrical": false,
            "color": {"mode": "bloom+glow", "amount": 0.15, "tint": [255, 60, 180], "levels": 10, "shift": 60},
            "warp": {},
            "edges": {"mode": "noise", "sample": true, "scale": 0.04}
        },
        "glitchOptsTitle": {
            "sides": {"left": true, "right": true, "top": false, "bottom": false},
            "type": "none",
            "amp": 60,
            "scale": 0.005,
            "symmetrical": false,
            "color": {"mode": "fade+bands", "amount": 0.85, "bandScale": 0.05, "bandSeed": 10, "tint": [255, 60, 180], "levels": 10, "shift": 60},
            "warp": {}
        }
    }
}

function getCurrentProfileData() {
    return {
        tracksTextSize: tracksTextSize,
        tracksSpacing: tracksSpacing,
        tracksRectHeight: tracksRectHeight,
        tracksTwoColumns: tracksTwoColumns,
        tracksVerticalOffset: verticalOffsetsRatings.tracks || 0,
        colorMap: {...colorMap},
        aspectRatio: currentAspectRatio,
        aspectRatioCover: currentAspectRatioCover,
        imageFormat: currentImageFormat,
        downloadImageOption: downloadImageOption,
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
        customTextboxes: getCustomTextboxesProperties(),
        glitchOpts: JSON.parse(JSON.stringify(glitchOpts)),
        glitchOptsTitle: JSON.parse(JSON.stringify(glitchOptsTitle))
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
    tracksTwoColumns = profileData.tracksTwoColumns !== undefined ? profileData.tracksTwoColumns : false;
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
    if (tracksTwoColumnsCheckbox) tracksTwoColumnsCheckbox.checked(tracksTwoColumns);

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

    // Apply aspect ratio for cover
    if (profileData.aspectRatioCover && aspectRatioOptions[profileData.aspectRatioCover]) {
        currentAspectRatioCover = profileData.aspectRatioCover;
        aspectRatioCoverSelect.selected(profileData.aspectRatioCover);
    }

    // Apply image format
    if (profileData.imageFormat) {
        currentImageFormat = profileData.imageFormat;
        imageFormatSelect.selected(profileData.imageFormat);
    }

    // Apply image download scope
    if (profileData.downloadImageOption) {
        downloadImageOption = profileData.downloadImageOption;
        if (downloadImageSelect) downloadImageSelect.selected(downloadImageOption);
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

    // Apply glitch opts
    if (profileData.glitchOpts)      glitchOpts      = JSON.parse(JSON.stringify(profileData.glitchOpts));
    if (profileData.glitchOptsTitle) glitchOptsTitle = JSON.parse(JSON.stringify(profileData.glitchOptsTitle));
    if (glitchTargetSel) syncGlitchUI(getActiveGlitchOpts());

    glitchImageCache = {};

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

// Floating panel shown when the tracks block is selected on the canvas. Mirrors the
// textbox size-adjust panel (same .sap-* styling) and holds the track customization
// controls that used to live in the "Customize Tracks" dropdown.
function createTracksAdjustPanel() {
    tracksAdjustPanel = createDiv('').id('tracks-adjust-panel');

    // --- Text Size ---
    let sizeGroup = createDiv('').parent(tracksAdjustPanel).class('sap-group');
    createSpan('Text Size').parent(sizeGroup).class('sap-label');
    tracksTextSizeSlider = createSlider(30, 80, 60, 2).parent(sizeGroup).class('sap-slider');
    tracksTextSizeLabel = createSpan('60').parent(sizeGroup).class('sap-value');
    tracksTextSizeSlider.input(() => {
        tracksTextSize = tracksTextSizeSlider.value();
        tracksTextSizeLabel.html(tracksTextSize);
        if (albumData && currentView === 'ratings') printAlbum();
    });
    tracksTextSizeSlider.changed(() => captureState());

    // --- Spacing ---
    let spacingGroup = createDiv('').parent(tracksAdjustPanel).class('sap-group');
    createSpan('Spacing').parent(spacingGroup).class('sap-label');
    tracksSpacingSlider = createSlider(-45, 20, 0, 1).parent(spacingGroup).class('sap-slider');
    tracksSpacingLabel = createSpan('0').parent(spacingGroup).class('sap-value');
    tracksSpacingSlider.input(() => {
        tracksSpacing = tracksSpacingSlider.value();
        tracksSpacingLabel.html(tracksSpacing);
        if (albumData && currentView === 'ratings') printAlbum();
    });
    tracksSpacingSlider.changed(() => captureState());

    // --- Rect Height ---
    let rectGroup = createDiv('').parent(tracksAdjustPanel).class('sap-group');
    createSpan('Rect Height').parent(rectGroup).class('sap-label');
    tracksRectHeightSlider = createSlider(20, 80, 40, 2).parent(rectGroup).class('sap-slider');
    tracksRectHeightLabel = createSpan('40').parent(rectGroup).class('sap-value');
    tracksRectHeightSlider.input(() => {
        tracksRectHeight = tracksRectHeightSlider.value();
        tracksRectHeightLabel.html(tracksRectHeight);
        if (albumData && currentView === 'ratings') printAlbum();
    });
    tracksRectHeightSlider.changed(() => captureState());

    // --- Two Columns ---
    let columnsGroup = createDiv('').parent(tracksAdjustPanel).class('sap-group');
    tracksTwoColumnsCheckbox = createCheckbox('Two Columns', tracksTwoColumns).parent(columnsGroup).class('checkbox-input');
    tracksTwoColumnsCheckbox.changed(() => {
        tracksTwoColumns = tracksTwoColumnsCheckbox.checked();
        if (albumData && currentView === 'ratings') printAlbum();
        captureState();
    });

    // --- Actions (reset + close) ---
    let actionsGroup = createDiv('').parent(tracksAdjustPanel).class('sap-group sap-actions');
    createButton('↻').parent(actionsGroup).class('sap-btn sap-btn-reset').mousePressed(() => {
        tracksTextSize = 44;
        tracksSpacing = -18;
        tracksRectHeight = 28;
        tracksTwoColumns = false;
        showTracksAdjustPanel();
        if (albumData && currentView === 'ratings') printAlbum();
        captureState();
    });
    createButton('✕').parent(actionsGroup).class('sap-btn sap-btn-close').mousePressed(() => {
        selectedTextBox = null;
        tracksAdjustPanel.style('display', 'none');
        updateVerticalOffsetSlider();
        currentView === 'ratings' ? printAlbum() : printCoverScreen();
    });
}

// Sync the tracks panel controls to current state and show it.
function showTracksAdjustPanel() {
    if (!tracksAdjustPanel) return;
    tracksTextSizeSlider.value(tracksTextSize);
    tracksTextSizeLabel.html(tracksTextSize);
    tracksSpacingSlider.value(tracksSpacing);
    tracksSpacingLabel.html(tracksSpacing);
    tracksRectHeightSlider.value(tracksRectHeight);
    tracksRectHeightLabel.html(tracksRectHeight);
    if (tracksTwoColumnsCheckbox) tracksTwoColumnsCheckbox.checked(tracksTwoColumns);
    tracksAdjustPanel.style('display', 'flex');
    updateVerticalOffsetSlider();
}

// ─── Glitch Options helpers ───────────────────────────────────────────────────

function getActiveGlitchOpts() {
    return (glitchTargetSel && glitchTargetSel.value() === 'title') ? glitchOptsTitle : glitchOpts;
}

let glitchRefreshScheduled = false;
// Coalesce glitch refreshes to at most one per animation frame. Interactive controls
// (especially Chrome's native color picker for the tint) fire their `input` event many
// times per frame while dragging; recomputing the whole glitch synchronously on each
// event floods the main thread and freezes the tab. rAF keeps only the latest value.
function refreshGlitchCache() {
    if (glitchRefreshScheduled) return;
    glitchRefreshScheduled = true;
    requestAnimationFrame(() => {
        glitchRefreshScheduled = false;
        glitchImageCache = {};
        if (albumData) currentView === 'ratings' ? printAlbum() : printCoverScreen();
    });
}

function rgbToHex(rgb) {
    return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function hexToRgbArr(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function syncGlitchUI(opts) {
    if (!opts || !glSideLeft) return;

    const sides = opts.sides || {};
    glSideLeft.checked(!!sides.left);
    glSideRight.checked(!!sides.right);
    glSideTop.checked(!!sides.top);
    glSideBottom.checked(!!sides.bottom);

    glTypeSelect.selected(opts.type || 'none');

    const amp = opts.amp != null ? opts.amp : 60;
    glAmpSlider.value(amp); glAmpLabel.html(amp);

    const sc = opts.scale != null ? opts.scale : 0.02;
    glScaleSlider.value(sc); glScaleLabel.html(parseFloat(sc).toFixed(3));

    glSymChk.checked(!!opts.symmetrical);

    const blur = opts.blur != null ? opts.blur : 0;
    glBlurSlider.value(blur); glBlurLabel.html(parseFloat(blur).toFixed(1));

    const col = opts.color || {};
    const activeModes = (col.mode || '').split(/[+,\s|]+/).filter(Boolean);
    const ALL_MODES = ['invert','tint','rainbow','chromatic','posterize','fade','glow','bloom','scanlines','bands'];
    ALL_MODES.forEach(m => { if(glColorChks[m]) glColorChks[m].checked(activeModes.includes(m)); });

    const amt = col.amount != null ? col.amount : 1;
    glColorAmtSlider.value(amt); glColorAmtLabel.html(parseFloat(amt).toFixed(2));

    if (col.tint) glColorTint.value(rgbToHex(col.tint));

    const shift = col.shift != null ? col.shift : 10;
    glColorShiftSlider.value(shift); glColorShiftLabel.html(shift);

    const levels = col.levels != null ? col.levels : 4;
    glColorLvlSlider.value(levels); glColorLvlLabel.html(levels);

    const bsc = col.bandScale != null ? Math.min(0.2, col.bandScale) : 0.05;
    glColorBandScaleSlider.value(bsc); glColorBandScaleLabel.html(parseFloat(bsc).toFixed(3));

    const bsd = col.bandSeed != null ? Math.min(100, col.bandSeed) : 0;
    glColorBandSeedSlider.value(bsd); glColorBandSeedLabel.html(parseFloat(bsd).toFixed(1));

    const warp = opts.warp || {};
    glWarpMosaicSlider.value(warp.mosaic || 0);  glWarpMosaicLabel.html(warp.mosaic || 0);
    glWarpShearSlider.value(warp.shear  || 0);   glWarpShearLabel.html(warp.shear   || 0);
    glWarpEchoSlider.value(warp.echo    || 0);   glWarpEchoLabel.html(warp.echo     || 0);
    glWarpHazeSlider.value(warp.haze    || 0);   glWarpHazeLabel.html(warp.haze     || 0);
    const wb = warp.band != null ? warp.band : 24;
    glWarpBandSlider.value(wb); glWarpBandLabel.html(wb);

    const edges = opts.edges || {};
    glEdgesModeSelect.selected(edges.mode || 'noise');
    glEdgesSampleChk.checked(!!edges.sample);
    if (glEdgesCommonColorsChk) glEdgesCommonColorsChk.checked(!!(edges.colors && edges.colors.length > 0));
    const sf = edges.sampleFactor != null ? edges.sampleFactor : 0.5;
    glEdgesSfSlider.value(sf); glEdgesSfLabel.html(parseFloat(sf).toFixed(2));
    const esc = edges.scale != null ? Math.min(0.2, edges.scale) : 0.05;
    glEdgesScaleSlider.value(esc); glEdgesScaleLabel.html(parseFloat(esc).toFixed(3));
    const esd = edges.seed != null ? Math.min(100, edges.seed) : 0;
    glEdgesSeedSlider.value(esd); glEdgesSeedLabel.html(parseFloat(esd).toFixed(1));
    const eoff = edges.offset != null ? edges.offset : 0;
    if (glEdgesOffsetSlider) { glEdgesOffsetSlider.value(eoff * 100); glEdgesOffsetLabel.html(Math.round(eoff * 100) + '%'); }

    updateGlitchColorVis();
    updateGlitchEdgesVis();
}

// Only show the colour sub-controls whose mode is active, so the panel stays uncluttered.
function updateGlitchColorVis() {
    if (!glColorChks || !glColorChks.tint) return;
    const show = (row, on) => { if (row) row.style('display', on ? 'flex' : 'none'); };
    show(glTintRow,      glColorChks.tint.checked());
    show(glShiftRow,     glColorChks.chromatic.checked());
    show(glLvlRow,       glColorChks.posterize.checked());
    show(glBandScaleRow, glColorChks.bands.checked());
    show(glBandSeedRow,  glColorChks.bands.checked());
}

// Edge tuning sliders only matter in the relevant mode: sample factor when "Modify edges"
// is on; scale/seed only drive the 'noise' mode.
function updateGlitchEdgesVis() {
    if (!glEdgesModeSelect) return;
    const noise  = glEdgesModeSelect.value() === 'noise';
    const sample = glEdgesSampleChk && glEdgesSampleChk.checked();
    if (glSfRow)        glSfRow.style('display', sample ? 'flex' : 'none');
    if (glEdgeScaleRow) glEdgeScaleRow.style('display', noise ? 'flex' : 'none');
    if (glEdgeSeedRow)  glEdgeSeedRow.style('display', noise ? 'flex' : 'none');
}

// ─── Glitch Options section ───────────────────────────────────────────────────

function createGlitchOptionsSection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let section = createDiv('').parent(parent).class('color-section');
    let header  = createDiv('').parent(section).class('color-section-header');
    let toggle  = createSpan('▶').parent(header).class('color-toggle');
    createSpan(' Glitch Styling').parent(header);

    let content = createDiv('').parent(section).class('color-content collapsed').style('max-height', '0px');

    header.mousePressed(() => {
        if (content.hasClass('collapsed')) {
            content.removeClass('collapsed');
            content.style('max-height', '3000px');
            toggle.html('▼');
        } else {
            content.addClass('collapsed');
            content.style('max-height', '0px');
            toggle.html('▶');
        }
    });

    // Collapsible sub-section (accordion). Returns its body div so callers parent their
    // controls into it — keeps each group tidy and independently expandable.
    function subSection(title, openByDefault = false) {
        let sub  = createDiv('').parent(content).class('gl-sub');
        let head = createDiv('').parent(sub).class('gl-sub-header');
        let tog  = createSpan(openByDefault ? '▾' : '▸').parent(head).class('gl-sub-toggle');
        createSpan(title).parent(head);
        let body = createDiv('').parent(sub).class('gl-sub-content' + (openByDefault ? '' : ' collapsed'));
        head.mousePressed(() => {
            const collapsed = body.hasClass('collapsed');
            body.toggleClass('collapsed');
            tog.html(collapsed ? '▾' : '▸');
        });
        return body;
    }

    // slider row — parents into a sub-section body (defaults to the panel content)
    function sliderRow(label, min, max, def, step, parentEl) {
        let row = createDiv('').parent(parentEl || content).class('slider-row');
        createSpan(label).parent(row).class('slider-label');
        let cont = createDiv('').parent(row).class('slider-container');
        let sl = createSlider(min, max, def, step).parent(cont).class('form-slider');
        let lbl = createSpan(String(def)).parent(cont).class('slider-value');
        return { sl, lbl, row };
    }

    // dropdown row — options are 'name' or ['name','value']
    function selectRow(label, options, parentEl) {
        let row = createDiv('').parent(parentEl || content).class('slider-row');
        createSpan(label).parent(row).class('slider-label');
        let group = createDiv('').parent(row).class('form-group').style('flex:1; margin-bottom:0;');
        let sel = createSelect().parent(group).class('form-select');
        options.forEach(o => Array.isArray(o) ? sel.option(o[0], o[1]) : sel.option(o));
        return sel;
    }

    // ── Target & global output (always visible) ────────────────────────────────
    glitchTargetSel = selectRow('Target', [['Image','image'], ['Title','title']]);
    glitchTargetSel.changed(() => syncGlitchUI(getActiveGlitchOpts()));

    let blur = sliderRow('Blur', 0, 20, 0, 0.5);
    glBlurSlider = blur.sl; glBlurLabel = blur.lbl;
    glBlurSlider.input(() => {
        const v = parseFloat(glBlurSlider.value()); glBlurLabel.html(v.toFixed(1));
        getActiveGlitchOpts().blur = v; refreshGlitchCache();
    });

    // ── Sides ───────────────────────────────────────────────────────────────────
    let sidesBody = subSection('Sides', true);
    let sidesRow = createDiv('').parent(sidesBody).style('display:flex; gap:12px; flex-wrap:wrap;');
    glSideLeft   = createCheckbox('Left',   false).parent(sidesRow).class('checkbox-input');
    glSideRight  = createCheckbox('Right',  false).parent(sidesRow).class('checkbox-input');
    glSideTop    = createCheckbox('Top',    false).parent(sidesRow).class('checkbox-input');
    glSideBottom = createCheckbox('Bottom', false).parent(sidesRow).class('checkbox-input');
    [glSideLeft, glSideRight, glSideTop, glSideBottom].forEach(chk => chk.changed(() => {
        const o = getActiveGlitchOpts();
        o.sides = { left: glSideLeft.checked(), right: glSideRight.checked(),
                    top: glSideTop.checked(), bottom: glSideBottom.checked() };
        refreshGlitchCache();
    }));

    // ── Wave ─────────────────────────────────────────────────────────────────────
    let waveBody = subSection('Wave');
    glTypeSelect = selectRow('Type', ['none','noise','sine','square','sawtooth'], waveBody);
    glTypeSelect.changed(() => { getActiveGlitchOpts().type = glTypeSelect.value(); refreshGlitchCache(); });

    let amp = sliderRow('Amplitude', 0, 300, 50, 1, waveBody);
    glAmpSlider = amp.sl; glAmpLabel = amp.lbl;
    glAmpSlider.input(() => {
        const v = glAmpSlider.value(); glAmpLabel.html(v);
        getActiveGlitchOpts().amp = parseInt(v); refreshGlitchCache();
    });

    let sc = sliderRow('Scale', 0, 0.1, 0.005, 0.001, waveBody);
    glScaleSlider = sc.sl; glScaleLabel = sc.lbl;
    glScaleSlider.input(() => {
        const v = parseFloat(glScaleSlider.value()); glScaleLabel.html(v.toFixed(3));
        getActiveGlitchOpts().scale = v; refreshGlitchCache();
    });

    let symRow = createDiv('').parent(waveBody);
    glSymChk = createCheckbox('Symmetrical', false).parent(symRow).class('checkbox-input');
    glSymChk.changed(() => { getActiveGlitchOpts().symmetrical = glSymChk.checked(); refreshGlitchCache(); });

    // ── Color ────────────────────────────────────────────────────────────────────
    let colorBody = subSection('Color');
    const ALL_MODES = ['invert','tint','rainbow','chromatic','posterize','fade','glow','bloom','scanlines','bands'];
    let modesGrid = createDiv('').parent(colorBody).style('display:grid; grid-template-columns:1fr 1fr; gap:2px 8px; margin-bottom:12px;');
    glColorChks = {};
    ALL_MODES.forEach(m => {
        let chk = createCheckbox(m, false).parent(modesGrid).class('checkbox-input');
        chk.changed(() => {
            const active = ALL_MODES.filter(n => glColorChks[n].checked());
            const o = getActiveGlitchOpts();
            if (!o.color) o.color = {};
            o.color.mode = active.length ? active.join('+') : 'none';
            updateGlitchColorVis();
            refreshGlitchCache();
        });
        glColorChks[m] = chk;
    });

    let amt = sliderRow('Amount', 0, 1, 1, 0.01, colorBody);
    glColorAmtSlider = amt.sl; glColorAmtLabel = amt.lbl;
    glColorAmtSlider.input(() => {
        const v = parseFloat(glColorAmtSlider.value()); glColorAmtLabel.html(v.toFixed(2));
        const o = getActiveGlitchOpts(); if(!o.color) o.color = {};
        o.color.amount = v; refreshGlitchCache();
    });

    glTintRow = createDiv('').parent(colorBody).class('color-row');
    createSpan('Tint').parent(glTintRow).class('color-label');
    glColorTint = createColorPicker('#ff3cb4').parent(glTintRow).class('color-picker');
    glColorTint.input(() => {
        const o = getActiveGlitchOpts(); if(!o.color) o.color = {};
        o.color.tint = hexToRgbArr(glColorTint.value()); refreshGlitchCache();
    });

    let shift = sliderRow('Chr. Shift', 0, 120, 60, 1, colorBody);
    glColorShiftSlider = shift.sl; glColorShiftLabel = shift.lbl; glShiftRow = shift.row;
    glColorShiftSlider.input(() => {
        const v = parseInt(glColorShiftSlider.value()); glColorShiftLabel.html(v);
        const o = getActiveGlitchOpts(); if(!o.color) o.color = {};
        o.color.shift = v; refreshGlitchCache();
    });

    let lvl = sliderRow('Post. Levels', 2, 20, 4, 1, colorBody);
    glColorLvlSlider = lvl.sl; glColorLvlLabel = lvl.lbl; glLvlRow = lvl.row;
    glColorLvlSlider.input(() => {
        const v = parseInt(glColorLvlSlider.value()); glColorLvlLabel.html(v);
        const o = getActiveGlitchOpts(); if(!o.color) o.color = {};
        o.color.levels = v; refreshGlitchCache();
    });

    let bsc = sliderRow('Band Scale', 0.001, 0.2, 0.05, 0.001, colorBody);
    glColorBandScaleSlider = bsc.sl; glColorBandScaleLabel = bsc.lbl; glBandScaleRow = bsc.row;
    glColorBandScaleSlider.input(() => {
        const v = parseFloat(glColorBandScaleSlider.value()); glColorBandScaleLabel.html(v.toFixed(3));
        const o = getActiveGlitchOpts(); if(!o.color) o.color = {};
        o.color.bandScale = v; refreshGlitchCache();
    });

    let bsd = sliderRow('Band Seed', 0, 100, 0, 0.1, colorBody);
    glColorBandSeedSlider = bsd.sl; glColorBandSeedLabel = bsd.lbl; glBandSeedRow = bsd.row;
    glColorBandSeedSlider.input(() => {
        const v = parseFloat(glColorBandSeedSlider.value()); glColorBandSeedLabel.html(v.toFixed(1));
        const o = getActiveGlitchOpts(); if(!o.color) o.color = {};
        o.color.bandSeed = v; refreshGlitchCache();
    });

    // ── Warp ─────────────────────────────────────────────────────────────────────
    let warpBody = subSection('Warp');
    function warpSlider(label, max, def, key) {
        let { sl, lbl } = sliderRow(label, 0, max, def, 1, warpBody);
        sl.input(() => {
            const v = parseInt(sl.value()); lbl.html(v);
            const o = getActiveGlitchOpts(); if(!o.warp) o.warp = {};
            if (v === 0) delete o.warp[key]; else o.warp[key] = v;
            refreshGlitchCache();
        });
        return { sl, lbl };
    }

    let mos  = warpSlider('Mosaic', 50,  0, 'mosaic');
    let she  = warpSlider('Shear',  100, 0, 'shear');
    let ech  = warpSlider('Echo',   100, 0, 'echo');
    let haz  = warpSlider('Haze',   50,  0, 'haze');
    glWarpMosaicSlider = mos.sl; glWarpMosaicLabel = mos.lbl;
    glWarpShearSlider  = she.sl; glWarpShearLabel  = she.lbl;
    glWarpEchoSlider   = ech.sl; glWarpEchoLabel   = ech.lbl;
    glWarpHazeSlider   = haz.sl; glWarpHazeLabel   = haz.lbl;

    let band = sliderRow('Band Size', 8, 64, 24, 2, warpBody);
    glWarpBandSlider = band.sl; glWarpBandLabel = band.lbl;
    glWarpBandSlider.input(() => {
        const v = parseInt(glWarpBandSlider.value()); glWarpBandLabel.html(v);
        const o = getActiveGlitchOpts(); if(!o.warp) o.warp = {};
        o.warp.band = v; refreshGlitchCache();
    });

    // ── Edges ────────────────────────────────────────────────────────────────────
    let edgesBody = subSection('Edges');
    glEdgesModeSelect = selectRow('Mode', ['noise','random'], edgesBody);
    glEdgesModeSelect.changed(() => {
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        o.edges.mode = glEdgesModeSelect.value();
        updateGlitchEdgesVis();
        refreshGlitchCache();
    });

    let sampleRow = createDiv('').parent(edgesBody).style('margin-bottom:8px;');
    glEdgesSampleChk = createCheckbox('Modify edges', false).parent(sampleRow).class('checkbox-input');
    glEdgesSampleChk.changed(() => {
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        o.edges.sample = glEdgesSampleChk.checked();
        updateGlitchEdgesVis();
        refreshGlitchCache();
    });

    let commonColorsRow = createDiv('').parent(edgesBody).style('margin-bottom:8px;');
    glEdgesCommonColorsChk = createCheckbox('Use common colors', false).parent(commonColorsRow).class('checkbox-input');
    glEdgesCommonColorsChk.changed(() => {
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        if (glEdgesCommonColorsChk.checked()) {
            o.edges.colors = cachedOriginalImage ? getPopularColors(cachedOriginalImage, 3) : [];
        } else {
            o.edges.colors = [];
        }
        refreshGlitchCache();
    });

    let sf = sliderRow('Sample Factor', 0, 1, 0.5, 0.01, edgesBody);
    glEdgesSfSlider = sf.sl; glEdgesSfLabel = sf.lbl; glSfRow = sf.row;
    glEdgesSfSlider.input(() => {
        const v = parseFloat(glEdgesSfSlider.value()); glEdgesSfLabel.html(v.toFixed(2));
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        o.edges.sampleFactor = v; refreshGlitchCache();
    });

    let esc = sliderRow('Edge Scale', 0, 0.2, 0.05, 0.001, edgesBody);
    glEdgesScaleSlider = esc.sl; glEdgesScaleLabel = esc.lbl; glEdgeScaleRow = esc.row;
    glEdgesScaleSlider.input(() => {
        const v = parseFloat(glEdgesScaleSlider.value()); glEdgesScaleLabel.html(v.toFixed(3));
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        o.edges.scale = v; refreshGlitchCache();
    });

    let esd = sliderRow('Edge Seed', 0, 100, 0, 0.1, edgesBody);
    glEdgesSeedSlider = esd.sl; glEdgesSeedLabel = esd.lbl; glEdgeSeedRow = esd.row;
    glEdgesSeedSlider.input(() => {
        const v = parseFloat(glEdgesSeedSlider.value()); glEdgesSeedLabel.html(v.toFixed(1));
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        o.edges.seed = v; refreshGlitchCache();
    });

    let eoff = sliderRow('Col Offset', 0, 100, 0, 1, edgesBody);
    glEdgesOffsetSlider = eoff.sl; glEdgesOffsetLabel = eoff.lbl;
    glEdgesOffsetSlider.input(() => {
        const v = parseInt(glEdgesOffsetSlider.value()); glEdgesOffsetLabel.html(v + '%');
        const o = getActiveGlitchOpts(); if(!o.edges) o.edges = {};
        o.edges.offset = v / 100; refreshGlitchCache();
    });

    // seed the controls with the current Image glitch opts
    syncGlitchUI(glitchOpts);
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
    maxTextboxWidthSlider = createSlider(100, 1080, 500, 10).parent(maxWidthContainer).class('form-slider');
    maxTextboxWidthLabel = createSpan('500').parent(maxWidthContainer).class('slider-value');

    // Initially disable
    maxTextboxWidthSlider.attribute('disabled', '');
    maxTextboxWidthSlider.addClass('disabled');

    maxTextboxWidthSlider.input(() => {
        if (!selectedTextBox || selectedTextBox.id === 'tracks' || selectedTextBox.id === 'image') return;
        let value = maxTextboxWidthSlider.value();
        maxTextboxWidthLabel.html(value);
        maxTextboxWidths[selectedTextBox.id] = value;

        // keep the unified textbox panel's width control in sync
        let sapWidth = select('#sap-width-slider');
        if (sapWidth) { sapWidth.value(value); select('#sap-width-display').html(value); }

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

    let showTrackNumbersCheckboxRow = createDiv('').parent(advancedContent).style('margin-top: 12px;');
    showTrackNumbersCheckbox = createCheckbox('Show Track Numbers', true).parent(showTrackNumbersCheckboxRow).class('checkbox-input');
    showTrackNumbersCheckbox.changed(() => {
        captureState();
        if (albumData && currentView === 'ratings') printAlbum();
    });

    // Download scope — which screens the image download button exports
    let downloadScopeRow = createDiv('').parent(advancedContent).class('form-group').style('margin-top: 12px;');
    createElement('label', 'Download Images').parent(downloadScopeRow);
    downloadImageSelect = createSelect().parent(downloadScopeRow).class('form-select');
    downloadImageSelect.option('Both', 'both');
    downloadImageSelect.option('Only Cover', 'cover');
    downloadImageSelect.option('Only Ratings', 'ratings');
    downloadImageSelect.selected(downloadImageOption);
    downloadImageSelect.changed(() => {
        downloadImageOption = downloadImageSelect.value();
        captureState();
    });

    // Reset button
    createButton('Reset Advanced Options').parent(advancedContent).class('btn btn-secondary').style('margin-top', '12px').mousePressed(() => {
        imageSizeMultiplier = 1.0;
        imageSizeMultiplierSlider.value(1.0);
        imageSizeMultiplierLabel.html('1.0x');

        automaticAlignmentCheckbox.checked(true);

        downloadImageOption = 'both';
        if (downloadImageSelect) downloadImageSelect.selected('both');

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

// ---- Provider config: everything that differs between APIs lives here ----
// To add another provider (Gemini, Mistral, etc.) just add an entry below.
const AI_PROVIDERS = {
    openai: {
        label: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        // Adjust these to whatever model strings you actually have access to.
        models: ['gpt-5-mini', 'gpt-5-nano', 'gpt-4.1-mini', 'gpt-4o-mini'],
        defaultModel: (typeof IA_MODEL !== 'undefined' ? IA_MODEL : 'gpt-5-mini'),
        buildHeaders: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        }),
        buildBody: (model, prompt) => JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }]
        }),
        parseResponse: (data) => data.choices[0].message.content
    },
    anthropic: {
        label: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        // Verify these against Anthropic's current model strings.
        models: ['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8'],
        defaultModel: 'claude-haiku-4-5',
        buildHeaders: (key) => ({
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            // Required for calling Anthropic directly from a browser (CORS).
            'anthropic-dangerous-direct-browser-access': 'true'
        }),
        buildBody: (model, prompt) => JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        }),
        parseResponse: (data) => data.content[0].text
    }
};

function createIASection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let iaSection = createDiv('').parent(parent).class('color-section');
    let iaHeader = createDiv('').parent(iaSection).class('color-section-header');
    let iaToggle = createSpan('▶').parent(iaHeader).class('color-toggle');
    createSpan(' AI Space ').parent(iaHeader);
    let iaContent = createDiv('').parent(iaSection).class('color-content collapsed');

    iaHeader.mousePressed(() => {
        if (iaContent.hasClass('collapsed')) {
            iaContent.removeClass('collapsed');
            iaToggle.html('▼');
        }
        else {
            iaContent.addClass('collapsed');
            iaToggle.html('▶');
        }
    });

    // ---- Provider / key / model state (persisted per provider) ----
    let aiProvider = localStorage.getItem('aiProvider') || 'openai';

    // Per-provider keys. Note the migration from the old single-key format.
    let apiKeys = {
        openai: localStorage.getItem('apiKey_openai') || localStorage.getItem('openAIApiKey') || '',
        anthropic: localStorage.getItem('apiKey_anthropic') || ''
    };
    // One-time migration of the legacy key, then drop the old entry.
    if (!localStorage.getItem('apiKey_openai') && localStorage.getItem('openAIApiKey')) {
        localStorage.setItem('apiKey_openai', localStorage.getItem('openAIApiKey'));
        localStorage.removeItem('openAIApiKey');
    }

    let aiModels = {
        openai: localStorage.getItem('aiModel_openai') || AI_PROVIDERS.openai.defaultModel,
        anthropic: localStorage.getItem('aiModel_anthropic') || AI_PROVIDERS.anthropic.defaultModel
    };

    // ---- Provider selector ----
    let providerRow = createDiv('').parent(iaContent).class('form-group');
    createElement('label', 'AI Provider').parent(providerRow);
    let providerSelect = createSelect().parent(providerRow).class('form-select');
    for (let id in AI_PROVIDERS) providerSelect.option(AI_PROVIDERS[id].label, id);
    providerSelect.selected(aiProvider);
    providerSelect.style('margin-bottom', '15px');

    // ---- API key input ----
    let apiKeyRow = createDiv('').parent(iaContent).class('form-group');
    let apiKeyLabel = createElement('label', 'API Key').parent(apiKeyRow);
    let apiKeyInput = createInput('').parent(apiKeyRow).class('form-input').attribute('type', 'password');
    apiKeyInput.style('margin-bottom', '15px');

    let saveApiKeyCheckbox = createCheckbox('Save API Key in Local Storage', true).parent(apiKeyRow).class('checkbox-input');
    saveApiKeyCheckbox.style('margin-bottom', '15px');

    // ---- Model selector ----
    let modelRow = createDiv('').parent(iaContent).class('form-group');
    createElement('label', 'Model').parent(modelRow);
    let modelSelect = createSelect().parent(modelRow).class('form-select');
    modelSelect.style('margin-bottom', '15px');

    // (Re)build the model options for the current provider.
    function populateModelSelect() {
        modelSelect.elt.innerHTML = '';
        let provider = AI_PROVIDERS[aiProvider];
        let saved = aiModels[aiProvider];
        let list = provider.models.slice();
        // Preserve a custom/saved model that isn't in the predefined list.
        if (saved && !list.includes(saved)) list.unshift(saved);
        for (let m of list) {
            let label = (m === provider.defaultModel) ? m + ' [RECOMMENDED]' : m;
            modelSelect.option(label, m);
        }
        modelSelect.selected(saved || provider.defaultModel);
    }


    // Keep the visible inputs in sync with the selected provider.
    function refreshProviderUI() {
        apiKeyLabel.html(AI_PROVIDERS[aiProvider].label + ' API Key');
        apiKeyInput.value(apiKeys[aiProvider] || '');
        populateModelSelect();
    }
    refreshProviderUI();

    providerSelect.changed(() => {
        aiProvider = providerSelect.value();
        localStorage.setItem('aiProvider', aiProvider);
        refreshProviderUI();
    });

    apiKeyInput.input(() => {
        apiKeys[aiProvider] = apiKeyInput.value().trim();
        if (saveApiKeyCheckbox.checked() && apiKeys[aiProvider]) {
            localStorage.setItem('apiKey_' + aiProvider, apiKeys[aiProvider]);
        }
    });

    saveApiKeyCheckbox.changed(() => {
        if (!saveApiKeyCheckbox.checked()) {
            localStorage.removeItem('apiKey_' + aiProvider);
        } else if (apiKeys[aiProvider]) {
            localStorage.setItem('apiKey_' + aiProvider, apiKeys[aiProvider]);
        }
    });

    modelSelect.changed(() => {
        aiModels[aiProvider] = modelSelect.value();
        localStorage.setItem('aiModel_' + aiProvider, aiModels[aiProvider]);
    });

    // ---- Single entry point for all AI calls ----
    async function callAI(prompt) {
        const provider = AI_PROVIDERS[aiProvider];
        const key = apiKeys[aiProvider];
        const model = (aiModels[aiProvider] || provider.defaultModel).trim();

        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: provider.buildHeaders(key),
            body: provider.buildBody(model, prompt)
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || 'API error');
        return provider.parseResponse(data).trim();
    }

    function requireKey() {
        if (!apiKeys[aiProvider]) {
            showToast(`Please enter your ${AI_PROVIDERS[aiProvider].label} API key first`, true);
            return false;
        }
        return true;
    }

    // Some models wrap JSON in ```json fences despite being told not to.
    function stripFences(s) {
        return s.replace(/```(?:json)?/gi, '').trim();
    }

    // ---- Prompts ----
    const promptFixGrammar = "fix any grammar or syntax mistakes or anything that is awkard but do not change it a lot. Only respond with the fixed text without any additional commentary. Here is the text: ";

    const promptGenerateAlbumInfo = `Return album metadata as a JSON object with no extra text or markdown.
Format (placeholders, do not copy these values):
{"year":"<release year as string>","artist":"<performing artist>","genre":"<genre 1>, <genre 2>"}

Rules:
- genre must be exactly two genres, comma-separated.
- If the album name is ambiguous, pick the most famous match.
- Set a field to "unknown" only if you truly have no idea. Answer well-known albums confidently.

Album: {albumName}`;

    const promptGenerateDescription = `You are a music database. Given an album name and its metadata, return a short description of the album in 2-3 sentences. Do not add asterisks or any other formatting. Do not include the album name or its year as that information is already known. Focus on the music, the artist, and the genre. If you don't know the album, return "unknown".`;

    // ---- Button: fix description grammar ----
    let generateFunFactRow = createDiv('').parent(iaContent).class('form-group');
    let generateFunFactButton = createButton('Fix description grammar').parent(generateFunFactRow).class('btn btn-secondary');
    generateFunFactButton.mousePressed(async () => {
        if (!requireKey()) return;
        if (!albumData || !albumData.funfact) {
            showToast('Album description not found', true);
            return;
        }
        generateFunFactButton.attribute('disabled', '');
        generateFunFactButton.html('Generating...');
        try {
            let funFact = await callAI(promptFixGrammar + albumData.funfact);
            setField('funfact', funFact);
            showToast('Description grammar fixed successfully');
        } catch (error) {
            console.error('Error fixing grammar:', error);
            showToast('Error fixing grammar', true);
        } finally {
            generateFunFactButton.removeAttribute('disabled');
            generateFunFactButton.html('Fix description grammar');
        }
    });

    // ---- Button: fill year / artist / genre from the album name ----
    let generateAlbumInfoRow = createDiv('').parent(iaContent).class('form-group');
    let generateAlbumInfoButton = createButton('Fill album info').parent(generateAlbumInfoRow).class('btn btn-secondary');
    generateAlbumInfoButton.mousePressed(async () => {
        if (!requireKey()) return;
        if (!albumData || !albumData.title) {
            showToast('Album name not found', true);
            return;
        }
        generateAlbumInfoButton.attribute('disabled', '');
        generateAlbumInfoButton.html('Generating...');
        try {
            let prompt = promptGenerateAlbumInfo.replace('{albumName}', albumData.title);
            if (albumData.artist) prompt += ` The artist is "${albumData.artist}".`;
            if (albumData.year)   prompt += ` The year is "${albumData.year}".`;
            if (albumData.genre)  prompt += ` The genre is "${albumData.genre}".`;

            let content = await callAI(prompt);
            if (content === 'unknown') {
                showToast('No information found for this album', true);
                return;
            }

            let albumInfo = JSON.parse(stripFences(content));
            if (albumInfo.year === 'unknown' && albumInfo.artist === 'unknown' && albumInfo.genre === 'unknown') {
                showToast('No information found for this album', true);
                return;
            }
            setField('year', albumInfo.year);
            setField('artist', albumInfo.artist);
            let genres = albumInfo.genre.split(',')
                .map(g => g.trim())
                .map(g => g.charAt(0).toUpperCase() + g.slice(1))
                .join(', ');
            setField('genre', genres);

            showToast('Album info filled successfully');
        }
        catch (error) {
            console.error('Error generating album info:', error);
            showToast('Error generating album info', true);
        }
        finally {
            generateAlbumInfoButton.removeAttribute('disabled');
            generateAlbumInfoButton.html('Fill album info');
        }
    });

    // ---- Button: generate a description ----
    let generateDescriptionRow = createDiv('').parent(iaContent).class('form-group');
    let generateDescriptionButton = createButton('Generate description').parent(generateDescriptionRow).class('btn btn-secondary');
    generateDescriptionButton.mousePressed(async () => {
        if (!requireKey()) return;
        if (!albumData || !albumData.title) {
            showToast('Please fill the album name field first', true);
            return;
        }
        if (!albumData.artist) {
            showToast('Please fill the artist field first', true);
            return;
        }
        generateDescriptionButton.attribute('disabled', '');
        generateDescriptionButton.html('Generating...');
        try {
            let prompt = promptGenerateDescription +
                ` Album name: ${albumData.title}. Year: ${albumData.year || 'unknown'}. Artist: ${albumData.artist}. Genre: ${albumData.genre || 'unknown'}.`;
            let description = await callAI(prompt);
            if (description === 'unknown') {
                showToast('No description found for this album', true);
                return;
            }
            setField('funfact', description);
            showToast('Description generated successfully');
        }
        catch (error) {
            console.error('Error generating description:', error);
            showToast('Error generating description', true);
        }
        finally {
            generateDescriptionButton.removeAttribute('disabled');
            generateDescriptionButton.html('Generate description');
        }
    });
}


function setField(fieldName, value) {
    if (!albumData) return;
    albumData[fieldName] = value;
    if (fieldName === 'funfact') {
        funfactInput.value(value);
    }
    else if (fieldName === 'year') {
        yearInput.value(value);
    }
    else if (fieldName === 'artist') {
        artistInput.value(value);
    }
    else if (fieldName === 'genre') {
        genreInput.value(value);
    }
    autoGeneratePreview();
    captureState();
}

function addCustomTextbox(tbData) {
    let id = 'custom_' + Date.now();
    let textbox = {
        id: tbData.id || id,
        text: tbData.text || '',
        x: tbData.x != undefined ? tbData.x : 100,
        y: tbData.y != undefined ? tbData.y : 100,
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
    textarea.elt.addEventListener('focus', () => selectTextBoxById(textbox.id));
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

// Unified floating panel shown when ANY textbox (predefined or custom) is selected.
// Every control uses the same widget for both textbox types; controls that don't
// apply to a given type (e.g. Font/Color for predefined boxes) are simply hidden.
function createSizeAdjustPanel() {
    sizeAdjustPanel = createDiv('').id('size-adjust-panel');

    // --- Size (stepper) — every textbox ---
    let sizeGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group').id('sap-size');
    createSpan('Size').parent(sizeGroup).class('sap-label');
    createButton('−').parent(sizeGroup).class('sap-btn').mousePressed(() => adjustTextSize(-2));
    createSpan('0').parent(sizeGroup).id('sap-size-display').class('sap-value');
    createButton('+').parent(sizeGroup).class('sap-btn').mousePressed(() => adjustTextSize(2));

    // --- Leading (stepper) — funfact + custom ---
    let leadingGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group').id('sap-leading');
    createSpan('Leading').parent(leadingGroup).class('sap-label');
    createButton('−').parent(leadingGroup).class('sap-btn').mousePressed(() => adjustTextLeading(-2));
    createSpan('0').parent(leadingGroup).id('sap-leading-display').class('sap-value');
    createButton('+').parent(leadingGroup).class('sap-btn').mousePressed(() => adjustTextLeading(2));

    // --- Width (slider) — every text box ---
    let widthGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group').id('sap-width');
    createSpan('Width').parent(widthGroup).class('sap-label');
    let widthSlider = createSlider(100, 1080, 500, 10).parent(widthGroup).id('sap-width-slider').class('sap-slider');
    createSpan('500').parent(widthGroup).id('sap-width-display').class('sap-value');
    widthSlider.input(() => {
        if (!selectedTextBox) return;
        let value = widthSlider.value();
        if (selectedTextBox.isCustom) {
            let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
            if (textbox) textbox.maxWidth = value;
        } else {
            maxTextboxWidths[selectedTextBox.id] = value;
            updateMaxTextboxWidthSlider(); // keep the Advanced Options slider in sync
        }
        select('#sap-width-display').html(value);
        autoGeneratePreview();
    });
    widthSlider.changed(() => captureState());

    // --- Font (select) — custom only ---
    let fontGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group').id('sap-font');
    createSpan('Font').parent(fontGroup).class('sap-label');
    let fontSelect = createSelect().parent(fontGroup).id('sap-font-select').class('form-select');
    ['fontHeavy', 'fontLight', 'fontRegular', 'fontRegularCondensed', 'fontRegularItalic', 'fontRegularCrammed'].forEach(f => fontSelect.option(f));
    fontSelect.changed(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) { textbox.fontType = fontSelect.value(); autoGeneratePreview(); captureState(); }
    });

    // --- Color (picker) — custom only ---
    let colorGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group').id('sap-color');
    createSpan('Color').parent(colorGroup).class('sap-label');
    let colorPicker = createColorPicker('#ffffff').parent(colorGroup).id('sap-color-picker').class('color-picker');
    colorPicker.input(() => {
        if (!selectedTextBox || !selectedTextBox.isCustom) return;
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) { textbox.color = colorPicker.value(); autoGeneratePreview(); }
    });
    colorPicker.changed(() => captureState());

    // --- Align (select) — every textbox ---
    let alignGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group').id('sap-align');
    createSpan('Align').parent(alignGroup).class('sap-label');
    let alignSelect = createSelect().parent(alignGroup).id('sap-align-select').class('form-select');
    ['left', 'center', 'right', 'justify'].forEach(a => alignSelect.option(a));
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

    // --- Actions (reset + close) — every textbox ---
    let actionsGroup = createDiv('').parent(sizeAdjustPanel).class('sap-group sap-actions');
    createButton('↻').parent(actionsGroup).class('sap-btn sap-btn-reset').mousePressed(resetTextBoxToDefault);
    createButton('✕').parent(actionsGroup).class('sap-btn sap-btn-close').mousePressed(() => {
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
    if (tracksAdjustPanel) tracksAdjustPanel.style('display', 'none');
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
    if (tracksAdjustPanel) tracksAdjustPanel.style('display', 'none');
    updateVerticalOffsetSlider();
    delete glitchImageCache['coverTitle'];
    delete glitchImageCache['ratingsTitle'];
    if (albumData) currentView === 'ratings' ? printAlbum() : printCoverScreen();
    updateVisibilityCustomTextBoxesUI()
}

async function downloadBothImages() {
    let tracksData = collectTracksData();
    albumData = collectAlbumData(tracksData);
    if (!albumData.imageUrl) return;

    let baseFileName = getBaseFileName();
    let mime = 'image/' + (currentImageFormat === 'jpg' ? 'jpeg' : currentImageFormat);
    let downloadRatings = downloadImageOption !== 'cover';
    let downloadCover = downloadImageOption !== 'ratings';

    // Crop the current canvas to the export height and trigger a download
    let exportCurrentCanvas = (exportHeight, suffix) => {
        let tempCanvas = createGraphics(WIDTH, exportHeight);
        tempCanvas.image(get(0, 0, WIDTH, exportHeight), 0, 0);
        let link = document.createElement('a');
        link.download = baseFileName + ' - ' + suffix + '.' + currentImageFormat;
        link.href = tempCanvas.canvas.toDataURL(mime);
        link.click();
        tempCanvas.remove();
    };

    showGreenRectangle = false; // Hide green rectangle for download

    if (downloadRatings) {
        await printAlbum();
        exportCurrentCanvas(aspectRatioOptions[currentAspectRatio].height, 'Ratings');
    }

    if (downloadCover) {
        await printCoverScreen();
        exportCurrentCanvas(aspectRatioOptions[currentAspectRatioCover].height, 'Cover');
    }

    showGreenRectangle = true; // Show it again

    // Restore the current view
    currentView === 'ratings' ? await printAlbum() : await printCoverScreen();
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

    setupTrackDragAndDrop(rowDiv);

    // Selecting a track (click anywhere on the row, or focusing its title) reveals its button row
    rowDiv.elt.addEventListener('mousedown', () => selectTrackRowUI(rowDiv));

    // Add drag handle
    let dragHandle = createSpan('⋮⋮').parent(rowDiv).class('track-drag-handle');
    dragHandle.attribute('draggable', 'true');

    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).class('track-number');

    makeNumberEditable(trackNumSpan, trackIndex);

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');
    titleIn.elt.addEventListener('input', autoGeneratePreview);
    titleIn.elt.addEventListener('focus', () => selectTrackRowUI(rowDiv));
    titleIn.elt.addEventListener('blur', captureState);
    titleIn.elt.addEventListener('keydown', (e) => handleTrackNavigation(e, titleIn));

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    selectableGradeOptions.forEach(grade => {
        gradeSelect.option(grade)
    });
    let options = gradeSelect.elt.options;
    for(let i = 0; i < selectableGradeOptions.length; i++) {
        options[i].style.backgroundColor = colorMap[selectableGradeOptions[i]];
        options[i].style.color = getContrastYIQ(colorMap[selectableGradeOptions[i]]);
    }
    gradeSelect.selected('STRONG');
    gradeSelect.changed(() => { autoGeneratePreview(); captureState(); });

    // Visibility is driven by the 'open' class (gated behind .track-row.selected in CSS),
    // not inline display, so these collapse with the rest of the row when deselected.
    let textInputContainer = createDiv('').parent(rowDiv).class('track-text-input-container');
    let textInput = createInput('').parent(textInputContainer).class('track-text-input')
    textInput.attribute('placeholder', 'Text inside rect...');
    textInput.elt.addEventListener('input', autoGeneratePreview);
    textInput.elt.addEventListener('blur', captureState);

    let textLargeInputContainer = createDiv('').parent(rowDiv).class('track-text-input-container');
    let textLargeInput = createInput('').parent(textLargeInputContainer).class('track-textLarge-input');
    textLargeInput.attribute('placeholder', 'Text below track...');
    textLargeInput.elt.addEventListener('input', autoGeneratePreview);
    textLargeInput.elt.addEventListener('blur', captureState);

    // Buttons row — always at the bottom
    let buttonsDiv = createDiv('').parent(rowDiv).class('track-buttons-row');

    // Interlude toggle — independent of the grade. When active the track renders as a
    // grey pill with a small grade-coloured dot on top.
    let interludeBtn = createButton('INT').parent(buttonsDiv).class('track-interlude-btn');
    interludeBtn.attribute('title', 'Toggle interlude');
    interludeBtn.mousePressed(() => {
        let t = tracks.find(tk => tk.rowDiv === rowDiv);
        if (!t) return;
        setTrackInterlude(t, !t.interlude);
        autoGeneratePreview();
        captureState();
    });

    let textBtn = createButton('T').parent(buttonsDiv).class('track-text-btn');
    textBtn.mousePressed(() => {
        let willOpen = !textInputContainer.hasClass('open');
        textInputContainer.toggleClass('open');
        if (willOpen) textInput.elt.focus();
    });

    let textLargeBtn = createButton('TT').parent(buttonsDiv).class('track-textLarge-btn');
    textLargeBtn.mousePressed(() => {
        let willOpen = !textLargeInputContainer.hasClass('open');
        textLargeInputContainer.toggleClass('open');
        if (willOpen) textLargeInput.elt.focus();
    });

    let removeBtn = createButton('×').parent(buttonsDiv).class('track-remove-btn');
    removeBtn.mousePressed(() => {
        let currentIndex = tracks.findIndex(t => t.rowDiv === rowDiv);
        if (currentIndex !== -1) removeTrackRow(currentIndex);
    });



    tracks.push({   titleInput: titleIn, gradeSelect, rowDiv, numSpan: trackNumSpan, customNumber: null, customText: null, customTextLarge: null,
                    textInput, textInputContainer, textLargeInput, textLargeInputContainer, dragHandle, interlude: false, interludeBtn });

    if (shouldCapture && historyStack.length > 0) captureState();
}

function getContrastYIQ(hexcolor) {
    if (!hexcolor || typeof hexcolor !== "string") {
        return "rgb(0,0,0)"; // fallback
    }

    if (!hexcolor.startsWith("#") || hexcolor.length < 7) {
        return "rgb(0,0,0)"; // fallback
    }

    hexcolor = hexcolor.replace('#', '');

    let r = parseInt(hexcolor.substr(0, 2), 16);
    let g = parseInt(hexcolor.substr(2, 2), 16);
    let b = parseInt(hexcolor.substr(4, 2), 16);

    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
}

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
    if (selectedTrackRow === tracks[index].rowDiv) selectedTrackRow = null;
    tracks[index].rowDiv.remove();
    tracks.splice(index, 1);
    updateTrackNumbers();
    captureState();
    autoGeneratePreview();
}

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
            interlude: track.interlude || false,
            customNumber: track.customNumber || null,
            customText: track.textInput ? track.textInput.value().trim() : null,
            customTextLarge: track.textLargeInput ? track.textLargeInput.value().trim() : null
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

/*
let tracksTextSize = 60;
let tracksSpacing = 0; // Added to base spacing calculation
let tracksRectHeight = 40;
*/

function downloadJSON() {
    let tracksData = collectTracksData();
    let jsonData = {
        album: {
            title: titleInput.value() || '',
            artist: artistInput.value() || '',
            year: yearInput.value() || '',
            runtime: '',
            genre: genreInput.value() || '',
            funfact: funfactInput.value() || '',
            tracks: tracksData,
            imageUrl: imageUrlInput.value() || '',
            albumGrade: albumGradeSelect.value(),
            customTextboxes: customTextboxes.map(t => ({
                id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
                fontType: t.fontType, color: t.color, viewType: t.viewType,
                textAlign: t.textAlign || 'left', leading: t.leading || 0, maxWidth: t.maxWidth || width - 100
            })),
            textSizeOffsets,
            textLeadingOffsets,
            verticalOffsetsRatings,
            verticalOffsetsCover,
            horizontalOffsetsRatings,
            horizontalOffsetsCover,
            imageSizeMultiplier,
            maxTextboxWidths,
            textAlignRatings,
            textAlignCover,
            aspectRatio: currentAspectRatio,
            aspectRatioCover: currentAspectRatioCover,
            imageFormat: currentImageFormat,
            downloadImageOption,
            tracksTextSize,
            tracksSpacing,
            tracksRectHeight,
            tracksTwoColumns,
            showGradeLegend,
            currentProfileName

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

    if(data.aspectRatioCover && aspectRatioOptions[data.aspectRatioCover]) {
        currentAspectRatioCover = data.aspectRatioCover;
        aspectRatioCoverSelect.selected(data.aspectRatioCover);
    }

    if (data.imageFormat) {
        currentImageFormat = data.imageFormat;
        imageFormatSelect.selected(data.imageFormat);
    }

    if (data.downloadImageOption) {
        downloadImageOption = data.downloadImageOption;
        if (downloadImageSelect) downloadImageSelect.selected(downloadImageOption);
    }

    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }

    if (data.tracks && data.tracks.length > 0) {
        data.tracks.forEach(track => {
            addTrackRow();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            // Migrate legacy data: an 'INTERLUDE' grade becomes interlude=true with no grade.
            let loadedGrade = track.grade || 'STRONG';
            let loadedInterlude = track.interlude || false;
            if (loadedGrade === 'INTERLUDE') { loadedInterlude = true; loadedGrade = 'None'; }
            lastTrack.gradeSelect.selected(loadedGrade);
            setTrackInterlude(lastTrack, loadedInterlude);
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber);
            }
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.addClass('open');
            }
            if (track.customTextLarge && track.customTextLarge.trim() !== '') {
                lastTrack.textLargeInput.value(track.customTextLarge);
                lastTrack.textLargeInputContainer.addClass('open');
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

    if(data.glitchOpts) glitchOpts = data.glitchOpts
    if(data.glitchOptsTitle) glitchOptsTitle = data.glitchOptsTitle
    if(glitchTargetSel) syncGlitchUI(getActiveGlitchOpts())

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
    if (data.tracksTwoColumns !== undefined) {
        tracksTwoColumns = data.tracksTwoColumns;
        if (tracksTwoColumnsCheckbox) tracksTwoColumnsCheckbox.checked(tracksTwoColumns);
    }
    if(data.currentProfileName) {
        currentProfileName = data.currentProfileName;
        if(profileSelect) profileSelect.selected(currentProfileName);
    }
}

function saveToLocalStorage() {
    let data = collectAlbumData(tracks.map(t => ({
        title: t.titleInput.value(),
        grade: t.gradeSelect.value(),
        interlude: t.interlude || false,
        customNumber: t.customNumber || null,
        customText: t.textInput ? t.textInput.value() : null,
        customTextLarge: t.textLargeInput ? t.textLargeInput.value() : null
    })));
    data.aspectRatio = currentAspectRatio;
    data.aspectRatioCover = currentAspectRatioCover;
    data.imageFormat = currentImageFormat;
    data.downloadImageOption = downloadImageOption;
    data.showGradeLegend = showGradeLegend;
    data.customTextboxes = customTextboxes.map(t => ({
        id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
        fontType: t.fontType, color: t.color, viewType: t.viewType,
        textAlign: t.textAlign || 'left', leading: t.leading || 0, maxWidth: t.maxWidth || width - 100
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
    data.tracksTwoColumns = tracksTwoColumns;
    data.textAlignRatings = {...textAlignRatings};
    data.textAlignCover = {...textAlignCover};
    data.glitchOpts = {...glitchOpts}
    data.glitchOptsTitle = {...glitchOptsTitle}
    localStorage.setItem('albumGeneratorData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    let savedData = localStorage.getItem('albumGeneratorData');
    if (savedData) {
        try {
            let parsedData = JSON.parse(savedData);
            fillFormFromData(parsedData);
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
    fill(100); textAlign(CENTER, CENTER); textSize(w * 0.15); _text('🖼', centerX, centerY - h * 0.1);
    textFont(fontLight); textSize(w * 0.06); fill(120); _text('No Image', centerX, centerY + h * 0.15);
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

function getMaxTextSizeByWidth(text, maxWidth, maxStartSize){
    let size = maxStartSize;
    textSize(size);
    while(textWidth(text) > maxWidth && size > 0){ size--; textSize(size); }
    return size;
}

function getMaxTextSizeByHeight(text, maxHeight, maxStartSize){
    let size = maxStartSize;
    textSize(size);
    while(textAscent() + textDescent() > maxHeight && size > 0){ size--; textSize(size); }
    return size;
}

// ============================================================
// Ratings view layout. Every position/size constant lives here.
// Values are canvas pixels unless the name says "Ratio"
// (fraction of the canvas width).
// ============================================================
const RATINGS_LAYOUT = {
    leftMargin: 50,

    cover: {
        xRatio: 0.05,
        y: 250,
        sizeRatio: 0.425,
        shadowBlur: 50,
    },

    header: {
        top: 130,                  // y of the title block
        rightColumnXRatio: 0.475,  // x of the artist/year/genre/funfact column
        shadowBlur: 20,
        title:  { maxFontSize: 100, leading: 70 },
        artist: { offsetY: 120, fontSize: 45, leading: 50 },
        // offsets below are measured from header.top + the artist block height
        year:    { offsetY: 145, fontSize: 38, leading: 60 },
        genre:   { offsetY: 195, fontSize: 30, leading: 40 },
        funfact: { offsetY: 280, fontSize: 30, leading: 40 },
    },

    tracks: {
        startY: 820,             // y of the first track row
        textIndent: { oneColumn: 295, twoColumns: 295 },         // title x relative to the left margin (single-column)
        titleIndent: { oneColumn: -15, twoColumns: 15 },
        pillWidthFactorOneColumn: 0.70,   // pill width as a fraction of (leftMargin + textIndent)
        pillWidthFactorTwoColumns: 0.85,    // pill width as a fraction of (columnShift + textIndent)
        columnShift: 450,        // x shift of the second column in two-column mode
        horizOffsetFix: 30,      // correction added to the user's horizontal offset
        titleMaxWidth: { oneColumn: 900, twoColumns: 240 },  // titles are truncated to this
        // row spacing shrinks as the track count grows, then user spacing is added
        rowSpacing: { fewTracks: 5, manyTracks: 20, max: 80, min: 45, cap: 70 },
        goatGlowBlur: 50,
        peakGlowBlur: 35,
        goatTitleGlowBlur: 20,
        // small label rendered inside the pill (track.customText)
        pillLabel: { maxFontSize: 28, widthPad: 20, heightSlack: 5, nudgeY: 2 },
        // larger note rendered below the row (track.customTextLarge)
        note: {
            x: { oneColumn: 90, twoColumns: 90 },  // left edge, from the canvas left edge
            maxWidth: { oneColumn: 900, twoColumns: 330 },
            fontSize: 22,
            topGap: 20,          // gap between the row baseline and the note
            bottomGap: 35,       // extra row spacing added below the note
            lineWeight: 7,       // vertical accent line next to the note
            lineInset: 15,       // accent line x, from the pill's left edge
        },
        // selection hitbox around the whole section
        hitbox: { padY: 50, rightExtent: 700 },
    },

    legend: {
        minGradeIndex: 4,     // always show at least GOAT..DECENT
        compactThreshold: 6,  // with more grades than this, shorten 'GOAT' to 'G'
        topPadding: 15,       // gap below the album cover
        gap: 12,
        cornerRadius: 20,
        labelMaxFontSize: { byWidth: 26, byHeight: 30 },
        labelWidthPad: 10,
        labelHeightSlack: 5,
        labelNudgeY: 2,
    },

    gradeBar: {
        height: 115,
        cornerRadius: 20,
        fontSize: 85,
        textYFactor: 0.57,   // vertical position of the grade text within the bar
        glowBlur: 30,
    },
};

async function printAlbum(){
    background(200);
    if (!albumData) return;
    let selectedId = selectedTextBox ? selectedTextBox.id : null;
    textBoxes = [];

    // Load the album art (cached after the first successful load)
    let hasImage = false, img, imgBW;
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

    // Blurred grayscale backdrop
    if (hasImage) { imageMode(CENTER); image(imgBW, width * 0.5, height * 0.5, height, height); }
    else background(50);
    imageMode(CORNER); rectMode(CORNER);

    let cover = drawAlbumCover(img, hasImage, false);

    drawAlbumHeader();
    drawCustomTextboxes('ratings');
    drawTrackList();

    let exportHeight = aspectRatioOptions[currentAspectRatio].height;
    if (showGradeLegend) drawGradeLegend(cover);
    if (albumData.albumGrade !== 'None') drawAlbumGradeBar(exportHeight);

    // Green outline showing the export area (hidden while downloading)
    if (showGreenRectangle) {
        push();
        noFill(); stroke(0, 255, 0); strokeWeight(4); rectMode(CORNER);
        rect(0, 0, WIDTH, exportHeight);
        pop();
    }

    // Outline the selected box
    if (selectedId) selectedTextBox = textBoxes.find(b => b.id === selectedId);
    if (selectedTextBox) {
        push();
        noFill(); stroke(138, 180, 248); strokeWeight(3); rectMode(CORNER);
        let padding = 5;
        rect(selectedTextBox.x - padding, selectedTextBox.y - padding, selectedTextBox.w + padding * 2, selectedTextBox.h + padding * 2, 5);
        pop();
    }
}

function drawAlbumCover(img, hasImage, drawGlitch = true) {
    const C = RATINGS_LAYOUT.cover;
    let x = width * C.xRatio + (horizontalOffsetsRatings.image || 0);
    let y = C.y + (verticalOffsetsRatings.image || 0);
    let size = width * C.sizeRatio * imageSizeMultiplier;

    utils.beginShadow("#000000", C.shadowBlur, 0, 0);
    if (hasImage) {
        rect(x + 1, y + 1, size - 2, size - 2); // backing rect so the shadow has a solid edge
        image(img, x, y, size, size);

        // createGlitchyImage returns a FULL-CANVAS image with the glitch already positioned
        // around the cover, where imgPos is the cover's CENTER (here x,y is the top-left
        // corner because imageMode is CORNER). So draw the result at (0,0) full size — don't
        // squish it into the size×size cover box.
        if (drawGlitch) {
            let center = { x: x + size / 2, y: y + size / 2 };
            let glitchOptsAux = {...glitchOpts, color: {...glitchOpts.color}}
            glitchOptsAux.sides = {left: false, right: false, top: false, bottom: false}
            glitchOptsAux.color.amount = 0.4
            let glitchedImg = getCachedGlitchyImage('ratingsImage', () => img, size, size, center, glitchOptsAux, albumData.imageUrl);
            imageMode(CORNER);
            image(glitchedImg, 0, 0, width, height);
        }
    }
    else drawImagePlaceholder(x, y, size, size, true);
    utils.endShadow();

    textBoxes.push({ id: 'image', x, y, w: size, h: size, sizeOffset: 0, currentSize: 0 });

    return { x, y, size };
}

function drawAlbumHeader() {
    const H = RATINGS_LAYOUT.header;
    const leftMargin = RATINGS_LAYOUT.leftMargin;
    let rightColX = leftMargin + width * H.rightColumnXRatio;

    utils.beginShadow("#000000", H.shadowBlur, 0, 0);

    let titleMaxWidth = maxTextboxWidths.title || defaultMaxTextboxWidths.title;
    textFont(fontHeavy);
    let ratingsTitleSize = getMaxTextSizeByWidth(albumData.title, titleMaxWidth, H.title.maxFontSize) + textSizeOffsets.title;
    drawTextWithBox('title', fontHeavy,
        ratingsTitleSize,
        albumData.title,
        leftMargin + (horizontalOffsetsRatings.title || 0),
        H.top + (verticalOffsetsRatings.title || 0),
        titleMaxWidth, H.title.leading, textAlignRatings.title || 'left', BOTTOM, false);

    drawStylizedText(fontHeavy,
        ratingsTitleSize,
        albumData.title,
        leftMargin + (horizontalOffsetsRatings.title || 0),
        H.top + (verticalOffsetsRatings.title || 0), textAlignRatings.title || 'left', BOTTOM, glitchOptsTitle, 'ratingsTitle')


    let artistMaxWidth = maxTextboxWidths.artist || defaultMaxTextboxWidths.artist;
    let artistBox = drawTextWithBox('artist', fontRegularCondensed,
        H.artist.fontSize + textSizeOffsets.artist,
        albumData.artist,
        rightColX + (horizontalOffsetsRatings.artist || 0),
        H.top + H.artist.offsetY + (verticalOffsetsRatings.artist || 0),
        artistMaxWidth, H.artist.leading, textAlignRatings.artist || 'left');

    // year / genre / funfact shift down with the artist block height
    let blockTop = H.top + artistBox.h;
    fill(230);

    let yearX = rightColX + (horizontalOffsetsRatings.year || 0);
    let yearY = blockTop + H.year.offsetY + (verticalOffsetsRatings.year || 0);
    let yearMaxWidth = maxTextboxWidths.year || defaultMaxTextboxWidths.year;
    let yearSize = H.year.fontSize + textSizeOffsets.year;
    let yearAlign = textAlignRatings.year || 'left';
    textFont(fontLight); textSize(yearSize); textLeading(H.year.leading);
    drawBoxText(albumData.year, yearX, yearY, yearMaxWidth, yearAlign);
    addTextBox('year', getAlignedBounds(fontLight.textBounds(getRichText(albumData.year), yearX, yearY, yearMaxWidth), yearX, yearAlign, yearMaxWidth, fontLight), yearSize);

    let genreX = rightColX + (horizontalOffsetsRatings.genre || 0);
    let genreY = blockTop + H.genre.offsetY + (verticalOffsetsRatings.genre || 0);
    let genreMaxWidth = maxTextboxWidths.genre || defaultMaxTextboxWidths.genre;
    let genreSize = H.genre.fontSize + textSizeOffsets.genre;
    let genreAlign = textAlignRatings.genre || 'left';
    textSize(genreSize); textLeading(H.genre.leading);
    let genreText = shortenText(albumData.genre, genreMaxWidth);
    drawBoxText(genreText, genreX, genreY, genreMaxWidth, genreAlign);
    addTextBox('genre', getAlignedBounds(fontLight.textBounds(getRichText(genreText), genreX, genreY, genreMaxWidth), genreX, genreAlign, genreMaxWidth, fontLight), genreSize);

    let funfactX = rightColX + (horizontalOffsetsRatings.funfact || 0);
    let funfactY = blockTop + H.funfact.offsetY + (verticalOffsetsRatings.funfact || 0);
    let funfactMaxWidth = maxTextboxWidths.funfact || defaultMaxTextboxWidths.funfact;
    let funfactSize = H.funfact.fontSize + textSizeOffsets.funfact;
    let funfactAlign = textAlignRatings.funfact || 'left';
    textFont(fontRegularCondensed);
    textSize(funfactSize); textLeading(H.funfact.leading + textLeadingOffsets.funfact);
    drawBoxText(albumData.funfact, funfactX, funfactY, funfactMaxWidth, funfactAlign);
    // hitbox measured with fontLight to keep the historical selection size
    addTextBox('funfact', getAlignedBounds(fontLight.textBounds(getRichText(albumData.funfact), funfactX, funfactY, funfactMaxWidth), funfactX, funfactAlign, funfactMaxWidth, fontLight), funfactSize);

    utils.endShadow();
}

function drawTrackList() {
    const T = RATINGS_LAYOUT.tracks;
    const leftMargin = RATINGS_LAYOUT.leftMargin;
    const twoColumns = tracksTwoColumns;
    let textIndent = twoColumns ? T.textIndent.twoColumns : T.textIndent.oneColumn;
    let twoColumnsFix = twoColumns ? 25 : 0;

    // Column geometry: the grade pill sits left of the title; in two-column
    // mode the pill shrinks and the title moves left with it.
    let pillW = (leftMargin + textIndent) * (twoColumns ? T.pillWidthFactorTwoColumns : T.pillWidthFactorOneColumn);
    if (twoColumns) { pillW *= 0.5; textIndent -= pillW; }
    let pillH = tracksRectHeight;
    let titleBaseX = leftMargin + textIndent; // first-column titles
    let pillCenterBaseX = titleBaseX * 0.5 + twoColumnsFix;   // first-column pill centers

    let horizOffset = (horizontalOffsetsRatings.tracks || 0) + T.horizOffsetFix;
    let columnTopY = T.startY + (verticalOffsetsRatings.tracks || 0);
    let titleMaxWidth = twoColumns ? T.titleMaxWidth.twoColumns : T.titleMaxWidth.oneColumn;
    let S = T.rowSpacing;
    let rowSpacing = Math.min(map(albumData.tracks.length, S.fewTracks, S.manyTracks, S.max, S.min, true), S.cap) + tracksSpacing;
    let secondColumnStart = Math.ceil(albumData.tracks.length / 2);

    push();
    textFont(fontRegular); textSize(tracksTextSize); textAlign(LEFT, BASELINE);
    rectMode(CENTER);
    let pillCenterOffsetY = (textAscent() - textDescent()) / 2; // centers pills on the title baseline

    let rowY = columnTopY;
    for (let i = 0; i < albumData.tracks.length; i++) {
        let track = albumData.tracks[i];
        // Interludes always render with the grey pill colour; the grade (if any) is
        // shown as a small coloured dot drawn on top of the pill instead.
        let gradeColor = track.interlude ? colorMap["INTERLUDE"] : (colorMap[track.grade] || "#888888");
        let showGoatFx = track.grade == 'GOAT' && !track.interlude;
        let showPeakFx = track.grade == 'PEAK' && !track.interlude;
        let columnShift = (twoColumns && i >= secondColumnStart) ? T.columnShift : 0;
        let titleX = titleBaseX + columnShift + horizOffset + (!twoColumns ? T.titleIndent.oneColumn : T.titleIndent.twoColumns) + twoColumnsFix*0.5;
        let pillCenterX = pillCenterBaseX + columnShift + horizOffset;
        let pillCenterY = rowY - pillCenterOffsetY;
        let pillCornerRadius = pillH * 0.5;

        // Large note below the row, with an accent line fading out of the pill
        let noteSpacing = 0;
        if (track.customTextLarge && track.customTextLarge.trim() !== '') {
            const N = T.note;
            let noteX = (twoColumns ? N.x.twoColumns : N.x.oneColumn) + columnShift + horizOffset;
            let noteMaxWidth = twoColumns ? N.maxWidth.twoColumns : N.maxWidth.oneColumn;
            let noteY = rowY + N.topGap;

            push();
            rectMode(CORNER); // anchor the text box at its top-left so noteX is the left edge
            fill(245); noStroke(); textFont(fontLight); textSize(N.fontSize); textAlign(LEFT, TOP);
            _text(track.customTextLarge, noteX, noteY, noteMaxWidth);
            noteSpacing = fontLight.textBounds(getRichText(track.customTextLarge), noteX, noteY, noteMaxWidth).h + N.bottomGap;

            let lineX = pillCenterX - pillW / 2 + N.lineInset;
            let lineColors = showGoatFx
                ? goatGradient
                : [gradeColor, gradeColor, makeTransparent(gradeColor)];
            stroke(gradeColor); strokeCap(ROUND); strokeWeight(N.lineWeight);
            gradientLine(lineX, pillCenterY, lineX, pillCenterY + noteSpacing, lineColors);
            pop();
        }

        // Grade pill
        fill(gradeColor);
        noStroke();
        if (showGoatFx) {
            utils.beginLinearGradient(goatGradient,
                pillCenterX - pillW / 2, pillCenterY,
                pillCenterX + pillW / 2, pillCenterY, GOAT_GRADIENT_STOPS);
            utils.beginShadow("#ffffff", T.goatGlowBlur, 0, 0);
        }
        if (showPeakFx) utils.beginShadow(gradeColor, T.peakGlowBlur, 0, 0);
        rect(pillCenterX, pillCenterY, pillW, pillH, pillCornerRadius);
        if (showGoatFx || showPeakFx) utils.endShadow();

        // Interlude grade dot — small circle on top of the grey pill, coloured by the
        // track's grade. Skipped when the interlude has no grade ('None').
        if (track.interlude && track.grade !== 'None') {
            push();
            let gradeColor = colorMap[track.grade] || colorMap["INTERLUDE"];
            fill(gradeColor); noStroke();
            let h = pillH * 0.6
            let w = pillW - (h * 0.5);
            let radius = h * 0.5;
            //rect(pillCenterX, pillCenterY, w, h, radius);

            let x = pillCenterX - w * 0.5 + radius * 1.25;
            ellipse(x, pillCenterY, h, h);
            pop();
        }

        // Small label inside the pill
        if (track.customText && track.customText.trim() !== '') {
            const L = T.pillLabel;
            push();
            blendMode(BLEND); textAlign(CENTER, CENTER); fill(0, 160); textFont(fontRegularCondensed);
            textSize(Math.min(
                getMaxTextSizeByWidth(track.customText, pillW - L.widthPad, L.maxFontSize),
                getMaxTextSizeByHeight(track.customText, pillH + L.heightSlack, L.maxFontSize)));
            _text(track.customText, pillCenterX, pillCenterY + L.nudgeY);
            pop();
        }

        // Track title
        fill(255);
        let trackNumber = showTrackNumbersCheckbox.checked() ? track.customNumber || ((i + 1) + '.') : '';
        let title = shortenText(trackNumber + " " + track.title, titleMaxWidth);
        if (showGoatFx) utils.beginShadow("#ffffff", T.goatTitleGlowBlur, 0, 0);
        _text(title, titleX, rowY);
        if (showGoatFx) utils.endShadow();

        rowY += rowSpacing + noteSpacing;
        if (twoColumns && i == secondColumnStart - 1) rowY = columnTopY; // second column restarts at the top
    }
    pop();

    // Selection hitbox around the whole section
    textBoxes.push({
        id: 'tracks',
        x: leftMargin + horizOffset,
        y: columnTopY - T.hitbox.padY,
        w: textIndent + T.hitbox.rightExtent,
        h: (rowY + T.hitbox.padY) - (columnTopY - T.hitbox.padY),
        sizeOffset: 0,
        currentSize: 0
    });
}

function drawGradeLegend(cover) {
    const L = RATINGS_LAYOUT.legend;

    // Show every grade from GOAT down to the worst one used
    let maxIndex = L.minGradeIndex;
    for (let track of albumData.tracks) {
        let idx = allLegendGrades.indexOf(track.grade);
        if (idx > maxIndex) maxIndex = idx;
    }
    let legendGrades = allLegendGrades.slice(0, maxIndex + 1);
    let legendLabels = allLegendLabels.slice(0, maxIndex + 1);
    if (legendGrades.length > L.compactThreshold) legendLabels[0] = 'G';

    let y = cover.y + cover.size + L.topPadding;
    let rectH = tracksRectHeight;
    let rectW = (cover.size - L.gap * (legendGrades.length - 1)) / legendGrades.length;

    push();
    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont(fontRegularCondensed);

    for (let i = 0; i < legendGrades.length; i++) {
        let grade = legendGrades[i];
        let label = legendLabels[i];
        let x = cover.x + i * (rectW + L.gap);
        let cornerRadius = rectH * 0.5;

        fill(colorMap[grade] || "#888888");
        noStroke();
        if (grade == 'GOAT') {
            utils.beginLinearGradient(goatGradient, x, y, x + rectW, y, GOAT_GRADIENT_STOPS);
        }
        rect(x, y, rectW, rectH, cornerRadius);

        fill(0, 180);
        stroke(0, 180);
        strokeWeight(.5);
        textSize(Math.min(
            getMaxTextSizeByWidth(label, rectW - L.labelWidthPad, L.labelMaxFontSize.byWidth),
            getMaxTextSizeByHeight(label, rectH + L.labelHeightSlack, L.labelMaxFontSize.byHeight)));
        _text(label, x + rectW / 2, y + rectH / 2 + L.labelNudgeY);
    }
    pop();
}

function drawAlbumGradeBar(exportHeight) {
    const G = RATINGS_LAYOUT.gradeBar;
    let barY = exportHeight - G.height;

    push();
    rectMode(CORNER); noStroke();
    fill(colorMap[albumData.albumGrade] || "#888888");
    if (albumData.albumGrade == 'GOAT') {
        utils.beginLinearGradient(goatGradient, 0, barY, width, barY, GOAT_GRADIENT_STOPS);
    }
    rect(0, barY, width, G.height, G.cornerRadius, G.cornerRadius, 0, 0);

    textAlign(CENTER, CENTER); fill(255); textFont(fontHeavy); textSize(G.fontSize);
    utils.beginShadow("#ffffffa3", G.glowBlur, 0, 0);
    _text(albumData.albumGrade, width * 0.5, barY + G.height * G.textYFactor);
    utils.endShadow();
    pop();
}

function makeTransparent(col, alpha = 100) {
    // col is a hex string with or without an alpha value, e.g. "#ff0000" or "#ff000080"
    let c = color(col);
    return color(red(c), green(c), blue(c), alpha);
}

function getP5Align(align) {
    if (align === 'center') return CENTER;
    if (align === 'right') return RIGHT;
    return LEFT;
}

// Draws text inside a box honoring the chosen alignment. 'justify' needs a custom
// renderer (justifyText); left/center/right use p5's native textAlign + _text().
function drawBoxText(str, x, y, maxWidth, align, verAlign = BASELINE) {
    if (align === 'justify') {
        justifyText(str, x, y, maxWidth);
    } else {
        textAlign(getP5Align(align), verAlign);
        _text(str, x, y, maxWidth);
    }
}

function textIsWrapping(bounds, font) {
    // Compare text height to a single-line reference to detect line wrapping
    return bounds.h > font.textBounds('glIM|', 0, 0).h * 1.2;
}

function getAlignedBounds(bounds, anchorX, align, maxWidth, font) {
    // When _text() is called in box mode (with maxWidth), x is always the left edge of the container,
    // but textBounds treats x as the alignment anchor (center/right), shifting bounds.x to the left.
    // Correct by offsetting bounds.x back to where the text actually renders within the container.
    // Wrapping text already returns correct bounds from p5 — skip correction in that case.
    if (!maxWidth || align === 'left') return bounds;
    // Justified text is stretched to fill the whole container, so textBounds (which reports
    // the natural widest-line width) understates it — the box must span the full maxWidth.
    if (align === 'justify') return { x: bounds.x, y: bounds.y, w: maxWidth, h: bounds.h };
    if (font && textIsWrapping(bounds, font)) return bounds;
    if (align === 'center') return { x: bounds.x + maxWidth / 2, y: bounds.y, w: bounds.w, h: bounds.h };
    if (align === 'right')  return { x: bounds.x + maxWidth,     y: bounds.y, w: bounds.w, h: bounds.h };
    return bounds;
}

function drawTextWithBox(id, font, size, textStr, x, y, maxWidth, leading, align = 'left', verAlign = BASELINE, drawText = true) {
    push()
    size = max(10, size);
    textFont(font);
    textSize(size);
    fill(255);
    textLeading(leading);
    if(drawText) drawBoxText(textStr, x, y, maxWidth, align, verAlign);
    textAlign(getP5Align(align), verAlign);
    let bbox = font.textBounds(getRichText(textStr), x, y, maxWidth);
    addTextBox(id, getAlignedBounds(bbox, x, align, maxWidth, font), size);
    pop()
    return bbox;
}

function addTextBox(id, bounds, size) {
    textBoxes.push({ id, x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h, sizeOffset: textSizeOffsets[id], currentSize: size });
}

//stretches the edge pixels of an image toward the canvas sides for a glitchy effect
//opts:
//  sides       {left, right, top, bottom} - which edges get extended
//  type        'noise' | 'sine' | 'square' | 'sawtooth' | 'none'  - how the stretched columns are distorted vertically
//  amp         max vertical pixel shift of the stretched columns
//  scale       noise zoom / sine frequency
//  symmetrical if true the distortion is driven by distance to the image, so left and right mirror each other
//  color       {mode, amount, tint, levels, shift} - recolours the stretched pixels, growing with distance:
//              mode: combine with '+' or an array, e.g. 'glow+fade' or ['glow','fade']
//                    'none'|'invert'|'tint'|'rainbow'|'chromatic'|'posterize'|'fade'|'glow'|'bloom'|'scanlines'|'bands'
//              amount 0..1 strength, tint [r,g,b], levels = posterize steps, shift = chromatic split in px
//              bandScale = band thickness (smaller=thicker), bandSeed = noise offset for animating bands
//  warp        {mosaic, shear, echo, haze, band} - geometry distortions of the SAMPLE position, grow with distance:
//              mosaic = max cell size (resolution decay), shear = max band jump in px (torn-signal tearing),
//              echo   = max smear offset in px (motion-trail blur), haze = shimmer amplitude in px,
//              band   = shear band thickness in px (default 24)
//  edges       {colors, mode, scale, seed} - rebuild the sampled edge from synthetic colours so the stretched
//              art comes from these instead of the image. colors = array of [r,g,b] or '#hex'; all selected sides
//              get the same treatment. mode 'random' (re-rolls each call) | 'noise' (smooth colour regions);
//              scale = noise zoom, seed = noise offset (animate with e.g. seed: frameCount * 0.01)

let glitchOpts = {
    sides: {left: true, right: true, top: false, bottom: false},
    type: 'sine',          //'noise' | 'sine' | 'square' | 'sawtooth' | 'none'
    amp: 50,               //max vertical shift in pixels
    scale: 0.005,            //noise zoom / sine frequency
    symmetrical: false,     //left and right mirror each other
    color: {
        mode: 'bloom+glow', //'none'|'invert'|'tint'|'rainbow'|'chromatic'|'posterize'|'fade'|'glow'|'bloom'|'scanlines'
        amount: .3,         //effect strength 0..1
        tint: [255, 60, 180], //used by 'tint'
        levels: 10,         //used by 'posterize'
        shift: 60          //used by 'chromatic' (vertical split in px)
    },
    warp:  {},
    edges: {
        mode: 'noise',
        sample: true,
        scale: 0.04
    }
}

let glitchOptsTitle = {
    sides: {left: true, right: true, top: false, bottom: false},
    type: 'none',          //'noise' | 'sine' | 'square' | 'sawtooth' | 'none'
    amp: 60,               //max vertical shift in pixels
    scale: 0.005,            //noise zoom / sine frequency
    symmetrical: false,     //left and right mirror each other
    color: {
        mode: 'fade+bands', //'none'|'invert'|'tint'|'rainbow'|'chromatic'|'posterize'|'fade'|'glow'|'bloom'|'scanlines'
        amount: .85,         //effect strength 0..1
        bandScale: 5000005,
        bandSeed: 10,
        tint: [255, 60, 180], //used by 'tint'
        levels: 10,         //used by 'posterize'
        shift: 60          //used by 'chromatic' (vertical split in px)
    },
    warp:  {}
}

// --- createGlitchyImage result cache -------------------------------------------------
// createGlitchyImage does per-pixel work across the whole canvas, so it's expensive and
// every edit triggers a full re-render. We memoize its output per call site: each slot
// remembers the params that produced its image and only re-runs the glitch when something
// that actually affects the result changes (source image, display size, position, glitch
// options). Otherwise the cached p5.Image is reused as-is.
let glitchImageCache = {};

// Map a p5.Font object to a stable string so it can be part of a cache key.
function glitchFontKey(font){
    if(font === fontHeavy) return 'fontHeavy';
    if(font === fontLight) return 'fontLight';
    if(font === fontRegular) return 'fontRegular';
    if(font === fontRegularItalic) return 'fontRegularItalic';
    if(font === fontRegularCrammed) return 'fontRegularCrammed';
    if(font === fontRegularCondensed) return 'fontRegularCondensed';
    return 'font?';
}

// Return a cached createGlitchyImage result for `cacheId`, recomputing only when the
// inputs change. `getImg` is a lazy factory for the source image so we don't pay to build
// it (e.g. render the title to a graphics buffer) on a cache hit. `srcKey` identifies the
// source content (image url, or text+font+size) so changing it busts the cache.
function getCachedGlitchyImage(cacheId, getImg, imgW, imgH, imgPos, opts, srcKey = ''){
    let key = srcKey + '|' + imgW + '|' + imgH + '|' + imgPos.x + '|' + imgPos.y + '|' + JSON.stringify(opts);
    let slot = glitchImageCache[cacheId];
    if (slot && slot.key === key) return slot.image;
    let image = createGlitchyImage(getImg(), imgW, imgH, imgPos, opts);
    glitchImageCache[cacheId] = { key, image };
    return image;
}

const textOpts = {
    fontSize: 50,          //text height in px
    col: [255, 255, 255],     //base streak colour [r,g,b]
    variance: 60,           //how much each channel is randomly nudged per line
    spacing: 1,             //vertical gap (px) between silhouette samples -> bigger = fewer curves
    sampleFactor: 1,      //textToPoints density (higher = more outline points)
    drawText: true,          //also draw the actual letters in the middle
    monoVariance: true,
    justFirstAndLastLetters: true,

    //energy curves dissipating from the letter silhouette
    energy: {
        chance: 0.2,        //fraction of silhouette rows that emit a strand (both sides get the SAME count)
        minLen: 8,           //ignore strands shorter than this (px)
        reach: 500,          //strand length in px (outward from the letter). null = run all the way to the canvas edge

        //two colour+alpha gradients laid end-to-end along each strand (strand start -> strand end).
        //each blends from `From` to `To` as [r, g, b, alpha]. `Speed` controls how fast that gradient
        //completes: higher speed = it occupies LESS of the strand. The two speeds share the strand,
        //so a fast grad1 + slow grad2 = quick fade-in near the letter, long slow tail toward the edge.
        //speeds are picked at random per strand within their [min, max] range.
        grad1From: [255, 255, 255, 0],   //strand start: fully transparent...
        grad1To:   [255, 255, 255, 255], //...to opaque white
        grad1Speed: [1, 2],              //fast

        grad2From: [255, 255, 255, 255], //then opaque white...
        grad2To:   [0, 0, 0, 0],         //...to transparent black
        grad2Speed: [0.4, 0.8],          //slow

        startDist: [5, 18],   //how far from the origin (the letter) the strand begins, in segments.
                             //0 = starts right at the letter; larger = a gap before the strand starts.
                             //picked at random per strand within this [min, max] range.

        curveAmp: 0.38,      //vertical curveness as a fraction of the curve length
        curveAmpRand: 0.8,   //+/- randomness applied to curveAmp per strand
        curvePower: 2,     //how fast the curve gets wild as it leaves the letter (>1 = ramps up far away)
        waves: 1.4,          //how many vertical oscillations along the strand
        wavesRand: 0.5,      //+/- randomness on the wave count per strand
        endDrift: 0.25,      //extra vertical wander of the far (edge) end, as a fraction of length

        weight: 2,           //stroke weight
        weightRand: 0.4,     //+/- randomness on the stroke weight per strand
        segments: 100         //resolution of each strand (more = smoother)
    }
}

async function printCoverScreen() {
    push()
    background(200);
    let selectedId = selectedTextBox ? selectedTextBox.id : null;
    textBoxes = [];

    let exportHeight = aspectRatioOptions[currentAspectRatioCover].height;

    let coverSize = width * 0.65, coverY = exportHeight * 0.5, hasImage = false, imgBW, img;

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

    //background
    if (hasImage) { imageMode(CENTER); image(imgBW, width * 0.5, height * 0.5, height, height); }
    else background(50);

    // utils.beginShadow("#000000", 30, 0, 0);
    // textAlign(CENTER, TOP); textFont(fontLight); textSize(55); fill(255);
    // _text("Album Review", width * 0.5, 260);
    // utils.endShadow();


    imageMode(CENTER); rectMode(CENTER);
    utils.beginShadow("#000000", 40, 0, 0);
    if (hasImage) {
        fill(0) 
        rect(width * 0.5, coverY, coverSize, coverSize); 
        let glitchedImg = getCachedGlitchyImage('coverImage', () => img, coverSize, coverSize, {x: width*0.5, y: coverY}, glitchOpts, albumData.imageUrl)
        image(glitchedImg, width*.5, height*.5, width, height);
        image(img, width * 0.5, coverY, coverSize, coverSize); 
        image(img, width * 0.5, coverY, coverSize, coverSize); 
        image(img, width * 0.5, coverY, coverSize, coverSize);
    }
    else drawImagePlaceholder(width * 0.5, coverY, coverSize, coverSize, false);
    utils.endShadow();

    push()

    let titleVertOffset = verticalOffsetsCover.title || 0;
    let titleHorizOffset = horizontalOffsetsCover.title || 0;
    let titleY = coverY + coverSize * 0.5 + 60 + titleVertOffset;
    let titleAlignCover = textAlignCover.title || 'center'; //right now not suppored, it defaults to center
    let coverTitleMaxWidth = maxTextboxWidths.title || defaultMaxTextboxWidths.title;
    textFont(fontHeavy);
    let titleSize = getMaxTextSizeByWidth(albumData.title, coverTitleMaxWidth, 100) + textSizeOffsets.title;
    titleSize = max(10, titleSize);

    drawStylizedText(fontHeavy, titleSize, albumData.title, width * 0.5 + titleHorizOffset, titleY, CENTER, CENTER, glitchOptsTitle, 'coverTitle')

    textAlign(CENTER, CENTER);
    let titleBounds = fontHeavy.textBounds(getRichText(albumData.title), width * 0.5 + titleHorizOffset, titleY, coverTitleMaxWidth);
    addTextBox('title', getAlignedBounds(titleBounds, width * 0.5 + titleHorizOffset, titleAlignCover), titleSize);

    let artistVertOffset = verticalOffsetsCover.artist || 0;
    let artistHorizOffset = horizontalOffsetsCover.artist || 0;
    let artistY = coverY + coverSize * 0.5 + 60 + 130 + artistVertOffset;
    let artistAlignCover = textAlignCover.artist || 'center';
    textFont(fontRegularCondensed);
    textAlign(CENTER, CENTER);
    let artistSize = getMaxTextSizeByWidth(albumData.artist, width - 100, 50) + textSizeOffsets.artist;
    textSize(artistSize); fill(230); _text(albumData.artist, width * 0.5 + artistHorizOffset, artistY);
    let artistBounds = fontRegularCondensed.textBounds(getRichText(albumData.artist), width * 0.5 + artistHorizOffset, artistY, width - 100);
    addTextBox('artist', getAlignedBounds(artistBounds, width * 0.5 + artistHorizOffset, artistAlignCover), artistSize);
    utils.endShadow();

    // Draw custom textboxes
    drawCustomTextboxes('cover');

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

    if (showGreenRectangle) {
        push();
        noFill();
        stroke(0, 255, 0);
        strokeWeight(4);
        rectMode(CORNER);
        rect(0, 0, WIDTH, aspectRatioOptions[currentAspectRatioCover].height);
        pop();
    }
}

function drawStylizedText(font, fontSz, str, x, y, hAlign = CENTER, vAlign = CENTER, opts = glitchOptsTitle, cacheId = 'stylizedText'){
    push()
    textFont(font);
    textSize(fontSz);

    let auxStr = str.replaceAll(" ", ".")
    let bbox = font.textBounds(auxStr, 0, 0, fontSz);

    // padding so descenders / glyph overhang / antialiased edges never clip
    let Wpad = -20
    let Hpad = 50 // esto en realidad se deberia calcular, lo pongo alto para que no se corte si el textsize es alto
    let tw = Math.ceil(bbox.w + Wpad);
    let th = Math.ceil(bbox.h + Hpad);

    // alignment is applied OUT here: convert the (x, y) anchor into the rectangle CENTER
    // (imgPos), offsetting by the glyph size — bbox.w/h, not tw/th, so padding doesn't skew it
    let cx = x, cy = y;
    if(hAlign === LEFT)       cx = x + bbox.w / 2;
    else if(hAlign === RIGHT) cx = x - bbox.w / 2;
    // hAlign === CENTER -> cx = x

    if(vAlign === TOP)        cy = y + bbox.h / 2;
    else if(vAlign === BOTTOM) cy = y - bbox.h / 2;
    // vAlign === CENTER -> cy = y

    // The expensive glitch result is cached: only when the text/font/size/position/opts
    // change do we rebuild the centered text buffer and re-run createGlitchyImage.
    let srcKey = glitchFontKey(font) + '|' + fontSz + '|' + str;
    let g2 = getCachedGlitchyImage(cacheId, () => {
        // buffer ALWAYS draws text centered -> it can't clip regardless of requested alignment
        let g = createGraphics(tw, th);
        g.textFont(font);
        g.noStroke();
        g.fill(255);
        g.textSize(fontSz);
        g.textAlign(CENTER, CENTER);
        g.text(str, tw / 2, th / 2);
        return g;
    }, tw, th, { x: cx, y: cy }, opts, srcKey);
    imageMode(CORNER);
    image(g2, 0, 0, width, height);
    pop()
}

function drawCustomTextboxes(coverType){
    push();
    let fontObj;
    customTextboxes.forEach(textbox => {
        rectMode(CORNER);
        if (textbox.viewType === coverType) {
            
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

            // Apply leading (spacing) if set
            let baseLeading = textbox.fontSize * 1.25; // Default line height
            textLeading(baseLeading + (textbox.leading || 0));

            if (textbox.text) {
                utils.beginShadow("#000000", 20, 0, 0);
                drawBoxText(textbox.text, textbox.x, textbox.y, textbox.maxWidth || 500, tbAlign, TOP);
                utils.endShadow();


                // Add to textBoxes for selection. Measure with the same TOP baseline used to
                // render: justifyText() restores the prior baseline on exit, so without this the
                // bounds would be computed against a stale baseline and the box would be offset.
                textAlign(getP5Align(tbAlign), TOP);
                let bounds = fontObj.textBounds(getRichText(textbox.text), textbox.x, textbox.y, textbox.maxWidth || 500);
                let alignedBounds = getAlignedBounds(bounds, textbox.x, tbAlign, textbox.maxWidth || 500, fontObj);
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
            }
            else {
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

function updateVisibilityCustomTextBoxesUI(){
    for(let ctb of customTextboxes){
        if(currentView == "ratings"){
            if(ctb.viewType == "cover") ctb.rowDiv.hide()
            else ctb.rowDiv.show()
        }
        else {
            if(ctb.viewType == "ratings") ctb.rowDiv.hide()
            else ctb.rowDiv.show()
        }
    }
}

function mousePressed() {
    let canvasEl = document.querySelector('canvas');
    let canvasRect = canvasEl.getBoundingClientRect();
    let scaledMouseX = mouseX / canvasScale;
    let scaledMouseY = mouseY / canvasScale;

    // Ignore clicks that land inside either floating panel (don't deselect)
    for (let panel of [sizeAdjustPanel, tracksAdjustPanel]) {
        if (panel && panel.style('display') !== 'none') {
            let panelRect = panel.elt.getBoundingClientRect();
            let mouseClientX = mouseX + canvasRect.left;
            let mouseClientY = mouseY + canvasRect.top;
            if (mouseClientX >= panelRect.left && mouseClientX <= panelRect.right &&
                mouseClientY >= panelRect.top && mouseClientY <= panelRect.bottom) return;
        }
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

        // Show the matching floating panel for the selected box
        if (clickedBox.id === 'tracks') {
            sizeAdjustPanel.style('display', 'none');
            showTracksAdjustPanel();
        } else if (clickedBox.id === 'image') {
            // Image has no styling panel — just update the offset slider
            sizeAdjustPanel.style('display', 'none');
            tracksAdjustPanel.style('display', 'none');
            updateVerticalOffsetSlider();
        } else {
            tracksAdjustPanel.style('display', 'none');
            showSizeAdjustPanel(clickedBox);
        }

        if (selectionChanged) currentView === 'ratings' ? printAlbum() : printCoverScreen();
    } else {
        if (selectedTextBox) {
            selectedTextBox = null;
            sizeAdjustPanel.style('display', 'none');
            tracksAdjustPanel.style('display', 'none');
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

            if(draggedTextbox.id === 'image' && automaticAlignmentCheckbox.checked()){
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

// Select the canvas textbox with the given id (if it exists in the current view) and
// open its adjustment panel. Mirrors the canvas-click selection so focusing the matching
// form field brings up the same floating UI bar.
function selectTextBoxById(id) {
    let box = textBoxes.find(b => b.id === id);
    if (!box) return;
    let selectionChanged = !selectedTextBox || selectedTextBox.id !== box.id;
    selectedTextBox = box;

    if (box.id === 'tracks') {
        sizeAdjustPanel.style('display', 'none');
        showTracksAdjustPanel();
    } else if (box.id === 'image') {
        sizeAdjustPanel.style('display', 'none');
        tracksAdjustPanel.style('display', 'none');
        updateVerticalOffsetSlider();
    } else {
        tracksAdjustPanel.style('display', 'none');
        showSizeAdjustPanel(box);
    }

    // Re-render to draw the selection outline (only needed if the selection actually changed)
    if (selectionChanged) currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

function showSizeAdjustPanel(box) {
    let isCustom = !!box.isCustom;
    let textbox = isCustom ? customTextboxes.find(t => t.id === box.id) : null;

    // Size — shown for every textbox. Custom shows its absolute font size; predefined
    // shows the signed offset applied on top of its auto-fitted base size.
    if (isCustom) {
        select('#sap-size-display').html(textbox ? textbox.fontSize : 40);
    } else {
        let offset = box.sizeOffset || 0;
        select('#sap-size-display').html(offset >= 0 ? '+' + offset : '' + offset);
    }

    // Leading — custom boxes and the predefined funfact support line spacing
    let showLeading = isCustom || box.id === 'funfact';
    select('#sap-leading').style('display', showLeading ? 'flex' : 'none');
    if (showLeading) {
        if (isCustom) {
            select('#sap-leading-display').html(textbox ? (textbox.leading || 0) : 0);
        } else {
            let leadingOffset = textLeadingOffsets.funfact || 0;
            select('#sap-leading-display').html(leadingOffset >= 0 ? '+' + leadingOffset : '' + leadingOffset);
        }
    }

    // Width — every text box has a wrap width
    let showWidth = isCustom || maxTextboxWidths.hasOwnProperty(box.id);
    select('#sap-width').style('display', showWidth ? 'flex' : 'none');
    if (showWidth) {
        let w = isCustom
            ? (textbox ? (textbox.maxWidth || 500) : 500)
            : (maxTextboxWidths[box.id] || defaultMaxTextboxWidths[box.id] || 500);
        select('#sap-width-slider').value(w);
        select('#sap-width-display').html(w);
    }

    // Font + Color — only custom boxes expose these (predefined styling is fixed)
    select('#sap-font').style('display', isCustom ? 'flex' : 'none');
    select('#sap-color').style('display', isCustom ? 'flex' : 'none');
    if (isCustom && textbox) {
        select('#sap-font-select').selected(textbox.fontType);
        select('#sap-color-picker').value(textbox.color);
    }

    // Align — shown for every textbox
    let align;
    if (isCustom) align = textbox ? (textbox.textAlign || 'left') : 'left';
    else align = currentView === 'ratings' ? (textAlignRatings[box.id] || 'left') : (textAlignCover[box.id] || 'center');
    select('#sap-align-select').selected(align);

    if (tracksAdjustPanel) tracksAdjustPanel.style('display', 'none');
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
    if (selectedTextBox.isCustom) {
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) textbox.fontSize = Math.max(8, Math.min(200, textbox.fontSize + delta));
    } else if (textSizeOffsets.hasOwnProperty(selectedTextBox.id)) {
        textSizeOffsets[selectedTextBox.id] += delta;
        selectedTextBox.sizeOffset = textSizeOffsets[selectedTextBox.id];
    }
    captureState();
    showSizeAdjustPanel(selectedTextBox);
    currentView === 'ratings' ? printAlbum() : printCoverScreen();
}

function adjustTextLeading(delta) {
    if (!selectedTextBox) return;
    if (selectedTextBox.isCustom) {
        let textbox = customTextboxes.find(t => t.id === selectedTextBox.id);
        if (textbox) textbox.leading = (textbox.leading || 0) + delta;
    } else if (selectedTextBox.id === 'funfact') {
        textLeadingOffsets.funfact += delta;
    } else return;
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
        aspectRatioCover: currentAspectRatioCover,
        imageFormat: currentImageFormat,
        downloadImageOption: downloadImageOption,
        showGradeLegend: showGradeLegend,
        tracks: tracks.map(t => ({ title: t.titleInput.value(), grade: t.gradeSelect.value(), interlude: t.interlude || false,
                                    customNumber: t.customNumber || null, customText: t.textInput ? t.textInput.value() : null,
                                    customTextLarge: t.textLargeInput ? t.textLargeInput.value() : null})),
        customTextboxes: customTextboxes.map(t => ({
            id: t.id, text: t.text, x: t.x, y: t.y, fontSize: t.fontSize,
            fontType: t.fontType, color: t.color, viewType: t.viewType,
            leading: t.leading || 0, maxWidth: t.maxWidth || width - 100, textAlign: t.textAlign || 'left'
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
        tracksTwoColumns: tracksTwoColumns,
        textAlignRatings: {...textAlignRatings},
        textAlignCover: {...textAlignCover},
        glitchOpts: {...glitchOpts},
        glitchOptsTitle: {...glitchOptsTitle}
    };

    if (historyIndex < historyStack.length - 1) historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(JSON.stringify(state));
    historyIndex = historyStack.length - 1;
    if (historyStack.length > MAX_HISTORY) { historyStack.shift(); historyIndex--; }
    syncEditorFromUI();
}

function undo() {
    if (historyIndex <= 0) return;
    isUndoRedoAction = true;
    historyIndex--;
    restoreState(JSON.parse(historyStack[historyIndex]));
    isUndoRedoAction = false;
    syncEditorFromUI();
}

function redo() {
    if (historyIndex >= historyStack.length - 1) return;
    isUndoRedoAction = true;
    historyIndex++;
    restoreState(JSON.parse(historyStack[historyIndex]));
    isUndoRedoAction = false;
    syncEditorFromUI();
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

    if(state.aspectRatioCover) {
        currentAspectRatioCover = state.aspectRatioCover;
        aspectRatioCoverSelect.selected(state.aspectRatioCover);
    }

    if (state.imageFormat) {
        currentImageFormat = state.imageFormat;
        imageFormatSelect.selected(state.imageFormat);
    }

    if (state.downloadImageOption) {
        downloadImageOption = state.downloadImageOption;
        if (downloadImageSelect) downloadImageSelect.selected(downloadImageOption);
    }

    if (state.showGradeLegend !== undefined) {
        showGradeLegend = state.showGradeLegend;
        if (gradeLegendCheckbox) gradeLegendCheckbox.checked(showGradeLegend);
    }

    if (state.glitchOpts)      glitchOpts      = JSON.parse(JSON.stringify(state.glitchOpts));
    if (state.glitchOptsTitle) glitchOptsTitle = JSON.parse(JSON.stringify(state.glitchOptsTitle));
    if (glitchTargetSel) syncGlitchUI(getActiveGlitchOpts());

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
    if (state.tracksTwoColumns !== undefined) {
        tracksTwoColumns = state.tracksTwoColumns;
        if (tracksTwoColumnsCheckbox) tracksTwoColumnsCheckbox.checked(tracksTwoColumns);
    }

    while (tracks.length > 0) { tracks[0].rowDiv.remove(); tracks.shift(); }

    if (state.tracks && state.tracks.length > 0) {
        state.tracks.forEach(track => {
            addTrackRowWithoutCapture();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            // Migrate legacy data: an 'INTERLUDE' grade becomes interlude=true with no grade.
            let loadedGrade = track.grade || 'STRONG';
            let loadedInterlude = track.interlude || false;
            if (loadedGrade === 'INTERLUDE') { loadedInterlude = true; loadedGrade = 'None'; }
            lastTrack.gradeSelect.selected(loadedGrade);
            setTrackInterlude(lastTrack, loadedInterlude);
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber);
            }
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.addClass('open');
            }
            if (track.customTextLarge && track.customTextLarge.trim() !== '') {
                lastTrack.textLargeInput.value(track.customTextLarge);
                lastTrack.textLargeInputContainer.addClass('open');
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
                x: textboxData.x != undefined ? textboxData.x : 100,
                y: textboxData.y != undefined ? textboxData.y : 100,
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

// ---- Robust justified text for p5.js (2D renderer) ----
// Usage: justifyText(str, x, y, boxWidth) or with options:
// justifyText(str, x, y, boxWidth, { lineHeight: 28, lastLine: 'left' })
// Returns the y coordinate below the rendered block.

function justifyText(str, x, y, boxWidth, options = {}) {
    if (!str || boxWidth <= 0) return y;
    str = String(str);

    const lineHeight   = options.lineHeight ?? textLeading();
    const lastLineMode = options.lastLine ?? 'left';     // 'left' | 'justify'
    const maxStretch   = options.maxStretch ?? 4;        // give up justifying if gaps exceed spaceW * this
    const paraSpacing  = options.paragraphSpacing ?? 0;
    const hyphenChar   = options.hyphenChar ?? '';       // e.g. '-' for forced breaks in long words
    const spaceFactor = options.spaceFactor ?? 0.9;          // multiplier for space width (for tighter/looser spacing)

    push();
    textAlign(LEFT, TOP);

    // --- Robust measurement helpers ---
    const sizeFallback = textSize();

    function safeWidth(s) {
        let w = textWidth(s);
        if (Number.isFinite(w) && w > 0) return w;
        // Fallback: native canvas measurement (handles loadFont() quirks)
        if (typeof drawingContext?.measureText === 'function') {
            w = drawingContext.measureText(s).width;
            if (Number.isFinite(w) && w > 0) return w;
        }
        return s.length * sizeFallback * 0.5; // last-resort estimate
    }

    function measureSpace() {
        let w = textWidth(' ');
        if (Number.isFinite(w) && w > 0) return w;
        w = textWidth('i i') - textWidth('ii');   // derive from a difference
        if (Number.isFinite(w) && w > 0) return w;
        if (typeof drawingContext?.measureText === 'function') {
            w = drawingContext.measureText(' ').width;
            if (Number.isFinite(w) && w > 0) return w;
        }
        return sizeFallback * 0.3;
    }

    const spaceW = measureSpace() * spaceFactor

    // --- Break a word that's wider than the box into fitting chunks ---
    function breakWord(word) {
        const hyphenW = hyphenChar ? safeWidth(hyphenChar) : 0;
        const parts = [];
        let cur = '';
        for (const ch of word) {            // for...of handles emoji/surrogates
            if (cur && safeWidth(cur + ch) + hyphenW > boxWidth) {
                parts.push(cur + hyphenChar);
                cur = ch;
            } else {
                cur += ch;
            }
        }
        if (cur) parts.push(cur);
        return parts.length ? parts : [word];
    }

    // --- Render one line ---
    function renderLine(words, yTop, justify) {
        if (words.length === 0) return;
            if (justify && words.length === 1) {
            const w = words[0];
            const chars = [...w];
            if (chars.length > 1) {
                const charGap = (boxWidth - safeWidth(w)) / (chars.length - 1);
                let cx = x;
                for (const ch of chars) {
                _text(ch, cx, yTop);
                cx += safeWidth(ch) + charGap;
                }
                return;
            }
            }

        let totalW = 0;
        const widths = words.map(w => { const ww = safeWidth(w); totalW += ww; return ww; });

        let gap = spaceW;
        if (justify && words.length > 1) {
            const g = (boxWidth - totalW) / (words.length - 1);
            gap = Number.isFinite(g) ? Math.max(g, 0) : spaceW; // always fill the line
        }

        let cx = x;
        for (let i = 0; i < words.length; i++) {
            _text(words[i], cx, yTop);
            cx += widths[i] + gap;
        }
    }

    // --- Tokenize and pack ---
    let cursorY = y;
    const paragraphs = str.split(/\r\n|\r|\n/);

    for (let p = 0; p < paragraphs.length; p++) {
        let words = paragraphs[p].split(/\s+/).filter(w => w.length);

        if (words.length === 0) {           // blank line = empty paragraph
        cursorY += lineHeight;
        continue;
        }

        // Pre-split any word wider than the box
        words = words.flatMap(w => safeWidth(w) > boxWidth ? breakWord(w) : [w]);

        let line = [], lineW = 0;
        for (const w of words) {
            const wW = safeWidth(w);
            const test = lineW + (line.length ? spaceW : 0) + wW;
            if (test > boxWidth && line.length) {
                renderLine(line, cursorY, true);   // full line → justified
                cursorY += lineHeight;
                line = [w]; lineW = wW;
            } 
            else {
                line.push(w); lineW = test;
            }
        }
        if (line.length) {                     // final line of paragraph
            renderLine(line, cursorY, lastLineMode === 'justify');
            cursorY += lineHeight;
        }
        if (p < paragraphs.length - 1) cursorY += paraSpacing;
    }

    pop();
    return cursorY;
}

function _text(...args) {
    let str = args[0];
    if (typeof str === 'string') {
        args[0] = getRichText(str);
    }
    text(...args);
}

function getRichText(str){
    if (typeof str === 'string') {
        str = str.replace(/\$(\w+)\$/g, (match, varName) => {
            if (albumData.hasOwnProperty(varName)) return albumData[varName];
            return match; // no replacement if variable not found
        });
        str = str.replace(/\$\((js:)?\s*([^]+?)\s*\)\$/g, (match, jsPrefix, code) => {
            if (jsPrefix) {
                try {
                    let func = new Function('albumData', `with(albumData) { return ${code} }`);
                    return func(albumData);
                } catch (err) {
                    console.error("Error executing code in text: ", err);
                    return match; // return original if error
                }
            }
            return match; // no replacement if not js
        });
    }
    return str;
}



