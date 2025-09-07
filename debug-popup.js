/**
 * Simplified Dr. DOM Popup for debugging
 * This version has better error handling and logging
 */

class DrDOMPopupDebug {
  constructor() {
    this.isInspecting = false;
    this.currentTab = null;
    console.log('Dr. DOM Popup Debug initialized');
    this.init();
  }

  async init() {
    try {
      console.log('Initializing popup...');
      await this.loadCurrentTab();
      await this.setupEventListeners();
      await this.updateUI();
      console.log('Popup initialization complete');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
    }
  }

  async loadCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      console.log('Current tab loaded:', tab.url);
      
      if (!this.canAccessTab(tab)) {
        console.warn('Cannot access this tab:', tab.url);
      }
    } catch (error) {
      console.error('Failed to load current tab:', error);
    }
  }

  canAccessTab(tab) {
    const url = tab.url;
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'safari-extension:'];
    return !restrictedProtocols.some(protocol => url.startsWith(protocol));
  }

  async setupEventListeners() {
    const inspectBtn = document.getElementById('inspectBtn');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        console.log('Inspect button clicked');
        this.toggleInspection();
      });
    } else {
      console.error('Inspect button not found!');
    }

    // Add more event listeners as needed
    console.log('Event listeners setup complete');
  }

  async updateUI() {
    const inspectBtn = document.getElementById('inspectBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    
    if (inspectBtn) {
      if (this.isInspecting) {
        inspectBtn.innerHTML = '<span class="btn-icon">⏸️</span>Stop Inspection';
        inspectBtn.classList.add('active');
      } else {
        inspectBtn.innerHTML = '<span class="btn-icon">🔍</span>Start Inspection';
        inspectBtn.classList.remove('active');
      }
    }

    if (statusIndicator) {
      const statusText = statusIndicator.querySelector('span');
      const statusDot = statusIndicator.querySelector('.status-dot');
      
      if (statusText) {
        statusText.textContent = this.isInspecting ? 'Monitoring' : 'Ready';
      }
      
      if (statusDot) {
        statusDot.style.background = this.isInspecting ? '#ef4444' : '#4ade80';
      }
    }

    console.log('UI updated, inspection status:', this.isInspecting);
  }

  async toggleInspection() {
    console.log('Toggle inspection called, current state:', this.isInspecting);
    
    if (!this.currentTab || !this.canAccessTab(this.currentTab)) {
      console.error('Cannot access current tab');
      this.showError('Cannot inspect this page. Try a regular website like google.com');
      return;
    }

    try {
      this.isInspecting = !this.isInspecting;
      console.log('New inspection state:', this.isInspecting);
      
      if (this.isInspecting) {
        await this.startInspection();
        console.log('Inspection started successfully');
      } else {
        await this.stopInspection();
        console.log('Inspection stopped successfully');
      }
      
      await this.updateUI();
      
    } catch (error) {
      console.error('Failed to toggle inspection:', error);
      this.showError(`Failed to ${this.isInspecting ? 'start' : 'stop'} inspection: ${error.message}`);
      this.isInspecting = !this.isInspecting; // Revert state
      await this.updateUI();
    }
  }

  async startInspection() {
    console.log('Starting inspection on tab:', this.currentTab.id);
    
    try {
      // Try to inject content scripts if they're not already there
      await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: () => {
          console.log('Dr. DOM: Content script check');
          if (!window.drDOMInspector) {
            console.log('Dr. DOM: Inspector not found, will be loaded by manifest');
          }
          return !!window.drDOMInspector;
        }
      });

      // Send start message
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'startInspection',
        timestamp: Date.now()
      });
      
      console.log('Start inspection response:', response);
      
    } catch (error) {
      console.error('Failed to start inspection:', error);
      throw error;
    }
  }

  async stopInspection() {
    console.log('Stopping inspection on tab:', this.currentTab.id);
    
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'stopInspection',
        timestamp: Date.now()
      });
      
      console.log('Stop inspection response:', response);
      
    } catch (error) {
      console.error('Failed to stop inspection:', error);
      throw error;
    }
  }

  showError(message) {
    console.error('Showing error:', message);
    
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #b91c1c;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Dr. DOM popup debug...');
  window.drDOMPopup = new DrDOMPopupDebug();
});

console.log('Dr. DOM Debug Popup script loaded');