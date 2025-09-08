# 🔍 Dr. DOM - Advanced Web Analysis Browser Extension

<div align="center">
  
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox&logoColor=white)](https://addons.mozilla.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**The Ultimate Web Transparency Tool - See Everything Your Browser Sees**

[Install](#-installation) • [Features](#-features) • [Usage](#-usage) • [Contributing](#-contributing) • [Documentation](#-documentation)

</div>

## 🎯 What is Dr. DOM?

Dr. DOM is a powerful browser extension that provides **real-time, always-on monitoring** of any website you visit. Unlike traditional developer tools that require manual activation, Dr. DOM automatically captures and analyzes everything from the moment a page loads.

### 🌟 Key Differentiators

- **🔴 Always-On Capture** - Never miss early page requests again
- **🛡️ Privacy First** - Instant tracking pixel and cookie analysis
- **📊 Safety Score** - Know if a site is safe at a glance
- **📦 Professional Export** - HAR, JSON, CSV formats
- **👁️ GDPR/CCPA Compliance** - Automatic compliance checking
- **🎯 Tracking Detection** - Identifies 15+ major tracking platforms

## ✨ Features

### 🔒 Privacy & Security
- **Tracking Pixel Detection** - Identifies Meta/Facebook, Google, LinkedIn, Twitter, TikTok, and 10+ other platforms
- **Cookie Analysis** - Categorizes cookies (essential, functional, analytics, marketing, tracking)
- **GDPR/CCPA Compliance** - Real-time compliance validation
- **Safety Score** - Instant 0-100 safety rating for any website
- **Security Issues** - Mixed content, insecure cookies, vulnerable libraries

### 🚀 Performance Analysis
- **Request Monitoring** - Captures all XHR, Fetch, and resource requests
- **Response Time Tracking** - Identifies slow endpoints
- **Performance Insights** - Actionable optimization recommendations
- **Resource Analysis** - Images, scripts, stylesheets breakdown

### 🔌 Developer Tools
- **HAR Export** - Industry-standard format for sharing
- **API Discovery** - Automatic endpoint detection
- **Response Schema** - Captures and displays API response structures
- **Request Search** - Filter by type, status, speed
- **Error Tracking** - JavaScript errors and failed requests

## 🚀 Installation

### Chrome / Chromium Browsers

1. Clone the repository:
```bash
git clone https://github.com/humancto/dr-dom.git
cd dr-dom
```

2. Build the extension:
```bash
npm install
npm run build
```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/chrome` folder

### Firefox

1. Follow steps 1-2 above
2. Load in Firefox:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select `dist/firefox/manifest.json`

## 📖 Usage

### Basic Usage

1. **Install the extension** following the steps above
2. **Navigate to any website** - Dr. DOM starts capturing immediately
3. **Click the extension icon** to view the analysis
4. **Explore the tabs**:
   - **Overview** - Quick stats and activity stream
   - **Requests** - All network requests with search/filter
   - **Performance** - Timing metrics and insights
   - **Security** - Trackers, cookies, and compliance
   - **APIs** - Discovered endpoints and schemas

### Export Data

Click the **Export** button to download data in:
- **HAR** - For use in Chrome DevTools, Charles Proxy, etc.
- **JSON** - Raw data for custom analysis
- **CSV** - For spreadsheet analysis

### Understanding the Safety Score

- **90-100** 🟢 Excellent - Minimal tracking, good security
- **70-89** 🟡 Good - Some tracking, minor issues
- **50-69** 🟠 Fair - Moderate tracking, security concerns
- **0-49** 🔴 Poor - Heavy tracking, security issues

## 🛠️ Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Chrome/Firefox browser

### Setup

```bash
# Clone the repository
git clone https://github.com/humancto/dr-dom.git
cd dr-dom

# Install dependencies
npm install

# Development build with watch
npm run dev

# Production build
npm run build

# Run tests
npm test
```

### Project Structure

```
dr-dom/
├── manifest.json           # Extension manifest
├── background/            # Service worker scripts
├── content-scripts/       # Page injection scripts
│   ├── live-capture.js   # Main capture engine
│   ├── security-scanner.js # Security analysis
│   └── cookie-analyzer.js # Cookie compliance
├── popup/                 # Extension popup UI
│   ├── advanced-popup.html
│   ├── advanced-popup-fixed.js
│   └── advanced-popup-responsive.css
├── utils/                 # Utility functions
│   └── har-export.js     # Export functionality
└── dist/                  # Built extensions
    ├── chrome/
    └── firefox/
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Icons from [Emoji](https://emojipedia.org/)
- Inspired by the need for web transparency

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/humancto/dr-dom/issues)
- **Discussions**: [GitHub Discussions](https://github.com/humancto/dr-dom/discussions)

---

<div align="center">
  
**Made with ❤️ for web transparency**

[⬆ Back to Top](#-dr-dom---advanced-web-analysis-browser-extension)

</div>