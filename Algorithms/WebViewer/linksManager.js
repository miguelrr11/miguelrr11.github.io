/**
 * Filter an array of URLs based on heuristics:
 * - Remove same-page anchors
 * - Remove Wikipedia navigation/boilerplate pages
 * - Remove edit/history links
 * - Keep only URLs from the same host as targetUrl
 *
 * @param {string[]} links - Array of URL strings.
 * @param {string} targetUrl - The URL of the page you originally fetched.
 * @returns {string[]} - The filtered array of URLs.
 */

function filterLinks(links, targetUrl) {
  const filtered = new Set();
  const target = new URL(targetUrl);
  const targetHost = target.host;
  const targetPath = target.pathname;

  links.forEach(link => {
    if (!link) return;

    let urlObj;
    try {
      // Resolve relative URLs against the original target
      urlObj = new URL(link, targetUrl);
    } catch (e) {
      return; // Skip invalid URLs
    }

    // Skip in-page anchors (links that only reference a section in the same page)
    if (urlObj.pathname === targetPath && urlObj.hash) return;

    // Exclude paths that indicate templates, files, help, special pages, or Wikipedia meta pages.
    // This regex now covers prefixes like "Template:", "File:", "Help:", "Special:", "Especial:", and "Wikipedia:".
    const exclusionRegex = /\/(Template|File|Help|Special|Especial|Wikipedia):/i;
    if (exclusionRegex.test(urlObj.pathname)) return;

    // Skip URLs that point to internal index.php pages
    if (/\/w\/index\.php/i.test(urlObj.pathname)) return;

    // Skip URLs with query parameters for editing or history actions
    const action = urlObj.searchParams.get('action');
    if (action === 'edit' || action === 'history') return;

    // Optionally: Keep only links on the same host (e.g. "en.wikipedia.org" or "es.wikipedia.org")
    if (urlObj.host !== targetHost) return;

    // Normalize the URL by removing any fragment (hash)
    urlObj.hash = '';
    filtered.add(urlObj.toString());
  });

  return Array.from(filtered);
}


  
async function extractAndFilterLinks(targetUrl) {
  try {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    console.log('Fetching from proxy:', proxyUrl);
    const response = await fetch(proxyUrl);
    
    // Check the content type to ensure it's HTML and not JSON
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('Expected HTML response but got ' + contentType);
    }

    const html = await response.text();  // Use text() instead of json()
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract links using getAttribute to avoid auto-resolving relative URLs
    const anchors = Array.from(doc.querySelectorAll('a[href]')).map(anchor =>
      anchor.getAttribute('href')
    );

    const filteredLinks = filterLinks(anchors, targetUrl);
    return filteredLinks;
  } catch (error) {
    console.error('Error fetching or processing the URL:', error);
    return [];
  }
}

  
  

//function that preserves only the last portion of a link (so the text following the last /)
function getLastPartOfLink(link) {
    if(link == undefined) return '';
    const parts = link.split('/');
    return parts[parts.length - 1];
}
  