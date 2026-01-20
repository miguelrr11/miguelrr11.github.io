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

// Text box selection and sizing
let textBoxes = [];
let selectedTextBox = null;
let sizeAdjustPanel = null;
let textSizeOffsets = {
    title: 0,
    artist: 0,
    year: 0,
    genre: 0,
    funfact: 0
};
let textLeadingOffsets = {
    funfact: 0
};

// Image cache
let cachedImageUrl = null;
let cachedOriginalImage = null;
let cachedFilteredImage = null;

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

// Canvas scaling
let canvasScale = 1;

function calculateCanvasScale() {
    // Calculate scale to fit canvas height in viewport with some padding
    const viewportHeight = window.innerHeight;
    const padding = 40; // 20px padding on each side
    const availableHeight = viewportHeight - padding;

    // Scale based on height to fit the tall canvas
    let scale = availableHeight / HEIGHT;

    // Clamp scale between reasonable values
    scale = Math.max(0.3, Math.min(1, scale));

    return scale;
}

function applyCanvasScale() {
    canvasScale = calculateCanvasScale();

    // Set CSS variable for the scale
    document.documentElement.style.setProperty('--canvas-scale', canvasScale);

    // Set the container's visual size (for layout purposes)
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

    // Apply initial scale
    applyCanvasScale();

    // Recalculate on window resize
    window.addEventListener('resize', applyCanvasScale);

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

    // Capture initial state for undo/redo (after everything is loaded)
    captureState();

    // Auto-save to localStorage every second
    setInterval(saveToLocalStorage, 1000);

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
    titleInput.elt.addEventListener('input', autoGeneratePreview);
    titleInput.elt.addEventListener('blur', captureState);

    // Artist
    let artistGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Artist').parent(artistGroup);
    artistInput = createInput('').parent(artistGroup).class('form-input');
    artistInput.attribute('placeholder', 'Enter artist name...');
    artistInput.elt.addEventListener('input', autoGeneratePreview);
    artistInput.elt.addEventListener('blur', captureState);

    // Year & Genre row
    let rowGroup = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');

    let yearGroup = createDiv('').parent(rowGroup).class('form-group').style('flex: 1;');
    createElement('label', 'Year').parent(yearGroup);
    yearInput = createInput('').parent(yearGroup).class('form-input');
    yearInput.attribute('placeholder', 'e.g. 1997');
    yearInput.elt.addEventListener('input', autoGeneratePreview);
    yearInput.elt.addEventListener('blur', captureState);

    let genreGroup = createDiv('').parent(rowGroup).class('form-group').style('flex: 1;');
    createElement('label', 'Genre').parent(genreGroup);
    genreInput = createInput('').parent(genreGroup).class('form-input');
    genreInput.attribute('placeholder', 'e.g. Rock');
    genreInput.elt.addEventListener('input', autoGeneratePreview);
    genreInput.elt.addEventListener('blur', captureState);

    // Fun Fact
    let funfactGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Fun Fact').parent(funfactGroup);
    funfactInput = createElement('textarea').parent(funfactGroup).class('form-textarea');
    funfactInput.attribute('placeholder', 'Add an interesting fact about the album...');
    funfactInput.elt.addEventListener('input', autoGeneratePreview);
    funfactInput.elt.addEventListener('blur', captureState);

    // Image URL
    let imageGroup = createDiv('').parent(editorPanel).class('form-group');
    createElement('label', 'Image URL').parent(imageGroup);
    imageUrlInput = createInput('').parent(imageGroup).class('form-input');
    imageUrlInput.attribute('placeholder', 'https://...');
    imageUrlInput.elt.addEventListener('input', autoGeneratePreview);
    imageUrlInput.elt.addEventListener('blur', captureState);

    // Album Grade & Vertical Offset row
    let gradeOffsetRow = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');

    let gradeGroup = createDiv('').parent(gradeOffsetRow).class('form-group').style('flex: 1;');
    createElement('label', 'Album Grade').parent(gradeGroup);
    albumGradeSelect = createSelect().parent(gradeGroup).class('form-select');
    for (let grade of gradeOptions) {
        albumGradeSelect.option(grade);
    }
    albumGradeSelect.changed(() => {
        autoGeneratePreview();
        captureState();
    });

    // Vertical Offset Slider
    let offsetGroup = createDiv('').parent(gradeOffsetRow).class('form-group').style('flex: 1;');
    createElement('label', 'Vertical Offset').parent(offsetGroup);
    let sliderContainer = createDiv('').parent(offsetGroup).class('slider-container');
    verticalOffsetSlider = createSlider(-500, 500, 0, 1).parent(sliderContainer).class('form-slider');
    verticalOffsetLabel = createSpan('0').parent(sliderContainer).class('slider-value');
    verticalOffsetSlider.input(() => {
        verticalOffsetLabel.html(verticalOffsetSlider.value());
        // Auto-redraw when slider changes
        if (albumData && currentView === 'ratings') {
            printAlbum();
        }
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
    undoBtn.elt.addEventListener('click', (e) => {
        e.preventDefault();
        undo();
    });
    let redoBtn = createButton('↷ Redo').parent(undoRedoRow).class('btn btn-secondary');
    redoBtn.elt.addEventListener('click', (e) => {
        e.preventDefault();
        redo();
    });

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

    // Size adjustment panel
    createSizeAdjustPanel();
}

function createSizeAdjustPanel() {
    sizeAdjustPanel = createDiv('').id('size-adjust-panel');
    sizeAdjustPanel.style('display', 'none');
    sizeAdjustPanel.style('position', 'fixed');
    sizeAdjustPanel.style('bottom', '20px');
    sizeAdjustPanel.style('left', '50%');
    sizeAdjustPanel.style('transform', 'translateX(-50%)');
    sizeAdjustPanel.style('background', 'rgba(40, 40, 40, 0.95)');
    sizeAdjustPanel.style('padding', '15px 25px');
    sizeAdjustPanel.style('border-radius', '12px');
    sizeAdjustPanel.style('border', '2px solid rgba(255, 255, 255, 0.2)');
    sizeAdjustPanel.style('box-shadow', '0 8px 32px rgba(0, 0, 0, 0.5)');
    sizeAdjustPanel.style('z-index', '1000');
    sizeAdjustPanel.style('display', 'flex');
    sizeAdjustPanel.style('align-items', 'center');
    sizeAdjustPanel.style('gap', '15px');

    // Text Size Controls
    let label = createSpan('Text Size:').parent(sizeAdjustPanel);
    label.style('color', 'white');
    label.style('font-family', 'system-ui, -apple-system, sans-serif');
    label.style('font-size', '14px');

    let decreaseBtn = createButton('−').parent(sizeAdjustPanel);
    decreaseBtn.style('width', '40px');
    decreaseBtn.style('height', '40px');
    decreaseBtn.style('font-size', '24px');
    decreaseBtn.style('background', '#444');
    decreaseBtn.style('color', 'white');
    decreaseBtn.style('border', 'none');
    decreaseBtn.style('border-radius', '8px');
    decreaseBtn.style('cursor', 'pointer');
    decreaseBtn.mousePressed(() => adjustTextSize(-2));

    let sizeDisplay = createSpan('0').parent(sizeAdjustPanel).id('size-display');
    sizeDisplay.style('color', 'white');
    sizeDisplay.style('font-family', 'monospace');
    sizeDisplay.style('font-size', '16px');
    sizeDisplay.style('min-width', '60px');
    sizeDisplay.style('text-align', 'center');

    let increaseBtn = createButton('+').parent(sizeAdjustPanel);
    increaseBtn.style('width', '40px');
    increaseBtn.style('height', '40px');
    increaseBtn.style('font-size', '24px');
    increaseBtn.style('background', '#444');
    increaseBtn.style('color', 'white');
    increaseBtn.style('border', 'none');
    increaseBtn.style('border-radius', '8px');
    increaseBtn.style('cursor', 'pointer');
    increaseBtn.mousePressed(() => adjustTextSize(2));

    // Leading Controls (for funfact only)
    let leadingContainer = createDiv('').parent(sizeAdjustPanel).id('leading-container');
    leadingContainer.style('display', 'none');
    leadingContainer.style('gap', '10px');
    leadingContainer.style('align-items', 'center');
    leadingContainer.style('border-left', '1px solid rgba(255, 255, 255, 0.2)');
    leadingContainer.style('padding-left', '15px');
    leadingContainer.style('margin-left', '5px');

    let leadingLabel = createSpan('Leading:').parent(leadingContainer);
    leadingLabel.style('color', 'white');
    leadingLabel.style('font-family', 'system-ui, -apple-system, sans-serif');
    leadingLabel.style('font-size', '14px');

    let decreaseLeadingBtn = createButton('−').parent(leadingContainer);
    decreaseLeadingBtn.style('width', '40px');
    decreaseLeadingBtn.style('height', '40px');
    decreaseLeadingBtn.style('font-size', '24px');
    decreaseLeadingBtn.style('background', '#444');
    decreaseLeadingBtn.style('color', 'white');
    decreaseLeadingBtn.style('border', 'none');
    decreaseLeadingBtn.style('border-radius', '8px');
    decreaseLeadingBtn.style('cursor', 'pointer');
    decreaseLeadingBtn.mousePressed(() => adjustTextLeading(-2));

    let leadingDisplay = createSpan('0').parent(leadingContainer).id('leading-display');
    leadingDisplay.style('color', 'white');
    leadingDisplay.style('font-family', 'monospace');
    leadingDisplay.style('font-size', '16px');
    leadingDisplay.style('min-width', '60px');
    leadingDisplay.style('text-align', 'center');

    let increaseLeadingBtn = createButton('+').parent(leadingContainer);
    increaseLeadingBtn.style('width', '40px');
    increaseLeadingBtn.style('height', '40px');
    increaseLeadingBtn.style('font-size', '24px');
    increaseLeadingBtn.style('background', '#444');
    increaseLeadingBtn.style('color', 'white');
    increaseLeadingBtn.style('border', 'none');
    increaseLeadingBtn.style('border-radius', '8px');
    increaseLeadingBtn.style('cursor', 'pointer');
    increaseLeadingBtn.mousePressed(() => adjustTextLeading(2));

    // Reset Button
    let resetBtn = createButton('↻').parent(sizeAdjustPanel);
    resetBtn.style('width', '40px');
    resetBtn.style('height', '40px');
    resetBtn.style('font-size', '20px');
    resetBtn.style('background', '#336688');
    resetBtn.style('color', 'white');
    resetBtn.style('border', 'none');
    resetBtn.style('border-radius', '8px');
    resetBtn.style('cursor', 'pointer');
    resetBtn.style('margin-left', '10px');
    resetBtn.mousePressed(resetTextBoxToDefault);

    // Close Button
    let closeBtn = createButton('✕').parent(sizeAdjustPanel);
    closeBtn.style('width', '40px');
    closeBtn.style('height', '40px');
    closeBtn.style('font-size', '18px');
    closeBtn.style('background', '#883333');
    closeBtn.style('color', 'white');
    closeBtn.style('border', 'none');
    closeBtn.style('border-radius', '8px');
    closeBtn.style('cursor', 'pointer');
    closeBtn.mousePressed(() => {
        selectedTextBox = null;
        sizeAdjustPanel.style('display', 'none');
        if (currentView === 'ratings') {
            printAlbum();
        } else {
            printCoverScreen();
        }
    });
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

    // Clear image cache
    cachedImageUrl = null;
    cachedOriginalImage = null;
    cachedFilteredImage = null;

    // Clear canvas
    background(200);

    // Clear localStorage
    localStorage.removeItem('albumGeneratorData');
}

function toggleView() {
    if (currentView === 'ratings') {
        currentView = 'cover';
        viewToggleBtn.html('View Cover');
    } else {
        currentView = 'ratings';
        viewToggleBtn.html('View Ratings');
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
                grade: track.gradeSelect.value(),
                customNumber: track.customNumber || null,
                customText: track.textInput ? track.textInput.value().trim() : null
            });
        }
    }

    albumData = {
        title: titleInput.value() || '',
        artist: artistInput.value() || '',
        year: yearInput.value() || '',
        genre: genreInput.value() || '',
        funfact: funfactInput.value() || '',
        tracks: tracksData,
        imageUrl: imageUrlInput.value() || '',
        albumGrade: albumGradeSelect.value()
    };

    if (!albumData.imageUrl) return;

    let albumName = titleInput.value() || '';
    let artistName = artistInput.value() || '';
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

    // Add double-click functionality to make number editable
    trackNumSpan.elt.addEventListener('dblclick', () => {
        let currentText = trackNumSpan.html().replace('.', '');
        let input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'track-number-input';
        input.style.width = '40px';
        input.style.textAlign = 'center';

        // Replace span with input
        trackNumSpan.elt.replaceWith(input);
        input.focus();
        input.select();

        let finishEdit = () => {
            let newValue = input.value.trim();
            if (newValue === '') {
                newValue = (trackIndex + 1).toString();
            }
            trackNumSpan.html(newValue + '.');
            input.replaceWith(trackNumSpan.elt);

            // Update custom number in tracks array
            let track = tracks.find(t => t.numSpan === trackNumSpan);
            if (track) {
                track.customNumber = newValue;
            }

            autoGeneratePreview();
            captureState();
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                trackNumSpan.html((trackIndex + 1) + '.');
                input.replaceWith(trackNumSpan.elt);
            }
        });
    });

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');
    titleIn.elt.addEventListener('input', autoGeneratePreview);
    titleIn.elt.addEventListener('blur', captureState);
    titleIn.elt.addEventListener('keydown', (e) => {
        let currentIndex = tracks.findIndex(t => t.titleInput === titleIn);

        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < tracks.length - 1) {
                // Focus next track
                tracks[currentIndex + 1].titleInput.elt.focus();
            } else if (e.key === 'Enter') {
                // Last track + Enter - add a new one and focus it
                addTrackRow();
                tracks[tracks.length - 1].titleInput.elt.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                // Focus previous track
                tracks[currentIndex - 1].titleInput.elt.focus();
            }
        }
    });

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    for (let grade of gradeOptions) {
        gradeSelect.option(grade);
    }
    gradeSelect.selected('B');
    gradeSelect.changed(() => {
        autoGeneratePreview();
        captureState();
    });

    // Text button to add custom text inside the rectangle
    let textBtn = createButton('T').parent(rowDiv).class('track-text-btn');
    let textInputContainer = createDiv('').parent(rowDiv).class('track-text-input-container');
    textInputContainer.style('display', 'none');
    let textInput = createInput('').parent(textInputContainer).class('track-text-input');
    textInput.attribute('placeholder', 'Text inside rect...');
    textInput.elt.addEventListener('input', autoGeneratePreview);
    textInput.elt.addEventListener('blur', captureState);

    textBtn.mousePressed(() => {
        if (textInputContainer.style('display') === 'none') {
            textInputContainer.style('display', 'block');
            textInput.elt.focus();
        } else {
            textInputContainer.style('display', 'none');
        }
    });

    let removeBtn = createButton('×').parent(rowDiv).class('track-remove-btn');
    removeBtn.mousePressed(() => removeTrackRow(trackIndex));

    tracks.push({
        titleInput: titleIn,
        gradeSelect: gradeSelect,
        rowDiv: rowDiv,
        numSpan: trackNumSpan,
        customNumber: null, // Store custom number if set
        customText: null, // Store custom text to display inside rectangle
        textInput: textInput,
        textInputContainer: textInputContainer
    });

    // Only capture state if history stack is not empty (i.e., not during initial setup)
    if (historyStack.length > 0) {
        captureState();
    }
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
    autoGeneratePreview();
}

