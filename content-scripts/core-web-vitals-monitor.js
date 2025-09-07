/**
 * Dr. DOM Core Web Vitals Monitor
 * Real-time Web Vitals tracking with performance dashboard
 */

class DrDOMCoreWebVitalsMonitor {
  constructor() {
    this.isActive = false;
    this.webVitals = {
      LCP: null,  // Largest Contentful Paint
      FID: null,  // First Input Delay
      CLS: null,  // Cumulative Layout Shift
      FCP: null,  // First Contentful Paint
      TTFB: null  // Time to First Byte
    };
    
    this.performanceMetrics = {
      timestamp: Date.now(),
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      resourceCount: 0,
      totalSize: 0,
      renderBlockingResources: 0,
      criticalPathLength: 0
    };
    
    this.realTimeData = {
      fps: [],
      memoryUsage: [],
      networkActivity: [],
      userInteractions: []
    };
    
    this.observers = {
      performanceObserver: null,
      intersectionObserver: null,
      mutationObserver: null,
      resizeObserver: null
    };
    
    // Thresholds for Web Vitals (Good, Needs Improvement, Poor)
    this.thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 }
    };
    
    console.log('📈 Dr. DOM Core Web Vitals Monitor initialized');
  }
  
  startRealTimeMonitoring() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.initializeWebVitalsTracking();
    this.startPerformanceObservation();
    this.initializeRealTimeMetrics();
    this.startContinuousMonitoring();
    
    console.log('📈 Real-time Web Vitals monitoring started');
  }
  
  stopRealTimeMonitoring() {
    this.isActive = false;
    this.cleanup();
    console.log('📈 Web Vitals monitoring stopped');
  }
  
  initializeWebVitalsTracking() {
    // Track FCP (First Contentful Paint)
    this.observePerformanceEntries('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry && !this.webVitals.FCP) {
        this.webVitals.FCP = {
          value: Math.round(fcpEntry.startTime),
          timestamp: Date.now(),
          rating: this.getRating('FCP', fcpEntry.startTime)
        };
      }
    });
    
    // Track LCP (Largest Contentful Paint)
    this.observePerformanceEntries('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        this.webVitals.LCP = {
          value: Math.round(lcpEntry.startTime),
          timestamp: Date.now(),
          rating: this.getRating('LCP', lcpEntry.startTime),
          element: lcpEntry.element?.tagName || 'Unknown'
        };
      }
    });
    
    // Track FID (First Input Delay)
    this.observePerformanceEntries('first-input', (entries) => {
      const fidEntry = entries[0];
      if (fidEntry && !this.webVitals.FID) {
        const fidValue = fidEntry.processingStart - fidEntry.startTime;
        this.webVitals.FID = {
          value: Math.round(fidValue),
          timestamp: Date.now(),
          rating: this.getRating('FID', fidValue),
          eventType: fidEntry.name
        };
      }
    });
    
    // Track CLS (Cumulative Layout Shift)
    this.observePerformanceEntries('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.webVitals.CLS = {
        value: Math.round(clsValue * 10000) / 10000,
        timestamp: Date.now(),
        rating: this.getRating('CLS', clsValue),
        shiftCount: entries.length
      };
    });
    
    // Calculate TTFB (Time to First Byte)
    this.calculateTTFB();
  }
  
  observePerformanceEntries(type, callback) {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      
      // Store observer for cleanup
      if (!this.observers.performanceObserver) {
        this.observers.performanceObserver = [];
      }
      this.observers.performanceObserver.push(observer);
      
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }
  
  calculateTTFB() {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      const ttfb = nav.responseStart - nav.requestStart;
      
      this.webVitals.TTFB = {
        value: Math.round(ttfb),
        timestamp: Date.now(),
        rating: this.getRating('TTFB', ttfb)
      };
    }
  }
  
  getRating(metric, value) {
    const threshold = this.thresholds[metric];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
  
  startPerformanceObservation() {
    // Track page load metrics
    if (document.readyState === 'complete') {
      this.calculateLoadMetrics();
    } else {
      window.addEventListener('load', () => this.calculateLoadMetrics());
    }
    
    // Track DOM changes for performance impact
    this.trackDOMChanges();
    
    // Monitor resource loading
    this.monitorResourceLoading();
  }
  
  calculateLoadMetrics() {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      
      this.performanceMetrics = {
        ...this.performanceMetrics,
        pageLoadTime: Math.round(nav.loadEventEnd - nav.navigationStart),
        domContentLoadedTime: Math.round(nav.domContentLoadedEventEnd - nav.navigationStart),
        timestamp: Date.now()
      };
    }
    
    // Count resources
    const resourceEntries = performance.getEntriesByType('resource');
    this.performanceMetrics.resourceCount = resourceEntries.length;
    this.performanceMetrics.totalSize = resourceEntries.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    // Identify render-blocking resources
    this.performanceMetrics.renderBlockingResources = resourceEntries.filter(resource => {
      return (resource.initiatorType === 'css' || 
              (resource.initiatorType === 'script' && resource.startTime < this.webVitals.FCP?.value));
    }).length;
  }
  
  trackDOMChanges() {
    if (!window.MutationObserver) return;
    
    this.observers.mutationObserver = new MutationObserver((mutations) => {
      let significantChanges = 0;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Count significant DOM additions
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              significantChanges++;
            }
          });
        }
      });
      
      if (significantChanges > 10) {
        this.realTimeData.networkActivity.push({
          type: 'dom_change',
          count: significantChanges,
          timestamp: Date.now()
        });
      }
    });
    
    this.observers.mutationObserver.observe(document, {
      childList: true,
      subtree: true
    });
  }
  
  monitorResourceLoading() {
    if (!window.PerformanceObserver) return;
    
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
          this.realTimeData.networkActivity.push({
            type: 'network',
            url: entry.name,
            duration: entry.duration,
            size: entry.transferSize || 0,
            timestamp: Date.now()
          });
        }
      });
    });
    
    try {
      resourceObserver.observe({ type: 'resource', buffered: false });
      if (!this.observers.performanceObserver) {
        this.observers.performanceObserver = [];
      }
      this.observers.performanceObserver.push(resourceObserver);
    } catch (error) {
      console.warn('Failed to observe resources:', error);
    }
  }
  
  initializeRealTimeMetrics() {
    // Track FPS
    let lastTime = performance.now();
    let frameCount = 0;
    
    const trackFPS = (currentTime) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.realTimeData.fps.push({
          value: fps,
          timestamp: Date.now()
        });
        
        // Keep only last 60 measurements (1 minute)
        if (this.realTimeData.fps.length > 60) {
          this.realTimeData.fps = this.realTimeData.fps.slice(-60);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (this.isActive) {
        requestAnimationFrame(trackFPS);
      }
    };
    
    requestAnimationFrame(trackFPS);
    
    // Track memory usage (if available)
    this.trackMemoryUsage();
    
    // Track user interactions
    this.trackUserInteractions();
  }
  
  trackMemoryUsage() {
    if (!performance.memory) return;
    
    const updateMemory = () => {
      if (!this.isActive) return;
      
      this.realTimeData.memoryUsage.push({
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
      
      // Keep only last 120 measurements (2 minutes)
      if (this.realTimeData.memoryUsage.length > 120) {
        this.realTimeData.memoryUsage = this.realTimeData.memoryUsage.slice(-120);
      }
      
      setTimeout(updateMemory, 1000); // Every second
    };
    
    updateMemory();
  }
  
  trackUserInteractions() {
    const interactionTypes = ['click', 'scroll', 'keydown', 'touchstart'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        this.realTimeData.userInteractions.push({
          type,
          timestamp: Date.now(),
          target: event.target.tagName,
          detail: event.type === 'scroll' ? window.pageYOffset : null
        });
        
        // Keep only last 100 interactions
        if (this.realTimeData.userInteractions.length > 100) {
          this.realTimeData.userInteractions = this.realTimeData.userInteractions.slice(-100);
        }
      }, { passive: true });
    });
  }
  
  startContinuousMonitoring() {
    // Update metrics every 5 seconds
    this.monitoringInterval = setInterval(() => {
      if (!this.isActive) return;
      
      this.updateContinuousMetrics();
      this.analyzePerformanceTrends();
    }, 5000);
  }
  
  updateContinuousMetrics() {
    // Update resource metrics
    const resourceEntries = performance.getEntriesByType('resource');
    this.performanceMetrics.resourceCount = resourceEntries.length;
    this.performanceMetrics.totalSize = resourceEntries.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    // Update DOM node count
    this.performanceMetrics.domNodes = document.querySelectorAll('*').length;
    
    // Calculate critical path metrics
    this.calculateCriticalPathMetrics();
  }
  
  calculateCriticalPathMetrics() {
    const resourceEntries = performance.getEntriesByType('resource');
    const criticalResources = resourceEntries.filter(resource => {
      // Critical resources are CSS, critical JS, and fonts
      return resource.initiatorType === 'css' || 
             resource.initiatorType === 'link' ||
             (resource.initiatorType === 'script' && resource.startTime < 1000) ||
             resource.name.includes('.woff');
    });
    
    // Calculate critical path length (longest chain of dependencies)
    this.performanceMetrics.criticalPathLength = criticalResources.length > 0 ?
      Math.max(...criticalResources.map(r => r.responseEnd)) : 0;
  }
  
  analyzePerformanceTrends() {
    const insights = [];
    
    // Analyze FPS trends
    if (this.realTimeData.fps.length > 5) {
      const recentFPS = this.realTimeData.fps.slice(-5);
      const avgFPS = recentFPS.reduce((sum, frame) => sum + frame.value, 0) / recentFPS.length;
      
      if (avgFPS < 30) {
        insights.push({
          type: 'performance',
          severity: 'warning',
          title: 'Low Frame Rate Detected',
          description: `Average FPS is ${Math.round(avgFPS)}. Consider optimizing animations and reducing DOM complexity.`,
          metric: 'FPS',
          value: avgFPS
        });
      }
    }
    
    // Analyze memory trends
    if (this.realTimeData.memoryUsage.length > 10) {
      const recent = this.realTimeData.memoryUsage.slice(-10);
      const growth = (recent[recent.length - 1].used - recent[0].used) / recent[0].used;
      
      if (growth > 0.5) { // 50% growth in last 10 seconds
        insights.push({
          type: 'performance',
          severity: 'error',
          title: 'Memory Leak Detected',
          description: `Memory usage increased by ${Math.round(growth * 100)}% in the last 10 seconds.`,
          metric: 'Memory',
          value: growth
        });
      }
    }
    
    this.performanceTrends = insights;
  }
  
  getWebVitalsReport() {
    return {
      vitals: this.webVitals,
      performance: this.performanceMetrics,
      realTime: {
        currentFPS: this.realTimeData.fps.slice(-1)[0]?.value || 0,
        currentMemory: this.realTimeData.memoryUsage.slice(-1)[0],
        recentInteractions: this.realTimeData.userInteractions.slice(-10)
      },
      trends: this.performanceTrends || [],
      score: this.calculateOverallScore(),
      recommendations: this.generateRecommendations(),
      timestamp: Date.now()
    };
  }
  
  calculateOverallScore() {
    let totalScore = 0;
    let validMetrics = 0;
    
    Object.entries(this.webVitals).forEach(([metric, data]) => {
      if (data && data.rating) {
        validMetrics++;
        switch (data.rating) {
          case 'good':
            totalScore += 100;
            break;
          case 'needs-improvement':
            totalScore += 60;
            break;
          case 'poor':
            totalScore += 20;
            break;
        }
      }
    });
    
    return validMetrics > 0 ? Math.round(totalScore / validMetrics) : 0;
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    // Web Vitals recommendations
    if (this.webVitals.LCP?.rating === 'poor') {
      recommendations.push({
        type: 'LCP',
        priority: 'high',
        title: 'Optimize Largest Contentful Paint',
        description: 'LCP is over 4 seconds. Optimize image loading, reduce server response times, and eliminate render-blocking resources.'
      });
    }
    
    if (this.webVitals.FID?.rating === 'poor') {
      recommendations.push({
        type: 'FID',
        priority: 'high',
        title: 'Reduce First Input Delay',
        description: 'FID is over 300ms. Reduce JavaScript execution time and defer non-critical scripts.'
      });
    }
    
    if (this.webVitals.CLS?.rating === 'poor') {
      recommendations.push({
        type: 'CLS',
        priority: 'medium',
        title: 'Minimize Layout Shifts',
        description: 'CLS is over 0.25. Set explicit dimensions for images and ads, and avoid inserting content above existing content.'
      });
    }
    
    // Resource recommendations
    if (this.performanceMetrics.renderBlockingResources > 5) {
      recommendations.push({
        type: 'Resources',
        priority: 'medium',
        title: 'Reduce Render-Blocking Resources',
        description: `Found ${this.performanceMetrics.renderBlockingResources} render-blocking resources. Consider inlining critical CSS and deferring non-critical JavaScript.`
      });
    }
    
    // Memory recommendations
    const currentMemory = this.realTimeData.memoryUsage.slice(-1)[0];
    if (currentMemory && currentMemory.used > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        type: 'Memory',
        priority: 'medium',
        title: 'High Memory Usage',
        description: `JavaScript heap size is ${Math.round(currentMemory.used / 1024 / 1024)}MB. Consider optimizing memory usage and cleaning up unused objects.`
      });
    }
    
    return recommendations;
  }
  
  cleanup() {
    // Clear monitoring interval
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Disconnect observers
    Object.values(this.observers).forEach(observer => {
      if (Array.isArray(observer)) {
        observer.forEach(obs => obs.disconnect());
      } else if (observer && observer.disconnect) {
        observer.disconnect();
      }
    });
  }
  
  // Utility methods for external access
  getCurrentWebVitals() {
    return this.webVitals;
  }
  
  getRealTimeData() {
    return this.realTimeData;
  }
  
  getPerformanceScore() {
    return this.calculateOverallScore();
  }
  
  exportDetailedReport() {
    return {
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      webVitals: this.webVitals,
      performance: this.performanceMetrics,
      realTimeData: this.realTimeData,
      trends: this.performanceTrends,
      recommendations: this.generateRecommendations(),
      score: this.calculateOverallScore()
    };
  }
}

// Create global instance
window.drDOMCoreWebVitalsMonitor = new DrDOMCoreWebVitalsMonitor();

console.log('📈 Dr. DOM Core Web Vitals Monitor ready - real-time performance tracking available!');