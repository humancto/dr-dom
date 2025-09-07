/**
 * Dr. DOM Error Tracker
 * Catches and visualizes JavaScript errors in a fun, accessible way
 * Makes debugging feel like solving mysteries! 🕵️
 */

class DrDOMErrorTracker {
  constructor() {
    this.isTracking = false;
    this.errors = [];
    this.warnings = [];
    this.consoleMessages = [];
    this.errorCount = 0;
    this.warningCount = 0;
    
    // Fun error categories with emojis
    this.errorCategories = {
      'TypeError': { icon: '🤔', description: 'Something tried to use data in the wrong way' },
      'ReferenceError': { icon: '👻', description: 'Looking for something that doesn\'t exist' },
      'SyntaxError': { icon: '📝', description: 'Code has spelling mistakes' },
      'RangeError': { icon: '📏', description: 'Numbers went outside their allowed range' },
      'NetworkError': { icon: '🌐', description: 'Problem connecting to the internet' },
      'SecurityError': { icon: '🔒', description: 'Website security rules blocked something' },
      'unknown': { icon: '❓', description: 'Something went wrong, but we\'re not sure what' }
    };
    
    this.init();
  }

  init() {
    this.setupGlobalErrorHandling();
    this.setupConsoleInterception();
    this.setupUnhandledRejectionTracking();
    this.setupResourceErrorTracking();
    this.injectVisualStyles();
    
    console.log('🐛 Dr. DOM Error Tracker initialized - ready to catch bugs!');
  }

