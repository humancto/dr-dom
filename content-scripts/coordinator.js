/**
 * Dr. DOM Advanced Coordinator
 * Orchestrates all advanced analysis components and provides unified comprehensive interface
 */

class DrDOMAdvancedCoordinator {
  constructor() {
    this.isActive = false;
    this.components = {
      inspector: null,
      networkMonitor: null,
      advancedNetworkMonitor: null,
      errorTracker: null,
      coreWebVitalsMonitor: null,
      performanceMonitor: null
    };
    
    // Comprehensive data aggregation
    this.comprehensiveData = {
      summary: {},
      realTimeStats: {},
      networkAnalysis: {},
      errorAnalysis: {},
      performanceMetrics: {},
      securityAnalysis: {},
      intelligentInsights: []
    };
    
    // Real-time update queues
    this.updateQueue = [];
    this.lastUpdate = 0;
    
    console.log('🎯 Dr. DOM Advanced Coordinator initialized');
    this.init();
  }

  init() {
    // Load components IMMEDIATELY - no waiting!
    this.components.inspector = window.drDOMInspector;
    this.components.networkMonitor = window.drDOMNetworkMonitor;
    this.components.advancedNetworkMonitor = window.drDOMAdvancedNetworkMonitor;
    this.components.errorTracker = window.drDOMErrorTracker;
    this.components.coreWebVitalsMonitor = window.drDOMCoreWebVitalsMonitor;
    this.components.performanceMonitor = window.drDOMPerformanceMonitor;
    
    console.log('🎯 Advanced components loaded:', {
      inspector: !!this.components.inspector,
      networkMonitor: !!this.components.networkMonitor,
      advancedNetworkMonitor: !!this.components.advancedNetworkMonitor,
      errorTracker: !!this.components.errorTracker,
      intelligentErrorAnalyzer: !!this.components.intelligentErrorAnalyzer,
      smartConsoleAnalyzer: !!this.components.smartConsoleAnalyzer,
      coreWebVitalsMonitor: !!this.components.coreWebVitalsMonitor,
      performanceMonitor: !!this.components.performanceMonitor
    });
    
    this.setupAdvancedIntegration();
  }

  setupAdvancedIntegration() {
    // Start real-time data aggregation
    this.startRealTimeDataCollection();
    
    // Setup cross-component correlation
    this.setupCrossComponentAnalysis();
    
    console.log('🎯 Advanced integration setup complete');
  }
  
  startRealTimeDataCollection() {
    // Real-time data collection every 1 second
    this.aggregationInterval = setInterval(() => {
      if (this.isActive) {
        this.aggregateComprehensiveData();
        this.generateIntelligentInsights();
        this.updateRealTimeMetrics();
      }
    }, 1000);
    
    console.log('🎯 Real-time data aggregation started');
  }
  
  setupCrossComponentAnalysis() {
    // Correlate errors with network requests
    this.setupErrorNetworkCorrelation();
    
    // Analyze performance bottlenecks
    this.setupPerformanceAnalysis();
    
    // Monitor security patterns
    this.setupSecurityMonitoring();
    
    console.log('🎯 Cross-component analysis configured');
  }
  
  aggregateComprehensiveData() {
    try {
      // Network analysis aggregation
      if (this.components.advancedNetworkMonitor) {
        const networkData = this.components.advancedNetworkMonitor.getComprehensiveReport();
        this.comprehensiveData.networkAnalysis = {
          ...networkData,
          timestamp: Date.now()
        };
      }
      
      // Error analysis aggregation  
      if (this.components.errorTracker) {
        const errors = this.components.errorTracker.getErrors();
        this.comprehensiveData.errorAnalysis = {
          errors: errors,
          totalErrors: errors.length,
          timestamp: Date.now()
        };
      }
      
      // Web Vitals aggregation
      if (this.components.coreWebVitalsMonitor) {
        const webVitalsData = this.components.coreWebVitalsMonitor.getWebVitalsReport();
        this.comprehensiveData.webVitals = {
          ...webVitalsData,
          timestamp: Date.now()
        };
      }
      
      // Performance metrics
      if (this.components.performanceMonitor) {
        const perfData = this.components.performanceMonitor.generateReport();
        this.comprehensiveData.performanceMetrics = {
          ...perfData,
          timestamp: Date.now()
        };
      }
      
      // Generate summary
      this.updateComprehensiveSummary();
      
    } catch (error) {
      console.error('Error aggregating comprehensive data:', error);
    }
  }
  
