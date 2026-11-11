// Intro animation of a sheet page (art slides in, title drops, tracks rise, the
// description types itself) and its recording to a video file.
'use strict';

const ANIM_FRAMES = 11 * 60;        // elements travelling to their end position
const ANIM_HOLD_FRAMES = 3 * 60;    // everything at rest — only the title wave moves
const RECORD_FPS = 60;
const RECORD_TAIL_FRAMES = 10 * 60; // recorded after the elements land (wave still running)
const RECORD_FADE_FRAMES = 45;      // …of which the last ones fade the glow out

// ─── title glow wave ──────────────────────────────────────────────────────────
// The title is rendered once into a buffer with a white halo baked in; per frame
// only a horizontal gradient mask changes, so glyph positions never move.
const TITLE_GLOW = { BLUR: 45, PAD: 100, STOPS: 48, SPEED: 1 / 110, BASE: 0.22, PEAK: 0.85, SHARP: 4, BREATHE: 0.045, FADE: 0.06, FADE_OUT: 0.09 };
const titleGlow = { active: false, amt: 0, phase: 0, t: 0, key: null, layer: null, mask: null };

function updateTitleGlow() {
    titleGlow.t++;
    titleGlow.phase = (titleGlow.phase + TITLE_GLOW.SPEED) % 1;
    titleGlow.amt = titleGlow.active ? lerp(titleGlow.amt, 1, TITLE_GLOW.FADE) : lerp(titleGlow.amt, 0, TITLE_GLOW.FADE_OUT);
    if (!titleGlow.active && titleGlow.amt < 0.01) titleGlow.amt = 0;
}

function titleGlowAlphaAt(p) {
    const band = Math.pow(0.5 + 0.5 * Math.cos(TWO_PI * (p - titleGlow.phase)), TITLE_GLOW.SHARP);
    const breathe = 0.5 + 0.5 * Math.sin(titleGlow.t * TITLE_GLOW.BREATHE);
    return Math.min(1, Math.max(0, (TITLE_GLOW.BASE * (0.6 + 0.4 * breathe) + band * TITLE_GLOW.PEAK) * titleGlow.amt));
}

function buildTitleGlowLayer(font, size, str, maxWidth, leading, align, verAlign) {
    if (titleGlow.layer) { titleGlow.layer.glow.remove(); titleGlow.mask.remove(); }
    push();
    textFont(font); textSize(size); textLeading(leading);
    textAlign(getP5Align(align), verAlign);
    const b = font.textBounds(getRichText(str), 0, 0, maxWidth);
    pop();
    const ox = Math.floor(b.x - TITLE_GLOW.PAD), oy = Math.floor(b.y - TITLE_GLOW.PAD);
    const w = Math.ceil(b.w + TITLE_GLOW.PAD * 2), h = Math.ceil(b.h + TITLE_GLOW.PAD * 2);
    const glyphs = createGraphics(w, h);
    glyphs.textFont(font); glyphs.textSize(size); glyphs.textLeading(leading);
    glyphs.textAlign(getP5Align(align), verAlign);
    glyphs.noStroke(); glyphs.fill(255);
    glyphs.text(getRichText(str), -ox, -oy, maxWidth);
    const glow = createGraphics(w, h);
    const ctx = glow.drawingContext;
    ctx.shadowColor = '#ffffff';
    for (const blur of [TITLE_GLOW.BLUR, TITLE_GLOW.BLUR * 0.4]) { ctx.shadowBlur = blur; glow.image(glyphs, 0, 0); }
    glyphs.remove();
    titleGlow.layer = { glow, ox, oy, w, h };
    titleGlow.mask = createGraphics(w, h);
}

