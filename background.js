// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // Initialize storage with empty API key
  chrome.storage.sync.set({ 'gemini_api_key': '' });
});

// Function to process news content and get background information
async function processNewsContent(content) {
  try {
    const apiKeyData = await chrome.storage.sync.get('gemini_api_key');
    const apiKey = apiKeyData.gemini_api_key;
    if (!apiKey) {
      return 'Please set your Gemini API key in the extension popup settings.';
    }

    const prompt = `
      Please provide background information and context for the following news article.
      Focus on key historical events, related topics, and important context that would help readers better understand the news.
      
      Title: ${content.title}
      
      Content: ${content.content}
      
      Provide the background information in a clear, concise format.
    `;

    const geminiRequestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiRequestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API request failed:', errorData);
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid response structure from Gemini API:', data);
      return 'Error processing response from Gemini API. Please check the console for details.';
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error fetching background information:', error);
    return 'Error fetching background information. Please try again later. Check the console for more details.';
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
    chrome.storage.sync.set({ 'gemini_api_key': request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});