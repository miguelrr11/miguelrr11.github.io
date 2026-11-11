// Page renderer. A render has two phases: every image the page needs is loaded
// first (async), then the page is drawn in one synchronous pass — so two renders
// can never interleave their drawing commands.
//
// Two base layouts exist:
//   cover  – big centered album art with the glitch stretch, title below
//   sheet  – art + header + track list + legend + grade bar (each block optional)
// Both draw the page's custom images and textboxes on top.
'use strict';

// Every position/size constant of the sheet layout. Canvas px unless the name
// says "Ratio" (fraction of the canvas width).
const LAYOUT = {
    leftMargin: 50,
    cover: { xRatio: 0.05, y: 250, sizeRatio: 0.425 },
    header: {
        top: 130, rightColumnXRatio: 0.475,
        title: { leading: 70 },
        artist: { offsetY: 120, fontSize: 45, leading: 50 },
        // offsets below are measured from header.top + the artist block height
        year: { offsetY: 145, fontSize: 38, leading: 60 },
        genre: { offsetY: 195, fontSize: 30, leading: 40 },
        funfact: { offsetY: 280, fontSize: 30, leading: 40 }
    },
    tracks: {
        startY: 820,
        textIndent: 295,
        titleIndent: { oneColumn: -15, twoColumns: 15 },
        pillWidthFactorOneColumn: 0.70, pillWidthFactorTwoColumns: 0.85,
        columnShift: 485, horizOffsetFix: 30,
        titleMaxWidth: { oneColumn: 900, twoColumns: 290 },
        rowSpacing: { fewTracks: 5, manyTracks: 20, max: 80, min: 45, cap: 70 },
        goatGlowBlur: 50, peakGlowBlur: 35, goatTitleGlowBlur: 20,
        pillLabel: { maxFontSize: 28, widthPad: 20, heightSlack: 5, nudgeY: 2 },
        note: { x: 90, maxWidth: { oneColumn: 900, twoColumns: 330 }, topGap: 20, bottomGap: 35, lineWeight: 7, lineInset: 15 },
        hitbox: { padY: 50, rightExtent: 700 }
    },
    legend: {
        compactThreshold: 6, topPadding: 15, gap: 12,
        labelMaxFontSize: { byWidth: 26, byHeight: 30 }, labelWidthPad: 10, labelHeightSlack: 5, labelNudgeY: 2
    },
    gradeBar: { textYFactor: 0.57 }
};
const GOAT_GRADIENT_STOPS = [0, 0.2, 0.38, 0.59, 1];

// ════════════════════════════ image loading ════════════════════════════

const Images = {
    cache: new Map(),       // url → { img } | { error, at }
    filtered: new Map(),    // url + settings → backdrop image

    loadRaw(url) {
        return new Promise((resolve, reject) => loadImage(url, img => resolve(img), err => reject(err || new Error('load failed'))));
    },

    // p5.Image for a URL / uploaded asset, or null when it cannot be loaded.
    async get(url) {
        if (!url || !String(url).trim()) return null;
        const hit = this.cache.get(url);
        if (hit) {
            if (hit.img) return hit.img;
            if (hit.pending) return hit.pending;
            if (Date.now() - hit.at < 8000) return null;       // failed recently — don't hammer it
        }
        const real = Assets.resolve(url);
        if (!real) { this.cache.set(url, { error: true, at: Date.now() }); return null; }
        const pending = this.loadRaw(real).then(img => {
            this.cache.set(url, { img });
            if (this.cache.size > 24) this.cache.delete(this.cache.keys().next().value);
            return img;
        }).catch(() => {
            const first = !(hit && hit.error);
            this.cache.set(url, { error: true, at: Date.now() });
            if (first) UI.toast('Could not load an image — check the URL.', true);
            return null;
        });
        this.cache.set(url, { pending });
        return pending;
    },

    peek(url) { const hit = this.cache.get(url); return hit && hit.img ? hit.img : null; },
    forget(url) { this.cache.delete(url); },

    // Darkened / blurred copy of the album art used behind every page.
    backdrop(url, img, b) {
        const key = url + '|' + [b.gray, b.blur, b.erode, b.dim].join(',');
        let out = this.filtered.get(key);
        if (out) return out;
        out = img.get();
        if (b.gray) out.filter(GRAY);
        if (b.blur > 0) out.filter(BLUR, b.blur);
        if (b.erode) out.filter(ERODE);
        if (b.dim > 0) {
            const t = b.dim / 255;
            out.loadPixels();
            const px = out.pixels;
            for (let i = 0; i < px.length; i += 4) {
                px[i] = (0 - px[i]) * t + px[i];
                px[i + 1] = (0 - px[i + 1]) * t + px[i + 1];
                px[i + 2] = (0 - px[i + 2]) * t + px[i + 2];
            }
            out.updatePixels();
        }
        if (this.filtered.size > 6) this.filtered.delete(this.filtered.keys().next().value);
        this.filtered.set(key, out);
        return out;
    }
};

// ════════════════════════════ render context ════════════════════════════

let RC = null;   // context of the page being drawn

