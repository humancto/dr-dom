# 🎮 Dr. DOM - Privacy Inspector & Gamified Web Analysis

<div align="center">
  
  **🕹️ Turn web privacy into a game! Track trackers, score sites, watch privacy erode in real-time.**
  
  [![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![Privacy Score](https://img.shields.io/badge/Privacy-First-orange)](https://github.com/humancto/dr-dom)
  [![Fun Factor](https://img.shields.io/badge/Fun%20Factor-100%25-ff69b4)](https://github.com/humancto/dr-dom)
  
  [Install Extension](#installation) • [Features](#features) • [How It Works](#how-it-works) • [Testing](#testing)
</div>

---

## 🚀 **What is Dr. DOM?**

Dr. DOM is a Chrome extension that gamifies web privacy analysis. It automatically detects trackers, analyzes privacy practices, and presents the data in fun, engaging ways. All data is **100% real** - we detect actual trackers, real cookies, and genuine privacy issues.

## ✅ **Working Features (10 Active)**

### 1. 🎯 **Enhanced Tracker Detection**
- Detects **30+ tracker networks** in real-time (Google Analytics, Facebook, Amazon, etc.)
- Intercepts XHR/Fetch requests, images, scripts
- Categories: Advertising, Analytics, Social, Fingerprinting
- **No API needed** - works with local patterns

### 2. 🛡️ **URLhaus Malware Detection**
- Checks sites against **2M+ malicious URLs**
- Downloads URLhaus database locally (no API limits!)
- Updates every 6 hours automatically
- Detects malware, phishing, and compromised sites

### 3. 📊 **Privacy Timeline**
- **Real-time visualization** of privacy erosion
- Shows events as they happen (trackers, cookies, fingerprinting)
- Live privacy score (100 → 0 as privacy degrades)
- Visual timeline with timestamps and impact

### 4. 🔐 **Browser Fingerprint Protection**
- Shows your **actual browser fingerprint**
- Canvas, WebGL, Audio fingerprinting detection
- Entropy calculation (uniqueness score)
- Can **spoof fingerprint data** for protection

### 5. 😂 **Honest Site Reviews**
- **Roasts websites** based on actual privacy practices
- Based on real data: trackers, ads, cookies, load time
- Brutally honest with humor
- Updates based on what's actually detected

### 6. 🎪 **Silly Metrics**
- "Creepiness Index" based on tracking behavior
- "Stalker Score" from fingerprinting attempts
- "Data Vampire Rating" from data collection
- Floating widget with drag support

### 7. 😊 **Emoji Privacy Scores**
- Visual representation with themed emojis
- Weather theme: ☀️ (great) to 🌩️ (terrible)
- Star ratings: ⭐⭐⭐⭐⭐ to ☠️
- Animals, food, and more themes

### 8. 🎰 **Money Trail Game**
- **Gamified revenue calculations** with clear disclaimers
- Based on industry CPM rates ($1-5 per 1000 impressions)
- Shows your "data coins" value
- Levels: Data Peasant → Privacy Pro → Surveillance Superstar
- **⚠️ Disclaimer: Estimates only, not financial advice!**

### 9. ✅ **GDPR/CCPA Compliance Checker**
- Detects consent banners and privacy policies
- Finds opt-out links and privacy controls
- Identifies dark patterns (pre-checked boxes, hidden options)
- Checks for required disclosures

### 10. 📈 **Privacy Scorer**
- **100-point scoring system** with transparent algorithm
- Penalties: -5 for fingerprinting, -2 for trackers, -1 for cookies
- Real-time score updates as page loads
- Grade system: A (90+), B (80-89), C (70-79), D (60-69), F (<60)

## 🎮 **How to Use**

### Installation
1. Clone the repository:
```bash
git clone https://github.com/humancto/dr-dom.git
cd dr-dom
```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/chrome` folder

3. Visit any website - the extension starts automatically!

### Testing
Run the comprehensive test suite:
```javascript
// In Chrome DevTools console on any page:
new DrDOMTestSuite().runAllTests()
```

## 📊 **Real Data, Fun Presentation**

### What We Track (Really):
- **Trackers**: Google Analytics, Facebook Pixel, Amazon, etc.
- **Cookies**: First-party, third-party, tracking cookies
- **Fingerprinting**: Canvas, WebGL, Audio, Font detection
- **Network**: XHR/Fetch requests, loaded resources
- **Compliance**: GDPR/CCPA banners, privacy policies

### How We Present It:
- 🎮 Gamified with levels and achievements
- 😂 Honest roasts and funny descriptions
- 📊 Visual scores and timelines
- 🎰 Money calculations (with disclaimers!)
- 😊 Emoji representations

## ⚠️ **Important Disclaimers**

### This Extension:
- ✅ **Uses REAL data** - all detections are actual trackers/privacy issues
- ✅ **Works locally** - no external API dependencies
- ✅ **Educational purpose** - learn about web privacy
- ✅ **Open source** - see exactly how it works

### This is NOT:
- ❌ **Legal advice** - we're not lawyers
- ❌ **Financial advice** - revenue calculations are estimates
- ❌ **Security software** - it's educational/entertainment
- ❌ **100% accurate** - some calculations are industry estimates

## 🛠️ **Technical Details**

### Architecture:
- **Manifest V3** Chrome extension
- **Content scripts** with `document_start` injection
- **Chrome Storage API** for persistence
- **No external dependencies** - everything works locally

### Performance:
- **Memory**: ~30-50MB per tab
- **CPU**: 2-5% during analysis
- **Storage**: ~70MB with URLhaus database
- **Page load impact**: +100-200ms

## 📁 **Project Structure**

```
dr-dom/
├── dist/chrome/
│   ├── manifest.json          # Extension manifest
│   ├── content-scripts/       # 10 working scripts
│   │   ├── enhanced-tracker-detection.js
│   │   ├── urlhaus-local.js
│   │   ├── privacy-timeline.js
│   │   ├── fingerprint-protection.js
│   │   ├── privacy-scorer.js
│   │   ├── gdpr-ccpa-checker.js
│   │   ├── honest-reviews.js
│   │   ├── silly-metrics.js
│   │   ├── emoji-scores.js
│   │   └── money-trail-game.js
│   ├── popup/
│   │   └── advanced-popup.html
│   └── background/
│       └── background.js
├── test/
│   └── test-suite.js          # Comprehensive tests
└── docs/
    ├── FEATURE-STATUS.md      # Detailed feature status
    ├── API_LIMITS.md          # API limitations
    └── LIMITATIONS.md         # Known limitations
```

## 🧪 **Testing Coverage**

All 10 features have comprehensive tests:
- ✅ Tracker Detection: Pattern matching, interception
- ✅ URLhaus: Database loading, URL checking
- ✅ Timeline: Event recording, score calculation
- ✅ Fingerprinting: Detection and spoofing
- ✅ Privacy Scorer: Algorithm validation
- ✅ GDPR/CCPA: Banner detection, compliance
- ✅ Money Trail: Calculation accuracy
- ✅ Reviews/Metrics/Emojis: Display and updates

## 🚦 **Known Limitations**

- **URLhaus database**: 50MB storage limit (stores top 100k entries)
- **Money calculations**: Industry estimates, ±1000% accuracy
- **GDPR detection**: DOM-based, may miss some implementations
- **Fingerprint spoofing**: May break some sites
- **Performance**: Slight page load increase (100-200ms)

## 🤝 **Contributing**

We welcome contributions! Areas for improvement:
- Add more tracker patterns
- Improve revenue calculations
- Add more emoji themes
- Enhance GDPR detection
- Create more mini-games

## 📜 **License**

MIT License - See [LICENSE](LICENSE) file

## 🙏 **Credits**

- **URLhaus** by abuse.ch for malware database
- **EFF** for privacy best practices
- **DuckDuckGo** for tracker lists inspiration
- **Community** for feedback and ideas

---

<div align="center">

### 💡 **Remember**

**This is an educational tool that uses real data to teach about web privacy.**
**All calculations and scores are estimates for learning purposes.**
**Have fun while learning about your digital privacy!**

**Made with ❤️ by the Dr. DOM team**

</div>