// Auto-generate preview with debouncing to avoid too many redraws
let autoGenerateTimeout = null;
function autoGeneratePreview() {
    // Clear any pending timeout
    if (autoGenerateTimeout) {
        clearTimeout(autoGenerateTimeout);
    }

    // Set a new timeout to generate after a short delay (300ms)
    autoGenerateTimeout = setTimeout(() => {
        generateFromForm();
    }, 300);
}

function generateFromForm() {
    let tracksData = [];
    for (let track of tracks) {
        let title = track.titleInput.value().trim();
        if (title) {
            tracksData.push({
                title: title,
                grade: track.gradeSelect.value(),
                customNumber: track.customNumber || null,
                customText: track.textInput ? track.textInput.value().trim() : null
            });
        }
    }

    albumData = {
        title: titleInput.value() || '',
        artist: artistInput.value() || '',
        year: yearInput.value() || '',
        genre: genreInput.value() || '',
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
                grade: track.gradeSelect.value(),
                customNumber: track.customNumber || null,
                customText: track.textInput ? track.textInput.value().trim() : null
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
        for (let i = 0; i < data.tracks.length; i++) {
            let track = data.tracks[i];
            addTrackRow();
            let lastTrack = tracks[tracks.length - 1];
            lastTrack.titleInput.value(track.title || '');
            lastTrack.gradeSelect.selected(track.grade || 'B');

            // Restore custom number if exists
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber + '.');
            }

            // Restore custom text if exists
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.style('display', 'block');
            }
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
            grade: track.gradeSelect.value(),
            customNumber: track.customNumber || null,
            customText: track.textInput ? track.textInput.value() : null
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
            // Generate the preview if data was loaded
            generateFromForm();
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

