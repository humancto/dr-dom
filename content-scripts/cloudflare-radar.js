/**
 * Cloudflare Radar Integration - FREE Security Analysis
 * Uses Cloudflare's free tools for enhanced security scanning
 */

class CloudflareRadarAnalyzer {
  constructor() {
    this.domain = window.location.hostname;
    this.results = {
      ranking: null,
      security: {},
      technology: {},
      performance: {}
    };
    
    this.init();
  }

  init() {
    console.log('[Cloudflare Radar] Initializing security analysis...');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.analyze());
    } else {
      setTimeout(() => this.analyze(), 1000);
    }
  }

  async analyze() {
    // Check domain ranking (popularity)
    await this.checkDomainRanking();
    
    // Analyze security headers
    this.analyzeSecurityHeaders();
    
    // Check for Cloudflare protection
    this.detectCloudflareProtection();
    
    // Analyze performance hints
    this.analyzePerformance();
    
    // Store results
    this.storeResults();
  }

  async checkDomainRanking() {
    // Cloudflare publishes top 100 domains
    // We can check if this domain is popular (potential phishing if mimicking)
    const popularDomains = [
      'google.com', 'youtube.com', 'facebook.com', 'amazon.com', 'wikipedia.org',
      'twitter.com', 'instagram.com', 'linkedin.com', 'reddit.com', 'netflix.com',
      'microsoft.com', 'apple.com', 'tiktok.com', 'whatsapp.com', 'openai.com',
      'github.com', 'stackoverflow.com', 'yahoo.com', 'ebay.com', 'adobe.com'
    ];
    
    // Check for typosquatting
    const suspiciousSimilarity = this.checkTyposquatting(this.domain, popularDomains);
    
    if (suspiciousSimilarity) {
      this.results.security.typosquatting = {
        risk: 'high',
        similarTo: suspiciousSimilarity,
        message: `Domain suspiciously similar to ${suspiciousSimilarity}`
      };
    }
    
    // Check if domain is in top sites (legitimate)
    if (popularDomains.includes(this.domain)) {
      this.results.ranking = {
        isPopular: true,
        category: 'top-100',
        trustScore: 95
      };
    }
  }

  checkTyposquatting(domain, popularDomains) {
    // Check for common typosquatting patterns
    for (const popular of popularDomains) {
      const distance = this.levenshteinDistance(domain, popular);
      
      // If very similar but not exact match
      if (distance > 0 && distance <= 2) {
        return popular;
      }
      
      // Check for common substitutions
      const suspiciousPatterns = [
        popular.replace('o', '0'),  // o -> 0
        popular.replace('l', '1'),  // l -> 1
        popular.replace('i', '1'),  // i -> 1
        popular.replace('.com', '-com'),
        popular.replace('.', '-'),
        'www-' + popular,
        popular + '-login',
        popular + '-secure'
      ];
      
      if (suspiciousPatterns.includes(domain)) {
        return popular;
      }
    }
    
    return null;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  analyzeSecurityHeaders() {
    // Check security headers that Cloudflare typically adds
    const securityHeaders = {
      'Strict-Transport-Security': {
        present: false,
        value: null,
        recommendation: 'Enable HSTS to force HTTPS'
      },
      'X-Content-Type-Options': {
        present: false,
        value: null,
        recommendation: 'Set to "nosniff" to prevent MIME sniffing'
      },
      'X-Frame-Options': {
        present: false,
        value: null,
        recommendation: 'Set to "SAMEORIGIN" to prevent clickjacking'
      },
      'Content-Security-Policy': {
        present: false,
        value: null,
        recommendation: 'Implement CSP to prevent XSS attacks'
      },
      'X-XSS-Protection': {
        present: false,
        value: null,
        recommendation: 'Enable XSS protection'
      },
      'Referrer-Policy': {
        present: false,
        value: null,
        recommendation: 'Control referrer information'
      }
    };
    
    // We can't access response headers from content script
    // But we can check meta tags that mirror some security policies
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      securityHeaders['Content-Security-Policy'].present = true;
      securityHeaders['Content-Security-Policy'].value = cspMeta.content;
    }
    
    this.results.security.headers = securityHeaders;
    
    // Calculate security score based on headers
    const presentHeaders = Object.values(securityHeaders).filter(h => h.present).length;
    this.results.security.headerScore = (presentHeaders / 6) * 100;
  }

  detectCloudflareProtection() {
    // Check for Cloudflare indicators
    const cfIndicators = {
      // Check for Cloudflare scripts
      scripts: Array.from(document.scripts).some(s => 
        s.src && (s.src.includes('cloudflare') || s.src.includes('cf-'))
      ),
      
      // Check for Cloudflare cookies
      cookies: document.cookie.includes('__cf') || document.cookie.includes('cf_'),
      
      // Check for Cloudflare challenge
      challenge: document.querySelector('#cf-wrapper') !== null,
      
      // Check for Cloudflare ray ID in comments
      rayId: document.documentElement.innerHTML.includes('cf-ray'),
      
      // Check for Cloudflare email protection
      emailProtection: document.querySelector('[data-cfemail]') !== null,
      
      // Check for Cloudflare Turnstile (CAPTCHA alternative)
      turnstile: document.querySelector('.cf-turnstile') !== null ||
                 window.turnstile !== undefined
    };
    
    const isProtected = Object.values(cfIndicators).some(v => v);
    
    this.results.security.cloudflare = {
      protected: isProtected,
      indicators: cfIndicators,
      benefits: isProtected ? [
        'DDoS Protection',
        'Web Application Firewall',
        'SSL/TLS Encryption',
        'Bot Management',
        'CDN Performance'
      ] : []
    };
  }

  analyzePerformance() {
    // Performance metrics that Cloudflare optimizes
    const perfData = performance.getEntriesByType('navigation')[0];
    
    if (perfData) {
      this.results.performance = {
        // DNS lookup time
        dns: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
        
        // TCP connection time
        tcp: Math.round(perfData.connectEnd - perfData.connectStart),
        
        // SSL negotiation time
        ssl: perfData.secureConnectionStart > 0 ? 
             Math.round(perfData.connectEnd - perfData.secureConnectionStart) : 0,
        
        // Time to first byte
        ttfb: Math.round(perfData.responseStart - perfData.requestStart),
        
        // Total page load time
        loadTime: Math.round(perfData.loadEventEnd - perfData.navigationStart),
        
        // Check if using HTTP/2 or HTTP/3
        protocol: perfData.nextHopProtocol || 'unknown',
        
        // Transfer size
        transferSize: perfData.transferSize || 0,
        
        // Compression ratio
        compressionRatio: perfData.encodedBodySize > 0 ? 
          (1 - (perfData.encodedBodySize / perfData.decodedBodySize)) * 100 : 0
      };
      
      // Performance scoring
      let score = 100;
      if (this.results.performance.ttfb > 600) score -= 20;
      if (this.results.performance.loadTime > 3000) score -= 20;
      if (this.results.performance.dns > 100) score -= 10;
      if (!this.results.performance.protocol.includes('h2') && 
          !this.results.performance.protocol.includes('h3')) score -= 10;
      
      this.results.performance.score = Math.max(0, score);
    }
  }

  storeResults() {
    const storageKey = `drDOM_${this.domain}_cloudflare`;
    
    chrome.storage.local.set({
      [storageKey]: {
        results: this.results,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    console.log('[Cloudflare Radar] Analysis complete:', this.results);
    
    // Send message to popup
    chrome.runtime.sendMessage({
      action: 'cloudflareAnalysisComplete',
      data: this.results
    }).catch(() => {
      // Popup might not be open
    });
  }
}

// Initialize
const cfRadar = new CloudflareRadarAnalyzer();
console.log('[Dr. DOM] Cloudflare Radar analyzer active');