function drawTitleGlowWave(font, size, str, x, y, maxWidth, leading, align, verAlign) {
    if (titleGlow.amt <= 0.01 || !str || str.trim() === '' || align === 'justify') return;
    const key = [str, size, maxWidth, leading, align, verAlign].join('|');
    if (titleGlow.key !== key) { buildTitleGlowLayer(font, size, str, maxWidth, leading, align, verAlign); titleGlow.key = key; }
    const L = titleGlow.layer, m = titleGlow.mask;
    m.clear();
    m.image(L.glow, 0, 0);
    const mctx = m.drawingContext;
    mctx.save();
    mctx.globalCompositeOperation = 'destination-in';
    const grad = mctx.createLinearGradient(0, 0, L.w, 0);
    for (let i = 0; i <= TITLE_GLOW.STOPS; i++) { const p = i / TITLE_GLOW.STOPS; grad.addColorStop(p, 'rgba(255,255,255,' + titleGlowAlphaAt(p).toFixed(3) + ')'); }
    mctx.fillStyle = grad;
    mctx.fillRect(0, 0, L.w, L.h);
    mctx.restore();
    push();
    imageMode(CORNER);
    drawingContext.save();
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = 'rgba(0,0,0,0)';
    drawingContext.globalCompositeOperation = 'lighter';
    image(m, x + L.ox, y + L.oy, L.w, L.h);
    drawingContext.restore();
    pop();
}