// Load and cache images with filters
async function loadAndCacheImages(url) {
    // Check if we already have this image cached
    if (cachedImageUrl === url && cachedOriginalImage && cachedFilteredImage) {
        return {
            original: cachedOriginalImage,
            filtered: cachedFilteredImage
        };
    }

    // Load the image
    let img = await loadImageSafe(url);

    // Create a copy for filtering
    let imgBW = img.get();

    // Apply filters to the copy
    imgBW.filter(GRAY);
    imgBW.filter(BLUR, 2);
    imgBW.filter(ERODE);
    imgBW = dimImage(imgBW, 190);

    // Cache everything
    cachedImageUrl = url;
    cachedOriginalImage = img;
    cachedFilteredImage = imgBW;

    return {
        original: img,
        filtered: imgBW
    };
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
    // Use rectMode and position the text box centered
    let boxWidth = width - 100;
    text(message, 50, height / 2 + 120, boxWidth);

    textSize(24);
    fill(120);
    text('Check the image URL and try again', width / 2, height / 2 + 200);
}

// Draw a placeholder in the image area when no image is available
function drawImagePlaceholder(x, y, w, h, isCornerMode = true) {
    push();
    if (isCornerMode) {
        rectMode(CORNER);
    } else {
        rectMode(CENTER);
    }

    // Dark background for the placeholder
    fill(60);
    noStroke();
    rect(x, y, w, h);

    // Calculate center of the placeholder
    let centerX = isCornerMode ? x + w / 2 : x;
    let centerY = isCornerMode ? y + h / 2 : y;

    // Icon
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(w * 0.15);
    text('🖼', centerX, centerY - h * 0.1);

    // Text
    textFont(fontLight);
    textSize(w * 0.06);
    fill(120);
    text('No Image', centerX, centerY + h * 0.15);

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

    // Save the selected box ID before clearing
    let selectedId = selectedTextBox ? selectedTextBox.id : null;

    // Clear textBoxes array at the start
    textBoxes = [];

    let y = 50
    let imgOff = 200
    let sizeSclMult = 0.425
    let hasImage = false;
    let imgBW, img;

    // Try to load image if URL is provided
    if (albumData.imageUrl && albumData.imageUrl.trim() !== '') {
        try {
            let images = await loadAndCacheImages(albumData.imageUrl);
            img = images.original;
            imgBW = images.filtered;
            hasImage = true;
        }
        catch (err) {
            console.error('Failed to load image:', err);
            showToast('Failed to load image. Check the URL.', true);
            hasImage = false;
        }
    }

    // Draw background (blurred image or dark gray)
    if (hasImage) {
        imageMode(CENTER);
        image(imgBW, width * 0.5, height * 0.5, height, height);
    } else {
        background(50);
    }

    imageMode(CORNER)
    rectMode(CORNER)

    // Draw album cover or placeholder
    utils.beginShadow("#000000", 50, 0, 0);
    if (hasImage) {
        rect(width * 0.52, y + imgOff, width * sizeSclMult, width * sizeSclMult);
        image(img, width * 0.52, y + imgOff, width * sizeSclMult, width * sizeSclMult);
    } else {
        drawImagePlaceholder(width * 0.52, y + imgOff, width * sizeSclMult, width * sizeSclMult, true);
    }
    utils.endShadow();


    let leftMargin = 50
    let topMargin = 80
    let titleMaxWidth = width

    if(!albumData) return;

    //blendMode(DIFFERENCE);

    //TITLE
    utils.beginShadow("#000000", 20, 0, 0);
    textAlign(LEFT, TOP);
    textFont(fontHeavy);

    // Use persistent size offset
    let titleSize = getMaxTextSize(albumData.title, titleMaxWidth - leftMargin * 2, 100) + textSizeOffsets.title;
    titleSize = max(10, titleSize); // Minimum size

    textSize(titleSize);
    fill(255);
    textLeading(70);
    text(albumData.title, leftMargin, topMargin + y);

    // Get bounds and store in textBoxes
    let titleBounds = fontHeavy.textBounds(albumData.title, leftMargin, topMargin + y, titleMaxWidth - leftMargin * 2);
    textBoxes.push({
        id: 'title',
        x: titleBounds.x,
        y: titleBounds.y,
        w: titleBounds.w,
        h: titleBounds.h,
        sizeOffset: textSizeOffsets.title,
        currentSize: titleSize
    });

    textAlign(LEFT, TOP);


    // ARTIST
    textFont(fontRegularCondensed);
    textLeading(50);

    let artistSize = 45 + textSizeOffsets.artist;
    artistSize = max(10, artistSize);

    textSize(artistSize);
    fill(255);
    text(albumData.artist, leftMargin, topMargin + y + 110, width * 0.35);

    let bbox = fontRegularCondensed.textBounds(albumData.artist, leftMargin, topMargin + y + 110, width * 0.35);
    textBoxes.push({
        id: 'artist',
        x: bbox.x,
        y: bbox.y,
        w: bbox.w,
        h: bbox.h,
        sizeOffset: textSizeOffsets.artist,
        currentSize: artistSize
    });

    // YEAR
    y += bbox.h;
    textFont(fontLight);
    textLeading(60);

    let yearSize = 38 + textSizeOffsets.year;
    yearSize = max(10, yearSize);

    textSize(yearSize);
    fill(230);

    // Calculate year position - it's displayed after a newline
    let yearTextY = topMargin + y + 85 + 60; // Adding line height from the \n
    text("\n" + albumData.year + "\n", leftMargin, topMargin + y + 85, width * 0.35);

    let yearBounds = fontLight.textBounds(albumData.year, leftMargin, yearTextY, width * 0.35);
    textBoxes.push({
        id: 'year',
        x: yearBounds.x,
        y: yearBounds.y,
        w: yearBounds.w,
        h: yearBounds.h,
        sizeOffset: textSizeOffsets.year,
        currentSize: yearSize
    });

    // GENRES
    let genreSize = 30 + textSizeOffsets.genre;
    genreSize = max(10, genreSize);

    textSize(genreSize);
    textLeading(40);
    let genreText = shortenText(albumData.genre, width * 0.35);

    // Genre is displayed after 3 newlines (3 * 40 leading)
    let genreTextY = topMargin + y + 75 + (40 * 3);
    text("\n\n\n" + genreText, leftMargin, topMargin + y + 75, width * 0.35);

    let genreBounds = fontLight.textBounds(genreText, leftMargin, genreTextY, width * 0.35);
    textBoxes.push({
        id: 'genre',
        x: genreBounds.x,
        y: genreBounds.y,
        w: genreBounds.w,
        h: genreBounds.h,
        sizeOffset: textSizeOffsets.genre,
        currentSize: genreSize
    });

    // funfact
    let funfactSize = 30 + textSizeOffsets.funfact;
    funfactSize = max(10, funfactSize);

    let funfactLeading = 40 + textLeadingOffsets.funfact;
    funfactLeading = max(10, funfactLeading);

    textSize(funfactSize);
    fill(230);

    // Fixed position for funfact - use constant leading for the spacing before
    let funfactStartY = topMargin + y + 120 + (40 * 4);

    // Set leading only for the actual funfact text
    textLeading(funfactLeading);

    // Draw the spacer with default leading, then the funfact with custom leading
    textLeading(40);
    text("\n\n\n\n", leftMargin, topMargin + y + 120, width * 0.35);

    textLeading(funfactLeading);
    text(albumData.funfact, leftMargin, funfactStartY, width * 0.425);

    let funfactBounds = fontLight.textBounds(albumData.funfact, leftMargin, funfactStartY, width * 0.425);
    textBoxes.push({
        id: 'funfact',
        x: funfactBounds.x,
        y: funfactBounds.y,
        w: funfactBounds.w,
        h: funfactBounds.h,
        sizeOffset: textSizeOffsets.funfact,
        currentSize: funfactSize
    });

    utils.endShadow();

    //y level for tracks
    y = 820
    let x = 275

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

        // Draw custom text or GOAT inside rectangle
        if (track.customText && track.customText.trim() !== '') {
            push()
            // Draw custom text inside rectangle
            blendMode(BLEND)
            textAlign(CENTER, CENTER);
            fill(0, 160);
            textFont(fontRegularCondensed);
            // Calculate text size to fit inside rectangle with padding
            let maxTextWidth = w - 40; // padding of 8 on each side
            let customTextSize = getMaxTextSize(track.customText, maxTextWidth, 32);
            textSize(customTextSize);
            text(track.customText, (leftMargin + x) * 0.5, trackY - rectCenterOffset);
            textSize(60);
            blendMode(BLEND);
            pop()
        }

        // Draw text with custom number if available
        fill(255)
        textAlign(LEFT, BASELINE);
        let trackNumber = track.customNumber || (i + 1).toString();
        text(shortenText(trackNumber + ". " + track.title + (track.playing ? " " + musicChar : ""), 700), leftMargin + x, trackY);

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

    let offYFinalRect = 0

    rect(0, height - gradeRectHeight + offYFinalRect, width, gradeRectHeight, 20, 20, 0, 0);

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
    text(namingMap[albumData.albumGrade] || albumData.albumGrade, width * 0.5, height - gradeRectHeight * 0.43 + offYFinalRect);
    utils.endShadow();

    // Restore selection after redraw
    if (selectedId) {
        selectedTextBox = textBoxes.find(b => b.id === selectedId);
    }

    // Draw selection outline if a text box is selected
    if (selectedTextBox) {
        push()
        noFill();
        stroke(255);
        strokeWeight(3);
        rectMode(CORNER);
        let padding = 5;
        rect(selectedTextBox.x - padding, selectedTextBox.y - padding,
             selectedTextBox.w + padding * 2, selectedTextBox.h + padding * 2, 5);
        noStroke();
        pop()
    }
}

