const test = require('node:test');
const assert = require('node:assert');
const M = require('../../js/core/model.js');
const legacyStandard = require('../fixtures/legacy-standard.json');
const legacyDefaultProfile = require('../fixtures/legacy-default-profile.json');

const byType = (doc, type) => doc.pages.find(p => p.type === type);

test('a new review has the Cover → Context → Ratings pages, each remembering its type', () => {
    const doc = M.createDoc(M.defaultProfile(), { number: 413, seed: 5 });
    assert.deepStrictEqual(doc.pages.map(p => [p.type, p.base, p.name, p.aspectRatio]),
        [['cover', 'cover', 'Cover', '3:4'], ['context', 'sheet', 'Context', '3:4'], ['ratings', 'sheet', 'Ratings', '3:4']]);
    assert.strictEqual(doc.currentPageId, doc.pages[0].id);
    assert.strictEqual(doc.album.number, '413');
    assert.strictEqual(doc.album.title, '');
    assert.strictEqual(doc.glitch.seed, 5);
    assert.strictEqual(doc.tracks.length, 1);
    assert.strictEqual(new Set(doc.pages.map(p => p.id)).size, 3);
});

test('the built-in default matches the previous default profile (except the intended changes)', () => {
    const old = M.migrateLegacyProfile(legacyDefaultProfile, 'Old default');
    const now = M.defaultProfile();
    const oldR = byType(old, 'ratings'), nowR = byType(now, 'ratings');
    for (const key of ['pos', 'align', 'sizeOff', 'leadOff', 'maxW', 'art', 'hero', 'title', 'backdrop', 'legend', 'gradeBar', 'aspectRatio'])
        assert.deepStrictEqual(nowR[key], oldR[key], 'ratings.' + key);
    for (const key of ['textSize', 'spacing', 'rectHeight', 'twoColumns', 'showNumbers'])
        assert.strictEqual(nowR.tracks[key], oldR.tracks[key], 'ratings.tracks.' + key);
    assert.deepStrictEqual({ ...nowR.show, note: false }, oldR.show);
    // intended change: the plain "Songs added…" textbox became the playlist-note block
    assert.strictEqual(oldR.texts.length, 1);
    assert.strictEqual(nowR.texts.length, 0);
    assert.strictEqual(nowR.note.mode, 'auto');
    assert.strictEqual(oldR.note.mode, 'off');

    const geometry = t => [t.x, t.y, t.fontSize, t.fontType, t.color, t.textAlign, t.leading, t.maxWidth, t.glitch];
    const oldX = byType(old, 'context'), nowX = byType(now, 'context');
    assert.deepStrictEqual(nowX.texts.map(geometry), oldX.texts.map(geometry));
    assert.deepStrictEqual(nowX.stack.gaps, oldX.stack.gaps);
    assert.deepStrictEqual(nowX.images.map(i => [i.x, i.y, i.w]), oldX.images.map(i => [i.x, i.y, i.w]));
    assert.strictEqual(nowX.texts.filter(t => t.field).length, 1, 'band info is the one field');

    const oldC = byType(old, 'cover'), nowC = byType(now, 'cover');
    assert.deepStrictEqual(nowC.texts.map(geometry), oldC.texts.map(geometry));
    assert.deepStrictEqual(nowC.pos.title, oldC.pos.title);
    // intended change: the artist used to be pushed off-canvas, now the block is simply off
    assert.strictEqual(oldC.pos.artist.x, 2597);
    assert.strictEqual(nowC.show.artist, false);
    assert.match(nowC.texts[0].text, /\$number\$/);

    assert.deepStrictEqual(now.colors.map, old.colors.map);
    for (const t of ['image', 'title']) for (const k of ['sides', 'type', 'amp', 'scale', 'symmetrical'])
        assert.deepStrictEqual(now.glitch[t][k], old.glitch[t][k], 'glitch.' + t + '.' + k);
    assert.strictEqual(now.glitch.image.color.mode, old.glitch.image.color.mode);
    assert.strictEqual(now.glitch.image.color.amount, old.glitch.image.color.amount);
    assert.strictEqual(now.export.format, old.export.format);
});