// ─── animation ────────────────────────────────────────────────────────────────
const Anim = {
    playing: false, recording: false, t: 0, page: null, moves: [], saved: null,
    funLen: 0, spacing: 0, barAlpha: 0, tail: 0,
    VEL: { image: 0.015, title: 0.015, tracks: 0.0125, artist: 0.016, year: 0.015, genre: 0.014, funfact: 0.013 },
    recCanvas: null, recCtx: null, recorder: null, chunks: [],

    start() {
        const page = this.page = App.page();
        this.saved = { pos: Model.clone(page.pos), spacing: page.tracks.spacing };
        const pos = page.pos, end = id => ({ x: this.saved.pos[id].x, y: this.saved.pos[id].y });
        this.moves = [];
        const add = (id, start) => { this.moves.push({ id, end: end(id) }); pos[id].x = start.x; pos[id].y = start.y; };
        add('image', { x: -800, y: 0 });
        add('title', { x: pos.title.x, y: -250 });
        add('tracks', { x: pos.tracks.x, y: 1000 });
        let delta = 800, i = 1;
        for (const id of ['artist', 'year', 'genre', 'funfact']) { add(id, { x: pos[id].x + delta, y: pos[id].y }); delta += i * 50; i++; }
        this.funLen = 0; this.spacing = 1000; this.barAlpha = 0; this.t = 0;
        titleGlow.active = true; titleGlow.amt = 1; titleGlow.phase = 0; titleGlow.t = 0;
        this.playing = true;
        loop();
    },

    restore() {
        if (!this.saved) return;
        this.page.pos = this.saved.pos;
        this.page.tracks.spacing = this.saved.spacing;
        this.saved = null;
    },

    stop() {
        this.playing = false;
        this.restore();
        this.barAlpha = 255;
        titleGlow.active = this.recording;
        if (!this.recording) { titleGlow.amt = 0; noLoop(); Render.request(); }
        else { this.tail = RECORD_TAIL_FRAMES; this.drawFrame(true); }
    },

    drawFrame(atRest) {
        const page = this.page, doc = App.doc;
        const rc = buildRenderContext(doc, page, {
            anim: { plainTitle: true, skipImages: true, hideNote: !atRest && this.t <= 7.5 * 60, gradeBarTrans: this.barAlpha, titleGlow: drawTitleGlowWave }
        });
        rc.img = Images.peek(rc.album.imageUrl);
        rc.hasImage = !!rc.img;
        rc.backdropImg = rc.hasImage && !rc.transparent && page.backdrop.mode === 'art' ? Images.backdrop(rc.album.imageUrl, rc.img, page.backdrop) : null;
        if (!atRest) {
            rc.album.funfact = rc.album.funfact.substring(0, this.funLen);
            rc.rich.funfact = rc.album.funfact;
            page.tracks.spacing = this.spacing;
        }
        drawPage(rc, new Map());
        if (!atRest) page.tracks.spacing = this.saved ? this.saved.spacing : page.tracks.spacing;
    },

    // called from p5's draw() while the loop is running
    frame() {
        if (!this.playing && this.recording) {          // elements have landed: the wave carries the tail
            titleGlow.active = this.tail > RECORD_FADE_FRAMES;
            updateTitleGlow();
            this.drawFrame(true);
            this.grab();
            if (--this.tail <= 0) this.finishRecording();
            return;
        }
        if (!this.playing) return;
        this.t++;
        const pos = this.page.pos;
        for (const m of this.moves) {
            const v = this.VEL[m.id], p = pos[m.id];
            p.x = lerp(p.x, m.end.x, v); p.y = lerp(p.y, m.end.y, v);
            if (Math.abs(p.x - m.end.x) < 1) p.x = m.end.x;
            if (Math.abs(p.y - m.end.y) < 1) p.y = m.end.y;
        }
        const full = App.doc.album.funfact.length;
        this.funLen = Math.ceil(lerp(this.funLen, full, 0.001));
        this.spacing = lerp(this.spacing, this.saved.spacing, 0.015);
        if (this.t > 7.5 * 60) this.barAlpha = lerp(this.barAlpha, 255, 0.05);
        updateTitleGlow();
        this.drawFrame(false);
        if (this.recording) this.grab();
        if (this.t > ANIM_FRAMES + ANIM_HOLD_FRAMES) this.stop();
    },

    // ── recording ──
    pickFormat() {
        const candidates = [
            { mime: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4' }, { mime: 'video/mp4', ext: 'mp4' },
            { mime: 'video/webm;codecs=vp9', ext: 'webm' }, { mime: 'video/webm;codecs=vp8', ext: 'webm' }, { mime: 'video/webm', ext: 'webm' }
        ];
        return candidates.find(c => MediaRecorder.isTypeSupported(c.mime)) || null;
    },

    async record() {
        if (this.recording || this.playing) { UI.toast('An animation is already running.', true); return; }
        if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) { UI.toast('Video recording is not supported in this browser.', true); return; }
        const page = App.page();
        if (page.base !== 'sheet' || !page.show.tracks) { UI.toast('Switch to the Ratings page to record the animation.', true); return; }
        const format = this.pickFormat();
        if (!format) { UI.toast('No supported video format found in this browser.', true); return; }
        if (!App.doc.album.imageUrl) { UI.toast('Add an image before recording.', true); return; }

        Actions.select([]);
        History.flush();
        await Render.now();                               // warms the image caches the frames read from
        let exportHeight = Model.exportHeight(page);
        if (exportHeight % 2 !== 0) exportHeight--;       // H.264 needs even dimensions
        this.recCanvas = document.createElement('canvas');
        this.recCanvas.width = Model.WIDTH; this.recCanvas.height = exportHeight;
        this.recCtx = this.recCanvas.getContext('2d');
        const stream = this.recCanvas.captureStream(RECORD_FPS);
        this.chunks = [];
        this.recorder = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 20000000 });
        this.recorder.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
        this.recorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            UI.download(new Blob(this.chunks, { type: format.mime }), Model.baseFileName(App.doc) + ' - Animation.' + format.ext);
            this.chunks = []; this.recCanvas = this.recCtx = this.recorder = null;
            UI.toast('Animation downloaded.');
        };
        this.tail = 0;
        this.recording = true;
        document.body.classList.add('recording');
        frameRate(RECORD_FPS);
        this.recorder.start();
        this.start();
        UI.toast('Recording animation…');
    },

    grab() {
        if (!this.recCtx) return;
        const d = pixelDensity();
        this.recCtx.clearRect(0, 0, this.recCanvas.width, this.recCanvas.height);
        this.recCtx.drawImage(drawingContext.canvas, 0, 0, Model.WIDTH * d, this.recCanvas.height * d, 0, 0, Model.WIDTH, this.recCanvas.height);
    },

    finishRecording() {
        this.recording = false;
        titleGlow.active = false; titleGlow.amt = 0;
        document.body.classList.remove('recording');
        if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
        noLoop();
        Render.request();
    }
};
