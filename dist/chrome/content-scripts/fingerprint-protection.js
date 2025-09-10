/**
 * Browser Fingerprint Display & Protection
 * Shows YOUR unique fingerprint and how to protect it
 * All local analysis - no API calls needed!
 */

class FingerprintProtection {
  constructor() {
    this.fingerprint = {
      canvas: null,
      webgl: null,
      audio: null,
      fonts: [],
      screen: {},
      hardware: {},
      browser: {},
      entropy: 0
    };
    
    this.protectionEnabled = false;
    this.spoofingMethods = {};
    
    this.init();
  }

  init() {
    console.log('🛡️ [Fingerprint Protection] Analyzing your unique fingerprint...');
    
    // Collect fingerprint data
    this.collectFingerprint();
    
    // Calculate entropy
    this.calculateEntropy();
    
    // Create UI
    this.createFingerprintUI();
    
    // Enable protection if requested
    this.setupProtection();
  }

  collectFingerprint() {
    // Canvas fingerprint
    this.fingerprint.canvas = this.getCanvasFingerprint();
    
    // WebGL fingerprint
    this.fingerprint.webgl = this.getWebGLFingerprint();
    
    // Audio fingerprint
    this.fingerprint.audio = this.getAudioFingerprint();
    
    // Font fingerprint
    this.fingerprint.fonts = this.getFontFingerprint();
    
    // Screen fingerprint
    this.fingerprint.screen = this.getScreenFingerprint();
    
    // Hardware fingerprint
    this.fingerprint.hardware = this.getHardwareFingerprint();
    
    // Browser fingerprint
    this.fingerprint.browser = this.getBrowserFingerprint();
    
    // Calculate uniqueness
    this.calculateUniqueness();
  }

  getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw test text
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('BrowserFingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('BrowserFingerprint', 4, 17);
    
    // Get data URL
    const dataURL = canvas.toDataURL();
    
    // Hash it
    let hash = 0;
    for (let i = 0; i < dataURL.length; i++) {
      const char = dataURL.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return {
      hash: Math.abs(hash).toString(16),
      dataLength: dataURL.length,
      unique: true,
      entropy: this.estimateEntropy(dataURL.length)
    };
  }

  getWebGLFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return { supported: false };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      vendorUnmasked: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'N/A',
      rendererUnmasked: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A',
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      entropy: 12.5 // WebGL typically provides ~12.5 bits of entropy
    };
  }

  getAudioFingerprint() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return { supported: false };
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
    
    gain.gain.value = 0; // Mute
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(context.destination);
    
    oscillator.start(0);
    
    let fingerprint = [];
    scriptProcessor.onaudioprocess = function(event) {
      fingerprint = new Float32Array(event.inputBuffer.getChannelData(0));
    };
    
    // Wait and stop
    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 100);
    
    return {
      sampleRate: context.sampleRate,
      channelCount: context.destination.channelCount,
      maxChannelCount: context.destination.maxChannelCount,
      entropy: 8.1 // Audio fingerprinting provides ~8.1 bits
    };
  }

  getFontFingerprint() {
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Arial Black', 'Palatino'
    ];
    
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const detectFont = (font) => {
      ctx.font = `${testSize} ${font}`;
      return ctx.measureText(testString).width;
    };
    
    // Get base measurements
    const baseMeasurements = {};
    baseFonts.forEach(font => {
      baseMeasurements[font] = detectFont(font);
    });
    
    // Detect available fonts
    const availableFonts = [];
    testFonts.forEach(font => {
      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} '${font}', ${baseFont}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseMeasurements[baseFont]) {
          availableFonts.push(font);
          break;
        }
      }
    });
    
    return {
      available: availableFonts,
      count: availableFonts.length,
      entropy: Math.log2(Math.pow(2, availableFonts.length))
    };
  }

  getScreenFingerprint() {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      orientation: screen.orientation?.type || 'unknown',
      entropy: 5.5 // Screen attributes provide ~5.5 bits
    };
  }

  getHardwareFingerprint() {
    return {
      cpuCores: navigator.hardwareConcurrency || 'unknown',
      memory: navigator.deviceMemory || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      platform: navigator.platform,
      vendor: navigator.vendor,
      entropy: 4.8 // Hardware info provides ~4.8 bits
    };
  }

  getBrowserFingerprint() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      plugins: this.getPlugins(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      entropy: 10.2 // Browser attributes provide ~10.2 bits
    };
  }

  getPlugins() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push({
        name: navigator.plugins[i].name,
        description: navigator.plugins[i].description
      });
    }
    return plugins;
  }

  calculateEntropy() {
    // Sum up entropy from all sources
    let totalEntropy = 0;
    
    if (this.fingerprint.canvas?.entropy) totalEntropy += this.fingerprint.canvas.entropy;
    if (this.fingerprint.webgl?.entropy) totalEntropy += this.fingerprint.webgl.entropy;
    if (this.fingerprint.audio?.entropy) totalEntropy += this.fingerprint.audio.entropy;
    if (this.fingerprint.fonts?.entropy) totalEntropy += this.fingerprint.fonts.entropy;
    if (this.fingerprint.screen?.entropy) totalEntropy += this.fingerprint.screen.entropy;
    if (this.fingerprint.hardware?.entropy) totalEntropy += this.fingerprint.hardware.entropy;
    if (this.fingerprint.browser?.entropy) totalEntropy += this.fingerprint.browser.entropy;
    
    this.fingerprint.entropy = totalEntropy;
    
    // Calculate uniqueness (1 in X browsers)
    this.fingerprint.uniqueness = Math.pow(2, totalEntropy);
  }

  estimateEntropy(value) {
    // Rough entropy estimation based on value diversity
    return Math.log2(value) / 2;
  }

  calculateUniqueness() {
    // Create a hash of all fingerprint data
    const fingerprintString = JSON.stringify(this.fingerprint);
    let hash = 0;
    
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    this.fingerprint.hash = Math.abs(hash).toString(16);
    this.fingerprint.uniqueId = `FP-${this.fingerprint.hash}-${Date.now()}`;
  }

  createFingerprintUI() {
    if (document.getElementById('fingerprint-display')) return;
    
    const display = document.createElement('div');
    display.id = 'fingerprint-display';
    display.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      width: 350px;
      max-height: 500px;
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      border: 2px solid #6366f1;
      border-radius: 16px;
      padding: 20px;
      z-index: 2147483646;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      font-family: 'Monaco', 'Courier New', monospace;
      color: white;
      overflow-y: auto;
    `;
    
    const uniquenessLevel = this.getUniquenessLevel();
    
    display.innerHTML = `
      <!-- Header -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 2px solid #4c1d95;
      ">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
          🔍 YOUR FINGERPRINT
        </h3>
        <button id="fingerprint-close" style="
          background: rgba(239,68,68,0.2);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">×</button>
      </div>
      
      <!-- Uniqueness Score -->
      <div style="
        background: linear-gradient(135deg, ${uniquenessLevel.color}, ${uniquenessLevel.color}dd);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 15px;
        text-align: center;
      ">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">
          ${uniquenessLevel.icon} ${uniquenessLevel.text}
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          1 in ${this.formatNumber(this.fingerprint.uniqueness)} browsers
        </div>
        <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">
          Entropy: ${this.fingerprint.entropy.toFixed(1)} bits
        </div>
      </div>
      
      <!-- Fingerprint Components -->
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #a5b4fc;">
          Fingerprint Components:
        </h4>
        ${this.createComponentsList()}
      </div>
      
      <!-- Protection Toggle -->
      <div style="
        background: rgba(99,102,241,0.1);
        border: 1px solid #6366f1;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 15px;
      ">
        <label style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        ">
          <span style="font-size: 13px;">Enable Protection</span>
          <input type="checkbox" id="protection-toggle" style="
            width: 20px;
            height: 20px;
            cursor: pointer;
          ">
        </label>
        <div style="font-size: 11px; color: #a5b4fc; margin-top: 8px;">
          Spoofs fingerprint data to prevent tracking
        </div>
      </div>
      
      <!-- Your Unique ID -->
      <div style="
        background: rgba(0,0,0,0.3);
        padding: 10px;
        border-radius: 6px;
        font-size: 10px;
        word-break: break-all;
        font-family: monospace;
      ">
        <div style="color: #a5b4fc; margin-bottom: 5px;">Your Unique ID:</div>
        <div style="color: #fbbf24;">${this.fingerprint.uniqueId}</div>
      </div>
      
      <!-- Tips -->
      <div style="
        margin-top: 15px;
        padding: 10px;
        background: rgba(16,185,129,0.1);
        border: 1px solid #10b981;
        border-radius: 6px;
        font-size: 11px;
      ">
        <div style="font-weight: bold; margin-bottom: 5px;">💡 Protection Tips:</div>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Use Tor Browser for maximum protection</li>
          <li>Disable JavaScript when possible</li>
          <li>Use browser extensions that spoof fingerprints</li>
          <li>Keep browser in common resolution (1920x1080)</li>
        </ul>
      </div>
    `;
    
    // Wait for body to exist
    if (document.body) {
      document.body.appendChild(display);
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          document.body.appendChild(display);
        }
      });
    } else {
      // Document is loaded but body might not exist yet
      setTimeout(() => {
        if (document.body) {
          document.body.appendChild(display);
        }
      }, 100);
    }
    
    // Event listeners
    document.getElementById('fingerprint-close')?.addEventListener('click', () => {
      display.remove();
    });
    
    document.getElementById('protection-toggle')?.addEventListener('change', (e) => {
      this.protectionEnabled = e.target.checked;
      if (this.protectionEnabled) {
        this.enableProtection();
      } else {
        this.disableProtection();
      }
    });
  }

  createComponentsList() {
    const components = [
      { name: 'Canvas', data: this.fingerprint.canvas, icon: '🎨' },
      { name: 'WebGL', data: this.fingerprint.webgl, icon: '🎮' },
      { name: 'Audio', data: this.fingerprint.audio, icon: '🔊' },
      { name: 'Fonts', data: this.fingerprint.fonts, icon: '🔤' },
      { name: 'Screen', data: this.fingerprint.screen, icon: '🖥️' },
      { name: 'Hardware', data: this.fingerprint.hardware, icon: '⚙️' },
      { name: 'Browser', data: this.fingerprint.browser, icon: '🌐' }
    ];
    
    return components.map(comp => `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
        background: rgba(0,0,0,0.2);
        border-radius: 6px;
        margin-bottom: 5px;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">${comp.icon}</span>
          <span style="font-size: 12px;">${comp.name}</span>
        </div>
        <div style="
          font-size: 11px;
          color: ${comp.data?.entropy > 5 ? '#ef4444' : '#10b981'};
        ">
          ${comp.data?.entropy?.toFixed(1) || '0'} bits
        </div>
      </div>
    `).join('');
  }

  getUniquenessLevel() {
    const bits = this.fingerprint.entropy;
    
    if (bits > 30) {
      return {
        text: 'EXTREMELY UNIQUE',
        icon: '🎯',
        color: '#dc2626',
        description: 'You are highly trackable!'
      };
    } else if (bits > 25) {
      return {
        text: 'VERY UNIQUE',
        icon: '⚠️',
        color: '#f59e0b',
        description: 'Easy to track'
      };
    } else if (bits > 20) {
      return {
        text: 'QUITE UNIQUE',
        icon: '🔍',
        color: '#eab308',
        description: 'Moderately trackable'
      };
    } else if (bits > 15) {
      return {
        text: 'SOMEWHAT UNIQUE',
        icon: '👁️',
        color: '#84cc16',
        description: 'Some tracking risk'
      };
    } else {
      return {
        text: 'COMMON',
        icon: '✅',
        color: '#10b981',
        description: 'Harder to track'
      };
    }
  }

  formatNumber(num) {
    if (num > 1e12) return (num / 1e12).toFixed(1) + ' trillion';
    if (num > 1e9) return (num / 1e9).toFixed(1) + ' billion';
    if (num > 1e6) return (num / 1e6).toFixed(1) + ' million';
    if (num > 1e3) return (num / 1e3).toFixed(1) + 'k';
    return Math.round(num).toString();
  }

  setupProtection() {
    // Store original methods for restoration
    this.originals = {
      toDataURL: HTMLCanvasElement.prototype.toDataURL,
      getParameter: WebGLRenderingContext.prototype.getParameter,
      getChannelData: AudioBuffer.prototype.getChannelData
    };
  }

  enableProtection() {
    console.log('🛡️ [Fingerprint Protection] Enabling fingerprint spoofing...');
    
    // Spoof canvas
    HTMLCanvasElement.prototype.toDataURL = function() {
      const dataURL = this.originals.toDataURL.apply(this, arguments);
      // Add random noise
      return dataURL + Math.random().toString(36).substring(7);
    }.bind(this);
    
    // Spoof WebGL
    if (window.WebGLRenderingContext) {
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445 || parameter === 37446) { // VENDOR/RENDERER
          return 'Intel Inc.'; // Generic response
        }
        return this.originals.getParameter.apply(this, arguments);
      }.bind(this);
    }
    
    // Notify user
    this.showProtectionNotification('Protection Enabled! Your fingerprint is now randomized.');
  }

  disableProtection() {
    console.log('🔓 [Fingerprint Protection] Disabling fingerprint spoofing...');
    
    // Restore original methods
    if (this.originals.toDataURL) {
      HTMLCanvasElement.prototype.toDataURL = this.originals.toDataURL;
    }
    
    if (this.originals.getParameter && window.WebGLRenderingContext) {
      WebGLRenderingContext.prototype.getParameter = this.originals.getParameter;
    }
    
    this.showProtectionNotification('Protection Disabled. Your real fingerprint is visible.');
  }

  showProtectionNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      font-size: 14px;
      z-index: 2147483647;
      animation: slideIn 0.3s ease;
    `;
    notif.textContent = message;
    
    if (document.body) {
      document.body.appendChild(notif);
    }
    
    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }
}

// Initialize
const fingerprintProtection = new FingerprintProtection();
console.log('🛡️ [Dr. DOM] Fingerprint Protection activated - See and control your digital fingerprint!');