  updateComprehensiveSummary() {
    const summary = {
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      securityScore: 100,
      performanceScore: 100,
      lastUpdated: Date.now()
    };
    
    // Network summary
    if (this.comprehensiveData.networkAnalysis?.metrics) {
      summary.totalRequests = this.comprehensiveData.networkAnalysis.metrics.totalRequests || 0;
      summary.averageResponseTime = this.comprehensiveData.networkAnalysis.metrics.averageResponseTime || 0;
    }
    
    // Error summary
    if (this.comprehensiveData.errorAnalysis?.summary) {
      summary.totalErrors = this.comprehensiveData.errorAnalysis.summary.totalErrors || 0;
    }
    
    // Console analysis removed - using basic error tracker instead
    
    // Performance summary
    if (this.comprehensiveData.performanceMetrics?.score) {
      summary.performanceScore = this.comprehensiveData.performanceMetrics.score;
    }
    
    // Web Vitals summary
    if (this.comprehensiveData.webVitals?.score) {
      summary.webVitalsScore = this.comprehensiveData.webVitals.score;
      summary.lcpValue = this.comprehensiveData.webVitals.vitals?.LCP?.value;
      summary.fidValue = this.comprehensiveData.webVitals.vitals?.FID?.value;
      summary.clsValue = this.comprehensiveData.webVitals.vitals?.CLS?.value;
    }
    
    // Security analysis
    if (this.comprehensiveData.networkAnalysis?.security) {
      const security = this.comprehensiveData.networkAnalysis.security;
      summary.securityScore = Math.max(0, 100 - (security.mixedContent * 10) - (security.insecureRequests * 5));
    }
    
    this.comprehensiveData.summary = summary;
  }
  
  generateIntelligentInsights() {
    const insights = [];
    
    try {
      // Performance insights
      if (this.comprehensiveData.networkAnalysis) {
        const slowRequests = this.comprehensiveData.networkAnalysis.slowRequests || [];
        if (slowRequests.length > 0) {
          insights.push({
            type: 'performance',
            severity: 'warning',
            title: `${slowRequests.length} Slow Requests Detected`,
            description: `Found ${slowRequests.length} requests taking over 2 seconds. Consider optimizing these endpoints.`,
            data: slowRequests.slice(0, 3)
          });
        }
      }
      
      // Error pattern insights
      if (this.comprehensiveData.errorAnalysis?.patterns) {
        const patterns = this.comprehensiveData.errorAnalysis.patterns;
        if (Array.isArray(patterns)) {
          patterns.forEach(pattern => {
            insights.push({
              type: 'error',
              severity: pattern.severity,
              title: pattern.title,
              description: pattern.description,
              count: pattern.count
            });
          });
        }
      }
      
      // Security insights
      if (this.comprehensiveData.networkAnalysis?.security) {
        const security = this.comprehensiveData.networkAnalysis.security;
        if (security.mixedContent > 0) {
          insights.push({
            type: 'security',
            severity: 'warning',
            title: 'Mixed Content Detected',
            description: `Found ${security.mixedContent} mixed HTTP/HTTPS requests that may pose security risks.`
          });
        }
      }
      
      // API insights
      if (this.comprehensiveData.networkAnalysis?.apis) {
        const apis = this.comprehensiveData.networkAnalysis.apis;
        if (apis && apis.endpoints && apis.endpoints.length > 10) {
          insights.push({
            type: 'api',
            severity: 'info',
            title: 'High API Usage Detected',
            description: `Discovered ${apis.endpoints.length} unique API endpoints. Consider API optimization and caching strategies.`
          });
        }
      }
      
      // Console insights removed - using basic error tracking
      
      // Web Vitals insights
      if (this.comprehensiveData.webVitals?.recommendations && Array.isArray(this.comprehensiveData.webVitals.recommendations)) {
        this.comprehensiveData.webVitals.recommendations.forEach(recommendation => {
          insights.push({
            type: 'web_vitals',
            severity: recommendation.priority === 'high' ? 'error' : 'warning',
            title: recommendation.title,
            description: recommendation.description,
            metric: recommendation.type
          });
        });
      }
      
      if (this.comprehensiveData.webVitals?.trends && Array.isArray(this.comprehensiveData.webVitals.trends)) {
        this.comprehensiveData.webVitals.trends.forEach(trend => {
          insights.push({
            type: 'performance_trend',
            severity: trend.severity,
            title: trend.title,
            description: trend.description,
            metric: trend.metric,
            value: trend.value
          });
        });
      }
      
      this.comprehensiveData.intelligentInsights = insights;
      
    } catch (error) {
      console.error('Error generating intelligent insights:', error);
    }
  }
  
