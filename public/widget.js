/**
 * O.N.E.Tech AI Assistant - Embeddable Widget
 * 
 * Add this script to any website to enable the AI chat assistant.
 * 
 * Usage:
 * <script src="https://your-domain.com/widget.js"></script>
 * 
 * Or with configuration:
 * <script>
 *   window.ONETECH_CONFIG = {
 *     apiUrl: 'https://your-domain.com',
 *     theme: 'light', // 'light' or 'dark'
 *     position: 'bottom-right', // 'bottom-right' or 'bottom-left'
 *   };
 * </script>
 * <script src="https://your-domain.com/widget.js"></script>
 */

(function() {
  'use strict';

  // Get configuration
  const config = window.ONETECH_CONFIG || {};
  const apiUrl = config.apiUrl || window.location.origin;

  // Create container for React app
  const container = document.createElement('div');
  container.id = 'onetech-ai-assistant-root';
  document.body.appendChild(container);

  // Load React and widget bundle
  const script = document.createElement('script');
  script.src = `${apiUrl}/_next/static/chunks/pages/index.js`;
  script.async = true;
  
  script.onload = function() {
    console.log('O.N.E.Tech AI Assistant loaded successfully');
  };
  
  script.onerror = function() {
    console.error('Failed to load O.N.E.Tech AI Assistant');
  };

  document.head.appendChild(script);

  // Add widget styles
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = `${apiUrl}/_next/static/css/app.css`;
  document.head.appendChild(style);
})();