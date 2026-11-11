// Document operations shared by panels, the canvas and keyboard shortcuts.
'use strict';

const Actions = {
    // ── selection ──
    select(ids, opts) {
        const next = [...new Set(ids)];
        const same = next.length === App.selection.length && next.every(id => App.selection.includes(id));
        App.selection = next;
        if (!same || (opts && opts.force)) App.emit('selection');
    },
    isSelected(id) { return App.selection.includes(id); },
    // The single selected box (from the last render), or null.
    selectedBox() { return App.selection.length === 1 ? (App.boxes.find(b => b.id === App.selection[0]) || null) : null; },
    selectedElement() { return App.selection.length === 1 ? Model.findElement(App.page(), App.selection[0]) : null; },

    // Position of a box in its own coordinate system: custom elements are
    // absolute, built-in blocks are offsets from their layout position.
    getPos(id) {
        const el = Model.findElement(App.page(), id);
        if (el) return { x: el.x, y: el.y };
        const p = App.page().pos[id];
        return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
    },
    setPos(id, x, y) {
        const page = App.page(), el = Model.findElement(page, id);
        if (el) { el.x = x; el.y = y; return; }
        if (!page.pos[id]) page.pos[id] = { x: 0, y: 0 };
        page.pos[id].x = Math.round(x); page.pos[id].y = Math.round(y);
        if (id === 'image') Model.applyAutoAlign(page);
    },
    canMove(id) {
        const box = App.boxes.find(b => b.id === id);
        if (box && box.fixed) return false;
        const el = Model.findElement(App.page(), id);
        return !(el && el.locked);
    },

    nudge(dx, dy) {
        const ids = App.selection.filter(id => this.canMove(id));
        if (!ids.length) return;
        for (const id of ids) { const p = this.getPos(id); this.setPos(id, p.x + dx, p.y + dy); }
        this.restack(ids);
        App.changed({ what: 'move' });
    },

    // After moving stacked textboxes by hand, keep their new spacing.
    restack(ids) {
        const page = App.page();
        if (!page.stack || !ids.some(id => page.stack.ids.includes(id))) return;
        const heights = {};
        for (const t of page.texts) heights[t.id] = t.hidden ? 0 : measureTextElement(t);
        Model.captureStack(page, heights);
    },

    // ── custom elements ──
    addText(init) {
        const page = App.page();
        const tb = Object.assign(Model.textDefaults(), {
            id: Model.uid('t'), text: 'Text', x: 100, y: 100 + page.texts.length * 24,
            textAlign: page.base === 'cover' ? 'center' : 'left'
        }, init || {});
        page.texts.push(tb);
        App.selection = [tb.id];
        App.changed({ what: 'elements' });
        App.emit('selection');
        return tb;
    },
    addImage(init) {
        const page = App.page();
        const im = Object.assign(Model.imageDefaults(), { id: Model.uid('i'), x: 100, y: 100 + page.images.length * 24 }, init || {});
        page.images.push(im);
        App.selection = [im.id];
        App.changed({ what: 'elements' });
        App.emit('selection');
        return im;
    },
    removeElements(ids) {
        const page = App.page();
        const removable = ids.filter(id => Model.findElement(page, id));
        if (!removable.length) { UI.toast("Built-in blocks can't be deleted — hide them in Design › Page", true); return; }
        page.texts = page.texts.filter(t => !removable.includes(t.id));
        page.images = page.images.filter(t => !removable.includes(t.id));
        for (const id of removable) Glitch.drop(page.id + ':txt:' + id), Glitch.drop(page.id + ':img:' + id);
        App.selection = App.selection.filter(id => !removable.includes(id));
        App.changed({ what: 'elements' });
        App.emit('selection');
    },
    duplicate(ids) {
        const page = App.page(), made = [];
        for (const id of ids) {
            const el = Model.findElement(page, id);
            if (!el) continue;
            const copy = Model.clone(el);
            const isText = page.texts.includes(el);
            copy.id = Model.uid(isText ? 't' : 'i'); copy.x += 30; copy.y += 30;
            (isText ? page.texts : page.images).push(copy);
            made.push(copy.id);
        }
        if (!made.length) return;
        App.selection = made;
        App.changed({ what: 'elements' });
        App.emit('selection');
    },
    // Draw order inside its kind (texts are always above images).
    arrange(id, where) {
        const page = App.page();
        for (const list of [page.texts, page.images]) {
            const i = list.findIndex(e => e.id === id);
            if (i === -1) continue;
            const [el] = list.splice(i, 1);
            if (where === 'front') list.push(el); else list.unshift(el);
            App.changed({ what: 'elements' });
        }
    },

    // ── pages ──
    switchPage(id) {
        if (!App.pageById(id) || App.doc.currentPageId === id) return;
        App.doc.currentPageId = id;
        App.selection = [];
        App.changed({ history: false, what: 'page' });
        App.emit('selection');
    },
    stepPage(delta) {
        const pages = App.doc.pages, i = pages.findIndex(p => p.id === App.doc.currentPageId);
        const next = pages[(i + delta + pages.length) % pages.length];
        this.switchPage(next.id);
    },
    addPage(typeId) {
        const page = Model.createPage(typeId, App.types);
        const names = App.doc.pages.map(p => p.name);
        let name = page.name, n = 2;
        while (names.includes(name)) name = page.name + ' ' + n++;
        page.name = name;
        App.doc.pages.push(page);
        App.doc.currentPageId = page.id;
        App.selection = [];
        App.changed({ what: 'page' });
        App.emit('selection');
        return page;
    },
    duplicatePage(id) {
        const src = App.pageById(id);
        if (!src) return;
        const page = Model.reidPage(Model.clone(src));
        page.name = src.name + ' copy';
        App.doc.pages.splice(App.doc.pages.indexOf(src) + 1, 0, page);
        App.doc.currentPageId = page.id;
        App.selection = [];
        App.changed({ what: 'page' });
        App.emit('selection');
    },
    async deletePage(id) {
        const page = App.pageById(id);
        if (!page) return;
        if (App.doc.pages.length <= 1) { UI.toast('A review needs at least one page', true); return; }
        const i = App.doc.pages.indexOf(page);
        App.doc.pages.splice(i, 1);
        Glitch.drop(page.id + ':');
        if (App.doc.currentPageId === id) App.doc.currentPageId = App.doc.pages[Math.max(0, i - 1)].id;
        App.selection = [];
        App.changed({ what: 'page' });
        App.emit('selection');
        UI.toast('Deleted "' + page.name + '"', false, { label: 'Undo', run: () => History.go(-1) });
    },
    movePage(id, toIndex) {
        const pages = App.doc.pages, from = pages.findIndex(p => p.id === id);
        if (from === -1 || from === toIndex) return;
        const [p] = pages.splice(from, 1);
        pages.splice(toIndex, 0, p);
        App.changed({ what: 'page' });
    },
    async savePageAsType(id) {
        const page = App.pageById(id);
        const name = await UI.prompt('Save page as a page type', page.name, 'Type name');
        if (!name) return;
        const typeId = 'custom_' + Model.uid('y');
        const snapshot = Model.clone(page);
        snapshot.type = typeId; snapshot.tracks.list = [];
        for (const t of snapshot.texts) if (t.field) t.text = '';
        for (const im of snapshot.images) if (im.field) im.url = '';
        App.types[typeId] = { name, page: snapshot };
        Storage.write(KEYS.types, App.types);
        page.type = typeId;
        App.changed({ what: 'page' });
        UI.toast('Page type "' + name + '" saved — find it under the + button');
    },
    async resetPageToType(id) {
        const page = App.pageById(id);
        const typeName = Model.typeName(page.type, App.types);
        if (!await UI.confirm('Reset "' + page.name + '"?', 'Layout, blocks and elements go back to the "' + typeName + '" page type. Album data and tracks are kept.', 'Reset')) return;
        const fresh = Model.createPage(page.type, App.types);
        fresh.id = page.id; fresh.name = page.name;
        fresh.tracks.source = page.tracks.source; fresh.tracks.list = page.tracks.list;
        App.doc.pages[App.doc.pages.indexOf(page)] = fresh;
        Glitch.drop(page.id + ':');
        App.selection = [];
        App.changed({ what: 'page' });
        App.emit('selection');
    },

    // ── album image ──
    setAlbumImage(url) {
        App.doc.album.imageUrl = url;
        App.changed({ what: 'album' });
    },
    async setAlbumImageFile(file) {
        try { this.setAlbumImage(Assets.add(await UI.readImageFile(file))); }
        catch (err) { UI.toast(err.message, true); }
    },

    // ── text format clipboard ──
    formatClip: null,
    copyFormat() {
        const el = this.selectedElement(), page = App.page(), id = App.selection[0];
        if (el && page.texts.includes(el)) {
            this.formatClip = { fontSize: el.fontSize, fontType: el.fontType, color: el.color, textAlign: el.textAlign, leading: el.leading, maxWidth: el.maxWidth, shadow: el.shadow, opacity: el.opacity, uppercase: el.uppercase };
        } else if (Model.TEXT_IDS.includes(id)) {
            this.formatClip = { sizeOff: page.sizeOff[id], leadOff: page.leadOff[id] || 0, maxWidth: page.maxW[id], textAlign: page.align[id] };
        } else { UI.toast('Select a textbox to copy its format', true); return; }
        UI.toast('Format copied');
    },
    pasteFormat() {
        const f = this.formatClip, page = App.page(), id = App.selection[0];
        if (!f) { UI.toast('No format copied yet', true); return; }
        const el = this.selectedElement();
        if (el && page.texts.includes(el)) {
            for (const k of ['fontSize', 'fontType', 'color', 'textAlign', 'leading', 'maxWidth', 'shadow', 'opacity', 'uppercase']) if (f[k] !== undefined) el[k] = f[k];
        } else if (Model.TEXT_IDS.includes(id)) {
            if (f.sizeOff !== undefined) page.sizeOff[id] = f.sizeOff;
            if (id === 'funfact' && f.leadOff !== undefined) page.leadOff.funfact = f.leadOff;
            if (f.maxWidth !== undefined) page.maxW[id] = f.maxWidth;
            if (f.textAlign) page.align[id] = f.textAlign;
        } else { UI.toast('Select a textbox first', true); return; }
        App.changed({ what: 'elements' });
        App.emit('selection');
        UI.toast('Format pasted');
    }
};
