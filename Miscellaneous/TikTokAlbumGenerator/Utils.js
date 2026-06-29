// For p5js 2.x.x

// ===================
// Math Utilities
// ===================

function mapp(value, start1, stop1, start2, stop2, clamped = false) {
    let res = start2 + ((value - start1) / (stop1 - start1)) * (stop2 - start2);
    if (clamped) {
        if (res < start2) res = start2;
        else if (res > stop2) res = stop2;
    }
    return start2 + ((value - start1) / (stop1 - start1)) * (stop2 - start2);
}

function randomm(start, stop) {
    return Math.random() * (stop - start) + start;
}

function lerpp(start, end, t) {
    return start + (end - start) * t;
}

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2;
}

function getTwoDecimals(number) {
    let numStr = number.toFixed(2);
    let decimals = numStr.split('.')[1];
    return [parseInt(decimals[0]), parseInt(decimals[1])];
}

function getSimpleInt(n) {
    if (n === 0) return "0";
    
    const absN = Math.abs(n);

    if (absN < 0.001) return n.toExponential(2); // Very tiny, use scientific notation
    if (absN < 1) return n.toFixed(4);            // Small decimals, show 4 digits
    if (absN < 1000) return Math.floor(n);
    if (absN < 1000000) return (n / 1000).toFixed(2) + "K";
    if (absN < 1000000000) return (n / 1000000).toFixed(2) + "M";
    
    return (n / 1000000000).toFixed(2) + "B";
}

