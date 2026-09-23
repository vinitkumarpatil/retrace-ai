// Content script - runs in the context of web pages
// Extracts readable content from the current page

(() => {
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      const content = extractPageContent();
      sendResponse({ content });
    }
    return true;
  });

  function extractPageContent() {
    // Remove non-content elements
    const removeSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.sidebar', '.menu', '.navigation',
      '.cookie-banner', '.cookie-consent',
      '.modal', '.overlay', '.popup',
      'script', 'style', 'noscript',
      'iframe', 'svg', 'canvas',
      '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]'
    ];

    const clone = document.body.cloneNode(true);
    removeSelectors.forEach(sel => {
      clone.querySelectorAll(sel).forEach(el => el.remove());
    });

    // Try to find main content
    const mainContent =
      clone.querySelector('article') ||
      clone.querySelector('main') ||
      clone.querySelector('[role="main"]') ||
      clone.querySelector('.content') ||
      clone.querySelector('.post') ||
      clone.querySelector('.article') ||
      clone.body;

    if (!mainContent) return '';

    // Extract text with structure
    const lines = [];
    const walker = document.createTreeWalker(
      mainContent,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text && text.length > 2) return NodeFilter.FILTER_ACCEPT;
          }
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = node.tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            if (tag === 'p' || tag === 'li' || tag === 'pre' || tag === 'code') {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let currentSection = '';
    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag.startsWith('h') && tag.length === 2) {
          const level = tag[1];
          const prefix = '#'.repeat(parseInt(level));
          currentSection = `\n${prefix} `;
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          lines.push(currentSection + text);
          currentSection = '';
        }
      }
    }

    // Deduplicate consecutive identical lines
    const deduped = lines.filter((line, i) => i === 0 || line !== lines[i - 1]);
    return deduped.join('\n').substring(0, 50000); // Limit to 50KB
  }
})();
