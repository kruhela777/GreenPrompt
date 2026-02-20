<div align="center">

# 🌱 Green Prompt

### Privacy-First DeepSeek Chat Storage & Exporter

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=google-chrome)](https://chrome.google.com/webstore/detail/deepseek-chat-exporter/mgmakgggdndagmammflkidclcckiijmk)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/ypyf/deepseek-chat-exporter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Privacy First](https://img.shields.io/badge/Privacy-First-brightgreen.svg)](PRIVACY.md)

**A privacy-first Chrome extension that automatically stores your DeepSeek chat conversations locally in real-time with zero network requests.**

[Installation](#installation) • [Features](#features) • [Usage](#usage) • [Privacy](#privacy--security) • [Documentation](#documentation)

</div>

---

## 🔒 Privacy First

Your data, your device, your control. **Period.**

| Feature | Status | Description |
|---------|--------|-------------|
| **100% Local Storage** | ✅ | All data stored in your browser's IndexedDB |
| **Zero Network Requests** | ✅ | No external connections or API calls |
| **No Permissions** | ✅ | Only uses `activeTab` permission |
| **No Data Collection** | ✅ | We cannot access your data |
| **Open Source** | ✅ | Fully auditable code |
| **No Dependencies** | ✅ | No third-party code or CDN requests |

📖 **[Read Full Privacy Policy](PRIVACY.md)**

---

## ✨ Features

### Core Functionality

- 🔄 **Real-time Auto-Save**: Automatically captures and stores all messages as you chat
- 💾 **IndexedDB Storage**: High-performance, inspectable local database
- 🔐 **Persistent & Private**: All conversations saved locally in your browser
- 📊 **Storage Statistics**: View total chats and messages stored
- 🎯 **Zero Permissions**: Most private extension possible

### Export Formats

Export your conversations in multiple formats with a single click:

| Format | Icon | Use Case |
|--------|------|----------|
| **JSON** | 📄 | Structured data for programmatic use |
| **Markdown** | 📝 | Readable format with code blocks |
| **HTML** | 🌐 | Styled format with light/dark mode |
| **Plain Text** | 📃 | Maximum compatibility |
| **Clipboard** | 📋 | Quick copy & paste |

### User Interface

- 🎨 Beautiful popup with dark green gradient theme
- 📈 Real-time statistics display
- 🔽 Dropdown export menu on chat page
- 🌍 Multi-language support (English, Chinese Simplified, Chinese Traditional, Russian)

---

## 📦 Installation

### Option 2: Install from Source

Perfect for developers or if you want to inspect the code:

```bash
# Clone the repository
git clone https://github.com/AstroIshu/GreenPrompt
cd MONITOR
```

Then in Chrome:

1. Open `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `MONITOR` directory
5. ✅ Extension installed!

📖 **[Quick Start Guide](QUICKSTART.md)** for detailed testing instructions

---

## 🚀 Usage

### Basic Workflow

1. **Visit DeepSeek Chat**
   - Navigate to [chat.deepseek.com](https://chat.deepseek.com)
   - Extension automatically activates

2. **Start Chatting**
   - Messages are captured in real-time
   - No manual action needed
   - All data stored locally

3. **View Statistics**
   - Click the 🌱 extension icon
   - See total chats and messages
   - Monitor storage usage

4. **Export Conversations**
   - Click **"Export Chat"** button on page
   - Select your preferred format
   - File downloads automatically

### Extension Popup

```
┌─────────────────────────────────────┐
│          🌱 Green Prompt            │
│   Privacy-First Chat Storage        │
├─────────────────────────────────────┤
│ 📊 Storage Statistics               │
│                                     │
│  Total Chats: 15    Messages: 342   │
│  Size: 2.4 MB       Active: Yes     │
│                                     │
│ [Export JSON] [Export Markdown]     │
│ [Export HTML] [Export Text]         │
│                                     │
│ 🔒 All data stored locally          │
└─────────────────────────────────────┘
```

---

## 🏗️ How It Works

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   DeepSeek Chat Page                     │
│                                                          │
│  ┌────────────────┐        ┌──────────────────┐        │
│  │  Chat Messages │ ────→  │  MutationObserver│        │
│  │   (DOM Tree)   │        │   (Real-time)    │        │
│  └────────────────┘        └─────────┬────────┘        │
│                                      │                  │
│                                      ▼                  │
│                            ┌──────────────────┐         │
│                            │  Content Script  │         │
│                            │  (Extract Data)  │         │
│                            └─────────┬────────┘         │
│                                      │                  │
│                                      ▼                  │
│                            ┌──────────────────┐         │
│                            │   database.js    │         │
│                            │  (Save to DB)    │         │
│                            └─────────┬────────┘         │
│                                      │                  │
│                                      ▼                  │
│                            ┌──────────────────┐         │
│                            │    IndexedDB     │         │
│                            │ DeepSeekChatDB   │         │
│                            └──────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### Database Structure

**Database Name**: `DeepSeekChatDB`

#### Object Store: `chats`
```javascript
{
  chatId: "abc-123-def-456",          // Unique chat identifier
  title: "Discussion about AI",       // Chat title
  url: "https://chat.deepseek.com/...",
  lastUpdated: "2026-02-17T12:34:56.789Z",
  messageCount: 15,
  firstMessage: "2026-02-17T10:00:00.000Z"
}
```

#### Object Store: `messages`
```javascript
{
  id: 1,                                    // Auto-increment ID
  chatId: "abc-123-def-456",               // Foreign key to chats
  role: "user" | "assistant",              // Message role
  content: "Message content in markdown",
  chain_of_thought: "AI thinking process", // Optional
  element_id: "user-0-1234567890",        // DOM element ID
  timestamp: "2026-02-17T10:00:00.000Z"
}
```

#### Indexes
- `chatId`: Fast lookup by conversation
- `timestamp`: Chronological sorting
- `element_id`: Duplicate detection

### Real-time Monitoring Process

1. **Page Load**: Extension detects DeepSeek chat page
2. **Observer Setup**: MutationObserver monitors DOM changes
3. **Message Detection**: New messages trigger extraction
4. **Data Processing**: Content, metadata, and timestamps extracted
5. **Database Storage**: Messages saved to IndexedDB
6. **Instant Export**: Data available without page re-scraping

#### Benefits
- ✅ No messages lost (even during page refresh)
- ✅ Faster export (no DOM traversal needed)
- ✅ Consistent data structure
- ✅ Works offline
- ✅ Inspectable in DevTools

---

## 🗂️ Data Management

### Viewing Your Data

#### Method 1: Chrome DevTools (Recommended)
1. Open DevTools (`F12`) on chat.deepseek.com
2. Navigate to **Application** tab
3. Select **Storage** → **IndexedDB** → **DeepSeekChatDB**
4. Expand to see:
   - `chats` store (metadata)
   - `messages` store (all messages)
5. Click any entry to view, edit, or delete

#### Method 2: Console API
```javascript
// Get statistics
chatDB.getStats().then(stats => {
  console.log(`Chats: ${stats.totalChats}, Messages: ${stats.totalMessages}`);
});

// Get current chat
chatDB.getChatData().then(data => {
  console.log(data);
});

// Get all chats
chatDB.getAllChats().then(chats => {
  console.log(chats);
});

// Export everything
chatDB.exportDatabase().then(data => {
  console.log(JSON.stringify(data, null, 2));
});
```

### Clearing Data

#### Option 1: Chrome Settings
1. Open `chrome://settings/siteData`
2. Search for **"chat.deepseek.com"**
3. Click **"Remove"**

#### Option 2: DevTools Console
```javascript
indexedDB.deleteDatabase('DeepSeekChatDB');
```

#### Option 3: Extension Popup
1. Click extension icon
2. Navigate to settings (if available)
3. Click "Clear All Data"

---

## 🔐 Privacy & Security

### What Data is Stored?

| Data Type | Details | Purpose |
|-----------|---------|---------|
| Chat messages | User questions, AI responses | Conversation export |
| Thinking process | Chain-of-thought (if enabled) | Full context capture |
| Chat metadata | Title, URL, timestamps | Organization |
| Message order | Sequence and relationships | Correct export order |

### Where is Data Stored?

- **Storage Type**: IndexedDB
- **Origin Scope**: `chat.deepseek.com`
- **Physical Location**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\IndexedDB\`
- **Access Control**: Only you, through your browser
- **Cloud Sync**: **NEVER** - data stays local

### What We DON'T Do

| ❌ We DO NOT | Description |
|--------------|-------------|
| Cloud storage | No remote servers |
| Network requests | Zero external connections |
| Analytics | No tracking or telemetry |
| User tracking | No behavioral monitoring |
| Data collection | We can't see your data |
| Third-party services | No external dependencies |
| Automatic uploads | All data stays local |

**Complete Privacy**: Your conversations never leave your browser.

📖 **[Full Privacy Policy](PRIVACY.md)**

---

## 🛠️ Development

### Project Structure

```
MONITOR/
├── manifest.json           # Extension configuration
├── background.js           # Service worker
├── content.js             # Main content script (1544 lines)
├── database.js            # IndexedDB operations
├── utils.js               # Utility functions
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── styles.css             # Chat page styles
├── _locales/              # Internationalization
│   ├── en/
│   ├── ru/
│   ├── zh_CN/
│   └── zh_TW/
├── icons/                 # Extension icons
├── README.md              # This file
├── QUICKSTART.md          # Quick start guide
├── PRIVACY.md             # Privacy policy
├── TESTING.md             # Testing guide
├── AGENTS.md              # Development notes
├── jest.config.js         # Jest configuration
└── package.json           # NPM dependencies
```

### Tech Stack

- **Manifest Version**: 3
- **Storage**: IndexedDB
- **Languages**: JavaScript (ES6+), HTML5, CSS3
- **Testing**: Jest
- **Permissions**: `activeTab` only

### Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

📖 **[Testing Guide](TESTING.md)** for comprehensive testing instructions

### Building

No build process required! This is a pure vanilla JavaScript extension.

To prepare for distribution:

1. Update version in `manifest.json` and `popup.html`
2. Test thoroughly using [TESTING.md](TESTING.md)
3. Zip the directory (excluding `.git`, `node_modules`, tests)

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code style (see [AGENTS.md](AGENTS.md))
4. Test thoroughly
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 🌍 Internationalization

Supported languages:

- 🇺🇸 **English** (`en`)
- 🇨🇳 **简体中文** (`zh_CN`) - Default
- 🇹🇼 **繁體中文** (`zh_TW`)
- 🇷🇺 **Русский** (`ru`)

Language is automatically detected from browser settings.

---

## 🐛 Troubleshooting

### Extension Not Working

**Problem**: Extension doesn't activate on DeepSeek chat page

**Solutions**:
1. Verify you're on `https://chat.deepseek.com/*`
2. Check extension is enabled in `chrome://extensions/`
3. Reload the page (`Ctrl+R` or `Cmd+R`)
4. Check browser console for errors (`F12`)

### No Messages Saved

**Problem**: Statistics show 0 messages

**Solutions**:
1. Start a new conversation
2. Check console for "[Green Prompt] ✅ Saved" messages
3. Verify IndexedDB in DevTools → Application → IndexedDB
4. Reload extension in `chrome://extensions/`

### Export Not Working

**Problem**: Export button doesn't work

**Solutions**:
1. Verify messages are stored (check popup statistics)
2. Check browser console for errors
3. Try different export format
4. Clear browser cache and try again

### Database Access Issues

**Problem**: Cannot access IndexedDB

**Solutions**:
1. Ensure you're on `chat.deepseek.com` domain
2. Check browser storage quota
3. Try clearing site data and reloading
4. Verify no browser extensions conflict

### Getting Help

- 📖 Read the [Quick Start Guide](QUICKSTART.md)
- 🧪 Follow the [Testing Guide](TESTING.md)
- 📧 Contact maintainer (see package.json)

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Installation and basic usage
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
- **[PRIVACY.md](PRIVACY.md)** - Full privacy policy
- **[AGENTS.md](AGENTS.md)** - Development guidelines

---

Your support helps maintain and improve this extension!

---

## 📄 License

**MIT License**

Copyright (c) 2026 Green Prompt Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<div align="center">

**Made with 💚 for privacy-conscious users**

[🌱 Green Prompt]• Privacy First • Local Only • Open Source

</div>