function constrainn(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

//cuanto mas bajo sea el exponent, mas sube los valores bajos
function nonlinearMap(value, start1, stop1, start2, stop2, exponent = 0.25) {
    let norm = constrainn((value - start1) / (stop1 - start1), 0, 1);
    let curved = Math.pow(norm, exponent); 
    return start2 + curved * (stop2 - start2);
}

function getRadius(circumference) {
    return circumference / (2 * Math.PI);
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function lineIntersection(p1, p2, p3, p4) {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (denom === 0) return undefined; 

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return undefined;

    return {
        x: p1.x + ua * (p2.x - p1.x),
        y: p1.y + ua * (p2.y - p1.y)
    };
}


// ===================
// Color Utilities
// ===================

function randomizeColor(col, amt) {
    if (!col._color.coords) return col.map(c => c + randomm(-amt, amt));
    else if (col._color.coords.length == 4)
        return color(col._color.coords[0] + randomm(-amt, amt), col._color.coords[1] + randomm(-amt, amt), col._color.coords[2] + randomm(-amt, amt), col._color.coords[3]);
    else if (col._color.coords.length == 3)
        return color(col._color.coords[0] + randomm(-amt, amt), col._color.coords[1] + randomm(-amt, amt), col._color.coords[2] + randomm(-amt, amt));
    else if (col._color.coords.length == 1)
        return color(col._color.coords[0] + randomm(-amt, amt));
    else if (col._color.coords.length == 2)
        return color(col._color.coords[0] + randomm(-amt, amt), col._color.coords[1] + randomm(-amt, amt));
    return col._color.coords.map(c => c + randomm(-amt, amt));
}

function modifyColor(col, amt) {
    return col.map(c => c + amt);
}

function lerppColor(color1, color2, t) {
    return color1.map((c, i) => (1 - t) * c + t * color2[i]);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function getPopularColors(
  img, count = 3, bucketSize = 32, step = 1,
  distinctHue = false, hueMinDiff = 30
) {
  img.loadPixels();
  const px = img.pixels;
  const levels = Math.ceil(256 / bucketSize);
  const buckets = {};
  const stride = 4 * Math.max(1, Math.floor(step));

  for (let i = 0; i < px.length; i += stride) {
    if (px[i + 3] < 128) continue; // skip mostly-transparent pixels

    const r = px[i], g = px[i + 1], b = px[i + 2];
    const key = (Math.floor(r / bucketSize) * levels
              +  Math.floor(g / bucketSize)) * levels
              +  Math.floor(b / bucketSize);

    if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
    const bk = buckets[key];
    bk.count++; bk.r += r; bk.g += g; bk.b += b;
  }

  const sorted = Object.values(buckets)
    .sort((a, b) => b.count - a.count)
    .map(bk => [
      Math.round(bk.r / bk.count),
      Math.round(bk.g / bk.count),
      Math.round(bk.b / bk.count),
    ]);

  const minDist = bucketSize * 1.5;
  const result = [];

  // Pick the distinctness rule once
  const passes = distinctHue
    ? (c) => isHueFarEnough(c, result, hueMinDiff)
    : (c) => isFarEnough(c, result, minDist);

  // Pass 1: enforce distinctness
  for (const avg of sorted) {
    if (passes(avg)) result.push(avg);
    if (result.length === count) return result;
  }

  // Pass 2: top up with the next most popular, skipping exact dupes
  for (const avg of sorted) {
    if (!result.some(c => c[0] === avg[0] && c[1] === avg[1] && c[2] === avg[2])) {
      result.push(avg);
    }
    if (result.length === count) break;
  }
  return result;
}

function isFarEnough(c, chosen, minDist) {
  return chosen.every(o => {
    const dr = o[0] - c[0], dg = o[1] - c[1], db = o[2] - c[2];
    return Math.sqrt(dr * dr + dg * dg + db * db) >= minDist;
  });
}

function isHueFarEnough(c, chosen, minDiff) {
  const h = rgbHue(c[0], c[1], c[2]);
  return chosen.every(o => {
    const ho = rgbHue(o[0], o[1], o[2]);
    if (h === null || ho === null) return h !== ho; // achromatic handling (see note)
    const d = Math.abs(h - ho);
    return Math.min(d, 360 - d) >= minDiff; // hue is circular
  });
}

function rgbHue(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return null; // gray/black/white — no meaningful hue
  let h;
  if (max === r)      h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else                h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

// ===================
// Drawing Utilities
// ===================

let density;

function drawFastRect(x, y, w, h, r, g, b, a = 255) {
    let adjustedWidth = width * density;
    for (let i = 0; i < w * density; i++) {
        for (let j = 0; j < h * density; j++) {
            let index = 4 * (((y * density) + j) * adjustedWidth + ((x * density) + i));
            pixels[index] = r;
            pixels[index + 1] = g;
            pixels[index + 2] = b;
            pixels[index + 3] = a;
        }
    }
}

function gradientLine(x1, y1, x2, y2, colors) {
    var grad = this.drawingContext.createLinearGradient(x1, y1, x2, y2);
    for (let i = 0; i < colors.length; i++) {
        grad.addColorStop(i / (colors.length - 1), colors[i]);
    }
    this.drawingContext.strokeStyle = grad;
    line(x1, y1, x2, y2);
}

function drawArrowTip(x, y, angle, arrowSize = 7) {
    let x1 = x + Math.cos(angle - PI / 6) * arrowSize;
    let y1 = y + Math.sin(angle - PI / 6) * arrowSize;
    let x2 = x + Math.cos(angle + PI / 6) * arrowSize;
    let y2 = y + Math.sin(angle + PI / 6) * arrowSize;
    line(x, y, x1, y1);
    line(x, y, x2, y2);
}

function drawDashedLine(x1, y1, x2, y2, dashLength = 10) {
    let d = dist(x1, y1, x2, y2);
    let numDashes = Math.floor(d / dashLength);
    let dx = (x2 - x1) / numDashes;
    let dy = (y2 - y1) / numDashes;
    for (let i = 0; i < numDashes; i++) {
        line(x1 + i * dx, y1 + i * dy, x1 + (i + 0.5) * dx, y1 + (i + 0.5) * dy);
    }
}

function createGlitchyImage(img, imgW, imgH, imgPos, opts = {}){
    //stretches the edge pixels of an image toward the canvas sides for a glitchy effect
    //opts:
    //  sides       {left, right, top, bottom} - which edges get extended
    //  type        'noise' | 'sine' | 'square' | 'sawtooth' | 'none'  - how the stretched columns are
    //              distorted vertically. square = hard alternating bands; sawtooth = ramp that snaps back
    //  amp         max vertical pixel shift of the stretched columns
    //  scale       noise zoom / sine frequency
    //  symmetrical if true the distortion is driven by distance to the image, so left and right mirror each other
    //  color       {mode, amount, tint, levels, shift} - recolours the stretched pixels, growing with distance:
    //              mode: combine with '+' or an array, e.g. 'glow+fade' or ['glow','fade']
    //                    'none'|'invert'|'tint'|'rainbow'|'chromatic'|'posterize'|'fade'|'glow'|'bloom'|'scanlines'|'bands'
    //              amount 0..1 strength, tint [r,g,b], levels = posterize steps, shift = chromatic split in px
    //              bandScale = band thickness (smaller=thicker), bandSeed = noise offset for animating bands
    //  blur        gaussian blur radius applied to the finished glitch image (0 = off)
    //  warp        {mosaic, shear, echo, haze, band} - geometry distortions of the SAMPLE position, grow with distance:
    //              mosaic = max cell size (resolution decay), shear = max band jump in px (torn-signal tearing),
    //              echo   = max smear offset in px (motion-trail blur), haze = shimmer amplitude in px,
    //              band   = shear band thickness in px (default 24)
    //  edges       {colors, mode, scale, seed, sample, sampleFactor} - rebuild the sampled edge so the
    //              stretched art comes from synthetic colours instead of the image. colors = array of
    //              [r,g,b] or '#hex'; all selected sides get the same treatment.
    //              mode 'random' (re-rolls each call) | 'noise' (smooth regions); scale = noise zoom,
    //              seed = noise offset (animate with e.g. seed: frameCount * 0.01).
    //              sample (boolean) ignores `colors`: it keeps each real edge pixel's hue but jitters its
    //              luminance by up to +/-sampleFactor (0..1, default 0.5). mode/scale/seed shape the jitter
    //              (noise = smooth bands, random = per-call), so sample works with either mode.
    const {
        sides = {left: true, right: true, top: false, bottom: false},
        type = 'noise',
        amp = 60,
        scale = 0.02,
        symmetrical = true,
        color = {},
        warp = {},
        edges = {},
        blur = 0           //gaussian blur radius applied to the finished glitch image (0 = off)
    } = opts
    const isSine = type === 'sine'
    const isSquare = type === 'square'     //hard alternating bands (digital tearing)
    const isSaw = type === 'sawtooth'      //ramp that snaps back (directional sweep tears)
    const doDistort = type !== 'none' && amp !== 0

    //--- colour effects: parse mode(s) into a bitmask so several can stack -------------------
    const cAmount = color.amount != null ? color.amount : 1
    const cTint = color.tint || [255, 60, 180]
    const cLevels = color.levels || 4
    const cShift = color.shift != null ? color.shift : 10
    //bands mode: bandScale controls average band thickness (smaller = thicker), bandSeed offsets the
    //noise so you can animate it from the call site (e.g. bandSeed: frameCount * 0.02)
    const cBandScale = color.bandScale != null ? color.bandScale : 0.05
    const cBandSeed = color.bandSeed || 0

    const MODE_BITS = {
        none: 0, invert: 1, tint: 2, rainbow: 4, chromatic: 8, posterize: 16,
        fade: 32, glow: 64, overexpose: 64, bloom: 128, scanlines: 256, crt: 256,
        bands: 512, interference: 512
    }
    let cModeCode = 0
    {
        const m = color.mode
        const names = Array.isArray(m) ? m : (typeof m === 'string' ? m.split(/[+,\s|]+/) : [])
        for(const name of names) cModeCode |= (MODE_BITS[name] || 0)
    }
    const doColor = cModeCode !== 0 && cAmount !== 0
    //resolve to booleans once so the inner loop is just flag checks
    const mInvert    = (cModeCode & 1)   !== 0
    const mTint      = (cModeCode & 2)   !== 0
    const mRainbow   = (cModeCode & 4)   !== 0
    const mChromatic = (cModeCode & 8)   !== 0
    const mPosterize = (cModeCode & 16)  !== 0
    const mFade      = (cModeCode & 32)  !== 0
    const mGlow      = (cModeCode & 64)  !== 0
    const mBloom     = (cModeCode & 128) !== 0
    const mScanline  = (cModeCode & 256) !== 0
    const mBands     = (cModeCode & 512) !== 0

    //--- geometry warps: distort which source pixel feeds each canvas pixel ------------------
    const wMosaic = warp.mosaic || 0
    const wShear  = warp.shear  || 0
    const wEcho   = warp.echo   || 0
    const wHaze   = warp.haze   || 0
    const wBand   = warp.band   || 24
    const doWarp  = wMosaic !== 0 || wShear !== 0 || wHaze !== 0   //echo handled separately (it changes the read)

    //--- edge art: parse the synthetic colours that will replace the sampled edge ------------
    //colours may be [r,g,b(,a)] arrays or '#rgb'/'#rrggbb' strings
    const toRGBA = c => {
        if(Array.isArray(c)) return [c[0] || 0, c[1] || 0, c[2] || 0, c[3] != null ? c[3] : 255]
        if(typeof c === 'string'){
            let h = c.replace('#', '')
            if(h.length === 3) h = h[0]+h[0] + h[1]+h[1] + h[2]+h[2]
            const n = parseInt(h, 16)
            return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
        }
        return [0, 0, 0, 255]
    }
    const eColors = (edges.colors || []).map(toRGBA)
    const nCol = eColors.length
    const eNoise = edges.mode === 'noise'
    //sample is independent of mode: it keeps the real edge pixel but jitters its luminance (no colours).
    //mode/scale/seed still shape the jitter, so it composes with 'noise' or 'random'.
    const eSample = !!edges.sample
    const eSampleFactor = edges.sampleFactor != null ? edges.sampleFactor : 0.5
    const doEdges = nCol > 0 || eSample
    const eScale = edges.scale != null ? edges.scale : 0.05
    const eSeed = edges.seed || 0
    const edgeOffset = edges.offset != null ? edges.offset : 0

    //rainbow mode reads from a precomputed 256-entry palette (cosine gradient) so there's no trig per pixel
    let palette = null
    if(mRainbow){
        palette = new Uint8Array(256 * 3)
        for(let i = 0; i < 256; i++){
            const t = i / 255 * 6.28318
            palette[i * 3]     = 128 + 127 * Math.sin(t)
            palette[i * 3 + 1] = 128 + 127 * Math.sin(t + 2.094)
            palette[i * 3 + 2] = 128 + 127 * Math.sin(t + 4.188)
        }
    }

    // Output at full display density: each physical screen pixel gets its own output pixel → crisp on HiDPI.
    // Callers must draw with image(result, 0, 0, width, height) so the logical size stays correct.
    const pdOut = (typeof pixelDensity === 'function') ? pixelDensity() : 1

    //--- supersample the source so the stretched pixels aren't blocky -------------------------
    //The stretch repeats a single edge row/column outward, so the detail you see in the
    //stretched band is limited by the source's resolution. A typical album cover (~640px)
    //displayed at HiDPI gets upscaled by the nearest-neighbour sampler below -> visible blocks.
    //Here we pre-upscale a COPY of the source (p5's resize is smooth/bilinear) so its pixel grid
    //is at least as dense as the output region, giving the sampler real pixels to read.
    //  opts.superSample : false disables, a number sets the max enlargement (default cap 4).
    //geoScale records how much we enlarged so amp/warp/chromatic offsets (which are authored in
    //logical px) keep their on-screen size — see geoPd below.
    let geoScale = 1
    {
        const ss = opts.superSample
        if(ss !== false && img.width > 0 && img.height > 0){
            const srcPd = (img.pixelDensity ? img.pixelDensity() : 1)
            //how much bigger the output stretch region is than the source, per axis
            const needW = (imgW * pdOut) / (img.width  * srcPd)
            const needH = (imgH * pdOut) / (img.height * srcPd)
            let k = Math.max(needW, needH)
            if(k > 1.01){
                const cap = (typeof ss === 'number') ? ss : 4
                k = Math.min(k, cap)
                const up = img.get()                                   //copy so the original isn't mutated
                up.resize(Math.round(img.width * k), Math.round(img.height * k))
                img = up
                geoScale = k
            }
        }
    }

    img.loadPixels()
    const src = img.pixels          //raw RGBA bytes of the source image
    const iw = img.width
    const ih = img.height
    // On high-DPI displays createGraphics() buffers have pixelDensity()>1, so their
    // pixels array row stride is iw*pd not iw. createImage() is always density-1.
    const pd = (img.pixelDensity ? img.pixelDensity() : 1)
    const physStride = iw * pd      //physical pixels per source row
    // Physical source dimensions — ssx/ssy are kept in physical coords throughout so
    // the floor only happens once (at physical resolution), eliminating aliasing artifacts.
    const ipw = iw * pd             //physical source width
    const iph = ih * pd             //physical source height
    // Logical-px -> source-physical-px factor for the geometry/colour offsets (amp, shear, echo,
    // haze, mosaic, chromatic). When we supersampled, the source got `geoScale`x denser but pd
    // dropped to 1, so use geoScale to keep those offsets the same on-screen size as before.
    const geoPd = geoScale > 1 ? geoScale : pd

    //the rectangle where the image is displayed inside the canvas (imgW/imgH is the display size, imgPos its center)
    const left = imgPos.x - imgW/2
    const right = imgPos.x + imgW/2
    const top = imgPos.y - imgH/2
    const bottom = imgPos.y + imgH/2

    const newImg = createImage(width * pdOut, height * pdOut)
    newImg.loadPixels()
    const dst = newImg.pixels       //starts fully transparent, we only write the pixels we want
    const cw = width * pdOut        //physical output dimensions
    const ch = height * pdOut

    const sLeft = sides.left, sRight = sides.right, sTop = sides.top, sBottom = sides.bottom

    //build the synthetic edge(s): a 1D strip of colours indexed by the free axis. left+right share the
    //vertical strip (length ih), top+bottom share the horizontal strip (length iw) - hence "same treatment".
    let edgeV = null, edgeH = null   //synthetic colour strips (colour edge modes)
    let lumV = null, lumH = null     //per-index brightness multipliers (sample mode)
    if(doEdges && eSample){
        //sample: a 1D strip of brightness multipliers in [1-f, 1+f]. Scaling r,g,b by the same
        //factor changes luminance while leaving the hue untouched. noise = smooth jitter bands
        //(driven by scale/seed); random = re-rolled per call.
        const fillLum = (len) => {
            const buf = new Float32Array(len)
            for(let i = 0; i < len; i++){
                const n = eNoise ? (noise(i * eScale + eSeed) * 2 - 1) : (Math.random() * 2 - 1)
                let f = 1 + n * eSampleFactor
                if(f < 0) f = 0
                buf[i] = f
            }
            return buf
        }
        if(sLeft || sRight) lumV = fillLum(ih)
        if(sTop || sBottom) lumH = fillLum(iw)
    }
    else if(doEdges){
        const fillEdge = (len) => {
            const buf = new Uint8ClampedArray(len * 4)
            for(let i = 0; i < len; i++){
                //random re-rolls every call; noise gives smooth colour regions of varying width
                let idx = eNoise ? (noise(i * eScale + eSeed) * nCol | 0) : (Math.random() * nCol | 0)
                if(idx >= nCol) idx = nCol - 1
                const c = eColors[idx], k = i << 2
                buf[k] = c[0]; buf[k + 1] = c[1]; buf[k + 2] = c[2]; buf[k + 3] = c[3]
            }
            return buf
        }
        if(sLeft || sRight) edgeV = fillEdge(ih)
        if(sTop || sBottom) edgeH = fillEdge(iw)
    }

    //precompute the source column for every canvas x, so there are no divisions in the inner loop
    const colSrc = new Int32Array(cw)
    //colFactor = 0 at the image edge -> 1 at the canvas edge, so the distortion grows with distance
    const colFactor = new Float32Array(cw)
    //colDist = pixel distance from the image edge; used as the distortion coordinate so both sides can mirror
    const colDist = new Float32Array(cw)
    for(let x = 0; x < cw; x++){
        const xl = x / pdOut            //logical x for this physical output column
        let sx = (xl - left) / imgW * ipw | 0   //physical source x — floor at physical res, not logical
        if(sx < 0) sx = 0
        else if(sx > ipw - 1) sx = ipw - 1
        colSrc[x] = sx

        if(xl < left){
            colFactor[x] = left > 0 ? (left - xl) / left : 0
            colDist[x] = left - xl      //logical distance; keeps effect scale density-independent
        }
        else if(xl >= right){
            colFactor[x] = (width - right) > 0 ? (xl - right) / (width - right) : 0
            colDist[x] = xl - right
        }
        else { colFactor[x] = 0; colDist[x] = 0 }
    }

    for(let y = 0; y < ch; y++){
        const yl = y / pdOut            //logical y for this physical output row
        const inRows = (yl >= top && yl < bottom)
        const aboveTop = (yl < top)
        //map the canvas row to a row of the source image (physical coords, floor at physical res)
        let sy = (yl - top) / imgH * iph | 0
        if(sy < 0) sy = 0
        else if(sy > iph - 1) sy = iph - 1

        //how far this row is from the image (0 inside -> 1 at the canvas edge), used by top/bottom effects
        let rowF = 0
        if(aboveTop) rowF = top > 0 ? (top - yl) / top : 0
        else if(yl >= bottom) rowF = (height - bottom) > 0 ? (yl - bottom) / (height - bottom) : 0

        //bands: one noise sample per row decides if this row sits in a bright band (+), dark band (-) or
        //neither (0). the varying run-length of noise above/below the thresholds randomises the band widths
        let bandW = 0
        if(mBands){
            const nb = noise(yl * cBandScale + cBandSeed)
            if(nb > 0.66) bandW = (nb - 0.66) / 0.34          //0..1 toward white
            else if(nb < 0.34) bandW = -(0.34 - nb) / 0.34    //-1..0 toward black
        }
        bandW *= 15

        const dRow = y * cw
        for(let x = 0; x < cw; x++){
            const xl = x / pdOut        //logical x for this physical output column
            //decide which source pixel feeds this canvas pixel (ssx < 0 means leave transparent)
            //str = 0..1 distance from the image, drives colour + warp effects
            //vert = which axis the stretch leaves free: true for left/right (ssy free), false for top/bottom (ssx free)
            let ssx = -1, ssy = 0, str = 0, vert = true
            if(inRows){
                if(xl >= left && xl < right){ ssx = colSrc[x]; ssy = sy }   //inside the image
                else {
                    const useLeft = (xl < left)
                    if(useLeft ? sLeft : sRight){                            //stretch first/last column
                        ssx = useLeft ? (edgeOffset * (ipw - 1) | 0) : ((1 - edgeOffset) * (ipw - 1) | 0)
                        ssy = sy
                        str = colFactor[x]
                        if(doDistort){
                            //coord is symmetric (distance to image) or raw x; -1..1 wave * amp * distance-from-image
                            const coord = symmetrical ? colDist[x] : xl
                            let n
                            if(isSquare) n = Math.sin((coord + yl) * scale) >= 0 ? 1 : -1
                            else if(isSaw){
                                const ph = (coord + yl) * scale * 0.15915494309
                                n = 2 * (ph - Math.floor(ph)) - 1
                            }
                            else if(isSine) n = Math.sin((coord + yl) * scale)
                            else            n = (noise(coord * scale, yl * scale) - 0.5) * 2
                            ssy = sy + (n * amp * colFactor[x] * geoPd | 0)   //shift in physical pixels
                            if(ssy < 0) ssy = 0
                            else if(ssy > iph - 1) ssy = iph - 1
                        }
                    }
                }
            }
            else if(xl >= left && xl < right){
                vert = false
                if(aboveTop){ if(sTop){ ssx = colSrc[x]; ssy = (edgeOffset * (iph - 1) | 0); str = rowF } }      //stretch first row
                else { if(sBottom){ ssx = colSrc[x]; ssy = ((1 - edgeOffset) * (iph - 1) | 0); str = rowF } }    //stretch last row
            }
            if(ssx < 0) continue

            //--- geometry warps: nudge the sample position, all scaled by distance (str) ------
            if(doWarp && str > 0){
                if(wMosaic){
                    //resolution decay: snap the free axis to growing cells (cell size in logical px)
                    const cell = (1 + wMosaic * str) | 0
                    const cellPh = cell * geoPd         //same cell size in physical pixels
                    if(cellPh > 1){
                        if(vert) ssy = (ssy / cellPh | 0) * cellPh
                        else     ssx = (ssx / cellPh | 0) * cellPh
                    }
                }
                if(wShear){
                    //torn-signal tearing: each band (perpendicular to the stretch) jumps by a noise amount
                    const bandCoord = vert ? yl : xl
                    const band = bandCoord / wBand | 0
                    const j = ((noise(band * 0.5, 17.3) - 0.5) * 2 * wShear * str * geoPd) | 0
                    if(vert) ssy += j
                    else     ssx += j
                }
                if(wHaze){
                    //shimmer: a fast secondary sine wobble layered on top of the main wave
                    const h = (Math.sin(yl * 0.3 + xl * 0.1) * wHaze * str * geoPd) | 0
                    if(vert) ssy += h
                    else     ssx += h
                }
                //re-clamp after the offsets
                if(ssy < 0) ssy = 0; else if(ssy > iph - 1) ssy = iph - 1
                if(ssx < 0) ssx = 0; else if(ssx > ipw - 1) ssx = ipw - 1
            }

            //--- sample the source (echo = average a few taps along the free axis for motion trails) ---
            //if edge-art is on, stretched pixels read from the synthetic edge strip instead of the image
            const eBuf = (doEdges && str > 0) ? (vert ? edgeV : edgeH) : null
            let r, g, b, a
            if(wEcho && str > 0){
                const d = (wEcho * str * geoPd) | 0   //echo offset in physical pixels
                let R = 0, G = 0, B = 0, A = 0
                for(let e = -1; e <= 1; e++){
                    let ex = ssx, ey = ssy
                    if(vert) ey += e * d
                    else     ex += e * d
                    if(ey < 0) ey = 0; else if(ey > iph - 1) ey = iph - 1
                    if(ex < 0) ex = 0; else if(ex > ipw - 1) ex = ipw - 1
                    if(eBuf){
                        const ek = (vert ? ey/pd|0 : ex/pd|0) << 2   //eBuf is logical-indexed
                        R += eBuf[ek]; G += eBuf[ek + 1]; B += eBuf[ek + 2]; A += eBuf[ek + 3]
                    } else {
                        const ei = (ex + ey * physStride) << 2         //ssx/ssy are physical
                        R += src[ei]; G += src[ei + 1]; B += src[ei + 2]; A += src[ei + 3]
                    }
                }
                r = R / 3; g = G / 3; b = B / 3; a = A / 3
            }
            else if(eBuf){
                const ek = (vert ? ssy/pd|0 : ssx/pd|0) << 2   //eBuf is logical-indexed
                r = eBuf[ek]; g = eBuf[ek + 1]; b = eBuf[ek + 2]; a = eBuf[ek + 3]
            }
            else {
                const si = (ssx + ssy * physStride) << 2        //ssx/ssy are physical
                r = src[si]; g = src[si + 1]; b = src[si + 2]; a = src[si + 3]
            }

            //sample edge mode: scale the real edge pixel's brightness by the per-index factor
            //(same factor on r,g,b -> luminance changes, hue preserved). stretched pixels only.
            if(eSample && str > 0){
                const lf = vert ? lumV : lumH
                if(lf){
                    const f = lf[vert ? ssy/pd|0 : ssx/pd|0]   //lumV/lumH are logical-indexed
                    r *= f; g *= f; b *= f
                }
            }

            //--- colour effects: each runs in order, so they stack ---------------------------
            if(doColor && str > 0){
                const t = Math.min(1, str * cAmount)   //blend strength, capped so it never over-shoots
                if(mInvert){                           //fade toward the negative
                    r += (255 - 2 * r) * t
                    g += (255 - 2 * g) * t
                    b += (255 - 2 * b) * t
                }
                if(mTint){                             //fade toward a single colour
                    r += (cTint[0] - r) * t
                    g += (cTint[1] - g) * t
                    b += (cTint[2] - b) * t
                }
                if(mRainbow){                          //fade toward a palette colour picked by distance
                    const li = (str * 255 | 0) * 3
                    r += (palette[li]     - r) * t
                    g += (palette[li + 1] - g) * t
                    b += (palette[li + 2] - b) * t
                }
                if(mChromatic){                        //split red up / blue down by a growing vertical offset
                    const sh = (str * cShift * geoPd) | 0    //shift in physical pixels
                    let ry = ssy + sh; if(ry < 0) ry = 0; else if(ry > iph - 1) ry = iph - 1
                    let by = ssy - sh; if(by < 0) by = 0; else if(by > iph - 1) by = iph - 1
                    if(eBuf){                          //on edge-art, split within the synthetic strip (vertical strips only)
                        if(vert){ r = eBuf[(ry/pd|0) << 2]; b = eBuf[((by/pd|0) << 2) + 2] }
                    } else {
                        r = src[(ssx + ry * physStride) << 2]
                        b = src[((ssx + by * physStride) << 2) + 2]
                    }
                }
                if(mPosterize){                        //crush to fewer colour levels the farther out we go
                    let lv = (cLevels - (cLevels - 2) * str) | 0
                    if(lv < 2) lv = 2
                    const step = 255 / (lv - 1)
                    r = Math.round(r / step) * step
                    g = Math.round(g / step) * step
                    b = Math.round(b / step) * step
                }
                if(mGlow){                             //overexpose: pump brightness and bloom toward white
                    const gain = 1 + str * cAmount * 2.5
                    r *= gain; g *= gain; b *= gain
                    const lift = str * cAmount * 0.4
                    r += (255 - r) * lift
                    g += (255 - g) * lift
                    b += (255 - b) * lift
                }
                if(mBloom){                            //selective overexposure: only bright pixels blow out
                    const lum = r * 0.299 + g * 0.587 + b * 0.114
                    if(lum > 160){
                        const over = (lum - 160) / 95              //0..1 above the threshold
                        const gain = 1 + over * str * cAmount * 3
                        r *= gain; g *= gain; b *= gain
                    } else {
                        a *= (1 - t * 0.5)                         //dark pixels recede instead
                    }
                }
                if(mScanline){                         //CRT lines: darken alternate rows, deepening with distance
                    if(((yl | 0) & 1) === 0){
                        const dim = 1 - 0.5 * t
                        r *= dim; g *= dim; b *= dim
                    }
                }
                if(mBands && bandW !== 0){              //random white/black noise bands of varying width
                    if(bandW > 0){
                        const w = bandW * t                //bright band: blow toward white
                        r += (255 - r) * w; g += (255 - g) * w; b += (255 - b) * w
                    } else {
                        const w = -bandW * t               //dark band: crush toward black
                        r *= (1 - w); g *= (1 - w); b *= (1 - w)
                    }
                }
                if(mFade){                             //alpha-only, so run last: dissolve into the background
                    a *= (1 - t)
                }
            }

            const di = (x + dRow) << 2
            dst[di]     = r
            dst[di + 1] = g
            dst[di + 2] = b
            dst[di + 3] = a
        }
    }
    if(blur > 0) boxBlurRGBA(dst, cw, ch, blur)   //custom fast blur (p5's filter(BLUR) is too slow)
    newImg.updatePixels()
    return newImg
}

//Fast approximate gaussian blur for an RGBA pixel buffer (in place). It runs a separable
//box blur (horizontal then vertical) a few times; ~3 box passes look gaussian. Each pass is
//O(pixels) regardless of radius thanks to a sliding-window sum, so it's far faster than
//p5's filter(BLUR). Colours are premultiplied by alpha first so the transparent canvas
//around the glitch strip doesn't bleed dark halos into the edges.
function boxBlurRGBA(px, w, h, radius, passes = 3){
    radius = Math.round(radius)
    if(radius < 1) return
    const n = w * h
    //split into channels in premultiplied space (colour * alpha), alpha kept 0..255
    const pr = new Float32Array(n), pg = new Float32Array(n), pb = new Float32Array(n), pa = new Float32Array(n)
    for(let i = 0; i < n; i++){
        const k = i << 2, a01 = px[k + 3] / 255
        pr[i] = px[k] * a01; pg[i] = px[k + 1] * a01; pb[i] = px[k + 2] * a01; pa[i] = px[k + 3]
    }
    const tr = new Float32Array(n), tg = new Float32Array(n), tb = new Float32Array(n), ta = new Float32Array(n)
    for(let p = 0; p < passes; p++){
        boxBlurPass(pr, tr, w, h, radius, true);  boxBlurPass(tr, pr, w, h, radius, false)
        boxBlurPass(pg, tg, w, h, radius, true);  boxBlurPass(tg, pg, w, h, radius, false)
        boxBlurPass(pb, tb, w, h, radius, true);  boxBlurPass(tb, pb, w, h, radius, false)
        boxBlurPass(pa, ta, w, h, radius, true);  boxBlurPass(ta, pa, w, h, radius, false)
    }
    //un-premultiply back to straight RGBA
    for(let i = 0; i < n; i++){
        const k = i << 2, a = pa[i]
        if(a > 0){
            const inv = 255 / a
            px[k] = pr[i] * inv; px[k + 1] = pg[i] * inv; px[k + 2] = pb[i] * inv
        } else { px[k] = px[k + 1] = px[k + 2] = 0 }
        px[k + 3] = a
    }
}

//one separable box-blur pass over a single channel. horizontal === true blurs rows, else
//columns. uses a running sum with clamped edges so cost is independent of the radius.
function boxBlurPass(src, dst, w, h, r, horizontal){
    const norm = 1 / (2 * r + 1)
    if(horizontal){
        for(let y = 0; y < h; y++){
            const row = y * w
            let sum = 0
            for(let i = -r; i <= r; i++){ const xi = i < 0 ? 0 : (i >= w ? w - 1 : i); sum += src[row + xi] }
            for(let x = 0; x < w; x++){
                dst[row + x] = sum * norm
                const addIdx = x + r + 1, remIdx = x - r
                const a = addIdx >= w ? w - 1 : addIdx
                const b = remIdx < 0 ? 0 : remIdx
                sum += src[row + a] - src[row + b]
            }
        }
    } else {
        for(let x = 0; x < w; x++){
            let sum = 0
            for(let i = -r; i <= r; i++){ const yi = i < 0 ? 0 : (i >= h ? h - 1 : i); sum += src[yi * w + x] }
            for(let y = 0; y < h; y++){
                dst[y * w + x] = sum * norm
                const addIdx = y + r + 1, remIdx = y - r
                const a = addIdx >= h ? h - 1 : addIdx
                const b = remIdx < 0 ? 0 : remIdx
                sum += src[a * w + x] - src[b * w + x]
            }
        }
    }
}


//draws the string at (x, y) with a flipped, faded, stretched reflection below it.
//stretchFactor: 1 = mirror the same height, >1 = elongated reflection, <1 = squashed.
function createReflectedText(str, x, y, opts = {}, stretchFactor = 1, font, alignment){
    const {
        fontSize = 120,
        col = [255, 255, 255],
        gap = 4,
        fade = 0.6
    } = opts

    const g = createGraphics(width, height)
    g.textFont(font)
    g.textSize(fontSize)
    g.textAlign(alignment, BASELINE)   //baseline anchoring is what lets the reflection meet the text's bottom
    g.noStroke()
    g.fill(col[0], col[1], col[2])

    //the normal text, baseline sitting at y
    g.text(str, x, y)

    //the reflection goes on its own buffer so we can multiply its alpha by a gradient
    const ref = createGraphics(width, height)
    ref.textFont(font)
    ref.textSize(fontSize)
    ref.textAlign(alignment, BASELINE)
    ref.noStroke()
    ref.fill(col[0], col[1], col[2])

    //flip vertically (negative Y) and stretch by the factor; baseline anchored just below the text
    const refTop = y + gap
    ref.push()
    ref.translate(x, refTop)
    ref.scale(1, -stretchFactor)
    ref.text(str, 0, 0)
    ref.pop()

    //fade: keep the reflection only where a top-down gradient is opaque (destination-in mask)
    const ctx = ref.drawingContext
    const refBottom = refTop + fontSize * stretchFactor
    const grad = ctx.createLinearGradient(0, refTop, 0, refBottom)
    grad.addColorStop(0, 'rgba(0,0,0,' + fade + ')')  //right under the text: most visible
    grad.addColorStop(1, 'rgba(0,0,0,0)')             //farther down: fully gone
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = grad
    ctx.fillRect(0, refTop, width, height - refTop)
    ctx.globalCompositeOperation = 'source-over'      //restore default for safety

    g.image(ref, 0, 0)
    return g
}



// ===================
// String Utilities
// ===================

function removeBarrabaja(str) {
    if (str == undefined) return '';
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '_') newStr += ' ';
        else newStr += str[i];
    }
    return newStr;
}

function replaceBlankWithBarraBaja(str) {
    if (str == undefined) return '';
    let newStr = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] == ' ') newStr += '_';
        else newStr += str[i];
    }
    return newStr;
}

