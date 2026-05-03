(function() {
  var config = {
    apiUrl: window.location.origin
  };

  function loadWidget() {
    var container = document.createElement('div');
    container.id = 'ai-chat-widget-root';
    document.body.appendChild(container);

    var script = document.createElement('script');
    script.src = config.apiUrl + '/_next/static/chunks/widget-bundle.js';
    script.async = true;
    script.onload = function() {
      if (window.AIChatWidget) {
        window.AIChatWidget.init(config);
      }
    };
    document.head.appendChild(script);

    trackPageView();
  }

  function trackPageView() {
    var visitorId = localStorage.getItem('ai_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ai_visitor_id', visitorId);
    }

    var sessionId = sessionStorage.getItem('ai_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('ai_session_id', sessionId);
    }

    fetch(config.apiUrl + '/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        visitor_id: visitorId,
        session_id: sessionId,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      })
    }).catch(function(err) {
      console.error('Tracking error:', err);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();