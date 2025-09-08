/**
 * HAR (HTTP Archive) Export Utility
 * Exports captured network data in standard HAR format
 */

class HARExporter {
  static generateHAR(data) {
    const requests = data.requests || [];
    const pageUrl = data.url || '';
    const startTime = data.startTime || Date.now();
    
    const har = {
      log: {
        version: "1.2",
        creator: {
          name: "Dr. DOM",
          version: "1.0.0",
          comment: "Advanced Web Analysis Extension"
        },
        browser: {
          name: "Chrome",
          version: navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown"
        },
        pages: [
          {
            startedDateTime: new Date(startTime).toISOString(),
            id: "page_1",
            title: pageUrl,
            pageTimings: {
              onContentLoad: -1,
              onLoad: -1
            }
          }
        ],
        entries: []
      }
    };
    
    // Convert requests to HAR entries
    har.log.entries = requests.map((request, index) => {
      const entry = {
        startedDateTime: new Date(request.timestamp || startTime).toISOString(),
        time: request.duration || 0,
        request: {
          method: request.method || "GET",
          url: request.url || "",
          httpVersion: "HTTP/1.1",
          cookies: [],
          headers: this.extractHeaders(request.requestHeaders),
          queryString: this.extractQueryString(request.url),
          headersSize: -1,
          bodySize: request.requestBodySize || -1
        },
        response: {
          status: request.status || 0,
          statusText: this.getStatusText(request.status),
          httpVersion: "HTTP/1.1",
          cookies: [],
          headers: this.extractHeaders(request.responseHeaders),
          content: {
            size: request.size || 0,
            compression: request.compression || 0,
            mimeType: request.mimeType || this.guessMimeType(request.url) || "application/octet-stream",
            text: request.responseBody || "",
            encoding: request.encoding || "base64"
          },
          redirectURL: request.redirectURL || "",
          headersSize: -1,
          bodySize: request.size || -1
        },
        cache: {},
        timings: {
          blocked: -1,
          dns: request.dnsTime || -1,
          connect: request.connectTime || -1,
          send: request.sendTime || 0,
          wait: request.waitTime || request.duration || 0,
          receive: request.receiveTime || 0,
          ssl: request.sslTime || -1
        },
        serverIPAddress: request.serverIP || "",
        connection: request.connection || "",
        pageref: "page_1"
      };
      
      // Add optional fields if available
      if (request.comment) {
        entry.comment = request.comment;
      }
      
      return entry;
    });
    
    return har;
  }
  
  static extractHeaders(headers) {
    if (!headers) return [];
    
    if (Array.isArray(headers)) {
      return headers;
    }
    
    if (typeof headers === 'object') {
      return Object.entries(headers).map(([name, value]) => ({
        name,
        value: Array.isArray(value) ? value.join(', ') : value
      }));
    }
    
    return [];
  }
  
  static extractQueryString(url) {
    if (!url) return [];
    
    try {
      const urlObj = new URL(url);
      const params = [];
      
      urlObj.searchParams.forEach((value, name) => {
        params.push({ name, value });
      });
      
      return params;
    } catch (e) {
      return [];
    }
  }
  
  static getStatusText(status) {
    const statusTexts = {
      200: "OK",
      201: "Created",
      204: "No Content",
      301: "Moved Permanently",
      302: "Found",
      304: "Not Modified",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable"
    };
    
    return statusTexts[status] || "";
  }
  
  static guessMimeType(url) {
    if (!url) return null;
    
    const extension = url.split('.').pop()?.toLowerCase().split('?')[0];
    
    const mimeTypes = {
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'otf': 'font/otf',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mp3': 'audio/mpeg',
      'ogg': 'audio/ogg',
      'pdf': 'application/pdf',
      'zip': 'application/zip'
    };
    
    return mimeTypes[extension] || null;
  }
  
  static downloadHAR(data, filename = null) {
    const har = this.generateHAR(data);
    const json = JSON.stringify(har, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename if not provided
    if (!filename) {
      const domain = data.hostname || 'unknown';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `dr-dom-${domain}-${timestamp}.har`;
    }
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return filename;
  }
  
  static exportToJSON(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const domain = data.hostname || 'unknown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dr-dom-raw-${domain}-${timestamp}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return filename;
  }
  
  static exportToCSV(data) {
    const requests = data.requests || [];
    
    // Define CSV headers
    const headers = ['Timestamp', 'Method', 'URL', 'Status', 'Duration (ms)', 'Size (bytes)', 'Type'];
    
    // Convert requests to CSV rows
    const rows = requests.map(req => [
      new Date(req.timestamp).toISOString(),
      req.method || 'GET',
      req.url || '',
      req.status || '',
      req.duration ? Math.round(req.duration) : '',
      req.size || '',
      req.type || ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const domain = data.hostname || 'unknown';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dr-dom-requests-${domain}-${timestamp}.csv`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return filename;
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HARExporter;
}