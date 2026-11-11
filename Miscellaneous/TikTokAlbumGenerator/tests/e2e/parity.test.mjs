// "Same result as before": two reviews are built in the PREVIOUS version of the app
// (extracted from git history), saved with its own JSON export, opened in the current
// version, and every page of both is compared pixel by pixel.
import test, { before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { APP, TESTS, serve, launch, openPage, appReady } from './helpers.mjs';

const LEGACY_COMMIT = 'dbf36d2';            // last commit of the single-file version
const OUT = path.join(TESTS, '.out');
const FUN = "Radiohead's seventh album arrived as a pay-what-you-want download and still sounds warm, intimate and strangely weightless. Its rhythms twitch while the guitars shimmer.";
const SCENARIOS = [
    {
        name: 'standard', twoColumns: false,
        album: { title: 'In Rainbows', artist: 'Radiohead', year: '2007', genre: 'Art Rock, Alternative Rock', funfact: FUN, imageUrl: '/_t/cover.png', albumGrade: 'EXCEPTIONAL +' },
        tracks: [
            { title: '15 Step', grade: 'EXCEPTIONAL' }, { title: 'Bodysnatchers', grade: 'STRONG', customText: '8.5' }, { title: 'Nude', grade: 'PEAK' },
            { title: 'Weird Fishes/Arpeggi', grade: 'GOAT', customTextLarge: 'The arpeggios in the last minute are the best thing the band ever recorded.' },
            { title: 'All I Need', grade: 'EXCEPTIONAL' }, { title: 'Faust Arp', grade: 'DECENT', interlude: true }, { title: 'Reckoner', grade: 'PEAK' },
            { title: 'House of Cards', grade: 'OKAY' }, { title: 'Jigsaw Falling Into Place', grade: 'EXCEPTIONAL' }, { title: 'Videotape', grade: 'FLOP', customText: '4' }
        ],
        bandInfo: 'Radiohead are an English rock band formed in Abingdon, Oxfordshire, in 1985. They are known for constantly reinventing their sound, moving from guitar-driven alternative rock to electronic and experimental textures.'
    },
    {
        name: 'two-columns', twoColumns: true,
        album: { title: 'The Extremely Long Album Title That Shrinks', artist: 'Some Very Long Band Name Here', year: '1999', genre: 'Progressive Metal, Death Metal', funfact: 'Short one.', imageUrl: '/_t/cover.png', albumGrade: 'GOAT' },
        tracks: Array.from({ length: 18 }, (_, i) => ({
            title: 'Track number ' + (i + 1) + (i % 5 === 0 ? ' with a very long name that needs truncation' : ''),
            grade: ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT', 'OKAY', 'FLOP', 'SHIT'][i % 8],
            interlude: i === 7, customText: i === 3 ? '8.5' : '', customTextLarge: i === 10 ? 'A note under a track in two column mode.' : ''
        })),
        bandInfo: 'Short info.'
    }
];

let legacyDir, legacySrv, appSrv, browser, available = true, skipReason = '';

before(async () => {
    try {
        legacyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arg-legacy-'));
        const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: APP, encoding: 'utf8' }).trim();
        const rel = path.relative(repoRoot, APP);
        const tar = execFileSync('git', ['archive', LEGACY_COMMIT, rel], { cwd: repoRoot, maxBuffer: 1 << 28 });
        execFileSync('tar', ['-x', '-C', legacyDir, '--strip-components=' + rel.split(path.sep).length], { input: tar });
        if (!fs.existsSync(path.join(legacyDir, 'sketch.js'))) throw new Error('legacy sketch.js missing');
    } catch (err) { available = false; skipReason = 'previous version not available from git (' + err.message.split('\n')[0] + ')'; return; }
    fs.mkdirSync(OUT, { recursive: true });
    legacySrv = await serve(legacyDir);
    appSrv = await serve(APP);
    browser = await launch();
});
after(async () => {
    await browser?.close(); legacySrv?.server.close(); appSrv?.server.close();
    if (legacyDir) fs.rmSync(legacyDir, { recursive: true, force: true });
});

