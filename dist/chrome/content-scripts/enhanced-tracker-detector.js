/**
 * Enhanced Tracker Detector with comprehensive tracking lists
 * Uses EasyList, EasyPrivacy patterns and known tracker domains
 */

class EnhancedTrackerDetector {
  constructor() {
    // Comprehensive tracker domains from various privacy lists
    this.TRACKER_DOMAINS = {
      // Analytics & Metrics
      analytics: [
        'google-analytics.com', 'googletagmanager.com', 'google.com/analytics',
        'segment.io', 'segment.com', 'cdn.segment.com',
        'mixpanel.com', 'cdn.mxpnl.com', 'api.mixpanel.com',
        'amplitude.com', 'cdn.amplitude.com',
        'heap.io', 'heapanalytics.com', 'cdn.heapanalytics.com',
        'kissmetrics.com', 'kissmetrics.io',
        'quantserve.com', 'quantcount.com',
        'scorecardresearch.com', 'comscore.com',
        'newrelic.com', 'nr-data.net',
        'pingdom.net', 'rum.pingdom.net',
        'fullstory.com', 'fullstory.com/rec',
        'hotjar.com', 'static.hotjar.com', 'script.hotjar.com',
        'mouseflow.com', 'cdn.mouseflow.com',
        'luckyorange.com', 'luckyorange.net',
        'crazyegg.com', 'script.crazyegg.com',
        'inspectlet.com', 'cdn.inspectlet.com',
        'sessioncam.com', 'ws.sessioncam.com',
        'clicktale.com', 'clicktale.net',
        'smartlook.com', 'rec.smartlook.com',
        'userreport.com', 'cdn.userreport.com',
        'statcounter.com', 'c.statcounter.com',
        'clicky.com', 'static.getclicky.com',
        'woopra.com', 'static.woopra.com',
        'matomo.org', 'piwik.org', 'piwik.pro',
        'plausible.io', 'plausible.io/js',
        'simpleanalytics.com', 'simpleanalyticscdn.com',
        'umami.is', 'umami.is/script.js'
      ],
      
      // Advertising & Marketing
      advertising: [
        'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
        'facebook.com/tr', 'connect.facebook.net', 'facebook.com/en_US/fbevents.js',
        'amazon-adsystem.com', 'amazontag.com', 'amazon-adsystem.com/aax',
        'adsymptotic.com', 'rubiconproject.com', 'adsrvr.org',
        'adnxs.com', 'ib.adnxs.com', 'secure.adnxs.com',
        'criteo.com', 'criteo.net', 'static.criteo.net',
        'pubmatic.com', 'image2.pubmatic.com',
        'openx.net', 'openx.com', 'servedby.openx.com',
        'taboola.com', 'cdn.taboola.com',
        'outbrain.com', 'widgets.outbrain.com',
        'media.net', 'contextual.media.net',
        'adsafeprotected.com', 'iasds01.com',
        'moatads.com', 'moatpixel.com',
        'adsystem.com', 'adtech.de', 'adtechjp.com',
        'bidswitch.net', 'casalemedia.com',
        'contextweb.com', 'sharethrough.com',
        'sovrn.com', 'lijit.com',
        'spotxchange.com', 'spotx.tv',
        'teads.tv', 'teads.com',
        'triplelift.com', '3lift.com',
        'indexexchange.com', 'indexww.com',
        'rhythmone.com', 'rhythmnewmedia.com',
        'yieldmo.com', 'yieldmo.com/pixel'
      ],
      
      // Social Media Trackers
      social: [
        'facebook.com/plugins', 'facebook.com/v2', 'fbcdn.net',
        'platform.twitter.com', 'syndication.twitter.com', 'analytics.twitter.com',
        'platform.linkedin.com', 'px.ads.linkedin.com', 'linkedin.com/px',
        'pinterest.com/v3', 'ct.pinterest.com', 'analytics.pinterest.com',
        'instagram.com/embed', 'instagram.com/p/',
        'tiktok.com/embed', 'analytics.tiktok.com', 'analytics-sg.tiktok.com',
        'snapchat.com/ts', 'tr.snapchat.com',
        'reddit.com/static/pixel', 'redditmedia.com',
        'tumblr.com/analytics', 'px.srvcs.tumblr.com',
        'youtube.com/api/stats', 'youtube-nocookie.com'
      ],
      
      // Data Brokers & DMPs
      dataBrokers: [
        'bluekai.com', 'bkrtx.com', 'tags.bluekai.com',
        'exelator.com', 'loadm.exelator.com',
        'krxd.net', 'cdn.krxd.net', 'beacon.krxd.net',
        'adsrvr.org', 'match.adsrvr.org',
        'demdex.net', 'dpm.demdex.net',
        'agkn.com', 'aa.agkn.com',
        'eyeota.net', 'ps.eyeota.net',
        'turn.com', 'i.turn.com',
        'mathtag.com', 'pixel.mathtag.com',
        'rlcdn.com', 'rc.rlcdn.com',
        'gwallet.com', 'analytics.gwallet.com',
        'bidtheatre.com', 'x.bidtheatre.com',
        'owneriq.net', 'px.owneriq.net',
        'simpli.fi', 'i.simpli.fi',
        'addthis.com', 's7.addthis.com',
        'sharethis.com', 'w.sharethis.com'
      ],
      
      // Customer Data Platforms
      cdp: [
        'segment.com', 'cdn.segment.io', 'api.segment.io',
        'branch.io', 'api2.branch.io',
        'braze.com', 'sdk.braze.com',
        'customer.io', 'track.customer.io',
        'intercom.io', 'widget.intercom.io',
        'drift.com', 'js.driftt.com',
        'hubspot.com', 'js.hs-scripts.com', 'track.hubspot.com',
        'marketo.com', 'munchkin.marketo.net',
        'pardot.com', 'pi.pardot.com',
        'salesforce.com/analytics', 'cdn.krxd.net',
        'klaviyo.com', 'static.klaviyo.com',
        'mailchimp.com', 'chimpstatic.com',
        'constantcontact.com', 'ctctcdn.com',
        'sendgrid.com', 'sendgrid.net',
        'mailgun.com', 'mailgun.org'
      ],
      
      // Fingerprinting Services
      fingerprinting: [
        'fingerprintjs.com', 'fpjs.io', 'cdn.fpjs.io',
        'ipify.org', 'api.ipify.org',
        'ipinfo.io', 'ipapi.co',
        'extreme-ip-lookup.com', 'ip-api.com',
        'iovation.com', 'device.iovation.com',
        'threatmetrix.com', 'device.threatmetrix.com',
        'maxmind.com', 'geoip.maxmind.com',
        'siftscience.com', 'cdn.siftscience.com',
        'deviceatlas.com', 'js.deviceatlas.com'
      ],
      
      // Tag Management
      tagManagement: [
        'googletagmanager.com', 'www.googletagmanager.com',
        'tagmanager.google.com', 'www.tagmanager.google.com',
        'tealium.com', 'tags.tiqcdn.com',
        'ensighten.com', 'nexus.ensighten.com',
        'adobedtm.com', 'assets.adobedtm.com',
        'launch.adobe.com', 'cdn.launch.adobe.com',
        'commandersact.com', 'cdn.tagcommander.com',
        'qubit.com', 'static.goqubit.com'
      ],
      
      // Error Tracking (can leak data)
      errorTracking: [
        'sentry.io', 'browser.sentry-cdn.com',
        'bugsnag.com', 'd2wy8f7a9ursnm.cloudfront.net',
        'rollbar.com', 'cdn.rollbar.com',
        'raygun.io', 'cdn.raygun.io',
        'logrocket.com', 'cdn.logrocket.io',
        'trackjs.com', 'cdn.trackjs.com'
      ]
    };

    // Known tracking parameters in URLs
    this.TRACKING_PARAMS = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'dclid', 'msclkid',
      'mc_cid', 'mc_eid',
      'affiliate', 'ref', 'referrer',
      'click_id', 'clickid', 'session_id',
      'visitor_id', 'user_id', 'client_id'
    ];

