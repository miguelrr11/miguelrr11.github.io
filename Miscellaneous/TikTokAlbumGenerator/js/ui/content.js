// Content column: album metadata (shared by every page) and the current page's
// own content — its "field" elements up front, every other element in a list.
'use strict';

const Content = {
    el: null, album: {}, rows: {},

    init() {
        this.el = document.getElementById('col-content');
        App.on(what => {
            if (what === 'doc' || what === 'page') this.build();
            else if (what === 'elements') this.buildPage();
            else if (what === 'selection') this.syncSelection();
            else if (what === 'album' || what === 'change') this.syncAlbum();
        });
        this.build();
    },

    build() {
        UI.clear(this.el);
        this.buildAlbum();
        this.pageWrap = UI.h('div');
        this.el.appendChild(this.pageWrap);
        this.buildPage();
    },

    // ── album ──
    buildAlbum() {
        const a = () => App.doc.album;
        const set = (k, v) => { a()[k] = v; if (k === 'number') App.rememberNumber(); App.changed({ what: 'album' }); };
        const focusSel = id => () => { if (App.boxes.some(b => b.id === id)) Actions.select([id]); };
        const field = (label, control, cls) => UI.h('label.field', { class: cls || '' }, UI.h('span.field-label', label), control);

        const A = this.album = {};
        A.number = UI.text({ value: a().number, placeholder: '#', onInput: v => set('number', v.trim()) });
        A.number.input.inputMode = 'numeric';
        A.title = UI.text({ value: a().title, placeholder: 'Album title', onInput: v => set('title', v), onFocus: focusSel('title') });
        A.artist = UI.text({ value: a().artist, placeholder: 'Artist', onInput: v => set('artist', v), onFocus: focusSel('artist') });
        A.year = UI.text({ value: a().year, placeholder: 'e.g. 1997', onInput: v => set('year', v), onFocus: focusSel('year') });
        A.genre = UI.text({ value: a().genre, placeholder: 'Genre 1, Genre 2', onInput: v => { set('genre', v); this.suggestGenres(); this.genreHint(); }, onFocus: focusSel('genre') });
        A.genre.input.autocomplete = 'off';
        A.genre.input.addEventListener('blur', () => setTimeout(() => this.hideSuggest(), 150));
        A.genre.input.addEventListener('keydown', e => this.suggestKey(e));
        A.funfact = UI.text({ multiline: true, value: a().funfact, placeholder: 'Description or fun fact about the album…', onInput: v => set('funfact', v), onFocus: focusSel('funfact') });
        A.image = UI.imageInput({ get: () => a().imageUrl, set: v => Actions.setAlbumImage(v), onFocus: focusSel('image') });
        A.grade = UI.h('select.input.grade-select', Model.ALBUM_GRADES.map(g => UI.h('option', { value: g }, g)));
        A.grade.addEventListener('change', () => { set('albumGrade', A.grade.value); this.paintGrade(); });

        this.suggestBox = UI.h('div.suggest');
        this.genreWarn = UI.h('div.field-hint.warn');

        const summary = UI.h('span.section-extra.album-summary');
        const pageUsesAlbum = App.page().base === 'cover' || App.page().type === 'ratings';
        const sec = UI.section('Album', { key: 'album:' + (pageUsesAlbum ? 'main' : 'aux'), open: pageUsesAlbum, extra: summary });
        this.albumSummary = summary;
        UI.append(sec.body, [
            UI.h('div.field-grid',
                field('Review #', A.number.el, 'narrow'), field('Album grade', A.grade),
                field('Title', A.title.el), field('Artist', A.artist.el),
                field('Year', A.year.el, 'narrow'), UI.h('div.field.genre-field', UI.h('span.field-label', 'Genre'), A.genre.el, this.suggestBox)),
            this.genreWarn,
            field('Cover image', A.image.el),
            field('Description', A.funfact.el)
        ]);
        this.el.appendChild(sec.el);
        this.syncAlbum(true);
    },

    syncAlbum(force) {
        const a = App.doc.album, A = this.album;
        if (!A.title) return;
        for (const k of ['number', 'title', 'artist', 'year', 'genre', 'funfact']) A[k].set(a[k]);
        if (A.grade.value !== a.albumGrade) A.grade.value = a.albumGrade;
        A.image.sync();
        this.paintGrade();
        this.albumSummary.textContent = [a.artist, a.title].filter(Boolean).join(' — ');
        if (force) this.genreHint();
    },

    paintGrade() {
        const g = this.album.grade.value, base = g.replace(/ \+$/, '');
        const col = App.doc.colors.map[base] || '#5c5c5c';
        this.album.grade.style.background = col;
        this.album.grade.style.color = getContrastYIQ(col);
    },

    // ── genre helpers ──
    genreToken() {
        const input = this.album.genre.input, v = input.value;
        const start = v.lastIndexOf(',') + 1;
        return { start, text: v.slice(start).trim() };
    },
    suggestGenres() {
        const tok = this.genreToken();
        const list = tok.text.length >= 2 ? Genres.suggest(tok.text, 6).filter(n => Genres.norm(n) !== Genres.norm(tok.text)) : [];
        UI.clear(this.suggestBox);
        this.suggestBox.classList.toggle('open', list.length > 0);
        list.forEach((name, i) => this.suggestBox.appendChild(UI.h('button.suggest-item', { type: 'button', class: i === 0 ? 'first' : '', onpointerdown: e => { e.preventDefault(); this.pickGenre(name); } }, name)));
    },
    hideSuggest() { this.suggestBox.classList.remove('open'); },
    pickGenre(name) {
        const input = this.album.genre.input, tok = this.genreToken();
        const head = input.value.slice(0, tok.start);
        input.value = head + (head && !head.endsWith(' ') ? ' ' : '') + name;
        App.doc.album.genre = input.value;
        App.changed({ what: 'album' });
        this.hideSuggest(); this.genreHint();
    },
    suggestKey(e) {
        const first = this.suggestBox.classList.contains('open') && this.suggestBox.querySelector('.suggest-item');
        if (first && (e.key === 'Tab' || e.key === 'Enter')) { e.preventDefault(); this.pickGenre(first.textContent); }
        else if (e.key === 'Escape') this.hideSuggest();
    },
    genreHint() {
        const uses = App.doc.pages.some(p => p.texts.some(t => /genreDescriptions|genreDesc/.test(t.text)));
        const missing = uses ? App.doc.album.genre.split(/,\s*/g).map(s => s.trim()).filter(Boolean).slice(0, 2).filter(g => !Genres.has(g)) : [];
        UI.clear(this.genreWarn);
        if (!missing.length) return;
        UI.append(this.genreWarn, [UI.icon('triangle-exclamation'), ' No description for ', missing.map((g, i) => [i ? ', ' : '', UI.h('button.link', { type: 'button', onclick: () => Setup.editGenre(g) }, g)])]);
    },

    // ── page content ──
    buildPage() {
        const page = App.page(), wrap = UI.clear(this.pageWrap);
        this.rows = {};
        const fields = page.texts.filter(t => t.field).concat(page.images.filter(i => i.field));
        const others = page.texts.filter(t => !t.field).concat(page.images.filter(i => !i.field));

        const head = UI.h('div.col-title', UI.h('span', page.name), UI.h('span.badge', Model.typeName(page.type, App.types)), UI.h('span.spacer'),
            UI.h('button.btn.btn-small', { type: 'button', title: 'Add a textbox to this page', onclick: () => { const tb = Actions.addText(); this.focusEditor(tb.id); } }, UI.icon('font'), 'Text'),
            UI.h('button.btn.btn-small', { type: 'button', title: 'Add an image to this page', onclick: () => Actions.addImage() }, UI.icon('image'), 'Image'));
        wrap.appendChild(head);

        for (const el of fields) wrap.appendChild(this.fieldEditor(page, el));

        if (others.length) {
            const sec = UI.section('Layout elements', { key: 'elements:' + page.type, open: !fields.length && page.base !== 'cover' && page.type !== 'ratings', extra: UI.h('span.section-extra.count', String(others.length)) });
            for (const el of others) sec.body.appendChild(this.elementRow(page, el));
            sec.body.appendChild(UI.h('p.field-hint', 'Text can use ', UI.h('code', '$title$'), ', ', UI.h('code', '$artist$'), ', ', UI.h('code', '$year$'), ', ', UI.h('code', '$genre$'), ', ', UI.h('code', '$number$'), ' and ', UI.h('code', '$(js: …)$'), '.'));
            wrap.appendChild(sec.el);
        } else if (!fields.length) {
            wrap.appendChild(UI.h('p.empty-note', page.base === 'cover' || page.type === 'ratings' ? 'This page is driven by the album data above.' : 'Nothing on this page yet — add a text or an image.'));
        }
        this.syncSelection();
    },

    isText(page, el) { return page.texts.includes(el); },

    editorFor(page, el) {
        if (this.isText(page, el)) {
            const t = UI.text({ multiline: true, value: el.text, placeholder: el.name ? el.name + '…' : 'Text…',
                onInput: v => { el.text = v; Model.stackTouch(page, el.id); App.changed({ what: 'text' }); },
                onFocus: () => Actions.select([el.id]) });
            t.input.rows = el.field ? 5 : 2;
            return t;
        }
        const im = UI.imageInput({ get: () => el.url, set: v => { Images.forget(el.url); el.url = v; App.changed({ what: 'text' }); }, onFocus: () => Actions.select([el.id]) });
        return { el: im.el, input: im.el.querySelector('input') };
    },

    fieldEditor(page, el) {
        const ed = this.editorFor(page, el);
        const row = UI.h('div.field.page-field', { onpointerdown: () => Actions.select([el.id]) },
            UI.h('span.field-label', el.name || (this.isText(page, el) ? 'Text' : 'Image'),
                UI.h('button.icon-btn.small.ghost', { type: 'button', title: 'Element options', onclick: e => { e.preventDefault(); this.elementMenu(page, el, e.currentTarget); } }, UI.icon('ellipsis'))),
            ed.el);
        this.rows[el.id] = { row, input: ed.input };
        return row;
    },

    elementRow(page, el) {
        const isText = this.isText(page, el);
        const label = el.name || (isText ? (el.text.replace(/\s+/g, ' ').slice(0, 40) || 'Empty text') : 'Image');
        const ed = this.editorFor(page, el);
        const editor = UI.h('div.el-editor', ed.el);
        const toggle = (prop, on, off, title) => UI.h('button.icon-btn.small.ghost', { type: 'button', class: el[prop] ? 'on' : '', title,
            onclick: e => { e.stopPropagation(); el[prop] = !el[prop]; App.changed({ what: 'elements' }); } }, UI.icon(el[prop] ? on : off));
        const row = UI.h('div.el-row', { class: el.hidden ? 'is-hidden' : '' },
            UI.h('div.el-head', { onclick: () => Actions.select([el.id]) },
                UI.h('span.el-kind', UI.icon(isText ? 'font' : 'image')), UI.h('span.el-label', label),
                toggle('hidden', 'eye-slash', 'eye', 'Show / hide'),
                toggle('locked', 'lock', 'lock-open', 'Lock position'),
                UI.h('button.icon-btn.small.ghost', { type: 'button', title: 'More', onclick: e => { e.stopPropagation(); this.elementMenu(page, el, e.currentTarget); } }, UI.icon('ellipsis'))),
            editor);
        this.rows[el.id] = { row, input: ed.input };
        return row;
    },

    elementMenu(page, el, anchor) {
        UI.menu(anchor, [
            { label: 'Rename…', icon: 'pen', run: async () => { const n = await UI.prompt('Element name', el.name || '', 'e.g. Band info'); if (n !== null) { el.name = n || ''; App.changed({ what: 'elements' }); } } },
            { label: 'Show as a field', hint: 'always visible here', checked: !!el.field, icon: 'thumbtack', run: () => { el.field = !el.field; App.changed({ what: 'elements' }); } },
            { label: 'Duplicate', icon: 'clone', run: () => Actions.duplicate([el.id]) },
            { label: 'Bring to front', icon: 'arrow-up', run: () => Actions.arrange(el.id, 'front') },
            { label: 'Send to back', icon: 'arrow-down', run: () => Actions.arrange(el.id, 'back') },
            '-',
            { label: 'Delete', icon: 'trash', danger: true, run: () => Actions.removeElements([el.id]) }
        ], { alignRight: true });
    },

    syncSelection() {
        for (const id of Object.keys(this.rows)) this.rows[id].row.classList.toggle('selected', App.selection.includes(id));
    },

    // Bring an element's editor into view and focus it.
    focusEditor(id) {
        const builtin = { title: 'title', artist: 'artist', year: 'year', genre: 'genre', funfact: 'funfact' }[id];
        let input = null;
        if (builtin) input = this.album[builtin].input;
        else if (this.rows[id]) { this.rows[id].row.classList.add('selected'); input = this.rows[id].input; }
        if (!input) return;
        if (isMobile() && typeof Mobile !== 'undefined') Mobile.show('content');
        const sec = input.closest('.section');
        if (sec && !sec.classList.contains('open')) sec.querySelector('.section-head').click();
        input.scrollIntoView({ block: 'center', behavior: 'smooth' });
        input.focus({ preventScroll: true });
    }
};
