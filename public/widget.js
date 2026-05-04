/**
 * O.N.E.Tech AI Assistant - Embeddable Widget
 * Simple script to add AI chat to any website
 */

(function() {
  // Get configuration from window
  const config = window.ONETECH_CONFIG || {};
  const apiUrl = config.apiUrl || window.location.origin;

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'onetech-widget-root';
  document.body.appendChild(widgetContainer);

  // Load React and dependencies
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Initialize widget
  async function initWidget() {
    try {
      // Load the ChatWidget component
      const { ChatWidget } = await import(`${apiUrl}/src/components/ChatWidget.tsx`);
      
      // Render widget
      const root = ReactDOM.createRoot(widgetContainer);
      root.render(
        React.createElement(ChatWidget, { apiUrl })
      );
    } catch (error) {
      console.error('Failed to load O.N.E.Tech AI Assistant:', error);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();