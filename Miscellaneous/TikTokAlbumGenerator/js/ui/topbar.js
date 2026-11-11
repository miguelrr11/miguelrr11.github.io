// Top bar: start a new review, pick / manage profiles, undo / redo, export.
'use strict';

const TopBar = {
    el: null,

    init() {
        this.el = document.getElementById('topbar');
        App.on(what => { if (what === 'doc' || what === 'profiles') this.build(); else this.syncHistory(); });
        this.build();
    },

    build() {
        const el = UI.clear(this.el);
        const names = App.profileNames();
        let current = App.lastProfile();
        this.select = UI.h('select.input.profile-select', { title: 'Profile: the pages and styling a new review starts with' }, names.map(n => UI.h('option', { value: n }, n)));
        this.select.value = current;
        this.select.addEventListener('change', () => App.setLastProfile(this.select.value));

        this.undoBtn = UI.h('button.icon-btn', { type: 'button', title: 'Undo (⌘Z)', onclick: () => History.go(-1) }, UI.icon('rotate-left'));
        this.redoBtn = UI.h('button.icon-btn', { type: 'button', title: 'Redo (⇧⌘Z)', onclick: () => History.go(1) }, UI.icon('rotate-right'));

        UI.append(el, [
            UI.h('button.btn.btn-accent', { type: 'button', id: 'new-review-btn', title: 'Clear everything and start from the selected profile (⌥N)', onclick: () => this.newReview() }, UI.icon('plus'), 'New review'),
            UI.h('div.profile-box', UI.h('span.profile-label', 'Profile'), this.select,
                UI.h('button.icon-btn', { type: 'button', title: 'Apply this profile to the current review (keeps album info and tracks)', onclick: () => this.apply() }, UI.icon('check')),
                UI.h('button.icon-btn', { type: 'button', title: 'Profile options', onclick: e => this.menu(e.currentTarget) }, UI.icon('ellipsis'))),
            UI.h('span.spacer'),
            this.undoBtn, this.redoBtn,
            UI.h('div.split',
                UI.h('button.btn.btn-primary', { type: 'button', id: 'export-btn', title: 'Download the images (⌘E)', onclick: () => Exporter.images() }, UI.icon('download'), 'Export'),
                UI.h('button.btn.btn-primary.split-caret', { type: 'button', title: 'More export options', onclick: e => this.exportMenu(e.currentTarget.parentNode) }, UI.icon('chevron-down')))
        ]);
        this.syncHistory();
    },

    syncHistory() {
        if (!this.undoBtn) return;
        this.undoBtn.disabled = !History.canUndo();
        this.redoBtn.disabled = !History.canRedo();
    },

    profile() { return this.select ? this.select.value : 'Default'; },

    newReview() {
        const name = this.profile();
        App.newReview(name);
        UI.toast('New review · ' + name + ' profile', false, { label: 'Undo', run: () => History.go(-1) });
        if (!isMobile()) { const first = document.querySelector('#col-content .field-grid input'); if (first) first.focus(); }
    },

    apply() {
        const name = this.profile();
        App.applyProfile(name);
        UI.toast('Profile applied: ' + name, false, { label: 'Undo', run: () => History.go(-1) });
    },

    async saveAs() {
        const name = await UI.prompt('Save current layout as a profile', '', 'Profile name');
        if (!name) return;
        if (name.toLowerCase() === 'default') { UI.toast('"Default" is the built-in profile — pick another name', true); return; }
        if (App.profiles[name] && !await UI.confirm('Replace profile "' + name + '"?', 'A profile with this name already exists.', 'Replace')) return;
        App.profiles[name] = Model.profileFromDoc(App.doc, name);
        App.saveProfiles(); App.setLastProfile(name);
        App.doc.profileName = name;
        App.emit('profiles');
        UI.toast('Profile saved: ' + name);
    },

    menu(anchor) {
        const name = this.profile(), builtin = name === 'Default';
        UI.menu(anchor, [
            { title: 'Profile · ' + name },
            { label: 'Apply to this review', hint: 'keeps album & tracks', icon: 'check', run: () => this.apply() },
            { label: 'Save current layout as new profile…', icon: 'floppy-disk', run: () => this.saveAs() },
            { label: 'Update "' + name + '" with current layout', icon: 'arrows-rotate', disabled: builtin, run: () => {
                App.profiles[name] = Model.profileFromDoc(App.doc, name); App.saveProfiles(); UI.toast('Profile updated: ' + name);
            } },
            { label: 'Rename…', icon: 'pen', disabled: builtin, run: async () => {
                const n = await UI.prompt('Rename profile', name);
                if (!n || n === name || n.toLowerCase() === 'default') return;
                App.profiles[n] = App.profiles[name]; App.profiles[n].name = n; delete App.profiles[name];
                App.saveProfiles(); App.setLastProfile(n); App.emit('profiles');
            } },
            { label: 'Delete', icon: 'trash', danger: true, disabled: builtin, run: async () => {
                if (!await UI.confirm('Delete profile "' + name + '"?', 'Reviews already made with it are not affected.', 'Delete', true)) return;
                delete App.profiles[name]; App.saveProfiles(); App.setLastProfile('Default'); App.emit('profiles');
            } },
            '-',
            { label: 'Export profiles to a file', icon: 'file-export', run: () => Setup.exportLibrary() },
            { label: 'Import profiles from a file…', icon: 'file-import', run: () => Setup.importLibrary() }
        ]);
    },

    exportMenu(anchor) {
        const n = Model.pagesToExport(App.doc, 'all').length;
        UI.menu(anchor, [
            { label: 'All pages (' + n + ' image' + (n === 1 ? '' : 's') + ')', icon: 'images', run: () => Exporter.images('all') },
            { label: 'Only "' + App.page().name + '"', icon: 'image', run: () => Exporter.images('current') },
            { label: 'Copy "' + App.page().name + '" to clipboard', icon: 'copy', run: () => Exporter.copyPage() },
            '-',
            { label: 'Save review as JSON', icon: 'file-code', hint: '⌘S', run: () => Exporter.json() },
            { label: 'Open JSON…', icon: 'folder-open', run: () => Exporter.openJson() }
        ], { alignRight: true });
    }
};