test('a review saved by the previous version opens unchanged', () => {
    const doc = M.migrate(legacyStandard);
    assert.strictEqual(doc.version, M.DOC_VERSION);
    assert.deepStrictEqual(doc.pages.map(p => [p.id, p.type, p.base]), [['cover', 'cover', 'cover'], ['page_1', 'context', 'sheet'], ['ratings', 'ratings', 'sheet']]);
    assert.strictEqual(doc.album.title, 'In Rainbows');
    assert.strictEqual(doc.album.albumGrade, 'EXCEPTIONAL +');
    assert.strictEqual(doc.tracks.length, 10);
    assert.deepStrictEqual([doc.tracks[5].interlude, doc.tracks[5].grade], [true, 'DECENT']);
    const r = byType(doc, 'ratings');
    assert.deepStrictEqual(r.pos.funfact, { x: -46, y: -28 });
    assert.deepStrictEqual(r.pos.tracks, { x: -29, y: -22 });
    assert.strictEqual(r.align.funfact, 'justify');
    assert.strictEqual(r.art.scale, 0.95);
    assert.strictEqual(r.tracks.textSize, 36);
    assert.ok(Object.values(r.show).filter(Boolean).length === 9 && r.show.note === false, 'all blocks on, no playlist bar (it has the old textbox)');
    assert.strictEqual(r.texts[0].id, 'songsAddedToGOATPlaylist');
    const c = byType(doc, 'context');
    assert.ok(Object.values(c.show).every(v => v === false), 'a general page has no built-in blocks');
    assert.strictEqual(c.texts.length, 9);
    assert.strictEqual(c.stack.ids.length, 9);
    assert.strictEqual(c.stack.gaps.length, 8);
    assert.strictEqual(c.stack.start, 5, 'chain starts at the first template-driven textbox');
    assert.strictEqual(doc.export.format, 'jpg');
    // idempotent
    assert.deepStrictEqual(M.migrate(JSON.parse(JSON.stringify(doc))), doc);
});

test('v1 files (before pages existed) are upgraded', () => {
    const doc = M.migrate({
        title: 'A', artist: 'B', tracks: [{ title: 'x', grade: 'INTERLUDE' }, { title: 'y', grade: 'PEAK' }],
        aspectRatio: '4:5', aspectRatioCover: '1:1',
        verticalOffsetsRatings: { title: 12 }, horizontalOffsetsCover: { title: -3 }, tracksVerticalOffset: 40,
        customTextboxes: [{ id: 'n', text: 'note', viewType: 'both', x: 1, y: 2 }], downloadImageOption: 'cover'
    });
    assert.deepStrictEqual(doc.pages.map(p => [p.id, p.aspectRatio]), [['cover', '1:1'], ['ratings', '4:5']]);
    assert.strictEqual(doc.pages[1].pos.title.y, 12);
    assert.strictEqual(doc.pages[1].pos.tracks.y, 40);
    assert.strictEqual(doc.pages[0].pos.title.x, -3);
    assert.deepStrictEqual([doc.pages[0].texts.length, doc.pages[1].texts.length], [1, 1], '"both" textboxes are split per page');
    assert.deepStrictEqual([doc.tracks[0].grade, doc.tracks[0].interlude], ['None', true]);
    assert.strictEqual(doc.export.scope, 'current');
    assert.throws(() => M.migrate(null));
});

test('pasted track lists', () => {
    const t = M.parseTracksText('15 Step 9\nBodysnatchers 8.5\n\nNude 10\nWeird Fishes 11\nFaust Arp\nVideotape 4,5\n1979\nHouse of Cards - 6\n');
    assert.deepStrictEqual(t.map(x => [x.title, x.grade, x.interlude, x.customText]), [
        ['15 Step', 'EXCEPTIONAL', false, ''],
        ['Bodysnatchers', 'STRONG', false, '8.5'],
        ['Nude', 'PEAK', false, ''],
        ['Weird Fishes', 'GOAT', false, ''],
        ['Faust Arp', 'None', true, ''],
        ['Videotape', 'FLOP', false, '4.5'],
        ['1979', 'None', true, ''],
        ['House of Cards', 'OKAY', false, '']
    ]);
    assert.deepStrictEqual(M.parseTracksText('1. Intro\n2. Song 9\n3. Outro 7').map(x => x.title), ['Intro', 'Song', 'Outro'], 'numbering is dropped when every line has it');
    assert.deepStrictEqual(M.parseTracksText('7 Rings 8\nSong 9').map(x => x.title), ['7 Rings', 'Song']);
    assert.deepStrictEqual(M.parseTracksText('  \n\n'), []);
    assert.deepStrictEqual([0, 1.9, 2, 4.9, 5, 7, 8, 9, 10, 10.5].map(M.gradeFromScore), ['SHIT', 'SHIT', 'FLOP', 'FLOP', 'OKAY', 'DECENT', 'STRONG', 'EXCEPTIONAL', 'PEAK', 'GOAT']);
});

