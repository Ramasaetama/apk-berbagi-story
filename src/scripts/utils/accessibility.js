
/**
 * Add keyboard navigation support to interactive elements
 * @param {Element} container - Container element
 */
export function enableKeyboardNavigation(container) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      const modal = document.querySelector('.camera-modal');
      if (modal) {
        modal.remove();
      }

      const drawer = document.querySelector('#navigation-drawer');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
      }
    }
  });
}

/**
 * Add click handler to card-like elements to make them keyboard accessible
 * @param {string} selector - CSS selector for cards
 */
export function makeCardsAccessible(selector) {
  const cards = document.querySelectorAll(selector);
  
  cards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/**
 * Announce screen reader message
 * @param {string} message - Message to announce
 */
export function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

