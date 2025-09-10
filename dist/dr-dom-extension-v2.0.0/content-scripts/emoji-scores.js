/**
 * Emoji Scores - Alternative visual scoring system
 * Replaces boring grades with fun, memorable visuals
 */

class EmojiScores {
  constructor() {
    this.scoringSystems = {
      emoji: this.getEmojiScore,
      weather: this.getWeatherScore,
      temperature: this.getTemperatureScore,
      stars: this.getStarScore,
      food: this.getFoodScore,
      animals: this.getAnimalScore,
      plants: this.getPlantScore,
      space: this.getSpaceScore
    };
    
    this.currentSystem = 'emoji';
    this.init();
  }

  init() {
    console.log('😊 [Emoji Scores] Making privacy scores visual and fun!');
    
    // Wait for privacy score to be calculated
    setTimeout(() => this.updateScores(), 2000);
    
    // Listen for score updates
    this.listenForUpdates();
  }

  async updateScores() {
    const domain = window.location.hostname;
    
    // Get privacy score data
    const scoreData = await this.getPrivacyScore(domain);
    if (!scoreData) return;
    
    const score = scoreData.score || 50;
    
    // Generate all scoring visualizations
    const visualScores = {
      traditional: this.getTraditionalGrade(score),
      emoji: this.getEmojiScore(score),
      weather: this.getWeatherScore(score),
      temperature: this.getTemperatureScore(score),
      stars: this.getStarScore(score),
      food: this.getFoodScore(score),
      animals: this.getAnimalScore(score),
      plants: this.getPlantScore(score),
      space: this.getSpaceScore(score),
      movie: this.getMovieRating(score),
      music: this.getMusicScore(score),
      sport: this.getSportScore(score)
    };
    
    // Store all visualizations
    this.storeVisualScores(visualScores, score);
    
    // Display floating score badge
    this.displayScoreBadge(visualScores);
  }

  getEmojiScore(score) {
    // Main emoji scoring system
    const ranges = [
      { min: 90, emoji: '🥳', text: 'AMAZING!', color: '#059669', animation: 'party' },
      { min: 80, emoji: '😄', text: 'Excellent!', color: '#10b981', animation: 'happy' },
      { min: 70, emoji: '😊', text: 'Good!', color: '#84cc16', animation: 'smile' },
      { min: 60, emoji: '🙂', text: 'Okay', color: '#eab308', animation: 'neutral' },
      { min: 50, emoji: '😐', text: 'Meh', color: '#f59e0b', animation: 'flat' },
      { min: 40, emoji: '😕', text: 'Not Great', color: '#fb923c', animation: 'worried' },
      { min: 30, emoji: '😟', text: 'Concerning', color: '#f87171', animation: 'sad' },
      { min: 20, emoji: '😰', text: 'Worrying!', color: '#ef4444', animation: 'anxious' },
      { min: 10, emoji: '😱', text: 'Terrible!', color: '#dc2626', animation: 'scared' },
      { min: 0, emoji: '💀', text: 'Privacy Dead', color: '#991b1b', animation: 'dead' }
    ];
    
    const result = ranges.find(r => score >= r.min) || ranges[ranges.length - 1];
    return {
      ...result,
      score,
      description: this.getEmojiDescription(score)
    };
  }

  getEmojiDescription(score) {
    if (score >= 90) return "Your privacy is having a party! 🎉";
    if (score >= 80) return "Privacy protection is strong! 💪";
    if (score >= 70) return "Looking good, privacy friend! 👍";
    if (score >= 60) return "Room for improvement, but okay 🤷";
    if (score >= 50) return "Half your data is escaping! 🏃";
    if (score >= 40) return "Trackers are having a feast! 🍽️";
    if (score >= 30) return "Your data is being harvested! 🌾";
    if (score >= 20) return "Privacy emergency! Call 911! 🚨";
    if (score >= 10) return "It's a privacy massacre! 🔪";
    return "RIP Privacy 1990-2024 ⚰️";
  }