    // Tracking cookies patterns
    this.TRACKING_COOKIES = [
      '_ga', '_gid', '_gat', '__utma', '__utmb', '__utmc', '__utmz',
      '_fbp', '_fbc', 'fbm_', 'xs', 'datr',
      'IDE', 'DSID', 'id', '__gads',
      '_pinterest_sess', '_pinterest_cm',
      'personalization_id', 'guest_id',
      '__hssc', '__hssrc', '__hstc', 'hubspotutk',
      '_mkto_trk',
      'optimizelyEndUserId', 'optimizelySegments',
      '_hjid', '_hjIncludedInSample',
      'mp_', 'mixpanel',
      'amplitude_id',
      'ajs_user_id', 'ajs_anonymous_id'
    ];
  }

  /**
   * Detect tracker from URL
   */
  detectTracker(url) {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();
      
      // Check against all tracker categories
      for (const [category, domains] of Object.entries(this.TRACKER_DOMAINS)) {
        for (const tracker of domains) {
          if (hostname.includes(tracker) || fullUrl.includes(tracker)) {
            return {
              url: url,
              domain: tracker,
              category: category,
              hostname: hostname,
              timestamp: Date.now(),
              severity: this.getTrackerSeverity(category)
            };
          }
        }
      }
      
      // Check for tracking parameters
      const trackingParams = this.detectTrackingParams(urlObj);
      if (trackingParams.length > 0) {
        return {
          url: url,
          type: 'tracking_params',
          params: trackingParams,
          category: 'url_tracking',
          timestamp: Date.now(),
          severity: 'low'
        };
      }
    } catch (e) {
      console.warn('Failed to parse URL:', url);
    }
    
    return null;
  }

  /**
   * Detect tracking parameters in URL
   */
  detectTrackingParams(urlObj) {
    const found = [];
    for (const param of this.TRACKING_PARAMS) {
      if (urlObj.searchParams.has(param)) {
        found.push({
          name: param,
          value: urlObj.searchParams.get(param)
        });
      }
    }
    return found;
  }

  /**
   * Analyze cookies for tracking
   */
  analyzeCookies(cookies) {
    const trackingCookies = [];
    
    cookies.forEach(cookie => {
      const name = cookie.name.toLowerCase();
      
      // Check against known tracking cookies
      for (const pattern of this.TRACKING_COOKIES) {
        if (name.includes(pattern.toLowerCase())) {
          trackingCookies.push({
            name: cookie.name,
            pattern: pattern,
            value: cookie.value,
            domain: cookie.domain,
            category: this.categorizeCookie(pattern),
            severity: 'medium'
          });
          break;
        }
      }
      
      // Check for suspicious patterns
      if (this.isSuspiciousCookie(cookie)) {
        trackingCookies.push({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          category: 'suspicious',
          severity: 'low'
        });
      }
    });
    
    return trackingCookies;
  }

  /**
   * Check if cookie looks suspicious
   */
  isSuspiciousCookie(cookie) {
    const suspicious = [
      /^[a-f0-9]{32}$/i,  // MD5 hash
      /^[a-f0-9]{40}$/i,  // SHA1 hash
      /^[a-f0-9]{64}$/i,  // SHA256 hash
      /uuid/i,
      /guid/i,
      /fingerprint/i,
      /track/i,
      /visitor/i,
      /session/i
    ];
    
    return suspicious.some(pattern => pattern.test(cookie.name) || pattern.test(cookie.value));
  }

  /**
   * Categorize cookie by pattern
   */
  categorizeCookie(pattern) {
    if (pattern.startsWith('_ga') || pattern.startsWith('__utm')) return 'analytics';
    if (pattern.startsWith('_fb') || pattern.startsWith('fbm_')) return 'social';
    if (pattern.includes('id')) return 'advertising';
    if (pattern.includes('optimizely')) return 'testing';
    if (pattern.includes('hj') || pattern.includes('hotjar')) return 'heatmap';
    return 'tracking';
  }

  /**
   * Get tracker severity
   */
  getTrackerSeverity(category) {
    const severities = {
      fingerprinting: 'critical',
      dataBrokers: 'high',
      advertising: 'high',
      social: 'medium',
      analytics: 'medium',
      cdp: 'medium',
      errorTracking: 'low',
      tagManagement: 'low'
    };
    return severities[category] || 'medium';
  }

  /**
   * Generate privacy score
   */
  calculatePrivacyScore(trackers, cookies) {
    let score = 100;
    
    // Deduct for trackers
    const criticalTrackers = trackers.filter(t => t.severity === 'critical').length;
    const highTrackers = trackers.filter(t => t.severity === 'high').length;
    const mediumTrackers = trackers.filter(t => t.severity === 'medium').length;
    
    score -= criticalTrackers * 15;
    score -= highTrackers * 10;
    score -= mediumTrackers * 5;
    
    // Deduct for tracking cookies
    const trackingCookies = cookies.filter(c => c.category !== 'suspicious').length;
    score -= Math.min(trackingCookies * 3, 30);
    
    // Deduct for variety of tracking categories
    const categories = new Set(trackers.map(t => t.category));
    if (categories.size > 5) score -= 10;
    else if (categories.size > 3) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get privacy report
   */
  getPrivacyReport(trackers, cookies) {
    const categories = {};
    trackers.forEach(tracker => {
      if (!categories[tracker.category]) {
        categories[tracker.category] = [];
      }
      categories[tracker.category].push(tracker);
    });
    
    const score = this.calculatePrivacyScore(trackers, cookies);
    
    return {
      score: score,
      grade: this.getGrade(score),
      totalTrackers: trackers.length,
      totalTrackingCookies: cookies.length,
      categories: categories,
      summary: this.getSummary(score, trackers.length),
      recommendations: this.getRecommendations(categories)
    };
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getSummary(score, trackerCount) {
    if (score >= 90) return `Excellent privacy! Only ${trackerCount} trackers found.`;
    if (score >= 70) return `Good privacy with ${trackerCount} trackers detected.`;
    if (score >= 50) return `Moderate privacy concerns with ${trackerCount} trackers.`;
    return `Serious privacy issues! ${trackerCount} trackers are monitoring you.`;
  }

  getRecommendations(categories) {
    const recommendations = [];
    
    if (categories.fingerprinting) {
      recommendations.push('⚠️ Device fingerprinting detected - consider using anti-fingerprinting browser');
    }
    if (categories.dataBrokers) {
      recommendations.push('🔒 Data brokers present - your data may be sold to third parties');
    }
    if (categories.advertising && categories.advertising.length > 5) {
      recommendations.push('📊 Heavy ad tracking - consider using an ad blocker');
    }
    if (categories.social && categories.social.length > 3) {
      recommendations.push('👥 Multiple social media trackers - limit social plugins');
    }
    
    return recommendations;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedTrackerDetector;
}