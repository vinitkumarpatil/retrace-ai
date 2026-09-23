// Background service worker for ReTrace extension

const API_URL = 'http://localhost:8000';

// Check backend health on install
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const resp = await fetch(`${API_URL}/api/health`);
    const data = await resp.json();
    console.log('ReTrace backend connected:', data);
  } catch (e) {
    console.warn('ReTrace backend not available:', e.message);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkHealth') {
    fetch(`${API_URL}/api/health`)
      .then(r => r.json())
      .then(data => sendResponse({ connected: true, data }))
      .catch(() => sendResponse({ connected: false }));
    return true;
  }

  if (request.action === 'saveContext') {
    const { title, url, domain, content, project } = request.data;
    const text = `# ${title}\n\nSource: ${url}\nDomain: ${domain}\nCaptured: ${new Date().toISOString()}\n\n${content}`;

    fetch(`${API_URL}/api/ingest/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        text,
        source_type: 'url',
        project: project || 'default'
      })
    })
      .then(r => r.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
});
