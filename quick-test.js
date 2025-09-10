// Quick test script to verify Dr. DOM extension features
// Run this in the Chrome console on the test page

console.log('🧪 Starting Dr. DOM Extension Test...\n');

// Test 1: Check if content scripts are loaded
console.log('1️⃣ Checking content scripts...');
if (typeof DrDOMFunFeatures !== 'undefined') {
  console.log('✅ Fun Features loaded');
} else {
  console.log('❌ Fun Features NOT loaded');
}

if (typeof DrDOMPrivacyProtection !== 'undefined') {
  console.log('✅ Privacy Protection loaded');
} else {
  console.log('❌ Privacy Protection NOT loaded');
}

// Test 2: Check cookies
console.log('\n2️⃣ Checking cookies...');
const cookies = document.cookie.split(';');
console.log(`Found ${cookies.length} cookies:`, cookies);

// Test 3: Check for cookie banner
console.log('\n3️⃣ Checking for cookie banner...');
setTimeout(() => {
  const banner = document.getElementById('drdom-cookie-banner');
  if (banner) {
    console.log('✅ Cookie banner found!');
  } else {
    console.log('❌ Cookie banner NOT found (should appear 2s after page load)');
  }
}, 2500);

// Test 4: Check Chrome storage
console.log('\n4️⃣ Checking Chrome storage...');
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['globalPrivacyStats', 'privacyConfig'], (result) => {
    console.log('Storage data:', result);
  });
}

// Test 5: Send test message to content script
console.log('\n5️⃣ Testing message passing...');
try {
  chrome.runtime.sendMessage({ action: 'getWeatherReport' }, (response) => {
    if (response) {
      console.log('✅ Message response received:', response);
    } else {
      console.log('❌ No response from content script');
    }
  });
} catch (e) {
  console.log('Note: Message passing only works from extension context');
}

console.log('\n🏁 Test complete! Check results above.');