function buildRenderContext(doc, page, extra) {
    const rt = Model.resolveTracks(doc, page);
    const album = Object.assign({}, doc.album, { tracks: Model.usableTracks(doc.tracks) });
    const genres = doc.album.genre.split(/,\s*/g).map(s => s.trim()).filter(Boolean);
    const rc = Object.assign({
        doc, page, album, tracks: rt.list, allTracks: rt.all, trackOffset: rt.offset,
        colors: doc.colors.map, goat: doc.colors.goat, exportH: Model.exportHeight(page),
        transparent: !!doc.export.transparent, exporting: false, boxes: [],
        img: null, backdropImg: null, hasImage: false, anim: null
    }, extra || {});
    rc.rich = Object.assign({}, album, {
        albumData: album, genreDescriptions, genres,
        genre1: genres[0] || '', genre2: genres[1] || '',
        genreDesc: i => genreDescriptions[genres[i]] || '',
        pageName: page.name, pageTracks: rt.list,
        playlistCount: Model.countGrades(rt.all, page.note.grades || ['GOAT', 'PEAK'])
    });
    return rc;
}

function addBox(id, bounds, size, extra) {
    RC.boxes.push(Object.assign({ id, x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h, currentSize: size || 0 }, extra || {}));
}

function gradeColor(grade) { return RC.colors[grade] || '#888888'; }

// ════════════════════════════ shared blocks ════════════════════════════

function drawBackdrop() {
    const b = RC.page.backdrop;
    if (RC.transparent) { clear(); return; }
    background(200);
    if (b.mode === 'art' && RC.backdropImg) {
        imageMode(CENTER);
        const s = height * (b.zoom || 1);
        image(RC.backdropImg, width * 0.5, height * 0.5, s, s);
    } else background(b.mode === 'art' ? 50 : color(b.color || '#323232'));
}

function drawImagePlaceholder(x, y, w, h, isCornerMode = true) {
    push();
    rectMode(isCornerMode ? CORNER : CENTER);
    fill(60); noStroke(); rect(x, y, w, h);
    const centerX = isCornerMode ? x + w / 2 : x, centerY = isCornerMode ? y + h / 2 : y;
    fill(100); textAlign(CENTER, CENTER); textSize(w * 0.15); _text('🖼', centerX, centerY - h * 0.1);
    textFont(Fonts.fontLight); textSize(w * 0.06); fill(120); _text('No Image', centerX, centerY + h * 0.15);
    pop();
}

// image(img, x, y, w, h) with optional rounded corners (corner mode).
function drawImageRounded(img, x, y, w, h, radius) {
    if (!radius) { image(img, x, y, w, h); return; }
    const ctx = drawingContext;
    // the shadow comes from the rounded backing shape, the picture is clipped into it
    push(); noStroke(); fill(0); rect(x, y, w, h, radius); pop();
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.clip();
    image(img, x, y, w, h);
    ctx.restore();
}

// Text rendered into a buffer and run through the title glitch (stretched to the
// canvas sides). (x, y) is the anchor for the given alignment.
function drawStylizedText(font, fontSz, str, x, y, hAlign, vAlign, opts, slot) {
    str = String(str == null ? '' : str);
    push();
    textFont(font);
    textSize(fontSz);

    const bbox = font.textBounds(str.replaceAll(' ', '.'), 0, 0, fontSz);
    const tw = Math.ceil(bbox.w - 20), th = Math.ceil(bbox.h + 50);   // padding so glyph overhang never clips
    if (!(tw > 0) || !(th > 0)) { pop(); return; }

    let cx = x, cy = y;
    if (hAlign === LEFT) cx = x + bbox.w / 2; else if (hAlign === RIGHT) cx = x - bbox.w / 2;
    if (vAlign === TOP) cy = y + bbox.h / 2; else if (vAlign === BOTTOM) cy = y - bbox.h / 2;

    const res = Glitch.get(slot, () => {
        const g = createGraphics(tw, th);
        g.textFont(font); g.noStroke(); g.fill(255); g.textSize(fontSz);
        g.textAlign(CENTER, CENTER);
        g.text(str, tw / 2, th / 2);
        return g;
    }, tw, th, { x: cx, y: cy }, opts, fontKey(font) + '|' + fontSz + '|' + str,
    { seed: RC.doc.glitch.seed, cacheSource: false, dispose: g => g.remove() });
    Glitch.draw(res);
    pop();
}

// ─── custom elements ──────────────────────────────────────────────────────────

function elementText(tb) {
    let s = getRichText(tb.text);
    s = s == null ? '' : String(s);
    return tb.uppercase ? s.toUpperCase() : s;
}

function applyTextStyle(tb) {
    const font = fontOf(tb.fontType);
    textFont(font);
    textSize(tb.fontSize);
    fill(tb.color);
    textLeading(tb.fontSize * 1.25 + (tb.leading || 0));
    return font;
}

// Height of a textbox as drawn (used by the auto-stack).
function measureTextElement(tb) {
    if (!tb.text) return 0;
    push();
    const font = applyTextStyle(tb);
    const h = font.textBounds(elementText(tb), 0, 0, tb.maxWidth || 500).h;
    pop();
    return h;
}

function reflowPageStack(page) {
    if (!page.stack) return;
    const heights = {};
    for (const id of page.stack.ids) {
        const tb = page.texts.find(t => t.id === id);
        if (tb) heights[id] = tb.hidden ? 0 : measureTextElement(tb);
    }
    Model.reflowStack(page, heights);
}