function shortenStr(str, maxLength = 25) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + '...';
    }
    return str;
}

function getAllStr() {
    let str = "";
    for (let p of particles) {
        if (p.str == undefined) continue;
        str += p.str + ', ';
    }
    return str;
}

function getWrappedTextHeight(txt, maxW) {
    // Determine line height (fallback to textSize)
    let lh = textLeading() || textSize();
  
    // Break into chunks on explicit newlines:
    let paragraphs = txt.split('\n');
    let lines = [];
  
    paragraphs.forEach(para => {
      if (para === '') {
        // explicit blank line
        lines.push('');
      } else {
        // wrap this paragraph
        let words = para.split(' ');
        let current = '';
  
        for (let w of words) {
          let test = current ? current + ' ' + w : w;
          if (textWidth(test) > maxW) {
            lines.push(current);
            current = w;
          } else {
            current = test;
          }
        }
  
        // push any leftover text
        if (current) {
          lines.push(current);
        }
      }
    });
  
    // total height = number of lines × line-height
    return lines.length * lh;
}

function isPrintableKey(char) {
    return char.length === 1 && char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126;
}

// ===================
// Other Utilities
// ===================

function inBounds(x, y, a, b, w, h) {
    return x < a + w && x > a && y < b + h && y > b;
}

