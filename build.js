#!/usr/bin/env node
/**
 * Dr. DOM Extension Build Script
 * Creates distributable extension packages for Chrome and Firefox
 */

const fs = require('fs');
const path = require('path');

class DrDOMBuilder {
  constructor() {
    this.isDev = process.argv.includes('--dev');
    this.isPackage = process.argv.includes('--package');
    this.distDir = path.join(__dirname, 'dist');
    
    console.log('🔨 Dr. DOM Extension Builder');
    console.log(`Mode: ${this.isDev ? 'Development' : 'Production'}`);
  }

  async build() {
    try {
      // Clean previous build
      this.cleanDist();
      
      // Create dist directory
      this.createDistDir();
      
      // Copy files
      this.copyStaticFiles();
      this.copyLibrary();
      this.copyContentScripts();
      this.copyBackground();
      this.copyPopup();
      this.copyAssets();
      
      // Generate manifests
      this.generateChromeManifest();
      this.generateFirefoxManifest();
      
      // Create package info
      this.createPackageInfo();
      
      // Generate icons (placeholder)
      this.generateIcons();
      
      console.log('✅ Build completed successfully!');
      console.log(`📁 Output directory: ${this.distDir}`);
      console.log('');
      console.log('🚀 Installation Instructions:');
      console.log('Chrome: Open chrome://extensions/ -> Enable Developer Mode -> Load Unpacked -> Select dist/chrome folder');
      console.log('Firefox: Open about:debugging -> This Firefox -> Load Temporary Add-on -> Select dist/firefox/manifest.json');
      console.log('');
      console.log('🎉 Happy debugging with Dr. DOM!');
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  cleanDist() {
    if (fs.existsSync(this.distDir)) {
      fs.rmSync(this.distDir, { recursive: true });
      console.log('🧹 Cleaned previous build');
    }
  }

  createDistDir() {
    fs.mkdirSync(this.distDir, { recursive: true });
    fs.mkdirSync(path.join(this.distDir, 'chrome'), { recursive: true });
    fs.mkdirSync(path.join(this.distDir, 'firefox'), { recursive: true });
    console.log('📁 Created distribution directories');
  }

  copyStaticFiles() {
    const files = ['README.md', 'LICENSE'];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.distDir, file));
      }
    });
    
    console.log('📄 Copied static files');
  }

  copyLibrary() {
    const libDir = 'lib';
    const targetChrome = path.join(this.distDir, 'chrome', libDir);
    const targetFirefox = path.join(this.distDir, 'firefox', libDir);
    
    fs.mkdirSync(targetChrome, { recursive: true });
    fs.mkdirSync(targetFirefox, { recursive: true });
    
    const libFiles = ['dom-utils.js'];
    
    libFiles.forEach(file => {
      const sourcePath = path.join(libDir, file);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, path.join(targetChrome, file));
        fs.copyFileSync(sourcePath, path.join(targetFirefox, file));
      }
    });
    
    console.log('📚 Copied library files');
  }

  copyContentScripts() {
    const scriptsDir = 'content-scripts';
    const targetChrome = path.join(this.distDir, 'chrome', scriptsDir);
    const targetFirefox = path.join(this.distDir, 'firefox', scriptsDir);
    
    fs.mkdirSync(targetChrome, { recursive: true });
    fs.mkdirSync(targetFirefox, { recursive: true });
    
    // Copy ALL files from content-scripts directory
    const files = fs.readdirSync(scriptsDir);
    
    files.forEach(file => {
      const sourcePath = path.join(scriptsDir, file);
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, path.join(targetChrome, file));
        fs.copyFileSync(sourcePath, path.join(targetFirefox, file));
      }
    });
    
    console.log(`📜 Copied ${files.length} content scripts`);
  }

  copyBackground() {
    const backgroundDir = 'background';
    const targetChrome = path.join(this.distDir, 'chrome', backgroundDir);
    const targetFirefox = path.join(this.distDir, 'firefox', backgroundDir);
    
    fs.mkdirSync(targetChrome, { recursive: true });
    fs.mkdirSync(targetFirefox, { recursive: true });
    
    fs.copyFileSync(
      path.join(backgroundDir, 'background.js'),
      path.join(targetChrome, 'background.js')
    );
    fs.copyFileSync(
      path.join(backgroundDir, 'background.js'),
      path.join(targetFirefox, 'background.js')
    );
    
    console.log('⚙️ Copied background scripts');
  }

  copyPopup() {
    const popupDir = 'popup';
    const targetChrome = path.join(this.distDir, 'chrome', popupDir);
    const targetFirefox = path.join(this.distDir, 'firefox', popupDir);
    
    fs.mkdirSync(targetChrome, { recursive: true });
    fs.mkdirSync(targetFirefox, { recursive: true });
    
    // Copy ALL files from popup directory
    const files = fs.readdirSync(popupDir);
    
    files.forEach(file => {
      const sourcePath = path.join(popupDir, file);
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, path.join(targetChrome, file));
        fs.copyFileSync(sourcePath, path.join(targetFirefox, file));
      }
    });
    
    console.log(`🎨 Copied ${files.length} popup files`);
  }

  copyAssets() {
    const assetsDir = 'assets';
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    const targetChrome = path.join(this.distDir, 'chrome', assetsDir);
    const targetFirefox = path.join(this.distDir, 'firefox', assetsDir);
    
    fs.mkdirSync(targetChrome, { recursive: true });
    fs.mkdirSync(targetFirefox, { recursive: true });
    
    console.log('🖼️ Prepared assets directories');
  }

  generateChromeManifest() {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    // Chrome-specific adjustments
    manifest.manifest_version = 3;
    
    fs.writeFileSync(
      path.join(this.distDir, 'chrome', 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('📋 Generated Chrome manifest');
  }

  generateFirefoxManifest() {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    // Firefox-specific adjustments
    manifest.manifest_version = 2;
    
    // Convert background service worker to scripts for Firefox
    if (manifest.background && manifest.background.service_worker) {
      manifest.background = {
        scripts: [manifest.background.service_worker],
        persistent: false
      };
    }
    
    // Add Firefox-specific settings
    manifest.browser_specific_settings = {
      gecko: {
        id: "dr-dom@extension.dev",
        strict_min_version: "88.0"
      }
    };
    
    fs.writeFileSync(
      path.join(this.distDir, 'firefox', 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('🦊 Generated Firefox manifest');
  }

  generateIcons() {
    // Create simple SVG icons as placeholders
    const sizes = [16, 32, 48, 128];
    const iconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad)" stroke="#fff" stroke-width="2"/>
  <text x="50" y="65" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle">🔍</text>
</svg>`;

    sizes.forEach(size => {
      const iconPath16 = path.join(this.distDir, 'chrome', 'assets', `icon-${size}.png`);
      const iconPath48 = path.join(this.distDir, 'firefox', 'assets', `icon-${size}.png`);
      
      // For now, create placeholder text files (in real implementation, would convert SVG to PNG)
      const placeholder = `Dr. DOM Icon (${size}x${size}) - Replace with actual PNG`;
      fs.writeFileSync(iconPath16, placeholder);
      fs.writeFileSync(iconPath48, placeholder);
    });
    
    console.log('🎨 Generated placeholder icons (replace with actual PNG files)');
  }

  createPackageInfo() {
    const packageInfo = {
      name: "Dr. DOM Browser Extension",
      version: "1.0.0",
      description: "The fun way to understand any website!",
      build_date: new Date().toISOString(),
      build_mode: this.isDev ? 'development' : 'production',
      browsers: {
        chrome: "Chrome/Chromium 88+",
        firefox: "Firefox 88+"
      },
      installation: {
        chrome: "Load unpacked extension from chrome folder",
        firefox: "Load temporary add-on from firefox/manifest.json"
      },
      features: [
        "🔍 Interactive DOM inspection",
        "🌐 Real-time network monitoring",
        "🐛 JavaScript error tracking",
        "📊 Performance analysis",
        "🎉 Gamified experience",
        "📋 Beautiful HTML reports",
        "🔎 Smart search functionality"
      ]
    };
    
    fs.writeFileSync(
      path.join(this.distDir, 'package-info.json'),
      JSON.stringify(packageInfo, null, 2)
    );
    
    fs.writeFileSync(
      path.join(this.distDir, 'INSTALL.md'),
      this.generateInstallInstructions()
    );
    
    console.log('📦 Created package information');
  }

  generateInstallInstructions() {
    return `# 🚀 Dr. DOM Installation Instructions

## For Chrome/Edge/Brave

1. **Open Extensions Page**
   - Go to \`chrome://extensions/\` in your browser
   - Or click the puzzle piece icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the \`chrome\` folder from the extracted files
   - Dr. DOM will appear in your extensions list

4. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in the toolbar
   - Click the pin icon next to Dr. DOM

## For Firefox

1. **Open Debugging Page**
   - Go to \`about:debugging\` in Firefox
   - Click "This Firefox" in the left sidebar

2. **Load Temporary Add-on**
   - Click "Load Temporary Add-on..."
   - Navigate to the \`firefox\` folder
   - Select \`manifest.json\`

3. **Extension Loaded**
   - Dr. DOM will appear in your extensions list
   - The icon will be available in your toolbar

## 🎉 You're Ready!

1. **Visit any website** (try reddit.com, github.com, or your favorite site)
2. **Click the Dr. DOM icon** 🔍 in your browser toolbar
3. **Hit "Start Inspection"** and watch the magic happen!
4. **Explore the tabs** - each one reveals different insights
5. **Try Fun Mode** - click the rainbow button for visual effects!

## 🔧 Troubleshooting

**Extension not loading?**
- Make sure you selected the correct folder (chrome/firefox)
- Check that manifest.json exists in the folder
- Try refreshing the extensions page

**Icon not appearing?**
- Look for the puzzle piece icon and pin Dr. DOM
- Check if the extension is enabled in the extensions list

**Not working on a page?**
- Some pages (chrome://, about:, extension pages) can't be inspected
- Try a regular website like google.com or github.com

## 📧 Need Help?

- Check the README.md file for detailed documentation
- Report issues on our GitHub repository
- Email us at hello@dr-dom.dev

Happy debugging! 🚀
`;
  }
}

// Run the build
if (require.main === module) {
  const builder = new DrDOMBuilder();
  builder.build();
}

module.exports = DrDOMBuilder;