// Text helpers shared by every block: template ("rich") text, wrapping,
// justified text, measuring and auto-fit sizes.
'use strict';

const Fonts = {};   // fontHeavy, fontLight, … → p5.Font (filled in setup)

function fontOf(key) { return Fonts[key] || Fonts.fontHeavy; }

function fontKey(font) {
    for (const k in Fonts) if (Fonts[k] === font) return k;
    return 'font?';
}

// ─── Safari / WebKit baseline fix ─────────────────────────────────────────────
// WebKit draws canvas text a few px too low (growing with the font size), so the
// affected text is nudged back up. Other browsers get 0.
const SAFARI_OFFSET_SMALL = 3, SAFARI_OFFSET_LARGE = 8;
let isSafariLike = false;

function detectSafariLike() {
    const ua = navigator.userAgent;
    const iOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR/.test(ua);
    return iOS || safari;
}

function safariTextShift(large = false) {
    if (!isSafariLike) return 0;
    return -(large ? SAFARI_OFFSET_LARGE : SAFARI_OFFSET_SMALL);
}

// ─── Template text ────────────────────────────────────────────────────────────
// $name$ / $a.b.c$ is replaced by a value from the context; $(js: expression)$
// runs an expression with the context in scope. Unknown names are left as typed.
let richCtx = {};                        // set by the renderer before each page
const richFnCache = new Map();           // expression → compiled function
const richErrorsSeen = new Set();

function setRichContext(ctx) { richCtx = ctx; }

function resolvePath(path, context) {
    return path.split('.').reduce((acc, key) => (acc !== undefined && acc !== null) ? acc[key] : undefined, context);
}