// ===================
// Drag and Zoom Shortcut
// ===================

/*
let xOff = 0
let yOff = 0
let prevMouseX = 0
let prevMouseY = 0
let zoom = 1

function mouseDragged() {
    if(!prevMouseX) prevMouseX = mouseX
    if(!prevMouseY) prevMouseY = mouseY
    let dx = mouseX - prevMouseX; // Change in mouse X
    let dy = mouseY - prevMouseY; // Change in mouse Y
    xOff += dx;
    yOff += dy;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
}

function mouseReleased() {
    prevMouseX = undefined
    prevMouseY = undefined
}

function mouseWheel(event) {
    let worldX = (mouseX - xOff) / zoom;
    let worldY = (mouseY - yOff) / zoom;
    zoom += event.delta / 1000;
    zoom = Math.max(0.1, Math.min(zoom, 3));
    xOff = mouseX - worldX * zoom;
    yOff = mouseY - worldY * zoom;
    return false;
}

function draw(){
    translate(xOff, yOff)
    scale(zoom)
}

function getRelativePos(x, y){
    let worldX = (x - xOff) / zoom;
    let worldY = (y - yOff) / zoom;
    return createVector(worldX, worldY);
}
*/

//grab outline points; works whether textToPoints is global (p5 2.0) or a font method (fallback)
function getTextPoints(str, x, y, fontSize, options, font){
    if(typeof textToPoints === 'function') return textToPoints(str, x, y, options)
    return font.textToPoints(str, x, y, fontSize, options)
}

