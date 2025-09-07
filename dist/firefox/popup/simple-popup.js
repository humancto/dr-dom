/**
 * Ultra-simple Dr. DOM popup for basic testing
 */

console.log('Simple Dr. DOM popup loaded');

let isInspecting = false;
let currentTab = null;

async function init() {
  console.log('Initializing simple popup...');
  
  // Get current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    console.log('Current tab:', tab.url);
  } catch (error) {
    console.error('Failed to get current tab:', error);
  }
  
  // Add click handlers to all buttons
  document.addEventListener('click', handleClick);
  
  updateUI();
  console.log('Simple popup initialized');
}

function handleClick(event) {
  console.log('Click detected:', event.target.id);
  
  switch (event.target.id) {
    case 'inspectBtn':
      toggleInspection();
      break;
    case 'screenshotBtn':
      takeScreenshot();
      break;
    case 'exportBtn':
      exportData();
      break;
    default:
      console.log('Unhandled click:', event.target.id);
  }
}

async function toggleInspection() {
  console.log('Toggle inspection, current state:', isInspecting);
  
  if (!currentTab) {
    showMessage('No current tab available');
    return;
  }
  
  // Check if we can access this tab
  if (currentTab.url.startsWith('chrome:') || currentTab.url.startsWith('chrome-extension:')) {
    showMessage('Cannot inspect browser pages. Try a regular website like google.com');
    return;
  }
  
  isInspecting = !isInspecting;
  console.log('New state:', isInspecting);
  
  try {
    const action = isInspecting ? 'startInspection' : 'stopInspection';
    console.log('Sending message:', action);
    
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: action,
      timestamp: Date.now()
    });
    
    console.log('Response received:', response);
    showMessage(`${isInspecting ? 'Started' : 'Stopped'} inspection successfully`);
    updateUI();
    
  } catch (error) {
    console.error('Failed to toggle inspection:', error);
    showMessage('Error: ' + error.message);
    isInspecting = !isInspecting; // Revert
    updateUI();
  }
}

function updateUI() {
  const inspectBtn = document.getElementById('inspectBtn');
  if (inspectBtn) {
    inspectBtn.textContent = isInspecting ? '⏸️ Stop Inspection' : '🔍 Start Inspection';
    inspectBtn.style.background = isInspecting ? '#ef4444' : '#10b981';
  }
  
  console.log('UI updated, inspection:', isInspecting);
}

function takeScreenshot() {
  showMessage('Screenshot feature coming soon!');
}

function exportData() {
  showMessage('Export feature coming soon!');
}

function showMessage(text) {
  console.log('Message:', text);
  
  // Create or update message display
  let messageDiv = document.getElementById('message');
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'message';
    messageDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: #3b82f6;
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    `;
    document.body.appendChild(messageDiv);
  }
  
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', init);

console.log('Simple popup script loaded');