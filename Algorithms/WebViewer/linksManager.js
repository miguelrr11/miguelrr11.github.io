//function that preserves only the last portion of a link (so the text following the last /)
function getLastPartOfLink(link) {
    if (link == undefined) return '';
    const parts = link.split('/');
    return parts[parts.length - 1];
}


// Helper function: filters a single link against the target URL criteria.
function filterLink(link, targetUrl, targetHost, targetPath) {
    if (!link) return null;
    let urlObj;
    try {
        // Resolve relative URLs against the targetUrl
        urlObj = new URL(link, targetUrl);
    }
    catch (e) {
        return null; // Skip invalid URLs
    }

    // Skip in-page anchors (links that only reference a section in the same page)
    if (urlObj.pathname === targetPath && urlObj.hash) return null;

    // Exclude paths that indicate templates, files, help, special pages, or Wikipedia meta pages.
    const exclusionRegex = /\/(Template|File|Help|Special|Especial|Wikipedia|Archivo|Ayuda|Categor%C3%ADa|Category|Main_Page|Portal|Discusi%C3%B3n)/i;

    if (exclusionRegex.test(urlObj.pathname)) return null;

    // Skip URLs that point to internal index.php pages
    if (/\/w\/index\.php/i.test(urlObj.pathname)) return null;

    // Skip URLs with query parameters for editing or history actions
    const action = urlObj.searchParams.get('action');
    if (action === 'edit' || action === 'history') return null;

    // Optionally: Keep only links on the same host (e.g. "en.wikipedia.org")
    if (urlObj.host !== targetHost) return null;

    // Normalize the URL by removing any fragment (hash)
    urlObj.hash = '';
    return urlObj.toString();

}

    function getContext(linkNode, wordsBefore = 20, wordsAfter = 50) {
    function isVisibleTextNode(node) {
        return (
            node.nodeType === Node.TEXT_NODE &&
            node.textContent.trim() !== ''
        );
    }

    const walker = document.createTreeWalker(
        linkNode.parentElement,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const styleParent = node.parentElement;
                if (!styleParent) return NodeFilter.FILTER_SKIP;
                const tag = styleParent.tagName.toLowerCase();
                if (['style', 'script', 'noscript'].includes(tag)) return NodeFilter.FILTER_SKIP;
                return isVisibleTextNode(node)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            }
        }
    );

    const textSnippets = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
        textSnippets.push(currentNode.textContent.trim());
        currentNode = walker.nextNode();
    }

    const fullText = textSnippets.join(' ');
    const linkText = linkNode.textContent.trim();
    const allWords = fullText.split(/\s+/);
    const linkWords = linkText.split(/\s+/);

    let idx = allWords.findIndex((w, i) =>
        w === linkWords[0] &&
        allWords.slice(i, i + linkWords.length).join(' ') === linkText
    );

    if (idx >= 0) {
        const start = Math.max(0, idx - wordsBefore);
        const end = Math.min(allWords.length, idx + linkWords.length + wordsAfter);
        const snippetWords = allWords.slice(start, end);
        if (snippetWords.length <= 1) return undefined; // Discard single-word contexts
        const snippet = '...' + snippetWords.join(' ') + '...';
        return snippet;
    }

    return undefined;
}

// Main function: fetches the page, extracts links, and groups them by section title.
// - Starts with a default "Introduction" section for links.
// - When an <h3> is found, a new section is created using the h3 text as the title (if valid category).
// - Links encountered are filtered and added to the latest section, with context snippets.
// - After link extraction, an "Images" section is built by scraping 'a.mw-file-description' anchors:
//   • Finds up to `maxImages` image description anchors in <figure typeof="mw:File/Thumb"> elements
//   • For each, fetches the image's File page, parses it, and extracts the actual image URL from the fullMedia section
//   • Captures the surrounding <figcaption> as the context
//   • Logs all steps via console.log for debugging

