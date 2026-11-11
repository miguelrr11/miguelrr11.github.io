// Glitch kernel — stretches the edge pixels of an image toward the canvas sides.
// Pure typed-array code (no p5 / DOM) so it can be unit-tested and reasoned about.
//
// Compared with the original createGlitchyImage it produces the exact same pixels,
// but only touches (and returns) the part of the canvas the effect can reach
// instead of a full-canvas buffer, and its inner loop is specialised per segment.
//
// opts (all optional):
//   sides       {left, right, top, bottom}  which edges get extended
//   type        'noise' | 'sine' | 'square' | 'sawtooth' | 'none'   vertical distortion of the stretch
//   amp         max shift in px          scale   noise zoom / wave frequency
//   symmetrical distortion driven by the distance to the image (left/right mirror)
//   color       {mode, amount, tint, levels, shift, bandScale, bandSeed}
//               mode: 'a+b+c' of invert|tint|rainbow|chromatic|posterize|fade|glow|bloom|scanlines|bands
//   warp        {mosaic, shear, echo, haze, band}   distortions of the sample position
//   edges       {colors, mode, scale, seed, sample, sampleFactor, offset}   synthetic / jittered edge
//   colEffOr    order in which the colour effects are applied (codes 1..10)
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.GlitchCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const MODE_BITS = {
        none: 0, invert: 1, tint: 2, rainbow: 4, chromatic: 8, posterize: 16,
        fade: 32, glow: 64, overexpose: 64, bloom: 128, scanlines: 256, crt: 256,
        bands: 512, interference: 512
    };
    // effect code (as stored in colEffOr) → mode bit
    const EFFECT_BIT = [0, 1, 2, 4, 8, 16, 64, 128, 256, 512, 32];
    const DEFAULT_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    function modeMask(mode) {
        const names = Array.isArray(mode) ? mode : (typeof mode === 'string' ? mode.split(/[+,\s|]+/) : []);
        let code = 0;
        for (const name of names) code |= (MODE_BITS[name] || 0);
        return code;
    }

    function toRGBA(c) {
        if (Array.isArray(c)) return [c[0] || 0, c[1] || 0, c[2] || 0, c[3] != null ? c[3] : 255];
        if (typeof c === 'string') {
            let h = c.replace('#', '');
            if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
            const n = parseInt(h, 16);
            return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
        }
        return [0, 0, 0, 255];
    }

    // Device-pixel rectangle of the canvas the effect can write to (before blur).
    function region(p) {
        const { imgW, imgH, cx, cy, width, height, pdOut } = p;
        const sides = (p.opts && p.opts.sides) || { left: true, right: true, top: false, bottom: false };
        const cw = Math.round(width * pdOut), ch = Math.round(height * pdOut);
        const clampX = v => Math.max(0, Math.min(cw, v)), clampY = v => Math.max(0, Math.min(ch, v));
        const xIn0 = clampX(Math.ceil((cx - imgW / 2) * pdOut)), xIn1 = clampX(Math.ceil((cx + imgW / 2) * pdOut));
        const yIn0 = clampY(Math.ceil((cy - imgH / 2) * pdOut)), yIn1 = clampY(Math.ceil((cy + imgH / 2) * pdOut));
        return {
            cw, ch, xIn0, xIn1, yIn0, yIn1,
            x0: sides.left ? 0 : xIn0, x1: sides.right ? cw : xIn1,
            y0: sides.top ? 0 : yIn0, y1: sides.bottom ? ch : yIn1
        };
    }

    // p: { src, ipw, iph, pd, geoPd, imgW, imgH, cx, cy, width, height, pdOut, opts, noise, random, blurPx }
    //   src            RGBA bytes of the source image (ipw × iph physical pixels)
    //   pd             density of the source (edge strips are indexed in logical source px)
    //   geoPd          logical px → source physical px factor for amp/warp/chromatic offsets
    //   imgW/imgH      display size of the image on the canvas, (cx, cy) its center — logical px
    //   width/height   logical canvas size, pdOut the output density
    // Returns { data, x, y, w, h } — an RGBA buffer covering the device-pixel rect (x, y, w, h)
    // of the canvas — or null when nothing would be drawn.
    function compute(p) {
        const opts = p.opts || {};
        const sides = opts.sides || { left: true, right: true, top: false, bottom: false };
        const type = opts.type === undefined ? 'noise' : opts.type;
        const amp = opts.amp === undefined ? 60 : opts.amp;
        const scale = opts.scale === undefined ? 0.02 : opts.scale;
        const symmetrical = opts.symmetrical === undefined ? true : opts.symmetrical;
        const color = opts.color || {}, warp = opts.warp || {}, edges = opts.edges || {};
        const colEffOr = opts.colEffOr || DEFAULT_ORDER;
        const noise = p.noise, random = p.random || Math.random;

        const isSine = type === 'sine', isSquare = type === 'square', isSaw = type === 'sawtooth';
        const doDistort = type !== 'none' && amp !== 0;

        // colour effects
        const cAmount = color.amount != null ? color.amount : 1;
        const cTint = color.tint || [255, 60, 180];
        const cLevels = color.levels || 4;
        const cShift = color.shift != null ? color.shift : 10;
        const cBandScale = color.bandScale != null ? color.bandScale : 0.05;
        const cBandSeed = color.bandSeed || 0;
        const cModeCode = modeMask(color.mode);
        const doColor = cModeCode !== 0 && cAmount !== 0;
        const mRainbow = (cModeCode & 4) !== 0, mBands = (cModeCode & 512) !== 0;
        // only the enabled effects, in the requested order
        const active = [];
        for (const eff of colEffOr) if (eff >= 1 && eff <= 10 && (cModeCode & EFFECT_BIT[eff])) active.push(eff);
        const nActive = active.length;

        // geometry warps
        const wMosaic = warp.mosaic || 0, wShear = warp.shear || 0, wEcho = warp.echo || 0, wHaze = warp.haze || 0;
        const wBand = warp.band || 24;
        const doWarp = wMosaic !== 0 || wShear !== 0 || wHaze !== 0;

        // edge art
        const eColors = (edges.colors || []).map(toRGBA);
        const nCol = eColors.length;
        const eNoise = edges.mode === 'noise';
        const eSample = !!edges.sample;
        const eSampleFactor = edges.sampleFactor != null ? edges.sampleFactor : 0.5;
        const doEdges = nCol > 0 || eSample;
        const eScale = edges.scale != null ? edges.scale : 0.05;
        const eSeed = edges.seed || 0;
        const edgeOffset = edges.offset != null ? edges.offset : 0;

        let palette = null;
        if (mRainbow) {
            palette = new Uint8Array(256 * 3);
            for (let i = 0; i < 256; i++) {
                const t = i / 255 * 6.28318;
                palette[i * 3] = 128 + 127 * Math.sin(t);
                palette[i * 3 + 1] = 128 + 127 * Math.sin(t + 2.094);
                palette[i * 3 + 2] = 128 + 127 * Math.sin(t + 4.188);
            }
        }

        const src = p.src, ipw = p.ipw, iph = p.iph, pd = p.pd, geoPd = p.geoPd, pdOut = p.pdOut;
        const iw = Math.round(ipw / pd), ih = Math.round(iph / pd);
        const physStride = ipw;
        const imgW = p.imgW, imgH = p.imgH, width = p.width, height = p.height;
        const left = p.cx - imgW / 2, right = p.cx + imgW / 2, top = p.cy - imgH / 2, bottom = p.cy + imgH / 2;
        const sLeft = !!sides.left, sRight = !!sides.right, sTop = !!sides.top, sBottom = !!sides.bottom;

        const R = region(p);
        const cw = R.cw, ch = R.ch;
        if (R.x1 <= R.x0 || R.y1 <= R.y0) return null;

        // synthetic edge strips (same call order as the original: vertical strip first)
        let edgeV = null, edgeH = null, lumV = null, lumH = null;
        if (doEdges && eSample) {
            const fillLum = (len) => {
                const buf = new Float32Array(len);
                for (let i = 0; i < len; i++) {
                    const n = eNoise ? (noise(i * eScale + eSeed) * 2 - 1) : (random() * 2 - 1);
                    let f = 1 + n * eSampleFactor;
                    if (f < 0) f = 0;
                    buf[i] = f;
                }
                return buf;
            };
            if (sLeft || sRight) lumV = fillLum(ih);
            if (sTop || sBottom) lumH = fillLum(iw);
        } else if (doEdges) {
            const fillEdge = (len) => {
                const buf = new Uint8ClampedArray(len * 4);
                for (let i = 0; i < len; i++) {
                    let idx = eNoise ? (noise(i * eScale + eSeed) * nCol | 0) : (random() * nCol | 0);
                    if (idx >= nCol) idx = nCol - 1;
                    const c = eColors[idx], k = i << 2;
                    buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2]; buf[k + 3] = c[3];
                }
                return buf;
            };
            if (sLeft || sRight) edgeV = fillEdge(ih);
            if (sTop || sBottom) edgeH = fillEdge(iw);
        }

        // output region, grown so a blur has room to spread (clamped to the canvas,
        // where the original clamps too)
        const blurPx = Math.round(p.blurPx != null ? p.blurPx : (opts.blur || 0));
        const grow = blurPx >= 1 ? blurPx * 3 + 1 : 0;
        const ox = Math.max(0, R.x0 - grow), oy = Math.max(0, R.y0 - grow);
        const ow = Math.min(cw, R.x1 + grow) - ox, oh = Math.min(ch, R.y1 + grow) - oy;
        const dst = new Uint8ClampedArray(ow * oh * 4);

        // per-column lookups (only for the columns we may touch)
        const colSrc = new Int32Array(cw), colFactor = new Float32Array(cw), colDist = new Float32Array(cw);
        for (let x = R.x0; x < R.x1; x++) {
            const xl = x / pdOut;
            let sx = (xl - left) / imgW * ipw | 0;
            if (sx < 0) sx = 0; else if (sx > ipw - 1) sx = ipw - 1;
            colSrc[x] = sx;
            if (xl < left) { colFactor[x] = left > 0 ? (left - xl) / left : 0; colDist[x] = left - xl; }
            else if (xl >= right) { colFactor[x] = (width - right) > 0 ? (xl - right) / (width - right) : 0; colDist[x] = xl - right; }
        }

        const shearNoise = wShear ? new Float64Array((Math.max(width, height) / wBand | 0) + 2).fill(NaN) : null;
        const edgeColL = edgeOffset * (ipw - 1) | 0, edgeColR = (1 - edgeOffset) * (ipw - 1) | 0;
        const edgeRowT = edgeOffset * (iph - 1) | 0, edgeRowB = (1 - edgeOffset) * (iph - 1) | 0;
        const maxY = iph - 1, maxX = ipw - 1;

        for (let y = R.y0; y < R.y1; y++) {
            const yl = y / pdOut;
            const inRows = y >= R.yIn0 && y < R.yIn1;
            const aboveTop = yl < top;
            if (!inRows && !(aboveTop ? sTop : sBottom)) continue;

            let sy = (yl - top) / imgH * iph | 0;
            if (sy < 0) sy = 0; else if (sy > maxY) sy = maxY;

            let rowF = 0;
            if (aboveTop) rowF = top > 0 ? (top - yl) / top : 0;
            else if (yl >= bottom) rowF = (height - bottom) > 0 ? (yl - bottom) / (height - bottom) : 0;

            let bandW = 0;
            if (mBands) {
                const nb = noise(yl * cBandScale + cBandSeed);
                if (nb > 0.66) bandW = (nb - 0.66) / 0.34;
                else if (nb < 0.34) bandW = -(0.34 - nb) / 0.34;
            }
            bandW *= 15;
            const scanRow = ((yl | 0) & 1) === 0;
            const dRow = ((y - oy) * ow - ox) << 2;   // + (x << 2) = byte offset of (x, y)

            // segments of this row: 0 = inside the image, 1 = left stretch, 2 = right stretch, 3 = top/bottom stretch
            for (let seg = 0; seg < 3; seg++) {
                let xa, xb, kind;
                if (inRows) {
                    if (seg === 0) { if (!sLeft) continue; xa = R.x0; xb = R.xIn0; kind = 1; }
                    else if (seg === 1) { xa = R.xIn0; xb = R.xIn1; kind = 0; }
                    else { if (!sRight) continue; xa = R.xIn1; xb = R.x1; kind = 2; }
                } else {
                    if (seg !== 0) break;
                    xa = R.xIn0; xb = R.xIn1; kind = 3;
                }
                if (xb <= xa) continue;

                if (kind === 0) {              // straight copy of the image itself
                    const sRowOff = sy * physStride;
                    for (let x = xa; x < xb; x++) {
                        const si = (colSrc[x] + sRowOff) << 2, di = dRow + (x << 2);
                        dst[di] = src[si]; dst[di + 1] = src[si + 1]; dst[di + 2] = src[si + 2]; dst[di + 3] = src[si + 3];
                    }
                    continue;
                }

                const vert = kind !== 3;
                const eBuf = doEdges ? (vert ? edgeV : edgeH) : null;
                const lf = eSample ? (vert ? lumV : lumH) : null;
                const fixedX = kind === 1 ? edgeColL : edgeColR;
                const fixedY = aboveTop ? edgeRowT : edgeRowB;

                for (let x = xa; x < xb; x++) {
                    const xl = x / pdOut;
                    let ssx, ssy, str;
                    if (vert) {
                        ssx = fixedX; ssy = sy; str = colFactor[x];
                        if (doDistort) {
                            const coord = symmetrical ? colDist[x] : xl;
                            let n;
                            if (isSquare) n = Math.sin((coord + yl) * scale) >= 0 ? 1 : -1;
                            else if (isSaw) { const ph = (coord + yl) * scale * 0.15915494309; n = 2 * (ph - Math.floor(ph)) - 1; }
                            else if (isSine) n = Math.sin((coord + yl) * scale);
                            else n = (noise(coord * scale, yl * scale) - 0.5) * 2;
                            ssy = sy + (n * amp * str * geoPd | 0);
                            if (ssy < 0) ssy = 0; else if (ssy > maxY) ssy = maxY;
                        }
                    } else { ssx = colSrc[x]; ssy = fixedY; str = rowF; }

                    const far = str > 0;
                    if (doWarp && far) {
                        if (wMosaic) {
                            const cellPh = ((1 + wMosaic * str) | 0) * geoPd;
                            if (cellPh > 1) { if (vert) ssy = (ssy / cellPh | 0) * cellPh; else ssx = (ssx / cellPh | 0) * cellPh; }
                        }
                        if (wShear) {
                            const band = (vert ? yl : xl) / wBand | 0;
                            let nz = shearNoise[band];          // one noise value per band, looked up once
                            if (nz !== nz) nz = shearNoise[band] = noise(band * 0.5, 17.3);
                            const j = ((nz - 0.5) * 2 * wShear * str * geoPd) | 0;
                            if (vert) ssy += j; else ssx += j;
                        }
                        if (wHaze) {
                            const hz = (Math.sin(yl * 0.3 + xl * 0.1) * wHaze * str * geoPd) | 0;
                            if (vert) ssy += hz; else ssx += hz;
                        }
                        if (ssy < 0) ssy = 0; else if (ssy > maxY) ssy = maxY;
                        if (ssx < 0) ssx = 0; else if (ssx > maxX) ssx = maxX;
                    }

                    const eb = far ? eBuf : null;
                    let r, g, b, a;
                    if (wEcho && far) {
                        const d = (wEcho * str * geoPd) | 0;
                        let Rr = 0, Gg = 0, Bb = 0, Aa = 0;
                        for (let e = -1; e <= 1; e++) {
                            let ex = ssx, ey = ssy;
                            if (vert) ey += e * d; else ex += e * d;
                            if (ey < 0) ey = 0; else if (ey > maxY) ey = maxY;
                            if (ex < 0) ex = 0; else if (ex > maxX) ex = maxX;
                            if (eb) {
                                const ek = (vert ? ey / pd | 0 : ex / pd | 0) << 2;
                                Rr += eb[ek]; Gg += eb[ek + 1]; Bb += eb[ek + 2]; Aa += eb[ek + 3];
                            } else {
                                const ei = (ex + ey * physStride) << 2;
                                Rr += src[ei]; Gg += src[ei + 1]; Bb += src[ei + 2]; Aa += src[ei + 3];
                            }
                        }
                        r = Rr / 3; g = Gg / 3; b = Bb / 3; a = Aa / 3;
                    } else if (eb) {
                        const ek = (vert ? ssy / pd | 0 : ssx / pd | 0) << 2;
                        r = eb[ek]; g = eb[ek + 1]; b = eb[ek + 2]; a = eb[ek + 3];
                    } else {
                        const si = (ssx + ssy * physStride) << 2;
                        r = src[si]; g = src[si + 1]; b = src[si + 2]; a = src[si + 3];
                    }

                    if (lf && far) { const f = lf[vert ? ssy / pd | 0 : ssx / pd | 0]; r *= f; g *= f; b *= f; }

                    if (doColor && far) {
                        const t = Math.min(1, str * cAmount);
                        for (let k = 0; k < nActive; k++) {
                            switch (active[k]) {
                                case 1: r += (255 - 2 * r) * t; g += (255 - 2 * g) * t; b += (255 - 2 * b) * t; break;
                                case 2: r += (cTint[0] - r) * t; g += (cTint[1] - g) * t; b += (cTint[2] - b) * t; break;
                                case 3: {
                                    const li = (str * 255 | 0) * 3;
                                    r += (palette[li] - r) * t; g += (palette[li + 1] - g) * t; b += (palette[li + 2] - b) * t; break;
                                }
                                case 4: {
                                    const sh = (str * cShift * geoPd) | 0;
                                    let ry = ssy + sh; if (ry < 0) ry = 0; else if (ry > maxY) ry = maxY;
                                    let by = ssy - sh; if (by < 0) by = 0; else if (by > maxY) by = maxY;
                                    if (eb) { if (vert) { r = eb[(ry / pd | 0) << 2]; b = eb[((by / pd | 0) << 2) + 2]; } }
                                    else { r = src[(ssx + ry * physStride) << 2]; b = src[((ssx + by * physStride) << 2) + 2]; }
                                    break;
                                }
                                case 5: {
                                    let lv = (cLevels - (cLevels - 2) * str) | 0;
                                    if (lv < 2) lv = 2;
                                    const step = 255 / (lv - 1);
                                    r = Math.round(r / step) * step; g = Math.round(g / step) * step; b = Math.round(b / step) * step; break;
                                }
                                case 6: {
                                    const gain = 1 + str * cAmount * 2.5;
                                    r *= gain; g *= gain; b *= gain;
                                    const lift = str * cAmount * 0.4;
                                    r += (255 - r) * lift; g += (255 - g) * lift; b += (255 - b) * lift; break;
                                }
                                case 7: {
                                    const lum = r * 0.299 + g * 0.587 + b * 0.114;
                                    if (lum > 160) { const gain = 1 + (lum - 160) / 95 * str * cAmount * 3; r *= gain; g *= gain; b *= gain; }
                                    else a *= (1 - t * 0.5);
                                    break;
                                }
                                case 8: if (scanRow) { const dim = 1 - 0.5 * t; r *= dim; g *= dim; b *= dim; } break;
                                case 9:
                                    if (bandW > 0) { const w = bandW * t; r += (255 - r) * w; g += (255 - g) * w; b += (255 - b) * w; }
                                    else if (bandW < 0) { const w = -bandW * t; r *= (1 - w); g *= (1 - w); b *= (1 - w); }
                                    break;
                                case 10: a *= (1 - t); break;
                            }
                        }
                    }

                    const di = dRow + (x << 2);
                    dst[di] = r; dst[di + 1] = g; dst[di + 2] = b; dst[di + 3] = a;
                }
            }
        }

        if (blurPx >= 1) boxBlurRGBA(dst, ow, oh, blurPx);
        return { data: dst, x: ox, y: oy, w: ow, h: oh };
    }

    // Fast approximate gaussian blur for an RGBA buffer (in place): a separable box
    // blur run three times, in premultiplied space so the transparent surroundings
    // do not bleed dark halos into the edges.
    function boxBlurRGBA(px, w, h, radius, passes) {
        passes = passes || 3;
        radius = Math.round(radius);
        if (radius < 1) return;
        const n = w * h;
        const pr = new Float32Array(n), pg = new Float32Array(n), pb = new Float32Array(n), pa = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const k = i << 2, a01 = px[k + 3] / 255;
            pr[i] = px[k] * a01; pg[i] = px[k + 1] * a01; pb[i] = px[k + 2] * a01; pa[i] = px[k + 3];
        }
        const tmp = new Float32Array(n);
        for (let p = 0; p < passes; p++) {
            boxBlurPass(pr, tmp, w, h, radius, true); boxBlurPass(tmp, pr, w, h, radius, false);
            boxBlurPass(pg, tmp, w, h, radius, true); boxBlurPass(tmp, pg, w, h, radius, false);
            boxBlurPass(pb, tmp, w, h, radius, true); boxBlurPass(tmp, pb, w, h, radius, false);
            boxBlurPass(pa, tmp, w, h, radius, true); boxBlurPass(tmp, pa, w, h, radius, false);
        }
        for (let i = 0; i < n; i++) {
            const k = i << 2, a = pa[i];
            if (a > 0) { const inv = 255 / a; px[k] = pr[i] * inv; px[k + 1] = pg[i] * inv; px[k + 2] = pb[i] * inv; }
            else { px[k] = px[k + 1] = px[k + 2] = 0; }
            px[k + 3] = a;
        }
    }

    function boxBlurPass(src, dst, w, h, r, horizontal) {
        const norm = 1 / (2 * r + 1);
        if (horizontal) {
            for (let y = 0; y < h; y++) {
                const row = y * w;
                let sum = 0;
                for (let i = -r; i <= r; i++) { const xi = i < 0 ? 0 : (i >= w ? w - 1 : i); sum += src[row + xi]; }
                for (let x = 0; x < w; x++) {
                    dst[row + x] = sum * norm;
                    const addIdx = x + r + 1, remIdx = x - r;
                    sum += src[row + (addIdx >= w ? w - 1 : addIdx)] - src[row + (remIdx < 0 ? 0 : remIdx)];
                }
            }
        } else {
            for (let x = 0; x < w; x++) {
                let sum = 0;
                for (let i = -r; i <= r; i++) { const yi = i < 0 ? 0 : (i >= h ? h - 1 : i); sum += src[yi * w + x]; }
                for (let y = 0; y < h; y++) {
                    dst[y * w + x] = sum * norm;
                    const addIdx = y + r + 1, remIdx = y - r;
                    sum += src[(addIdx >= h ? h - 1 : addIdx) * w + x] - src[(remIdx < 0 ? 0 : remIdx) * w + x];
                }
            }
        }
    }

    return { compute, region, boxBlurRGBA, modeMask, toRGBA, MODE_BITS, DEFAULT_ORDER };
});
