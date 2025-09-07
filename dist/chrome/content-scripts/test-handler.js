/**
 * Simple test handler to debug extension communication
 */

console.log('Dr. DOM Test Handler loaded');

// Simple message handler for testing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Dr. DOM: Received message:', request);
  
  try {
    switch (request.action) {
      case 'startInspection':
        console.log('Dr. DOM: Starting inspection...');
        
        // Show a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          z-index: 2147483647;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        notification.textContent = '🔍 Dr. DOM inspection started!';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
        
        sendResponse({ success: true, message: 'Inspection started' });
        break;
        
      case 'stopInspection':
        console.log('Dr. DOM: Stopping inspection...');
        
        // Show stop notification
        const stopNotification = document.createElement('div');
        stopNotification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ef4444;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: Arial, sans-serif;
          font-size: 14px;
          z-index: 2147483647;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        stopNotification.textContent = '⏸️ Dr. DOM inspection stopped!';
        document.body.appendChild(stopNotification);
        
        setTimeout(() => stopNotification.remove(), 3000);
        
        sendResponse({ success: true, message: 'Inspection stopped' });
        break;
        
      case 'getStats':
        sendResponse({
          errors: Math.floor(Math.random() * 10),
          requests: Math.floor(Math.random() * 50),
          performance: Math.floor(Math.random() * 100),
          domNodes: document.querySelectorAll('*').length
        });
        break;
        
      default:
        console.log('Dr. DOM: Unknown action:', request.action);
        sendResponse({ error: 'Unknown action: ' + request.action });
    }
  } catch (error) {
    console.error('Dr. DOM: Error handling message:', error);
    sendResponse({ error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

// Add a visual indicator that the script is loaded
const indicator = document.createElement('div');
indicator.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-family: Arial, sans-serif;
  font-size: 11px;
  z-index: 2147483646;
  pointer-events: none;
`;
indicator.textContent = '🔍 Dr. DOM Ready';
document.body.appendChild(indicator);

setTimeout(() => indicator.remove(), 2000);

console.log('Dr. DOM Test Handler initialized and ready!');