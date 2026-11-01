function removeNetlifyBadgeFrame() {
    const badgeFrame = document.getElementById('nl-badge-frame');
    if (badgeFrame) {
        badgeFrame.remove();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeNetlifyBadgeFrame);
} else {
    removeNetlifyBadgeFrame();
}