function drawCustomImages(loaded) {
    for (const el of RC.page.images) {
        if (el.hidden) continue;
        push();
        imageMode(CORNER); rectMode(CORNER);
        const w = el.w || 400;
        let h = w;
        const img = loaded.get(el.id) || null;
        if (img) h = w * (img.height / img.width);
        if (el.opacity < 1) drawingContext.globalAlpha = el.opacity;

        if (img) {
            if (el.glitch) {
                const res = Glitch.get(RC.page.id + ':img:' + el.id, () => img, w, h, { x: el.x + w / 2, y: el.y + h / 2 },
                    resolveGlitchOpts(RC.doc.glitch.image, RC.img), el.url + '|g', { seed: RC.doc.glitch.seed });
                Glitch.draw(res);
            }
            // no backing rect: the shadow follows the image's alpha
            beginShadow('#000000', el.shadow, 0, 0);
            drawImageRounded(img, el.x, el.y, w, h, el.radius);
            endShadow();
        } else if (!RC.exporting) drawImagePlaceholder(el.x, el.y, w, h, true);

        addBox(el.id, { x: el.x, y: el.y, w, h }, 0, { isCustom: true, isImage: true });
        pop();
    }
}

function drawCustomTextboxes() {
    push();
    for (const tb of RC.page.texts) {
        if (tb.hidden) continue;
        rectMode(CORNER);
        const align = tb.textAlign || 'left';
        const maxW = tb.maxWidth || 500;
        const font = applyTextStyle(tb);

        if (!tb.text) {            // empty: a small handle so it can still be grabbed
            addBox(tb.id, { x: tb.x, y: tb.y, w: 100, h: 40 }, tb.fontSize, { isCustom: true, empty: true });
            continue;
        }
        const str = elementText(tb);

        textAlign(getP5Align(align), TOP);
        const bounds = getAlignedBounds(font.textBounds(str, tb.x, tb.y, maxW), tb.x, align, maxW, font);

        push();
        if (tb.opacity < 1) drawingContext.globalAlpha = tb.opacity;
        if (tb.bg && tb.bg.on && str) {
            const c = color(tb.bg.color);
            push(); noStroke(); fill(red(c), green(c), blue(c), 255 * tb.bg.alpha);
            rect(bounds.x - tb.bg.pad, bounds.y - tb.bg.pad, bounds.w + tb.bg.pad * 2, bounds.h + tb.bg.pad * 2, tb.bg.radius);
            pop();
        }
        if (tb.glitch) {
            // drawStylizedText anchors on the left/center/right edge, tb.x is always the box's left edge
            let anchorX = tb.x;
            if (align === 'center') anchorX = tb.x + maxW / 2; else if (align === 'right') anchorX = tb.x + maxW;
            drawStylizedText(font, tb.fontSize, str, anchorX, tb.y + safariTextShift(true), getP5Align(align), TOP,
                RC.doc.glitch.title, RC.page.id + ':txt:' + tb.id);
        } else {
            beginShadow('#000000', tb.shadow, 0, 0);
            drawBoxText(str, tb.x, tb.y, maxW, align, TOP);
            endShadow();
        }
        pop();

        addBox(tb.id, { x: bounds.x, y: bounds.y, w: Math.max(bounds.w, 50), h: Math.max(bounds.h, 30) }, tb.fontSize, { isCustom: true });
    }
    pop();
}

// ════════════════════════════ sheet layout ════════════════════════════

function artRect() {
    const C = LAYOUT.cover, P = RC.page;
    return { x: width * C.xRatio + P.pos.image.x, y: C.y + P.pos.image.y, size: width * C.sizeRatio * P.art.scale };
}

function drawArt() {
    const P = RC.page, { x, y, size } = artRect();
    if (!P.show.art) return;
    beginShadow('#000000', P.art.shadow, 0, 0);
    if (RC.hasImage) {
        if (P.art.radius) drawImageRounded(RC.img, x, y, size, size, P.art.radius);
        else {
            noStroke(); fill(0);
            rect(x + 1, y + 1, size - 2, size - 2);   // backing rect so the shadow has a solid edge
            image(RC.img, x, y, size, size);
        }
    } else drawImagePlaceholder(x, y, size, size, true);
    endShadow();
    addBox('image', { x, y, w: size, h: size });
}

function drawTextWithBox(id, font, size, textStr, x, y, maxWidth, leading, align, verAlign, drawIt, addIt, drawYShift = 0) {
    push();
    size = max(10, size);
    textFont(font);
    textSize(size);
    fill(255);
    textLeading(leading);
    if (drawIt) drawBoxText(textStr, x, y + drawYShift, maxWidth, align, verAlign);
    textAlign(getP5Align(align), verAlign);
    const bbox = font.textBounds(getRichText(textStr), x, y, maxWidth);
    if (addIt) addBox(id, getAlignedBounds(bbox, x, align, maxWidth, font), size);
    pop();
    return bbox;
}