test('playlist note: automatic count, hidden when there is nothing to announce', () => {
    const doc = M.createDoc();
    const page = byType(doc, 'ratings');
    const tr = (grade, interlude) => M.normalizeTrack({ title: 't', grade, interlude });
    assert.strictEqual(M.noteFor(page, [tr('STRONG'), tr('EXCEPTIONAL')]), null);
    assert.strictEqual(M.noteFor(page, [tr('GOAT', true)]), null, 'interludes do not count');
    assert.deepStrictEqual(M.noteFor(page, [tr('GOAT'), tr('PEAK'), tr('PEAK'), tr('OKAY')]), { text: 'Songs added to GOAT Playlist: 3 (link in bio)', count: 3 });
    page.note.mode = 'on';
    assert.strictEqual(M.noteFor(page, [tr('STRONG')]).count, 0);
    page.note.text = '{n} song{s} added';
    assert.strictEqual(M.noteFor(page, [tr('GOAT')]).text, '1 song added');
    assert.strictEqual(M.noteFor(page, [tr('GOAT'), tr('GOAT')]).text, '2 songs added');
    page.note.mode = 'off';
    assert.strictEqual(M.noteFor(page, [tr('GOAT')]), null);
    page.note.mode = 'auto'; page.show.note = false;
    assert.strictEqual(M.noteFor(page, [tr('GOAT')]), null);
});

test('tracks on any page: album list, own list, ranges with continuous numbering', () => {
    const doc = M.createDoc();
    doc.tracks = ['a', 'b', '', 'c', 'd', 'e'].map(title => M.normalizeTrack({ title }));
    const p1 = byType(doc, 'ratings'), p2 = M.createPage('tracks');
    doc.pages.push(p2);
    assert.deepStrictEqual(M.resolveTracks(doc, p1).list.map(t => t.title), ['a', 'b', 'c', 'd', 'e'], 'empty rows are skipped');
    p1.tracks.to = 3; p2.tracks.from = 4;
    assert.deepStrictEqual(M.resolveTracks(doc, p1).list.map(t => t.title), ['a', 'b', 'c']);
    const second = M.resolveTracks(doc, p2);
    assert.deepStrictEqual([second.list.map(t => t.title), second.offset, second.all.length], [['d', 'e'], 3, 5]);
    p2.tracks.source = 'own'; p2.tracks.from = 0;
    p2.tracks.list = [M.normalizeTrack({ title: 'bonus', grade: 'GOAT' })];
    assert.deepStrictEqual(M.resolveTracks(doc, p2).list.map(t => t.title), ['bonus']);
    assert.strictEqual(M.trackSource(doc, p2), p2.tracks.list);
    assert.strictEqual(M.trackSource(doc, p1), doc.tracks);
    assert.strictEqual(p2.show.tracks, true);
    assert.strictEqual(byType(doc, 'context').show.tracks, false);
});

test('legend shows every grade down to the worst one used', () => {
    const tr = grade => M.normalizeTrack({ title: 't', grade });
    assert.deepStrictEqual(M.legendFor([tr('GOAT')], 5), ['GOAT', 'PEAK', 'EXCEPTIONAL', 'STRONG', 'DECENT']);
    assert.strictEqual(M.legendFor([tr('SHIT')], 5).length, 8);
    assert.strictEqual(M.legendFor([], 2).length, 2);
});

