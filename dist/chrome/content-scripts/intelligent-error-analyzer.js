/**
 * Dr. DOM Intelligent Error Analyzer
 * Advanced error categorization, pattern recognition, and smart console analysis
 * Makes debugging intelligent and accessible for everyone
 */

class DrDOMIntelligentErrorAnalyzer {
  constructor() {
    this.isAnalyzing = false;
    this.errors = new Map();
    this.consoleMessages = [];
    this.errorPatterns = new Map();
    this.performanceMarkers = new Map();
    this.performanceIssues = [];
    
    // Intelligent categorization
    this.errorCategories = {
      // JavaScript Runtime Errors
      'TypeError': {
        icon: '🤔',
        category: 'JavaScript Runtime',
        severity: 'high',
        description: 'Something tried to use data in the wrong way',
        commonCauses: [
          'Accessing properties on null/undefined',
          'Calling non-function as function',
          'Type conversion issues'
        ],
        solutions: [
          'Add null checks before accessing properties',
          'Verify variable types before operations',
          'Use optional chaining (?.) for safer access'
        ]
      },
      'ReferenceError': {
        icon: '👻',
        category: 'JavaScript Runtime',
        severity: 'high',
        description: 'Trying to use something that doesn\'t exist',
        commonCauses: [
          'Misspelled variable names',
          'Using variables before declaration',
          'Missing script imports'
        ],
        solutions: [
          'Check variable spelling and scope',
          'Ensure proper script loading order',
          'Add variable declarations'
        ]
      },
      'SyntaxError': {
        icon: '📝',
        category: 'JavaScript Syntax',
        severity: 'critical',
        description: 'Code has spelling or grammar mistakes',
        commonCauses: [
          'Missing brackets or quotes',
          'Invalid JavaScript syntax',
          'Malformed JSON'
        ],
        solutions: [
          'Check for matching brackets and quotes',
          'Validate JSON structure',
          'Use code linting tools'
        ]
      },
      'RangeError': {
        icon: '📏',
        category: 'JavaScript Runtime',
        severity: 'medium',
        description: 'Numbers went outside their allowed range',
        commonCauses: [
          'Array index out of bounds',
          'Invalid function arguments',
          'Recursive function overflow'
        ],
        solutions: [
          'Validate array indices',
          'Check function argument ranges',
          'Add recursion limits'
        ]
      },
      'NetworkError': {
        icon: '🌐',
        category: 'Network Issues',
        severity: 'high',
        description: 'Problem connecting to servers',
        commonCauses: [
          'Server is down',
          'Network connectivity issues',
          'CORS restrictions'
        ],
        solutions: [
          'Check server status',
          'Verify network connection',
          'Configure CORS headers'
        ]
      },
      'SecurityError': {
        icon: '🔒',
        category: 'Security Issues',
        severity: 'critical',
        description: 'Browser security blocked the action',
        commonCauses: [
          'Mixed content (HTTP/HTTPS)',
          'Cross-origin restrictions',
          'Content Security Policy violations'
        ],
        solutions: [
          'Use HTTPS for all resources',
          'Configure CORS properly',
          'Update Content Security Policy'
        ]
      },
      'PromiseRejection': {
        icon: '🚫',
        category: 'Async Operations',
        severity: 'high',
        description: 'A background task failed',
        commonCauses: [
          'API request failures',
          'Timeout errors',
          'Unhandled async errors'
        ],
        solutions: [
          'Add proper error handling',
          'Implement retry logic',
          'Use try-catch with async/await'
        ]
      },
      'ConsoleError': {
        icon: '🔴',
        category: 'Application Logic',
        severity: 'medium',
        description: 'Application reported an error',
        commonCauses: [
          'Business logic errors',
          'Validation failures',
          'External library errors'
        ],
        solutions: [
          'Review application logic',
          'Add input validation',
          'Update external dependencies'
        ]
      }
    };

    // Console message patterns
    this.consolePatterns = {
      // Performance warnings
      performance: {
        patterns: [
          /performance|slow|lag|freeze|block/i,
          /memory|leak|heap|garbage/i,
          /fps|frame|render/i
        ],
        category: 'Performance',
        icon: '⚡',
        severity: 'medium'
      },
      
      // Security warnings
      security: {
        patterns: [
          /security|xss|csrf|injection/i,
          /cors|origin|blocked|denied/i,
          /content.security.policy|csp/i
        ],
        category: 'Security',
        icon: '🔒',
        severity: 'high'
      },
      
      // Deprecation warnings
      deprecation: {
        patterns: [
          /deprecated|legacy|obsolete/i,
          /will be removed|no longer supported/i,
          /consider using|migrate to/i
        ],
        category: 'Deprecation',
        icon: '⚠️',
        severity: 'low'
      },
      
      // Network issues
      network: {
        patterns: [
          /failed to fetch|network error/i,
          /timeout|connection refused/i,
          /404|500|502|503/i
        ],
        category: 'Network',
        icon: '🌐',
        severity: 'medium'
      },
      
      // Third-party errors
      thirdParty: {
        patterns: [
          /google|facebook|twitter|youtube/i,
          /analytics|gtag|ga\(/i,
          /ads|advertisement/i
        ],
        category: 'Third Party',
        icon: '🔌',
        severity: 'low'
      }
    };

    // Error impact analysis
    this.impactAnalysis = {
      critical: {
        threshold: 10,
        description: 'May break core functionality',
        color: '#ef4444',
        priority: 1
      },
      high: {
        threshold: 5,
        description: 'Affects user experience significantly',
        color: '#f97316',
        priority: 2
      },
      medium: {
        threshold: 2,
        description: 'Minor user experience impact',
        color: '#eab308',
        priority: 3
      },
      low: {
        threshold: 1,
        description: 'Minimal impact on users',
        color: '#3b82f6',
        priority: 4
      }
    };

    this.init();
  }

  init() {
    this.setupIntelligentErrorCapture();
    this.setupConsoleAnalysis();
    this.setupPerformanceMonitoring();
    this.setupPatternRecognition();
    console.log('🧠 Intelligent Error Analyzer initialized - smart debugging ready!');
  }

  setupIntelligentErrorCapture() {
    // Enhanced global error handling with context
    window.addEventListener('error', (event) => {
      if (this.isAnalyzing) {
        this.analyzeJavaScriptError({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
          timestamp: Date.now(),
          type: 'javascript',
          stack: event.error?.stack,
          element: event.target,
          context: this.captureErrorContext()
        });
      }
    }, true);

    // Enhanced unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isAnalyzing) {
        this.analyzePromiseRejection({
          reason: event.reason,
          promise: event.promise,
          timestamp: Date.now(),
          type: 'promise',
          stack: event.reason?.stack,
          context: this.captureErrorContext()
        });
      }
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (this.isAnalyzing && event.target !== window) {
        this.analyzeResourceError({
          element: event.target,
          source: event.target.src || event.target.href,
          tagName: event.target.tagName,
          timestamp: Date.now(),
          type: 'resource',
          context: this.captureErrorContext()
        });
      }
    }, true);
  }

  setupConsoleAnalysis() {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      group: console.group,
      groupEnd: console.groupEnd,
      time: console.time,
      timeEnd: console.timeEnd
    };

    // Intelligent console interception
    this.interceptConsoleMethod('error', 'high');
    this.interceptConsoleMethod('warn', 'medium');
    this.interceptConsoleMethod('info', 'low');
    this.interceptConsoleMethod('debug', 'low');
    this.interceptConsoleMethod('log', 'low');

    // Performance timing interception
    console.time = (label) => {
      this.performanceMarkers.set(label, { start: performance.now(), type: 'timer' });
      return this.originalConsole.time.call(console, label);
    };

    console.timeEnd = (label) => {
      const marker = this.performanceMarkers.get(label);
      if (marker && this.isAnalyzing) {
        const duration = performance.now() - marker.start;
        this.analyzePerformanceMarker(label, duration);
      }
      return this.originalConsole.timeEnd.call(console, label);
    };
  }

  interceptConsoleMethod(method, defaultSeverity) {
    console[method] = (...args) => {
      if (this.isAnalyzing) {
        // Convert args to string message
        const message = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        
        this.analyzeConsoleMessage({
          method,
          args,
          message,
          timestamp: Date.now(),
          type: 'console',
          severity: defaultSeverity,
          stack: this.captureStackTrace(),
          context: this.captureErrorContext()
        });
      }
      return this.originalConsole[method].apply(console, args);
    };
  }

  setupPerformanceMonitoring() {
    // Monitor performance entries for error correlation
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (this.isAnalyzing) {
              this.analyzePerformanceEntry(entry);
            }
          }
        });
        observer.observe({ entryTypes: ['measure', 'mark', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('PerformanceObserver setup failed:', error);
      }
    }
  }

  setupPatternRecognition() {
    // Analyze error patterns every 10 seconds
    setInterval(() => {
      if (this.isAnalyzing) {
        this.analyzeErrorPatterns();
        this.generateIntelligentInsights();
      }
    }, 10000);
  }

  analyzeJavaScriptError(errorData) {
    const processedError = this.processError(errorData);
    this.errors.set(processedError.id, processedError);
    
    // Pattern recognition
    this.updateErrorPatterns(processedError);
    
    // Visual feedback
    this.showIntelligentErrorNotification(processedError);
    
    // Impact analysis
    // Use the existing assessErrorImpact method
    processedError.impact = this.assessErrorImpact(processedError);
    
    // Notify coordinator
    if (window.drDOMCoordinator) {
      window.drDOMCoordinator.onErrorDetected(processedError);
    }
    
    console.log('🧠 JavaScript error analyzed:', processedError);
  }

  analyzePromiseRejection(rejectionData) {
    const processedError = {
      ...rejectionData,
      id: this.generateErrorId(),
      category: 'PromiseRejection',
      processed: this.processPromiseRejection(rejectionData),
      severity: this.determineSeverity(rejectionData.reason),
      humanExplanation: this.generateHumanExplanation('PromiseRejection', rejectionData),
      suggestions: this.generateSuggestions('PromiseRejection', rejectionData),
      impact: this.assessErrorImpact(rejectionData)
    };

    this.errors.set(processedError.id, processedError);
    this.updateErrorPatterns(processedError);
    this.showIntelligentErrorNotification(processedError);
    
    if (window.drDOMCoordinator) {
      window.drDOMCoordinator.onErrorDetected(processedError);
    }
    
    console.log('🧠 Promise rejection analyzed:', processedError);
  }

  analyzeResourceError(resourceData) {
    const processedError = {
      ...resourceData,
      id: this.generateErrorId(),
      category: 'ResourceError',
      severity: this.determineResourceSeverity(resourceData),
      humanExplanation: this.generateResourceExplanation(resourceData),
      suggestions: this.generateResourceSuggestions(resourceData),
      impact: this.assessResourceImpact(resourceData)
    };

    this.errors.set(processedError.id, processedError);
    this.updateErrorPatterns(processedError);
    this.showResourceErrorNotification(processedError);
    
    if (window.drDOMCoordinator) {
      window.drDOMCoordinator.onErrorDetected(processedError);
    }
  }

  analyzeConsoleMessage(messageData) {
    const processedMessage = this.processConsoleMessage(messageData);
    this.consoleMessages.push(processedMessage);
    
    // Pattern recognition for console messages
    this.analyzeConsolePatterns(processedMessage);
    
    // Check for spam/noise
    this.detectConsoleSpam(processedMessage);
    
    // Performance correlation
    this.correlateWithPerformance(processedMessage);
    
    // Send to coordinator if it has the method
    if (window.drDOMCoordinator && typeof window.drDOMCoordinator.onConsoleMessage === 'function') {
      window.drDOMCoordinator.onConsoleMessage(processedMessage);
    }
  }

  processError(errorData) {
    const errorType = this.classifyError(errorData.error || errorData.message);
    const category = this.errorCategories[errorType] || this.errorCategories['TypeError'];
    
    return {
      ...errorData,
      id: this.generateErrorId(),
      errorType,
      category: category.category,
      severity: category.severity,
      icon: category.icon,
      humanExplanation: this.generateHumanExplanation(errorType, errorData),
      technicalDetails: this.extractTechnicalDetails(errorData),
      suggestions: this.generateSuggestions(errorType, errorData),
      relatedErrors: this.findRelatedErrors(errorData),
      impact: this.assessErrorImpact(errorData),
      debuggingSteps: this.generateDebuggingSteps(errorType, errorData),
      codeContext: this.extractCodeContext(errorData)
    };
  }

  classifyError(error) {
    if (!error) return 'Unknown';
    
    const message = error.message || error.toString() || '';
    const name = error.name || '';
    
    // Direct type matching
    if (this.errorCategories[name]) return name;
    
    // Pattern matching for custom errors
    if (message.includes('fetch') || message.includes('network')) return 'NetworkError';
    if (message.includes('permission') || message.includes('blocked')) return 'SecurityError';
    if (message.includes('rejected') || message.includes('promise')) return 'PromiseRejection';
    if (message.includes('console') || name.includes('Console')) return 'ConsoleError';
    
    // Fallback to TypeError for most runtime errors
    return 'TypeError';
  }

  generateHumanExplanation(errorType, errorData) {
    const category = this.errorCategories[errorType];
    if (!category) return 'Something went wrong, but we\'re not sure what.';
    
    let explanation = category.description;
    
    // Add context-specific details
    if (errorData.filename) {
      const fileName = errorData.filename.split('/').pop();
      explanation += ` This happened in ${fileName}`;
      if (errorData.lineno) {
        explanation += ` on line ${errorData.lineno}`;
      }
    }
    
    // Add common cause if available
    const message = errorData.message || errorData.error?.message || '';
    if (message.includes('null') || message.includes('undefined')) {
      explanation += '. It looks like you\'re trying to use something that doesn\'t exist yet.';
    } else if (message.includes('not a function')) {
      explanation += '. You\'re trying to call something as a function, but it\'s not one.';
    }
    
    return explanation;
  }

  generateSuggestions(errorType, errorData) {
    const category = this.errorCategories[errorType];
    const baseSuggestions = category?.solutions || [];
    const customSuggestions = [];
    
    // Add context-specific suggestions
    const message = errorData.message || errorData.error?.message || '';
    
    if (message.includes('null') || message.includes('undefined')) {
      customSuggestions.push('Add a check: if (variable) { /* use variable */ }');
    }
    
    if (message.includes('not a function')) {
      customSuggestions.push('Make sure you\'re calling a function, not a property');
    }
    
    if (errorData.filename && errorData.filename.includes('node_modules')) {
      customSuggestions.push('This error is from an external library - consider updating it');
    }
    
    return [...baseSuggestions, ...customSuggestions];
  }

  generateDebuggingSteps(errorType, errorData) {
    const steps = [];
    
    // General debugging steps
    steps.push('1. Check the browser console for more details');
    steps.push('2. Look at the exact line where the error occurred');
    
    // Specific steps based on error type
    if (errorType === 'TypeError') {
      steps.push('3. Add console.log() before the error to check variable values');
      steps.push('4. Use null checks (if/else) to handle missing data');
    } else if (errorType === 'ReferenceError') {
      steps.push('3. Check if all variables are properly declared');
      steps.push('4. Verify script loading order');
    } else if (errorType === 'NetworkError') {
      steps.push('3. Check if the server is running and accessible');
      steps.push('4. Look for CORS issues in the network tab');
    }
    
    steps.push('5. Try refreshing the page to see if it\'s a temporary issue');
    
    return steps;
  }

  extractTechnicalDetails(errorData) {
    return {
      message: errorData.message || 'No message available',
      stack: this.formatStackTrace(errorData.stack),
      filename: errorData.filename || 'Unknown',
      line: errorData.lineno || 'Unknown',
      column: errorData.colno || 'Unknown',
      timestamp: new Date(errorData.timestamp).toLocaleString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  extractCodeContext(errorData) {
    // Try to extract code context from stack trace
    if (!errorData.stack) return null;
    
    const lines = errorData.stack.split('\n');
    const relevantLines = lines.slice(0, 5).map(line => {
      // Clean up stack trace lines
      const cleaned = line.trim().replace(/^\s*at\s+/, '');
      return cleaned;
    });
    
    return {
      stack: relevantLines,
      file: errorData.filename,
      line: errorData.lineno
    };
  }

  processConsoleMessage(messageData) {
    const messageText = this.formatConsoleArgs(messageData.args);
    const category = this.categorizeConsoleMessage(messageText);
    const severity = this.determineConsoleSeverity(messageData.method, messageText, category);
    
    return {
      ...messageData,
      id: this.generateErrorId(),
      messageText,
      category: category.category,
      icon: category.icon,
      severity,
      humanExplanation: this.generateConsoleExplanation(messageData.method, messageText, category),
      isSpam: this.detectSpamMessage(messageText),
      isThirdParty: this.detectThirdPartyMessage(messageText),
      performanceImpact: this.assessConsolePerformanceImpact(messageData)
    };
  }

  categorizeConsoleMessage(message) {
    for (const [type, config] of Object.entries(this.consolePatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(message)) {
          return {
            category: config.category,
            icon: config.icon,
            type
          };
        }
      }
    }
    
    return {
      category: 'General',
      icon: 'ℹ️',
      type: 'general'
    };
  }

  determineConsoleSeverity(method, message, category) {
    // Base severity from method
    let severity = {
      error: 'high',
      warn: 'medium',
      info: 'low',
      debug: 'low',
      log: 'low'
    }[method] || 'low';
    
    // Adjust based on category
    if (category.category === 'Security') severity = 'critical';
    else if (category.category === 'Performance') severity = 'medium';
    else if (category.category === 'Network') severity = 'medium';
    
    // Adjust based on content
    if (message.includes('critical') || message.includes('fatal')) severity = 'critical';
    else if (message.includes('deprecated') && method === 'warn') severity = 'low';
    
    return severity;
  }

  generateConsoleExplanation(method, message, category) {
    const methodExplanations = {
      error: 'The application reported an error',
      warn: 'The application issued a warning',
      info: 'The application provided information',
      debug: 'Debug information was logged',
      log: 'The application logged a message'
    };
    
    let explanation = methodExplanations[method] || 'A message was logged';
    
    if (category.category !== 'General') {
      explanation += ` related to ${category.category.toLowerCase()}`;
    }
    
    // Add specific context
    if (message.includes('deprecated')) {
      explanation += '. This feature will be removed in the future.';
    } else if (message.includes('failed')) {
      explanation += '. Something didn\'t work as expected.';
    }
    
    return explanation;
  }

  analyzeConsolePatterns(message) {
    const text = message.messageText.toLowerCase();
    
    // Detect repeated messages (spam)
    const existingSimilar = this.consoleMessages.filter(msg => 
      msg.messageText === message.messageText &&
      (Date.now() - msg.timestamp) < 10000 // Within 10 seconds
    );
    
    if (existingSimilar.length > 5) {
      message.isSpam = true;
      message.spamCount = existingSimilar.length;
    }
    
    // Detect error cascades
    if (message.severity === 'high') {
      const recentErrors = this.consoleMessages.filter(msg =>
        msg.severity === 'high' &&
        (Date.now() - msg.timestamp) < 5000 // Within 5 seconds
      );
      
      if (recentErrors.length > 3) {
        message.isCascade = true;
      }
    }
  }

  detectSpamMessage(message) {
    const spamPatterns = [
      /tracking|analytics|ga\(/i,
      /facebook|fb|twitter/i,
      /ad\s|advertisement/i,
      /cookie|consent/i
    ];
    
    return spamPatterns.some(pattern => pattern.test(message));
  }

  detectThirdPartyMessage(message) {
    const thirdPartyIndicators = [
      /node_modules/,
      /googleapis|gstatic/i,
      /facebook\.com|google/i,
      /jquery|bootstrap|react/i
    ];
    
    return thirdPartyIndicators.some(indicator => indicator.test(message));
  }

  analyzeErrorPatterns() {
    const recentErrors = Array.from(this.errors.values()).filter(error =>
      Date.now() - error.timestamp < 300000 // Last 5 minutes
    );
    
    // Group by error type
    const errorGroups = {};
    recentErrors.forEach(error => {
      const key = error.errorType;
      if (!errorGroups[key]) errorGroups[key] = [];
      errorGroups[key].push(error);
    });
    
    // Analyze patterns
    Object.entries(errorGroups).forEach(([type, errors]) => {
      if (errors.length > 1) {
        this.errorPatterns.set(type, {
          count: errors.length,
          frequency: errors.length / (300 / 60), // Per minute
          lastOccurrence: Math.max(...errors.map(e => e.timestamp)),
          commonFiles: this.findCommonFiles(errors),
          trend: this.analyzeTrend(errors)
        });
      }
    });
  }

  findCommonFiles(errors) {
    const files = {};
    errors.forEach(error => {
      if (error.filename) {
        const fileName = error.filename.split('/').pop();
        files[fileName] = (files[fileName] || 0) + 1;
      }
    });
    
    return Object.entries(files)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([file, count]) => ({ file, count }));
  }

  analyzeTrend(errors) {
    if (errors.length < 2) return 'stable';
    
    const sortedErrors = errors.sort((a, b) => a.timestamp - b.timestamp);
    const intervals = [];
    
    for (let i = 1; i < sortedErrors.length; i++) {
      intervals.push(sortedErrors[i].timestamp - sortedErrors[i-1].timestamp);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval < 30000) return 'increasing'; // Less than 30 seconds between errors
    if (avgInterval > 120000) return 'decreasing'; // More than 2 minutes between errors
    return 'stable';
  }

  generateIntelligentInsights() {
    const insights = [];
    
    // Pattern analysis insights
    this.errorPatterns.forEach((pattern, errorType) => {
      if (pattern.frequency > 0.5) { // More than once every 2 minutes
        insights.push({
          type: 'pattern',
          severity: 'high',
          title: `Frequent ${errorType} Errors`,
          description: `${errorType} is occurring ${pattern.frequency.toFixed(1)} times per minute`,
          suggestion: `This suggests a systematic issue that needs immediate attention`,
          data: pattern
        });
      }
    });
    
    // Performance insights
    const performanceMessages = this.consoleMessages.filter(msg => 
      msg.category === 'Performance' && 
      Date.now() - msg.timestamp < 300000
    );
    
    if (performanceMessages.length > 5) {
      insights.push({
        type: 'performance',
        severity: 'medium',
        title: 'Performance Issues Detected',
        description: `${performanceMessages.length} performance-related messages in the last 5 minutes`,
        suggestion: 'Consider optimizing code for better performance',
        data: { count: performanceMessages.length }
      });
    }
    
    // Security insights
    const securityMessages = this.consoleMessages.filter(msg =>
      msg.category === 'Security' &&
      Date.now() - msg.timestamp < 300000
    );
    
    if (securityMessages.length > 0) {
      insights.push({
        type: 'security',
        severity: 'critical',
        title: 'Security Issues Detected',
        description: `${securityMessages.length} security-related warnings found`,
        suggestion: 'Review security configurations and fix issues immediately',
        data: { count: securityMessages.length }
      });
    }
    
    // Store insights locally (coordinator will fetch them)
    
    return insights;
  }

  assessErrorImpact(errorData) {
    let impactScore = 1;
    
    // Critical errors get higher impact
    if (errorData.errorType === 'SecurityError') impactScore += 5;
    if (errorData.errorType === 'SyntaxError') impactScore += 4;
    if (errorData.errorType === 'ReferenceError') impactScore += 3;
    
    // Errors in main app files are more impactful
    if (errorData.filename && !errorData.filename.includes('node_modules')) {
      impactScore += 2;
    }
    
    // Recent errors are more impactful
    if (Date.now() - errorData.timestamp < 60000) { // Last minute
      impactScore += 1;
    }
    
    // Determine impact level
    if (impactScore >= 7) return 'critical';
    if (impactScore >= 5) return 'high';
    if (impactScore >= 3) return 'medium';
    return 'low';
  }

  findRelatedErrors(errorData) {
    // Find errors that might be related to this one
    const related = [];
    const errorsList = Array.from(this.errors.values());
    const similarErrors = errorsList.filter(err => {
      if (err.id === errorData.id) return false;
      
      // Same type of error
      if (err.errorType === errorData.errorType) {
        // Within 5 seconds
        if (Math.abs(err.timestamp - errorData.timestamp) < 5000) {
          related.push({
            id: err.id,
            type: 'same-type',
            message: err.message,
            timestamp: err.timestamp
          });
          return true;
        }
      }
      
      // Same file
      if (err.filename === errorData.filename) {
        // Within 30 seconds
        if (Math.abs(err.timestamp - errorData.timestamp) < 30000) {
          related.push({
            id: err.id,
            type: 'same-file',
            message: err.message,
            timestamp: err.timestamp
          });
          return true;
        }
      }
      
      return false;
    });
    
    return related;
  }
  
  analyzePerformanceEntry(entry) {
    // Analyze performance timing entries
    if (entry.duration > 3000) {
      this.performanceIssues.push({
        type: 'slow-resource',
        name: entry.name,
        duration: entry.duration,
        timestamp: entry.startTime
      });
    }
    
    // Check for large resources
    if (entry.transferSize && entry.transferSize > 1000000) { // 1MB
      this.performanceIssues.push({
        type: 'large-resource',
        name: entry.name,
        size: entry.transferSize,
        timestamp: entry.startTime
      });
    }
  }
  
  assessConsolePerformanceImpact(messageData) {
    // Assess if console message indicates performance issues
    const performanceKeywords = [
      'slow', 'performance', 'lag', 'delay', 'timeout',
      'memory', 'leak', 'optimization', 'render', 'paint'
    ];
    
    // Handle undefined or non-string messages
    if (!messageData || !messageData.message) {
      return 'low';
    }
    
    const message = String(messageData.message).toLowerCase();
    let impactScore = 0;
    
    performanceKeywords.forEach(keyword => {
      if (message.includes(keyword)) {
        impactScore++;
      }
    });
    
    // Check for timing information
    if (/\d+ms/.test(message) || /\d+s/.test(message)) {
      const timeMatch = message.match(/(\d+)(ms|s)/);
      if (timeMatch) {
        const time = parseInt(timeMatch[1]);
        const unit = timeMatch[2];
        const timeInMs = unit === 's' ? time * 1000 : time;
        
        if (timeInMs > 1000) {
          impactScore += 2;
        }
      }
    }
    
    if (impactScore >= 3) return 'high';
    if (impactScore >= 1) return 'medium';
    return 'low';
  }

  updateErrorPatterns(errorData) {
    // Track error patterns for trend analysis
    const errorType = errorData.errorType || 'Unknown';
    
    if (!this.errorPatterns.has(errorType)) {
      this.errorPatterns.set(errorType, {
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        frequency: 0,
        examples: []
      });
    }
    
    const pattern = this.errorPatterns.get(errorType);
    pattern.count++;
    pattern.lastSeen = Date.now();
    pattern.frequency = pattern.count / ((Date.now() - pattern.firstSeen) / 60000); // errors per minute
    
    if (pattern.examples.length < 3) {
      pattern.examples.push({
        message: errorData.message,
        timestamp: errorData.timestamp
      });
    }
  }
  
  analyzeConsolePatterns(messageData) {
    // Analyze patterns in console messages
    const patterns = {
      apiCalls: /fetch|xhr|ajax|api/i,
      errors: /error|fail|exception/i,
      warnings: /warn|deprecat|notice/i,
      performance: /slow|lag|delay|performance/i,
      security: /security|csrf|xss|injection/i
    };
    
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(messageData.message)) {
        messageData.category = category;
        break;
      }
    }
  }
  
  detectConsoleSpam(messageData) {
    // Detect repetitive console messages
    const recentMessages = this.consoleMessages.slice(-10);
    const similarCount = recentMessages.filter(msg => 
      msg.message === messageData.message
    ).length;
    
    if (similarCount >= 3) {
      messageData.isSpam = true;
      messageData.spamCount = similarCount;
    }
  }
  
  correlateWithPerformance(messageData) {
    // Correlate console messages with performance issues
    if (messageData.category === 'performance' || messageData.performanceImpact === 'high') {
      // Mark for performance correlation
      messageData.correlatePerformance = true;
    }
  }

  showIntelligentErrorNotification(error) {
    const notification = document.createElement('div');
    notification.className = 'dr-dom-intelligent-error-notification';
    
    const severity = error.severity || 'medium';
    const category = this.errorCategories[error.errorType] || this.errorCategories['TypeError'];
    
    notification.innerHTML = `
      <div class="error-header">
        <div class="error-icon">${category.icon}</div>
        <div class="error-title">${category.description}</div>
        <div class="error-severity ${severity}">${severity.toUpperCase()}</div>
      </div>
      <div class="error-explanation">${error.humanExplanation}</div>
      <div class="error-actions">
        <button class="error-action-btn" onclick="this.parentElement.parentElement.querySelector('.error-details').style.display='block'; this.style.display='none';">
          Show Details
        </button>
        <button class="error-dismiss-btn" onclick="this.parentElement.parentElement.remove();">
          Dismiss
        </button>
      </div>
      <div class="error-details" style="display: none;">
        <div class="error-suggestions">
          <strong>💡 Suggestions:</strong>
          <ul>${error.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="error-technical">
          <strong>🔧 Technical Details:</strong>
          <div class="tech-detail">File: ${error.technicalDetails?.filename || 'Unknown'}</div>
          <div class="tech-detail">Line: ${error.technicalDetails?.line || 'Unknown'}</div>
          <div class="tech-detail">Message: ${error.technicalDetails?.message || 'No message'}</div>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: white;
      border-left: 4px solid ${this.getSeverityColor(severity)};
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      animation: dr-dom-intelligent-slide-in 0.4s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 10 seconds for low severity, 30 for high
    const dismissTime = severity === 'critical' ? 30000 : severity === 'high' ? 20000 : 10000;
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'dr-dom-intelligent-slide-out 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
      }
    }, dismissTime);
  }

  getSeverityColor(severity) {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#2563eb'
    };
    return colors[severity] || colors.medium;
  }

  // Utility methods
  captureErrorContext() {
    return {
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY
      }
    };
  }

  captureStackTrace() {
    try {
      throw new Error();
    } catch (e) {
      return e.stack;
    }
  }

  formatStackTrace(stack) {
    if (!stack) return 'No stack trace available';
    
    return stack
      .split('\n')
      .slice(1, 6) // Skip first line and take next 5
      .map(line => line.trim().replace(/^\s*at\s+/, ''))
      .filter(line => line && !line.includes('dr-dom'))
      .join('\n');
  }

  formatConsoleArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 0);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(arg);
    }).join(' ');
  }

  generateErrorId() {
    return 'intelligent_error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  // Public API
  startAnalyzing() {
    this.isAnalyzing = true;
    this.errors.clear();
    this.consoleMessages = [];
    this.errorPatterns.clear();
    console.log('🧠 Intelligent Error Analysis started - smart debugging active');
  }

  stopAnalyzing() {
    this.isAnalyzing = false;
    console.log('🧠 Intelligent Error Analysis stopped');
  }

  getIntelligentReport() {
    const recentErrors = Array.from(this.errors.values()).filter(error =>
      Date.now() - error.timestamp < 300000 // Last 5 minutes
    );

    const recentConsole = this.consoleMessages.filter(msg =>
      Date.now() - msg.timestamp < 300000
    );

    return {
      summary: {
        totalErrors: recentErrors.length,
        criticalErrors: recentErrors.filter(e => e.severity === 'critical').length,
        highSeverityErrors: recentErrors.filter(e => e.severity === 'high').length,
        consoleMessages: recentConsole.length,
        errorPatterns: this.errorPatterns.size,
        insights: this.generateIntelligentInsights()
      },
      errors: recentErrors,
      consoleMessages: recentConsole,
      patterns: Object.fromEntries(this.errorPatterns),
      categorization: this.getErrorCategorization(recentErrors),
      impact: this.getOverallImpactAssessment(recentErrors),
      recommendations: this.generateOverallRecommendations(recentErrors)
    };
  }

  getErrorCategorization(errors) {
    const categories = {};
    errors.forEach(error => {
      const cat = error.category;
      if (!categories[cat]) {
        categories[cat] = { count: 0, errors: [], severity: 'low' };
      }
      categories[cat].count++;
      categories[cat].errors.push(error.id);
      
      // Update category severity to highest error severity
      if (this.compareSeverity(error.severity, categories[cat].severity) > 0) {
        categories[cat].severity = error.severity;
      }
    });
    
    return categories;
  }

  compareSeverity(sev1, sev2) {
    const order = { low: 0, medium: 1, high: 2, critical: 3 };
    return order[sev1] - order[sev2];
  }

  getOverallImpactAssessment(errors) {
    if (errors.length === 0) return { level: 'none', description: 'No errors detected' };
    
    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const highCount = errors.filter(e => e.severity === 'high').length;
    
    if (criticalCount > 0) {
      return {
        level: 'critical',
        description: `${criticalCount} critical error${criticalCount > 1 ? 's' : ''} may break core functionality`,
        urgency: 'immediate'
      };
    }
    
    if (highCount > 3) {
      return {
        level: 'high',
        description: `${highCount} high-severity errors significantly impact user experience`,
        urgency: 'high'
      };
    }
    
    if (errors.length > 10) {
      return {
        level: 'medium',
        description: `${errors.length} errors detected - quality concerns`,
        urgency: 'medium'
      };
    }
    
    return {
      level: 'low',
      description: `${errors.length} minor error${errors.length > 1 ? 's' : ''} with minimal impact`,
      urgency: 'low'
    };
  }

  generateOverallRecommendations(errors) {
    const recommendations = [];
    
    // Critical errors
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      recommendations.push({
        priority: 1,
        title: 'Fix Critical Errors Immediately',
        description: `${criticalErrors.length} critical errors need immediate attention`,
        actions: ['Stop deployment', 'Fix syntax/security errors', 'Test thoroughly']
      });
    }
    
    // Pattern-based recommendations
    const errorTypes = {};
    errors.forEach(error => {
      errorTypes[error.errorType] = (errorTypes[error.errorType] || 0) + 1;
    });
    
    Object.entries(errorTypes).forEach(([type, count]) => {
      if (count > 2) {
        recommendations.push({
          priority: 2,
          title: `Address Recurring ${type} Errors`,
          description: `${count} ${type} errors suggest a systematic issue`,
          actions: this.errorCategories[type]?.solutions || ['Review code patterns', 'Add error handling']
        });
      }
    });
    
    // General recommendations
    if (errors.length > 5) {
      recommendations.push({
        priority: 3,
        title: 'Improve Error Handling',
        description: 'Multiple errors indicate need for better error handling',
        actions: ['Add try-catch blocks', 'Implement error boundaries', 'Add input validation']
      });
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }
}

// Initialize and expose globally
window.drDOMIntelligentErrorAnalyzer = new DrDOMIntelligentErrorAnalyzer();

// Add CSS for intelligent notifications
const intelligentStyles = document.createElement('style');
intelligentStyles.textContent = `
  @keyframes dr-dom-intelligent-slide-in {
    from { opacity: 0; transform: translateX(100%) scale(0.8); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  
  @keyframes dr-dom-intelligent-slide-out {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to { opacity: 0; transform: translateX(100%) scale(0.8); }
  }
  
  .dr-dom-intelligent-error-notification {
    padding: 16px;
    margin-bottom: 8px;
  }
  
  .error-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .error-icon {
    font-size: 18px;
  }
  
  .error-title {
    flex: 1;
    font-weight: 600;
    color: #1e293b;
  }
  
  .error-severity {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .error-severity.critical { background: #fee2e2; color: #dc2626; }
  .error-severity.high { background: #fed7aa; color: #ea580c; }
  .error-severity.medium { background: #fef3c7; color: #d97706; }
  .error-severity.low { background: #dbeafe; color: #2563eb; }
  
  .error-explanation {
    color: #64748b;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  
  .error-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .error-action-btn, .error-dismiss-btn {
    padding: 4px 8px;
    font-size: 11px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .error-action-btn:hover, .error-dismiss-btn:hover {
    background: #e2e8f0;
  }
  
  .error-details {
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    font-size: 12px;
  }
  
  .error-suggestions ul {
    margin: 4px 0;
    padding-left: 16px;
  }
  
  .tech-detail {
    margin: 2px 0;
    color: #64748b;
    font-family: monospace;
  }
`;
document.head.appendChild(intelligentStyles);

console.log('🧠 Dr. DOM Intelligent Error Analyzer ready - making debugging intelligent and accessible!');