async function printCoverScreen() {
    background(200);

    // Save the selected box ID before clearing
    let selectedId = selectedTextBox ? selectedTextBox.id : null;

    // Clear textBoxes array at the start
    textBoxes = [];

    let coverSize = width * 0.8;
    let coverY = height * 0.42;
    let hasImage = false;
    let imgBW, img;

    // Try to load image if URL is provided
    if (albumData.imageUrl && albumData.imageUrl.trim() !== '') {
        try {
            let images = await loadAndCacheImages(albumData.imageUrl);
            img = images.original;
            imgBW = images.filtered;
            hasImage = true;
        } catch (err) {
            console.error('Failed to load image:', err);
            showToast('Failed to load image. Check the URL.', true);
            hasImage = false;
        }
    }

    // Draw blurred background or dark gray
    if (hasImage) {
        imageMode(CENTER);
        image(imgBW, width * 0.5, height * 0.5, height, height);
    } else {
        background(50);
    }

    // "Album Review" text at top
    utils.beginShadow("#000000", 30, 0, 0);
    textAlign(CENTER, TOP);
    textFont(fontLight);
    textSize(55);
    fill(255);
    text("Album Review", width * 0.5, 260);
    utils.endShadow();

    imageMode(CENTER);
    rectMode(CENTER);

    // Draw album cover or placeholder
    utils.beginShadow("#000000", 80, 0, 0);
    if (hasImage) {
        rect(width * 0.5, coverY, coverSize, coverSize);
        image(img, width * 0.5, coverY, coverSize, coverSize);
    } else {
        drawImagePlaceholder(width * 0.5, coverY, coverSize, coverSize, false);
    }
    utils.endShadow();

    // Album title below image
    utils.beginShadow("#000000", 20, 0, 0);
    textAlign(CENTER, TOP);
    textFont(fontHeavy);
    let titleY = coverY + coverSize * 0.5 + 60;

    // Title with size adjustment
    let titleSize = getMaxTextSize(albumData.title, width - 100, 100) + textSizeOffsets.title;
    titleSize = max(10, titleSize);

    textSize(titleSize);
    fill(255);
    text(albumData.title, width * 0.5, titleY);

    let titleBounds = fontHeavy.textBounds(albumData.title, width * 0.5, titleY, width - 100);
    textBoxes.push({
        id: 'title',
        x: titleBounds.x,
        y: titleBounds.y,
        w: titleBounds.w,
        h: titleBounds.h,
        sizeOffset: textSizeOffsets.title,
        currentSize: titleSize
    });

    // Artist name below title
    textFont(fontRegularCondensed);

    let artistSize = 45 + textSizeOffsets.artist;
    artistSize = max(10, artistSize);

    textSize(artistSize);
    fill(230);
    text(albumData.artist, width * 0.5, titleY + 130);

    let artistBounds = fontRegularCondensed.textBounds(albumData.artist, width * 0.5, titleY + 130, width - 100);
    textBoxes.push({
        id: 'artist',
        x: artistBounds.x,
        y: artistBounds.y,
        w: artistBounds.w,
        h: artistBounds.h,
        sizeOffset: textSizeOffsets.artist,
        currentSize: artistSize
    });

    utils.endShadow();

    // Restore selection after redraw
    if (selectedId) {
        selectedTextBox = textBoxes.find(b => b.id === selectedId);
    }

    // Draw selection outline if a text box is selected
    if (selectedTextBox) {
        noFill();
        stroke(255);
        strokeWeight(3);
        rectMode(CORNER);
        let padding = 5;
        rect(selectedTextBox.x - padding, selectedTextBox.y - padding,
             selectedTextBox.w + padding * 2, selectedTextBox.h + padding * 2, 5);
        noStroke();
    }
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
    if(frameCount % 60 === 0){
        autoGeneratePreview();
    }
}

