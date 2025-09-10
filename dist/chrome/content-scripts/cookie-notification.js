/**
 * Cookie Cleaning Notification Handler
 * Shows visual feedback when cookies are cleaned
 */

(function() {
  // Listen for cookie cleaning notifications
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showCookieCleanNotification') {
      showNotification(request.title, request.message, request.count, request.details);
      sendResponse({ success: true });
    }
  });

  function showNotification(title, message, count, details) {
    // Remove any existing notification
    const existing = document.getElementById('dr-dom-cookie-notification');
    if (existing) {
      existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'dr-dom-cookie-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0;
      border-radius: 12px;
      width: 350px;
      z-index: 2147483647;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideIn 0.3s ease-out;
      overflow: hidden;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      @keyframes cookieCrumble {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(0.8); }
        100% { transform: rotate(360deg) scale(0) translateY(20px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Create notification content
    notification.innerHTML = `
      <div style="padding: 20px; position: relative;">
        <button style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        " onclick="this.parentElement.parentElement.style.animation='slideOut 0.3s ease'; setTimeout(() => this.parentElement.parentElement.remove(), 300)">×</button>
        
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="font-size: 36px; margin-right: 15px; animation: cookieCrumble 2s ease-in-out infinite;">
            🍪
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
              ${title}
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
              ${message}
            </div>
          </div>
        </div>
        
        ${count > 0 ? `
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 10px;
          ">
            <div style="font-size: 24px; font-weight: bold; text-align: center;">
              ${count} ${count === 1 ? 'Cookie' : 'Cookies'} Destroyed!
            </div>
          </div>
        ` : ''}
        
        ${details && details.length > 0 ? `
          <div style="
            background: rgba(0,0,0,0.2);
            padding: 8px;
            border-radius: 6px;
            max-height: 100px;
            overflow-y: auto;
            font-size: 11px;
            font-family: monospace;
          ">
            <strong>Removed:</strong><br>
            ${details.slice(0, 10).join(', ')}
            ${details.length > 10 ? ` ... and ${details.length - 10} more` : ''}
          </div>
        ` : ''}
        
        <div style="
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        ">
          <span style="opacity: 0.8;">Your privacy is protected! 🛡️</span>
          <span style="opacity: 0.6;">Dr. DOM</span>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.getElementById('dr-dom-cookie-notification')) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);

    // Play a subtle sound effect (optional)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2Oy9diMFl2z2VzUnBTh+PLXo8Ohf');
      audio.volume = 0.2;
      audio.play().catch(() => {}); // Ignore if audio fails
    } catch (e) {
      // Ignore audio errors
    }
  }
})();