function drawHeader() {
    const H = LAYOUT.header, P = RC.page, A = RC.album;
    const leftMargin = LAYOUT.leftMargin;
    const rightColX = leftMargin + width * H.rightColumnXRatio;
    const plainTitle = !P.title.glitch || !!(RC.anim && RC.anim.plainTitle);

    beginShadow('#000000', P.header.shadow, 0, 0);

    if (P.show.title) {
        const titleMaxWidth = P.maxW.title;
        const tx = leftMargin + P.pos.title.x, ty = H.top + P.pos.title.y;
        textFont(Fonts.fontHeavy);
        const titleSize = getMaxTextSizeByWidth(A.title, titleMaxWidth, P.title.maxSize) + P.sizeOff.title;
        drawTextWithBox('title', Fonts.fontHeavy, titleSize, A.title, tx, ty, titleMaxWidth, H.title.leading, P.align.title, BOTTOM, plainTitle, true);
        if (!plainTitle) {
            drawStylizedText(Fonts.fontHeavy, titleSize, getRichText(A.title), tx, ty + safariTextShift(true), P.align.title, BOTTOM,
                RC.doc.glitch.title, P.id + ':title');
        }
        if (RC.anim && RC.anim.titleGlow) RC.anim.titleGlow(Fonts.fontHeavy, titleSize, A.title, tx, ty, titleMaxWidth, H.title.leading, P.align.title, BOTTOM);
    }

    const artistBox = drawTextWithBox('artist', Fonts.fontRegularCondensed, H.artist.fontSize + P.sizeOff.artist, A.artist,
        rightColX + P.pos.artist.x, H.top + H.artist.offsetY + P.pos.artist.y,
        P.maxW.artist, H.artist.leading, P.align.artist, BASELINE, P.show.artist, P.show.artist, safariTextShift());

    // year / genre / description shift down with the artist block height
    const blockTop = H.top + artistBox.h;
    fill(230);

    if (P.show.year) {
        const x = rightColX + P.pos.year.x, y = blockTop + H.year.offsetY + P.pos.year.y;
        const size = H.year.fontSize + P.sizeOff.year;
        textFont(Fonts.fontLight); textSize(size); textLeading(H.year.leading);
        drawBoxText(A.year, x, y + safariTextShift(), P.maxW.year, P.align.year);
        addBox('year', getAlignedBounds(Fonts.fontLight.textBounds(getRichText(A.year), x, y, P.maxW.year), x, P.align.year, P.maxW.year, Fonts.fontLight), size);
    }
    if (P.show.genre) {
        const x = rightColX + P.pos.genre.x, y = blockTop + H.genre.offsetY + P.pos.genre.y;
        const size = H.genre.fontSize + P.sizeOff.genre;
        textFont(Fonts.fontLight); textSize(size); textLeading(H.genre.leading);
        const genreText = shortenText(A.genre, P.maxW.genre);
        drawBoxText(genreText, x, y + safariTextShift(), P.maxW.genre, P.align.genre);
        addBox('genre', getAlignedBounds(Fonts.fontLight.textBounds(getRichText(genreText), x, y, P.maxW.genre), x, P.align.genre, P.maxW.genre, Fonts.fontLight), size);
    }
    if (P.show.funfact) {
        const x = rightColX + P.pos.funfact.x, y = blockTop + H.funfact.offsetY + P.pos.funfact.y;
        const size = H.funfact.fontSize + P.sizeOff.funfact;
        textFont(Fonts.fontRegularCondensed);
        textSize(size); textLeading(H.funfact.leading + P.leadOff.funfact);
        drawBoxText(A.funfact, x, y + safariTextShift(), P.maxW.funfact, P.align.funfact);
        // measured with the light font so the selection box keeps its historical size
        textFont(Fonts.fontLight);
        addBox('funfact', getAlignedBounds(Fonts.fontLight.textBounds(getRichText(A.funfact), x, y, P.maxW.funfact), x, P.align.funfact, P.maxW.funfact, Fonts.fontLight), size);
    }
    endShadow();
}

function trackRowSpacing(count, spacing) {
    const S = LAYOUT.tracks.rowSpacing;
    return Math.min(map(count, S.fewTracks, S.manyTracks, S.max, S.min, true), S.cap) + spacing;
}

// Index where the second column starts: the split that balances both column heights.
function middleTrackIndex() {
    const list = RC.tracks, TS = RC.page.tracks;
    if (list.length < 1) return 0;
    if (TS.split > 0) return Math.min(list.length, Math.floor(TS.split));
    const N = LAYOUT.tracks.note;
    push();
    textFont(Fonts.fontLight); textSize(TS.textSize * 0.7); textAlign(LEFT, TOP);
    const base = TS.rectHeight + trackRowSpacing(list.length, TS.spacing);
    const heights = list.map(track => {
        let h = base;
        if (track.customTextLarge) h += Fonts.fontLight.textBounds(getRichText(track.customTextLarge), 0, 0, N.maxWidth.twoColumns).h + N.topGap + N.bottomGap;
        return h;
    });
    pop();
    const midH = heights.reduce((a, b) => a + b, 0) * 0.5;
    let sum = 0;
    for (let i = 0; i < heights.length; i++) {
        sum += heights[i];
        if (sum >= midH) return i + 1;
    }
    return heights.length;
}

