// End-to-end: the review workflow, driven through the real UI in headless Chrome.
import test, { before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { APP, TESTS, serve, launch, openPage, appReady } from './helpers.mjs';

let srv, browser, page, errors;
const TRACKS = '15 Step 9\nBodysnatchers 8.5\nNude 10\nWeird Fishes/Arpeggi 11\nAll I Need 9\nFaust Arp\nReckoner 10\nHouse of Cards 6\nJigsaw Falling Into Place 9\nVideotape 4';

before(async () => {
    srv = await serve(APP);
    browser = await launch();
    ({ page, errors } = await openPage(browser, srv.url + '/index.html'));
    await appReady(page);
    // downloads are captured instead of written to disk
    await page.evaluate(() => {
        window.__downloads = [];
        UI.download = (blob, name) => { window.__downloads.push({ blob, name, type: blob.type, size: blob.size }); };
    });
});
after(async () => { await browser?.close(); srv?.server.close(); });

const settle = () => page.evaluate(async () => { await new Promise(r => setTimeout(r, 350)); await Render.now(); });
const clickTab = name => page.evaluate(n => { [...document.querySelectorAll('.page-tab')].find(t => t.textContent.trim() === n).click(); }, name);
const designTab = name => page.evaluate(n => { [...document.querySelectorAll('#col-design .tab')].find(t => t.title === n).click(); }, name);
async function typeInto(selector, text) {
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type(selector, text, { delay: 0 });
}
const field = label => page.evaluate(l => {
    const f = [...document.querySelectorAll('#col-content .field')].find(x => x.querySelector('.field-label').firstChild.textContent.trim().toLowerCase() === l.toLowerCase());
    const input = f.querySelector('input.input, textarea.input, select.input');
    input.setAttribute('data-test', l);
    return '[data-test="' + l + '"]';
}, label);

test('1–2 · "New review" replaces clear-all + apply-default-profile', async () => {
    await page.click('#new-review-btn');
    const s = await page.evaluate(() => ({ pages: App.doc.pages.map(p => p.type + ':' + p.name), current: App.page().type, title: App.doc.album.title, tracks: App.doc.tracks.length, tabs: [...document.querySelectorAll('.page-tab-label')].map(e => e.textContent) }));
    assert.deepStrictEqual(s.pages, ['cover:Cover', 'context:Context', 'ratings:Ratings']);
    assert.deepStrictEqual(s.tabs, ['Cover', 'Context', 'Ratings']);
    assert.strictEqual(s.current, 'cover');
    assert.strictEqual(s.title, '');
});

test('3–4 · cover page: metadata, genre suggestions, review number in the artwork', async () => {
    await typeInto(await field('Review #'), '412');
    await typeInto(await field('Title'), 'In Rainbows');
    await typeInto(await field('Artist'), 'Radiohead');
    await typeInto(await field('Year'), '2007');
    const genre = await field('Genre');
    await typeInto(genre, 'art ro');
    await page.keyboard.press('Tab');                      // accepts the first suggestion
    assert.strictEqual(await page.$eval(genre, e => e.value), 'Art Rock');
    await page.focus(genre);
    await page.keyboard.type(', alternative r');
    await page.keyboard.press('Enter');
    assert.strictEqual(await page.$eval(genre, e => e.value), 'Art Rock, Alternative Rock');
    await typeInto(await field('Cover image'), '/_t/cover.png');
    await settle();
    const s = await page.evaluate(() => ({ album: App.doc.album, hasImage: App.lastRC.hasImage, boxes: App.boxes.map(b => b.id), review: getRichText(App.page().texts[0].text), glitchSlots: Object.keys(Glitch.slots).length }));
    assert.deepStrictEqual([s.album.number, s.album.title, s.album.artist, s.album.year, s.album.genre], ['412', 'In Rainbows', 'Radiohead', '2007', 'Art Rock, Alternative Rock']);
    assert.ok(s.hasImage, 'album image loaded');
    assert.strictEqual(s.review, 'Album Review #412');
    assert.ok(s.boxes.includes('title') && s.boxes.includes('image'));
    assert.ok(s.glitchSlots >= 2, 'cover art + title were glitched');
});

test('5–6 · context page: band info pushes the genre texts down, descriptions come from the genres', async () => {
    await clickTab('Context');
    await settle();
    const before = await page.evaluate(() => App.page().texts.map(t => t.y));
    await typeInto('#col-content .page-field textarea', 'Radiohead are an English rock band formed in Abingdon, Oxfordshire, in 1985. They are known for constantly reinventing their sound, moving from guitar-driven alternative rock to electronic and experimental textures.');
    await settle();
    const s = await page.evaluate(() => ({ ys: App.page().texts.map(t => t.y), texts: App.page().texts.map(t => String(getRichText(t.text))), warn: document.querySelector('.field-hint.warn')?.textContent || '' }));
    assert.deepStrictEqual(s.ys.slice(0, 4), before.slice(0, 4), 'headings and the band info itself stay put');
    for (let i = 4; i < 9; i++) assert.ok(s.ys[i] > before[i] + 30, 'box ' + i + ' moved down');
    assert.strictEqual(s.texts[5], 'Art Rock');
    assert.match(s.texts[6], /^Attempts to expand the bounds of Rock/);
    assert.strictEqual(s.texts[7], 'Alternative Rock');
    assert.match(s.texts[8], /^Termed as an alternative/);
    assert.strictEqual(s.warn, '');
});

test('7–8 · ratings page: description, grade and a pasted track list', async () => {
    await clickTab('Ratings');
    await typeInto(await field('Description'), 'Warm, intimate and strangely weightless.');
    await page.select(await field('Album grade'), 'EXCEPTIONAL +');
    // the clipboard is not readable in headless Chrome → the paste dialog opens instead
    await page.evaluate(() => [...document.querySelectorAll('#col-tracks .btn')].find(b => b.textContent.includes('Paste list')).click());
    await page.waitForSelector('.dialog textarea');
    await page.$eval('.dialog textarea', (el, v) => { el.value = v; }, TRACKS);
    await page.click('.dialog .btn-accent');
    await settle();
    const s = await page.evaluate(() => ({
        tracks: App.doc.tracks.map(t => [t.title, t.grade, t.interlude, t.customText]), rows: document.querySelectorAll('.track-row').length,
        boxes: App.boxes.map(b => b.id), grade: App.doc.album.albumGrade, funfact: App.doc.album.funfact
    }));
    assert.strictEqual(s.rows, 10);
    assert.deepStrictEqual(s.tracks[1], ['Bodysnatchers', 'STRONG', false, '8.5']);
    assert.deepStrictEqual(s.tracks[3], ['Weird Fishes/Arpeggi', 'GOAT', false, '']);
    assert.deepStrictEqual(s.tracks[5], ['Faust Arp', 'None', true, '']);
    assert.strictEqual(s.grade, 'EXCEPTIONAL +');
    for (const id of ['image', 'title', 'artist', 'year', 'genre', 'funfact', 'tracks']) assert.ok(s.boxes.includes(id), id + ' is on the page');
});

test('9 · the playlist note counts GOAT / 10 songs by itself and disappears when there are none', async () => {
    const status = () => page.$eval('.note-status', e => e.textContent.trim());
    assert.match(await status(), /Songs added to GOAT Playlist: 3 \(link in bio\)/);
    const info = () => page.evaluate(() => Model.noteFor(App.page(), Model.resolveTracks(App.doc, App.page()).all));
    assert.strictEqual((await info()).count, 3);
    // downgrade the three songs through the UI (a real click would end the previous undo step)
    await page.evaluate(() => History.flush());
    for (const i of [2, 3, 6]) await page.evaluate(i => { const s = document.querySelectorAll('.track-row')[i].querySelector('.track-grade'); s.value = 'STRONG'; s.dispatchEvent(new Event('change', { bubbles: true })); }, i);
    assert.strictEqual(await info(), null);
    assert.match(await status(), /Hidden/);
    // quick successive edits are one undo step
    await page.keyboard.down('Meta'); await page.keyboard.press('z'); await page.keyboard.up('Meta');
    assert.strictEqual((await info()).count, 3, 'undo brings the grades back');
    assert.strictEqual(await page.evaluate(() => App.doc.tracks.length), 10);
    assert.match(await status(), /: 3 /);
});

test('10 · glitch tab: presets, random look, live sliders render a draft first and settle at full quality', async () => {
    await clickTab('Cover');
    await settle();
    await designTab('Glitch');
    const pid = await page.evaluate(() => App.page().id);
    const key = () => page.evaluate(id => Glitch.slots[id + ':hero'].key, pid);
    const k0 = await key();
    await page.evaluate(() => [...document.querySelectorAll('.preset-row .chip')].find(c => c.textContent === 'VHS').click());
    await settle();
    assert.notStrictEqual(await key(), k0);
    assert.strictEqual(await page.evaluate(() => App.doc.glitch.image.color.mode), 'chromatic+scanlines+bands');

    // drag a slider: draft quality while moving…
    const timing = await page.evaluate(async id => {
        const slider = [...document.querySelectorAll('#col-design .row')].find(r => r.textContent.includes('Amplitude')).querySelector('input');
        const out = { draft: [], quality: [] };
        for (const v of [60, 90, 120, 150]) {
            slider.value = v; slider.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            await Render.now();
            out.draft.push(Math.round(Glitch.lastMs)); out.quality.push(Glitch.slots[id + ':hero'].quality);
        }
        await new Promise(r => setTimeout(r, 500)); await Render.now();
        out.final = Glitch.slots[id + ':hero'].quality; out.fullMs = Math.round(Glitch.lastMs); out.amp = App.doc.glitch.image.amp;
        return out;
    }, pid);
    console.log('    glitch pass while dragging (draft):', timing.draft.join(', '), 'ms · settled full quality:', timing.fullMs, 'ms');
    assert.ok(timing.quality.every(q => q === 'draft'), 'drafts while dragging');
    assert.strictEqual(timing.final, 'full', 'full quality once the slider rests');
    assert.strictEqual(timing.amp, 150);

    await page.evaluate(() => [...document.querySelectorAll('.glitch-top .btn')].find(b => b.textContent.includes('Random')).click());
    await settle();
    const seed = await page.evaluate(() => App.doc.glitch.seed);
    assert.ok(seed >= 1);
    await page.evaluate(() => [...document.querySelectorAll('.preset-row .chip')].find(c => c.textContent === 'Default').click());
    await settle();
    assert.strictEqual(await page.evaluate(() => App.doc.glitch.image.type), 'sine');
});

test('11 · export: one image per page, named and sized as before, nothing from the editor baked in', async () => {
    // select something first: selection outlines must not end up in the files
    await clickTab('Ratings');
    await settle();
    await page.evaluate(() => Actions.select(['title']));
    assert.ok(await page.$('.sel-box'), 'selection is shown as a DOM overlay');
    await page.evaluate(() => { window.__downloads.length = 0; });
    await page.click('#export-btn');
    await page.waitForFunction(() => window.__downloads.length === 3 && !Exporter.busy, { timeout: 30000 });
    const files = await page.evaluate(async () => Promise.all(window.__downloads.map(async d => { const bmp = await createImageBitmap(d.blob); return { name: d.name, type: d.type, w: bmp.width, h: bmp.height, size: d.size }; })));
    assert.deepStrictEqual(files.map(f => f.name), ['Radiohead - In Rainbows - Cover.jpg', 'Radiohead - In Rainbows - Context.jpg', 'Radiohead - In Rainbows - Ratings.jpg']);
    for (const f of files) { assert.strictEqual(f.type, 'image/jpeg'); assert.deepStrictEqual([f.w, f.h], [2160, 2880]); assert.ok(f.size > 50000); }
    assert.strictEqual(await page.evaluate(() => App.page().type), 'ratings', 'still on the page being edited');
    assert.strictEqual(await page.evaluate(() => App.prefs.lastNumber), 412);

    // PNG of only the current page at 1080 px
    await page.evaluate(() => { window.__downloads.length = 0; App.doc.export.format = 'png'; App.doc.export.scale = 1; applyExportScale(); });
    await page.evaluate(() => Exporter.images('current'));
    const one = await page.evaluate(async () => { const d = window.__downloads[0]; const bmp = await createImageBitmap(d.blob); return { n: window.__downloads.length, name: d.name, w: bmp.width, h: bmp.height }; });
    assert.deepStrictEqual(one, { n: 1, name: 'Radiohead - In Rainbows - Ratings.png', w: 1080, h: 1440 });
    await page.evaluate(() => { App.doc.export.format = 'jpg'; App.doc.export.scale = 2; applyExportScale(); App.changed(); });
});

test('canvas: click to select, drag and arrow keys move, Esc deselects, undo restores', async () => {
    await settle();
    const pos = async id => page.evaluate(id => ({ ...App.page().pos[id] }), id);
    const at = await page.evaluate(() => {
        const b = App.boxes.find(b => b.id === 'funfact'), r = document.getElementById('canvas-scaler').getBoundingClientRect();
        return { x: r.left + (b.x + b.w / 2) * Stage.scale, y: r.top + (b.y + b.h / 2) * Stage.scale, scale: Stage.scale };
    });
    const start = await pos('funfact');
    await page.mouse.click(at.x, at.y);
    assert.deepStrictEqual(await page.evaluate(() => App.selection), ['funfact']);
    assert.ok(await page.$('#selection-bar.open'));
    await page.keyboard.press('ArrowRight'); await page.keyboard.down('Shift'); await page.keyboard.press('ArrowDown'); await page.keyboard.up('Shift');
    assert.deepStrictEqual(await pos('funfact'), { x: start.x + 1, y: start.y + 10 });
    await page.mouse.move(at.x, at.y); await page.mouse.down(); await page.mouse.move(at.x + 40, at.y + 20, { steps: 4 }); await page.mouse.up();
    const moved = await pos('funfact');
    assert.ok(Math.abs(moved.x - (start.x + 1 + 40 / at.scale)) <= 2 && Math.abs(moved.y - (start.y + 10 + 20 / at.scale)) <= 2, JSON.stringify(moved));
    await page.keyboard.press('Escape');
    assert.deepStrictEqual(await page.evaluate(() => App.selection), []);
    assert.strictEqual(await page.$('#selection-bar.open'), null);
    await page.evaluate(() => { History.flush(); while (History.canUndo() && (App.page().pos.funfact.x !== -46 || App.page().pos.funfact.y !== -28)) History.go(-1); });
    assert.deepStrictEqual(await pos('funfact'), start);
});

test('tracks on another page: its own list, or a slice of the album list', async () => {
    const r = await page.evaluate(async () => {
        const p = Actions.addPage('tracks');
        p.tracks.from = 8;
        await Render.now();
        const slice = App.lastRC.tracks.map(t => t.title), offset = App.lastRC.trackOffset;
        p.tracks.from = 0; p.tracks.source = 'own'; p.tracks.list = [Model.normalizeTrack({ title: 'Bonus track', grade: 'PEAK' })];
        App.changed({ what: 'tracks-structure' });
        await Render.now();
        const own = App.lastRC.tracks.map(t => t.title), editorRows = [...document.querySelectorAll('.track-title')].map(i => i.value), banner = !!document.querySelector('#col-tracks .banner');
        const albumUntouched = App.doc.tracks.length;
        Actions.deletePage(p.id);
        return { slice, offset, own, editorRows, banner, albumUntouched, pages: App.doc.pages.length };
    });
    assert.deepStrictEqual(r.slice, ['House of Cards', 'Jigsaw Falling Into Place', 'Videotape']);
    assert.strictEqual(r.offset, 7, 'numbering continues: 8., 9., 10.');
    assert.deepStrictEqual(r.own, ['Bonus track']);
    assert.deepStrictEqual(r.editorRows, ['Bonus track'], 'the tracks column edits the page\'s own list');
    assert.ok(r.banner);
    assert.strictEqual(r.albumUntouched, 10);
    assert.strictEqual(r.pages, 3);
});

test('autosave: a reload brings everything back; the next "New review" continues the numbering', async () => {
    await page.evaluate(() => { History.flush(); App.saveNow(); });
    await page.reload({ waitUntil: 'networkidle2' });
    await appReady(page);
    const s = await page.evaluate(() => ({ title: App.doc.album.title, tracks: App.doc.tracks.length, band: App.doc.pages[1].texts.find(t => t.field).text.slice(0, 9), page: App.page().type }));
    assert.deepStrictEqual(s, { title: 'In Rainbows', tracks: 10, band: 'Radiohead', page: 'ratings' });
    await page.click('#new-review-btn');
    const n = await page.evaluate(() => ({ number: App.doc.album.number, title: App.doc.album.title, tracks: App.doc.tracks.length, band: App.doc.pages[1].texts.find(t => t.field).text, page: App.page().type, toast: document.querySelector('.toast-action')?.textContent }));
    assert.deepStrictEqual(n, { number: '413', title: '', tracks: 1, band: '', page: 'cover', toast: 'Undo' });
    await page.click('.toast-action');
    assert.strictEqual(await page.evaluate(() => App.doc.album.title), 'In Rainbows', 'New review can be undone');
});

test('profiles and page types: save, new review from it, custom type in the + menu', async () => {
    const r = await page.evaluate(async () => {
        App.page().tracks.twoColumns = true;
        App.doc.pages[0].export = false;
        App.profiles['Two columns'] = Model.profileFromDoc(App.doc, 'Two columns');
        App.saveProfiles(); App.emit('profiles');
        const options = [...document.querySelector('.profile-select').options].map(o => o.value);
        App.newReview('Two columns');
        const two = App.doc.pages.find(p => p.type === 'ratings').tracks.twoColumns, excluded = App.doc.pages[0].export === false, blank = App.doc.album.title === '';
        App.newReview('Default');
        const def = App.doc.pages.find(p => p.type === 'ratings').tracks.twoColumns;
        // custom page type
        const slide = Actions.addPage('slide');
        slide.texts[0].text = 'Top 5';
        App.types.custom_t = { name: 'Top list', page: Model.clone(slide) };
        const again = Actions.addPage('custom_t');
        return { options, two, excluded, blank, def, typeText: again.texts[0].text, typeName: Model.typeName(again.type, App.types), names: App.doc.pages.map(p => p.name) };
    });
    assert.deepStrictEqual(r.options, ['Default', 'Two columns']);
    assert.deepStrictEqual([r.two, r.excluded, r.blank, r.def], [true, true, true, false]);
    assert.strictEqual(r.typeText, 'Top 5');
    assert.deepStrictEqual(r.names.slice(3), ['Slide', 'Slide 2']);
});

test('no errors were logged during the whole session', () => {
    assert.deepStrictEqual(errors, []);
});

test('data saved by the previous version is picked up on first run', async () => {
    const legacyDoc = JSON.parse(fs.readFileSync(path.join(TESTS, 'fixtures', 'legacy-standard.json'), 'utf8')).album;
    const legacyProfile = JSON.parse(fs.readFileSync(path.join(TESTS, 'fixtures', 'legacy-default-profile.json'), 'utf8'));
    const ctx = await browser.createBrowserContext();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.evaluateOnNewDocument((doc, profile) => {
        if (localStorage.getItem('arg3.doc')) return;
        localStorage.setItem('albumGeneratorData', JSON.stringify(doc));
        localStorage.setItem('albumGeneratorProfiles', JSON.stringify({ 'My old profile': profile }));
        localStorage.setItem('albumGeneratorLastProfile', 'My old profile');
        localStorage.setItem('albumGeneratorColors', JSON.stringify({ GOAT: '#111111' }));
    }, legacyDoc, legacyProfile);
    await p.goto(srv.url + '/index.html', { waitUntil: 'networkidle2' });
    await appReady(p);
    const s = await p.evaluate(() => ({ title: App.doc.album.title, pages: App.doc.pages.map(x => x.name), goat: App.doc.colors.map.GOAT, profiles: App.profileNames(), selected: document.querySelector('.profile-select').value, legacyKept: !!localStorage.getItem('albumGeneratorData'), old: App.getProfile('My old profile').pages.map(x => x.type) }));
    assert.deepStrictEqual(s, { title: 'In Rainbows', pages: ['Cover', 'Context', 'Ratings'], goat: '#111111', profiles: ['Default', 'My old profile'], selected: 'My old profile', legacyKept: true, old: ['cover', 'context', 'ratings'] });
    assert.deepStrictEqual(errs, []);
    await ctx.close();
});

test('phone layout still works: one section at a time from the bottom tab bar', async () => {
    const ctx = await browser.createBrowserContext();
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto(srv.url + '/index.html', { waitUntil: 'networkidle2' });
    await appReady(p);
    const visible = () => p.evaluate(() => ({
        tab: document.body.dataset.mtab, bar: getComputedStyle(document.getElementById('mobile-tabbar')).display,
        shown: ['preview', 'col-content', 'col-tracks', 'col-design'].filter(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width > 0 && r.height > 0; }),
        canvasW: document.getElementById('canvas-container').getBoundingClientRect().width, overflowX: document.documentElement.scrollWidth > innerWidth
    }));
    let v = await visible();
    assert.deepStrictEqual([v.tab, v.bar, v.shown], ['preview', 'flex', ['preview']]);
    assert.ok(v.canvasW > 150 && v.canvasW <= 390 && !v.overflowX);
    for (const [i, id] of [[1, 'col-content'], [2, 'col-tracks'], [3, 'col-design']]) {
        await p.evaluate(i => document.querySelectorAll('.mtab-btn')[i].click(), i);
        v = await visible();
        assert.deepStrictEqual(v.shown, [id]);
        assert.ok(!v.overflowX, id + ' does not overflow sideways');
    }
    assert.deepStrictEqual(errs, []);
    await ctx.close();
});
