// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getNewsContent") {
    // Here you would implement the logic to extract news content
    const newsContent = extractNewsContent();
    sendResponse({ content: newsContent });
  } else if (request.action === "updateBackground") {
    updateSidebarContent(request.backgroundInfo);
  }
});

function extractNewsContent() {
  // This is a basic implementation. You might want to customize this based on the news sites you want to support
  const article = document.querySelector('article');
  if (!article) return null;

  const title = document.querySelector('h1')?.textContent || '';
  const paragraphs = Array.from(article.querySelectorAll('p'))
    .map(p => p.textContent)
    .join('\n');

  return {
    title,
    content: paragraphs
  };
}

// Function to update the sidebar content
function updateSidebarContent(backgroundInfo) {
  const sidebar = document.getElementById('news-background-sidebar');
  if (!sidebar) return;

  const contentDiv = sidebar.querySelector('#background-content');
  if (contentDiv) {
    contentDiv.innerHTML = `
      <div class="background-section">
        <h3>Background Information</h3>
        <div class="background-content">
          ${backgroundInfo.split('\n').map(paragraph => 
            `<p>${paragraph}</p>`
          ).join('')}
        </div>
      </div>
    `;
  }
}