function mousePressed() {
    // Get canvas element and its bounding rect
    let canvasEl = document.querySelector('canvas');
    let canvasRect = canvasEl.getBoundingClientRect();

    // Calculate the actual mouse position on the canvas accounting for scale
    // The canvas is scaled via CSS transform, so we need to convert screen coords to canvas coords
    let scaledMouseX = (mouseX / canvasScale);
    let scaledMouseY = (mouseY / canvasScale);

    // Check if click is on the size adjustment panel or any of its children
    if (sizeAdjustPanel && sizeAdjustPanel.style('display') !== 'none') {
        let panel = sizeAdjustPanel.elt;
        let panelRect = panel.getBoundingClientRect();

        // Calculate actual mouse position in viewport
        let mouseClientX = mouseX + canvasRect.left;
        let mouseClientY = mouseY + canvasRect.top;

        // Check if mouse is over the panel
        if (mouseClientX >= panelRect.left && mouseClientX <= panelRect.right &&
            mouseClientY >= panelRect.top && mouseClientY <= panelRect.bottom) {
            // Click is on the panel, ignore it
            return;
        }
    }

    // Only handle clicks on the canvas (using scaled coordinates)
    if (scaledMouseX < 0 || scaledMouseX > width || scaledMouseY < 0 || scaledMouseY > height) {
        return;
    }

    // Check if any text box was clicked (using scaled coordinates)
    let clickedBox = null;
    for (let i = 0; i < textBoxes.length; i++) {
        let box = textBoxes[i];
        if (scaledMouseX >= box.x && scaledMouseX <= box.x + box.w &&
            scaledMouseY >= box.y && scaledMouseY <= box.y + box.h) {
            clickedBox = box;
            break;
        }
    }

    if (clickedBox) {
        // Only redraw if selection changed
        let selectionChanged = !selectedTextBox || selectedTextBox.id !== clickedBox.id;
        selectedTextBox = clickedBox;
        showSizeAdjustPanel(clickedBox);

        if (selectionChanged) {
            // Redraw to show selection
            if (currentView === 'ratings') {
                printAlbum();
            } else {
                printCoverScreen();
            }
        }
    } else {
        // Clicked outside any text box - deselect
        if (selectedTextBox) {
            selectedTextBox = null;
            sizeAdjustPanel.style('display', 'none');
            if (currentView === 'ratings') {
                printAlbum();
            } else {
                printCoverScreen();
            }
        }
    }
}

