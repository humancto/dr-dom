/**
 * Dr. DOM Performance Monitor
 * Tracks and analyzes website performance metrics in a fun, accessible way
 */

class DrDOMPerformanceMonitor {
  constructor() {
    this.isMonitoring = false;
    this.metrics = {
      loadTime: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      domElements: 0,
      memoryUsage: 0,
      networkRequests: 0
    };
    
    this.thresholds = {
      excellent: { lcp: 2500, fid: 100, cls: 0.1 },
      good: { lcp: 4000, fid: 300, cls: 0.25 },
      poor: { lcp: Infinity, fid: Infinity, cls: Infinity }
    };
    
    this.init();
  }

  init() {
    console.log('📊 Dr. DOM Performance Monitor initialized');
    this.observePerformance();
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.collectMetrics();
    console.log('📊 Performance monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }

  observePerformance() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let clsScore = 0;
        entryList.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsScore;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  collectMetrics() {
    // Navigation timing
    if (performance.timing) {
      const timing = performance.timing;
      this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
    }

    // Paint timing
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    }

    // DOM metrics
    this.metrics.domElements = document.querySelectorAll('*').length;

    // Memory usage (if available)
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }

    return this.metrics;
  }

  getPerformanceScore() {
    const lcp = this.metrics.largestContentfulPaint;
    const fid = this.metrics.firstInputDelay;
    const cls = this.metrics.cumulativeLayoutShift;

    let score = 100;
    
    // LCP scoring
    if (lcp > this.thresholds.poor.lcp) score -= 40;
    else if (lcp > this.thresholds.good.lcp) score -= 20;
    else if (lcp > this.thresholds.excellent.lcp) score -= 10;

    // FID scoring  
    if (fid > this.thresholds.poor.fid) score -= 30;
    else if (fid > this.thresholds.good.fid) score -= 15;
    else if (fid > this.thresholds.excellent.fid) score -= 5;

    // CLS scoring
    if (cls > this.thresholds.poor.cls) score -= 30;
    else if (cls > this.thresholds.good.cls) score -= 15;
    else if (cls > this.thresholds.excellent.cls) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  getHumanFriendlyReport() {
    const score = this.getPerformanceScore();
    const metrics = this.collectMetrics();
    
    let report = {
      score: score,
      grade: this.getGrade(score),
      summary: this.getSummary(score),
      metrics: {
        loadTime: `${Math.round(metrics.loadTime)}ms`,
        firstPaint: `${Math.round(metrics.firstPaint)}ms`,
        firstContentfulPaint: `${Math.round(metrics.firstContentfulPaint)}ms`,
        largestContentfulPaint: `${Math.round(metrics.largestContentfulPaint)}ms`,
        domElements: metrics.domElements.toLocaleString(),
        memoryUsage: this.formatBytes(metrics.memoryUsage)
      },
      recommendations: this.getRecommendations(metrics)
    };

    return report;
  }

  getGrade(score) {
    if (score >= 90) return { letter: 'A', color: '#10b981', emoji: '🚀' };
    if (score >= 80) return { letter: 'B', color: '#f59e0b', emoji: '👍' };
    if (score >= 70) return { letter: 'C', color: '#f97316', emoji: '⚠️' };
    if (score >= 60) return { letter: 'D', color: '#ef4444', emoji: '🐌' };
    return { letter: 'F', color: '#dc2626', emoji: '🚨' };
  }

  getSummary(score) {
    if (score >= 90) return 'Excellent! This website loads lightning fast ⚡';
    if (score >= 80) return 'Good performance with room for minor improvements 👍';
    if (score >= 70) return 'Average performance - some optimization needed ⚠️';
    if (score >= 60) return 'Below average - significant improvements needed 🐌';
    return 'Poor performance - major optimization required 🚨';
  }

  getRecommendations(metrics) {
    const recommendations = [];

    if (metrics.loadTime > 3000) {
      recommendations.push('🚀 Reduce page load time by optimizing images and scripts');
    }
    
    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('🖼️ Optimize your largest content element (likely an image)');
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('📐 Reduce layout shifts by setting image/video dimensions');
    }
    
    if (metrics.domElements > 1500) {
      recommendations.push('🌳 Simplify DOM structure - too many elements slow things down');
    }
    
    if (metrics.memoryUsage > 50000000) { // 50MB
      recommendations.push('🧠 Optimize memory usage - scripts may be using too much RAM');
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Great job! No major performance issues detected');
    }

    return recommendations;
  }

  formatBytes(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // API methods
  getMetrics() {
    return this.collectMetrics();
  }

  generateReport() {
    return this.getHumanFriendlyReport();
  }
}

// Initialize and expose globally
window.drDOMPerformanceMonitor = new DrDOMPerformanceMonitor();

// Auto-start monitoring
document.addEventListener('DOMContentLoaded', () => {
  if (window.drDOMPerformanceMonitor) {
    window.drDOMPerformanceMonitor.startMonitoring();
  }
});

console.log('📊 Dr. DOM Performance Monitor ready - tracking website speed and quality!');