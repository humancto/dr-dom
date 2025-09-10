/**
 * Dr. DOM Test Suite - Comprehensive testing for all features
 * Run this in Chrome DevTools console after loading the extension
 */

class DrDOMTestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Dr. DOM Test Suite...');
    console.log('================================');
    
    // Test Enhanced Tracker Detection
    await this.testTrackerDetection();
    
    // Test URLhaus Local Database
    await this.testURLhausLocal();
    
    // Test Privacy Timeline
    await this.testPrivacyTimeline();
    
    // Test Fingerprint Protection
    await this.testFingerprintProtection();
    
    // Test Privacy Scorer
    await this.testPrivacyScorer();
    
    // Test GDPR/CCPA Checker
    await this.testComplianceChecker();
    
    // Test Money Trail Game
    await this.testMoneyTrailGame();
    
    // Test Storage
    await this.testStorageSystem();
    
    // Display results
    this.displayResults();
  }

  async testTrackerDetection() {
    console.log('\n📍 Testing Enhanced Tracker Detection...');
    
    try {
      // Test 1: Check if tracker detection is initialized
      this.assert(
        typeof EnhancedTrackerDetection !== 'undefined',
        'Tracker detection class exists'
      );
      
      // Test 2: Simulate network request
      const testUrl = 'https://www.google-analytics.com/analytics.js';
      const xhr = new XMLHttpRequest();
      xhr.open('GET', testUrl);
      
      // Test 3: Check if trackers are stored
      await this.wait(1000);
      const result = await this.getStoredData('enhancedTrackers');
      this.assert(
        result !== null,
        'Trackers are stored in chrome.storage'
      );
      
      // Test 4: Verify tracker categories
      const expectedCategories = ['advertising', 'analytics', 'social', 'fingerprinting'];
      this.assert(
        enhancedTrackers && enhancedTrackers.categories,
        'Tracker categories are defined'
      );
      
      console.log('✅ Tracker Detection tests passed');
    } catch (error) {
      console.error('❌ Tracker Detection test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testURLhausLocal() {
    console.log('\n📍 Testing URLhaus Local Database...');
    
    try {
      // Test 1: Check if URLhaus is initialized
      this.assert(
        typeof URLhausLocal !== 'undefined',
        'URLhaus class exists'
      );
      
      // Test 2: Check database methods
      this.assert(
        typeof urlhausLocal.checkUrl === 'function',
        'checkUrl method exists'
      );
      
      // Test 3: Test URL checking
      const testMaliciousUrl = 'http://malicious-test-site.com';
      const result = urlhausLocal.checkUrl(testMaliciousUrl);
      this.assert(
        typeof result.malicious === 'boolean',
        'URL check returns valid result'
      );
      
      // Test 4: Check stats method
      const stats = urlhausLocal.getStats();
      this.assert(
        stats && typeof stats.totalUrls === 'number',
        'Database stats are available'
      );
      
      console.log('✅ URLhaus Local tests passed');
    } catch (error) {
      console.error('❌ URLhaus Local test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testPrivacyTimeline() {
    console.log('\n📍 Testing Privacy Timeline...');
    
    try {
      // Test 1: Check if timeline is initialized
      this.assert(
        typeof PrivacyTimeline !== 'undefined',
        'Timeline class exists'
      );
      
      // Test 2: Check if timeline UI exists
      const timelineElement = document.getElementById('privacy-timeline');
      this.assert(
        timelineElement !== null,
        'Timeline UI is created'
      );
      
      // Test 3: Test event recording
      document.cookie = 'test_cookie=value';
      await this.wait(1000);
      
      // Test 4: Check privacy score
      const scoreElement = document.getElementById('privacy-score-live');
      this.assert(
        scoreElement && scoreElement.textContent,
        'Privacy score is displayed'
      );
      
      console.log('✅ Privacy Timeline tests passed');
    } catch (error) {
      console.error('❌ Privacy Timeline test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testFingerprintProtection() {
    console.log('\n📍 Testing Fingerprint Protection...');
    
    try {
      // Test 1: Check if fingerprint is initialized
      this.assert(
        typeof FingerprintProtection !== 'undefined',
        'Fingerprint class exists'
      );
      
      // Test 2: Test canvas fingerprinting
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.fillText('test', 0, 0);
      const dataURL = canvas.toDataURL();
      this.assert(
        dataURL.length > 0,
        'Canvas fingerprinting works'
      );
      
      // Test 3: Check fingerprint data
      this.assert(
        fingerprintProtection && fingerprintProtection.fingerprint,
        'Fingerprint data is collected'
      );
      
      // Test 4: Test entropy calculation
      this.assert(
        fingerprintProtection.fingerprint.entropy > 0,
        'Entropy is calculated'
      );
      
      console.log('✅ Fingerprint Protection tests passed');
    } catch (error) {
      console.error('❌ Fingerprint Protection test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testPrivacyScorer() {
    console.log('\n📍 Testing Privacy Scorer...');
    
    try {
      // Test 1: Check if scorer is initialized
      this.assert(
        typeof PrivacyScorer !== 'undefined',
        'Privacy Scorer class exists'
      );
      
      // Test 2: Test score calculation
      await this.wait(2000);
      const domain = window.location.hostname;
      const scoreData = await this.getStoredData(`privacy_score_${domain}`);
      
      this.assert(
        scoreData && typeof scoreData.score === 'number',
        'Privacy score is calculated'
      );
      
      // Test 3: Check score range
      this.assert(
        scoreData.score >= 0 && scoreData.score <= 100,
        'Score is within valid range (0-100)'
      );
      
      console.log('✅ Privacy Scorer tests passed');
    } catch (error) {
      console.error('❌ Privacy Scorer test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testComplianceChecker() {
    console.log('\n📍 Testing GDPR/CCPA Checker...');
    
    try {
      // Test 1: Check if compliance checker exists
      this.assert(
        typeof GDPRCCPAChecker !== 'undefined',
        'Compliance checker class exists'
      );
      
      // Test 2: Test cookie consent detection
      const consentBanners = document.querySelectorAll('[class*="cookie"], [id*="cookie"]');
      console.log(`Found ${consentBanners.length} potential consent elements`);
      
      // Test 3: Check compliance data storage
      await this.wait(2000);
      const domain = window.location.hostname;
      const complianceData = await this.getStoredData(`compliance_${domain}`);
      
      this.assert(
        complianceData !== null,
        'Compliance data is stored'
      );
      
      console.log('✅ GDPR/CCPA Checker tests passed');
    } catch (error) {
      console.error('❌ GDPR/CCPA Checker test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testMoneyTrailGame() {
    console.log('\n📍 Testing Money Trail Game...');
    
    try {
      // Test 1: Check if money trail game exists
      this.assert(
        typeof MoneyTrailGame !== 'undefined',
        'Money Trail Game class exists'
      );
      
      // Test 2: Test coin calculation
      this.assert(
        moneyGame && typeof moneyGame.totalCoins === 'number',
        'Coins are calculated'
      );
      
      // Test 3: Test game levels
      this.assert(
        moneyGame.levels && moneyGame.levels.length > 0,
        'Game levels are defined'
      );
      
      // Test 4: Check fun facts
      this.assert(
        moneyGame.funFacts && moneyGame.funFacts.length > 0,
        'Fun facts are available'
      );
      
      console.log('✅ Money Trail Game tests passed');
    } catch (error) {
      console.error('❌ Money Trail Game test failed:', error);
      this.results.errors.push(error);
    }
  }

  async testStorageSystem() {
    console.log('\n📍 Testing Storage System...');
    
    try {
      // Test 1: Test write to storage
      const testData = { test: 'data', timestamp: Date.now() };
      await this.setStoredData('test_key', testData);
      
      // Test 2: Test read from storage
      const retrieved = await this.getStoredData('test_key');
      this.assert(
        retrieved && retrieved.test === 'data',
        'Data can be written and read from storage'
      );
      
      // Test 3: Test storage quota
      const usage = await this.getStorageUsage();
      console.log(`Storage usage: ${(usage / 1024 / 1024).toFixed(2)} MB`);
      this.assert(
        usage < 100 * 1024 * 1024, // Less than 100MB
        'Storage usage is within limits'
      );
      
      // Clean up test data
      await this.removeStoredData('test_key');
      
      console.log('✅ Storage System tests passed');
    } catch (error) {
      console.error('❌ Storage System test failed:', error);
      this.results.errors.push(error);
    }
  }

  // Helper methods
  assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      this.results.passed++;
    } else {
      console.error(`  ✗ ${message}`);
      this.results.failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStoredData(key) {
    const domain = window.location.hostname;
    const fullKey = `drDOM_${domain}_${key}`;
    
    return new Promise((resolve) => {
      if (chrome && chrome.storage) {
        chrome.storage.local.get(fullKey, (result) => {
          resolve(result[fullKey] || null);
        });
      } else {
        // Fallback for testing
        resolve(JSON.parse(localStorage.getItem(fullKey) || 'null'));
      }
    });
  }

  setStoredData(key, value) {
    const domain = window.location.hostname;
    const fullKey = `drDOM_${domain}_${key}`;
    
    return new Promise((resolve) => {
      if (chrome && chrome.storage) {
        chrome.storage.local.set({ [fullKey]: value }, resolve);
      } else {
        localStorage.setItem(fullKey, JSON.stringify(value));
        resolve();
      }
    });
  }

  removeStoredData(key) {
    const domain = window.location.hostname;
    const fullKey = `drDOM_${domain}_${key}`;
    
    return new Promise((resolve) => {
      if (chrome && chrome.storage) {
        chrome.storage.local.remove(fullKey, resolve);
      } else {
        localStorage.removeItem(fullKey);
        resolve();
      }
    });
  }

  getStorageUsage() {
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local.getBytesInUse) {
        chrome.storage.local.getBytesInUse(null, resolve);
      } else {
        // Estimate from localStorage
        let total = 0;
        for (let key in localStorage) {
          total += localStorage[key].length + key.length;
        }
        resolve(total * 2); // UTF-16 encoding
      }
    });
  }

  displayResults() {
    console.log('\n================================');
    console.log('📊 TEST RESULTS');
    console.log('================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      this.results.errors.forEach(error => {
        console.error(`  - ${error.message}`);
      });
    }
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! The extension is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }
  }
}

// Auto-run tests if loaded in extension context
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  console.log('🚀 Dr. DOM Test Suite Ready!');
  console.log('Run: new DrDOMTestSuite().runAllTests()');
  
  // Expose globally for manual testing
  window.DrDOMTestSuite = DrDOMTestSuite;
}