async function extractAndFilterLinksCategorized(targetUrl, maxImages = 20, onImagesReady) {
    // Helper to grab a snippet of words around the link text
    try {
        const proxyUrl = `https://corsproxy.io/?url=`;
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const contentType = response.headers.get('Content-Type') || '';
        if (!contentType.includes('text/html')) throw new Error('Expected HTML but got ' + contentType);

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const target = new URL(targetUrl);
        const protoHost = `${target.protocol}//${target.host}`;

        // Link extraction sections
        const sections = [];
        let currentSection = {
            title: 'Introduction',
            links: []
        };
        sections.push(currentSection);
        const nodes = doc.querySelectorAll('h1, h2, h3, a[href]');
        for (const node of nodes) {
            const tag = node.tagName.toLowerCase();
            if (['h1', 'h2', 'h3'].includes(tag)) {
                const title = node.textContent.trim();
                currentSection = isCategory(title) ?
                    (sections[sections.push({
                        title,
                        links: []
                    }) - 1]) :
                    undefined;
            }
            else if (tag === 'a' && currentSection) {
                const href = node.getAttribute('href');
                const filtered = filterLink(href, targetUrl, target.host, target.pathname);
                if (filtered && !currentSection.links.some(l => l.url === filtered)) {
                    let context = getContext(node, 10, 20)
                    if (context) context = context.replace(/\[[^\]]*]/g, "")
                    currentSection.links.push({
                        url: filtered,
                        context
                    });
                }
            }
        }

        // Images section scraping 'a.mw-file-description'
        const imagesSection = {
            title: 'Images',
            links: []
        };

        extractImagesFast(targetUrl, maxImages)
        .then(imageLinks => {
            if (imageLinks.length) {
                const imgSection = { title: 'Images', links: imageLinks };
                sections.push(imgSection);

                // 2) notify the caller that images are ready
                if (typeof onImagesReady === 'function') {
                    onImagesReady(imgSection, sections);
                }
            }
        })
        .catch(err => console.error('Image scraping failed:', err));


        //if (imagesSection.links.length) sections.push(imagesSection);
        return sections.filter(sec => sec.links.length > 0);

    }
    catch (error) {
        throw new Error(error.message || 'Error extracting links and images');
    }
}


async function extractImagesFast(targetUrl, maxImages = 2) {
    const proxy = url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    const html = await fetch(proxy(targetUrl)).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // 1) Gather file titles from the page
    const anchors = Array.from(
        doc.querySelectorAll('figure[typeof="mw:File/Thumb"] a.mw-file-description')
    ).slice(0, maxImages);
    const titles = anchors
        .map(a => a.getAttribute('href'))
        .filter(h => h?.startsWith('/wiki/File:'))
        .map(h => decodeURIComponent(h.replace('/wiki/', '')));

    // 2) Batch-fetch real URLs via API
    const imageUrls = await fetchImageUrls(titles, maxImages);

    // 3) Extract captions from the original DOM (no extra fetch!)
    const captions = anchors.map(a =>
        a.closest('figure')?.querySelector('figcaption')?.textContent.trim() || ''
    );

    return imageUrls.map((url, i) => ({
        url,
        context: captions[i]
    }));
}

async function fetchImageUrls(fileTitles, maxImages = 2) {
    const proxy = url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    // MediaWiki limits ~50 titles per call
    const chunkSize = 50;
    const urls = [];
    for (let i = 0; i < fileTitles.length && urls.length < maxImages; i += chunkSize) {
        const chunk = fileTitles.slice(i, i + chunkSize);
        const apiUrl = `https://en.wikipedia.org/w/api.php` +
            `?action=query&titles=${chunk.map(encodeURIComponent).join('|')}` +
            `&prop=imageinfo&iiprop=url&format=json&origin=*`;
        const res = await fetch(proxy(apiUrl));
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        for (const page of Object.values(data.query.pages)) {
            if (page.imageinfo && page.imageinfo[0].url) {
                urls.push(page.imageinfo[0].url);
                if (urls.length >= maxImages) break;
            }
        }
    }
    console.log('Fetched image URLs:', urls);
    return urls;
}

function isCategory(str) {
    let notCategories = [
        'Contenidos',
        'Contents',
        'External links',
        'References',
        'Enlaces externos',
        'Referencias',
        'See also',
        'Véase también',
        'Related articles',
        'Artículos relacionados',
        'Further reading',
        'Lectura adicional',
        'Bibliography',
        'Bibliografía',
        'Sources',
        'Fuentes',
        'Citations',
        'Citas',
        'Notes',
        'Notas',
        'Notes and references',
        'Notas y referencias',
        'Further information',
        'Información adicional',
        'Related topics',
        'Temas relacionados',
        'Related links',
        'Enlaces relacionados',
        'Related articles',
        'Artículos relacionados',
        'Related content',
        'Contenido relacionado',
        'Main page',
        'Página principal',
        'General and cited references',
        'Referencias generales y citadas',
        'Talk'
    ]
    for (let cat of notCategories) {
        if (cat == str) return false
    }
    return true
}