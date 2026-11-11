# Tests

The app is plain static files; the tests live here so nothing leaks into the site.

```sh
cd tests
npm install          # once — puppeteer-core, pngjs, pixelmatch (uses your installed Chrome)
npm test             # unit + end-to-end
npm run test:unit    # fast, no browser
npm run test:e2e     # drives the real app in headless Chrome
```

| Suite | What it proves |
| --- | --- |
| `unit/model.test.js` | Document model: page types, profiles, migration of files saved by older versions, pasted track lists, playlist note, auto-stack, export helpers. |
| `unit/glitch.test.js` | The optimised glitch kernel returns **exactly** the pixels of the original `createGlitchyImage` (kept verbatim in `fixtures/`). |
| `unit/genres.test.js` | Forgiving genre lookups, suggestions, custom descriptions. |
| `e2e/workflow.test.mjs` | The review workflow through the real UI: new review → cover → context → ratings → playlist note → glitch → export; plus undo, autosave, legacy-storage import, selection and the phone layout. |
| `e2e/parity.test.mjs` | Renders reviews saved by the previous version in **both** the old app (checked out of git history) and the current one and compares the images pixel by pixel. |

Chrome is looked up in the usual macOS / Linux locations; set `CHROME_PATH` to override.
The parity test needs the git history (commit `dbf36d2`, the last one before the rewrite) and internet access for p5.js.
