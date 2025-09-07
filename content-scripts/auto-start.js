/**
 * Dr. DOM Auto-Start Script
 * Ensures all components are initialized and ready
 */

console.log('🚀 Dr. DOM Auto-Start initializing IMMEDIATELY at:', document.readyState);

// START MONITORING IMMEDIATELY - Don't wait for anything!
function startImmediateMonitoring() {
  console.log('🔴 IMMEDIATE MONITORING ACTIVE');
  
  // Check if coordinator exists immediately
  if (window.drDOMCoordinator) {
    console.log('✅ Starting Dr. DOM monitoring NOW!');
    try {
      const result = window.drDOMCoordinator.startInspection();
      console.log('✅ Dr. DOM monitoring active:', result);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  } else {
    // Try again in 10ms if coordinator not ready
    setTimeout(startImmediateMonitoring, 10);
  }
}

// Start immediately - don't wait for DOM
startImmediateMonitoring();

// Also verify components after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', verifyComponents);
} else {
  verifyComponents();
}

function verifyComponents() {
  console.log('🎯 Verifying Dr. DOM components...');
  
  const components = {
    coordinator: !!window.drDOMCoordinator,
    inspector: !!window.drDOMInspector,
    networkMonitor: !!window.drDOMNetworkMonitor,
    advancedNetworkMonitor: !!window.drDOMAdvancedNetworkMonitor,
    errorTracker: !!window.drDOMErrorTracker,
    intelligentErrorAnalyzer: !!window.drDOMIntelligentErrorAnalyzer,
    smartConsoleAnalyzer: !!window.drDOMSmartConsoleAnalyzer,
    coreWebVitalsMonitor: !!window.drDOMCoreWebVitalsMonitor,
    performanceMonitor: !!window.drDOMPerformanceMonitor
  };
  
  console.log('📊 Dr. DOM Components Status:', components);
  
  // Send ready message to popup if it's listening
  if (chrome.runtime) {
    chrome.runtime.sendMessage({
      type: 'DR_DOM_READY',
      components: components,
      url: window.location.href
    }).catch(() => {
      // Popup might not be open yet, that's ok
    });
  }
}

// Listen for messages from popup even before coordinator is ready
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🎯 Dr. DOM Auto-Start received message:', request);
  
  if (request.action === 'checkStatus') {
    sendResponse({
      ready: !!window.drDOMCoordinator,
      components: {
        coordinator: !!window.drDOMCoordinator,
        advancedNetworkMonitor: !!window.drDOMAdvancedNetworkMonitor,
        intelligentErrorAnalyzer: !!window.drDOMIntelligentErrorAnalyzer,
        smartConsoleAnalyzer: !!window.drDOMSmartConsoleAnalyzer,
        coreWebVitalsMonitor: !!window.drDOMCoreWebVitalsMonitor
      }
    });
    return true;
  }
  
  // Let coordinator handle other messages if it exists
  return false;
});

console.log('🚀 Dr. DOM Auto-Start script loaded');