function drawTrackList() {
    const T = LAYOUT.tracks, P = RC.page, TS = P.tracks, list = RC.tracks;
    const leftMargin = LAYOUT.leftMargin;
    const twoColumns = !!TS.twoColumns;
    let textIndent = T.textIndent;
    const twoColumnsFix = twoColumns ? 25 : 0;

    // the grade pill sits left of the title; in two-column mode it shrinks and the title follows
    let pillW = (leftMargin + textIndent) * (twoColumns ? T.pillWidthFactorTwoColumns : T.pillWidthFactorOneColumn);
    if (twoColumns) { pillW *= 0.5; textIndent -= pillW; }
    const pillH = TS.rectHeight;
    const titleBaseX = leftMargin + textIndent;
    const pillCenterBaseX = titleBaseX * 0.5 + twoColumnsFix;
    const pillDrawW = pillW * (TS.pillScale || 1);

    const horizOffset = P.pos.tracks.x + T.horizOffsetFix;
    const columnTopY = T.startY + P.pos.tracks.y;
    const titleMaxWidth = twoColumns ? T.titleMaxWidth.twoColumns : T.titleMaxWidth.oneColumn;
    const rowSpacing = trackRowSpacing(list.length, TS.spacing);
    const font = fontOf(TS.font);

    push();
    textFont(font); textSize(TS.textSize); textAlign(LEFT, BASELINE);
    rectMode(CENTER);
    const pillCenterOffsetY = (textAscent() - textDescent()) / 2;   // centers pills on the title baseline
    const secondColumnStart = middleTrackIndex();

    let rowY = columnTopY, maxRowY = columnTopY;
    for (let i = 0; i < list.length; i++) {
        const track = list[i];
        // interludes always get the grey pill; their grade (if any) is a small dot on it
        const gradeCol = track.interlude ? RC.colors.INTERLUDE : gradeColor(track.grade);
        const showGoatFx = track.grade === 'GOAT' && !track.interlude;
        const showPeakFx = track.grade === 'PEAK' && !track.interlude;
        const columnShift = (twoColumns && i >= secondColumnStart) ? T.columnShift : 0;
        const titleX = titleBaseX + columnShift + horizOffset + (twoColumns ? T.titleIndent.twoColumns : T.titleIndent.oneColumn) + twoColumnsFix * 0.5;
        const pillCenterX = pillCenterBaseX + columnShift + horizOffset;
        const pillCenterY = rowY - pillCenterOffsetY;

        // note below the row, with an accent line fading out of the pill
        let noteSpacing = 0;
        if (track.customTextLarge) {
            const N = T.note;
            const noteX = N.x + columnShift + horizOffset;
            const noteMaxWidth = twoColumns ? N.maxWidth.twoColumns : N.maxWidth.oneColumn;
            const noteY = rowY + N.topGap;
            push();
            rectMode(CORNER);
            fill(245); noStroke(); textFont(Fonts.fontLight); textSize(TS.textSize * 0.7); textAlign(LEFT, TOP);
            _text(track.customTextLarge, noteX, noteY + safariTextShift(true), noteMaxWidth);
            noteSpacing = Fonts.fontLight.textBounds(getRichText(track.customTextLarge), noteX, noteY, noteMaxWidth).h + N.bottomGap;

            const lineX = pillCenterX - pillW / 2 + N.lineInset;
            const lineColors = showGoatFx ? RC.goat : [gradeCol, gradeCol, makeTransparent(gradeCol)];
            stroke(gradeCol); strokeCap(ROUND); strokeWeight(N.lineWeight);
            gradientLine(lineX, pillCenterY, lineX, pillCenterY + noteSpacing, lineColors);
            pop();
        }

        // grade pill
        push();
        fill(gradeCol);
        noStroke();
        if (showGoatFx) {
            setLinearGradientFill(RC.goat, pillCenterX - pillW / 2, pillCenterY, pillCenterX + pillW / 2, pillCenterY, GOAT_GRADIENT_STOPS);
            if (TS.glow) { drawingContext.shadowColor = '#ffffff'; drawingContext.shadowBlur = T.goatGlowBlur; }
        }
        if (showPeakFx && TS.glow) { drawingContext.shadowColor = gradeCol; drawingContext.shadowBlur = T.peakGlowBlur; }
        rect(pillCenterX, pillCenterY, pillDrawW, pillH, pillH * 0.5);
        pop();

        if (track.interlude && track.grade !== 'None') {
            push();
            fill(RC.colors[track.grade] || RC.colors.INTERLUDE); noStroke();
            const h = pillH * 0.6, w = pillW - (h * 0.5), radius = h * 0.5;
            ellipse(pillCenterX - w * 0.5 + radius * 1.25, pillCenterY, h, h);
            pop();
        }

        // small label inside the pill
        if (track.customText) {
            const L = T.pillLabel;
            push();
            blendMode(BLEND); textAlign(CENTER, CENTER); fill(0, 160); noStroke(); textFont(Fonts.fontRegularCondensed);
            textSize(Math.min(
                getMaxTextSizeByWidth(track.customText, pillW - L.widthPad, L.maxFontSize),
                getMaxTextSizeByHeight(track.customText, pillH + L.heightSlack, L.maxFontSize)));
            _text(track.customText, pillCenterX, pillCenterY + L.nudgeY + safariTextShift());
            pop();
        }

        // title
        fill(255); noStroke();
        const number = TS.showNumbers ? (track.customNumber || ((i + 1 + RC.trackOffset) + '.')) : '';
        const title = shortenText(number + ' ' + track.title, titleMaxWidth);
        if (showGoatFx && TS.glow) beginShadow('#ffffff', T.goatTitleGlowBlur, 0, 0);
        _text(title, titleX, rowY);
        if (showGoatFx && TS.glow) endShadow();

        rowY += rowSpacing + noteSpacing;
        if (rowY > maxRowY) maxRowY = rowY;
        if (twoColumns && i === secondColumnStart - 1) rowY = columnTopY;   // second column restarts at the top
    }
    pop();

    const endY = twoColumns ? maxRowY : rowY;
    addBox('tracks', {
        x: leftMargin + horizOffset, y: columnTopY - T.hitbox.padY,
        w: textIndent + T.hitbox.rightExtent, h: (endY + T.hitbox.padY) - (columnTopY - T.hitbox.padY)
    });
}

