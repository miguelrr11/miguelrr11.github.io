// The optimised glitch kernel must produce exactly the pixels of the original
// createGlitchyImage (kept verbatim in fixtures/legacy-glitch-reference.js.txt).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const GlitchCore = require('../../js/render/glitch-core.js');

// deterministic stand-ins for p5's noise() and Math.random()
function makeNoise(seed) {
    return (x, y = 0) => { const v = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453; return v - Math.floor(v); };
}
function makeRandom(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function makeSource(w, h, pd, seed) {
    const rnd = makeRandom(seed), px = new Uint8ClampedArray(w * pd * h * pd * 4);
    for (let i = 0; i < px.length; i += 4) { px[i] = rnd() * 256; px[i + 1] = rnd() * 256; px[i + 2] = (i / 4) % 251; px[i + 3] = rnd() < 0.1 ? rnd() * 256 : 255; }
    return px;
}

// Run the legacy function with the p5 globals it expects.
const legacySrc = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'legacy-glitch-reference.js.txt'), 'utf8');
function legacy(srcPx, iw, ih, srcPd, imgW, imgH, pos, opts, cw, ch, pdOut, noise, random) {
    const img = { width: iw, height: ih, pixels: srcPx, pixelDensity: () => srcPd, loadPixels() {} };
    let out = null;
    const createImage = (w, h) => (out = { width: w, height: h, pixels: new Uint8ClampedArray(w * h * 4), loadPixels() {}, updatePixels() {} });
    const fn = new Function('width', 'height', 'pixelDensity', 'noise', 'createImage', 'Math',
        legacySrc + '\nreturn createGlitchyImage;');
    const M = Object.create(Math); M.random = random;
    fn(cw, ch, () => pdOut, noise, createImage, M)(img, imgW, imgH, pos, Object.assign({ superSample: false }, opts));
    return out.pixels;
}

function compare(name, cfg) {
    const { iw, ih, srcPd, imgW, imgH, pos, opts, cw, ch, pdOut } = cfg;
    const src = makeSource(iw, ih, srcPd, 7);
    const ref = legacy(src, iw, ih, srcPd, imgW, imgH, pos, opts, cw, ch, pdOut, makeNoise(3), makeRandom(11));
    const res = GlitchCore.compute({
        src, ipw: iw * srcPd, iph: ih * srcPd, pd: srcPd, geoPd: srcPd, imgW, imgH, cx: pos.x, cy: pos.y,
        width: cw, height: ch, pdOut, opts, noise: makeNoise(3), random: makeRandom(11)
    });
    const W = cw * pdOut, H = ch * pdOut;
    const full = new Uint8ClampedArray(W * H * 4);
    if (res) for (let y = 0; y < res.h; y++) full.set(res.data.subarray(y * res.w * 4, (y + 1) * res.w * 4), ((res.y + y) * W + res.x) * 4);
    let bad = -1;
    for (let i = 0; i < ref.length; i += 4) {
        // fully transparent pixels may differ in their (invisible) colour
        if (ref[i + 3] === 0 && full[i + 3] === 0) continue;
        if (ref[i] !== full[i] || ref[i + 1] !== full[i + 1] || ref[i + 2] !== full[i + 2] || ref[i + 3] !== full[i + 3]) { bad = i / 4; break; }
    }
    assert.strictEqual(bad, -1, name + ': first differing pixel at index ' + bad + (bad >= 0 ? ' (x=' + (bad % W) + ', y=' + Math.floor(bad / W) + ')' : ''));
    return res;
}

const base = { iw: 40, ih: 40, srcPd: 1, imgW: 60, imgH: 60, pos: { x: 80, y: 70 }, cw: 160, ch: 140, pdOut: 2 };
const LR = { left: true, right: true, top: false, bottom: false };

test('default image look (sine wave, bloom + glow, sampled noise edges)', () => {
    compare('default', { ...base, opts: { sides: LR, type: 'sine', amp: 50, scale: 0.005, symmetrical: false, color: { mode: 'bloom+glow', amount: 0.15, tint: [255, 60, 180], levels: 10, shift: 60 }, warp: {}, edges: { mode: 'noise', sample: true, scale: 0.04 }, colEffOr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] } });
});

test('default title look (no wave, fade + bands) from a density-2 source', () => {
    compare('title', { ...base, iw: 50, ih: 20, srcPd: 2, imgW: 50, imgH: 20, opts: { sides: LR, type: 'none', amp: 60, scale: 0.005, symmetrical: false, color: { mode: 'fade+bands', amount: 0.85, bandScale: 0.05, bandSeed: 10 }, warp: {} } });
});