function showSizeAdjustPanel(box) {
    let sizeDisplay = select('#size-display');
    if (box.sizeOffset !== undefined) {
        sizeDisplay.html(box.sizeOffset >= 0 ? '+' + box.sizeOffset : box.sizeOffset);
    } else {
        sizeDisplay.html(box.baseSize || '0');
    }

    // Show leading controls only for funfact
    let leadingContainer = select('#leading-container');
    if (box.id === 'funfact') {
        leadingContainer.style('display', 'flex');
        let leadingDisplay = select('#leading-display');
        let leadingOffset = textLeadingOffsets.funfact || 0;
        leadingDisplay.html(leadingOffset >= 0 ? '+' + leadingOffset : leadingOffset);
    } else {
        leadingContainer.style('display', 'none');
    }

    sizeAdjustPanel.style('display', 'flex');
}

function adjustTextSize(delta) {
    if (!selectedTextBox) return;

    // Update the persistent offset
    if (textSizeOffsets.hasOwnProperty(selectedTextBox.id)) {
        textSizeOffsets[selectedTextBox.id] += delta;
        selectedTextBox.sizeOffset = textSizeOffsets[selectedTextBox.id];
    }

    // Capture state for undo/redo
    captureState();

    showSizeAdjustPanel(selectedTextBox);

    // Redraw
    if (currentView === 'ratings') {
        printAlbum();
    } else {
        printCoverScreen();
    }
}

