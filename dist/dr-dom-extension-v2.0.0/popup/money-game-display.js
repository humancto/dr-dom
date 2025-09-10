/**
 * Money Game Display - Fun, gamified money trail visualization
 * Makes data economics entertaining and educational
 */

function displayMoneyGame() {
  // Get current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    
    const domain = new URL(tabs[0].url).hostname;
    const gameKey = `drDOM_${domain}_moneyGame`;
    const moneyKey = `drDOM_${domain}_money`;
    
    // Try game data first, fall back to regular money data
    chrome.storage.local.get([gameKey, moneyKey], (result) => {
      const gameData = result[gameKey];
      const moneyData = result[moneyKey];
      
      if (gameData) {
        createGameSection(gameData.score);
      } else if (moneyData) {
        // Convert regular money data to game format
        const gameScore = convertToGameScore(moneyData);
        createGameSection(gameScore);
      }
    });
  });
}

function convertToGameScore(moneyData) {
  const totalValue = moneyData.calculations.totalValue;
  const coins = Math.round(totalValue * 1000); // Convert to coins
  
  // Determine level
  const levels = [
    { threshold: 0, title: '🥉 Data Peasant', color: '#cd7f32' },
    { threshold: 10, title: '🥈 Info Contributor', color: '#c0c0c0' },
    { threshold: 50, title: '🥇 Content Creator', color: '#ffd700' },
    { threshold: 100, title: '👑 Data Monarch', color: '#b19cd9' },
    { threshold: 500, title: '🌟 Privacy Legend', color: '#ff6b6b' }
  ];
  
  const level = levels.reverse().find(l => coins >= l.threshold) || levels[0];
  
  return {
    coins: coins,
    dollars: totalValue.toFixed(2),
    level: level,
    breakdown: {
      ads: { coins: Math.round(moneyData.calculations.adRevenue * 1000) },
      trackers: { coins: Math.round(moneyData.calculations.trackerRevenue * 1000) },
      data: { coins: Math.round(moneyData.calculations.dataValue * 1000) },
      engagement: { coins: 50 } // Default engagement coins
    }
  };
}

