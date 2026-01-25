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
const gradeOptions = ['GOAT', 'S', 'A', 'B', 'C', 'D', 'F', 'Interlude', 'None'];
let verticalOffsetSlider, verticalOffsetLabel;
let horizontalOffsetSlider, horizontalOffsetLabel;
let imageSizeMultiplierSlider, imageSizeMultiplierLabel;
let maxTextboxWidthSlider, maxTextboxWidthLabel;

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
const defaultMaxTextboxWidths = { title: 980, artist: 378, year: 378, genre: 378, funfact: 459 };

// Track customization
let tracksTextSize = 60;
let tracksSpacing = 0; // Added to base spacing calculation
let tracksRectHeight = 40;
let tracksTextSizeSlider, tracksSpacingSlider, tracksRectHeightSlider;
let tracksTextSizeLabel, tracksSpacingLabel, tracksRectHeightLabel;

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
let colorMap = { "GOAT": "#ffffff", "S": "#ffd21f", "A": "#ff1fa9", "B": "#bc3fde", "C": "#38b6ff", "D": "#14b60b", "F": "#902020", "Interlude": "#b2b2b2" };
const defaultColorMap = {...colorMap};
let colorPickers = {}, canvasScale = 1;

// Profile system
let profiles = {};
let currentProfileName = 'Default';
let profileSelect, profileNameInput;

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
    updateProfileSelect(); // Update profile dropdown after loading profiles
    loadFromLocalStorage();
    loadCustomColors();
    loadLastProfile();
    captureState();

    setInterval(saveToLocalStorage, 1000);
    document.addEventListener('keydown', handleKeyboard);
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
    // Header
    let header = createDiv('').parent(editorPanel).class('panel-header');
    createElement('h2', 'Album Editor').parent(header);
    createElement('p', 'Drag & drop JSON or fill manually').parent(header);

    // Basic inputs
    let rowGroupAlbum = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');
    titleInput = createFormInput('Album Title', 'Enter album title...', rowGroupAlbum);
    artistInput = createFormInput('Artist', 'Enter artist name...', rowGroupAlbum);

    let rowGroup = createDiv('').parent(editorPanel).style('display: flex; gap: 12px;');
    yearInput = createFormInput('Year', 'e.g. 1997', rowGroup);
    genreInput = createFormInput('Genre', 'e.g. Rock', rowGroup);

    funfactInput = createFormTextarea('Fun Fact', 'Add an interesting fact about the album...');
    createImageInputWithUpload();

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
    createProfileSection();
    createTracksCustomizationSection();
    createColorSection();
    createAdvancedOptionsSection();
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

