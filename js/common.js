/**
 * Common Shared Logic
 * Includes Navigation, UI Utilities, and Shared Helper Functions
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});

/**
 * Initialize Navigation Logic
 * Handles hamburger menu toggling and responsive state
 */
function initNavigation() {
    const navTrigger = document.querySelector('.nav-trigger');
    const navMenu = document.querySelector('.nav-menu');
    const navDropdown = document.querySelector('.nav-dropdown');
    const navOverlay = document.querySelector('.nav-overlay');

    if (navTrigger && navMenu) {
        navTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when clicking on overlay
    if (navOverlay && navMenu) {
        navOverlay.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking a menu item
    if (navDropdown && navMenu) {
        navDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}

/**
 * Show a temporary notification toast
 * @param {string} message - The message to display
 * @param {number} duration - Duration in ms (default 2000)
 */
function showNotification(message, duration = 2000) {
    // Check if a notification already exists and remove it
    const existing = document.querySelector('.copy-notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration);
}

/**
 * Copy text to clipboard and show notification
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`Copied ${text} to clipboard!`);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showNotification('Failed to copy to clipboard');
    });
}