test('auto-stack keeps gaps, only moves boxes below its start, survives deletions', () => {
    const page = M.createPage('blank');
    page.texts = [10, 100, 200, 400].map((y, i) => Object.assign(M.textDefaults(), { id: 't' + i, y, text: 'x' }));
    const h = { t0: 40, t1: 50, t2: 60, t3: 10 };
    M.captureStack(page, h);
    assert.deepStrictEqual(page.stack, { ids: ['t0', 't1', 't2', 't3'], gaps: [50, 50, 140], start: 0 });
    assert.strictEqual(M.reflowStack(page, h), false, 'nothing moves when heights are unchanged');
    M.reflowStack(page, { ...h, t1: 150 });
    assert.deepStrictEqual(page.texts.map(t => t.y), [10, 100, 300, 500]);

    page.stack.start = 2;                       // t0, t1 are anchors now
    page.texts[1].y = 100; page.texts[2].y = 300;
    M.reflowStack(page, { ...h, t0: 400, t2: 100 });
    assert.deepStrictEqual(page.texts.map(t => t.y), [10, 100, 300, 540]);
    M.stackTouch(page, 't1');
    assert.strictEqual(page.stack.start, 1);
    M.stackTouch(page, 't3');
    assert.strictEqual(page.stack.start, 1, 'touching a box below the start changes nothing');

    page.texts.splice(2, 1);                    // delete t2: t3 takes its slot, keeping t1's gap
    M.reflowStack(page, h);
    assert.deepStrictEqual([page.stack.ids, page.stack.gaps], [['t0', 't1', 't3'], [50, 50]]);
    assert.strictEqual(page.texts[2].y, 100 + 50 + 50);
    page.texts.splice(0, 2);
    M.reflowStack(page, h);
    assert.strictEqual(page.stack, null);
});

test('auto-align keeps the text column on the right edge of the art', () => {
    const page = byType(M.createDoc(), 'ratings');
    assert.strictEqual(M.autoAlignX(page), -43);
    page.art.scale = 1; page.pos.image.x = 10;
    M.applyAutoAlign(page);
    assert.deepStrictEqual(['artist', 'year', 'genre', 'funfact'].map(id => page.pos[id].x), [-10, -10, -10, -10]);
    page.header.autoAlign = false; page.art.scale = 2;
    assert.strictEqual(M.applyAutoAlign(page), false);
    assert.strictEqual(page.pos.artist.x, -10);
});

test('profiles: saving strips review content, applying keeps album + tracks', () => {
    const doc = M.createDoc();
    doc.album.title = 'Kid A';
    doc.tracks = [M.normalizeTrack({ title: 'Idioteque', grade: 'GOAT' })];
    const ctx = byType(doc, 'context');
    ctx.texts.find(t => t.field).text = 'Band text';
    ctx.images[0].url = 'https://example.com/a.jpg';
    ctx.texts[0].text = 'Custom heading';
    doc.colors.map.GOAT = '#123456';
    const profile = M.profileFromDoc(doc, 'Mine');
    const pctx = byType(profile, 'context');
    assert.strictEqual(pctx.texts.find(t => t.field).text, '');
    assert.strictEqual(pctx.images[0].url, '');
    assert.strictEqual(pctx.texts[0].text, 'Custom heading', 'layout texts are part of the profile');
    assert.strictEqual(profile.album, undefined);

    const other = M.createDoc();
    other.album.title = 'OK Computer';
    other.tracks = [M.normalizeTrack({ title: 'Airbag' })];
    M.applyProfile(other, profile);
    assert.strictEqual(other.album.title, 'OK Computer');
    assert.strictEqual(other.tracks[0].title, 'Airbag');
    assert.strictEqual(other.colors.map.GOAT, '#123456');
    assert.strictEqual(byType(other, 'context').texts[0].text, 'Custom heading');
    assert.strictEqual(other.profileName, 'Mine');
    assert.ok(!doc.pages.some(p => other.pages.some(q => q.id === p.id)), 'pages get fresh ids');
});

test('custom page types and unknown types', () => {
    const src = M.createPage('slide');
    src.texts[0].text = 'My heading';
    const types = { custom_1: { name: 'My slide', page: JSON.parse(JSON.stringify(src)) } };
    const made = M.createPage('custom_1', types);
    assert.strictEqual(made.texts[0].text, 'My heading');
    assert.notStrictEqual(made.id, src.id);
    assert.strictEqual(M.typeName('custom_1', types), 'My slide');
    assert.strictEqual(M.typeName('ratings'), 'Ratings');
    assert.strictEqual(M.createPage('nope').type, 'blank');
    for (const id of Object.keys(M.BUILTIN_TYPES)) {
        const p = M.createPage(id);
        assert.ok(M.ASPECT_RATIOS[p.aspectRatio] && p.id && p.name, id);
        assert.deepStrictEqual(Object.keys(p.show).sort(), M.BLOCKS[p.base].slice().sort(), id + ' has a flag for each block');
    }
});

