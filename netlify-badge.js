(function () {
    const badgeSelectors = [
        '#nl-badge-frame',
        '#netlify-deploy-badge',
        'iframe[src*="netlify"]',
        'a[href*="netlify.com"][href*="badge"]'
    ];

    function removeNetlifyBadge(root) {
        if (!root || typeof root.querySelectorAll !== 'function') {
            return;
        }

        badgeSelectors.forEach((selector) => {
            if (root.nodeType === 1 && root.matches(selector)) {
                removeBadgeElement(root);
            }

            root.querySelectorAll(selector).forEach(removeBadgeElement);
        });
    }

    function removeBadgeElement(element) {
        if (element.matches('a[href*="netlify.com"][href*="badge"]')) {
            const wrapper = element.parentElement;
            if (wrapper && wrapper.tagName === 'DIV' && wrapper.children.length === 1) {
                wrapper.remove();
                return;
            }
        }

        element.remove();
    }

    function removeBadgesFromMutations(mutations) {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(removeNetlifyBadge);
        });
    }

    function startMonitoring() {
        const observer = new MutationObserver(removeBadgesFromMutations);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        removeNetlifyBadge(document);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startMonitoring, { once: true });
    } else {
        startMonitoring();
    }

    window.addEventListener('pageshow', () => removeNetlifyBadge(document));
    window.addEventListener('popstate', () => removeNetlifyBadge(document));
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            removeNetlifyBadge(document);
        }
    });
})();