function createGameSection(gameScore) {
  // Remove old section if exists
  let gameSection = document.getElementById('moneyGameSection');
  if (gameSection) {
    gameSection.remove();
  }
  
  const overviewTab = document.getElementById('overview-tab');
  if (!overviewTab) return;
  
  gameSection = document.createElement('div');
  gameSection.id = 'moneyGameSection';
  gameSection.className = 'overview-card';
  gameSection.style.cssText = `
    margin: 15px 0;
    background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
    border: 2px solid #6366f1;
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
  `;
  
  // Insert at top of overview
  const firstCard = overviewTab.querySelector('.overview-card');
  if (firstCard) {
    firstCard.parentNode.insertBefore(gameSection, firstCard);
  } else {
    overviewTab.appendChild(gameSection);
  }
  
  // Fun disclaimers
  const disclaimers = [
    "🎲 These numbers are basically educated guesses!",
    "🎮 It's a game! Real values are anyone's guess!",
    "🔮 Our crystal ball says maybe, possibly, who knows?",
    "🎪 Welcome to the data circus - accuracy not included!",
    "🎯 We're throwing darts at industry averages!",
    "🎰 Like a slot machine but for data economics!"
  ];
  
  const randomDisclaimer = disclaimers[Math.floor(Math.random() * disclaimers.length)];
  
  gameSection.innerHTML = `
    <!-- Game Header -->
    <div style="
      background: linear-gradient(135deg, ${gameScore.level.color}, ${gameScore.level.color}dd);
      padding: 20px;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255,255,255,0.3);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        color: white;
        font-weight: 600;
      ">
        🎮 GAME MODE
      </div>
      
      <div style="text-align: center;">
        <div style="font-size: 36px; margin-bottom: 10px; animation: coinSpin 2s linear infinite; display: inline-block;">
          🪙
        </div>
        <div style="font-size: 28px; font-weight: bold; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
          ${gameScore.coins} Data Coins!
        </div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.9); margin: 5px 0;">
          ≈ $${gameScore.dollars} in "value"*
        </div>
        <div style="
          display: inline-block;
          background: rgba(255,255,255,0.25);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: white;
          margin-top: 8px;
        ">
          ${gameScore.level.title}
        </div>
      </div>
    </div>
    
    <!-- Coin Breakdown -->
    <div style="padding: 20px; background: white;">
      <div style="font-size: 14px; font-weight: 600; margin-bottom: 15px; color: #4f46e5;">
        🎯 Your Coin Sources:
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
        <div class="coin-source" style="
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <div style="font-size: 24px;">📺</div>
          <div style="font-size: 20px; font-weight: bold; color: #f59e0b;">
            +${gameScore.breakdown.ads.coins}
          </div>
          <div style="font-size: 11px; color: #92400e;">Ad Views</div>
        </div>
        
        <div class="coin-source" style="
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <div style="font-size: 24px;">🎯</div>
          <div style="font-size: 20px; font-weight: bold; color: #2563eb;">
            +${gameScore.breakdown.trackers.coins}
          </div>
          <div style="font-size: 11px; color: #1e40af;">Trackers</div>
        </div>
        
        <div class="coin-source" style="
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <div style="font-size: 24px;">📊</div>
          <div style="font-size: 20px; font-weight: bold; color: #16a34a;">
            +${gameScore.breakdown.data.coins}
          </div>
          <div style="font-size: 11px; color: #14532d;">Your Data</div>
        </div>
        
        <div class="coin-source" style="
          background: linear-gradient(135deg, #fce7f3, #fbcfe8);
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <div style="font-size: 24px;">⏱️</div>
          <div style="font-size: 20px; font-weight: bold; color: #ec4899;">
            +${gameScore.breakdown.engagement.coins}
          </div>
          <div style="font-size: 11px; color: #831843;">Time Spent</div>
        </div>
      </div>
      
      <!-- Fun Calculator Button -->
      <button id="moneyGameCalculator" style="
        width: 100%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 15px;
      " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        🎰 Show Me The Math! (Warning: It's Silly)
      </button>
      
      <!-- Disclaimer Box -->
      <div style="
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        border: 2px dashed #ef4444;
        padding: 12px;
        border-radius: 10px;
        margin-bottom: 15px;
      ">
        <div style="font-size: 12px; color: #991b1b; text-align: center; font-weight: 600;">
          ${randomDisclaimer}
        </div>
      </div>
      
      <!-- Progress to Next Level -->
      ${getProgressBar(gameScore)}
      
      <!-- Fun Facts -->
      <div style="
        background: #f3f4f6;
        padding: 10px;
        border-radius: 8px;
        margin-top: 10px;
      ">
        <div style="font-size: 11px; color: #6b7280; text-align: center; line-height: 1.5;">
          <strong>Fun Fact:</strong> ${getRandomFunFact()}
        </div>
      </div>
      
      <!-- Tiny Disclaimer -->
      <div style="
        text-align: center;
        font-size: 9px;
        color: #9ca3af;
        margin-top: 10px;
        padding: 8px;
        background: #f9fafb;
        border-radius: 6px;
      ">
        *This is entertainment! These numbers are wild approximations based on 2024 industry averages. 
        Actual values could be 10x different. Not financial or legal advice. 
        We're basically making educated guesses for fun! 🎲
      </div>
    </div>
    
    <style>
      @keyframes coinSpin {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
    </style>
  `;
  
  // Add calculator button handler
  document.getElementById('moneyGameCalculator')?.addEventListener('click', () => {
    showFunCalculator(gameScore);
  });
}

function getProgressBar(gameScore) {
  const nextLevels = [
    { threshold: 10, title: '🥈 Info Contributor' },
    { threshold: 50, title: '🥇 Content Creator' },
    { threshold: 100, title: '👑 Data Monarch' },
    { threshold: 500, title: '🌟 Privacy Legend' },
    { threshold: 1000, title: '🚀 Surveillance Superstar' }
  ];
  
  const nextLevel = nextLevels.find(l => l.threshold > gameScore.coins);
  if (!nextLevel) {
    return `
      <div style="
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        font-size: 12px;
        color: #1e40af;
      ">
        🏆 You've reached the highest level! You're a data economy champion!
      </div>
    `;
  }
  
  const progress = (gameScore.coins / nextLevel.threshold) * 100;
  const remaining = nextLevel.threshold - gameScore.coins;
  
  return `
    <div style="margin-top: 15px;">
      <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">
        Progress to ${nextLevel.title}: ${remaining} coins to go!
      </div>
      <div style="
        background: #e5e7eb;
        height: 20px;
        border-radius: 10px;
        overflow: hidden;
      ">
        <div style="
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          height: 100%;
          width: ${progress}%;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
        ">
          ${Math.round(progress)}%
        </div>
      </div>
    </div>
  `;
}