function drawGradeLegend(cover) {
    const L = LAYOUT.legend, P = RC.page;
    const legendGrades = Model.legendFor(RC.allTracks, P.legend.minGrades);
    const custom = String(P.legend.labels || '').split(',').map(s => s.trim());
    const legendLabels = legendGrades.map((g, i) => custom[i] || Model.LEGEND_LABELS[i]);
    if (legendGrades.length > L.compactThreshold && legendLabels[0] === 'GOAT') legendLabels[0] = 'G';

    const y = cover.y + cover.size + L.topPadding;
    const rectH = P.tracks.rectHeight;
    const rectW = (cover.size - L.gap * (legendGrades.length - 1)) / legendGrades.length;

    push();
    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont(Fonts.fontRegularCondensed);
    for (let i = 0; i < legendGrades.length; i++) {
        const grade = legendGrades[i], label = legendLabels[i];
        const x = cover.x + (legendGrades.length - i - 1) * (rectW + L.gap);
        fill(gradeColor(grade));
        noStroke();
        if (grade === 'GOAT') setLinearGradientFill(RC.goat, x, y, x + rectW, y, GOAT_GRADIENT_STOPS);
        rect(x, y, rectW, rectH, rectH * 0.5);

        fill(0, 180);
        stroke(0, 180);
        strokeWeight(0.5);
        textSize(Math.min(
            getMaxTextSizeByWidth(label, rectW - L.labelWidthPad, L.labelMaxFontSize.byWidth),
            getMaxTextSizeByHeight(label, rectH + L.labelHeightSlack, L.labelMaxFontSize.byHeight)));
        _text(label, x + rectW / 2, y + rectH / 2 + L.labelNudgeY + safariTextShift());
    }
    pop();
}

// Fill used by the grade bar (and, darkened, by the playlist note): flat grade
// colour, the GOAT gradient, or a two-colour blend for "+" grades.
function setGradeFill(grade, y, alpha) {
    const tr = c => (alpha != null ? makeTransparent(c, alpha) : c);
    fill(alpha != null ? makeTransparent(RC.colors[grade] || '#888888', alpha) : (RC.colors[grade] || '#888888'));
    if (grade === 'GOAT') setLinearGradientFill(RC.goat, 0, y, width, y, GOAT_GRADIENT_STOPS);
    if (grade.includes('+')) {
        const base = grade.replace(/ \+$/, '');
        const next = Model.PLUS_NEXT[base] || base;
        const c1 = tr(RC.colors[base]), c2 = tr(RC.colors[next]);
        setLinearGradientFill([c1, c1, c2, c2], 0, y, width, y, [0, 0.4, 0.6, 1]);
    }
}

function drawGradeBar(squareTop) {
    const G = RC.page.gradeBar, grade = RC.album.albumGrade;
    const barY = RC.exportH - G.height;
    const alpha = RC.anim && RC.anim.gradeBarTrans != null ? RC.anim.gradeBarTrans : null;
    push();
    rectMode(CORNER); noStroke();
    setGradeFill(grade, barY, alpha);
    const r = squareTop ? 0 : G.radius;
    rect(0, barY, width, G.height, r, r, 0, 0);

    textAlign(CENTER, CENTER); fill(255, alpha != null ? alpha : 255); textFont(Fonts.fontHeavy); textSize(G.fontSize);
    beginShadow('#ffffffa3', G.glow, 0, 0);
    _text(G.text || grade, width * 0.5, barY + G.height * LAYOUT.gradeBar.textYFactor + safariTextShift(true));
    endShadow();
    pop();
}

// Spotify-style mark: a disc with three sound arcs.
function drawSpotifyMark(cx, cy, r, discCol, arcCol) {
    const ctx = drawingContext;
    push();
    noStroke(); fill(discCol); circle(cx, cy, r * 2);
    ctx.strokeStyle = arcCol; ctx.lineCap = 'round';
    const arcs = [[-0.26, 0.60, 0.20, 0.17], [0.05, 0.50, 0.16, 0.15], [0.33, 0.39, 0.13, 0.12]];
    for (const [dy, hw, weight, bulge] of arcs) {
        ctx.lineWidth = r * weight;
        ctx.beginPath();
        ctx.moveTo(cx - r * hw, cy + r * (dy - 0.02));
        ctx.quadraticCurveTo(cx, cy + r * (dy - bulge * 2), cx + r * hw, cy + r * (dy + 0.07));
        ctx.stroke();
    }
    pop();
}

