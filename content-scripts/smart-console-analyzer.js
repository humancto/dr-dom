/**
 * Dr. DOM Smart Console Analyzer
 * Intelligent console monitoring with pattern recognition and smart categorization
 */

class DrDOMSmartConsoleAnalyzer {
  constructor() {
    this.isActive = false;
    this.consoleMessages = [];
    this.patterns = new Map();
    this.categories = {
      errors: [],
      warnings: [],
      info: [],
      debug: [],
      network: [],
      security: [],
      performance: [],
      user: []
    };
    
    // Console message analysis
    this.messageAnalysis = {
      errorPatterns: [],
      warningTrends: [],
      spamDetection: [],
      securityConcerns: [],
      performanceIssues: []
    };
    
    // Pattern recognition database
    this.knownPatterns = {
      security: [
        { pattern: /blocked:mixed-content/i, severity: 'high', type: 'Mixed Content' },
        { pattern: /cors|cross-origin/i, severity: 'medium', type: 'CORS Issue' },
        { pattern: /csp|content security policy/i, severity: 'medium', type: 'CSP Violation' },
        { pattern: /unsafe-eval|unsafe-inline/i, severity: 'high', type: 'Unsafe Script' }
      ],
      performance: [
        { pattern: /slow|performance|lag|memory/i, severity: 'medium', type: 'Performance' },
        { pattern: /timeout|abort/i, severity: 'medium', type: 'Request Timeout' },
        { pattern: /large|size|heavy/i, severity: 'low', type: 'Resource Size' },
        { pattern: /render|paint|layout/i, severity: 'medium', type: 'Rendering' }
      ],
      network: [
        { pattern: /fetch|xhr|ajax/i, severity: 'low', type: 'Network Request' },
        { pattern: /404|500|503|error/i, severity: 'high', type: 'HTTP Error' },
        { pattern: /failed to load|network error/i, severity: 'high', type: 'Network Failure' },
        { pattern: /rate limit|throttle/i, severity: 'medium', type: 'Rate Limited' }
      ],
      user: [
        { pattern: /user|click|input|form/i, severity: 'low', type: 'User Interaction' },
        { pattern: /validation|required|invalid/i, severity: 'medium', type: 'Form Validation' },
        { pattern: /login|auth|permission/i, severity: 'medium', type: 'Authentication' }
      ]
    };
    
    console.log('🧠 Dr. DOM Smart Console Analyzer initialized');
  }
  
  startIntelligentAnalysis() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.interceptConsole();
    this.startPatternAnalysis();
    
