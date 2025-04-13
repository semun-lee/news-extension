// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // Initialize storage with empty API key
  chrome.storage.sync.set({ 'openai_api_key': '' });
});

// Function to process news content and get background information
async function processNewsContent(content) {
  try {
    const apiKey = await chrome.storage.sync.get('openai_api_key');
    if (!apiKey.openai_api_key) {
      return 'Please set your OpenAI API key in the extension popup settings.';
    }

    const prompt = `
      Please provide background information and context for the following news article.
      Focus on key historical events, related topics, and important context that would help readers better understand the news.
      
      Title: ${content.title}
      
      Content: ${content.content}
      
      Provide the background information in a clear, concise format.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.openai_api_key}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides background information and context for news articles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching background information:', error);
    return 'Error fetching background information. Please try again later.';
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getBackgroundInfo") {
    processNewsContent(request.content)
      .then(backgroundInfo => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "updateBackground",
          backgroundInfo: backgroundInfo
        });
      });
  } else if (request.action === "setApiKey") {
    chrome.storage.sync.set({ 'openai_api_key': request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});