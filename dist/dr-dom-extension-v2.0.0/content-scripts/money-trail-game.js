/**
 * Money Trail Game - Fun, gamified version of revenue tracking
 * Makes surveillance capitalism visible through playful interactions
 */

class MoneyTrailGame {
  constructor() {
    this.isGameMode = true;
    this.totalCoins = 0;
    this.coinMultiplier = 1000; // Convert cents to "coins" for fun
    this.animations = true;
    this.soundEffects = false; // Disabled by default
    
    // Fun currency names
    this.currencies = {
      coins: '🪙 Data Coins',
      gems: '💎 Privacy Gems', 
      tokens: '🎰 Ad Tokens',
      bucks: '💵 Tracker Bucks'
    };
    
    // Achievement levels
    this.levels = [
      { threshold: 0, title: '🥉 Data Peasant', color: '#cd7f32' },
      { threshold: 10, title: '🥈 Info Contributor', color: '#c0c0c0' },
      { threshold: 50, title: '🥇 Content Creator', color: '#ffd700' },
      { threshold: 100, title: '👑 Data Monarch', color: '#b19cd9' },
      { threshold: 500, title: '🌟 Privacy Legend', color: '#ff6b6b' },
      { threshold: 1000, title: '🚀 Surveillance Superstar', color: '#4ecdc4' }
    ];
    
    // Fun facts and tips
    this.funFacts = [
      "Did you know? Your data is worth more than oil in the digital economy! ⛽",
      "Fun fact: The average person generates $200-600 in data value per year! 📊",
      "Tip: Using an ad blocker is like keeping your coins to yourself! 🛡️",
      "Reality check: This is just a fun estimate - actual values vary wildly! 🎲",
      "Remember: These are rough guesses based on industry averages! 🎯",
      "Pro tip: Incognito mode doesn't make you invisible to trackers! 👻",
      "Wild guess: Facebook makes ~$50 per US user per quarter! 📱",
      "Disclaimer: We're basically fortune telling with math! 🔮",
      "Note: Real numbers could be 10x higher or lower! 🎢",
      "PSA: This is edutainment, not financial advice! 🎓"
    ];
    
    // Silly disclaimers
    this.disclaimers = [
      "⚠️ Warning: Numbers may be wildly inaccurate but surprisingly educational!",
      "🎮 This is a game! Real values depend on cosmic alignment and market mood.",
      "🎲 Rolling dice would be about as accurate, but less fun!",
      "🔮 Our crystal ball says these numbers might be right... or not!",
      "🎪 Welcome to the circus of digital economics - accuracy not guaranteed!",
      "🎯 We're throwing darts at a board of industry averages!",
      "🎰 It's like a slot machine but for data economics!",
      "🌈 Somewhere over the rainbow, these numbers might be accurate!"
    ];
    
    this.init();
  }

