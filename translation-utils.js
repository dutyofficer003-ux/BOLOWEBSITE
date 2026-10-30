// ==============================================================
// UNIVERSAL TRANSLATION UTILITY FOR ALL PAGES
// Handles language persistence, geolocation detection, and dropdown management
// ==============================================================

// Standard language set for all pages (includes Polish 'pl')
const STANDARD_LANGUAGES = 'en,es,pt,de,fr,pl,tr,zh-CN,ja,it';

// Language code to name mapping for easier detection
const LANGUAGE_CODES = {
    'es': 'es', 'pt': 'pt', 'de': 'de', 'fr': 'fr', 'pl': 'pl',
    'tr': 'tr', 'zh': 'zh-CN', 'ja': 'ja', 'it': 'it', 'en': 'en'
};

// Country to language mapping for geolocation
const COUNTRY_LANGUAGE_MAP = {
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es', 'EC': 'es',
    'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt',
    'DE': 'de', 'AT': 'de', 'CH': 'de',
    'FR': 'fr', 'BE': 'fr', 'CA': 'fr', 'SN': 'fr', 'CI': 'fr',
    'PL': 'pl', 'UA': 'pl',
    'TR': 'tr', 'CY': 'tr',
    'CN': 'zh-CN', 'TW': 'zh-CN', 'HK': 'zh-CN', 'MO': 'zh-CN', 'SG': 'zh-CN',
    'JP': 'ja',
    'IT': 'it'
};

// Apply language to Google Translate dropdown
function applyLanguageToGoogleTranslate(targetLanguage) {
    const startTime = Date.now();
    const tryApply = () => {
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
            console.log('Auto-translating to:', targetLanguage);
            selectElement.value = targetLanguage;
            selectElement.dispatchEvent(new Event('change'));
            return;
        }
        if (Date.now() - startTime < 8000) {
            setTimeout(tryApply, 250);
        } else {
            console.warn('Google Translate selector not found after waiting.');
        }
    };
    tryApply();
}

// Detect user's language based on geolocation and browser settings
async function detectUserLanguageAndTranslate() {
    try {
        const response = await fetch('https://ipapi.co/json');
        const data = await response.json();
        const countryCode = data.country_code;
        const userLanguage = navigator.language.split('-')[0];
        
        const targetLanguage = COUNTRY_LANGUAGE_MAP[countryCode] || LANGUAGE_CODES[userLanguage] || 'en';
        if (targetLanguage !== 'en') {
            localStorage.setItem('preferredLanguage', targetLanguage);
            applyLanguageToGoogleTranslate(targetLanguage);
        }
    } catch (error) {
        console.error('Error detecting language:', error);
        const fallbackLang = navigator.language.split('-')[0] || 'en';
        const fallbackTarget = LANGUAGE_CODES[fallbackLang] || 'en';
        if (fallbackTarget !== 'en') {
            applyLanguageToGoogleTranslate(fallbackTarget);
        }
    }
}

// Initialize Google Translate with standard settings
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: true, 
        multilanguagePage: true
    }, 'google_translate_element');

    // THE AUTO-FORCE TRICK
    // Auto-detect and force translation for any non-English browser language
    const browserLang = navigator.language.split('-')[0]; // Get primary language code
    const supportedLangs = ['es', 'pt', 'de', 'fr', 'pl', 'tr', 'zh', 'ja', 'it', 'nl'];
    
    if (browserLang !== 'en' && supportedLangs.includes(browserLang)) {
        // Force the cookie to auto-translate to detected language
        document.cookie = `googtrans=/en/${browserLang}; path=/`;
        console.log(`Auto-forcing translation to: ${browserLang}`);
    }
    
    // IMMEDIATE AUTO-RESPONSE: Trigger language detection and translation right away
    setTimeout(() => {
        console.log('Auto-responding to browser language...');
        detectUserLanguageAndTranslate();
    }, 500); // Small delay to ensure Google Translate is ready
}

// Close Google Translate dropdown when clicking outside on mobile
function closeGoogleTranslateDropdown() {
    const dropdown = document.querySelector('.goog-te-menu-frame');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

// Setup event listeners for mobile dropdown closure
function setupDropdownCloseListeners() {
    // Close dropdown when clicking outside - enhanced version
    document.addEventListener('click', function(event) {
        const googleTranslateContainer = document.getElementById('google_translate_element');
        const dropdown = document.querySelector('.goog-te-menu-frame');
        
        // Check if click is outside Google Translate elements
        const isClickInside = googleTranslateContainer?.contains(event.target) || 
                            event.target.closest('.goog-te-menu-frame') ||
                            event.target.closest('.goog-te-menu2');
        
        // If dropdown exists and click is outside, close it
        if (dropdown && dropdown.style.display !== 'none' && !isClickInside) {
            closeGoogleTranslateDropdown();
        }
    });
    
    // Add touchstart event listener for mobile devices - enhanced version
    document.addEventListener('touchstart', function(event) {
        const googleTranslateContainer = document.getElementById('google_translate_element');
        const dropdown = document.querySelector('.goog-te-menu-frame');
        
        // Check if touch is outside Google Translate elements
        const isTouchInside = googleTranslateContainer?.contains(event.target) || 
                           event.target.closest('.goog-te-menu-frame') ||
                           event.target.closest('.goog-te-menu2');
        
        // If dropdown exists and touch is outside, close it
        if (dropdown && dropdown.style.display !== 'none' && !isTouchInside) {
            closeGoogleTranslateDropdown();
        }
    }, { passive: true });
    
    // Add touchend event listener as backup for mobile
    document.addEventListener('touchend', function(event) {
        const googleTranslateContainer = document.getElementById('google_translate_element');
        const dropdown = document.querySelector('.goog-te-menu-frame');
        
        // Check if touch is outside Google Translate elements
        const isTouchInside = googleTranslateContainer?.contains(event.target) || 
                           event.target.closest('.goog-te-menu-frame') ||
                           event.target.closest('.goog-te-menu2');
        
        // If dropdown exists and touch is outside, close it
        if (dropdown && dropdown.style.display !== 'none' && !isTouchInside) {
            setTimeout(() => closeGoogleTranslateDropdown(), 100);
        }
    }, { passive: true });
    
    // Close dropdown when selecting a language
    const observer = new MutationObserver(function(mutations) {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            combo.addEventListener('change', function() {
                setTimeout(closeGoogleTranslateDropdown, 100);
                // Save selected language
                localStorage.setItem('preferredLanguage', this.value);
            });
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Translation utils loaded, setting up dropdown listeners...');
    setTimeout(setupDropdownCloseListeners, 1000);
    
    // Force Google Translate to reinitialize if needed
    setTimeout(function() {
        if (typeof google !== 'undefined' && google.translate) {
            console.log('Google Translate available, reinitializing...');
            googleTranslateElementInit();
        } else {
            console.log('Google Translate not yet available, retrying...');
        }
    }, 2000);
});

// Handle page visibility changes (tabs/windows)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && savedLanguage !== 'en') {
            applyLanguageToGoogleTranslate(savedLanguage);
        }
    }
});