// "Songs added to GOAT Playlist: N" — a thin bar sitting on the grade bar.
// Returns true when it took over the rounded top corners of the footer.
function drawPlaylistNote() {
    const P = RC.page, N = P.note;
    const info = Model.noteFor(P, RC.allTracks);
    if (!info || (RC.anim && RC.anim.hideNote)) return false;
    const grade = RC.album.albumGrade;
    const hasBar = P.show.gradeBar && grade !== 'None';
    const footerTop = RC.exportH - (hasBar ? P.gradeBar.height : 0);
    const h = N.height;
    const label = getRichText(info.text);

    push();
    textFont(Fonts.fontRegularCondensed); textSize(N.fontSize); textAlign(LEFT, CENTER);
    const iconR = N.icon === 'none' ? 0 : h * 0.3;
    const gap = iconR ? h * 0.24 : 0;
    const contentW = iconR * 2 + gap + textWidth(label);
    const green = '#1db954';
    let attached = false;

    if (N.style === 'text') {
        const x = LAYOUT.leftMargin + 7, cy = footerTop - h * 0.5;
        beginShadow('#000000', 20, 0, 0);
        if (iconR) drawSpotifyMark(x + iconR, cy, iconR, green, '#000000');
        fill(255); noStroke();
        _text(label, x + iconR * 2 + gap, cy + 1 + safariTextShift());
        endShadow();
    } else {
        const pill = N.style === 'pill';
        const padX = h * 0.55;
        const bw = pill ? contentW + padX * 2 : width;
        const bh = pill ? h - 8 : h;
        const bx = pill ? (width - bw) / 2 : 0;
        const by = pill ? footerTop - bh - 14 : footerTop - h;
        const r = pill ? bh / 2 : P.gradeBar.radius;

        rectMode(CORNER); noStroke();
        if (pill) beginShadow('#00000090', 24, 0, 0);
        if (N.tone === 'spotify') fill(green);
        else if (N.tone === 'custom') fill(N.color);
        else if (N.tone === 'dark' || grade === 'None') fill(18, 18, 22, 235);
        else setGradeFill(grade, by, null);
        // the bar runs a little under the grade bar so no backdrop shows between them
        if (pill) rect(bx, by, bw, bh, r);
        else rect(bx, by, bw, bh + (hasBar ? 2 : 0), r, r, 0, 0);
        if (pill) endShadow();
        if (N.tone === 'grade' && grade !== 'None') {
            fill(0, 0, 0, 115);                            // darken → reads as a sibling of the grade bar
            if (pill) rect(bx, by, bw, bh, r); else rect(bx, by, bw, bh, r, r, 0, 0);
        }
        attached = !pill && hasBar;

        const x = bx + (bw - contentW) / 2, cy = by + bh / 2;
        const onGreen = N.tone === 'spotify';
        if (iconR) drawSpotifyMark(x + iconR, cy, iconR, onGreen ? '#000000' : green, onGreen ? green : '#000000');
        fill(onGreen ? 0 : 255); noStroke();
        _text(label, x + iconR * 2 + gap, cy + 1 + safariTextShift());
    }
    pop();
    return attached;
}

function drawSheet(loaded) {
    const P = RC.page;
    drawBackdrop();
    imageMode(CORNER); rectMode(CORNER);
    noStroke(); fill(255);

    drawArt();
    if (!(RC.anim && RC.anim.skipImages)) drawCustomImages(loaded);
    drawHeader();
    drawCustomTextboxes();
    if (P.show.tracks) drawTrackList();
    if (P.show.legend) drawGradeLegend(artRect());

    const showBar = P.show.gradeBar && RC.album.albumGrade !== 'None';
    // the grade bar goes on top of the note, so draw the note first
    const squareTop = drawPlaylistNote();
    if (showBar) drawGradeBar(squareTop);
}

// ════════════════════════════ cover layout ════════════════════════════

function drawCoverPage(loaded) {
    const P = RC.page, A = RC.album, hero = P.hero;
    push();
    drawBackdrop();
    noStroke(); fill(255);

    const coverSize = width * hero.size, coverY = RC.exportH * hero.posY;

    imageMode(CENTER); rectMode(CENTER);
    if (P.show.hero) {
        beginShadow('#000000', hero.shadow, 0, 0);
        if (RC.hasImage) {
            fill(0);
            rect(width * 0.5, coverY, coverSize, coverSize, hero.radius || 0);
            if (hero.glitch) {
                const res = Glitch.get(P.id + ':hero', () => RC.img, coverSize, coverSize, { x: width * 0.5, y: coverY },
                    resolveGlitchOpts(RC.doc.glitch.image, RC.img), A.imageUrl, { seed: RC.doc.glitch.seed });
                Glitch.draw(res);
            }
            // drawn several times so the drop shadow builds up
            for (let i = 0; i < Math.max(1, hero.boost); i++) {
                if (hero.radius) { imageMode(CORNER); drawImageRounded(RC.img, width * 0.5 - coverSize / 2, coverY - coverSize / 2, coverSize, coverSize, hero.radius); imageMode(CENTER); }
                else image(RC.img, width * 0.5, coverY, coverSize, coverSize);
            }
        } else drawImagePlaceholder(width * 0.5, coverY, coverSize, coverSize, false);
        endShadow();
        addBox('image', { x: width * 0.5 - coverSize / 2, y: coverY - coverSize / 2, w: coverSize, h: coverSize }, 0, { fixed: true });
    }

    push();
    if (P.show.title) {
        const tx = width * 0.5 + P.pos.title.x, titleY = coverY + coverSize * 0.5 + 60 + P.pos.title.y;
        textFont(Fonts.fontHeavy);
        const titleSize = max(10, getMaxTextSizeByWidth(A.title, P.maxW.title, P.title.maxSize) + P.sizeOff.title);
        const titleStr = getRichText(A.title);
        if (P.title.glitch) drawStylizedText(Fonts.fontHeavy, titleSize, titleStr, tx, titleY, CENTER, CENTER, RC.doc.glitch.title, P.id + ':title');
        else {
            beginShadow('#000000', 20, 0, 0);
            fill(255); textFont(Fonts.fontHeavy); textSize(titleSize); textAlign(CENTER, CENTER);
            _text(titleStr, tx, titleY);
            endShadow();
        }
        textFont(Fonts.fontHeavy); textSize(titleSize); textAlign(CENTER, CENTER);
        addBox('title', Fonts.fontHeavy.textBounds(titleStr, tx, titleY), titleSize);
    }
    if (P.show.artist) {
        const ax = width * 0.5 + P.pos.artist.x, artistY = coverY + coverSize * 0.5 + 60 + 130 + P.pos.artist.y;
        textFont(Fonts.fontRegularCondensed);
        textAlign(CENTER, CENTER);
        const artistSize = getMaxTextSizeByWidth(A.artist, width - 100, 50) + P.sizeOff.artist;
        textSize(artistSize); fill(230); _text(A.artist, ax, artistY);
        addBox('artist', Fonts.fontRegularCondensed.textBounds(getRichText(A.artist), ax, artistY), artistSize);
    }
    pop();

    drawCustomImages(loaded);
    drawCustomTextboxes();
    pop();
}

