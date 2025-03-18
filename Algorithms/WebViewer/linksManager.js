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
  } catch (e) {
    return null; // Skip invalid URLs
  }

  // Skip in-page anchors (links that only reference a section in the same page)
  if (urlObj.pathname === targetPath && urlObj.hash) return null;

  // Exclude paths that indicate templates, files, help, special pages, or Wikipedia meta pages.
  const exclusionRegex = /\/(Template|File|Help|Special|Especial|Wikipedia|Archivo|Ayuda|Categor%C3%ADa|Category|Portal|Discusi%C3%B3n):/i;
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
async function extractAndFilterLinksCategorized(targetUrl) {
  try {
    const proxyUrl = `https://corsproxy.io/?url=`;
    //const proxyUrl = `https://api.cors.lol/?url=`;
    //const proxyUrl = `https://api.allorigins.win/get?url=`;
    const url = encodeURIComponent(targetUrl);
    const response = await fetch(proxyUrl + url);

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('Expected HTML response but got ' + contentType);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Determine target host and path for filtering purposes
    const target = new URL(targetUrl);
    const targetHost = target.host;
    const targetPath = target.pathname;

    // Start with an "Introduction" section
    const sections = [];
    let currentSection = { title: "Introduction", links: [] };
    sections.push(currentSection);

    // Select all h3 and h2 and anchor elements in document order
    const nodes = doc.querySelectorAll('h3, a[href], h2');
    nodes.forEach(node => {
      let tagName = node.tagName.toLowerCase()
      if (tagName === 'h3' || tagName == 'h2') {
        const title = node.textContent.trim();
        if(isCategory(title)){
          currentSection = { title: title, links: [] };
          sections.push(currentSection);
        }
        
      } else if (tagName === 'a') {
        // Process anchor tags
        const href = node.getAttribute('href');
        const filteredLink = filterLink(href, targetUrl, targetHost, targetPath);
        // Only add the link if it passes the filter and isn't already added to the current section
        if (filteredLink && !currentSection.links.includes(filteredLink)) {
          currentSection.links.push(filteredLink);
        }
      }
    });

    return sections.filter(section => section.links.length > 0);
  } 
  catch (error) {
    throw new Error()
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
  ]
  for(let cat of notCategories){
    if(cat == str) return false
  }
  return true
}
