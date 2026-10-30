(function() {
    // This looks for the passport in the 'Global' vault
    const accessGranted = localStorage.getItem('site_access_key');
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const isAccountGate = window.location.pathname.endsWith('account-gate.html');

    // If no passport is found and we aren't on the homepage or account-gate, LOCK IT.
    if (!accessGranted && !isHomePage && !isAccountGate) {
        document.documentElement.innerHTML = `
            <body style="background:black; color:#333; font-family:monospace; padding:20px;">
                <p>sh: /usr/bin/access: Permission denied</p>
                <p>Connection terminated...</p>
            </body>`;
        window.stop();
    }
})();