    console.log('🧠 Smart console analysis started');
  }
  
  stopIntelligentAnalysis() {
    this.isActive = false;
    this.restoreConsole();
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
    
    console.log('🧠 Smart console analysis stopped');
  }
  
  interceptConsole() {
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    };
    
    // Intercept console.log
    console.log = (...args) => {
      this.analyzeMessage('log', args);
      this.originalConsole.log(...args);
    };
    
    // Intercept console.error
    console.error = (...args) => {
      this.analyzeMessage('error', args);
      this.originalConsole.error(...args);
    };
    
    // Intercept console.warn
    console.warn = (...args) => {
      this.analyzeMessage('warn', args);
      this.originalConsole.warn(...args);
    };
    
    // Intercept console.info
    console.info = (...args) => {
      this.analyzeMessage('info', args);
      this.originalConsole.info(...args);
    };
    
    // Intercept console.debug
    console.debug = (...args) => {
      this.analyzeMessage('debug', args);
      this.originalConsole.debug(...args);
    };
  }
  
  restoreConsole() {
    if (this.originalConsole) {
      Object.assign(console, this.originalConsole);
    }
  }
  
  analyzeMessage(level, args) {
    const timestamp = Date.now();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    const consoleMessage = {
      id: `msg_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      level,
      message,
      args,
      analysis: this.performSmartAnalysis(message, level)
    };
    
    // Store message
    this.consoleMessages.push(consoleMessage);
    
    // Categorize message
    this.categorizeMessage(consoleMessage);
    
    // Update patterns
    this.updatePatterns(consoleMessage);
    
    // Limit stored messages (keep last 1000)
    if (this.consoleMessages.length > 1000) {
      this.consoleMessages = this.consoleMessages.slice(-1000);
    }
  }
  
  performSmartAnalysis(message, level) {
    const analysis = {
      categories: [],
      severity: this.mapLevelToSeverity(level),
      patterns: [],
      insights: [],
      actionable: false
    };
    
    // Pattern matching
    for (const [category, patterns] of Object.entries(this.knownPatterns)) {
      for (const pattern of patterns) {
        if (pattern.pattern.test(message)) {
          analysis.patterns.push({
            category,
            type: pattern.type,
            severity: pattern.severity
          });
          analysis.categories.push(category);
        }
      }
    }
    
    // Smart categorization
    if (analysis.categories.length === 0) {
      analysis.categories.push(this.inferCategory(message, level));
    }
    
    // Generate insights
    analysis.insights = this.generateMessageInsights(message, level, analysis);
    
    // Check if actionable
    analysis.actionable = this.isMessageActionable(message, level, analysis);
    
    return analysis;
  }
  
  mapLevelToSeverity(level) {
    const mapping = {
      'error': 'high',
      'warn': 'medium',
      'info': 'low',
      'log': 'low',
      'debug': 'low'
    };
    return mapping[level] || 'low';
  }
  
  inferCategory(message, level) {
    const lowerMessage = message.toLowerCase();
    
    // Network-related keywords
    if (/request|response|api|endpoint|url|fetch|xhr/.test(lowerMessage)) {
      return 'network';
    }
    
    // Security-related keywords
    if (/security|auth|token|permission|blocked|unsafe/.test(lowerMessage)) {
      return 'security';
    }
    
    // Performance-related keywords
    if (/slow|fast|time|memory|cpu|render|load/.test(lowerMessage)) {
      return 'performance';
    }
    
    // User interaction keywords
    if (/click|submit|input|form|button|user/.test(lowerMessage)) {
      return 'user';
    }
    
    // Default based on level
    return level === 'error' ? 'errors' : level === 'warn' ? 'warnings' : 'info';
  }
  
  generateMessageInsights(message, level, analysis) {
    const insights = [];
    
    // Security insights
    if (analysis.categories.includes('security')) {
      if (/cors/i.test(message)) {
        insights.push({
          type: 'security',
          title: 'CORS Issue Detected',
          description: 'Cross-Origin Request blocked. Check your server CORS configuration.',
          severity: 'medium'
        });
      }
      
      if (/csp/i.test(message)) {
        insights.push({
          type: 'security',
          title: 'Content Security Policy Violation',
          description: 'CSP violation detected. Review your security headers.',
          severity: 'high'
        });
      }
    }
    
    // Performance insights
    if (analysis.categories.includes('performance')) {
      if (/timeout/i.test(message)) {
        insights.push({
          type: 'performance',
          title: 'Request Timeout',
          description: 'Network request timed out. Consider increasing timeout or optimizing the endpoint.',
          severity: 'medium'
        });
      }
    }
    
    // Network insights
    if (analysis.categories.includes('network')) {
      if (/404/.test(message)) {
        insights.push({
          type: 'network',
          title: 'Resource Not Found',
          description: 'A required resource was not found (404). Check the URL and ensure the resource exists.',
          severity: 'high'
        });
      }
    }
    
    return insights;
  }
  
  isMessageActionable(message, level, analysis) {
    // Messages are actionable if they contain errors, warnings, or security issues
    return level === 'error' || 
           level === 'warn' || 
           analysis.categories.includes('security') ||
           analysis.patterns.some(p => p.severity === 'high');
  }
  
  categorizeMessage(consoleMessage) {
    const category = consoleMessage.analysis.categories[0] || 'info';
    
    if (this.categories[category]) {
      this.categories[category].push(consoleMessage);
      
      // Limit category size
      if (this.categories[category].length > 100) {
        this.categories[category] = this.categories[category].slice(-100);
      }
    }
  }
  
  updatePatterns(consoleMessage) {
    const message = consoleMessage.message;
    const timestamp = consoleMessage.timestamp;
    
    // Track message frequency patterns
    if (this.patterns.has(message)) {
      const pattern = this.patterns.get(message);
      pattern.count++;
      pattern.lastSeen = timestamp;
      pattern.frequency = pattern.count / ((timestamp - pattern.firstSeen) / 1000 / 60); // per minute
    } else {
      this.patterns.set(message, {
        message,
        count: 1,
        firstSeen: timestamp,
        lastSeen: timestamp,
        frequency: 0,
        level: consoleMessage.level
      });
    }
  }
  
  startPatternAnalysis() {
    // Analyze patterns every 30 seconds
    this.analysisInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.analyzePatterns();
      this.detectSpam();
      this.identifyTrends();
    }, 30000);
  }
  
  analyzePatterns() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Analyze error patterns
    const recentErrors = this.categories.errors.filter(msg => msg.timestamp > fiveMinutesAgo);
    const errorPatterns = this.groupMessagesByPattern(recentErrors);
    
    this.messageAnalysis.errorPatterns = Object.entries(errorPatterns)
      .map(([pattern, messages]) => ({
        pattern,
        count: messages.length,
        frequency: messages.length / 5, // per minute
        severity: this.calculatePatternSeverity(messages),
        messages: messages.slice(0, 3) // Keep first 3 examples
      }))
      .filter(pattern => pattern.count > 1)
      .sort((a, b) => b.count - a.count);
  }
  
  groupMessagesByPattern(messages) {
    const patterns = {};
    
    messages.forEach(msg => {
      // Create a simplified pattern by removing specific values
      const pattern = msg.message
        .replace(/\d+/g, 'NUMBER')
        .replace(/https?:\/\/[^\s]+/g, 'URL')
        .replace(/"[^"]*"/g, '"STRING"')
        .replace(/\b\w{8,}\b/g, 'IDENTIFIER');
      
      if (!patterns[pattern]) {
        patterns[pattern] = [];
      }
      patterns[pattern].push(msg);
    });
    
    return patterns;
  }
  
  calculatePatternSeverity(messages) {
    const severityScores = { high: 3, medium: 2, low: 1 };
    const totalScore = messages.reduce((sum, msg) => {
      return sum + (severityScores[msg.analysis.severity] || 1);
    }, 0);
    
    const avgScore = totalScore / messages.length;
    
    if (avgScore >= 2.5) return 'high';
    if (avgScore >= 1.5) return 'medium';
    return 'low';
  }
  
  detectSpam() {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    
    // Find messages that appear frequently
    const spamCandidates = Array.from(this.patterns.values())
      .filter(pattern => {
        const recentCount = this.consoleMessages
          .filter(msg => msg.message === pattern.message && msg.timestamp > oneMinuteAgo)
          .length;
        return recentCount > 10; // More than 10 times per minute
      });
    
    this.messageAnalysis.spamDetection = spamCandidates.map(pattern => ({
      message: pattern.message,
      count: pattern.count,
      frequency: pattern.frequency,
      level: pattern.level,
      isSpam: true
    }));
  }
  
  identifyTrends() {
    const now = Date.now();
    const thirtyMinutesAgo = now - (30 * 60 * 1000);
    
    // Analyze warning trends
    const recentWarnings = this.categories.warnings.filter(msg => msg.timestamp > thirtyMinutesAgo);
    const warningTrends = this.calculateTrends(recentWarnings, 30);
    
    this.messageAnalysis.warningTrends = warningTrends.filter(trend => trend.increasing);
  }
  
  calculateTrends(messages, windowMinutes) {
    const trends = [];
    const windowMs = windowMinutes * 60 * 1000;
    const now = Date.now();
    
    // Group messages by type
    const messageTypes = this.groupMessagesByPattern(messages);
    
    Object.entries(messageTypes).forEach(([pattern, msgs]) => {
      if (msgs.length < 3) return; // Need at least 3 occurrences
      
      // Split into two time windows
      const midPoint = now - (windowMs / 2);
      const firstHalf = msgs.filter(msg => msg.timestamp < midPoint).length;
      const secondHalf = msgs.filter(msg => msg.timestamp >= midPoint).length;
      
      if (firstHalf > 0) {
        const changeRate = (secondHalf - firstHalf) / firstHalf;
        
        trends.push({
          pattern,
          count: msgs.length,
          changeRate,
          increasing: changeRate > 0.5, // 50% increase
          severity: this.calculatePatternSeverity(msgs)
        });
      }
    });
    
    return trends.sort((a, b) => b.changeRate - a.changeRate);
  }
  
  getAnalysisReport() {
    const now = Date.now();
    const recentThreshold = now - (10 * 60 * 1000); // Last 10 minutes
    
    const summary = {
      totalMessages: this.consoleMessages.length,
      recentMessages: this.consoleMessages.filter(msg => msg.timestamp > recentThreshold).length,
      errorCount: this.categories.errors.length,
      warningCount: this.categories.warnings.length,
      spamCount: this.messageAnalysis.spamDetection.length,
      patternCount: this.messageAnalysis.errorPatterns.length
    };
    
    return {
      summary,
      categories: this.categories,
      patterns: this.messageAnalysis.errorPatterns,
      spam: this.messageAnalysis.spamDetection,
      trends: this.messageAnalysis.warningTrends,
      recentMessages: this.consoleMessages
        .filter(msg => msg.timestamp > recentThreshold)
        .slice(-50), // Last 50 recent messages
      insights: this.generateConsoleInsights(),
      timestamp: now
    };
  }
  
  generateConsoleInsights() {
    const insights = [];
    
    // Spam detection insights
    if (this.messageAnalysis.spamDetection.length > 0) {
      insights.push({
        type: 'spam',
        severity: 'warning',
        title: `${this.messageAnalysis.spamDetection.length} Spam Patterns Detected`,
        description: 'Repeated console messages detected. This may indicate infinite loops or excessive logging.',
        data: this.messageAnalysis.spamDetection.slice(0, 3)
      });
    }
    
    // Error pattern insights
    if (this.messageAnalysis.errorPatterns.length > 0) {
      const highSeverityPatterns = this.messageAnalysis.errorPatterns
        .filter(p => p.severity === 'high');
        
      if (highSeverityPatterns.length > 0) {
        insights.push({
          type: 'error_pattern',
          severity: 'error',
          title: `${highSeverityPatterns.length} Critical Error Patterns`,
          description: 'Recurring critical errors detected that need immediate attention.',
          data: highSeverityPatterns.slice(0, 3)
        });
      }
    }
    
    // Trending warnings
    if (this.messageAnalysis.warningTrends.length > 0) {
      insights.push({
        type: 'trend',
        severity: 'warning',
        title: 'Increasing Warning Trends',
        description: 'Warning messages are increasing over time, indicating potential issues.',
        data: this.messageAnalysis.warningTrends.slice(0, 3)
      });
    }
    
    return insights;
  }
  
  // Utility methods for external access
  getRecentMessages(count = 50) {
    return this.consoleMessages.slice(-count);
  }
  
  getMessagesByCategory(category) {
    return this.categories[category] || [];
  }
  
  getTopPatterns(limit = 10) {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  searchMessages(query) {
    const regex = new RegExp(query, 'i');
    return this.consoleMessages.filter(msg => regex.test(msg.message));
  }
}

// Create global instance
window.drDOMSmartConsoleAnalyzer = new DrDOMSmartConsoleAnalyzer();

console.log('🧠 Dr. DOM Smart Console Analyzer ready - intelligent console monitoring available!');