test('every wave type', () => {
    for (const type of ['noise', 'sine', 'square', 'sawtooth', 'none'])
        for (const symmetrical of [true, false])
            compare(type, { ...base, opts: { sides: LR, type, amp: 35, scale: 0.07, symmetrical, color: { mode: 'none' } } });
});

test('every colour effect, alone and stacked in a shuffled order', () => {
    const modes = ['invert', 'tint', 'rainbow', 'chromatic', 'posterize', 'fade', 'glow', 'bloom', 'scanlines', 'bands'];
    for (const mode of modes) compare(mode, { ...base, opts: { sides: LR, type: 'sine', amp: 20, scale: 0.05, color: { mode, amount: 0.7, shift: 14, levels: 5, bandScale: 0.3, bandSeed: 2 } } });
    compare('all', { ...base, opts: { sides: LR, type: 'noise', amp: 20, scale: 0.05, color: { mode: modes.join('+'), amount: 0.6, shift: 9 }, colEffOr: [10, 3, 7, 1, 9, 5, 2, 8, 6, 4] } });
});

test('warps, echo and synthetic edge colours', () => {
    compare('warp', { ...base, opts: { sides: LR, type: 'sine', amp: 30, scale: 0.03, warp: { mosaic: 9, shear: 14, haze: 6, band: 10, echo: 8 }, color: { mode: 'chromatic', amount: 1, shift: 8 } } });
    compare('edge colours (noise)', { ...base, opts: { sides: LR, type: 'none', edges: { colors: ['#ff0000', [0, 255, 0], '#00f'], mode: 'noise', scale: 0.3, seed: 4 }, warp: { echo: 6 }, color: { mode: 'chromatic+fade', amount: 0.5 } } });
    compare('edge colours (random)', { ...base, opts: { sides: LR, type: 'sine', amp: 10, scale: 0.1, edges: { colors: ['#123456', '#abcdef'], mode: 'random' } } });
    compare('sample (random) + offset', { ...base, opts: { sides: LR, type: 'none', edges: { sample: true, sampleFactor: 0.8, mode: 'random', offset: 0.25 } } });
});

test('all four sides, with blur', () => {
    const all = { left: true, right: true, top: true, bottom: true };
    compare('4 sides', { ...base, opts: { sides: all, type: 'sine', amp: 20, scale: 0.05, color: { mode: 'fade', amount: 0.9 }, edges: { sample: true, mode: 'noise' } } });
    compare('blur', { ...base, opts: { sides: LR, type: 'sine', amp: 20, scale: 0.05, blur: 2.4, color: { mode: 'glow', amount: 0.4 } } });
    compare('4 sides + blur', { ...base, opts: { sides: all, type: 'none', blur: 1, color: { mode: 'tint', amount: 0.5 } } });
    compare('top only', { ...base, opts: { sides: { top: true }, type: 'none', warp: { mosaic: 5, shear: 8, haze: 3 } } });
});

test('image partly off-canvas, odd densities and non-square sizes', () => {
    compare('off left/top', { ...base, pos: { x: 10, y: 5 }, opts: { sides: LR, type: 'sine', amp: 15, scale: 0.05 } });
    compare('off right/bottom', { ...base, pos: { x: 150, y: 135 }, opts: { sides: { left: true, right: true, top: true, bottom: true }, type: 'noise', amp: 15, scale: 0.05 } });
    compare('fractional', { ...base, imgW: 61.5, imgH: 33.25, pos: { x: 77.3, y: 64.9 }, pdOut: 1, opts: { sides: LR, type: 'sine', amp: 15, scale: 0.05, color: { mode: 'scanlines+fade', amount: 0.8 } } });
});

test('only the reachable part of the canvas is returned', () => {
    const res = compare('region', { ...base, opts: { sides: LR, type: 'none', color: { mode: 'none' } } });
    // left+right stretch of a 60px-high image at density 2 → 120 rows, full width
    assert.deepStrictEqual([res.x, res.y, res.w, res.h], [0, 80, 320, 120]);
    const none = compare('no sides', { ...base, opts: { sides: {}, type: 'none' } });
    assert.deepStrictEqual([none.x, none.y, none.w, none.h], [100, 80, 120, 120]);
});

test('nothing to draw → null', () => {
    const res = GlitchCore.compute({ src: new Uint8ClampedArray(16), ipw: 2, iph: 2, pd: 1, geoPd: 1, imgW: 10, imgH: 10, cx: -500, cy: -500, width: 100, height: 100, pdOut: 1, opts: { sides: {} }, noise: makeNoise(1) });
    assert.strictEqual(res, null);
});
