const API_URL = 'http://localhost:8000';
let pageData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const statusDot = document.getElementById('status-dot');
  const statusLabel = document.getElementById('status-label');
  const statusMode = document.getElementById('status-mode');
  const pageTitle = document.getElementById('page-title');
  const pageUrl = document.getElementById('page-url');
  const pageDomain = document.getElementById('page-domain');
  const contentPreview = document.getElementById('content-preview');
  const btnSave = document.getElementById('btn-save');
  const btnSaveAsk = document.getElementById('btn-save-ask');
  const btnCancel = document.getElementById('btn-cancel');
  const projectSelect = document.getElementById('project-select');

  // Check backend health
  try {
    const resp = await fetch(`${API_URL}/api/health`);
    const data = await resp.json();
    statusDot.classList.add('connected');
    statusLabel.textContent = 'Connected';
    statusMode.textContent = data.mode || 'local';
    btnSave.disabled = false;
    btnSaveAsk.disabled = false;
  } catch (e) {
    statusDot.classList.add('disconnected');
    statusLabel.textContent = 'Disconnected';
    statusMode.textContent = 'Start backend first';
  }

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  pageTitle.textContent = tab.title || 'Untitled';
  pageUrl.textContent = tab.url || '';
  try {
    const url = new URL(tab.url);
    pageDomain.textContent = url.hostname;
  } catch (e) {
    pageDomain.textContent = '';
  }

  // Get page content from content script
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
    if (response && response.content) {
      const preview = response.content.substring(0, 500);
      const lines = preview.split('\n').filter(l => l.trim()).slice(0, 5);
      contentPreview.innerHTML = lines.map(l => `<p>${escapeHtml(l.trim())}</p>`).join('');
      pageData = {
        url: tab.url,
        title: tab.title,
        domain: pageDomain.textContent,
        content: response.content,
        timestamp: new Date().toISOString()
      };
    } else {
      contentPreview.innerHTML = '<p style="color: #6b7b8d;">No readable content available</p>';
      pageData = {
        url: tab.url,
        title: tab.title,
        domain: pageDomain.textContent,
        content: `Page: ${tab.title}\nURL: ${tab.url}`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (e) {
    contentPreview.innerHTML = '<p style="color: #6b7b8d;">Cannot access page content</p>';
    pageData = {
      url: tab.url,
      title: tab.title,
      domain: pageDomain.textContent,
      content: `Page: ${tab.title}\nURL: ${tab.url}`,
      timestamp: new Date().toISOString()
    };
  }

  // Save Context
  btnSave.addEventListener('click', async () => {
    if (!pageData) return;
    await saveContext(false);
  });

  // Save + Ask
  btnSaveAsk.addEventListener('click', async () => {
    if (!pageData) return;
    await saveContext(true);
  });

  // Cancel
  btnCancel.addEventListener('click', () => {
    window.close();
  });

  async function saveContext(openDashboard) {
    const project = projectSelect.value;
    const toast = document.getElementById('toast');

    btnSave.disabled = true;
    btnSave.innerHTML = '<span class="spinner"></span>Saving...';
    btnSaveAsk.disabled = true;

    try {
      const text = `# ${pageData.title}\n\nSource: ${pageData.url}\nDomain: ${pageData.domain}\nCaptured: ${pageData.timestamp}\n\n${pageData.content}`;

      const resp = await fetch(`${API_URL}/api/ingest/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pageData.title,
          text: text,
          source_type: 'url',
          project: project
        })
      });

      const data = await resp.json();

      if (resp.ok) {
        toast.textContent = data.is_duplicate
          ? 'Already captured (duplicate detected)'
          : 'Context saved successfully';
        toast.className = 'toast success show';
        setTimeout(() => { toast.className = 'toast'; }, 2000);

        if (openDashboard) {
          const query = encodeURIComponent(`What is this page about? ${pageData.title}`);
          chrome.tabs.create({ url: `http://localhost:3000?q=${query}` });
        }
        setTimeout(() => window.close(), 1200);
      } else {
        throw new Error(data.detail || 'Save failed');
      }
    } catch (e) {
      toast.textContent = `Error: ${e.message}`;
      toast.className = 'toast error show';
      setTimeout(() => { toast.className = 'toast'; }, 3000);
      btnSave.disabled = false;
      btnSave.innerHTML = 'Save Context';
      btnSaveAsk.disabled = false;
    }
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
