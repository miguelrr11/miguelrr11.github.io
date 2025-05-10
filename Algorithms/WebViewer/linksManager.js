//function that preserves only the last portion of a link (so the text following the last /)
function getLastPartOfLink(link) {
    if(link == undefined) return '';
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


// Main function: fetches the page, extracts links, and groups them by section title.
// The grouping is based on encountering <h3> tags in document order.
// - Starts with a default "Introduction" section.
// - When an <h3> is found, a new section is created using the h3 text as the title.
// - Links encountered are filtered and added to the latest section.
// Main function: fetches the page, extracts links, and groups them by section title,
// now returning objects with both the URL and a text snippet around the link.
async function extractAndFilterLinksCategorized(targetUrl) {
  // Helper to grab a snippet of words around the link text
  function getContext(node, wordsBefore = 20, wordsAfter = 50) {
    const parentText = node.parentElement?.textContent || '';
    const baseText = parentText.trim();
    const allWords = baseText.split(/\s+/);
    const linkText = node.textContent.trim();
    const linkWords = linkText.split(/\s+/);
  
    // Helper to clean ellipses and compare
    const isOnlyLink = snippet =>
      snippet.replace(/\.\.\./g, '').trim() === linkText;
  
    // 1) Exact-sequence pass
    let idx = allWords.findIndex((w, i) =>
      w === linkWords[0] &&
      allWords.slice(i, i + linkWords.length).join(' ') === linkText
    );
    if (idx >= 0) {
      const start = Math.max(0, idx - wordsBefore);
      const end = Math.min(allWords.length, idx + linkWords.length + wordsAfter);
      const snippet = '...' + allWords.slice(start, end).join(' ') + '...';
      return isOnlyLink(snippet) ? undefined : snippet;
    }
  
    // 2) Raw-text pass
    const pos = baseText.indexOf(linkText);
    if (pos >= 0) {
      const preWords = baseText.slice(0, pos).trim().split(/\s+/);
      const postWords = baseText.slice(pos + linkText.length).trim().split(/\s+/);
      const startWords = preWords.slice(-wordsBefore);
      const endWords = postWords.slice(0, wordsAfter);
      const snippet = '...' + [...startWords, ...linkWords, ...endWords].join(' ') + '...';
      return isOnlyLink(snippet) ? undefined : snippet;
    }
  
    // 3) If we can’t find any context, give up
    return undefined;
  }
  
  
  

  try {
    const proxyUrl = `https://corsproxy.io/?url=`;
    const url = encodeURIComponent(targetUrl);
    const response = await fetch(proxyUrl + url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('Expected HTML response but got ' + contentType);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const target = new URL(targetUrl);
    const targetHost = target.host;
    const targetPath = target.pathname;

    // Start with an "Introduction" section
    const sections = [];
    let currentSection = { title: "Introduction", links: [] };
    sections.push(currentSection);

    // Walk through headings and links in document order
    const nodes = doc.querySelectorAll('h1, h2, h3, a[href]');
    for (const node of nodes) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const title = node.textContent.trim();
        if (isCategory(title)) {
          currentSection = { title, links: [] };
          sections.push(currentSection);
        } else {
          currentSection = undefined; // ignore links until next valid heading
        }
      } else if (tag === 'a' && currentSection) {
        const href = node.getAttribute('href');
        const filteredLink = filterLink(href, targetUrl, targetHost, targetPath);
        // only add each URL once per section
        if (filteredLink && !currentSection.links.some(l => l.url === filteredLink)) {
          const context = getContext(node, 10, 20);
          currentSection.links.push({ url: filteredLink, context });
        }
      }
    }

    // Return only sections that actually have links
    console.log(sections.filter(section => section.links.length > 0))
    return sections.filter(section => section.links.length > 0);
  } catch (error) {
    throw new Error(error.message || 'Error extracting links');
  }
}


function isCategory(str){
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
    'Referencias generales y citadas'
  ]
  for(let cat of notCategories){
    if(cat == str) return false
  }
  return true
}
