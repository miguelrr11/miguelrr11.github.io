// Output: image downloads, clipboard copy and JSON save / load.
'use strict';

const Exporter = {
    busy: false,

    mime(format) { return 'image/' + (format === 'jpg' ? 'jpeg' : format); },

    toBlob(canvas, format, quality) {
        return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not encode the image'))), this.mime(format), format === 'png' ? undefined : quality));
    },

    // Download every page in scope ('all' | 'current', default: the export setting).
    async images(scope) {
        if (this.busy) return;
        if (typeof Anim !== 'undefined' && Anim.playing) { UI.toast('Wait for the animation to finish', true); return; }
        const doc = App.doc, ex = doc.export;
        const pages = Model.pagesToExport(doc, scope);
        if (!pages.length) { UI.toast('No page is included in the export', true); return; }
        this.busy = true;
        document.body.classList.add('exporting');
        try {
            if (document.activeElement && UI.isTyping()) document.activeElement.blur();
            const used = new Set();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const canvas = await Render.capture(page);
                const blob = await this.toBlob(canvas, ex.format, ex.quality);
                canvas.width = canvas.height = 0;
                let name = Model.fileName(ex.filename, doc, page, doc.pages.indexOf(page));
                if (used.has(name)) name += ' (' + (i + 1) + ')';
                used.add(name);
                UI.download(blob, name + '.' + ex.format);
                if (i < pages.length - 1) await new Promise(r => setTimeout(r, 180));   // browsers drop rapid-fire downloads
            }
            App.rememberNumber();
            const warnings = Model.preflight(doc, g => Genres.has(g));
            if (ex.transparent && (ex.format === 'jpg' || ex.format === 'jpeg')) warnings.unshift('JPG has no transparency — use PNG for a transparent background');
            const what = pages.length + ' image' + (pages.length === 1 ? '' : 's') + ' exported';
            if (warnings.length) UI.toast(what + ' — check: ' + warnings.slice(0, 2).join(' · ') + (warnings.length > 2 ? ' (+' + (warnings.length - 2) + ')' : ''), true);
            else UI.toast(what);
        } catch (err) {
            console.error(err);
            UI.toast('Export failed: ' + err.message, true);
        } finally {
            this.busy = false;
            document.body.classList.remove('exporting');
            Render.request();     // back to the page being edited
        }
    },

    async copyPage() {
        try {
            const canvas = await Render.capture(App.page());
            const blob = await this.toBlob(canvas, 'png');
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            UI.toast('"' + App.page().name + '" copied to the clipboard');
        } catch (err) { UI.toast('Could not copy the image (' + err.message + ')', true); }
        finally { Render.request(); }
    },

    json() {
        History.flush();
        const blob = new Blob([JSON.stringify(App.toFile(), null, 2)], { type: 'application/json' });
        UI.download(blob, Model.baseFileName(App.doc) + '.json');
    },

    openJson() {
        const input = UI.h('input', { type: 'file', accept: '.json,application/json' });
        input.addEventListener('change', () => { if (input.files[0]) this.loadJsonFile(input.files[0]); });
        input.click();
    },

    loadJsonFile(file) {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data && data.app === 'album-rating-generator-library') { Setup.absorbLibrary(data); return; }
                App.loadFile(data);
                UI.toast('Loaded ' + file.name, false, { label: 'Undo', run: () => History.go(-1) });
            } catch (err) { console.error(err); UI.toast('That file is not a review JSON', true); }
        };
        reader.readAsText(file);
    }
};
