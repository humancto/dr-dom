/**
 * Dr. DOM Utilities
 * Shared utility functions for DOM manipulation and analysis
 */

window.DrDOMUtils = {
  /**
   * Generate unique IDs for elements
   */
  generateId() {
    return 'dr-dom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  },

  /**
   * Get element selector path
   */
  getElementPath(element) {
    if (!element) return '';
    
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += '#' + current.id;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.split(' ').filter(c => c && !c.startsWith('dr-dom'));
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 2).join('.');
        }
      }
      
      path.unshift(selector);
      current = current.parentElement;
    }
    
    return path.join(' > ');
  },

  /**
   * Get human-friendly element description
   */
  describeElement(element) {
    if (!element) return 'Unknown element';
    
    const tag = element.tagName.toLowerCase();
    const descriptions = {
      'img': 'Image',
      'a': 'Link', 
      'button': 'Button',
      'input': 'Input field',
      'div': 'Container',
      'span': 'Text span',
      'p': 'Paragraph',
      'h1': 'Main heading',
      'h2': 'Section heading',
      'h3': 'Subsection heading',
      'nav': 'Navigation',
      'header': 'Header',
      'footer': 'Footer',
      'main': 'Main content',
      'aside': 'Sidebar',
      'section': 'Section',
      'article': 'Article',
      'form': 'Form',
      'table': 'Table',
      'ul': 'List',
      'ol': 'Numbered list',
      'li': 'List item'
    };
    
    let description = descriptions[tag] || tag.toUpperCase() + ' element';
    
    // Add context if available
    if (element.alt) description += ` (${element.alt})`;
    else if (element.title) description += ` (${element.title})`;
    else if (element.textContent && element.textContent.length < 50) {
      description += ` (${element.textContent.trim()})`;
    }
    
    return description;
  },

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           rect.width > 0 &&
           rect.height > 0;
  },

  /**
   * Get element size info
   */
  getElementInfo(element) {
    if (!element) return {};
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return {
      tag: element.tagName.toLowerCase(),
      id: element.id,
      classes: Array.from(element.classList).filter(c => !c.startsWith('dr-dom')),
      dimensions: {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y)
      },
      styles: {
        display: style.display,
        position: style.position,
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontSize: style.fontSize
      },
      attributes: this.getRelevantAttributes(element),
      visible: this.isElementVisible(element),
      description: this.describeElement(element)
    };
  },

  /**
   * Get relevant attributes for an element
   */
  getRelevantAttributes(element) {
    const relevantAttrs = ['src', 'href', 'alt', 'title', 'placeholder', 'type', 'role'];
    const attrs = {};
    
    relevantAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        attrs[attr] = element.getAttribute(attr);
      }
    });
    
    return attrs;
  },

  /**
   * Safely inject CSS without conflicts
   */
  injectCSS(css, id = null) {
    const existingStyle = id ? document.getElementById(id) : null;
    if (existingStyle) {
      existingStyle.textContent = css;
      return existingStyle;
    }
    
    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  },

  /**
   * Create floating notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `dr-dom-notification dr-dom-notification-${type}`;
    notification.textContent = message;
    
    const colors = {
      info: '#3b82f6',
      success: '#10b981', 
      warning: '#f59e0b',
      error: '#ef4444'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: dr-dom-slide-in 0.3s ease-out;
      cursor: pointer;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
      notification.style.animation = 'dr-dom-slide-out 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.remove();
    });
    
    return notification;
  },

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Get viewport information
   */
  getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      devicePixelRatio: window.devicePixelRatio,
      userAgent: navigator.userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
    };
  },

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Format duration
   */
  formatDuration(ms) {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  },

  /**
   * Check if Dr. DOM elements should be excluded
   */
  isDrDOMElement(element) {
    if (!element) return false;
    return element.classList && Array.from(element.classList).some(cls => cls.startsWith('dr-dom')) ||
           element.id && element.id.startsWith('dr-dom') ||
           element.getAttribute && element.getAttribute('data-dr-dom');
  },

  /**
   * Clean text content
   */
  cleanText(text, maxLength = 100) {
    if (!text) return '';
    return text.trim().substring(0, maxLength).replace(/\s+/g, ' ');
  }
};

console.log('🛠️ Dr. DOM utilities loaded and ready!');