function getRichText(str) {
    if (typeof str !== 'string' || str.indexOf('$') === -1) return str;
    const context = richCtx;

    str = str.replace(/\$([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\$/g, (match, path) => {
        const value = resolvePath(path, context);
        return value !== undefined ? value : match;
    });

    str = str.replace(/\$\((js:)?\s*([^]+?)\s*\)\$/g, (match, jsPrefix, code) => {
        if (!jsPrefix) return match;
        try {
            let fn = richFnCache.get(code);
            if (!fn) { fn = new Function('ctx', `with(ctx) { return ${code} }`); richFnCache.set(code, fn); }
            return fn(context);
        } catch (err) {
            const k = code + '|' + err.message;
            if (!richErrorsSeen.has(k)) { richErrorsSeen.add(k); console.warn('Text template error in "' + code + '":', err.message); }
            return match;
        }
    });
    return str;
}

function _text(...args) {
    if (typeof args[0] === 'string') args[0] = getRichText(args[0]);
    text(...args);
}

// ─── Alignment / measuring ────────────────────────────────────────────────────

function getP5Align(align) {
    if (align === 'center') return CENTER;
    if (align === 'right') return RIGHT;
    return LEFT;
}

// Draws text inside a box honouring the alignment ('justify' needs its own renderer).
function drawBoxText(str, x, y, maxWidth, align, verAlign = BASELINE) {
    if (align === 'justify') justifyText(str, x, y, maxWidth);
    else { textAlign(getP5Align(align), verAlign); _text(str, x, y, maxWidth); }
}

function textIsWrapping(bounds, font) {
    return bounds.h > font.textBounds('glIM|', 0, 0).h * 1.2;
}

// textBounds treats x as the alignment anchor, while box-mode text always starts at
// the container's left edge — shift the measured bounds to where the text really is.
function getAlignedBounds(bounds, anchorX, align, maxWidth, font) {
    if (!maxWidth || align === 'left') return bounds;
    if (align === 'justify') return { x: bounds.x, y: bounds.y, w: maxWidth, h: bounds.h };
    if (font && textIsWrapping(bounds, font)) return bounds;
    if (align === 'center') return { x: bounds.x + maxWidth / 2, y: bounds.y, w: bounds.w, h: bounds.h };
    if (align === 'right') return { x: bounds.x + maxWidth, y: bounds.y, w: bounds.w, h: bounds.h };
    return bounds;
}

function shortenText(str, maxLength) {
    if (textWidth(str) <= maxLength) return str;
    let s = str.substring(0, str.length - 1);
    while (textWidth(s + '...') > maxLength && s.length > 0) {
        s = s.substring(0, s.length - 1);
        if (s.length === 0) return '...';
    }
    return s + '...';
}

function getMaxTextSizeByWidth(str, maxWidth, maxStartSize) {
    let size = maxStartSize;
    textSize(size);
    while (textWidth(str) > maxWidth && size > 0) { size--; textSize(size); }
    return size;
}

function getMaxTextSizeByHeight(str, maxHeight, maxStartSize) {
    let size = maxStartSize;
    textSize(size);
    while (textAscent() + textDescent() > maxHeight && size > 0) { size--; textSize(size); }
    return size;
}

// ─── Justified text ───────────────────────────────────────────────────────────
// justifyText(str, x, y, boxWidth[, options]) → y below the rendered block.
function justifyText(str, x, y, boxWidth, options = {}) {
    if (!str || boxWidth <= 0) return y;
    str = String(str);

    const lineHeight = options.lineHeight ?? textLeading();
    const lastLineMode = options.lastLine ?? 'left';
    const paraSpacing = options.paragraphSpacing ?? 0;
    const hyphenChar = options.hyphenChar ?? '';
    const spaceFactor = options.spaceFactor ?? 0.9;

    push();
    textAlign(LEFT, TOP);
    const sizeFallback = textSize();

    function safeWidth(s) {
        let w = textWidth(s);
        if (Number.isFinite(w) && w > 0) return w;
        if (typeof drawingContext?.measureText === 'function') {
            w = drawingContext.measureText(s).width;
            if (Number.isFinite(w) && w > 0) return w;
        }
        return s.length * sizeFallback * 0.5;
    }

    function measureSpace() {
        let w = textWidth(' ');
        if (Number.isFinite(w) && w > 0) return w;
        w = textWidth('i i') - textWidth('ii');
        if (Number.isFinite(w) && w > 0) return w;
        if (typeof drawingContext?.measureText === 'function') {
            w = drawingContext.measureText(' ').width;
            if (Number.isFinite(w) && w > 0) return w;
        }
        return sizeFallback * 0.3;
    }

    const spaceW = measureSpace() * spaceFactor;

    function breakWord(word) {
        const hyphenW = hyphenChar ? safeWidth(hyphenChar) : 0;
        const parts = [];
        let cur = '';
        for (const ch of word) {
            if (cur && safeWidth(cur + ch) + hyphenW > boxWidth) { parts.push(cur + hyphenChar); cur = ch; }
            else cur += ch;
        }
        if (cur) parts.push(cur);
        return parts.length ? parts : [word];
    }

    function renderLine(words, yTop, justify) {
        if (words.length === 0) return;
        if (justify && words.length === 1) {
            const w = words[0], chars = [...w];
            if (chars.length > 1) {
                const charGap = (boxWidth - safeWidth(w)) / (chars.length - 1);
                let cx = x;
                for (const ch of chars) { _text(ch, cx, yTop); cx += safeWidth(ch) + charGap; }
                return;
            }
        }
        let totalW = 0;
        const widths = words.map(w => { const ww = safeWidth(w); totalW += ww; return ww; });
        let gap = spaceW;
        if (justify && words.length > 1) {
            const g = (boxWidth - totalW) / (words.length - 1);
            gap = Number.isFinite(g) ? Math.max(g, 0) : spaceW;
        }
        let cx = x;
        for (let i = 0; i < words.length; i++) { _text(words[i], cx, yTop); cx += widths[i] + gap; }
    }

    let cursorY = y;
    const paragraphs = str.split(/\r\n|\r|\n/);
    for (let p = 0; p < paragraphs.length; p++) {
        let words = paragraphs[p].split(/\s+/).filter(w => w.length);
        if (words.length === 0) { cursorY += lineHeight; continue; }
        words = words.flatMap(w => safeWidth(w) > boxWidth ? breakWord(w) : [w]);

        let line = [], lineW = 0;
        for (const w of words) {
            const wW = safeWidth(w);
            const test = lineW + (line.length ? spaceW : 0) + wW;
            if (test > boxWidth && line.length) {
                renderLine(line, cursorY, true);
                cursorY += lineHeight;
                line = [w]; lineW = wW;
            } else { line.push(w); lineW = test; }
        }
        if (line.length) { renderLine(line, cursorY, lastLineMode === 'justify'); cursorY += lineHeight; }
        if (p < paragraphs.length - 1) cursorY += paraSpacing;
    }
    pop();
    return cursorY;
}

// ─── Small drawing helpers ────────────────────────────────────────────────────

// Scoped canvas shadow: beginShadow() … endShadow() (push/pop pair).
function beginShadow(col, blur, offX = 0, offY = 0) {
    push();
    drawingContext.shadowColor = col;
    drawingContext.shadowBlur = blur;
    drawingContext.shadowOffsetX = offX;
    drawingContext.shadowOffsetY = offY;
}
function endShadow() { pop(); }

// Use a horizontal/any-direction gradient as the current fill (no push — it lasts
// until the next fill() or the enclosing pop()).
function setLinearGradientFill(colors, x1, y1, x2, y2, stops) {
    const grad = drawingContext.createLinearGradient(x1, y1, x2, y2);
    const toCss = c => (typeof c === 'string' ? c : c.toString());
    grad.addColorStop(0, toCss(colors[0]));
    for (let i = 1; i < colors.length - 1; i++) grad.addColorStop(stops ? stops[i] : 0.5, toCss(colors[i]));
    grad.addColorStop(1, toCss(colors[colors.length - 1]));
    fill(100);
    drawingContext.fillStyle = grad;
}

function gradientLine(x1, y1, x2, y2, colors) {
    const grad = drawingContext.createLinearGradient(x1, y1, x2, y2);
    for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        grad.addColorStop(i / (colors.length - 1), typeof c === 'string' ? c : c.toString());
    }
    drawingContext.strokeStyle = grad;
    line(x1, y1, x2, y2);
}

function makeTransparent(col, alpha = 100) {
    const c = color(col);
    return color(red(c), green(c), blue(c), alpha);
}

function getContrastYIQ(hexcolor) {
    if (!hexcolor || typeof hexcolor !== 'string' || !hexcolor.startsWith('#') || hexcolor.length < 7) return 'rgb(0,0,0)';
    const r = parseInt(hexcolor.substr(1, 2), 16), g = parseInt(hexcolor.substr(3, 2), 16), b = parseInt(hexcolor.substr(5, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 >= 128 ? 'rgb(0,0,0)' : 'rgb(255,255,255)';
}

function rgbToHex(rgb) { return '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function hexToRgbArr(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
