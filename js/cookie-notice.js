/**
 * Cookie Notice Manager
 * Handles cookie consent banner display and persistence
 */
(function() {
  'use strict';

  const COOKIE_STORAGE_KEY = 'deltaCapitalCookiesAccepted';
  const COOKIE_NOTICE_ID = 'delta-cookie-notice';

  /**
   * Initialize cookie notice
   */
  function initCookieNotice() {
    // Check if cookies were already accepted
    if (localStorage.getItem(COOKIE_STORAGE_KEY) === 'true') {
      removeCookieNotice();
      return;
    }

    // Create and display cookie notice
    createCookieNotice();
  }

  /**
   * Create cookie notice HTML element
   */
  function createCookieNotice() {
    const notice = document.createElement('div');
    notice.id = COOKIE_NOTICE_ID;
    notice.className = 'cookie-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', 'Cookie consent notice');

    notice.innerHTML = `
      <div class="cookie-notice-content">
        We use essential cookies to ensure our website functions properly. By continuing to use this site, you agree to our use of cookies. <a href="/disclosures.html#cookie-policy">Learn more about cookies</a>.
      </div>
      <div class="cookie-notice-actions">
        <button class="cookie-accept" aria-label="Accept cookies">Accept</button>
      </div>
    `;

    document.body.appendChild(notice);

    // Add event listener to accept button
    const acceptBtn = notice.querySelector('.cookie-accept');
    acceptBtn.addEventListener('click', acceptCookies);
  }

  /**
   * Handle cookie acceptance
   */
  function acceptCookies() {
    localStorage.setItem(COOKIE_STORAGE_KEY, 'true');
    removeCookieNotice();
  }

  /**
   * Remove cookie notice from DOM
   */
  function removeCookieNotice() {
    const notice = document.getElementById(COOKIE_NOTICE_ID);
    if (notice) {
      notice.classList.add('hidden');
      // Remove after animation
      setTimeout(() => {
        if (notice.parentNode) {
          notice.parentNode.removeChild(notice);
        }
      }, 300);
    }
  }

  /**
   * Allow manual reset (for testing)
   */
  window.resetCookieConsent = function() {
    localStorage.removeItem(COOKIE_STORAGE_KEY);
    location.reload();
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieNotice);
  } else {
    initCookieNotice();
  }
})();
