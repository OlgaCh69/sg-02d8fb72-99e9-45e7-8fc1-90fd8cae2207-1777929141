(function() {
  'use strict';

  // Lazy load widget - only initialize when user scrolls or after 3 seconds
  let widgetLoaded = false;

  function loadWidget() {
    if (widgetLoaded) return;
    widgetLoaded = true;

    // Create widget container
    const container = document.createElement('div');
    container.id = 'ai-chat-widget-root';
    document.body.appendChild(container);

    // Load React widget script
    const script = document.createElement('script');
    script.src = window.AI_WIDGET_URL || 'https://your-domain.vercel.app/_next/static/chunks/widget-bundle.js';
    script.async = true;
    script.onload = function() {
      if (window.initAIChatWidget) {
        window.initAIChatWidget({
          containerId: 'ai-chat-widget-root',
          apiUrl: window.AI_WIDGET_API_URL || 'https://your-domain.vercel.app',
        });
      }
    };
    document.body.appendChild(script);
  }

  // Trigger lazy load on scroll
  let scrolled = false;
  window.addEventListener('scroll', function() {
    if (!scrolled && (window.scrollY > 100 || document.documentElement.scrollTop > 100)) {
      scrolled = true;
      loadWidget();
    }
  }, { passive: true });

  // Fallback: load after 3 seconds if no scroll
  setTimeout(function() {
    if (!widgetLoaded) {
      loadWidget();
    }
  }, 3000);

  // Load immediately on user interaction
  ['click', 'mousemove', 'touchstart'].forEach(function(event) {
    document.addEventListener(event, function() {
      loadWidget();
    }, { once: true, passive: true });
  });
})();