// ════════════════════════════ entry points ════════════════════════════

// Load everything `page` draws. Returns { loaded: Map(elementId → p5.Image) }.
async function loadPageImages(rc) {
    const P = rc.page, url = rc.album.imageUrl;
    const jobs = [Images.get(url)];
    const els = P.images.filter(el => !el.hidden && el.url && el.url.trim());
    for (const el of els) jobs.push(Images.get(el.url));
    const res = await Promise.all(jobs);
    rc.img = res[0];
    rc.hasImage = !!rc.img;
    rc.backdropImg = (rc.hasImage && !rc.transparent && P.backdrop.mode === 'art') ? Images.backdrop(url, rc.img, P.backdrop) : null;
    const loaded = new Map();
    els.forEach((el, i) => { if (res[i + 1]) loaded.set(el.id, res[i + 1]); });
    return loaded;
}

// Synchronous draw of a prepared context (also used by the animation, frame by frame).
function drawPage(rc, loaded) {
    RC = rc;
    setRichContext(rc.rich);
    reflowPageStack(rc.page);
    push();
    if (rc.page.base === 'cover') drawCoverPage(loaded); else drawSheet(loaded);
    pop();
    return rc;
}

const Render = {
    busy: false, again: false, waiters: [], scheduled: false, idleTimer: null,
    onAfter: null,      // (rc) => void, called after the current page was drawn

    // Draw the current page (coalesced: calls made while a render runs trigger one more).
    async now() {
        if (typeof Anim !== 'undefined' && Anim.playing) return;     // the animation owns the canvas
        if (this.busy) { this.again = true; return new Promise(r => this.waiters.push(r)); }
        this.busy = true;
        try {
            do {
                this.again = false;
                const doc = App.doc, page = App.page();
                const rc = buildRenderContext(doc, page);
                const loaded = await loadPageImages(rc);
                if (App.doc !== doc || App.page() !== page) { this.again = true; continue; }   // changed while loading
                drawPage(rc, loaded);
                App.boxes = rc.boxes;
                App.lastRC = rc;
                if (this.onAfter) this.onAfter(rc);
            } while (this.again);
        } catch (err) {
            console.error('Render failed:', err);
        } finally {
            this.busy = false;
            const w = this.waiters; this.waiters = [];
            w.forEach(r => r());
        }
        // a draft glitch was shown: follow up with the real thing once input settles
        if (Glitch.hasDrafts()) this.settleSoon();
    },

    // Request a redraw on the next frame.
    request() {
        if (this.scheduled) return;
        this.scheduled = true;
        requestAnimationFrame(() => { this.scheduled = false; this.now(); });
    },

    // Redraw while a control is being dragged: glitches are computed at draft
    // resolution, and at full quality shortly after the last change.
    interactive() {
        Glitch.draft = true;
        this.request();
        this.settleSoon();
    },

    settleSoon() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => { Glitch.draft = false; if (Glitch.hasDrafts()) this.request(); }, 220);
    },

    // Render `page` at full quality and return a canvas cropped to its export height.
    // Runs exclusively (waits for a running render).
    async capture(page, opts) {
        while (this.busy) await new Promise(r => this.waiters.push(r));
        this.busy = true;
        try {
            const wasDraft = Glitch.draft;
            Glitch.draft = false;
            const rc = buildRenderContext(App.doc, page, { exporting: !(opts && opts.placeholders) });
            const loaded = await loadPageImages(rc);
            drawPage(rc, loaded);
            Glitch.draft = wasDraft;
            const d = pixelDensity(), h = rc.exportH;
            const c = document.createElement('canvas');
            c.width = Math.round(Model.WIDTH * d); c.height = Math.round(h * d);
            c.getContext('2d').drawImage(drawingContext.canvas, 0, 0, c.width, c.height, 0, 0, c.width, c.height);
            return c;
        } finally {
            this.busy = false;
            const w = this.waiters; this.waiters = [];
            w.forEach(r => r());
        }
    }
};