  getWeatherScore(score) {
    const weather = [
      { min: 90, icon: '☀️', text: 'Sunny', desc: 'Perfect privacy weather!' },
      { min: 80, icon: '🌤️', text: 'Mostly Sunny', desc: 'Great privacy conditions' },
      { min: 70, icon: '⛅', text: 'Partly Cloudy', desc: 'Some tracker clouds' },
      { min: 60, icon: '☁️', text: 'Cloudy', desc: 'Privacy visibility limited' },
      { min: 50, icon: '🌦️', text: 'Light Rain', desc: 'Data drizzle detected' },
      { min: 40, icon: '🌧️', text: 'Rainy', desc: 'Heavy data downpour' },
      { min: 30, icon: '⛈️', text: 'Thunderstorm', desc: 'Privacy storm warning!' },
      { min: 20, icon: '🌪️', text: 'Tornado', desc: 'Data tornado approaching!' },
      { min: 10, icon: '🌊', text: 'Tsunami', desc: 'Privacy tsunami alert!' },
      { min: 0, icon: '☄️', text: 'Meteor', desc: 'Privacy apocalypse!' }
    ];
    
    return weather.find(w => score >= w.min) || weather[weather.length - 1];
  }

  getTemperatureScore(score) {
    // Convert score to temperature
    const temp = Math.round(-20 + (score * 0.6)); // -20°C to 40°C
    let icon, desc;
    
    if (temp >= 30) {
      icon = '🔥';
      desc = 'Privacy on fire (bad!)';
    } else if (temp >= 20) {
      icon = '🌡️';
      desc = 'Getting warm...';
    } else if (temp >= 10) {
      icon = '🌤️';
      desc = 'Comfortable privacy';
    } else if (temp >= 0) {
      icon = '❄️';
      desc = 'Cool and private';
    } else {
      icon = '🧊';
      desc = 'Frozen privacy (good!)';
    }
    
    return {
      temperature: temp,
      icon,
      text: `${temp}°C`,
      description: desc
    };
  }

  getStarScore(score) {
    const stars = Math.round(score / 20);
    const starDisplay = '⭐'.repeat(Math.max(1, stars)) + '☆'.repeat(5 - stars);
    
    return {
      stars,
      display: starDisplay,
      text: `${stars}/5 stars`,
      review: this.getStarReview(stars)
    };
  }

  getStarReview(stars) {
    const reviews = [
      "Would not recommend to my worst enemy!",
      "Terrible privacy practices. Avoid!",
      "Below average. Many concerns.",
      "Average privacy. Room to improve.",
      "Good privacy practices!",
      "Excellent! Would trust with my diary!"
    ];
    return reviews[stars] || reviews[0];
  }

  getFoodScore(score) {
    const foods = [
      { min: 90, icon: '🍰', text: 'Cake', desc: 'Sweet privacy!' },
      { min: 80, icon: '🍕', text: 'Pizza', desc: 'Delicious privacy!' },
      { min: 70, icon: '🍔', text: 'Burger', desc: 'Satisfying privacy' },
      { min: 60, icon: '🥗', text: 'Salad', desc: 'Healthy privacy' },
      { min: 50, icon: '🍞', text: 'Bread', desc: 'Basic privacy' },
      { min: 40, icon: '🥔', text: 'Potato', desc: 'Plain privacy' },
      { min: 30, icon: '🧅', text: 'Onion', desc: 'Makes you cry' },
      { min: 20, icon: '🌶️', text: 'Chili', desc: 'Burning your data!' },
      { min: 10, icon: '☠️', text: 'Poison', desc: 'Toxic to privacy!' },
      { min: 0, icon: '🗑️', text: 'Garbage', desc: 'Trash privacy!' }
    ];
    
    return foods.find(f => score >= f.min) || foods[foods.length - 1];
  }

  getAnimalScore(score) {
    const animals = [
      { min: 90, icon: '🦄', text: 'Unicorn', desc: 'Magical privacy!' },
      { min: 80, icon: '🦁', text: 'Lion', desc: 'King of privacy!' },
      { min: 70, icon: '🐬', text: 'Dolphin', desc: 'Smart privacy!' },
      { min: 60, icon: '🐢', text: 'Turtle', desc: 'Protected privacy' },
      { min: 50, icon: '🐕', text: 'Dog', desc: 'Loyal but leaky' },
      { min: 40, icon: '🐁', text: 'Mouse', desc: 'Small privacy' },
      { min: 30, icon: '🦨', text: 'Skunk', desc: 'Privacy stinks!' },
      { min: 20, icon: '🦟', text: 'Mosquito', desc: 'Annoying tracker!' },
      { min: 10, icon: '🕷️', text: 'Spider', desc: 'Web of tracking!' },
      { min: 0, icon: '🦠', text: 'Virus', desc: 'Privacy infected!' }
    ];
    
    return animals.find(a => score >= a.min) || animals[animals.length - 1];
  }