// Build the review in the old app exactly like a user would have, export its JSON and grab every page.
async function renderLegacy(sc) {
    const { page, errors } = await openPage(browser, legacySrv.url + '/index.html');
    await page.waitForFunction(() => !!document.getElementById('mobile-tabbar'), { timeout: 60000 });
    const res = await page.evaluate(async sc => {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        noiseSeed(1234); glitchImageCache = {};
        applyProfile(getDefaultProfile());
        isUndoRedoAction = true;
        fillFormFromData({ ...sc.album, tracks: sc.tracks, ...serializeLayout() });
        isUndoRedoAction = false;
        tracksTwoColumns = sc.twoColumns;
        showGreenRectangle = false;
        generateFromForm(); await sleep(600);
        const shots = {};
        for (const pid of ['cover', 'page_1', 'ratings']) {
            switchToPage(pid); clearSelection();
            await renderPage(); await sleep(300);
            if (pid === 'page_1') {      // type the band info, which re-flows the texts below it
                const tb = customTextboxes.find(t => t.id === 'custom_1785251803030');
                tb.textInput.elt.value = sc.bandInfo;
                tb.textInput.elt.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(500);
            }
            clearSelection();
            await renderPage(); await renderPage();
            const d = pixelDensity(), h = currentExportHeight();
            const c = document.createElement('canvas'); c.width = 1080 * d; c.height = h * d;
            c.getContext('2d').drawImage(drawingContext.canvas, 0, 0, c.width, c.height, 0, 0, c.width, c.height);
            shots[pid] = c.toDataURL('image/png');
        }
        return { shots, json: { album: { ...collectAlbumData(collectTracksData()), ...serializeLayout(), currentProfileName } } };
    }, sc);
    await page.close();
    assert.deepStrictEqual(errors, [], 'old app ran cleanly');
    return res;
}

async function renderCurrent(json) {
    const { page, errors } = await openPage(browser, appSrv.url + '/index.html');
    await appReady(page);
    const shots = await page.evaluate(async json => {
        App.loadFile(json);
        App.doc.glitch.seed = 1234;
        App.doc.export.scale = 2; applyExportScale();
        const out = {};
        // the old app exported the "No Image" placeholder of empty image elements; keep it for the comparison
        for (const p of App.doc.pages) out[p.id] = (await Render.capture(p, { placeholders: true })).toDataURL('image/png');
        return out;
    }, json);
    await page.close();
    assert.deepStrictEqual(errors, [], 'current app ran cleanly');
    return shots;
}

const decode = dataUrl => PNG.sync.read(Buffer.from(dataUrl.split(',')[1], 'base64'));

for (const sc of SCENARIOS) {
    test('a "' + sc.name + '" review from the previous version renders identically', { timeout: 180000 }, async t => {
        if (!available) { t.skip(skipReason); return; }
        const legacy = await renderLegacy(sc);
        const current = await renderCurrent(legacy.json);
        for (const pid of ['cover', 'page_1', 'ratings']) {
            const a = decode(legacy.shots[pid]), b = decode(current[pid]);
            assert.deepStrictEqual([b.width, b.height], [a.width, a.height], pid + ' size');
            const diff = new PNG({ width: a.width, height: a.height });
            const differing = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.05 });
            let max = 0;
            for (let i = 0; i < a.data.length; i++) { const d = Math.abs(a.data[i] - b.data[i]); if (d > max) max = d; }
            if (differing > 0) {
                fs.writeFileSync(path.join(OUT, sc.name + '-' + pid + '-old.png'), PNG.sync.write(a));
                fs.writeFileSync(path.join(OUT, sc.name + '-' + pid + '-new.png'), PNG.sync.write(b));
                fs.writeFileSync(path.join(OUT, sc.name + '-' + pid + '-diff.png'), PNG.sync.write(diff));
            }
            console.log('    ' + sc.name + ' / ' + pid + ': ' + a.width + '×' + a.height + ', visibly different pixels: ' + differing + ', largest channel difference: ' + max + '/255');
            assert.strictEqual(differing, 0, pid + ': ' + differing + ' pixels differ (images written to tests/.out)');
            assert.ok(max <= 8, pid + ': largest channel difference ' + max);
        }
    });
}
