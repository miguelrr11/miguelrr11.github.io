// AI helpers (album info / description). Kept as it was in the previous version;
// only setField() changed, to write into the new document model.
'use strict';

const IA_MODEL = 'gpt-5.4-mini';

// ---- Provider config: everything that differs between APIs lives here ----
// To add another provider (Gemini, Mistral, etc.) just add an entry below.
const AI_PROVIDERS = {
    openai: {
        label: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        // Adjust these to whatever model strings you actually have access to.
        models: ['gpt-5-mini', 'gpt-5-nano', 'gpt-4.1-mini', 'gpt-4o-mini'],
        defaultModel: (typeof IA_MODEL !== 'undefined' ? IA_MODEL : 'gpt-5-mini'),
        buildHeaders: (key) => ({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        }),
        buildBody: (model, prompt) => JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }]
        }),
        parseResponse: (data) => data.choices[0].message.content
    },
    anthropic: {
        label: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        // Verify these against Anthropic's current model strings.
        models: ['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-8'],
        defaultModel: 'claude-haiku-4-5',
        buildHeaders: (key) => ({
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            // Required for calling Anthropic directly from a browser (CORS).
            'anthropic-dangerous-direct-browser-access': 'true'
        }),
        buildBody: (model, prompt) => JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }]
        }),
        parseResponse: (data) => data.content[0].text
    }
};

