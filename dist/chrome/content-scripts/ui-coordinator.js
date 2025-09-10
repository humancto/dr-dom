/**
 * UI Coordinator - Manages all floating widgets to prevent overlap
 * Ensures only one widget is visible at a time and coordinates positions
 */

class UICoordinator {
  constructor() {
    this.widgets = {
      privacyShield: 'privacy-shield-widget',
      honestReview: 'honest-review-card',
      sillyMetrics: 'silly-metrics-widget',
      emojiScore: 'emoji-score-widget',
      privacyTimeline: 'privacy-timeline',
      moneyTrail: 'money-trail-widget'
    };
    
    this.activeWidget = null;
    this.positions = {
      topRight: { top: '20px', right: '20px' },
      topLeft: { top: '20px', left: '20px' },
      bottomRight: { bottom: '20px', right: '20px' },
      bottomLeft: { bottom: '20px', left: '20px' }
    };
    
    this.init();
  }

  init() {
    console.log('[UI Coordinator] Initializing widget management...');
    
    // Hide all widgets initially
    this.hideAllWidgets();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleWidget') {
        this.toggleWidget(request.widget);
        sendResponse({ success: true });
      } else if (request.action === 'showWidget') {
        this.showWidget(request.widget);
        sendResponse({ success: true });
      } else if (request.action === 'hideAllWidgets') {
        this.hideAllWidgets();
        sendResponse({ success: true });
      }
    });
    
    // Start with Privacy Shield minimized in corner
    setTimeout(() => {
      this.showMinimizedShield();
    }, 2000);
  }

  hideAllWidgets() {
    Object.values(this.widgets).forEach(widgetId => {
      const widget = document.getElementById(widgetId);
      if (widget) {
        widget.style.display = 'none';
        widget.classList.add('hidden-by-coordinator');
      }
    });
    this.activeWidget = null;
  }

  showWidget(widgetName) {
    // Hide current active widget
    if (this.activeWidget && this.activeWidget !== widgetName) {
      const currentWidget = document.getElementById(this.widgets[this.activeWidget]);
      if (currentWidget) {
        currentWidget.style.display = 'none';
      }
    }
    
    // Show requested widget
    const widgetId = this.widgets[widgetName];
    const widget = document.getElementById(widgetId);
    
    if (widget) {
      widget.style.display = 'block';
      widget.classList.remove('hidden-by-coordinator');
      widget.classList.remove('minimized');
      this.activeWidget = widgetName;
      
      // Position widget to avoid overlap
      this.positionWidget(widget, widgetName);
    } else {
      // Widget doesn't exist yet, trigger its creation
      if (widgetName === 'honestReview' && window.honestReviews) {
        window.honestReviews.displayReview();
        setTimeout(() => {
          const newWidget = document.getElementById(widgetId);
          if (newWidget) {
            newWidget.style.display = 'block';
            this.positionWidget(newWidget, widgetName);
          }
        }, 100);
      }
    }
  }

  toggleWidget(widgetName) {
    const widgetId = this.widgets[widgetName];
    const widget = document.getElementById(widgetId);
    
    if (widget) {
      if (widget.style.display === 'none' || widget.classList.contains('hidden-by-coordinator')) {
        this.showWidget(widgetName);
      } else {
        widget.style.display = 'none';
        if (this.activeWidget === widgetName) {
          this.activeWidget = null;
        }
      }
    }
  }

  positionWidget(widget, widgetName) {
    // Reset any existing positioning
    widget.style.position = 'fixed';
    widget.style.top = '';
    widget.style.right = '';
    widget.style.bottom = '';
    widget.style.left = '';
    
    // Assign positions based on widget type
    switch (widgetName) {
      case 'privacyShield':
        Object.assign(widget.style, this.positions.topRight);
        break;
      case 'honestReview':
        Object.assign(widget.style, this.positions.topLeft);
        break;
      case 'sillyMetrics':
        Object.assign(widget.style, this.positions.bottomRight);
        break;
      case 'emojiScore':
        Object.assign(widget.style, this.positions.bottomLeft);
        break;
      case 'privacyTimeline':
        widget.style.top = '20px';
        widget.style.left = '50%';
        widget.style.transform = 'translateX(-50%)';
        break;
      case 'moneyTrail':
        widget.style.bottom = '20px';
        widget.style.left = '50%';
        widget.style.transform = 'translateX(-50%)';
        break;
    }
    
    // Ensure high z-index
    widget.style.zIndex = '2147483647';
  }

  showMinimizedShield() {
    // Show only the minimized Privacy Shield icon
    const shield = document.getElementById('privacy-shield-widget');
    if (shield) {
      shield.classList.add('minimized');
      shield.style.display = 'block';
      shield.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:30px;cursor:pointer;">🛡️</div>';
      shield.style.width = '60px';
      shield.style.height = '60px';
      shield.style.position = 'fixed';
      shield.style.top = '20px';
      shield.style.right = '20px';
      shield.style.zIndex = '2147483647';
      shield.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      shield.style.borderRadius = '50%';
      shield.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      shield.style.cursor = 'pointer';
      
      // Click to expand
      shield.onclick = () => {
        if (window.privacyShield) {
          window.privacyShield.toggleMinimize();
        }
      };
    }
  }

  // Create a unified control panel
  createControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'dr-dom-control-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      padding: 10px;
      border-radius: 25px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 2147483646;
      display: flex;
      gap: 10px;
      font-family: -apple-system, sans-serif;
    `;
    
    const widgets = [
      { name: 'privacyShield', icon: '🛡️', title: 'Privacy Shield' },
      { name: 'honestReview', icon: '🔥', title: 'Honest Review' },
      { name: 'sillyMetrics', icon: '🎪', title: 'Silly Metrics' },
      { name: 'emojiScore', icon: '😊', title: 'Emoji Score' },
      { name: 'privacyTimeline', icon: '📊', title: 'Timeline' },
      { name: 'moneyTrail', icon: '💰', title: 'Money Trail' }
    ];
    
    widgets.forEach(widget => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.3s;
      `;
      btn.innerHTML = widget.icon;
      btn.title = widget.title;
      btn.onclick = () => this.toggleWidget(widget.name);
      
      btn.onmouseover = () => {
        btn.style.background = 'rgba(255,255,255,0.2)';
        btn.style.transform = 'scale(1.1)';
      };
      btn.onmouseout = () => {
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.transform = 'scale(1)';
      };
      
      panel.appendChild(btn);
    });
    
    document.body.appendChild(panel);
  }
}

// Initialize UI Coordinator
const uiCoordinator = new UICoordinator();

// Export for use by other modules
window.uiCoordinator = uiCoordinator;