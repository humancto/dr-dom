# Dr. DOM Workflow Verification Checklist

## ✅ Installation Steps
1. Open Chrome → chrome://extensions/
2. Enable Developer Mode
3. Click "Load unpacked" → Select `/Users/archithrapaka/claude-projects/dr-dom/dist/chrome`
4. Verify Dr. DOM icon appears in toolbar

## ✅ Test Workflow

### Step 1: Initial Page Load Capture
1. Navigate to: http://localhost:8080/test/api-test.html
2. **IMMEDIATELY** click Dr. DOM icon
3. **Expected**: Should see initial page load request already captured

### Step 2: Verify Tabs
1. **Overview Tab** ✓
   - Shows request count
   - Shows performance score
   - Shows live activity stream
   
2. **Requests Tab** ✓
   - Lists all captured requests
   - Shows method, URL, status, time
   - Search and filter work
   
3. **Performance Tab** ✓
   - Shows average response time
   - Lists slow requests
   - Shows performance insights
   
4. **Security Tab** ✓
   - Shows HTTPS vs HTTP count
   - Identifies mixed content
   - Shows third-party requests
   
5. **APIs Tab** ✓
   - Shows unique endpoints count
   - Lists top endpoints
   - Shows API domains

### Step 3: Test Real-time Capture
1. Click "JSON API Call" button on test page
2. **Expected**: Request appears immediately in Dr. DOM
3. Click "Multiple Requests" button
4. **Expected**: All 5 requests appear in real-time

### Step 4: Verify Always-On Behavior
1. Close popup
2. Make more requests on the page
3. Reopen popup
4. **Expected**: All requests captured while popup was closed

## 🔍 Debugging Commands

Check if content scripts are loaded:
```javascript
// In Chrome DevTools Console on the test page:
console.log('Coordinator:', window.drDOMCoordinator);
console.log('Network Monitor:', window.drDOMAdvancedNetworkMonitor);
console.log('Pending Requests:', window.__drDOMPendingRequests);
```

Check if monitoring is active:
```javascript
window.drDOMCoordinator.isActive
```

## 📊 Success Criteria

✅ Extension loads without errors
✅ Captures page load requests immediately
✅ All 5 tabs display data correctly
✅ Real-time updates work (1 second refresh)
✅ Works like Chrome DevTools Network tab
✅ No "Start Analysis" button - always active
✅ Data persists when popup closes/reopens

## 🐛 Common Issues & Fixes

1. **No data showing**: 
   - Reload the extension
   - Refresh the test page
   - Check console for errors

2. **API tab empty**:
   - Make API requests using test buttons
   - Verify requests are JSON type

3. **Missing page load requests**:
   - Check 00-immediate-start.js is loading
   - Verify run_at: "document_start" in manifest