  setupGlobalErrorHandling() {
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      if (this.isTracking) {
        this.handleJavaScriptError({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
          timestamp: Date.now(),
          type: 'javascript'
        });
      }
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isTracking) {
        this.handlePromiseRejection({
          reason: event.reason,
          promise: event.promise,
          timestamp: Date.now(),
          type: 'promise'
        });
      }
    });
  }

  setupConsoleInterception() {
    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

    // Intercept console.error
    console.error = (...args) => {
      if (this.isTracking) {
        this.handleConsoleError({
          args: args,
          timestamp: Date.now(),
          type: 'console-error',
          stackTrace: new Error().stack
        });
      }
      return originalConsole.error.apply(console, args);
    };

    // Intercept console.warn
    console.warn = (...args) => {
      if (this.isTracking) {
        this.handleConsoleWarning({
          args: args,
          timestamp: Date.now(),
          type: 'console-warning',
          stackTrace: new Error().stack
        });
      }
      return originalConsole.warn.apply(console, args);
    };

    // Intercept all console methods for comprehensive logging
    ['log', 'info', 'debug'].forEach(method => {
      console[method] = (...args) => {
        if (this.isTracking) {
          this.handleConsoleMessage({
            method: method,
            args: args,
            timestamp: Date.now(),
            type: 'console-message'
          });
        }
        return originalConsole[method].apply(console, args);
      };
    });

    // Store references for potential restoration
    this.originalConsole = originalConsole;
  }

  setupUnhandledRejectionTracking() {
    // Enhanced promise rejection handling
    const originalPromise = window.Promise;
    
    if (originalPromise && originalPromise.prototype && originalPromise.prototype.catch) {
      const originalCatch = originalPromise.prototype.catch;
      
      originalPromise.prototype.catch = function(onRejected) {
        return originalCatch.call(this, (reason) => {
          if (window.drDOMErrorTracker && window.drDOMErrorTracker.isTracking) {
            window.drDOMErrorTracker.trackPromiseCatch({
              reason: reason,
              timestamp: Date.now(),
              handled: true
            });
          }
          
          if (onRejected) {
            return onRejected(reason);
          }
          throw reason;
        });
      };
    }
  }

  setupResourceErrorTracking() {
    // Track failed resource loading (images, scripts, etc.)
    document.addEventListener('error', (event) => {
      if (this.isTracking && event.target !== window) {
        this.handleResourceError({
          element: event.target,
          source: event.target.src || event.target.href,
          tagName: event.target.tagName,
          timestamp: Date.now(),
          type: 'resource'
        });
      }
    }, true); // Use capture phase to catch all elements
  }

  startTracking() {
    this.isTracking = true;
    this.errors = [];
    this.warnings = [];
    this.consoleMessages = [];
    this.errorCount = 0;
    this.warningCount = 0;
    
    console.log('🔍 Error tracking started - watching for bugs!');
    
    // Show fun notification
    this.showTrackingNotification('🐛', 'Bug hunting mode activated!', 'success');
  }

  stopTracking() {
    this.isTracking = false;
    console.log('⏹️ Error tracking stopped');
    
    this.showTrackingNotification('✋', 'Bug hunting paused', 'info');
  }

  handleJavaScriptError(errorData) {
    const processedError = this.processError(errorData);
    this.errors.push(processedError);
    this.errorCount++;
    
    // Show visual notification
    this.showErrorNotification(processedError);
    
    // Add to Dr. DOM Inspector if available
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('💥', 'JavaScript Error', 
        this.getHumanFriendlyErrorMessage(processedError));
    }
    
    // Create floating error indicator
    this.createErrorIndicator(processedError);
    
    console.log('🐛 JavaScript error caught:', processedError);
  }

  handlePromiseRejection(rejectionData) {
    const processedError = {
      ...rejectionData,
      category: this.categorizeError(rejectionData.reason),
      humanMessage: this.getHumanFriendlyPromiseMessage(rejectionData),
      severity: 'high',
      id: this.generateErrorId()
    };
    
    this.errors.push(processedError);
    this.errorCount++;
    
    this.showErrorNotification(processedError);
    
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('🚫', 'Promise Rejection', 
        processedError.humanMessage);
    }
    
    console.log('🚫 Promise rejection caught:', processedError);
  }

  handleConsoleError(errorData) {
    const processedError = {
      ...errorData,
      category: 'console',
      humanMessage: this.getHumanFriendlyConsoleMessage(errorData, 'error'),
      severity: 'medium',
      id: this.generateErrorId()
    };
    
    this.errors.push(processedError);
    this.errorCount++;
    
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('🔴', 'Console Error', 
        processedError.humanMessage);
    }
  }

  handleConsoleWarning(warningData) {
    const processedWarning = {
      ...warningData,
      category: 'console',
      humanMessage: this.getHumanFriendlyConsoleMessage(warningData, 'warning'),
      severity: 'low',
      id: this.generateErrorId()
    };
    
    this.warnings.push(processedWarning);
    this.warningCount++;
    
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('⚠️', 'Console Warning', 
        processedWarning.humanMessage);
    }
  }

  handleConsoleMessage(messageData) {
    this.consoleMessages.push({
      ...messageData,
      id: this.generateErrorId()
    });
    
    // Only show interesting messages in the activity feed
    if (messageData.method === 'info' || messageData.method === 'debug') {
      const message = this.formatConsoleArgs(messageData.args);
      if (message.length > 10) { // Only show substantial messages
        if (window.drDOMInspector) {
          window.drDOMInspector.addActivity('ℹ️', 'Console Message', 
            message.substring(0, 50) + (message.length > 50 ? '...' : ''));
        }
      }
    }
  }

  handleResourceError(errorData) {
    const processedError = {
      ...errorData,
      category: 'resource',
      humanMessage: this.getHumanFriendlyResourceMessage(errorData),
      severity: 'medium',
      id: this.generateErrorId()
    };
    
    this.errors.push(processedError);
    this.errorCount++;
    
    // Show subtle notification for resource errors
    this.showResourceErrorNotification(processedError);
    
    if (window.drDOMInspector) {
      window.drDOMInspector.addActivity('📦', 'Resource Failed', 
        processedError.humanMessage);
    }
  }

  processError(errorData) {
    const errorType = this.getErrorType(errorData.error);
    const category = this.categorizeError(errorData.error || errorData.message);
    
    return {
      ...errorData,
      errorType,
      category,
      humanMessage: this.getHumanFriendlyErrorMessage(errorData),
      severity: this.determineSeverity(errorType),
      suggestions: this.getSuggestions(errorType, errorData),
      id: this.generateErrorId(),
      location: this.formatLocation(errorData)
    };
  }

  getErrorType(error) {
    if (!error) return 'unknown';
    
    const errorName = error.name || error.constructor?.name;
    if (errorName && this.errorCategories[errorName]) {
      return errorName;
    }
    
    const message = error.message || error.toString();
    if (message.includes('network') || message.includes('fetch')) return 'NetworkError';
    if (message.includes('permission') || message.includes('blocked')) return 'SecurityError';
    
    return 'unknown';
  }

  categorizeError(error) {
    const errorType = this.getErrorType(error);
    return this.errorCategories[errorType] || this.errorCategories.unknown;
  }

  getHumanFriendlyErrorMessage(errorData) {
    const category = this.categorizeError(errorData.error);
    const location = this.formatLocation(errorData);
    
    let friendlyMessage = \`\${category.icon} \${category.description}\`;
    
    if (location) {
      friendlyMessage += \` (in \${location})\`;
    }
    
    return friendlyMessage;
  }

  getHumanFriendlyPromiseMessage(rejectionData) {
    const reason = rejectionData.reason;
    
    if (typeof reason === 'string') {
      return \`🚫 A background task failed: \${reason.substring(0, 60)}\${reason.length > 60 ? '...' : ''}\`;
    }
    
    if (reason && reason.message) {
      return \`🚫 A background task failed: \${reason.message.substring(0, 60)}\`;
    }
    
    return '🚫 A background task failed for an unknown reason';
  }

  getHumanFriendlyConsoleMessage(messageData, type) {
    const args = messageData.args || [];
    const message = this.formatConsoleArgs(args);
    const icon = type === 'error' ? '🔴' : '⚠️';
    
    return \`\${icon} Console \${type}: \${message.substring(0, 80)}\${message.length > 80 ? '...' : ''}\`;
  }

  getHumanFriendlyResourceMessage(errorData) {
    const elementType = errorData.tagName?.toLowerCase() || 'resource';
    const source = errorData.source || 'unknown source';
    
    const typeMap = {
      'img': 'image',
      'script': 'JavaScript file',
      'link': 'stylesheet',
      'video': 'video',
      'audio': 'audio file'
    };
    
    const friendlyType = typeMap[elementType] || elementType;
    const fileName = source.split('/').pop() || source;
    
    return \`📦 Failed to load \${friendlyType}: \${fileName}\`;
  }

  formatConsoleArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 0);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(arg);
    }).join(' ');
  }

  formatLocation(errorData) {
    if (errorData.filename) {
      const fileName = errorData.filename.split('/').pop();
      if (errorData.lineno) {
        return \`\${fileName}:\${errorData.lineno}\`;
      }
      return fileName;
    }
    return null;
  }

  determineSeverity(errorType) {
    const severityMap = {
      'TypeError': 'high',
      'ReferenceError': 'high',
      'SyntaxError': 'high',
      'NetworkError': 'medium',
      'SecurityError': 'high',
      'RangeError': 'medium',
      'unknown': 'low'
    };
    
    return severityMap[errorType] || 'medium';
  }

  getSuggestions(errorType, errorData) {
    const suggestions = {
      'TypeError': [
        'Check if variables are defined before using them',
        'Verify that objects have the properties you\'re trying to access',
        'Make sure you\'re calling methods on the right type of object'
      ],
      'ReferenceError': [
        'Check for typos in variable or function names',
        'Make sure variables are declared before use',
        'Verify that external libraries are loaded properly'
      ],
      'SyntaxError': [
        'Look for missing brackets, quotes, or semicolons',
        'Check for proper nesting of code blocks',
        'Verify that all opened brackets are closed'
      ],
      'NetworkError': [
        'Check your internet connection',
        'Verify that the server is responding',
        'Check for CORS (cross-origin) issues'
      ],
      'SecurityError': [
        'Check browser security policies',
        'Verify that HTTPS is used where required',
        'Review cross-origin request settings'
      ]
    };
    
    return suggestions[errorType] || ['Try refreshing the page', 'Check the browser console for more details'];
  }

  generateErrorId() {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  // Visual feedback methods
  showErrorNotification(errorData) {
    const notification = document.createElement('div');
    notification.className = 'dr-dom-error-notification';
    
    const severity = errorData.severity || 'medium';
    const category = this.categorizeError(errorData.error);
    
    notification.innerHTML = \`
      <div class="error-icon">\${category.icon}</div>
      <div class="error-content">
        <div class="error-title">Oops! Something went wrong</div>
        <div class="error-message">\${errorData.humanMessage}</div>
      </div>
      <div class="error-close" onclick="this.parentElement.remove()">×</div>
    \`;
    
    notification.setAttribute('data-severity', severity);
    notification.style.cssText = \`
      position: fixed;
      top: 20px;
      right: 20px;
      background: \${this.getSeverityColor(severity)};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 2147483647;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.3;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      animation: dr-dom-error-slide-in 0.3s ease-out;
      cursor: pointer;
    \`;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'dr-dom-error-slide-out 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
      notification.style.animation = 'dr-dom-error-slide-out 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    });
  }

  showResourceErrorNotification(errorData) {
    // Show subtler notification for resource errors
    const notification = document.createElement('div');
    notification.className = 'dr-dom-resource-error';
    notification.innerHTML = \`📦 \${errorData.humanMessage}\`;
    
    notification.style.cssText = \`
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: rgba(251, 191, 36, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 16px;
      font-size: 11px;
      z-index: 2147483646;
      backdrop-filter: blur(10px);
      animation: dr-dom-resource-fade 3s ease-out forwards;
    \`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  showTrackingNotification(icon, message, type = 'info') {
    const colors = {
      success: '#10b981',
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    
    const notification = document.createElement('div');
    notification.innerHTML = \`\${icon} \${message}\`;
    notification.style.cssText = \`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: \${colors[type]};
      color: white;
      padding: 16px 24px;
      border-radius: 24px;
      font-weight: 600;
      z-index: 2147483647;
      animation: dr-dom-tracking-pulse 1.5s ease-out forwards;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    \`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1500);
  }

  createErrorIndicator(errorData) {
    // Create floating error indicator at error location if possible
    if (errorData.filename && errorData.lineno) {
      const indicator = document.createElement('div');
      indicator.className = 'dr-dom-error-indicator';
      indicator.innerHTML = '🐛';
      
      indicator.style.cssText = \`
        position: fixed;
        top: \${Math.random() * (window.innerHeight - 50)}px;
        left: \${Math.random() * (window.innerWidth - 50)}px;
        width: 30px;
        height: 30px;
        background: rgba(239, 68, 68, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        z-index: 2147483646;
        animation: dr-dom-error-float 3s ease-out forwards;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      \`;
      
      // Show details on click
      indicator.title = errorData.humanMessage;
      indicator.addEventListener('click', () => {
        alert(\`🐛 Error Details:\\n\\n\${errorData.humanMessage}\\n\\nLocation: \${errorData.location || 'Unknown'}\`);
        indicator.remove();
      });
      
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 3000);
    }
  }

  getSeverityColor(severity) {
    const colors = {
      high: 'linear-gradient(135deg, #ef4444, #dc2626)',
      medium: 'linear-gradient(135deg, #f59e0b, #d97706)',
      low: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    
    return colors[severity] || colors.medium;
  }

  injectVisualStyles() {
    const styles = document.createElement('style');
    styles.textContent = \`
      @keyframes dr-dom-error-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes dr-dom-error-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      @keyframes dr-dom-resource-fade {
        0% { opacity: 0; transform: scale(0.8); }
        20% { opacity: 1; transform: scale(1); }
        80% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
      }
      
      @keyframes dr-dom-tracking-pulse {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
      
      @keyframes dr-dom-error-float {
        0% { opacity: 0; transform: scale(0) rotate(0deg); }
        20% { opacity: 1; transform: scale(1) rotate(10deg); }
        80% { opacity: 1; transform: scale(1) rotate(-5deg); }
        100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
      }
      
      .dr-dom-error-notification {
        transition: all 0.3s ease !important;
      }
      
      .dr-dom-error-notification:hover {
        transform: scale(1.02) !important;
      }
      
      .error-icon {
        font-size: 16px;
        flex-shrink: 0;
      }
      
      .error-content {
        flex: 1;
      }
      
      .error-title {
        font-weight: 600;
        margin-bottom: 2px;
      }
      
      .error-message {
        opacity: 0.9;
        font-size: 12px;
      }
      
      .error-close {
        cursor: pointer;
        font-size: 18px;
        opacity: 0.7;
        flex-shrink: 0;
        margin-left: 8px;
      }
      
      .error-close:hover {
        opacity: 1;
      }
    \`;
    
    document.head.appendChild(styles);
  }

  // API methods for external use
  getErrors() {
    return this.errors;
  }

  getWarnings() {
    return this.warnings;
  }

  getConsoleMessages() {
    return this.consoleMessages;
  }

  getErrorSummary() {
    const highSeverity = this.errors.filter(e => e.severity === 'high').length;
    const mediumSeverity = this.errors.filter(e => e.severity === 'medium').length;
    const lowSeverity = this.errors.filter(e => e.severity === 'low').length;
    
    return {
      totalErrors: this.errorCount,
      totalWarnings: this.warningCount,
      severityBreakdown: {
        high: highSeverity,
        medium: mediumSeverity,
        low: lowSeverity
      },
      mostCommonError: this.getMostCommonErrorType(),
      recentErrors: this.errors.slice(-5),
      suggestions: this.getOverallSuggestions()
    };
  }

  getMostCommonErrorType() {
    const errorTypes = {};
    this.errors.forEach(error => {
      const type = error.errorType || 'unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });
    
    let mostCommon = 'none';
    let maxCount = 0;
    
    Object.entries(errorTypes).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    });
    
    return { type: mostCommon, count: maxCount };
  }

  getOverallSuggestions() {
    const suggestions = [];
    
    if (this.errorCount === 0) {
      suggestions.push('🎉 No errors detected - the website is running smoothly!');
    } else if (this.errorCount < 3) {
      suggestions.push('👍 Just a few minor issues - overall the website is working well');
    } else if (this.errorCount < 10) {
      suggestions.push('⚠️ Several errors detected - consider investigating the most frequent ones');
    } else {
      suggestions.push('🚨 Many errors detected - this website may have significant issues');
    }
    
    if (this.errors.filter(e => e.severity === 'high').length > 0) {
      suggestions.push('🔧 Focus on fixing high-severity errors first for the biggest impact');
    }
    
    return suggestions;
  }

  clearData() {
    this.errors = [];
    this.warnings = [];
    this.consoleMessages = [];
    this.errorCount = 0;
    this.warningCount = 0;
  }

  // Search functionality
  searchErrors(query) {
    if (!query.trim()) return this.errors;
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.errors.filter(error => {
      const searchableText = [
        error.humanMessage,
        error.message || '',
        error.filename || '',
        error.errorType || '',
        error.category?.description || ''
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
}

// Initialize and expose globally
window.drDOMErrorTracker = new DrDOMErrorTracker();

// Auto-start tracking when Dr. DOM Inspector is active
document.addEventListener('DOMContentLoaded', () => {
  // Start tracking by default if not in an iframe
  if (window === window.top) {
    setTimeout(() => {
      if (window.drDOMErrorTracker) {
        window.drDOMErrorTracker.startTracking();
      }
    }, 1000);
  }
});

console.log('🐛 Dr. DOM Error Tracker ready - making bug hunting fun and accessible!');