  updateRealTimeMetrics() {
    const realTimeStats = {
      requestsPerSecond: 0,
      errorsPerMinute: 0,
      averageResponseTime: 0,
      activeConnections: 0,
      dataTransferRate: 0,
      timestamp: Date.now()
    };
    
    // Calculate metrics from recent data
    if (this.comprehensiveData.networkAnalysis?.recentActivity) {
      const recentRequests = this.comprehensiveData.networkAnalysis.recentActivity;
      const now = Date.now();
      const lastSecond = recentRequests.filter(req => now - req.timestamp < 1000);
      realTimeStats.requestsPerSecond = lastSecond.length;
    }
    
    this.comprehensiveData.realTimeStats = realTimeStats;
  }
  
  setupErrorNetworkCorrelation() {
    // Cross-reference errors with network failures
    this.correlationChecks = setInterval(() => {
      if (!this.isActive) return;
      
      try {
        const networkErrors = this.comprehensiveData.networkAnalysis?.failedRequests || [];
        const jsErrors = this.comprehensiveData.errorAnalysis?.errors || [];
        
        // Find correlations between network failures and JS errors
        const correlatedErrors = [];
        
        jsErrors.forEach(error => {
          const relatedNetworkError = networkErrors.find(netError => 
            Math.abs(error.timestamp - netError.timestamp) < 5000 // Within 5 seconds
          );
          
          if (relatedNetworkError) {
            correlatedErrors.push({
              jsError: error,
              networkError: relatedNetworkError,
              correlation: 'high'
            });
          }
        });
        
        if (correlatedErrors.length > 0) {
          this.comprehensiveData.intelligentInsights.push({
            type: 'correlation',
            severity: 'error',
            title: 'Network-Error Correlation Detected',
            description: `Found ${correlatedErrors.length} JavaScript errors potentially caused by network failures.`,
            data: correlatedErrors
          });
        }
        
      } catch (error) {
        console.error('Error in correlation analysis:', error);
      }
    }, 5000); // Check every 5 seconds
  }
  
  setupPerformanceAnalysis() {
    // Monitor for performance degradation patterns
    this.performanceChecks = setInterval(() => {
      if (!this.isActive) return;
      
      try {
        const currentMetrics = this.comprehensiveData.performanceMetrics;
        if (!currentMetrics) return;
        
        // Check for performance degradation
        if (currentMetrics.averageResponseTime > 2000) {
          this.comprehensiveData.intelligentInsights.push({
            type: 'performance',
            severity: 'warning',
            title: 'Performance Degradation',
            description: `Average response time has increased to ${Math.round(currentMetrics.averageResponseTime)}ms.`
          });
        }
        
        // Check for memory leaks indicators
        if (currentMetrics.domNodes && currentMetrics.domNodes > 5000) {
          this.comprehensiveData.intelligentInsights.push({
            type: 'performance',
            severity: 'warning',
            title: 'High DOM Node Count',
            description: `DOM contains ${currentMetrics.domNodes} nodes. Consider DOM optimization.`
          });
        }
        
      } catch (error) {
        console.error('Error in performance analysis:', error);
      }
    }, 10000); // Check every 10 seconds
  }
  
  setupSecurityMonitoring() {
    // Monitor for security issues in real-time
    this.securityChecks = setInterval(() => {
      if (!this.isActive) return;
      
      try {
        const security = this.comprehensiveData.networkAnalysis?.security;
        if (!security) return;
        
        // Check for new security issues
        if (security.insecureRequests > 0) {
          this.comprehensiveData.intelligentInsights.push({
            type: 'security',
            severity: 'error',
            title: 'Insecure Requests Detected',
            description: `Found ${security.insecureRequests} HTTP requests that should use HTTPS.`
          });
        }
        
        // Check for suspicious patterns
        if (security.thirdPartyDomains && security.thirdPartyDomains.length > 10) {
          this.comprehensiveData.intelligentInsights.push({
            type: 'privacy',
            severity: 'info',
            title: 'High Third-Party Usage',
            description: `Connecting to ${security.thirdPartyDomains.length} third-party domains. Review privacy implications.`
          });
        }
        
      } catch (error) {
        console.error('Error in security monitoring:', error);
      }
    }, 15000); // Check every 15 seconds
  }