function createIASection(parent = editorPanel) {
    createDiv('').parent(parent).class('section-divider');
    let iaSection = createDiv('').parent(parent).class('color-section');
    let iaHeader = createDiv('').parent(iaSection).class('color-section-header');
    let iaToggle = createSpan('▶').parent(iaHeader).class('color-toggle');
    createSpan(' AI Space ').parent(iaHeader);
    let iaContent = createDiv('').parent(iaSection).class('color-content collapsed');

    iaHeader.mousePressed(() => {
        if (iaContent.hasClass('collapsed')) {
            iaContent.removeClass('collapsed');
            iaToggle.html('▼');
        }
        else {
            iaContent.addClass('collapsed');
            iaToggle.html('▶');
        }
    });

    // ---- Provider / key / model state (persisted per provider) ----
    let aiProvider = localStorage.getItem('aiProvider') || 'openai';

    // Per-provider keys. Note the migration from the old single-key format.
    let apiKeys = {
        openai: localStorage.getItem('apiKey_openai') || localStorage.getItem('openAIApiKey') || '',
        anthropic: localStorage.getItem('apiKey_anthropic') || ''
    };
    // One-time migration of the legacy key, then drop the old entry.
    if (!localStorage.getItem('apiKey_openai') && localStorage.getItem('openAIApiKey')) {
        localStorage.setItem('apiKey_openai', localStorage.getItem('openAIApiKey'));
        localStorage.removeItem('openAIApiKey');
    }

    let aiModels = {
        openai: localStorage.getItem('aiModel_openai') || AI_PROVIDERS.openai.defaultModel,
        anthropic: localStorage.getItem('aiModel_anthropic') || AI_PROVIDERS.anthropic.defaultModel
    };

    // ---- Provider selector ----
    let providerRow = createDiv('').parent(iaContent).class('form-group');
    createElement('label', 'AI Provider').parent(providerRow);
    let providerSelect = createSelect().parent(providerRow).class('form-select');
    for (let id in AI_PROVIDERS) providerSelect.option(AI_PROVIDERS[id].label, id);
    providerSelect.selected(aiProvider);
    providerSelect.style('margin-bottom', '15px');

    // ---- API key input ----
    let apiKeyRow = createDiv('').parent(iaContent).class('form-group');
    let apiKeyLabel = createElement('label', 'API Key').parent(apiKeyRow);
    let apiKeyInput = createInput('').parent(apiKeyRow).class('form-input').attribute('type', 'password');
    apiKeyInput.style('margin-bottom', '15px');

    let saveApiKeyCheckbox = createCheckbox('Save API Key in Local Storage', true).parent(apiKeyRow).class('checkbox-input');
    saveApiKeyCheckbox.style('margin-bottom', '15px');

    // ---- Model selector ----
    let modelRow = createDiv('').parent(iaContent).class('form-group');
    createElement('label', 'Model').parent(modelRow);
    let modelSelect = createSelect().parent(modelRow).class('form-select');
    modelSelect.style('margin-bottom', '15px');

    // (Re)build the model options for the current provider.
    function populateModelSelect() {
        modelSelect.elt.innerHTML = '';
        let provider = AI_PROVIDERS[aiProvider];
        let saved = aiModels[aiProvider];
        let list = provider.models.slice();
        // Preserve a custom/saved model that isn't in the predefined list.
        if (saved && !list.includes(saved)) list.unshift(saved);
        for (let m of list) {
            let label = (m === provider.defaultModel) ? m + ' [RECOMMENDED]' : m;
            modelSelect.option(label, m);
        }
        modelSelect.selected(saved || provider.defaultModel);
    }


    // Keep the visible inputs in sync with the selected provider.
    function refreshProviderUI() {
        apiKeyLabel.html(AI_PROVIDERS[aiProvider].label + ' API Key');
        apiKeyInput.value(apiKeys[aiProvider] || '');
        populateModelSelect();
    }
    refreshProviderUI();

    providerSelect.changed(() => {
        aiProvider = providerSelect.value();
        localStorage.setItem('aiProvider', aiProvider);
        refreshProviderUI();
    });

    apiKeyInput.input(() => {
        apiKeys[aiProvider] = apiKeyInput.value().trim();
        if (saveApiKeyCheckbox.checked() && apiKeys[aiProvider]) {
            localStorage.setItem('apiKey_' + aiProvider, apiKeys[aiProvider]);
        }
    });

    saveApiKeyCheckbox.changed(() => {
        if (!saveApiKeyCheckbox.checked()) {
            localStorage.removeItem('apiKey_' + aiProvider);
        } else if (apiKeys[aiProvider]) {
            localStorage.setItem('apiKey_' + aiProvider, apiKeys[aiProvider]);
        }
    });

    modelSelect.changed(() => {
        aiModels[aiProvider] = modelSelect.value();
        localStorage.setItem('aiModel_' + aiProvider, aiModels[aiProvider]);
    });

    // ---- Single entry point for all AI calls ----
    async function callAI(prompt) {
        const provider = AI_PROVIDERS[aiProvider];
        const key = apiKeys[aiProvider];
        const model = (aiModels[aiProvider] || provider.defaultModel).trim();

        const response = await fetch(provider.endpoint, {
            method: 'POST',
            headers: provider.buildHeaders(key),
            body: provider.buildBody(model, prompt)
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || 'API error');
        return provider.parseResponse(data).trim();
    }

    function requireKey() {
        if (!apiKeys[aiProvider]) {
            showToast(`Please enter your ${AI_PROVIDERS[aiProvider].label} API key first`, true);
            return false;
        }
        return true;
    }

    // Some models wrap JSON in ```json fences despite being told not to.
    function stripFences(s) {
        return s.replace(/```(?:json)?/gi, '').trim();
    }

    // ---- Prompts ----
    const promptFixGrammar = "fix any grammar or syntax mistakes or anything that is awkard but do not change it a lot. Only respond with the fixed text without any additional commentary. Here is the text: ";

    const promptGenerateAlbumInfo = `Return album metadata as a JSON object with no extra text or markdown.
Format (placeholders, do not copy these values):
{"year":"<release year as string>","artist":"<performing artist>","genre":"<genre 1>, <genre 2>"}

Rules:
- genre must be exactly two genres, comma-separated.
- If the album name is ambiguous, pick the most famous match.
- Set a field to "unknown" only if you truly have no idea. Answer well-known albums confidently.

Album: {albumName}`;

    const promptGenerateDescription = `You are a music database. Given an album name and its metadata, return a short description of the album in 2-3 sentences. Do not add asterisks or any other formatting. Do not include the album name or its year as that information is already known. Focus on the music, the artist, and the genre. If you don't know the album, return "unknown".`;

    // ---- Button: fix description grammar ----
    let generateFunFactRow = createDiv('').parent(iaContent).class('form-group');
    let generateFunFactButton = createButton('Fix description grammar').parent(generateFunFactRow).class('btn btn-secondary');
    generateFunFactButton.mousePressed(async () => {
        if (!requireKey()) return;
        if (!albumData || !albumData.funfact) {
            showToast('Album description not found', true);
            return;
        }
        generateFunFactButton.attribute('disabled', '');
        generateFunFactButton.html('Generating...');
        try {
            let funFact = await callAI(promptFixGrammar + albumData.funfact);
            setField('funfact', funFact);
            showToast('Description grammar fixed successfully');
        } catch (error) {
            console.error('Error fixing grammar:', error);
            showToast('Error fixing grammar', true);
        } finally {
            generateFunFactButton.removeAttribute('disabled');
            generateFunFactButton.html('Fix description grammar');
        }
    });

    // ---- Button: fill year / artist / genre from the album name ----
    let generateAlbumInfoRow = createDiv('').parent(iaContent).class('form-group');
    let generateAlbumInfoButton = createButton('Fill album info').parent(generateAlbumInfoRow).class('btn btn-secondary');
    generateAlbumInfoButton.mousePressed(async () => {
        if (!requireKey()) return;
        if (!albumData || !albumData.title) {
            showToast('Album name not found', true);
            return;
        }
        generateAlbumInfoButton.attribute('disabled', '');
        generateAlbumInfoButton.html('Generating...');
        try {
            let prompt = promptGenerateAlbumInfo.replace('{albumName}', albumData.title);
            if (albumData.artist) prompt += ` The artist is "${albumData.artist}".`;
            if (albumData.year)   prompt += ` The year is "${albumData.year}".`;
            if (albumData.genre)  prompt += ` The genre is "${albumData.genre}".`;

            let content = await callAI(prompt);
            if (content === 'unknown') {
                showToast('No information found for this album', true);
                return;
            }

            let albumInfo = JSON.parse(stripFences(content));
            if (albumInfo.year === 'unknown' && albumInfo.artist === 'unknown' && albumInfo.genre === 'unknown') {
                showToast('No information found for this album', true);
                return;
            }
            setField('year', albumInfo.year);
            setField('artist', albumInfo.artist);
            let genres = albumInfo.genre.split(',')
                .map(g => g.trim())
                .map(g => g.charAt(0).toUpperCase() + g.slice(1))
                .join(', ');
            setField('genre', genres);

            showToast('Album info filled successfully');
        }
        catch (error) {
            console.error('Error generating album info:', error);
            showToast('Error generating album info', true);
        }
        finally {
            generateAlbumInfoButton.removeAttribute('disabled');
            generateAlbumInfoButton.html('Fill album info');
        }
    });

    // ---- Button: generate a description ----
    let generateDescriptionRow = createDiv('').parent(iaContent).class('form-group');
    let generateDescriptionButton = createButton('Generate description').parent(generateDescriptionRow).class('btn btn-secondary');
    generateDescriptionButton.mousePressed(async () => {
        if (!requireKey()) return;
        if (!albumData || !albumData.title) {
            showToast('Please fill the album name field first', true);
            return;
        }
        if (!albumData.artist) {
            showToast('Please fill the artist field first', true);
            return;
        }
        generateDescriptionButton.attribute('disabled', '');
        generateDescriptionButton.html('Generating...');
        try {
            let prompt = promptGenerateDescription +
                ` Album name: ${albumData.title}. Year: ${albumData.year || 'unknown'}. Artist: ${albumData.artist}. Genre: ${albumData.genre || 'unknown'}.`;
            let description = await callAI(prompt);
            if (description === 'unknown') {
                showToast('No description found for this album', true);
                return;
            }
            setField('funfact', description);
            showToast('Description generated successfully');
        }
        catch (error) {
            console.error('Error generating description:', error);
            showToast('Error generating description', true);
        }
        finally {
            generateDescriptionButton.removeAttribute('disabled');
            generateDescriptionButton.html('Generate description');
        }
    });
}


function setField(fieldName, value) {
    if (!App.doc) return;
    App.doc.album[fieldName] = value;
    App.changed({ what: 'album' });
}