  getPlantScore(score) {
    const plants = [
      { min: 90, icon: '🌻', text: 'Sunflower', desc: 'Blooming privacy!' },
      { min: 80, icon: '🌹', text: 'Rose', desc: 'Beautiful privacy!' },
      { min: 70, icon: '🌳', text: 'Tree', desc: 'Strong privacy!' },
      { min: 60, icon: '🌿', text: 'Herb', desc: 'Natural privacy' },
      { min: 50, icon: '🌱', text: 'Sprout', desc: 'Growing privacy' },
      { min: 40, icon: '🍂', text: 'Autumn Leaf', desc: 'Falling privacy' },
      { min: 30, icon: '🌵', text: 'Cactus', desc: 'Prickly privacy!' },
      { min: 20, icon: '🍄', text: 'Mushroom', desc: 'Dark privacy!' },
      { min: 10, icon: '🥀', text: 'Wilted Rose', desc: 'Dying privacy!' },
      { min: 0, icon: '💀', text: 'Dead Plant', desc: 'Privacy deceased!' }
    ];
    
    return plants.find(p => score >= p.min) || plants[plants.length - 1];
  }

  getSpaceScore(score) {
    const space = [
      { min: 90, icon: '🌟', text: 'Star', desc: 'Stellar privacy!' },
      { min: 80, icon: '☀️', text: 'Sun', desc: 'Shining privacy!' },
      { min: 70, icon: '🌍', text: 'Earth', desc: 'Global privacy!' },
      { min: 60, icon: '🌙', text: 'Moon', desc: 'Lunar privacy' },
      { min: 50, icon: '☄️', text: 'Comet', desc: 'Passing privacy' },
      { min: 40, icon: '🌑', text: 'Eclipse', desc: 'Shadowed privacy' },
      { min: 30, icon: '🌪️', text: 'Black Hole', desc: 'Privacy void!' },
      { min: 20, icon: '💫', text: 'Meteor', desc: 'Crashing privacy!' },
      { min: 10, icon: '👽', text: 'Alien', desc: 'Invaded privacy!' },
      { min: 0, icon: '💥', text: 'Supernova', desc: 'Privacy exploded!' }
    ];
    
    return space.find(s => score >= s.min) || space[space.length - 1];
  }

  getMovieRating(score) {
    let rating, desc;
    
    if (score >= 90) {
      rating = '🏆 Oscar Winner';
      desc = 'Best Privacy Picture!';
    } else if (score >= 70) {
      rating = '🎬 Blockbuster';
      desc = 'Privacy box office hit!';
    } else if (score >= 50) {
      rating = '📽️ B-Movie';
      desc = 'Straight to privacy DVD';
    } else if (score >= 30) {
      rating = '📼 Direct to VHS';
      desc = 'Privacy bargain bin';
    } else {
      rating = '🗑️ Rotten';
      desc = '0% on Privacy Tomatoes';
    }
    
    return { rating, desc };
  }

  getMusicScore(score) {
    let rating, desc;
    
    if (score >= 90) {
      rating = '🎵 Platinum';
      desc = 'Privacy chart topper!';
    } else if (score >= 70) {
      rating = '🎸 Gold Record';
      desc = 'Privacy hit single!';
    } else if (score >= 50) {
      rating = '🎤 Garage Band';
      desc = 'Privacy practice room';
    } else if (score >= 30) {
      rating = '🎺 Off-Key';
      desc = 'Privacy needs tuning';
    } else {
      rating = '🔇 Muted';
      desc = 'Privacy silent treatment';
    }
    
    return { rating, desc };
  }

  getSportScore(score) {
    let rating, desc;
    
    if (score >= 90) {
      rating = '🏆 Championship';
      desc = 'Privacy world champion!';
    } else if (score >= 70) {
      rating = '🥇 Gold Medal';
      desc = 'Privacy Olympics!';
    } else if (score >= 50) {
      rating = '⚽ Midfield';
      desc = 'Average privacy game';
    } else if (score >= 30) {
      rating = '🏃 Benchwarmer';
      desc = 'Privacy needs practice';
    } else {
      rating = '❌ Disqualified';
      desc = 'Privacy rule violation!';
    }
    
    return { rating, desc };
  }

  getTraditionalGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    if (score >= 35) return 'D-';
    return 'F';
  }

  displayScoreBadge(scores) {
    // Don't show multiple badges
    if (document.getElementById('emoji-score-badge')) return;
    
    const badge = document.createElement('div');
    badge.id = 'emoji-score-badge';
    badge.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: white;
      border: 3px solid ${scores.emoji.color};
      border-radius: 20px;
      padding: 15px;
      width: 200px;
      z-index: 2147483646;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      cursor: pointer;
      animation: bounceIn 0.5s ease;
      transition: all 0.3s ease;
    `;
    
    badge.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; animation: ${scores.emoji.animation} 2s infinite;">
          ${scores.emoji.emoji}
        </div>
        <div style="font-size: 24px; font-weight: bold; color: ${scores.emoji.color}; margin: 5px 0;">
          ${scores.emoji.text}
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          Privacy Score: ${scores.emoji.score}/100
        </div>
        <div style="font-size: 11px; color: #9ca3af; margin-top: 5px; font-style: italic;">
          "${scores.emoji.description}"
        </div>
        
        <!-- Alternative scores carousel -->
        <div style="
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
        ">
          <div>${scores.weather.icon} ${scores.weather.text}</div>
          <div>${scores.stars.display}</div>
          <div>${scores.temperature.icon} ${scores.temperature.text}</div>
        </div>
      </div>
      
      <style>
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes party { 
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes happy { 
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes smile { 
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes worried { 
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes dead { 
          0% { transform: rotate(0); opacity: 1; }
          100% { transform: rotate(360deg); opacity: 0.5; }
        }
      </style>
    `;
    
    document.body.appendChild(badge);
    
    // Click to cycle through scoring systems
    badge.addEventListener('click', () => {
      this.cycleScoringSystems(badge, scores);
    });
    
    // Hover effect
    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'scale(1.05)';
    });
    
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'scale(1)';
    });
    
    // Auto-hide after 20 seconds
    setTimeout(() => {
      if (document.getElementById('emoji-score-badge')) {
        badge.style.animation = 'bounceIn 0.5s ease reverse';
        setTimeout(() => badge.remove(), 500);
      }
    }, 20000);
  }

  cycleScoringSystems(badge, scores) {
    // Rotate through different scoring visualizations
    const systems = ['emoji', 'weather', 'animals', 'food', 'plants', 'space'];
    const currentIndex = systems.indexOf(this.currentSystem);
    const nextIndex = (currentIndex + 1) % systems.length;
    this.currentSystem = systems[nextIndex];
    
    const newScore = scores[this.currentSystem];
    
    // Update badge content with animation
    badge.style.animation = 'none';
    setTimeout(() => {
      badge.style.animation = 'bounceIn 0.3s ease';
    }, 10);
    
    // Update display based on system type
    const mainDisplay = badge.querySelector('div > div:nth-child(2)');
    if (mainDisplay && newScore) {
      mainDisplay.innerHTML = `${newScore.icon} ${newScore.text}`;
    }
  }

  async getPrivacyScore(domain) {
    return new Promise((resolve) => {
      chrome.storage.local.get(`drDOM_${domain}_privacy`, (result) => {
        resolve(result[`drDOM_${domain}_privacy`] || null);
      });
    });
  }

  storeVisualScores(scores, numericScore) {
    const domain = window.location.hostname;
    const storageKey = `drDOM_${domain}_visualScores`;
    
    chrome.storage.local.set({
      [storageKey]: {
        scores,
        numericScore,
        timestamp: Date.now(),
        url: window.location.href
      }
    });
    
    // Send to popup
    chrome.runtime.sendMessage({
      type: 'VISUAL_SCORES_UPDATE',
      scores
    });
  }

  listenForUpdates() {
    // Listen for privacy score updates
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'PRIVACY_SCORE_UPDATED') {
        this.updateScores();
      }
    });
  }
}

// Initialize
const emojiScores = new EmojiScores();
console.log('😊 [Dr. DOM] Emoji Scores activated - Making privacy visual and fun!');