test('normalising fills what is missing without touching what is there', () => {
    const doc = M.normalizeDoc({ album: { title: 'X', albumGrade: 'nonsense' }, pages: [{ base: 'sheet', aspectRatio: '7:9', tracks: { textSize: 30 }, texts: [{ text: 'hi' }] }], tracks: [{ title: 'a', grade: '??' }] });
    const p = doc.pages[0];
    assert.strictEqual(doc.album.albumGrade, 'STRONG');
    assert.strictEqual(p.aspectRatio, '9:16');
    assert.deepStrictEqual([p.tracks.textSize, p.tracks.rectHeight, p.tracks.showNumbers], [30, 40, true]);
    assert.deepStrictEqual([p.texts[0].text, p.texts[0].fontSize, p.texts[0].opacity, p.texts[0].bg.on], ['hi', 40, 1, false]);
    assert.strictEqual(doc.tracks[0].grade, 'STRONG');
    assert.strictEqual(doc.currentPageId, p.id);
    assert.deepStrictEqual(M.normalizeDoc(JSON.parse(JSON.stringify(doc))), doc);
});

test('glitch options: normalising never changes the look, random looks are valid', () => {
    const g = M.normalizeGlitch({ image: { sides: { left: true }, type: 'sine', edges: { sample: true } }, title: {} });
    assert.strictEqual(g.image.edges.mode, 'random', 'an in-use edge without a mode keeps behaving as "random"');
    assert.strictEqual(g.title.edges.mode, 'noise');
    assert.deepStrictEqual(g.image.warp, { mosaic: 0, shear: 0, echo: 0, haze: 0, band: 24 });
    assert.deepStrictEqual(g.image.colEffOr, M.EFFECT_ORDER);
    let seed = 1; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 50; i++) for (const target of ['image', 'title']) {
        const o = M.randomGlitchOpts(rand, target);
        assert.ok(['none', 'sine', 'noise', 'square', 'sawtooth'].includes(o.type));
        assert.ok(o.amp >= 0 && o.amp <= 300 && o.scale > 0 && o.scale <= 0.1 && o.color.amount >= 0 && o.color.amount <= 1);
        for (const m of o.color.mode.split('+')) assert.ok(m === 'none' || M.COLOR_MODES.includes(m), m);
    }
});

test('export helpers: file names, page selection, preflight', () => {
    const doc = M.createDoc();
    Object.assign(doc.album, { title: 'In/Rainbows?', artist: 'Radio:head', year: '2007', number: '12' });
    assert.strictEqual(M.fileName(doc.export.filename, doc, doc.pages[2], 2), 'Radiohead - InRainbows - Ratings');
    assert.strictEqual(M.fileName('{number} {index} {year} {page}', doc, doc.pages[0], 0), '12 1 2007 Cover');
    assert.strictEqual(M.fileName('', M.createDoc(), null), '- -');
    assert.strictEqual(M.baseFileName(doc), 'Radiohead - InRainbows');
    doc.pages[1].export = false;
    assert.deepStrictEqual(M.pagesToExport(doc, 'all').map(p => p.type), ['cover', 'ratings']);
    doc.currentPageId = doc.pages[1].id;
    assert.deepStrictEqual(M.pagesToExport(doc, 'current').map(p => p.type), ['context'], 'the current page can always be exported');

    const fresh = M.createDoc();
    const w = M.preflight(fresh, () => false);
    for (const expected of ['No album image', 'Album title is empty', 'Artist is empty', 'Review number is empty', '"Band info" is empty on Context', 'No tracks on Ratings'])
        assert.ok(w.includes(expected), expected + ' ← ' + w.join(' | '));
    Object.assign(fresh.album, { title: 'a', artist: 'b', number: '1', imageUrl: 'x', genre: 'Art Rock, Zzz' });
    fresh.tracks = [M.normalizeTrack({ title: 't' })];
    byType(fresh, 'context').texts.find(t => t.field).text = 'info';
    assert.deepStrictEqual(M.preflight(fresh, g => g === 'Art Rock'), ['No description for genre "Zzz"']);
});