function createImageInputWithUpload() {
    let group = createDiv('').parent(editorPanel).class('form-group');
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
    verticalOffsetSlider = createSlider(-700, 700, 0, 1).parent(container).class('form-slider');
    verticalOffsetLabel = createSpan('0').parent(container).class('slider-value');

    let sliderTimeout = null;
    verticalOffsetSlider.input(() => {
        if (!selectedTextBox) return;
        let value = verticalOffsetSlider.value();
        verticalOffsetLabel.html(value);

        // Store offset in the correct object based on current view
        if (currentView === 'ratings') {
            verticalOffsetsRatings[selectedTextBox.id] = value;
        } else {
            verticalOffsetsCover[selectedTextBox.id] = value;
        }

        if (albumData) {
            currentView === 'ratings' ? printAlbum() : printCoverScreen();
        }

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

    // Aspect Ratio & Image Format selectors
    let aspectRatioRow = createDiv('').parent(buttonGrid).style('display: flex; gap: 12px; margin-bottom: 10px;');

    // Aspect Ratio selector (half width)
    let aspectRatioGroup = createDiv('').parent(aspectRatioRow).class('form-group').style('flex: 1; margin-bottom: 0;');
    createElement('label', 'Aspect Ratio (Ratings)').parent(aspectRatioGroup);
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

function createProfileSection() {
    createDiv('').parent(editorPanel).class('section-divider');
    let profileSection = createDiv('').parent(editorPanel).class('color-section');
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

    createButton('Apply').parent(selectRow).class('btn btn-primary').style('width: 70px; padding: 8px;').mousePressed(applySelectedProfile);
    createButton('Delete').parent(selectRow).class('btn btn-danger').style('width: 70px; padding: 8px;').mousePressed(deleteSelectedProfile);

    // Save new profile row
    let saveRow = createDiv('').parent(profileContent).style('display: flex; gap: 8px;');

    let nameGroup = createDiv('').parent(saveRow).class('form-group').style('flex: 1; margin-bottom: 0;');
    profileNameInput = createInput('').parent(nameGroup).class('form-input');
    profileNameInput.attribute('placeholder', 'New profile name...');

    createButton('Save').parent(saveRow).class('btn btn-secondary').style('width: 70px; padding: 8px;').mousePressed(saveNewProfile);
}

function getDefaultProfile() {
    return {
        tracksTextSize: 60,
        tracksSpacing: 0,
        tracksRectHeight: 40,
        tracksVerticalOffset: 0,
        colorMap: {...defaultColorMap},
        aspectRatio: '9:16',
        imageFormat: 'png',
        showGradeLegend: true
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
        showGradeLegend: showGradeLegend
    };
}

function applyProfile(profileData) {
    // Apply tracks customization
    tracksTextSize = profileData.tracksTextSize || 60;
    tracksSpacing = profileData.tracksSpacing || 0;
    tracksRectHeight = profileData.tracksRectHeight || 40;
    verticalOffsetsRatings.tracks = profileData.tracksVerticalOffset || 0;

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

function createTracksCustomizationSection() {
    createDiv('').parent(editorPanel).class('section-divider');
    let tracksSection = createDiv('').parent(editorPanel).class('color-section');
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

function createAdvancedOptionsSection() {
    createDiv('').parent(editorPanel).class('section-divider');
    let advancedSection = createDiv('').parent(editorPanel).class('color-section');
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

    // Horizontal Offset slider
    let horizOffsetRow = createDiv('').parent(advancedContent).class('slider-row');
    createSpan('Horizontal Offset').parent(horizOffsetRow).class('slider-label');
    let horizOffsetContainer = createDiv('').parent(horizOffsetRow).class('slider-container');
    horizontalOffsetSlider = createSlider(-500, 500, 0, 1).parent(horizOffsetContainer).class('form-slider');
    horizontalOffsetLabel = createSpan('0').parent(horizOffsetContainer).class('slider-value');

    // Initially disable
    horizontalOffsetSlider.attribute('disabled', '');
    horizontalOffsetSlider.addClass('disabled');

    horizontalOffsetSlider.input(() => {
        if (!selectedTextBox) return;
        let value = horizontalOffsetSlider.value();
        horizontalOffsetLabel.html(value);

        if (currentView === 'ratings') {
            horizontalOffsetsRatings[selectedTextBox.id] = value;
        } else {
            horizontalOffsetsCover[selectedTextBox.id] = value;
        }

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
    imageSizeMultiplierSlider.changed(() => captureState());

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

    // Reset button
    createButton('Reset Advanced Options').parent(advancedContent).class('btn btn-secondary').style('margin-top', '12px').mousePressed(() => {
        imageSizeMultiplier = 1.0;
        imageSizeMultiplierSlider.value(1.0);
        imageSizeMultiplierLabel.html('1.0x');

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

function updateHorizontalOffsetSlider() {
    if (!horizontalOffsetSlider) return;

    if (selectedTextBox) {
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
        horizontalOffsetLabel.html('0');
    }
}

function updateMaxTextboxWidthSlider() {
    if (!maxTextboxWidthSlider) return;

    if (selectedTextBox && selectedTextBox.id !== 'tracks' && selectedTextBox.id !== 'image') {
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
    lastUrlChecked = null;
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
    data.aspectRatio = currentAspectRatio;
    data.imageFormat = currentImageFormat;
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
    let imageX = width * 0.52 + imageHorizOffset;
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
    let titleHorizOffset = horizontalOffsetsRatings.title || 0;
    let titleMaxWidth = maxTextboxWidths.title || defaultMaxTextboxWidths.title;
    drawTextWithBox('title', fontHeavy, getMaxTextSize(albumData.title, titleMaxWidth, 100) + textSizeOffsets.title,
                     albumData.title, leftMargin + titleHorizOffset, topMargin + y + titleOffset, titleMaxWidth, 70);

    let artistOffset = verticalOffsetsRatings.artist || 0;
    let artistHorizOffset = horizontalOffsetsRatings.artist || 0;
    let artistMaxWidth = maxTextboxWidths.artist || defaultMaxTextboxWidths.artist;
    let bbox = drawTextWithBox('artist', fontRegularCondensed, 45 + textSizeOffsets.artist,
                                albumData.artist, leftMargin + artistHorizOffset, topMargin + y + 110 + artistOffset, artistMaxWidth, 50);
    y += bbox.h;

    let yearOffset = verticalOffsetsRatings.year || 0;
    let yearHorizOffset = horizontalOffsetsRatings.year || 0;
    let yearMaxWidth = maxTextboxWidths.year || defaultMaxTextboxWidths.year;
    let yearY = topMargin + y + 85 + 60 + yearOffset;
    textFont(fontLight); textLeading(60); textSize(38 + textSizeOffsets.year); fill(230);
    text("\n" + albumData.year + "\n", leftMargin + yearHorizOffset, topMargin + y + 85 + yearOffset, yearMaxWidth);
    addTextBox('year', fontLight.textBounds(albumData.year, leftMargin + yearHorizOffset, yearY, yearMaxWidth), 38 + textSizeOffsets.year);

    let genreOffset = verticalOffsetsRatings.genre || 0;
    let genreHorizOffset = horizontalOffsetsRatings.genre || 0;
    let genreMaxWidth = maxTextboxWidths.genre || defaultMaxTextboxWidths.genre;
    textSize(30 + textSizeOffsets.genre); textLeading(40);
    let genreText = shortenText(albumData.genre, genreMaxWidth);
    let genreY = topMargin + y + 75 + (40 * 3) + genreOffset;
    text("\n\n\n" + genreText, leftMargin + genreHorizOffset, topMargin + y + 75 + genreOffset, genreMaxWidth);
    addTextBox('genre', fontLight.textBounds(genreText, leftMargin + genreHorizOffset, genreY, genreMaxWidth), 30 + textSizeOffsets.genre);

    let funfactOffset = verticalOffsetsRatings.funfact || 0;
    let funfactHorizOffset = horizontalOffsetsRatings.funfact || 0;
    let funfactMaxWidth = maxTextboxWidths.funfact || defaultMaxTextboxWidths.funfact;
    let funfactSize = 30 + textSizeOffsets.funfact;
    let funfactLeading = 40 + textLeadingOffsets.funfact;
    let funfactStartY = topMargin + y + 120 + (40 * 4) + funfactOffset;
    textLeading(40); text("\n\n\n\n", leftMargin + funfactHorizOffset, topMargin + y + 120 + funfactOffset, funfactMaxWidth);
    textSize(funfactSize); textLeading(funfactLeading); text(albumData.funfact, leftMargin + funfactHorizOffset, funfactStartY, funfactMaxWidth);
    addTextBox('funfact', fontLight.textBounds(albumData.funfact, leftMargin + funfactHorizOffset, funfactStartY, funfactMaxWidth), funfactSize);
    utils.endShadow();

    // Draw tracks
    push()
    y = 820; let x = 275;
    let spacing = Math.min(map(albumData.tracks.length, 5, 20, 80, 45, true), 70) + tracksSpacing;
    textFont(fontRegular); textSize(tracksTextSize); textAlign(LEFT, BASELINE);
    rectMode(CENTER); let w = (leftMargin + x) * 0.75, h = tracksRectHeight;
    let tracksVertOffset = verticalOffsetsRatings.tracks || 0;
    let tracksHorizOffset = horizontalOffsetsRatings.tracks || 0;

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
        if(track.grade == 'S') utils.beginShadow(colorMap[track.grade], 35, 0, 0);
        rect((leftMargin + x) * 0.5 + tracksHorizOffset, trackY - rectCenterOffset, w, h, 20);
        if(track.grade == 'GOAT' || track.grade == 'S') utils.endShadow();

        if (track.customText && track.customText.trim() !== '') {
            push(); blendMode(BLEND); textAlign(CENTER, CENTER); fill(0, 160); textFont(fontRegularCondensed);
            let customTextSize = getMaxTextSize(track.customText, w - 40, 32);
            textSize(customTextSize); text(track.customText, (leftMargin + x) * 0.5 + tracksHorizOffset, trackY - rectCenterOffset);
            textSize(tracksTextSize); pop();
        }

        fill(255); textAlign(LEFT, BASELINE);
        let trackNumber = track.customNumber || (i + 1).toString();
        text(shortenText(trackNumber + ". " + track.title + (track.playing ? " " + musicChar : ""), 700), leftMargin + x + tracksHorizOffset, trackY);
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
        let legendGrades = ['GOAT', 'S', 'A', 'B', 'C'];
        let legendLabels = ['GOAT', '10', '9', '8', '7'];
        let legendPadding = 15; // Padding between legend and big rectangle
        let legendRectHeight = tracksRectHeight;
        let legendY = imageY + imageSize + legendPadding * 1

        let leftMargin = imageX
        let totalWidth = imageSize
        let gapBetween = 12;
        let rectWidth = (totalWidth - (gapBetween * 4)) / 5;

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
            textSize(getMaxTextSize(label, rectWidth - 10, 28));
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
        let namingMap = { "GOAT": "GOAT", "S": "PEAK", "A": "EXCEPTIONAL", "B": "STRONG", "C": "DECENT", "D": "MEH", "F": "FLOP", "Interlude": "INTERLUDE" };
        textAlign(CENTER, CENTER); fill(255); textFont(fontHeavy); textSize(85);
        utils.beginShadow("#ffffffa3", 30, 0, 0);
        text(namingMap[albumData.albumGrade] || albumData.albumGrade, width * 0.5, gradeRectY + gradeRectHeight * 0.57);
        utils.endShadow();
        pop()
    }

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
    let titleVertOffset = verticalOffsetsCover.title || 0;
    let titleHorizOffset = horizontalOffsetsCover.title || 0;
    let titleY = coverY + coverSize * 0.5 + 60 + titleVertOffset;
    textFont(fontHeavy);
    let titleSize = getMaxTextSize(albumData.title, width - 100, 100) + textSizeOffsets.title;
    titleSize = max(10, titleSize);
    textSize(titleSize); fill(255); text(albumData.title, width * 0.5 + titleHorizOffset, titleY);
    addTextBox('title', fontHeavy.textBounds(albumData.title, width * 0.5 + titleHorizOffset, titleY, width - 100), titleSize);

    let artistVertOffset = verticalOffsetsCover.artist || 0;
    let artistHorizOffset = horizontalOffsetsCover.artist || 0;
    let artistY = coverY + coverSize * 0.5 + 60 + 130 + artistVertOffset;
    textFont(fontRegularCondensed);
    let artistSize = getMaxTextSize(albumData.artist, width - 100, 50) + textSizeOffsets.artist;
    textSize(artistSize); fill(230); text(albumData.artist, width * 0.5 + artistHorizOffset, artistY);
    addTextBox('artist', fontRegularCondensed.textBounds(albumData.artist, width * 0.5 + artistHorizOffset, artistY, width - 100), artistSize);
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
        verticalOffsetLabel.html('0');
    }

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
        aspectRatio: currentAspectRatio,
        imageFormat: currentImageFormat,
        showGradeLegend: showGradeLegend,
        tracks: tracks.map(t => ({ title: t.titleInput.value(), grade: t.gradeSelect.value(),
                                    customNumber: t.customNumber || null, customText: t.textInput ? t.textInput.value() : null })),
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
        tracksRectHeight: tracksRectHeight
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

    if (state.textSizeOffsets) Object.assign(textSizeOffsets, state.textSizeOffsets);
    if (state.textLeadingOffsets) textLeadingOffsets.funfact = state.textLeadingOffsets.funfact || 0;
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