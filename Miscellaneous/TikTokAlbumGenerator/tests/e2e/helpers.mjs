// Shared helpers: a static file server for the app and a headless Chrome.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

export const TESTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const APP = path.resolve(TESTS, '..');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ttf': 'font/ttf', '.otf': 'font/otf' };

// Serves `root`; anything under /_t/ comes from tests/fixtures (same origin, so no canvas tainting).
export function serve(root) {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            const p = decodeURIComponent(req.url.split('?')[0]);
            const file = p.startsWith('/_t/') ? path.join(TESTS, 'fixtures', p.slice(4)) : path.join(root, p === '/' ? 'index.html' : p);
            fs.readFile(file, (err, buf) => {
                if (err) { res.writeHead(404); res.end('not found'); return; }
                res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
                res.end(buf);
            });
        }).listen(0, '127.0.0.1', () => resolve({ server, url: 'http://127.0.0.1:' + server.address().port }));
    });
}

export function chromePath() {
    const candidates = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
    const found = candidates.find(p => fs.existsSync(p));
    if (!found) throw new Error('Chrome not found — set CHROME_PATH');
    return found;
}

export function launch() {
    return puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--force-color-profile=srgb'] });
}

// Opens a page and collects everything that would show up as an error in the console.
export async function openPage(browser, url, { width = 1600, height = 1000, scale = 2, before } = {}) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: scale });
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    if (before) await page.evaluateOnNewDocument(before);
    await page.goto(url, { waitUntil: 'networkidle2' });
    return { page, errors };
}

export const appReady = page => page.waitForFunction(() => window.appReady === true, { timeout: 60000 });
