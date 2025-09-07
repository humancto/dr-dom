/**
 * Dr. DOM - Interactive DOM Inspector
 * Makes website analysis FUN with visual feedback and real-time insights!
 * Inspired by DebugInspector.tsx - but cranked up to 11! 🚀
 */

class DrDOMInspector {
  constructor() {
    this.isActive = false;
    this.overlayPanel = null;
    this.highlightOverlay = null;
    this.mutationObserver = null;
    this.inspectionData = {
      domNodes: 0,
      components: [],
      interactions: [],
      mutations: [],
      performance: {},
      screenshots: []
    };
    
    // Fun visual effects
    this.particles = [];
    this.soundEnabled = true;
    this.rainbowMode = false;
    
    this.init();
  }

  init() {
    this.createOverlayPanel();
    this.createHighlightOverlay();
    this.setupEventListeners();
    this.injectStyles();
    console.log('🔍 Dr. DOM Inspector initialized! Ready to make debugging fun!');
  }

  createOverlayPanel() {
    this.overlayPanel = document.createElement('div');
    this.overlayPanel.id = 'dr-dom-panel';
    this.overlayPanel.className = 'dr-dom-panel hidden';
    
    this.overlayPanel.innerHTML = `
      <div class="dr-dom-header">
        <div class="dr-dom-logo">
          <div class="logo-icon">🔍</div>
          <div class="logo-text">Dr. DOM</div>
          <div class="pulse-ring"></div>
        </div>
        
        <div class="dr-dom-stats">
          <div class="stat-bubble" id="domCount">
            <div class="stat-number">0</div>
            <div class="stat-label">DOM Nodes</div>
            <div class="stat-sparkle">✨</div>
          </div>
          <div class="stat-bubble" id="componentCount">
            <div class="stat-number">0</div>
            <div class="stat-label">Components</div>
            <div class="stat-sparkle">⚛️</div>
          </div>
          <div class="stat-bubble" id="interactionCount">
            <div class="stat-number">0</div>
            <div class="stat-label">Interactions</div>
            <div class="stat-sparkle">👆</div>
          </div>
        </div>
        
        <div class="dr-dom-controls">
          <button id="rainbowToggle" class="fun-btn rainbow-btn" title="🌈 Rainbow Mode">
            <span class="btn-text">🌈</span>
          </button>
          <button id="screenshotBtn" class="fun-btn screenshot-btn" title="📸 Screenshot">
            <span class="btn-text">📸</span>
          </button>
          <button id="closePanel" class="fun-btn close-btn" title="Close">
            <span class="btn-text">✖️</span>
          </button>
        </div>
      </div>

      <div class="dr-dom-tabs">
        <div class="tab-nav">
          <button class="tab-btn active" data-tab="live">🔴 Live View</button>
          <button class="tab-btn" data-tab="elements">🏗️ Elements</button>
          <button class="tab-btn" data-tab="events">⚡ Events</button>
          <button class="tab-btn" data-tab="performance">📊 Performance</button>
          <button class="tab-btn" data-tab="fun">🎉 Fun Mode</button>
        </div>
        
        <div class="tab-content">
          <!-- Live View Tab -->
          <div id="liveTab" class="tab-panel active">
            <div class="live-feed">
              <div class="feed-header">
                <h3>🔴 Live DOM Activity</h3>
                <div class="recording-indicator">
                  <div class="record-dot"></div>
                  <span>Recording...</span>
                </div>
              </div>
              <div id="liveFeed" class="activity-stream">
                <div class="welcome-message">
                  <div class="welcome-icon">👋</div>
                  <div class="welcome-text">
                    <h4>Welcome to Dr. DOM!</h4>
                    <p>Interact with the page to see real-time analysis...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Elements Tab -->
          <div id="elementsTab" class="tab-panel">
            <div class="elements-explorer">
              <div class="explorer-header">
                <input type="text" id="elementSearch" placeholder="🔎 Search elements..." />
                <button id="highlightAll" class="mini-btn">✨ Highlight All</button>
              </div>
              <div id="elementsTree" class="elements-tree">
                <!-- Dynamic element tree will be inserted here -->
              </div>
            </div>
          </div>
          
          <!-- Events Tab -->
          <div id="eventsTab" class="tab-panel">
            <div class="events-monitor">
              <div class="events-header">
                <h3>⚡ Event Monitor</h3>
                <div class="event-filters">
                  <label><input type="checkbox" checked> Click</label>
                  <label><input type="checkbox" checked> Scroll</label>
                  <label><input type="checkbox" checked> Form</label>
                  <label><input type="checkbox" checked> Custom</label>
                </div>
              </div>
              <div id="eventsList" class="events-list">
                <!-- Dynamic events list -->
              </div>
            </div>
          </div>
          
          <!-- Performance Tab -->
          <div id="performanceTab" class="tab-panel">
            <div class="performance-dashboard">
              <div class="perf-metrics">
                <div class="metric-card">
                  <div class="metric-icon">⚡</div>
                  <div class="metric-value" id="renderTime">0ms</div>
                  <div class="metric-label">Render Time</div>
                </div>
                <div class="metric-card">
                  <div class="metric-icon">🎨</div>
                  <div class="metric-value" id="paintTime">0ms</div>
                  <div class="metric-label">Paint Time</div>
                </div>
                <div class="metric-card">
                  <div class="metric-icon">💾</div>
                  <div class="metric-value" id="memoryUsage">0MB</div>
                  <div class="metric-label">Memory Usage</div>
                </div>
              </div>
              <div class="performance-chart">
                <canvas id="performanceChart" width="300" height="120"></canvas>
              </div>
            </div>
          </div>
          
          <!-- Fun Mode Tab -->
          <div id="funTab" class="tab-panel">
            <div class="fun-mode">
              <div class="fun-header">
                <h3>🎉 Fun Mode Activated!</h3>
                <div class="fun-score">
                  Score: <span id="funScore">0</span> 🏆
                </div>
              </div>
              
              <div class="fun-controls">
                <button id="particleMode" class="fun-control-btn">
                  <span class="control-icon">✨</span>
                  <span class="control-text">Particle Mode</span>
                </button>
                <button id="elementRave" class="fun-control-btn">
                  <span class="control-icon">🕺</span>
                  <span class="control-text">Element Rave</span>
                </button>
                <button id="domAnimation" class="fun-control-btn">
                  <span class="control-icon">🌊</span>
                  <span class="control-text">DOM Wave</span>
                </button>
                <button id="fireworks" class="fun-control-btn">
                  <span class="control-icon">🎆</span>
                  <span class="control-text">Fireworks</span>
                </button>
              </div>
              
              <div class="achievement-panel">
                <h4>🏆 Achievements</h4>
                <div id="achievements" class="achievements-list">
                  <!-- Dynamic achievements -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Particle Canvas for Fun Effects -->
      <canvas id="particleCanvas" class="particle-canvas"></canvas>
    `;

    document.body.appendChild(this.overlayPanel);
  }

