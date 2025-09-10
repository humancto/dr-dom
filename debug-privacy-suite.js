/**
 * Debug script for Privacy Suite
 * Run this in Chrome DevTools console to test functionality
 */

console.log('🔍 Dr. DOM Privacy Suite Debugger\n');
console.log('=====================================\n');

// Test 1: Check if content scripts are loaded
console.log('1️⃣ Checking content scripts...');
if (typeof privacyProtection !== 'undefined') {
  console.log('✅ Privacy Protection Suite loaded');
  console.log('   Config:', privacyProtection.config);
  console.log('   Stats:', privacyProtection.stats);
} else {
  console.log('❌ Privacy Protection Suite NOT loaded');
}

if (typeof funFeatures !== 'undefined') {
  console.log('✅ Fun Features loaded');
} else {
  console.log('❌ Fun Features NOT loaded');
}

if (typeof drdomTrackerBanner !== 'undefined') {
  console.log('✅ Tracker Banner loaded');
  console.log('   Cookies:', drdomTrackerBanner.cookies.size);
  console.log('   Trackers:', drdomTrackerBanner.trackers.size);
  console.log('   Pixels:', drdomTrackerBanner.pixels.size);
} else {
  console.log('❌ Tracker Banner NOT loaded');
}

// Test 2: Check Chrome storage
console.log('\n2️⃣ Checking Chrome storage...');
if (chrome && chrome.storage) {
  chrome.storage.local.get(['globalPrivacyStats', 'privacyConfig'], (result) => {
    console.log('📦 Storage contents:');
    console.log('   Global stats:', result.globalPrivacyStats);
    console.log('   Privacy config:', result.privacyConfig);
  });
}

// Test 3: Test message passing
console.log('\n3️⃣ Testing message responses...');
console.log('Run these in the POPUP console:');
console.log('chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{');
console.log('  chrome.tabs.sendMessage(tabs[0].id,{action:"showRoast"},(r)=>console.log(r))');
console.log('});');

// Test 4: Manually trigger features
console.log('\n4️⃣ Manual triggers (run these to test):');
console.log('funFeatures.showCookieBanner() - Show cookie banner');
console.log('funFeatures.showPrivacyReport() - Show privacy report modal');
console.log('privacyProtection.stats - View blocking stats');

// Test 5: Check for errors
console.log('\n5️⃣ Checking for errors...');
const errors = [];

if (!document.getElementById('drdom-tracker-banner')) {
  errors.push('Tracker banner not visible on page');
}

if (!document.getElementById('drdom-cookie-banner')) {
  console.log('⚠️ Cookie banner not visible (may appear in 2 seconds)');
}

if (errors.length > 0) {
  console.log('❌ Errors found:');
  errors.forEach(e => console.log('   -', e));
} else {
  console.log('✅ No obvious errors detected');
}

console.log('\n=====================================');
console.log('📋 TROUBLESHOOTING STEPS:');
console.log('1. Reload the extension in chrome://extensions');
console.log('2. Refresh this webpage');
console.log('3. Open the extension popup');
console.log('4. Click on Privacy Suite tab');
console.log('5. Try clicking the buttons');
console.log('6. Check DevTools console for error messages');
console.log('\n🔄 If buttons don\'t work, the page may need a refresh');