  startInspection() {
    console.log('🎯 Coordinator: Starting comprehensive inspection');
    this.isActive = true;
    
    // Process any data captured by capture-immediately.js
    if (window.__drDOM && window.__drDOM.requests) {
      console.log(`📦 Processing ${window.__drDOM.requests.length} pre-captured requests!`);
      
      // Feed captured data to advanced network monitor
      if (this.components.advancedNetworkMonitor) {
        window.__drDOM.requests.forEach(request => {
          this.components.advancedNetworkMonitor.requests.set(request.id, request);
        });
        this.components.advancedNetworkMonitor.metrics.totalRequests = window.__drDOM.requests.length;
      }
      
      // Feed captured errors to error tracker
      if (this.components.errorTracker && window.__drDOM.errors) {
        window.__drDOM.errors.forEach(error => {
          this.components.errorTracker.trackError(error);
        });
      }
    }

    // Start all standard components
    if (this.components.inspector) {
      this.components.inspector.show();
    }
    
    if (this.components.networkMonitor) {
      this.components.networkMonitor.startMonitoring();
    }
    
    if (this.components.errorTracker) {
      this.components.errorTracker.startTracking();
    }
    
    if (this.components.performanceMonitor) {
      this.components.performanceMonitor.startMonitoring();
    }
    
    // Start advanced components
    if (this.components.advancedNetworkMonitor) {
      this.components.advancedNetworkMonitor.startMonitoring();
    }
    
    if (this.components.intelligentErrorAnalyzer) {
      this.components.intelligentErrorAnalyzer.startAnalyzing();
    }
    
    if (this.components.smartConsoleAnalyzer) {
      this.components.smartConsoleAnalyzer.startIntelligentAnalysis();
    }
    
    if (this.components.coreWebVitalsMonitor) {
      this.components.coreWebVitalsMonitor.startRealTimeMonitoring();
    }

    // Start comprehensive data collection
    this.startStatsCollection();
    
    console.log('🎯 All advanced monitoring components active');
    return { success: true, message: 'Advanced monitoring started - comprehensive analysis active' };
  }

  stopInspection() {
    console.log('🎯 Coordinator: Stopping comprehensive inspection');
    this.isActive = false;

    // Stop all standard components
    if (this.components.inspector) {
      this.components.inspector.hide();
    }
    
    if (this.components.networkMonitor) {
      this.components.networkMonitor.stopMonitoring();
    }
    
    if (this.components.errorTracker) {
      this.components.errorTracker.stopTracking();
    }
    
    if (this.components.performanceMonitor) {
      this.components.performanceMonitor.stopMonitoring();
    }
    
    // Stop advanced components
    if (this.components.advancedNetworkMonitor) {
      this.components.advancedNetworkMonitor.stopMonitoring();
    }
    
    if (this.components.intelligentErrorAnalyzer) {
      this.components.intelligentErrorAnalyzer.stopAnalyzing();
    }
    
    if (this.components.smartConsoleAnalyzer) {
      this.components.smartConsoleAnalyzer.stopIntelligentAnalysis();
    }
    
    if (this.components.coreWebVitalsMonitor) {
      this.components.coreWebVitalsMonitor.stopRealTimeMonitoring();
    }
    
    // Clear intervals
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }
    if (this.correlationChecks) {
      clearInterval(this.correlationChecks);
    }
    if (this.performanceChecks) {
      clearInterval(this.performanceChecks);
    }
    if (this.securityChecks) {
      clearInterval(this.securityChecks);
    }