function createGlitchyText(str, x, y, font, opts = {}){
    //draws curvy "energy" strokes that fly off the left/right silhouette of the text toward the
    //screen edges, fading from transparent (at the edge) into bright (at the letter)
    const {
        fontSize = 200,
        col = [255, 255, 255],
        spacing = 1,
        sampleFactor = 0.5,
        drawText = true,
        justFirstAndLastLetters = false, //only emit strands from the outer edges (first + last char)
        energy = {}
    } = opts

    const e = {
        chance: 0.08, minLen: 8, reach: null,
        grad1From: [255, 255, 255, 0], grad1To: [255, 255, 255, 255], grad1Speed: [3, 5],
        grad2From: [255, 255, 255, 255], grad2To: [0, 0, 0, 0], grad2Speed: [0.4, 0.8],
        startDist: [0, 0],
        curveAmp: 0.18, curveAmpRand: 0.6, curvePower: 1.8,
        waves: 1.4, wavesRand: 0.5, endDrift: 0.25,
        weight: 1, weightRand: 0.4, segments: 28,
        ...energy
    }

    //textToPoints reads the font/size/alignment off the main canvas
    textFont(font)
    textSize(fontSize)
    textAlign(CENTER, CENTER)

    //sample the silhouette from a rasterised copy of the text (font-agnostic + always dense):
    //draw the word into a tight buffer, then read the leftmost/rightmost lit pixel of each row.
    //(textToPoints' point density is wildly font-dependent - OTF fonts can yield almost nothing.)
    const asc = textAscent(), desc = textDescent()
    const pad = Math.ceil(fontSize * 0.5)                       //room for curves/overshoot
    const bw = Math.max(1, Math.ceil(textWidth(str)) + pad * 2)
    const bh = Math.max(1, Math.ceil(asc + desc) + pad * 2)
    const ref = createGraphics(bw, bh)
    ref.pixelDensity(1)
    ref.textFont(font); ref.textSize(fontSize); ref.textAlign(CENTER, CENTER)
    ref.noStroke(); ref.fill(255)
    ref.text(str, bw / 2, bh / 2)                               //buffer centre maps to (x, y) on the main canvas
    ref.loadPixels()

    //bin by row; keep the leftmost and rightmost lit pixel of each row = the silhouette
    const leftPt = new Map()
    const rightPt = new Map()
    let minX = Infinity, maxX = -Infinity
    const ox = x - bw / 2, oy = y - bh / 2                      //buffer -> canvas offset
    const step = Math.max(1, Math.round(spacing))
    for(let by = 0; by < bh; by += step){
        let lx = -1, rx = -1
        for(let bx = 0; bx < bw; bx++){
            if(ref.pixels[(by * bw + bx) * 4 + 3] > 10){        //lit pixel (alpha)
                if(lx < 0) lx = bx
                rx = bx
            }
        }
        if(lx < 0) continue                                     //empty row
        const cy = oy + by
        leftPt.set(by,  {x: ox + lx, y: cy})
        rightPt.set(by, {x: ox + rx, y: cy})
        if(ox + lx < minX) minX = ox + lx
        if(ox + rx > maxX) maxX = ox + rx
    }
    ref.remove()                                                //free the buffer (this runs every frame)

    //optionally restrict to the outer edges: only keep left points within one glyph-width of the
    //string's left edge (= the first char) and right points within one glyph-width of the right edge
    //(= the last char). this stops a tall middle letter from sprouting strands in the centre.
    let leftBand = Infinity, rightBand = -Infinity
    if(justFirstAndLastLetters && str.length > 0){
        leftBand  = minX + textWidth(str[0])
        rightBand = maxX - textWidth(str[str.length - 1])
    }

    //everything goes into a buffer so the random curves stay fixed until the next rebuild
    const g = createGraphics(width, height)
    g.noFill()

    //keep silhouette points whose strand is long enough (so the count we pick is the count we draw),
    //and, if requested, only those within the first/last char bands
    const leftArr  = [...leftPt.values()].filter(p => p.x >= e.minLen && p.x <= leftBand)
    const rightArr = [...rightPt.values()].filter(p => width - p.x >= e.minLen && p.x >= rightBand)

    //both sides emit the SAME number of strands
    const count = Math.round(e.chance * Math.min(leftArr.length, rightArr.length))


    //strand target x: a fixed `reach` px outward when set, otherwise all the way to the canvas edge.
    //(reach lets strands have a consistent length even when the text nearly fills the canvas; the
    //tail just runs off-canvas and fades out there.)
    //left silhouette -> curve out to the left
    for(const p of sampleN(leftArr, count))  drawEnergyCurve(g, p.x, p.y, e.reach ? p.x - e.reach : 0, e)
    //right silhouette -> curve out to the right
    for(const p of sampleN(rightArr, count)) drawEnergyCurve(g, p.x, p.y, e.reach ? p.x + e.reach : width, e)

    //the actual letters on top
    if(drawText){
        g.noStroke()
        g.fill(col[0], col[1], col[2])
        g.textFont(font)
        g.textSize(fontSize)
        g.textAlign(CENTER, CENTER)
        g.text(str, x, y)
    }

    return g
}

