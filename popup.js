// Load saved API key when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('openai_api_key', (data) => {
    if (data.openai_api_key) {
      document.getElementById('apiKey').value = data.openai_api_key;
    }
  });
});

// Handle API key saving
document.getElementById('saveApiKey').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value.trim();
  const statusMessage = document.getElementById('statusMessage');

  if (!apiKey) {
    showStatus('Please enter an API key', false);
    return;
  }

  chrome.runtime.sendMessage(
    { action: 'setApiKey', apiKey: apiKey },
    (response) => {
      if (response.success) {
        showStatus('API key saved successfully!', true);
      } else {
        showStatus('Failed to save API key', false);
      }
    }
  );
});

function showStatus(message, isSuccess) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.style.display = 'block';
  statusMessage.className = 'status-message ' + (isSuccess ? 'success' : 'error');
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

// Toggle sidebar functionality
document.getElementById('toggleSidebar').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // First, get the news content
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const article = document.querySelector('article');
      if (!article) {
        return null;
      }

      const title = document.querySelector('h1')?.textContent || '';
      const paragraphs = Array.from(article.querySelectorAll('p'))
        .map(p => p.textContent)
        .join('\n');

      return {
        title,
        content: paragraphs
      };
    }
  }, (results) => {
    const newsContent = results[0].result;
    if (!newsContent) {
      showStatus('No news article found on this page', false);
      return;
    }

    // Send the content to background script for processing
    chrome.runtime.sendMessage(
      { action: 'getBackgroundInfo', content: newsContent }
    );

    // Show the sidebar
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: toggleSidebar
    });
  });
});

function toggleSidebar() {
  const sidebarId = 'news-background-sidebar';
  let sidebar = document.getElementById(sidebarId);
  
  if (sidebar) {
    sidebar.remove();
  } else {
    sidebar = document.createElement('div');
    sidebar.id = sidebarId;
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: white;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
      z-index: 10000;
      padding: 20px;
      overflow-y: auto;
    `;
    
    sidebar.innerHTML = `
      <h2>News Background</h2>
      <div id="background-content">
        <p>Loading background information...</p>
      </div>
    `;
    document.body.appendChild(sidebar);
  }
}