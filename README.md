# News Background Knowledge Extension

A Chrome extension that provides additional background knowledge and context for news articles you're reading.

## Features

- Analyzes news articles in real-time
- Provides relevant background information using OpenAI's API
- Easy-to-use sidebar interface
- Secure API key management

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Setup

1. Get an API key from OpenAI
2. Click on the extension icon in Chrome
3. Enter your OpenAI API key in the popup
4. Click "Save API Key"

## Development

To modify the extension:

1. Make your changes to the source files
2. Reload the extension in Chrome
3. Test your changes

## Files

- `manifest.json`: Extension configuration
- `popup.html/js`: Extension popup interface
- `content.js`: Content script for webpage interaction
- `background.js`: Background script for extension
- `styles.css`: Styling for the extension

## Security

Your OpenAI API key is stored securely in Chrome's storage and is never shared with any third parties.

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License