function adjustTextLeading(delta) {
    if (!selectedTextBox || selectedTextBox.id !== 'funfact') return;

    // Update the persistent leading offset
    textLeadingOffsets.funfact += delta;

    // Capture state for undo/redo
    captureState();

    showSizeAdjustPanel(selectedTextBox);

    // Redraw
    if (currentView === 'ratings') {
        printAlbum();
    } else {
        printCoverScreen();
    }
}

function resetTextBoxToDefault() {
    if (!selectedTextBox) return;

    // Reset size offset
    if (textSizeOffsets.hasOwnProperty(selectedTextBox.id)) {
        textSizeOffsets[selectedTextBox.id] = 0;
        selectedTextBox.sizeOffset = 0;
    }

    // Reset leading offset if funfact
    if (selectedTextBox.id === 'funfact') {
        textLeadingOffsets.funfact = 0;
    }

    // Capture state for undo/redo
    captureState();

    showSizeAdjustPanel(selectedTextBox);

    // Redraw
    if (currentView === 'ratings') {
        printAlbum();
    } else {
        printCoverScreen();
    }
}

// ============ UNDO/REDO FUNCTIONS ============

function captureState() {
    if (isUndoRedoAction) return;

    let tracksData = [];
    for (let track of tracks) {
        tracksData.push({
            title: track.titleInput.value(),
            grade: track.gradeSelect.value(),
            customNumber: track.customNumber || null,
            customText: track.textInput ? track.textInput.value() : null
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
        tracks: tracksData,
        textSizeOffsets: {...textSizeOffsets},
        textLeadingOffsets: {...textLeadingOffsets}
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

    // Restore text size offsets
    if (state.textSizeOffsets) {
        textSizeOffsets.title = state.textSizeOffsets.title || 0;
        textSizeOffsets.artist = state.textSizeOffsets.artist || 0;
        textSizeOffsets.year = state.textSizeOffsets.year || 0;
        textSizeOffsets.genre = state.textSizeOffsets.genre || 0;
        textSizeOffsets.funfact = state.textSizeOffsets.funfact || 0;
    }

    // Restore text leading offsets
    if (state.textLeadingOffsets) {
        textLeadingOffsets.funfact = state.textLeadingOffsets.funfact || 0;
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

            // Restore custom number if exists
            if (track.customNumber) {
                lastTrack.customNumber = track.customNumber;
                lastTrack.numSpan.html(track.customNumber + '.');
            }

            // Restore custom text if exists
            if (track.customText && track.customText.trim() !== '') {
                lastTrack.textInput.value(track.customText);
                lastTrack.textInputContainer.style('display', 'block');
            }
        }
    } else {
        addTrackRowWithoutCapture();
    }

    // Regenerate the album with restored state
    generateFromForm();
}

function addTrackRowWithoutCapture() {
    let trackIndex = tracks.length;
    let rowDiv = createDiv('').parent(trackContainer).class('track-row');

    let trackNumSpan = createSpan((trackIndex + 1) + '.').parent(rowDiv).class('track-number');

    // Add double-click functionality to make number editable
    trackNumSpan.elt.addEventListener('dblclick', () => {
        let currentText = trackNumSpan.html().replace('.', '');
        let input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'track-number-input';
        input.style.width = '40px';
        input.style.textAlign = 'center';

        // Replace span with input
        trackNumSpan.elt.replaceWith(input);
        input.focus();
        input.select();

        let finishEdit = () => {
            let newValue = input.value.trim();
            if (newValue === '') {
                newValue = (trackIndex + 1).toString();
            }
            trackNumSpan.html(newValue + '.');
            input.replaceWith(trackNumSpan.elt);

            // Update custom number in tracks array
            let track = tracks.find(t => t.numSpan === trackNumSpan);
            if (track) {
                track.customNumber = newValue;
            }

            autoGeneratePreview();
            captureState();
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                trackNumSpan.html((trackIndex + 1) + '.');
                input.replaceWith(trackNumSpan.elt);
            }
        });
    });

    let titleIn = createInput('').parent(rowDiv).class('track-title-input');
    titleIn.attribute('placeholder', 'Track title');

    let gradeSelect = createSelect().parent(rowDiv).class('track-grade-select');
    for (let grade of gradeOptions) {
        gradeSelect.option(grade);
    }
    gradeSelect.selected('B');

    // Text button to add custom text inside the rectangle
    let textBtn = createButton('T').parent(rowDiv).class('track-text-btn');
    let textInputContainer = createDiv('').parent(rowDiv).class('track-text-input-container');
    textInputContainer.style('display', 'none');
    let textInput = createInput('').parent(textInputContainer).class('track-text-input');
    textInput.attribute('placeholder', 'Text inside rect...');
    textInput.elt.addEventListener('input', autoGeneratePreview);
    textInput.elt.addEventListener('blur', captureState);

    textBtn.mousePressed(() => {
        if (textInputContainer.style('display') === 'none') {
            textInputContainer.style('display', 'block');
            textInput.elt.focus();
        } else {
            textInputContainer.style('display', 'none');
        }
    });

    let removeBtn = createButton('×').parent(rowDiv).class('track-remove-btn');
    removeBtn.mousePressed(() => {
        removeTrackRow(tracks.indexOf(tracks.find(t => t.rowDiv === rowDiv)));
    });

    tracks.push({
        titleInput: titleIn,
        gradeSelect: gradeSelect,
        rowDiv: rowDiv,
        numSpan: trackNumSpan,
        customNumber: null,
        customText: null,
        textInput: textInput,
        textInputContainer: textInputContainer
    });
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