//one curvy energy stroke from the silhouette point (sx,sy) out to the screen edge at ex.
//curveness grows with distance from the letter (the "origin") and with the strand's length.
//colour+alpha runs through two gradients laid end-to-end (see grad1*/grad2* options); the
//crossover point between them is set by the two per-strand speeds.
function drawEnergyCurve(g, sx, sy, ex, e){
    const len = Math.abs(ex - sx)
    if(len < e.minLen) return

    //per-strand randomness, fixed for the life of this stroke
    const amp = len * e.curveAmp * (1 + random(-e.curveAmpRand, e.curveAmpRand))
    const drift = len * e.endDrift * random(-1, 1)
    const waves = e.waves * (1 + random(-e.wavesRand, e.wavesRand))
    const phase = random(TWO_PI)

    //per-strand gradient speeds -> how much of the strand each gradient eats up.
    //higher speed = completes faster = shorter portion. crossover splits the two.
    const s1 = random(e.grad1Speed[0], e.grad1Speed[1])
    const s2 = random(e.grad2Speed[0], e.grad2Speed[1])
    const cross = (1 / s1) / (1 / s1 + 1 / s2)

    const g1a = color(e.grad1From[0], e.grad1From[1], e.grad1From[2], e.grad1From[3])
    const g1b = color(e.grad1To[0],   e.grad1To[1],   e.grad1To[2],   e.grad1To[3])
    const g2a = color(e.grad2From[0], e.grad2From[1], e.grad2From[2], e.grad2From[3])
    const g2b = color(e.grad2To[0],   e.grad2To[1],   e.grad2To[2],   e.grad2To[3])

    g.strokeWeight(e.weight * (1 + random(-e.weightRand, e.weightRand)))

    //per-strand: skip this many segments at the origin so the strand starts away from the letter
    const startSeg = constrain(Math.round(random(e.startDist[0], e.startDist[1])), 0, e.segments - 1)

    //point on the (absolute) curve path at parameter t -> geometry is unchanged by startDist
    const px_ = t => lerp(sx, ex, t)
    const py_ = t => sy + drift * t + Math.sin(t * PI * waves + phase) * amp * Math.pow(t, e.curvePower)

    let px = px_(startSeg / e.segments), py = py_(startSeg / e.segments)
    for(let s = startSeg + 1; s <= e.segments; s++){
        const t = s / e.segments               //0 at the letter -> 1 at the edge (curve geometry)
        const x = px_(t), y = py_(t)

        //gradient runs over the VISIBLE part of the strand, so it still fades in cleanly at the start
        const tc = (s - startSeg) / (e.segments - startSeg)
        let c
        if(tc <= cross) c = lerpColor(g1a, g1b, cross > 0 ? tc / cross : 1)
        else            c = lerpColor(g2a, g2b, cross < 1 ? (tc - cross) / (1 - cross) : 1)
        g.stroke(c)
        g.line(px, py, x, y)
        px = x; py = y
    }
}

//return n random distinct elements of arr (partial Fisher-Yates shuffle)
function sampleN(arr, n){
    const a = arr.slice()
    for(let i = a.length - 1; i > 0; i--){
        const j = Math.floor(random() * (i + 1))
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp
    }
    return a.slice(0, Math.min(n, a.length))
}

//base colour with each channel randomly nudged by +/- variance, clamped to 0..255
function randCol(col, variance, mono, withNoise = false, noiseVal = 0){
    if(mono){
        let ran = withNoise ? noise(noiseVal) : random(-variance, variance)
        const r = constrain(col[0] + ran, 0, 255)
        const gc = constrain(col[1] + ran, 0, 255)
        const b = constrain(col[2] + ran, 0, 255)
        return color(r, gc, b)
    }
    const r = constrain(col[0] + random(-variance, variance), 0, 255)
    const gc = constrain(col[1] + random(-variance, variance), 0, 255)
    const b = constrain(col[2] + random(-variance, variance), 0, 255)
    return color(r, gc, b)
}