  init() {
    console.log('🎮 [Money Trail Game] Starting the data economy game!');
    
    // Add game styles
    this.injectGameStyles();
    
    // Wait for page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startGame());
    } else {
      setTimeout(() => this.startGame(), 1000);
    }
  }

  injectGameStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes coinSpin {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
      
      @keyframes coinFloat {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
      }
      
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
        50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
        100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
      }
      
      @keyframes jackpot {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(5deg); }
        50% { transform: scale(1.2) rotate(-5deg); }
        75% { transform: scale(1.1) rotate(5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes slideInBounce {
        0% { transform: translateX(100%) scale(0.5); }
        60% { transform: translateX(-10%) scale(1.1); }
        80% { transform: translateX(5%) scale(0.95); }
        100% { transform: translateX(0) scale(1); }
      }
      
      .money-game-coin {
        animation: coinSpin 2s linear infinite;
        display: inline-block;
      }
      
      .money-game-floating-coin {
        position: fixed;
        animation: coinFloat 2s ease-out forwards;
        z-index: 2147483647;
        pointer-events: none;
        font-size: 24px;
      }
      
      .money-game-achievement {
        animation: jackpot 0.5s ease;
      }
      
      .money-game-counter {
        animation: pulseGlow 2s ease infinite;
      }
      
      .money-game-notification {
        animation: slideInBounce 0.5s ease;
      }
    `;
    document.head.appendChild(style);
  }

  async startGame() {
    // Analyze the page
    const analysis = await this.analyzePageValue();
    
    // Calculate the "score"
    const gameScore = this.calculateGameScore(analysis);
    
    // Show the game notification
    this.showGameNotification(gameScore);
    
    // Trigger achievements
    this.checkAchievements(gameScore);
    
    // Store game data
    this.storeGameData(gameScore);
  }

  async analyzePageValue() {
    const analysis = {
      ads: this.countAds(),
      trackers: await this.getTrackers(),
      dataTypes: this.detectDataCollection(),
      engagement: this.measureEngagement()
    };
    
    return analysis;
  }

  countAds() {
    let adCount = 0;
    const adPatterns = [
      '[id*="google_ads"]', '[class*="advertisement"]',
      '[data-ad]', 'ins.adsbygoogle', '[id*="div-gpt-ad"]',
      '.sponsored', '.promoted', '[id*="taboola"]'
    ];
    
    adPatterns.forEach(pattern => {
      adCount += document.querySelectorAll(pattern).length;
    });
    
    return {
      count: adCount,
      coins: adCount * 50, // 50 coins per ad
      type: 'display'
    };
  }

  async getTrackers() {
    const domain = window.location.hostname;
    return new Promise((resolve) => {
      chrome.storage.local.get(`drDOM_${domain}_privacy`, (result) => {
        const data = result[`drDOM_${domain}_privacy`] || { trackers: [] };
        resolve({
          count: data.trackers?.length || 0,
          coins: (data.trackers?.length || 0) * 30, // 30 coins per tracker
          names: data.trackers?.slice(0, 3).map(t => t.domain) || []
        });
      });
    });
  }

  detectDataCollection() {
    const dataTypes = [];
    let coins = 0;
    
    // Check cookies
    const cookies = document.cookie.split(';');
    if (cookies.length > 5) {
      dataTypes.push('🍪 Cookies');
      coins += 20;
    }
    
    // Check forms
    if (document.querySelector('input[type="email"]')) {
      dataTypes.push('📧 Email');
      coins += 100;
    }
    
    // Check social buttons
    if (document.querySelector('[class*="facebook"], [class*="twitter"]')) {
      dataTypes.push('👥 Social');
      coins += 80;
    }
    
    // Check analytics
    if (window.ga || window.gtag || window._gaq) {
      dataTypes.push('📊 Analytics');
      coins += 40;
    }
    
    return { types: dataTypes, coins };
  }

  measureEngagement() {
    // Fun "engagement" metrics
    const timeOnPage = 5; // Assume 5 minutes
    const scrollDepth = 50; // Assume 50% scroll
    
    return {
      time: timeOnPage,
      scroll: scrollDepth,
      coins: timeOnPage * 10 // 10 coins per minute
    };
  }

  calculateGameScore(analysis) {
    const baseCoins = 
      analysis.ads.coins +
      analysis.trackers.coins +
      analysis.dataTypes.coins +
      analysis.engagement.coins;
    
    // Apply multipliers for fun
    let multiplier = 1;
    
    // Site reputation multiplier
    const domain = window.location.hostname;
    if (domain.includes('facebook') || domain.includes('google')) {
      multiplier = 2; // Big tech multiplier!
    }
    
    const totalCoins = Math.round(baseCoins * multiplier);
    const dollarValue = (totalCoins / this.coinMultiplier).toFixed(2);
    
    // Get current level
    const level = this.levels.reverse().find(l => totalCoins >= l.threshold) || this.levels[0];
    
    return {
      coins: totalCoins,
      dollars: dollarValue,
      level: level,
      breakdown: {
        ads: analysis.ads,
        trackers: analysis.trackers,
        data: analysis.dataTypes,
        engagement: analysis.engagement
      },
      funFact: this.funFacts[Math.floor(Math.random() * this.funFacts.length)],
      disclaimer: this.disclaimers[Math.floor(Math.random() * this.disclaimers.length)]
    };
  }

  showGameNotification(gameScore) {
    // Don't show multiple notifications
    if (document.getElementById('money-game-popup')) return;
    
    const popup = document.createElement('div');
    popup.id = 'money-game-popup';
    popup.className = 'money-game-notification';
    popup.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0;
      border-radius: 16px;
      width: 400px;
      z-index: 2147483647;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
      cursor: default;
    `;
    
    popup.innerHTML = `
      <!-- Header -->
      <div style="
        padding: 20px;
        background: linear-gradient(135deg, ${gameScore.level.color}, ${gameScore.level.color}dd);
        position: relative;
      ">
        <button id="money-game-close" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        ">×</button>
        
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;" class="money-game-coin">
            🪙
          </div>
          <div style="font-size: 32px; font-weight: bold; margin-bottom: 5px;" class="money-game-counter">
            ${gameScore.coins} Data Coins!
          </div>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">
            ≈ $${gameScore.dollars} in estimated value*
          </div>
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
          " class="money-game-achievement">
            ${gameScore.level.title}
          </div>
        </div>
      </div>
      
      <!-- Fun Breakdown -->
      <div style="padding: 20px; background: white; color: #333;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 15px; color: #667eea;">
          🎮 How You're "Earning" Coins:
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div style="
            background: #f3f4f6;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          ">
            <div style="font-size: 20px;">📺</div>
            <div style="font-size: 18px; font-weight: bold; color: #667eea;">
              ${gameScore.breakdown.ads.coins}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              Ad Revenue
            </div>
          </div>
          
          <div style="
            background: #f3f4f6;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          ">
            <div style="font-size: 20px;">🎯</div>
            <div style="font-size: 18px; font-weight: bold; color: #667eea;">
              ${gameScore.breakdown.trackers.coins}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              Tracker Points
            </div>
          </div>
          
          <div style="
            background: #f3f4f6;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          ">
            <div style="font-size: 20px;">📊</div>
            <div style="font-size: 18px; font-weight: bold; color: #667eea;">
              ${gameScore.breakdown.data.coins}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              Data Collection
            </div>
          </div>
          
          <div style="
            background: #f3f4f6;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
          ">
            <div style="font-size: 20px;">⏱️</div>
            <div style="font-size: 18px; font-weight: bold; color: #667eea;">
              ${gameScore.breakdown.engagement.coins}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              Time Bonus
            </div>
          </div>
        </div>
        
        <!-- Fun Fact -->
        <div style="
          background: #fef3c7;
          border: 2px solid #fbbf24;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        ">
          <div style="font-size: 13px; color: #92400e;">
            ${gameScore.funFact}
          </div>
        </div>
        
        <!-- Disclaimer -->
        <div style="
          background: #fee2e2;
          border: 2px solid #fca5a5;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        ">
          <div style="font-size: 12px; color: #991b1b; line-height: 1.4;">
            ${gameScore.disclaimer}
          </div>
        </div>
        
        <!-- Action Button -->
        <button id="money-game-details" style="
          width: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          🎲 See Detailed Breakdown (It's All Made Up!)
        </button>
        
        <!-- Tiny Disclaimer -->
        <div style="
          text-align: center;
          font-size: 10px;
          color: #9ca3af;
          margin-top: 10px;
          line-height: 1.4;
        ">
          *These are wild guesses based on industry averages from 2024.<br>
          Actual values could be 10x higher or lower. This is edutainment!
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Spawn floating coins animation
    this.spawnFloatingCoins(gameScore.coins);
    
    // Add event listeners
    document.getElementById('money-game-close')?.addEventListener('click', () => {
      popup.style.animation = 'slideInBounce 0.3s ease reverse';
      setTimeout(() => popup.remove(), 300);
    });
    
    document.getElementById('money-game-details')?.addEventListener('click', () => {
      this.showDetailedBreakdown(gameScore);
    });
    
    // Auto-close after 15 seconds
    setTimeout(() => {
      if (document.getElementById('money-game-popup')) {
        popup.style.animation = 'slideInBounce 0.3s ease reverse';
        setTimeout(() => popup.remove(), 300);
      }
    }, 15000);
  }

  spawnFloatingCoins(count) {
    const coinCount = Math.min(count / 50, 10); // Max 10 floating coins
    
    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const coin = document.createElement('div');
        coin.className = 'money-game-floating-coin';
        coin.textContent = '🪙';
        coin.style.left = `${Math.random() * window.innerWidth}px`;
        coin.style.bottom = '20px';
        document.body.appendChild(coin);
        
        setTimeout(() => coin.remove(), 2000);
      }, i * 200);
    }
  }

  showDetailedBreakdown(gameScore) {
    // Send message to extension popup
    chrome.runtime.sendMessage({
      action: 'showMoneyGameDetails',
      data: gameScore
    });
  }

  checkAchievements(gameScore) {
    const achievements = [];
    
    if (gameScore.coins > 100) {
      achievements.push('🏆 Century Club - 100+ coins earned!');
    }
    
    if (gameScore.breakdown.ads.count > 10) {
      achievements.push('📺 Ad Watcher - Saw 10+ ads!');
    }
    
    if (gameScore.breakdown.trackers.count > 5) {
      achievements.push('🎯 Tracked & Traced - 5+ trackers found you!');
    }
    
    // Store achievements
    if (achievements.length > 0) {
      chrome.storage.local.get('moneyGameAchievements', (result) => {
        const allAchievements = result.moneyGameAchievements || [];
        allAchievements.push(...achievements);
        chrome.storage.local.set({ moneyGameAchievements: allAchievements });
      });
    }
  }

  storeGameData(gameScore) {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_moneyGame`;
    
    chrome.storage.local.set({
      [storageKey]: {
        score: gameScore,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
  }
}

// Initialize the game
const moneyGame = new MoneyTrailGame();
console.log('🎮 [Dr. DOM] Money Trail Game initialized - Let the data games begin!');