    console.log('🎯 All advanced monitoring stopped');
    return { success: true, message: 'Advanced monitoring stopped - comprehensive data preserved' };
  }

  startStatsCollection() {
    // Update stats every 2 seconds
    setInterval(() => {
      if (this.isActive) {
        this.updateStats();
      }
    }, 2000);
  }

  updateStats() {
    try {
      // Initialize stats if not exists
      if (!this.stats) {
        this.stats = {
          domNodes: 0,
          errors: 0,
          requests: 0,
          performance: 100
        };
      }
      
      // Get DOM node count
      this.stats.domNodes = document.querySelectorAll('*').length;

      // Get error count from both trackers
      if (this.components.errorTracker) {
        this.stats.errors = this.components.errorTracker.errorCount || 0;
      }
      
      // Add error count
      if (this.components.errorTracker) {
        this.stats.errors = this.components.errorTracker.errorCount || 0;
      }

      // Get network request count from advanced monitor
      if (this.components.advancedNetworkMonitor) {
        const networkData = this.components.advancedNetworkMonitor.getComprehensiveReport();
        this.stats.requests = networkData.metrics?.totalRequests || this.stats.requests;
      } else if (this.components.networkMonitor) {
        this.stats.requests = this.components.networkMonitor.metrics?.totalRequests || 0;
      }

      // Get performance score
      if (this.components.performanceMonitor) {
        const report = this.components.performanceMonitor.generateReport();
        this.stats.performance = report?.score || 100;
      }

    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  getStats() {
    this.updateStats();
    return this.stats;
  }

  getInspectionData() {
    const data = {
      active: this.isActive,
      stats: this.stats,
      comprehensive: this.comprehensiveData,
      components: {},
      timestamp: Date.now()
    };

    try {
      // Get data from standard components
      if (this.components.networkMonitor) {
        data.components.network = {
          requests: this.components.networkMonitor.requests,
          metrics: this.components.networkMonitor.metrics
        };
      }

      if (this.components.errorTracker) {
        data.components.errors = {
          errors: this.components.errorTracker.getErrors(),
          warnings: this.components.errorTracker.getWarnings(),
          summary: this.components.errorTracker.getErrorSummary()
        };
      }

      if (this.components.performanceMonitor) {
        data.components.performance = this.components.performanceMonitor.generateReport();
      }

      if (this.components.inspector) {
        data.components.inspector = this.components.inspector.getInspectionData();
      }
      
      // Get data from advanced components
      if (this.components.advancedNetworkMonitor) {
        data.components.advancedNetwork = this.components.advancedNetworkMonitor.getComprehensiveReport();
      }
      
      if (this.components.intelligentErrorAnalyzer) {
        data.components.intelligentErrors = this.components.intelligentErrorAnalyzer.getIntelligentReport();
      }
      
      if (this.components.smartConsoleAnalyzer) {
        data.components.consoleAnalysis = this.components.smartConsoleAnalyzer.getAnalysisReport();
      }
      
      if (this.components.coreWebVitalsMonitor) {
        data.components.webVitals = this.components.coreWebVitalsMonitor.getWebVitalsReport();
      }
      
    } catch (error) {
      console.error('Error getting comprehensive inspection data:', error);
      data.error = error.message;
    }

    return data;
  }
  
  // New method for getting just the summary for quick UI updates
  onConsoleMessage(message) {
    // Handle console messages from error analyzer
    // Just store it, no need to process further
  }
  
  onErrorDetected(error) {
    // Handle errors from error analyzer
    // Just store it, no need to process further
  }
  
  getQuickSummary() {
    return {
      active: this.isActive,
      summary: this.comprehensiveData.summary,
      realTimeStats: this.comprehensiveData.realTimeStats,
      recentInsights: this.comprehensiveData.intelligentInsights.slice(-3),
      timestamp: Date.now()
    };
  }
  
  // Export comprehensive report
  exportComprehensiveReport() {
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        drDOMVersion: '1.0.0'
      },
      summary: this.comprehensiveData.summary,
      networkAnalysis: this.comprehensiveData.networkAnalysis,
      errorAnalysis: this.comprehensiveData.errorAnalysis,
      consoleAnalysis: this.comprehensiveData.consoleAnalysis,
      webVitals: this.comprehensiveData.webVitals,
      performanceMetrics: this.comprehensiveData.performanceMetrics,
      securityAnalysis: this.comprehensiveData.securityAnalysis,
      intelligentInsights: this.comprehensiveData.intelligentInsights,
      componentData: this.getInspectionData().components
    };
    
    return report;
  }
}

// Create global advanced coordinator
window.drDOMCoordinator = new DrDOMAdvancedCoordinator();

// Enhanced message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Dr. DOM received message:', request);
  
  try {
    const coordinator = window.drDOMCoordinator;
    
    switch (request.action) {
      case 'ping':
        sendResponse({ success: true, message: 'Dr. DOM is alive!' });
        break;
        
      case 'startInspection':
        const startResult = coordinator.startInspection();
        sendResponse(startResult);
        break;
        
      case 'stopInspection':
        const stopResult = coordinator.stopInspection();
        sendResponse(stopResult);
        break;
        
      case 'getStats':
        sendResponse(coordinator.getStats());
        break;
        
      case 'getInspectionData':
        sendResponse(coordinator.getInspectionData());
        break;
        
      case 'getQuickSummary':
        sendResponse(coordinator.getQuickSummary());
        break;
        
      case 'exportReport':
        sendResponse(coordinator.exportComprehensiveReport());
        break;
        
      case 'toggleFeature':
        // Handle feature toggling
        sendResponse({ success: true, message: `${request.feature} toggled` });
        break;
        
      default:
        sendResponse({ error: 'Unknown action: ' + request.action });
    }
  } catch (error) {
    console.error('Message handler error:', error);
    sendResponse({ error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

console.log('Dr. DOM Coordinator ready - unified extension interface active!');