function getRandomFunFact() {
  const facts = [
    "Google makes about $460 per US user per year! That's a lot of coins! 🪙",
    "The average website has 20+ trackers. It's like a digital paparazzi! 📸",
    "Your browsing history is worth more than gold to advertisers! 🏆",
    "Ad blockers save the average user from seeing 1,900 ads per month! 🛡️",
    "Facebook knows you better than your friends do (statistically)! 👥",
    "Cookie deletion is like digital dieting - everyone says they'll do it! 🍪",
    "The data broker industry is worth $200 billion. That's YOUR data! 💰",
    "Incognito mode is like wearing sunglasses at night - not that effective! 🕶️",
    "The average person has 100+ online accounts. Password123 anyone? 🔐",
    "Your smartphone generates 2.5 quintillion bytes of data daily! 📱"
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
}

function showFunCalculator(gameScore) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <div style="
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 20px;
        border-radius: 16px 16px 0 0;
      ">
        <h3 style="margin: 0; font-size: 20px;">
          🎰 The "Scientific" Calculator
        </h3>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 13px;">
          How we made up... err, calculated your coins!
        </p>
      </div>
      
      <div style="padding: 20px;">
        <div style="
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        ">
          <div style="font-size: 13px; color: #92400e; text-align: center;">
            ⚠️ <strong>Disclaimer:</strong> This math is about as accurate as a fortune cookie!
          </div>
        </div>
        
        <div style="font-size: 14px; line-height: 1.8; color: #374151;">
          <div style="margin-bottom: 15px;">
            <strong>🎯 The "Formula":</strong><br>
            <code style="
              display: block;
              background: #f3f4f6;
              padding: 10px;
              border-radius: 6px;
              margin: 10px 0;
              font-size: 12px;
            ">
              Total Coins = (Ads × 50) + (Trackers × 30) + <br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Data Types × 40) + (Minutes × 10)
            </code>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>📊 Your Breakdown:</strong><br>
            <div style="
              background: #f9fafb;
              padding: 10px;
              border-radius: 6px;
              margin: 10px 0;
              font-size: 12px;
            ">
              • Ad Revenue: ${gameScore.breakdown.ads.coins} coins<br>
              • Tracker Tax: ${gameScore.breakdown.trackers.coins} coins<br>
              • Data Donation: ${gameScore.breakdown.data.coins} coins<br>
              • Time Tribute: ${gameScore.breakdown.engagement.coins} coins<br>
              <div style="border-top: 1px solid #e5e7eb; margin: 10px 0;"></div>
              <strong>Total: ${gameScore.coins} magical internet coins!</strong>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>💰 Dollar Conversion:</strong><br>
            <code style="
              display: block;
              background: #f3f4f6;
              padding: 10px;
              border-radius: 6px;
              margin: 10px 0;
              font-size: 12px;
            ">
              $${gameScore.dollars} = ${gameScore.coins} coins ÷ 1000
            </code>
            <div style="font-size: 11px; color: #6b7280; margin-top: 5px;">
              * Exchange rate determined by a magic 8-ball
            </div>
          </div>
          
          <div style="
            background: #fee2e2;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            color: #991b1b;
          ">
            <strong>🎲 Reality Check:</strong> These calculations are based on:
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li>2024 industry averages (which vary wildly)</li>
              <li>Assumptions about user behavior</li>
              <li>Guesswork about site monetization</li>
              <li>A sprinkle of digital fairy dust</li>
            </ul>
            Actual values could be 10x, 100x, or 0.1x different!
          </div>
        </div>
        
        <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
        ">
          Got it! This is hilarious! 😄
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(displayMoneyGame, 1000);
});

// Listen for game updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showMoneyGameDetails') {
    showFunCalculator(request.data);
  }
});

console.log('🎮 [Dr. DOM] Money Game Display loaded - Let the games begin!');