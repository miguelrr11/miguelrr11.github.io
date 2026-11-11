// Album Rating Generator for Social Media
// Miguel Rodríguez — made to speed up posting album reviews (@thethirdeye)
//
// Entry point: p5 setup, global keyboard / drag-and-drop / paste handling and the
// phone layout.
'use strict';

p5.disableFriendlyErrors = true;
const showToast = UI.toast;      // name the AI panel uses

const FONT_FILES = {
    fontRegular: 'fonts/Vidaloka-Regular.ttf',
    fontRegularItalic: 'fonts/Coolvetica Rg It.otf',
    fontRegularCrammed: 'fonts/Coolvetica Rg Cram.otf',
    fontRegularCondensed: 'fonts/groteskMed.ttf',
    fontHeavy: 'fonts/grotesk.otf',
    fontLight: 'fonts/groteskLight.ttf'
};

// The canvas density is the export resolution, so the preview is exactly what gets saved.
function applyExportScale() {
    if (typeof pixelDensity !== 'function' || !App.doc) return;
    const want = Math.max(1, Math.min(3, Number(App.doc.export.scale) || 2));
    if (pixelDensity() !== want) { pixelDensity(want); Glitch.drop(); }
}

async function setup() {
    // Fonts are loaded one after another, in this order: several of the files share
    // a family name, and the browser resolves them by registration order.
    const ready = App.init();
    for (const k of Object.keys(FONT_FILES)) Fonts[k] = await loadFont(FONT_FILES[k]);
    await ready;

    pixelDensity(Math.max(1, Math.min(3, Number(App.doc.export.scale) || 2)));
    const canvas = createCanvas(Model.WIDTH, Model.HEIGHT);
    canvas.parent('canvas-scaler');
    noLoop();
    isSafariLike = detectSafariLike();

    TopBar.init();
    Stage.init();
    Content.init();
    Tracks.init();
    Design.init();
    SelBar.init();
    Mobile.init();
    App.on(what => { if (what === 'glitch' || what === 'doc') setTimeout(() => GlitchPanel.showTiming(), 400); });
    App.on(what => { if (what === 'colors') { Tracks.build(); Content.paintGrade(); } });

    setupGlobalInput();
    window.addEventListener('beforeunload', () => { History.flush(); App.saveNow(); });
    document.body.classList.add('ready');
    await Render.now();
    window.appReady = true;
    if (isSafariLike && !isMobile()) UI.toast('Safari renders canvas text slightly differently — Chrome or Firefox give the most accurate result.');
}

function draw() { Anim.frame(); }

// ─── global input ─────────────────────────────────────────────────────────────
function setupGlobalInput() {
    // Undo steps end where a new gesture starts: whatever was typed or dragged before
    // this click / focus change becomes its own step instead of merging with the next.
    document.addEventListener('pointerdown', () => History.flush(), true);
    document.addEventListener('focusin', () => History.flush(), true);

    document.addEventListener('keydown', e => {
        const mod = e.metaKey || e.ctrlKey, typing = UI.isTyping();
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (document.querySelector('.dialog-back')) return;

        if (mod && key === 'z') { e.preventDefault(); History.go(e.shiftKey ? 1 : -1); }
        else if (mod && key === 'y') { e.preventDefault(); History.go(1); }
        else if (mod && key === 'e') { e.preventDefault(); Exporter.images(); }
        else if (mod && key === 's') { e.preventDefault(); Exporter.json(); }
        else if (mod && key === 'd' && !typing && App.selection.length) { e.preventDefault(); Actions.duplicate(App.selection); }
        else if (e.altKey && !mod && e.code === 'KeyN') { e.preventDefault(); TopBar.newReview(); }
        else if (e.altKey && !mod && /^Digit[1-9]$/.test(e.code)) {
            const page = App.doc.pages[Number(e.code.slice(5)) - 1];
            if (page) { e.preventDefault(); Actions.switchPage(page.id); }
        }
        else if (e.key === 'Escape') {
            if (UI.openMenu) UI.closeMenu();
            else if (SelBar.popOpen) SelBar.closePop();
            else if (typing) document.activeElement.blur();
            else Actions.select([]);
        }
        else if (!typing && App.selection.length) {
            const step = e.shiftKey ? 10 : 1;
            if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); Actions.removeElements(App.selection); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); Actions.nudge(-step, 0); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); Actions.nudge(step, 0); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); Actions.nudge(0, -step); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); Actions.nudge(0, step); }
        }
    });

    // drop a review JSON anywhere to open it, or an image to use it as the album cover
    const overlay = document.getElementById('drag-overlay');
    const isFileDrag = e => e.dataTransfer && [...e.dataTransfer.types].includes('Files');
    document.addEventListener('dragover', e => { if (isFileDrag(e)) { e.preventDefault(); overlay.classList.add('active'); } });
    document.addEventListener('dragleave', e => { if (e.relatedTarget === null) overlay.classList.remove('active'); });
    document.addEventListener('drop', e => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        overlay.classList.remove('active');
        const file = e.dataTransfer.files[0];
        if (!file) return;
        if (file.name.toLowerCase().endsWith('.json')) Exporter.loadJsonFile(file);
        else if (file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name)) Actions.setAlbumImageFile(file);
        else UI.toast('Drop a review .json or an image', true);
    });

    // paste an image (outside a text field) → album cover
    document.addEventListener('paste', e => {
        if (UI.isTyping()) return;
        const item = [...(e.clipboardData ? e.clipboardData.items : [])].find(i => i.type.startsWith('image/'));
        if (item) { e.preventDefault(); Actions.setAlbumImageFile(item.getAsFile()); UI.toast('Pasted image set as the album cover'); }
    });
}

// ─── phone layout ─────────────────────────────────────────────────────────────
// One full-width section at a time, switched from a bottom tab bar. Inert on desktop.
const Mobile = {
    SECTIONS: [['preview', 'Preview', 'image'], ['content', 'Album', 'compact-disc'], ['tracks', 'Tracks', 'music'], ['design', 'Design', 'sliders']],
    buttons: {},

    init() {
        const bar = document.getElementById('mobile-tabbar');
        for (const [id, label, icon] of this.SECTIONS) {
            const b = UI.h('button.mtab-btn', { type: 'button', onclick: () => this.show(id) }, UI.icon(icon), UI.h('span', label));
            this.buttons[id] = b;
            bar.appendChild(b);
        }
        this.show('preview');
    },

    show(id) {
        document.body.setAttribute('data-mtab', id);
        for (const k of Object.keys(this.buttons)) this.buttons[k].classList.toggle('active', k === id);
        if (isMobile() && id === 'preview') { Stage.layout(); Render.request(); }
    }
};