  createHighlightOverlay() {
    this.highlightOverlay = document.createElement('div');
    this.highlightOverlay.id = 'dr-dom-highlight';
    this.highlightOverlay.className = 'dr-dom-highlight';
    document.body.appendChild(this.highlightOverlay);
  }

  injectStyles() {
    const styles = document.createElement('style');
    styles.textContent = \`
      /* Dr. DOM Inspector Styles - Making debugging BEAUTIFUL! */
      .dr-dom-panel {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 420px !important;
        max-height: 80vh !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3) !important;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: white !important;
        overflow: hidden !important;
        transform: scale(0.9) translateY(-10px) !important;
        opacity: 0 !important;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .dr-dom-panel.hidden {
        display: none !important;
      }
      
      .dr-dom-panel.visible {
        transform: scale(1) translateY(0) !important;
        opacity: 1 !important;
      }
      
      /* Glowing header */
      .dr-dom-header {
        padding: 16px !important;
        background: rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(20px) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      .dr-dom-logo {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        position: relative !important;
      }
      
      .logo-icon {
        font-size: 24px !important;
        animation: dr-dom-float 2s ease-in-out infinite !important;
      }
      
      .logo-text {
        font-weight: 700 !important;
        font-size: 18px !important;
        background: linear-gradient(45deg, #fff, #f0f0f0) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      
      .pulse-ring {
        position: absolute !important;
        width: 40px !important;
        height: 40px !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        border-radius: 50% !important;
        animation: dr-dom-pulse 2s ease-in-out infinite !important;
        pointer-events: none !important;
      }
      
      /* Fun stat bubbles */
      .dr-dom-stats {
        display: flex !important;
        gap: 12px !important;
      }
      
      .stat-bubble {
        background: rgba(255, 255, 255, 0.15) !important;
        border-radius: 12px !important;
        padding: 8px 12px !important;
        text-align: center !important;
        position: relative !important;
        backdrop-filter: blur(10px) !important;
        transition: transform 0.2s, box-shadow 0.2s !important;
      }
      
      .stat-bubble:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2) !important;
      }
      
      .stat-number {
        font-size: 16px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
      }
      
      .stat-label {
        font-size: 9px !important;
        opacity: 0.8 !important;
        margin-top: 2px !important;
      }
      
      .stat-sparkle {
        position: absolute !important;
        top: -4px !important;
        right: -4px !important;
        font-size: 10px !important;
        animation: dr-dom-sparkle 1.5s ease-in-out infinite !important;
      }
      
      /* Fun control buttons */
      .dr-dom-controls {
        display: flex !important;
        gap: 8px !important;
      }
      
      .fun-btn {
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
        border: none !important;
        background: rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .fun-btn:hover {
        background: rgba(255, 255, 255, 0.3) !important;
        transform: scale(1.1) rotate(5deg) !important;
      }
      
      .rainbow-btn:hover {
        animation: dr-dom-rainbow 0.5s linear infinite !important;
      }
      
      /* Tab system */
      .dr-dom-tabs {
        background: rgba(255, 255, 255, 0.05) !important;
        height: calc(80vh - 80px) !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      .tab-nav {
        display: flex !important;
        background: rgba(0, 0, 0, 0.1) !important;
        padding: 0 !important;
      }
      
      .tab-btn {
        flex: 1 !important;
        padding: 12px 8px !important;
        border: none !important;
        background: transparent !important;
        color: rgba(255, 255, 255, 0.7) !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        position: relative !important;
      }
      
      .tab-btn:hover,
      .tab-btn.active {
        color: white !important;
        background: rgba(255, 255, 255, 0.1) !important;
      }
      
      .tab-btn.active::after {
        content: '' !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 20px !important;
        height: 3px !important;
        background: #4ade80 !important;
        border-radius: 2px !important;
        box-shadow: 0 0 10px #4ade80 !important;
      }
      
      .tab-content {
        flex: 1 !important;
        overflow-y: auto !important;
        padding: 16px !important;
      }
      
      .tab-panel {
        display: none !important;
        height: 100% !important;
      }
      
      .tab-panel.active {
        display: block !important;
      }
      
      /* Live feed styling */
      .live-feed {
        height: 100% !important;
      }
      
      .feed-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 16px !important;
      }
      
      .feed-header h3 {
        margin: 0 !important;
        font-size: 16px !important;
      }
      
      .recording-indicator {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        font-size: 12px !important;
        background: rgba(239, 68, 68, 0.2) !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
      }
      
      .record-dot {
        width: 8px !important;
        height: 8px !important;
        background: #ef4444 !important;
        border-radius: 50% !important;
        animation: dr-dom-blink 1s infinite !important;
      }
      
      .activity-stream {
        height: calc(100% - 60px) !important;
        overflow-y: auto !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px !important;
        padding: 12px !important;
        background: rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Welcome message */
      .welcome-message {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 16px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 8px !important;
        border: 1px dashed rgba(255, 255, 255, 0.2) !important;
      }
      
      .welcome-icon {
        font-size: 24px !important;
        animation: dr-dom-wave 2s ease-in-out infinite !important;
      }
      
      .welcome-text h4 {
        margin: 0 0 4px 0 !important;
        font-size: 14px !important;
      }
      
      .welcome-text p {
        margin: 0 !important;
        font-size: 12px !important;
        opacity: 0.8 !important;
      }
      
      /* Activity items */
      .activity-item {
        display: flex !important;
        align-items: flex-start !important;
        gap: 8px !important;
        padding: 8px !important;
        margin-bottom: 8px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border-radius: 6px !important;
        border-left: 3px solid #4ade80 !important;
        transition: all 0.3s !important;
        animation: dr-dom-slideIn 0.5s ease-out !important;
      }
      
      .activity-item:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        transform: translateX(4px) !important;
      }
      
      .activity-icon {
        font-size: 16px !important;
        flex-shrink: 0 !important;
      }
      
      .activity-text {
        flex: 1 !important;
        font-size: 12px !important;
      }
      
      .activity-title {
        font-weight: 500 !important;
        margin-bottom: 2px !important;
      }
      
      .activity-details {
        opacity: 0.7 !important;
        font-size: 11px !important;
      }
      
      .activity-time {
        font-size: 10px !important;
        opacity: 0.6 !important;
        margin-top: 2px !important;
      }
      
      /* Fun mode styles */
      .fun-mode {
        text-align: center !important;
      }
      
      .fun-header {
        margin-bottom: 20px !important;
      }
      
      .fun-score {
        font-size: 14px !important;
        margin-top: 8px !important;
        background: rgba(255, 255, 255, 0.1) !important;
        padding: 4px 12px !important;
        border-radius: 12px !important;
        display: inline-block !important;
      }
      
      .fun-controls {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 12px !important;
        margin-bottom: 20px !important;
      }
      
      .fun-control-btn {
        padding: 12px !important;
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 8px !important;
        color: white !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
      }
      
      .fun-control-btn:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: scale(1.05) !important;
      }
      
      .control-icon {
        font-size: 20px !important;
      }
      
      .control-text {
        font-size: 10px !important;
      }
      
      /* Highlight overlay */
      .dr-dom-highlight {
        position: absolute !important;
        pointer-events: none !important;
        border: 2px solid #4ade80 !important;
        background: rgba(74, 222, 128, 0.1) !important;
        border-radius: 4px !important;
        z-index: 2147483646 !important;
        transition: all 0.2s !important;
        box-shadow: 0 0 20px rgba(74, 222, 128, 0.4) !important;
      }
      
      /* Particle canvas */
      .particle-canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 2147483645 !important;
      }
      
      /* Animations */
      @keyframes dr-dom-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
      }
      
      @keyframes dr-dom-pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes dr-dom-sparkle {
        0%, 100% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
      }
      
      @keyframes dr-dom-rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
      
      @keyframes dr-dom-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      @keyframes dr-dom-wave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(10deg); }
        75% { transform: rotate(-10deg); }
      }
      
      @keyframes dr-dom-slideIn {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      /* Scrollbar styling */
      .activity-stream::-webkit-scrollbar,
      .tab-content::-webkit-scrollbar {
        width: 6px !important;
      }
      
      .activity-stream::-webkit-scrollbar-track,
      .tab-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1) !important;
        border-radius: 3px !important;
      }
      
      .activity-stream::-webkit-scrollbar-thumb,
      .tab-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3) !important;
        border-radius: 3px !important;
      }
      
      .activity-stream::-webkit-scrollbar-thumb:hover,
      .tab-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5) !important;
      }
    \`;
    
    document.head.appendChild(styles);
  }

  setupEventListeners() {
    // Panel controls
    document.addEventListener('click', (e) => {
      if (e.target.id === 'closePanel') {
        this.hide();
      } else if (e.target.id === 'rainbowToggle') {
        this.toggleRainbowMode();
      } else if (e.target.id === 'screenshotBtn') {
        this.takeScreenshot();
      }
    });

    // Tab switching
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        this.switchTab(e.target.dataset.tab);
      }
    });

    // Fun mode controls
    document.addEventListener('click', (e) => {
      if (e.target.closest('#particleMode')) {
        this.toggleParticleMode();
      } else if (e.target.closest('#elementRave')) {
        this.startElementRave();
      } else if (e.target.closest('#domAnimation')) {
        this.startDOMWave();
      } else if (e.target.closest('#fireworks')) {
        this.triggerFireworks();
      }
    });

    // Element highlighting on hover
    document.addEventListener('mouseover', (e) => {
      if (this.isActive && !e.target.closest('.dr-dom-panel')) {
        this.highlightElement(e.target);
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (this.isActive) {
        this.hideHighlight();
      }
    });

    // Click tracking
    document.addEventListener('click', (e) => {
      if (this.isActive && !e.target.closest('.dr-dom-panel')) {
        this.trackInteraction('click', e.target);
        this.createClickEffect(e);
      }
    });

    // Scroll tracking
    let scrollTimeout;
    document.addEventListener('scroll', (e) => {
      if (this.isActive) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackInteraction('scroll', e.target);
        }, 100);
      }
    });
  }

  show() {
    this.isActive = true;
    this.overlayPanel.classList.remove('hidden');
    setTimeout(() => {
      this.overlayPanel.classList.add('visible');
    }, 50);
    
    this.startMutationObserver();
    this.updateStats();
    this.addActivity('🚀', 'Dr. DOM Inspector activated!', 'Let\\'s make debugging fun!');
    
    // Achievement: First time user
    this.unlockAchievement('🎉', 'First Steps', 'Activated Dr. DOM for the first time!');
  }

  hide() {
    this.isActive = false;
    this.overlayPanel.classList.remove('visible');
    setTimeout(() => {
      this.overlayPanel.classList.add('hidden');
    }, 300);
    
    this.stopMutationObserver();
    this.hideHighlight();
  }

  startMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.onElementAdded(node);
            }
          });

          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.onElementRemoved(node);
            }
          });
        } else if (mutation.type === 'attributes') {
          this.onAttributeChanged(mutation.target, mutation.attributeName);
        }
      });
      
      this.updateStats();
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'id', 'data-*']
    });
  }

  stopMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  onElementAdded(element) {
    this.addActivity('➕', 'Element added', \`<\${element.tagName.toLowerCase()}>\`);
    
    // Fun effect: sparkle animation on new elements
    if (this.rainbowMode) {
      this.addSparkleEffect(element);
    }
    
    // Check for interesting elements
    if (element.tagName === 'IMG') {
      this.unlockAchievement('🖼️', 'Picture Perfect', 'Image element detected!');
    } else if (element.tagName === 'FORM') {
      this.unlockAchievement('📝', 'Form Master', 'Form element detected!');
    }
  }

  onElementRemoved(element) {
    this.addActivity('➖', 'Element removed', \`<\${element.tagName.toLowerCase()}>\`);
  }

  onAttributeChanged(element, attributeName) {
    this.addActivity('🔧', 'Attribute changed', \`\${attributeName} on <\${element.tagName.toLowerCase()}>\`);
  }

  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    this.highlightOverlay.style.display = 'block';
    this.highlightOverlay.style.top = (rect.top + scrollTop) + 'px';
    this.highlightOverlay.style.left = (rect.left + scrollLeft) + 'px';
    this.highlightOverlay.style.width = rect.width + 'px';
    this.highlightOverlay.style.height = rect.height + 'px';
    
    // Add element info tooltip
    this.showElementTooltip(element, rect);
  }

  hideHighlight() {
    this.highlightOverlay.style.display = 'none';
    this.hideElementTooltip();
  }

  showElementTooltip(element, rect) {
    // TODO: Implement tooltip showing element details
  }

  hideElementTooltip() {
    // TODO: Hide tooltip
  }

  trackInteraction(type, element) {
    const interaction = {
      type,
      element: element.tagName.toLowerCase(),
      timestamp: Date.now(),
      path: this.getElementPath(element)
    };
    
    this.inspectionData.interactions.push(interaction);
    this.addActivity('👆', \`\${type} on element\`, \`<\${element.tagName.toLowerCase()}>\`);
    
    // Update interaction counter
    const interactionCount = document.querySelector('#interactionCount .stat-number');
    if (interactionCount) {
      interactionCount.textContent = this.inspectionData.interactions.length;
    }
  }

  getElementPath(element) {
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += \`#\${current.id}\`;
      } else if (current.className) {
        selector += \`.\${current.className.split(' ').join('.')}\`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  }

  updateStats() {
    const domCount = document.querySelectorAll('*').length;
    const components = this.detectReactComponents();
    
    this.inspectionData.domNodes = domCount;
    this.inspectionData.components = components;
    
    // Update UI
    const domCountEl = document.querySelector('#domCount .stat-number');
    const componentCountEl = document.querySelector('#componentCount .stat-number');
    
    if (domCountEl) domCountEl.textContent = domCount;
    if (componentCountEl) componentCountEl.textContent = components.length;
  }

  detectReactComponents() {
    const components = [];
    document.querySelectorAll('*').forEach(el => {
      if (el._reactInternalFiber || el.__reactInternalInstance || el._reactInternalInstance) {
        components.push({
          element: el,
          type: this.getReactComponentName(el)
        });
      }
    });
    return components;
  }

  getReactComponentName(element) {
    // Try to extract React component name
    const fiber = element._reactInternalFiber || element.__reactInternalInstance;
    if (fiber && fiber.type && fiber.type.name) {
      return fiber.type.name;
    }
    return 'Unknown Component';
  }

  addActivity(icon, title, details, timestamp = null) {
    const feed = document.getElementById('liveFeed');
    if (!feed) return;
    
    // Remove welcome message if it exists
    const welcome = feed.querySelector('.welcome-message');
    if (welcome) {
      welcome.remove();
    }
    
    const activity = document.createElement('div');
    activity.className = 'activity-item';
    activity.innerHTML = \`
      <div class="activity-icon">\${icon}</div>
      <div class="activity-text">
        <div class="activity-title">\${title}</div>
        <div class="activity-details">\${details}</div>
        <div class="activity-time">\${timestamp || this.formatTime(new Date())}</div>
      </div>
    \`;
    
    // Add to top of feed
    feed.insertBefore(activity, feed.firstChild);
    
    // Keep only last 20 activities
    const activities = feed.querySelectorAll('.activity-item');
    if (activities.length > 20) {
      activities[activities.length - 1].remove();
    }
    
    // Auto-scroll to top
    feed.scrollTop = 0;
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  switchTab(tabName) {
    // Update nav
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === \`\${tabName}Tab\`);
    });
  }

  // Fun Mode Features! 🎉
  toggleRainbowMode() {
    this.rainbowMode = !this.rainbowMode;
    if (this.rainbowMode) {
      this.addActivity('🌈', 'Rainbow mode activated!', 'Everything is more colorful now!');
      document.body.style.animation = 'dr-dom-rainbow 2s linear infinite';
    } else {
      this.addActivity('🌈', 'Rainbow mode deactivated', 'Back to normal colors');
      document.body.style.animation = '';
    }
  }

  toggleParticleMode() {
    // TODO: Implement particle effects
    this.addActivity('✨', 'Particle mode toggled!', 'Sparkles everywhere!');
    this.unlockAchievement('✨', 'Particle Master', 'Activated particle effects!');
  }

  startElementRave() {
    // TODO: Make all elements dance
    this.addActivity('🕺', 'Element rave started!', 'Let the DOM dance!');
    this.unlockAchievement('🕺', 'Party Starter', 'Made the DOM dance!');
  }

  startDOMWave() {
    // TODO: Wave effect across elements
    this.addActivity('🌊', 'DOM wave initiated!', 'Riding the wave of elements!');
  }

  triggerFireworks() {
    // TODO: Fireworks effect
    this.addActivity('🎆', 'Fireworks launched!', 'Celebration time!');
    this.unlockAchievement('🎆', 'Pyrotechnician', 'Launched DOM fireworks!');
  }

  createClickEffect(event) {
    const effect = document.createElement('div');
    effect.style.cssText = \`
      position: fixed;
      left: \${event.clientX - 5}px;
      top: \${event.clientY - 5}px;
      width: 10px;
      height: 10px;
      background: #4ade80;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483647;
      animation: dr-dom-click-effect 0.6s ease-out forwards;
    \`;
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 600);
  }

  addSparkleEffect(element) {
    // TODO: Add sparkle animation to element
  }

  unlockAchievement(icon, title, description) {
    const achievementsList = document.getElementById('achievements');
    if (!achievementsList) return;
    
    const achievement = document.createElement('div');
    achievement.className = 'achievement-item';
    achievement.innerHTML = \`
      <div class="achievement-icon">\${icon}</div>
      <div class="achievement-text">
        <div class="achievement-title">\${title}</div>
        <div class="achievement-desc">\${description}</div>
      </div>
    \`;
    
    achievementsList.appendChild(achievement);
    this.addActivity('🏆', \`Achievement unlocked: \${title}\`, description);
  }

  takeScreenshot() {
    // Create a visual capture representation
    this.addActivity('📸', 'Screenshot captured!', 'Saved current DOM state');
    this.unlockAchievement('📸', 'Shutterbug', 'Captured a screenshot!');
  }

  // API for external communication
  getInspectionData() {
    return {
      ...this.inspectionData,
      isActive: this.isActive,
      timestamp: Date.now()
    };
  }

  getStats() {
    return {
      domNodes: this.inspectionData.domNodes,
      components: this.inspectionData.components.length,
      interactions: this.inspectionData.interactions.length,
      errors: 0, // Will be populated by error tracker
      requests: 0 // Will be populated by network monitor
    };
  }
}

// Initialize Dr. DOM Inspector
const drDOMInspector = new DrDOMInspector();

// Message handler for extension communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'startInspection':
      drDOMInspector.show();
      sendResponse({ success: true });
      break;
      
    case 'stopInspection':
      drDOMInspector.hide();
      sendResponse({ success: true });
      break;
      
    case 'getInspectionData':
      sendResponse(drDOMInspector.getInspectionData());
      break;
      
    case 'getStats':
      sendResponse(drDOMInspector.getStats());
      break;
      
    case 'toggleFeature':
      // Handle feature toggling
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Add some additional CSS animations for fun effects
const additionalStyles = document.createElement('style');
additionalStyles.textContent = \`
  @keyframes dr-dom-click-effect {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
  
  .achievement-item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 8px !important;
    margin-bottom: 8px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px !important;
    animation: dr-dom-slideIn 0.5s ease-out !important;
  }
  
  .achievement-icon {
    font-size: 16px !important;
  }
  
  .achievement-text {
    flex: 1 !important;
  }
  
  .achievement-title {
    font-weight: 600 !important;
    font-size: 12px !important;
    color: #4ade80 !important;
  }
  
  .achievement-desc {
    font-size: 10px !important;
    opacity: 0.8 !important;
    margin-top: 2px !important;
  }
\`;

document.head.appendChild(additionalStyles);

console.log('🎉 Dr. DOM Inspector loaded and ready to make debugging FUN!');