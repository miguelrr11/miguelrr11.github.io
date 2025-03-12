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
        // Resolve relative URLs against the targetUrl
        urlObj = new URL(link, targetUrl);
      } catch (e) {
        // Skip invalid URLs
        return;
      }
  
      // Skip in-page anchor links that reference the same page
      if (urlObj.pathname === targetPath && urlObj.hash) {
        return;
      }
  
      // Skip links that point to navigation/boilerplate pages.
      // This covers Spanish-specific prefixes like "Especial:", "Ayuda:", "Portal:", "Discusión:", and "Archivo:".
      // You can add or remove prefixes as needed.
      const navRegex = /\/(Especial|Wikipedia|Ayuda|Portal|Discusi[oó]n|Archivo):/i;
      if (navRegex.test(urlObj.pathname)) {
        return;
      }
  
      // Skip URLs with query parameters for editing or history actions
      const action = urlObj.searchParams.get('action');
      if (action === 'edit' || action === 'history') {
        return;
      }
  
      // Optional: Keep only links on the same host (e.g. "es.wikipedia.org")
      if (urlObj.host !== targetHost) {
        return;
      }
  
      // Normalize the URL by stripping the fragment (if you don't care about it)
      urlObj.hash = '';
      filtered.add(urlObj.toString());
    });
  
    return Array.from(filtered);
  }
  
  // Example usage:
  async function extractAndFilterLinks(targetUrl) {
    try {
      const proxyUrl = `http://localhost:3000/?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(proxyUrl);
      const html = await response.text();
  
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // Using getAttribute so the base URL doesn't resolve relative URLs automatically
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
  