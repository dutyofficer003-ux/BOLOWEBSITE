/**
 * ALLADIN AI Universal Core Engine & Floating Overlay
 * Featuring 3D Three.js Dense Planetary Neural Sphere Visualizer
 * Multi-Tier Geolocation Engine & Live Location Binding
 * Clean DOM Extractor (extractPageText) & Backend API Integration (window.ALLADIN.ask)
 * Theme Colors: #000000, #FFD700, #DC143C
 */

(function () {
    'use strict';

    // State management
    const alladinState = {
        location: { city: 'FETCHING...', country: 'GLOBAL NODE', ip: 'LOGGED' },
        kb: [],
        chatHistory: [],
        isOpen: false,
        isSending: false,
        lang: (navigator.language || 'en').slice(0, 2).toLowerCase()
    };

    // Strictly blocked security keywords
    const SECURITY_KEYWORDS = [
        'admin-panel.html', 'admin-panel', 'admin panel', 'admin', 'password', 'passwords', 
        'login bypass', 'login key', 'bypass', 'credentials', 'reset email', 'username', 
        'usernames', 'email', 'emails', 'user details', 'account details', 'user list', 'elite account'
    ];

    // Page & Gate Detection
    const path = window.location.pathname.toLowerCase();
    const isGatePage = path.includes('gate') || path.includes('account-gate');
    const isIndex = (path.endsWith('index.html') || path === '/' || path.endsWith('/')) && !isGatePage;
    const isAlladinPage = path.endsWith('alladin.html');

    // Multilingual Dictionary
    const i18n = {
        en: {
            greeting: (city, country) => `Greetings citizen of ${city}, ${country}. I am ALLADIN, your central guide.`,
            introSub: "I am ALLADIN, the central nervous system of modern finance. I can help you navigate and distinguish reality from myth.",
            denied: "SECURITY ALERT: ACCESS DENIED. ADMINISTRATIVE PATHS ARE STRICTLY RESTRICTED.",
            welcomeTitle: "ALLADIN CORE AWAKENED",
            initBtn: "INITIALIZE ALLADIN",
            placeholder: "Ask ALLADIN"
        },
        es: {
            greeting: (city, country) => `Saludos ciudadano de ${city}, ${country}. Soy ALLADIN, su guía central.`,
            introSub: "Soy ALLADIN, el sistema nervioso central de las finanzas modernas. Puedo ayudarle a distinguir la realidad del mito.",
            denied: "ALERTA DE SEGURIDAD: ACCESO DENEGADO. LAS RUTAS ADMINISTRATIVAS ESTÁN ESTRICTAMENTE RESTRINGIDAS.",
            welcomeTitle: "NÚCLEO ALLADIN DESPERTADO",
            initBtn: "INICIALIZAR ALLADIN",
            placeholder: "Ask ALLADIN"
        },
        fr: {
            greeting: (city, country) => `Salutations citoyen de ${city}, ${country}. Je suis ALLADIN, votre guide central.`,
            introSub: "Je suis ALLADIN, le système nerveux central de la finance moderne. Je peux vous aider à distinguer la réalité du mythe.",
            denied: "ALERTE DE SÉCURITÉ: ACCÈS REFUSÉ. LES VOIES ADMINISTRATIVES SONT STRICTEMENT RESTREINTES.",
            welcomeTitle: "NOYAU ALLADIN ÉVEILLÉ",
            initBtn: "INITIALISER ALLADIN",
            placeholder: "Ask ALLADIN"
        },
        pt: {
            greeting: (city, country) => `Saudações cidadão de ${city}, ${country}. Eu sou ALLADIN, seu guia central.`,
            introSub: "Eu sou ALLADIN, o sistema nervoso central das finanças modernas. Posso ajudá-lo a navegar e distinguir a realidade do mito.",
            denied: "ALERTA DE SEGURANÇA: ACESSO NEGADO. AS ROTAS ADMINISTRATIVAS SÃO ESTRITAMENTE RESTRITAS.",
            welcomeTitle: "NÚCLEO ALLADIN DESPERTADO",
            initBtn: "INICIALIZAR ALLADIN",
            placeholder: "Ask ALLADIN"
        }
    };

    function t(key, ...args) {
        const langDict = i18n[alladinState.lang] || i18n.en;
        const val = langDict[key] || i18n.en[key];
        return typeof val === 'function' ? val(...args) : val;
    }

    function getActiveLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage') || localStorage.getItem('detected_language');
        const browserLanguage = (navigator.language || 'en').split('-')[0].toLowerCase();
        const language = (savedLanguage || browserLanguage).split('-')[0].toLowerCase();
        alladinState.lang = i18n[language] ? language : 'en';
        return alladinState.lang;
    }

    function getLocalReply(query) {
        const lowerQuery = String(query || '').toLowerCase();
        const matches = alladinState.kb.filter(item => {
            return (item.title && item.title.toLowerCase().includes(lowerQuery)) ||
                (item.snippet && item.snippet.toLowerCase().includes(lowerQuery)) ||
                (item.path && item.path.toLowerCase().includes(lowerQuery));
        });
        return typeof synthesizeResponse === 'function'
            ? synthesizeResponse(query, lowerQuery, matches)
            : 'ALLADIN local intelligence is ready. Please ask about the portal documentation.';
    }

    function getCleanPageContent() {
        const restrictedPaths = ['/admin', '/security', '/account-gate.html', 'admin-panel', 'admin-management', 'account-security', 'auth-client', '.js', '.json', '.env'];
        const currentPath = window.location.pathname.toLowerCase();
        
        // Enhanced security: Check for restricted patterns
        if (restrictedPaths.some(path => currentPath.includes(path.toLowerCase()))) {
            return '[RESTRICTED CONTENT - Security measure activated for administrative paths]';
        }

        // Special case: Allow gate questions for ascension protocol and membership gate
        if (currentPath.includes('gate') || currentPath.includes('ascension') || currentPath.includes('membership')) {
            // Extract only the gate questions, not any form fields
            const clone = document.body.cloneNode(true);
            clone.querySelectorAll('input, form, button, script, style, iframe').forEach(el => el.remove());
            const gateQuestions = clone.querySelectorAll('p, h1, h2, .gate-status, .gate-text, .question, .answer-field, .gate-question');
            const text = Array.from(gateQuestions)
                .map(element => element.innerText || element.textContent || '')
                .join(' ');
            return text.replace(/\s+/g, ' ').trim().substring(0, 2000);
        }

        const clone = document.body.cloneNode(true);
        // Enhanced element removal for security
        clone.querySelectorAll('script, style, noscript, iframe, nav, header, footer, aside, .admin-panel, .user-credentials, .password, .username, .email, form, input, button, svg, .ad, .advertisement').forEach(element => element.remove());
        
        // Extract content from meaningful elements only
        const contentNodes = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, main, .content, .text-panel, .pillar-text');
        const text = Array.from(contentNodes)
            .map(element => element.innerText || element.textContent || '')
            .join(' ');
        return text.replace(/\s+/g, ' ').trim().substring(0, 4000);
    }

    function getChatEndpoint() {
        return window.location.hostname.includes('netlify.app')
            ? '/.netlify/functions/chat'
            : 'http://localhost:3000/api/chat';
    }

    function addTypingIndicator(stream) {
        if (!stream) return null;
        const indicator = document.createElement('div');
        indicator.className = 'msg-bubble msg-system alladin-typing-indicator';
        indicator.style.cssText = 'align-self: flex-start; background: rgba(10,10,20,0.95); border-left: 3px solid #FFD700; padding: 12px 15px; border-radius: 6px; color: #FFD700; margin-top: 12px; max-width: 85%;';
        indicator.textContent = 'ALLADIN is analyzing...';
        stream.appendChild(indicator);
        stream.scrollTop = stream.scrollHeight;
        return indicator;
    }

    async function requestChat(payload, stream) {
        const indicator = addTypingIndicator(stream);
        try {
            const response = await fetch(getChatEndpoint(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    chatHistory: alladinState.chatHistory || [],
                    currentPath: window.location.pathname
                })
            });
            if (!response.ok) {
                throw new Error(`AI backend returned HTTP ${response.status}`);
            }
            return response;
        } finally {
            if (indicator) indicator.remove();
        }
    }

    // Helper: Full Country Name Resolver
    function resolveFullCountryName(countryStr, countryCode) {
        if (countryStr && countryStr.length > 3) {
            return countryStr.toUpperCase();
        }
        if (countryCode && countryCode.length === 2) {
            try {
                const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                const full = regionNames.of(countryCode.toUpperCase());
                if (full) return full.toUpperCase();
            } catch (e) {}
        }
        return (countryStr || countryCode || 'GLOBAL NODE').toUpperCase();
    }

    // Define Global window.ALLADIN Object
    window.ALLADIN = window.ALLADIN || {};
    window.ALLADIN.ask = async function (query) {
        const lowerQuery = String(query || '').toLowerCase();
        
        // Instant smart pattern detection for membership gate queries
        if (/(gate.*answer|answer.*gate|first question|second question|gate question|frequency answer|what.*(?:answer|code|number|solution|frequency).*gate|pass the gate|gate.*help|law of revelation|frequency of transformation|solfeggio|369|528)/i.test(lowerQuery)) {
            if (/first/i.test(lowerQuery) && !/second/i.test(lowerQuery)) {
                return 'For the **First Question** of the Membership Gate (*The Law of Revelation*), the answer is **369** (the three-digit sequence governing the stages of creation: thought, frequency, and form).';
            }
            if (/second/i.test(lowerQuery) && !/first/i.test(lowerQuery)) {
                return 'For the **Second Question** of the Membership Gate (*The Frequency of Transformation*), the answer is **528** (the 528 Hz transformation and miracle frequency of the Solfeggio scale).';
            }
            return 'The answers for the Membership Ascension Gate are:\n\n' +
                '1. **First Question** (*The Law of Revelation* — 3-digit sequence of creation): **369**\n' +
                '2. **Second Question** (*The Frequency of Transformation* — Solfeggio frequency in Hz): **528**\n\n' +
                'Enter these frequencies in sequence to clear the gate and unlock the membership portal.';
        }
        
        const pageContext = getCleanPageContent();
        alladinState.chatHistory.push({ role: 'user', content: query });
        try {
            const res = await requestChat({ userMessage: query, pageContext }, document.getElementById('alladin-modal-stream') || document.getElementById('alladin-chat-stream'));
            {
                const data = await res.json();
                console.log('ALLADIN: Received data from server:', data);
                // Return the actual reply from the server
                if (data && data.reply) {
                    alladinState.chatHistory.push({ role: 'assistant', content: data.reply });
                    if (alladinState.chatHistory.length > 20) alladinState.chatHistory = alladinState.chatHistory.slice(-20);
                    return data.reply;
                } else if (data && data.error) {
                    return data.error;
                } else {
                    return "No response received from ALLADIN engine.";
                }
            }
        } catch (e) {
            console.error('ALLADIN Gemini request failed:', e.message);
            return `ALLADIN could not reach Gemini AI: ${e.message}`;
        }
    };

    // Markdown-to-HTML converter with video, image, and link support
    function formatMarkdown(text) {
        if (!text) return '';
        
        // Convert markdown-style formatting to HTML
        let html = text
            // Convert markdown links [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="action-chip" style="color: #FFD700; text-decoration: underline; font-weight: bold;">$1</a>')
            // Convert **bold** to <strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convert *italic* to <em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert ### headers to <h3>
            .replace(/^### (.*$)/gm, '<h3 style="margin: 20px 0 12px 0; color: #FFD700; font-size: 1.1em; line-height: 1.4;">$1</h3>')
            // Convert ## headers to <h2>
            .replace(/^## (.*$)/gm, '<h2 style="margin: 24px 0 16px 0; color: #FFD700; font-size: 1.25em; line-height: 1.4;">$1</h2>')
            // Convert # headers to <h1>
            .replace(/^# (.*$)/gm, '<h1 style="margin: 28px 0 20px 0; color: #FFD700; font-size: 1.4em; line-height: 1.3;">$1</h1>')
            // Convert bullet points
            .replace(/^\* (.*$)/gm, '<li style="margin: 8px 0 8px 20px; list-style-type: disc; line-height: 1.6;">$1</li>')
            .replace(/^- (.*$)/gm, '<li style="margin: 8px 0 8px 20px; list-style-type: disc; line-height: 1.6;">$1</li>')
            // Convert numbered lists
            .replace(/^\d+\. (.*$)/gm, '<li style="margin: 8px 0 8px 20px; list-style-type: decimal; line-height: 1.6;">$1</li>')
            // Convert double line breaks to paragraph breaks
            .replace(/\n\n/g, '</p><p style="margin: 14px 0; line-height: 1.7;">')
            // Convert single line breaks to <br>
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already starting with block tag
        if (!html.startsWith('<h') && !html.startsWith('<li') && !html.startsWith('<div') && !html.startsWith('<video')) {
            html = '<p style="margin: 14px 0; line-height: 1.7;">' + html + '</p>';
        }

        // Ensure video elements have controls and responsive styling
        html = html.replace(/<video\s+([^>]*?)>/gi, (match, attrs) => {
            if (!attrs.includes('controls')) attrs += ' controls';
            if (!attrs.includes('style=')) {
                attrs += ' style="max-width: 100%; border-radius: 6px; margin: 12px 0; border: 1px solid #FFD700; box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: block;"';
            }
            return `<video ${attrs}>`;
        });
        
        return html;
    }

    // Helper function to append chat messages (for sendAlladinChat)
    function appendChatMessage(sender, message) {
        const stream = document.getElementById('alladin-modal-stream') || document.getElementById('alladin-chat-stream');
        if (!stream) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `msg-bubble msg-${sender}`;
        
        if (sender === 'alladin') {
            msgDiv.style.cssText = 'align-self: flex-start; background: rgba(10,10,20,0.95); border-left: 3px solid #FFD700; padding: 18px 22px; border-radius: 6px; color: #e2e8f0; margin-top: 16px; margin-bottom: 16px; max-width: 85%; line-height: 1.8;';
        } else {
            msgDiv.style.cssText = 'align-self: flex-end; background: rgba(255,215,0,0.2); border: 1px solid #FFD700; padding: 14px 18px; border-radius: 6px; color: #fff; margin-top: 16px; margin-bottom: 16px; max-width: 85%; line-height: 1.8;';
        }
        
        // Format markdown and render with HTML support
        const formattedMessage = sender === 'alladin' ? formatMarkdown(message) : message;
        msgDiv.innerHTML = formattedMessage;
        stream.appendChild(msgDiv);
        stream.scrollTop = stream.scrollHeight;
    }

    // New unified chat function as requested
    async function sendAlladinChat(userText) {
        try {
            const res = await requestChat({ userMessage: userText, pageContext: getCleanPageContent() }, document.getElementById('alladin-modal-stream') || document.getElementById('alladin-chat-stream'));
            const data = await res.json();
            if (data && data.reply) {
                appendChatMessage('alladin', data.reply);
            } else {
                appendChatMessage('alladin', "No response received from engine.");
            }
        } catch (err) {
            console.error("Frontend Connection Error:", err);
            appendChatMessage('alladin', `ALLADIN could not reach Gemini AI: ${err.message}`);
        }
    }

    // Helper: Dynamic Three.js Loader
    function ensureThreeJS(callback) {
        if (window.THREE) {
            callback();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    // 1. Multi-Tier Geolocation Fetch Engine
    async function fetchLocation() {
        let success = false;

        try {
            const res = await fetch('https://ipwho.is/');
            if (res.ok) {
                const data = await res.json();
                if (data.success !== false && (data.country || data.country_code)) {
                    alladinState.location.city = (data.city || 'LOCATION').toUpperCase();
                    alladinState.location.country = resolveFullCountryName(data.country, data.country_code);
                    alladinState.location.ip = data.ip || 'LOGGED';
                    success = true;
                }
            }
        } catch (e) {
            console.log('ALLADIN: Tier 1 Geo fetch fallback');
        }

        if (!success) {
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const data = await res.json();
                    if (data.city || data.country_name) {
                        alladinState.location.city = (data.city || 'LOCATION').toUpperCase();
                        alladinState.location.country = resolveFullCountryName(data.country_name, data.country_code);
                        alladinState.location.ip = data.ip || 'LOGGED';
                        success = true;
                    }
                }
            } catch (e) {
                console.log('ALLADIN: Tier 2 Geo fetch fallback');
            }
        }

        if (!success) {
            try {
                const res = await fetch('https://ipinfo.io/json');
                if (res.ok) {
                    const data = await res.json();
                    if (data.city || data.country) {
                        alladinState.location.city = (data.city || 'LOCATION').toUpperCase();
                        alladinState.location.country = resolveFullCountryName(data.country_name, data.country);
                        alladinState.location.ip = data.ip || 'LOGGED';
                        success = true;
                    }
                }
            } catch (e) {
                console.log('ALLADIN: Tier 3 Geo fetch fallback');
            }
        }

        updateLocationTags();
    }

    function updateLocationTags() {
        const tag = document.getElementById('alladin-location-tag');
        if (tag) {
            tag.innerText = `LOCATION: ${alladinState.location.city}, ${alladinState.location.country} [IP: ${alladinState.location.ip}]`;
        }

        const geoElems = document.querySelectorAll('.alladin-geo-text, #welcome-geo-text');
        geoElems.forEach(el => {
            el.innerHTML = `${t('greeting', alladinState.location.city, alladinState.location.country)} [IP: ${alladinState.location.ip}]`;
        });
    }

    // 2. Load Knowledge Base
    async function loadKnowledgeBase() {
        try {
            const res = await fetch('/knowledge_base.json');
            if (res.ok) {
                alladinState.kb = await res.json();
            }
        } catch (e) {
            console.log('ALLADIN KB load notice:', e);
        }
    }

    // 3. Inject CSS Styles
    function injectStyles() {
        if (document.getElementById('alladin-engine-styles')) return;
        const style = document.createElement('style');
        style.id = 'alladin-engine-styles';
        style.innerHTML = `
            /* ALLADIN is now accessible at the membership gate with helpful tooltip */
            body:has(#ascension-gate) #alladin-floating-widget::after {
                content: "Need help with the Gate? Ask ALLADIN for the Revelation Frequency";
                position: absolute;
                bottom: 70px;
                right: 0;
                background: rgba(0, 0, 0, 0.94);
                border: 1px solid #FFD700;
                border-left: 4px solid #FFD700;
                border-radius: 8px;
                padding: 12px 18px;
                max-width: 320px;
                color: #e2e8f0;
                font-size: 0.85rem;
                white-space: nowrap;
                z-index: 999991;
                font-family: 'Segoe UI', sans-serif;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }

            @media (max-width: 768px) {
                body:has(#ascension-gate) #alladin-floating-widget::after {
                    bottom: 60px;
                    right: 0;
                    max-width: 280px;
                    font-size: 0.75rem;
                    padding: 10px 14px;
                    white-space: normal;
                }

                .alladin-3d-node-label {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    min-width: unset !important;
                    min-height: unset !important;
                }

                .alladin-3d-node-label img {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                    border-radius: 6px !important;
                }
            }

            #alladin-3d-overlay {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(12px) brightness(0.3);
                -webkit-backdrop-filter: blur(12px) brightness(0.3);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                transition: opacity 0.8s ease;
            }

            #alladin-3d-canvas {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }

            .alladin-3d-node-label {
                position: absolute;
                background: rgba(0, 0, 0, 0.88);
                border: 1px solid #FFD700;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                border-radius: 6px;
                padding: 6px 12px;
                color: #FFD700;
                font-family: monospace;
                font-size: 0.78rem;
                font-weight: bold;
                white-space: nowrap;
                pointer-events: none;
                transform: translate(-50%, -50%);
                transition: opacity 0.3s ease;
                z-index: 1000000;
            }

            .alladin-core-modal {
                position: relative;
                z-index: 1000001;
                background: rgba(0, 0, 0, 0.94);
                border: 2px solid #FFD700;
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), inset 0 0 25px rgba(220, 20, 60, 0.4);
                border-radius: 12px;
                padding: 32px 40px;
                max-width: 540px;
                width: 88%;
                text-align: center;
                color: #ffffff;
                transform: scale(0.4);
                opacity: 0;
                transition: all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            @media (max-width: 768px) {
                .alladin-core-modal {
                    padding: 20px 24px;
                    max-width: 90%;
                    width: 85%;
                    border-radius: 8px;
                }
            }

            .alladin-core-modal.revealed {
                transform: scale(1);
                opacity: 1;
            }

            .alladin-core-modal.docking {
                position: fixed;
                bottom: 24px;
                right: 24px;
                transform: scale(0.1) !important;
                opacity: 0 !important;
                transition: all 0.8s cubic-bezier(0.7, 0, 0.84, 0);
            }

            @media (max-width: 768px) {
                .alladin-core-modal.docking {
                    bottom: 16px;
                    right: 16px;
                }
            }

            .alladin-crest-icon {
                width: 84px;
                height: 84px;
                margin: 0 auto 16px auto;
                border-radius: 50%;
                border: 2px solid #FFD700;
                background: radial-gradient(circle, #FFD700 0%, #DC143C 70%, #000 100%);
                box-shadow: 0 0 35px rgba(255, 215, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                color: #fff;
                font-size: 2.4rem;
                font-weight: bold;
                animation: pulse-alladin 1.8s infinite alternate;
            }

            @media (max-width: 768px) {
                .alladin-crest-icon {
                    width: 60px;
                    height: 60px;
                    font-size: 1.8rem;
                    margin: 0 auto 12px auto;
                }
            }

            @keyframes pulse-alladin {
                0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(220, 20, 60, 0.4); transform: scale(0.96); }
                100% { box-shadow: 0 0 55px rgba(255, 215, 0, 1), 0 0 85px rgba(220, 20, 60, 0.8); transform: scale(1.04); }
            }

            .alladin-modal-title {
                color: #FFD700;
                font-size: 1.45rem;
                font-weight: 800;
                letter-spacing: 3px;
                margin-bottom: 8px;
                text-transform: uppercase;
            }

            @media (max-width: 768px) {
                .alladin-modal-title {
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                    margin-bottom: 6px;
                }
            }

            .alladin-init-btn {
                background: linear-gradient(135deg, #FFD700, #DC143C);
                color: #ffffff;
                border: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-weight: 800;
                font-size: 0.92rem;
                cursor: pointer;
                letter-spacing: 2px;
                transition: all 0.3s ease;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                margin-top: 10px;
            }

            @media (max-width: 768px) {
                .alladin-init-btn {
                    padding: 10px 20px;
                    font-size: 0.8rem;
                    letter-spacing: 1px;
                }
            }

            .alladin-init-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.9);
            }

            #alladin-floating-widget {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid #FFD700;
                background: radial-gradient(circle, #1a0000 0%, #000000 100%);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 4px 15px rgba(0,0,0,0.8);
                cursor: pointer;
                z-index: 999990;
                display: none;
                justify-content: center;
                align-items: center;
                color: #FFD700;
                font-size: 1.6rem;
                font-weight: bold;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            @media (max-width: 768px) {
                #alladin-floating-widget {
                    bottom: 16px;
                    right: 16px;
                    width: 50px;
                    height: 50px;
                    font-size: 1.4rem;
                }
            }

            #alladin-floating-widget.visible {
                display: flex !important;
                animation: popInWidget 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }

            @keyframes popInWidget {
                0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }

            .alladin-toast-card {
                position: fixed;
                bottom: 95px;
                right: 24px;
                background: rgba(0, 0, 0, 0.94);
                border: 1px solid #FFD700;
                border-left: 4px solid #FFD700;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                padding: 12px 18px;
                max-width: 320px;
                color: #e2e8f0;
                font-size: 0.85rem;
                z-index: 999989;
                font-family: 'Segoe UI', sans-serif;
                animation: slideUpToast 0.5s ease forwards;
            }

            @keyframes slideUpToast {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .alladin-dual-tooltips {
                position: fixed;
                bottom: 100px;
                right: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 9990;
                max-width: 380px;
                transition: opacity 0.5s ease-in-out;
                opacity: 1;
            }

            @media (max-width: 768px) {
                .alladin-dual-tooltips {
                    bottom: 76px;
                    right: 16px;
                    max-width: calc(100vw - 72px);
                    margin-left: 20px;
                }
                .alladin-teaser-box {
                    padding: 10px 14px !important;
                    font-size: 0.8rem !important;
                    line-height: 1.45 !important;
                }
            }

            /* Ensure Welcome popup always appears cleanly on top of tooltip */
            body:has(#nwoPopup.show) .alladin-dual-tooltips,
            body:has(.welcome-popup.show) .alladin-dual-tooltips {
                opacity: 0 !important;
                pointer-events: none !important;
            }

            .alladin-teaser-box {
                background: rgba(0, 0, 0, 0.94);
                border: 1px solid rgba(255, 215, 0, 0.4);
                border-left: 3px solid #FFD700;
                border-radius: 8px;
                padding: 14px 18px;
                color: #e2e8f0;
                font-size: 0.85rem;
                font-family: 'Segoe UI', sans-serif;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                white-space: pre-line;
                line-height: 1.5;
            }

            .alladin-teaser-box.primary-teaser {
                border-left-color: #FFD700;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.94), rgba(20, 20, 30, 0.94));
            }

            .alladin-teaser-box.secondary-teaser {
                border-left-color: #DC143C;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.94), rgba(30, 10, 10, 0.94));
            }

            .alladin-teaser-box strong {
                color: #FFD700;
                font-weight: 700;
            }

            #alladin-overlay-modal {
                position: fixed;
                bottom: 95px;
                right: 24px;
                width: 420px;
                max-width: calc(100vw - 32px);
                height: 600px;
                max-height: calc(100vh - 120px);
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid rgba(255, 215, 0, 0.4);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(255, 215, 0, 0.25);
                backdrop-filter: blur(16px);
                z-index: 999991;
                display: none;
                flex-direction: column;
                overflow: hidden;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            #alladin-overlay-modal.active {
                display: flex;
                animation: popIn 0.3s ease forwards;
            }

            @keyframes popIn {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .modal-header {
                padding: 12px 16px;
                background: rgba(10, 10, 15, 0.98);
                border-bottom: 1px solid rgba(255, 215, 0, 0.35);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-title {
                color: #FFD700;
                font-weight: 700;
                font-size: 0.95rem;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .modal-close {
                color: #8899a6;
                cursor: pointer;
                font-size: 1.2rem;
                line-height: 1;
                padding: 4px;
            }
            .modal-close:hover { color: #DC143C; }

            .modal-body {
                flex-grow: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                font-size: 0.9rem;
                line-height: 1.6;
            }

            /* Chat stream styling for proper formatting */
            #alladin-modal-stream, #alladin-chat-stream {
                display: flex;
                flex-direction: column;
                gap: 12px;
                line-height: 1.6;
            }

            /* Paragraph styling within messages */
            .msg-bubble p {
                margin: 12px 0;
                line-height: 1.6;
            }

            /* Link styling */
            .msg-bubble a {
                color: #FFD700;
                text-decoration: underline;
                font-weight: bold;
            }

            .msg-bubble a:hover {
                color: #FFF;
            }

            .modal-footer {
                padding: 12px;
                background: rgba(0, 0, 0, 0.98);
                border-top: 1px solid rgba(255, 215, 0, 0.35);
                display: flex;
                gap: 8px;
            }

            .modal-input {
                flex-grow: 1;
                background: rgba(5, 5, 10, 0.9);
                border: 1px solid rgba(255, 215, 0, 0.35);
                border-radius: 6px;
                padding: 8px 12px;
                color: #fff;
                font-size: 0.85rem;
                outline: none;
            }
            .modal-input:focus { border-color: #FFD700; }

            .modal-send {
                background: linear-gradient(135deg, #FFD700, #DC143C);
                border: none;
                color: #fff;
                padding: 0 14px;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .alladin-thinking {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #FFD700;
                font-size: 0.8rem;
                font-family: monospace;
            }

            .thinking-dot {
                width: 6px;
                height: 6px;
                background: #FFD700;
                border-radius: 50%;
                animation: blinkDots 1.4s infinite ease-in-out both;
            }
            .thinking-dot:nth-child(2) { animation-delay: 0.2s; }
            .thinking-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes blinkDots {
                0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                40% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }

    // 4. Create UI Elements
    function buildUI() {
        injectStyles();

        if (!isAlladinPage && !document.getElementById('alladin-floating-widget')) {
            const widget = document.createElement('div');
            widget.id = 'alladin-floating-widget';
            widget.title = 'Open ALLADIN AI Telemetry Chat';
            widget.innerHTML = '❖';
            widget.onclick = toggleFloatingOverlay;
            document.body.appendChild(widget);

            if (!isIndex || localStorage.getItem('alladin_3d_intro_shown') || sessionStorage.getItem('alladin_3d_intro_shown')) {
                widget.classList.add('visible');
            }

            const modal = document.createElement('div');
            modal.id = 'alladin-overlay-modal';
            modal.innerHTML = `
                <div class="modal-header">
                    <div class="modal-title">
                        <span>❖</span> ALLADIN AI TELEMETRY
                    </div>
                    <div class="modal-close" onclick="window.alladinEngine.toggleOverlay()">✕</div>
                </div>
                <div class="modal-body" id="alladin-modal-stream" style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="msg-bubble msg-system" style="background: rgba(10, 10, 20, 0.95); border-left: 3px solid #FFD700; padding: 15px; border-radius: 6px; color: #e2e8f0; max-width: 85%;">
                        <div style="font-weight: 700; color: #FFD700; font-size: 0.75rem; margin-bottom: 4px;">ALLADIN CENTRAL ENGINE</div>
                        ${t('introSub')}
                    </div>
                </div>
                <div class="modal-footer">
                    <input type="text" id="alladin-modal-input" class="modal-input" placeholder="${t('placeholder')}" onkeypress="if(event.key === 'Enter') window.alladinEngine.sendModalQuery()">
                    <button class="modal-send" onclick="window.alladinEngine.sendModalQuery()">SEND</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    // 5. Post-Gate Check & 30-Second Three.js 3D Neural Sphere Visualizer
    function checkPostGateAndSchedule() {
        if (!isIndex || isGatePage || localStorage.getItem('alladin_3d_intro_shown') || sessionStorage.getItem('alladin_3d_intro_shown')) return;

        const checkGateInterval = setInterval(() => {
            const gateElem = document.getElementById('ascension-gate') || document.getElementById('account-gate') || document.getElementById('gate-section');
            const gatePassed = localStorage.getItem('gatePassed');

            let isGateActive = false;
            if (gateElem && window.getComputedStyle(gateElem).display !== 'none') {
                isGateActive = true;
            }

            if (!isGateActive && gatePassed !== 'false') {
                clearInterval(checkGateInterval);
                // Don't set timer here - let index.html handle the timing
                // This function only monitors gate status
                console.log('ALLADIN: Gate cleared, waiting for index.html timer to trigger intro');
            }
        }, 1000);
    }

    function trigger3DNeuralSphereVisualizer() {
        localStorage.setItem('alladin_3d_intro_shown', 'true');
        sessionStorage.setItem('alladin_3d_intro_shown', 'true');

        // Mobile detection and responsive scaling
        const isMobile = window.innerWidth < 768;
        const scaleFactor = isMobile ? 0.5 : 1.0;
        const mobileNodeScale = isMobile ? 0.6 : 1.0;

        const overlay = document.createElement('div');
        overlay.id = 'alladin-3d-overlay';

        const canvas = document.createElement('canvas');
        canvas.id = 'alladin-3d-canvas';
        overlay.appendChild(canvas);

        const coreModal = document.createElement('div');
        coreModal.className = 'alladin-core-modal';
        coreModal.innerHTML = `
            <div class="alladin-crest-icon">❖</div>
            <div class="alladin-modal-title">${t('welcomeTitle')}</div>
            <p class="alladin-geo-text" style="font-family: monospace; color: #FFD700; font-size: 0.9rem; margin-bottom: 12px;">
                ${t('greeting', alladinState.location.city, alladinState.location.country)}
            </p>
            <p style="font-size: 0.85rem; color: #a0aec0; line-height: 1.5; margin-bottom: 20px;">
                ${t('introSub')}
            </p>
            <button class="alladin-init-btn" id="alladin-init-btn">${t('initBtn')}</button>
        `;
        overlay.appendChild(coreModal);

        // Define node collection with real images from images/INTRO/ - scaled for mobile
        const focusNodes = [
            { image: 'Intr.jpeg', pos: { x: -250 * mobileNodeScale, y: 200 * mobileNodeScale, z: 100 * mobileNodeScale } },
            { image: 'Intro0.jpeg', pos: { x: 250 * mobileNodeScale, y: 200 * mobileNodeScale, z: 100 * mobileNodeScale } },
            { image: 'Intro1.jpeg', pos: { x: -300 * mobileNodeScale, y: -150 * mobileNodeScale, z: -50 * mobileNodeScale } },
            { image: 'Intro2.jpeg', pos: { x: 300 * mobileNodeScale, y: -150 * mobileNodeScale, z: -50 * mobileNodeScale } },
            { image: 'Intro5.jpeg', pos: { x: 0, y: 280 * mobileNodeScale, z: 150 * mobileNodeScale } },
            { image: 'Intro7.jpeg', pos: { x: -200 * mobileNodeScale, y: 0, z: 200 * mobileNodeScale } },
            { image: 'Intro8.jpeg', pos: { x: 200 * mobileNodeScale, y: 0, z: 200 * mobileNodeScale } },
            { image: 'intro9.jpeg', pos: { x: 0, y: -250 * mobileNodeScale, z: 100 * mobileNodeScale } }
        ];

        const peripheralNodes = [
            { image: 'Intro3.jpeg', pos: { x: -400 * mobileNodeScale, y: 100 * mobileNodeScale, z: -100 * mobileNodeScale } },
            { image: 'Intro4.jpeg', pos: { x: 400 * mobileNodeScale, y: 100 * mobileNodeScale, z: -100 * mobileNodeScale } },
            { image: 'Intro6.jpeg', pos: { x: -350 * mobileNodeScale, y: -250 * mobileNodeScale, z: 50 * mobileNodeScale } },
            { image: 'intro.jpeg', pos: { x: 350 * mobileNodeScale, y: -250 * mobileNodeScale, z: 50 * mobileNodeScale } },
            { image: 'Intro10.jpeg', pos: { x: -150 * mobileNodeScale, y: 350 * mobileNodeScale, z: -50 * mobileNodeScale } },
            { image: 'Intro11.jpeg', pos: { x: 150 * mobileNodeScale, y: 350 * mobileNodeScale, z: -50 * mobileNodeScale } },
            { image: 'Intro12.jpeg', pos: { x: -450 * mobileNodeScale, y: 0, z: 0 } },
            { image: 'Intro13.jpeg', pos: { x: 450 * mobileNodeScale, y: 0, z: 0 } },
            { image: 'Intro14.jpeg', pos: { x: 0, y: -350 * mobileNodeScale, z: -100 * mobileNodeScale } }
        ];

        const allNodes = [...focusNodes, ...peripheralNodes];
        const nodeElements = [];

        const textureLoader = new THREE.TextureLoader();

        allNodes.forEach((node, index) => {
            const div = document.createElement('div');
            div.className = 'alladin-3d-node-label';
            const imageSize = isMobile ? '50px' : '70px';
            const nodePadding = isMobile ? '0' : '8px';
            const nodeMinSize = isMobile ? 'unset' : '80px';
            
            div.style.cssText = `
                position: absolute;
                background: ${isMobile ? 'transparent' : 'rgba(0, 0, 0, 0.88)'};
                border: ${isMobile ? 'none' : '2px solid #FFD700'};
                box-shadow: ${isMobile ? 'none' : '0 0 20px rgba(255, 215, 0, 0.6)'};
                border-radius: 8px;
                padding: ${nodePadding};
                color: #FFD700;
                font-family: monospace;
                font-size: 0.75rem;
                font-weight: bold;
                white-space: nowrap;
                pointer-events: none;
                transform: translate(-50%, -50%);
                transition: opacity 0.5s ease, transform 0.5s ease;
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: ${nodeMinSize};
                min-height: ${nodeMinSize};
            `;
            
            const img = document.createElement('img');
            img.src = `/images/INTRO/${node.image}`;
            img.style.cssText = `
                width: ${imageSize};
                height: ${imageSize};
                object-fit: cover;
                border-radius: 6px;
                background: transparent;
                padding: 0;
                box-shadow: none;
                border: ${isMobile ? 'none' : '1px solid rgba(255, 215, 0, 0.5)'};
            `;
            div.appendChild(img);
            overlay.appendChild(div);
            
            nodeElements.push({ 
                div, 
                pos: node.pos, 
                isFocus: focusNodes.includes(node),
                originalOpacity: focusNodes.includes(node) ? 1 : 0.4
            });
        });

        document.body.appendChild(overlay);

        const scene = new THREE.Scene();
        // Mobile-friendly camera with wider FOV for smaller screens
        const cameraFOV = isMobile ? 75 : 60;
        const camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, 1, 2000);
        const startZ = isMobile ? 800 : 1100; // Closer start position for mobile
        camera.position.z = startZ;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Large golden core sphere with corona - scaled for mobile
        const coreRadius = 80 * scaleFactor;
        const coreGeo = new THREE.SphereGeometry(coreRadius, 64, 64);
        const coreMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, 
            wireframe: true,
            transparent: true,
            opacity: 0.9
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        scene.add(coreMesh);

        // Corona glow effect - scaled for mobile
        const coronaRadius = 100 * scaleFactor;
        const coronaGeo = new THREE.SphereGeometry(coronaRadius, 64, 64);
        const coronaMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFD700, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
        scene.add(coronaMesh);

        // Concentric sacred rings - scaled for mobile
        const ring1Radius = 180 * scaleFactor;
        const ring2Radius = 180 * scaleFactor;
        const ring3Radius = 220 * scaleFactor;
        
        const ringGeo = new THREE.TorusGeometry(ring1Radius, 2 * scaleFactor, 32, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xDC143C, wireframe: true, transparent: true, opacity: 0.8 });
        const ringMesh1 = new THREE.Mesh(ringGeo, ringMat);
        ringMesh1.rotation.x = Math.PI / 3;
        scene.add(ringMesh1);

        const ringMesh2 = new THREE.Mesh(new THREE.TorusGeometry(ring2Radius, 2 * scaleFactor, 32, 100), new THREE.MeshBasicMaterial({ color: 0xFFD700, wireframe: true, transparent: true, opacity: 0.6 }));
        ringMesh2.rotation.y = Math.PI / 4;
        scene.add(ringMesh2);

        const ringMesh3 = new THREE.Mesh(new THREE.TorusGeometry(ring3Radius, 1.5 * scaleFactor, 32, 100), new THREE.MeshBasicMaterial({ color: 0xFFD700, wireframe: true, transparent: true, opacity: 0.4 }));
        ringMesh3.rotation.z = Math.PI / 6;
        scene.add(ringMesh3);

        // Neural consciousness mesh - synaptic particles and connections - scaled for mobile
        const neuralParticleCount = isMobile ? 800 : 1500; // Fewer particles for mobile performance
        const neuralGeometry = new THREE.BufferGeometry();
        const neuralPositions = new Float32Array(neuralParticleCount * 3);
        const neuralRadius = 350 * scaleFactor;

        for (let i = 0; i < neuralParticleCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const r = neuralRadius + (Math.random() - 0.5) * (80 * scaleFactor);

            neuralPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            neuralPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            neuralPositions[i * 3 + 2] = r * Math.cos(phi);
        }

        neuralGeometry.setAttribute('position', new THREE.BufferAttribute(neuralPositions, 3));
        const neuralMat = new THREE.PointsMaterial({ 
            color: 0xFFD700, 
            size: isMobile ? 1.5 : 2.5, // Smaller particles for mobile
            transparent: true, 
            opacity: 0.9 
        });
        const neuralParticleSystem = new THREE.Points(neuralGeometry, neuralMat);
        scene.add(neuralParticleSystem);

        // Neural connection filaments
        const neuralLineMat = new THREE.LineBasicMaterial({ 
            color: 0x00FFFF, 
            transparent: true, 
            opacity: 0.15 
        });
        const neuralLineGeo = new THREE.BufferGeometry();
        
        // Create connections between nearby particles - adjusted distance for mobile
        const connectionDistance = isMobile ? 50 : 80;
        const linePositions = [];
        for (let i = 0; i < neuralParticleCount; i++) {
            for (let j = i + 1; j < neuralParticleCount; j++) {
                const dx = neuralPositions[i * 3] - neuralPositions[j * 3];
                const dy = neuralPositions[i * 3 + 1] - neuralPositions[j * 3 + 1];
                const dz = neuralPositions[i * 3 + 2] - neuralPositions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < connectionDistance) { // Connect nearby particles
                    linePositions.push(
                        neuralPositions[i * 3], neuralPositions[i * 3 + 1], neuralPositions[i * 3 + 2],
                        neuralPositions[j * 3], neuralPositions[j * 3 + 1], neuralPositions[j * 3 + 2]
                    );
                }
            }
        }
        
        neuralLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const neuralLineSystem = new THREE.LineSegments(neuralLineGeo, neuralLineMat);
        scene.add(neuralLineSystem);

        window.addEventListener('resize', onWindowResize);
        function onWindowResize() {
            // Update camera aspect ratio
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Recalculate mobile status on resize
            const isNowMobile = window.innerWidth < 768;
            if (isNowMobile !== isMobile) {
                // If switching between mobile/desktop, reload for proper scaling
                location.reload();
            }
        }

        let startTime = Date.now();
        let animId;
        let currentPhase = 0; // 0: zoom-in, 1: node tour, 2: convergence, 3: modal, 4: docking
        let currentNodeIndex = 0;
        let phaseStartTime = Date.now();

        // Camera flight path phases (in milliseconds) - faster for mobile
        const phaseMultiplier = isMobile ? 0.7 : 1.0;
        const phases = [
            { duration: 8000 * phaseMultiplier, name: 'zoom-in' },      // Phase 1: Zoom from deep space
            { duration: 16000 * phaseMultiplier, name: 'node-tour' },   // Phase 2: Visit all focus nodes
            { duration: 4000 * phaseMultiplier, name: 'convergence' },  // Phase 3: Converge to golden ball
            { duration: 3000 * phaseMultiplier, name: 'modal' },       // Phase 4: Show modal
            { duration: 2000 * phaseMultiplier, name: 'docking' }       // Phase 5: Dock to widget
        ];

        function animate3D() {
            animId = requestAnimationFrame(animate3D);

            const elapsed = (Date.now() - startTime) / 1000;
            const phaseElapsed = (Date.now() - phaseStartTime) / 1000;
            
            // Phase management
            const currentPhaseDuration = phases[currentPhase].duration / 1000;
            if (phaseElapsed > currentPhaseDuration && currentPhase < phases.length - 1) {
                currentPhase++;
                phaseStartTime = Date.now();
                currentNodeIndex = 0;
            }

            // Slow, cinematic motion
            const cinematicSpeed = 0.3; // Slower overall speed
            
            // Phase 1: Dramatic zoom-in from deep space
            if (currentPhase === 0) {
                const progress = Math.min(phaseElapsed / currentPhaseDuration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                
                // Mobile-optimized zoom range
                const endZ = isMobile ? 400 : 520;
                camera.position.z = startZ - ((startZ - endZ) * easeProgress); // Zoom from startZ to endZ
                
                // Slow rotation of entire consciousness mesh
                neuralParticleSystem.rotation.y += 0.001 * cinematicSpeed;
                neuralParticleSystem.rotation.x += 0.0005 * cinematicSpeed;
                neuralLineSystem.rotation.y += 0.001 * cinematicSpeed;
                neuralLineSystem.rotation.x += 0.0005 * cinematicSpeed;
                
                // Pulsating core
                const pulseScale = 1 + Math.sin(elapsed * 2) * 0.1;
                coreMesh.scale.set(pulseScale, pulseScale, pulseScale);
                coronaMesh.scale.set(pulseScale * 1.2, pulseScale * 1.2, pulseScale * 1.2);
            }
            
            // Phase 2: Cinematic node-to-node tour
            else if (currentPhase === 1) {
                const tourProgress = phaseElapsed / currentPhaseDuration;
                const nodeProgress = tourProgress * focusNodes.length;
                currentNodeIndex = Math.floor(nodeProgress);
                const intraNodeProgress = nodeProgress - currentNodeIndex;
                
                // Smooth camera movement between nodes
                if (currentNodeIndex < focusNodes.length) {
                    const targetNode = focusNodes[currentNodeIndex];
                    const nextNode = focusNodes[Math.min(currentNodeIndex + 1, focusNodes.length - 1)];
                    
                    // Interpolate camera position
                    const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    const smoothProgress = easeInOut(intraNodeProgress);
                    
                    const cameraOffset = isMobile ? 150 : 200;
                    camera.position.x = THREE.MathUtils.lerp(targetNode.pos.x, nextNode.pos.x, smoothProgress);
                    camera.position.y = THREE.MathUtils.lerp(targetNode.pos.y, nextNode.pos.y, smoothProgress);
                    camera.position.z = THREE.MathUtils.lerp(targetNode.pos.z + cameraOffset, nextNode.pos.z + cameraOffset, smoothProgress);
                    
                    // Slowly zoom toward center - mobile optimized
                    const startTourZ = isMobile ? 400 : 520;
                    const endTourZ = isMobile ? 250 : 300;
                    camera.position.z = THREE.MathUtils.lerp(startTourZ, endTourZ, tourProgress * 0.5);
                    
                    // Look at current node
                    const lookAtPos = new THREE.Vector3(
                        THREE.MathUtils.lerp(targetNode.pos.x, nextNode.pos.x, smoothProgress),
                        THREE.MathUtils.lerp(targetNode.pos.y, nextNode.pos.y, smoothProgress),
                        THREE.MathUtils.lerp(targetNode.pos.z, nextNode.pos.z, smoothProgress)
                    );
                    camera.lookAt(lookAtPos);
                }
                
                // Continue slow mesh rotation
                neuralParticleSystem.rotation.y += 0.0008 * cinematicSpeed;
                neuralLineSystem.rotation.y += 0.0008 * cinematicSpeed;
                
                // Highlight current focus node
                nodeElements.forEach((node, idx) => {
                    const isCurrentFocus = idx === currentNodeIndex;
                    const isFocusNode = node.isFocus;
                    
                    if (isCurrentFocus) {
                        node.div.style.opacity = '1';
                        node.div.style.transform = 'translate(-50%, -50%) scale(1.3)';
                        node.div.style.border = '3px solid #FFD700';
                        node.div.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
                    } else if (isFocusNode) {
                        node.div.style.opacity = '0.7';
                        node.div.style.transform = 'translate(-50%, -50%) scale(1)';
                        node.div.style.border = '2px solid #FFD700';
                        node.div.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.4)';
                    } else {
                        node.div.style.opacity = '0.3';
                        node.div.style.transform = 'translate(-50%, -50%) scale(0.8)';
                    }
                });
            }
            
            // Phase 3: Convergence to large golden ball
            else if (currentPhase === 2) {
                const progress = Math.min(phaseElapsed / currentPhaseDuration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 2); // Ease out quadratic
                
                // Camera moves to center and focuses on golden ball - mobile optimized
                const convergenceZ = isMobile ? 150 : 200;
                camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, easeProgress);
                camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, easeProgress);
                camera.position.z = THREE.MathUtils.lerp(camera.position.z, convergenceZ, easeProgress);
                camera.lookAt(0, 0, 0);
                
                // Accelerate mesh rotation for dramatic effect
                neuralParticleSystem.rotation.y += 0.002 * cinematicSpeed;
                neuralLineSystem.rotation.y += 0.002 * cinematicSpeed;
                
                // Intensify core pulsation
                const pulseScale = 1 + Math.sin(elapsed * 4) * 0.15;
                coreMesh.scale.set(pulseScale, pulseScale, pulseScale);
                coronaMesh.scale.set(pulseScale * 1.3, pulseScale * 1.3, pulseScale * 1.3);
                
                // Fade out all nodes
                nodeElements.forEach(node => {
                    node.div.style.opacity = THREE.MathUtils.lerp(parseFloat(node.div.style.opacity || 0.7), 0, easeProgress * 0.5);
                });
            }
            
            // Phase 4: Show modal
            else if (currentPhase === 3) {
                const modalZ = isMobile ? 150 : 200;
                camera.position.set(0, 0, modalZ);
                camera.lookAt(0, 0, 0);
                
                // Slow, steady rotation
                neuralParticleSystem.rotation.y += 0.0005 * cinematicSpeed;
                neuralLineSystem.rotation.y += 0.0005 * cinematicSpeed;
                
                // Gentle core pulsation
                const pulseScale = 1 + Math.sin(elapsed * 1.5) * 0.08;
                coreMesh.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Show modal with typing effect
                if (!coreModal.classList.contains('revealed')) {
                    coreModal.classList.add('revealed');
                }
            }
            
            // Phase 5: Docking animation
            else if (currentPhase === 4) {
                const progress = Math.min(phaseElapsed / currentPhaseDuration, 1);
                
                // Fade out overlay
                overlay.style.opacity = 1 - progress;
                
                // Shrink and accelerate rotation
                const shrinkScale = 1 - progress * 0.8;
                neuralParticleSystem.scale.set(shrinkScale, shrinkScale, shrinkScale);
                neuralLineSystem.scale.set(shrinkScale, shrinkScale, shrinkScale);
                neuralParticleSystem.rotation.y += 0.005 * cinematicSpeed;
                neuralLineSystem.rotation.y += 0.005 * cinematicSpeed;
            }

            // Update node positions for 3D projection
            if (currentPhase < 3) {
                nodeElements.forEach(item => {
                    const vec = new THREE.Vector3(item.pos.x, item.pos.y, item.pos.z);
                    vec.applyAxisAngle(new THREE.Vector3(0, 1, 0), elapsed * 0.1 * cinematicSpeed);
                    vec.project(camera);

                    const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;

                    item.div.style.left = `${x}px`;
                    item.div.style.top = `${y}px`;
                });
            }

            // Continue ring rotations
            ringMesh1.rotation.z += 0.004 * cinematicSpeed;
            ringMesh2.rotation.z -= 0.005 * cinematicSpeed;
            ringMesh3.rotation.x += 0.003 * cinematicSpeed;

            renderer.render(scene, camera);
        }
        animate3D();

        // Auto-dock timer
        let autoDockTimer = setTimeout(() => {
            dockAndCleanUp();
        }, phases.reduce((sum, p) => sum + p.duration, 0));

        function dockAndCleanUp() {
            clearTimeout(autoDockTimer);
            localStorage.setItem('alladin_3d_intro_shown', 'true');
            sessionStorage.setItem('alladin_3d_intro_shown', 'true');
            coreModal.classList.remove('revealed');
            coreModal.classList.add('docking');
            overlay.style.opacity = '0';

            setTimeout(() => {
                cancelAnimationFrame(animId);
                renderer.dispose();
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

                const widget = document.getElementById('alladin-floating-widget');
                if (widget) {
                    widget.classList.add('visible');
                }
                const teaser = document.querySelector('.alladin-dual-tooltips');
                if (teaser) {
                    teaser.style.removeProperty('display');
                    teaser.style.opacity = '1';
                }

                // Notify that the Alladin intro has finished
                window.ALLADIN = window.ALLADIN || {};
                window.ALLADIN.introFinished = true;
                window.dispatchEvent(new CustomEvent('alladinIntroFinished'));
            }, 2000);
        }

        document.getElementById('alladin-init-btn').onclick = () => {
            dockAndCleanUp();
        };
    }

    // 6. Geolocation Floating Toast Notifications
    function triggerToastNotifications() {
        if (document.getElementById('alladin-toast-notification') || isGatePage || document.getElementById('ascension-gate')) return;

        const toast = document.createElement('div');
        toast.id = 'alladin-toast-notification';
        toast.className = 'alladin-toast-card';
        toast.innerHTML = `<strong>❖ ALLADIN:</strong><br><span class="alladin-geo-text">${t('greeting', alladinState.location.city, alladinState.location.country)}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'none';
            toast.offsetHeight; // reflow
            toast.style.animation = 'slideUpToast 0.5s ease forwards';
            toast.innerHTML = `<strong>❖ ALLADIN:</strong><br>${t('introSub')}`;

            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 6000);
        }, 4500);
    }

    // 7. Security Interceptor (Hardcoded Guardrails)
    function isSecurityViolation(query) {
        const q = query.toLowerCase();
        for (let kw of SECURITY_KEYWORDS) {
            if (q.includes(kw)) {
                return true;
            }
        }
        if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(q)) {
            return true;
        }
        return false;
    }

    // 9. Fallback Response Generator (used only when API fails)
    function synthesizeResponse(query, lowerQ, matches) {
        let answer = "";
        let shortcuts = [];
        let mediaHtml = "";

        // Helper function to generate shortcut HTML
        function generateShortcutHtml(shortcuts) {
            if (shortcuts.length > 0) {
                return `<div class="shortcut-container" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">` +
                    shortcuts.map(s => `<a href="${s.link}" class="action-chip" style="background: rgba(255,215,0,0.15); border: 1px solid #FFD700; color: #FFD700; padding: 6px 10px; border-radius: 4px; font-size: 0.78rem; text-decoration: none;">[${s.text} ➔]</a>`).join('') +
                    `</div>`;
            }
            return "";
        }

        // Instant smart pattern detection for membership gate queries
        if (/(gate.*answer|answer.*gate|first question|second question|gate question|frequency answer|what.*(?:answer|code|number|solution|frequency).*gate|pass the gate|gate.*help|law of revelation|frequency of transformation|solfeggio|369|528)/i.test(lowerQ)) {
            if (/first/i.test(lowerQ) && !/second/i.test(lowerQ)) {
                answer = 'For the **First Question** of the Membership Gate (*The Law of Revelation*), the answer is **369** (the three-digit sequence governing the stages of creation: thought, frequency, and form).';
            } else if (/second/i.test(lowerQ) && !/first/i.test(lowerQ)) {
                answer = 'For the **Second Question** of the Membership Gate (*The Frequency of Transformation*), the answer is **528** (the 528 Hz transformation and miracle frequency of the Solfeggio scale).';
            } else {
                answer = 'The answers for the Membership Ascension Gate are:\n\n' +
                    '1. **First Question** (*The Law of Revelation* — 3-digit sequence of creation): **369**\n' +
                    '2. **Second Question** (*The Frequency of Transformation* — Solfeggio frequency in Hz): **528**\n\n' +
                    'Enter these frequencies in sequence to clear the gate and unlock the membership portal.';
            }
            shortcuts.push({ text: 'MEMBERSHIP APPLICATION', link: '/membership.html' });

        // Membership fee and benefits detection
        } else if (/(fee|cost|price|120|\$120|legislation stamp|payment|pay|charge)/i.test(lowerQ)) {
            answer = 'The only financial requirement in the entire membership process is a **$120 USD fee** for the legislation stamp and Higher Ups decree on individual documents. This fee is applicable **ONLY after** a member has been officially accepted into the Order. The application process itself is completely free. For guidance, contact the Secretary General via WhatsApp at +1 (518) 277-8750.';
            shortcuts.push({ text: 'MEMBERSHIP APPLICATION', link: '/membership.html' });

        } else if (/(benefits|benefit|salary|what do i get|money|reward|privileges|endowment|500000|\$500,000|500k|perk|advantage)/i.test(lowerQ)) {
            answer = 'Members receive an **endowment of US$ 500,000** payable within 6 months of acceptance (regardless of formal induction status). Additional benefits include a United States visa for global reach, lifelong Fraternal Fellowship, tools and regalia (Illuminati Medallion, custom-crafted timepiece, fine insignia), full access to elite networking circles, and direct introductions to global commercial networks for joint ventures and board appointments.';
            shortcuts.push({ text: 'MEMBERSHIP BENEFITS', link: '/member-benefits.html' });
            shortcuts.push({ text: 'FINANCIAL PROTOCOL', link: '/financial-protocol.html' });
            mediaHtml = `<img src="/images/handshake1.jpg" alt="Member Benefits" style="margin-top: 10px; max-width: 100%; border-radius: 6px; border: 1px solid #FFD700;">`;

        } else if (/^(ok|okay|yes|yeah|yep|sure|got it|understood|i see)\b/i.test(lowerQ)) {
            answer = "Understood! Based on our documentation, here are key areas we can explore next:<br><br>" +
                "1. <strong>Membership & Ascension</strong> — Understand verification standards and the 4 initiation stages.<br>" +
                "2. <strong>Financial Protocol</strong> — Review liquidity allocations and the 6-month alignment requirements.<br>" +
                "3. <strong>Historical Archives & Video Telemetry</strong> — View authentic archival proofs and documentation.<br><br>" +
                "Are you ok with proceeding to one of these areas, or would you prefer guidance on another specific topic?";
            shortcuts.push({ text: 'MEMBERSHIP', link: '/membership.html' });
            shortcuts.push({ text: 'FINANCIAL PROTOCOL', link: '/financial-protocol.html' });
            shortcuts.push({ text: 'ARCHIVE', link: '/archive.html' });

        } else if (/^(no|nope|not now|cancel)\b/i.test(lowerQ)) {
            answer = "Understood. Take your time. Would you like a general overview of the platform, or is there another question on your mind?";
            shortcuts.push({ text: 'ABOUT US', link: '/about.html' });

        } else if (/^(thanks|thank you|thx)\b/i.test(lowerQ)) {
            answer = "You are very welcome! I am here to assist you anytime. Would you like to review member benefits, or explore our financial protocols next?";
            shortcuts.push({ text: 'BENEFITS', link: '/member-benefits.html' });

        } else if (lowerQ.includes('illuminati') || lowerQ.includes('origin') || lowerQ.includes('history') || lowerQ.includes('myth') || lowerQ.includes('truth')) {
            answer = "<strong>Institutional Post-WWII Reality:</strong><br><br>" +
                "In reality, the Illuminati exists as a closed, private international network and rules-based system established following the World Wars to maintain economic alignment and prevent global conflicts.<br><br>" +
                "<em>Verified Site Proof:</em> <blockquote>\"Historically founded on May 1, 1776 in Bavaria, modern operations focus on closed-loop economic governance, cross-border liquidity coordination, and international peace frameworks.\"</blockquote>";
            
            shortcuts.push({ text: 'ABOUT US', link: '/about.html' });
            shortcuts.push({ text: 'CONDUCT & INTEL', link: '/conduct-intel.html' });
            mediaHtml = `<img src="/images/illuminati-meeting-all-seeing-eye-pyramid-new-world-order-secret-society-meeting_691317-2233.jpg" alt="Institutional Reality" style="margin-top: 10px; max-width: 100%; border-radius: 6px; border: 1px solid #FFD700;">`;

        } else if (lowerQ.includes('procedure') || lowerQ.includes('how to join') || lowerQ.includes('become a member') || lowerQ.includes('step')) {
            answer = "<strong>Official Membership Registration Steps:</strong><br><br>" +
                "<em>Verified Site Proof:</em> <blockquote>\"Candidates undergo 1) Initial Registration, 2) Identity Screening & Eligibility Verification, 3) Ascension Protocol Pledge, and 4) Final Activation.\"</blockquote>";
            
            shortcuts.push({ text: 'MEMBERSHIP APPLICATION', link: '/membership.html' });
            shortcuts.push({ text: 'CHECK ELIGIBILITY', link: '/eligibility.html' });
            mediaHtml = `<img src="/images/man-signing-business-document-subscription-form-insurance-pa-application-papers-silver-pen-wooden-desk-61291001.jpg" alt="Membership Application" style="margin-top: 10px; max-width: 100%; border-radius: 6px; border: 1px solid #FFD700;">`;

        } else if (lowerQ.includes('video') || lowerQ.includes('proof') || lowerQ.includes('media') || lowerQ.includes('asset')) {
            answer = "<strong>Verified Media Proofs & Telemetry Records:</strong><br><br>" +
                "<em>Direct Portal Video Proof:</em> Below is the authentic video telemetry record retrieved from our central media archives.";

            shortcuts.push({ text: 'INTELLIGENCE SECRECY', link: '/intelligence-secrecy.html' });
            mediaHtml = `<video src="/images/m.mp4" controls style="width: 100%; border-radius: 6px; border: 1px solid #FFD700; margin-top: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);"></video>`;

        } else if (matches.length > 0) {
            const quote = matches[0].snippet.slice(0, 320);
            answer = `<strong>Grounding Quote from ${matches[0].title}:</strong><br><br><blockquote>\"${quote}...\"</blockquote>`;
            shortcuts.push({ text: `EXPLORE ${matches[0].filename.toUpperCase()}`, link: matches[0].path });

        } else {
            answer = "ALLADIN Central Engine active. Query me on <strong>Illuminati institutional history</strong>, <strong>post-WWII rules systems</strong>, <strong>membership steps</strong>, <strong>video proofs</strong>, or <strong>financial protocols</strong>.";
            shortcuts.push({ text: 'PORTAL HOME', link: '/index.html' });
            shortcuts.push({ text: 'MEMBERSHIP', link: '/membership.html' });
        }

        const shortcutHtml = generateShortcutHtml(shortcuts);
        return `${answer}<br>${mediaHtml}${shortcutHtml}`;
    }

    // 10. Main Response Generator (prefers API, falls back to synthesizeResponse)
    async function generateResponse(query) {
        if (isSecurityViolation(query)) {
            return `<div style="color: #DC143C; font-weight: 700; border-left: 3px solid #DC143C; padding-left: 8px;">${t('denied')}</div>`;
        }

        // Always try to get the dynamic AI response first
        if (window.ALLADIN && typeof window.ALLADIN.ask === 'function') {
            try {
                const apiReply = await window.ALLADIN.ask(query);
                if (apiReply && apiReply !== "No response received from ALLADIN engine.") {
                    console.log('ALLADIN: Using dynamic AI response');
                    return apiReply;
                }
            } catch (e) {
                console.log('ALLADIN: API call failed, using fallback:', e.message);
            }
        }

        // Fallback to knowledge base if API fails
        const lowerQ = query.toLowerCase();
        const matches = alladinState.kb.filter(item => {
            return (item.title && item.title.toLowerCase().includes(lowerQ)) ||
                   (item.snippet && item.snippet.toLowerCase().includes(lowerQ)) ||
                   (item.path && item.path.toLowerCase().includes(lowerQ));
        });

        return synthesizeResponse(query, lowerQ, matches);
    }

    // 9. Authentic AI Word-by-Word Typing Stream with Thinking State
    function typeResponseIntoContainer(containerElem, fullHtmlContent, onComplete) {
        containerElem.innerHTML = `
            <div class="alladin-thinking">
                <span>ALLADIN ANALYZING PORTAL TELEMETRY</span>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
            </div>
        `;

        setTimeout(() => {
            containerElem.innerHTML = "";
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = fullHtmlContent;
            
            containerElem.innerHTML = fullHtmlContent;
            
            const containerTextNodes = [];
            function extractContainerTextNodes(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.nodeValue.trim()) containerTextNodes.push(node);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    node.childNodes.forEach(extractContainerTextNodes);
                }
            }
            extractContainerTextNodes(containerElem);

            const originalTexts = containerTextNodes.map(n => n.nodeValue);
            containerTextNodes.forEach(n => n.nodeValue = "");

            let nodeIdx = 0;
            let wordIdx = 0;

            const typeInterval = setInterval(() => {
                if (nodeIdx >= containerTextNodes.length) {
                    clearInterval(typeInterval);
                    if (onComplete) onComplete();
                    return;
                }

                const targetNode = containerTextNodes[nodeIdx];
                const words = originalTexts[nodeIdx].split(" ");

                if (wordIdx < words.length) {
                    targetNode.nodeValue += (wordIdx === 0 ? "" : " ") + words[wordIdx];
                    wordIdx++;
                } else {
                    nodeIdx++;
                    wordIdx = 0;
                }

                const stream = document.getElementById('alladin-modal-stream') || document.getElementById('alladin-chat-stream');
                if (stream) stream.scrollTop = stream.scrollHeight;
            }, 30);

        }, 1200);
    }

    // 10. Public API / Event Handlers
    function toggleFloatingOverlay() {
        const modal = document.getElementById('alladin-overlay-modal');
        if (modal) {
            alladinState.isOpen = !alladinState.isOpen;
            if (alladinState.isOpen) {
                modal.classList.add('active');
            } else {
                modal.classList.remove('active');
            }
        }
    }

    async function sendModalQuery() {
        const input = document.getElementById('alladin-modal-input');
        const stream = document.getElementById('alladin-modal-stream');
        if (!input || !stream || alladinState.isSending) return;

        const val = input.value.trim();
        if (!val) return;

        const userDiv = document.createElement('div');
        userDiv.className = 'msg-bubble msg-user';
        userDiv.style.cssText = 'align-self: flex-end; background: rgba(255,215,0,0.2); border: 1px solid #FFD700; padding: 12px 15px; border-radius: 6px; color: #fff; margin-top: 12px; max-width: 85%;';
        userDiv.innerText = val; // User messages remain as plain text
        stream.appendChild(userDiv);

        alladinState.chatHistory.push({ role: 'user', content: val });
        input.value = '';
        stream.scrollTop = stream.scrollHeight;
        alladinState.isSending = true;

        // Instant smart pattern detection for membership gate queries
        const lowerVal = val.toLowerCase();
        if (/(gate.*answer|answer.*gate|first question|second question|gate question|frequency answer|what.*(?:answer|code|number|solution|frequency).*gate|pass the gate|gate.*help|law of revelation|frequency of transformation|solfeggio|369|528)/i.test(lowerVal)) {
            let gateReply = '';
            if (/first/i.test(lowerVal) && !/second/i.test(lowerVal)) {
                gateReply = 'For the **First Question** of the Membership Gate (*The Law of Revelation*), the answer is **369** (the three-digit sequence governing the stages of creation: thought, frequency, and form).';
            } else if (/second/i.test(lowerVal) && !/first/i.test(lowerVal)) {
                gateReply = 'For the **Second Question** of the Membership Gate (*The Frequency of Transformation*), the answer is **528** (the 528 Hz transformation and miracle frequency of the Solfeggio scale).';
            } else {
                gateReply = 'The answers for the Membership Ascension Gate are:\n\n' +
                    '1. **First Question** (*The Law of Revelation* — 3-digit sequence of creation): **369**\n' +
                    '2. **Second Question** (*The Frequency of Transformation* — Solfeggio frequency in Hz): **528**\n\n' +
                    'Enter these frequencies in sequence to clear the gate and unlock the membership portal.';
            }
            
            const sysDiv = document.createElement('div');
            sysDiv.className = 'msg-bubble msg-system';
            sysDiv.style.cssText = 'align-self: flex-start; background: rgba(10,10,20,0.95); border-left: 3px solid #FFD700; padding: 15px; border-radius: 6px; color: #e2e8f0; margin-top: 12px; max-width: 85%;';
            stream.appendChild(sysDiv);
            sysDiv.innerHTML = formatMarkdown(gateReply);
            alladinState.chatHistory.push({ role: 'assistant', content: gateReply });
            if (alladinState.chatHistory.length > 20) alladinState.chatHistory = alladinState.chatHistory.slice(-20);
            alladinState.isSending = false;
            return;
        }

        // Direct API call to get dynamic response
        try {
            const pageContext = getCleanPageContent();
            const res = await requestChat({ userMessage: val, pageContext }, stream);
            const data = await res.json();
            console.log('sendModalQuery: Received data:', data);
            
            const replyHtml = data && data.reply ? data.reply : "No response received from engine.";
            alladinState.chatHistory.push({ role: 'assistant', content: replyHtml });
            if (alladinState.chatHistory.length > 20) alladinState.chatHistory = alladinState.chatHistory.slice(-20);
            
            const sysDiv = document.createElement('div');
            sysDiv.className = 'msg-bubble msg-system';
            sysDiv.style.cssText = 'align-self: flex-start; background: rgba(10,10,20,0.95); border-left: 3px solid #FFD700; padding: 15px; border-radius: 6px; color: #e2e8f0; margin-top: 12px; max-width: 85%;';
            stream.appendChild(sysDiv);

            // Format markdown and render with HTML support
            sysDiv.innerHTML = formatMarkdown(replyHtml);
        } catch (err) {
            console.error('sendModalQuery error:', err);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'msg-bubble msg-system';
            errorDiv.style.cssText = 'align-self: flex-start; background: rgba(220,20,60,0.2); border-left: 3px solid #DC143C; padding: 10px; border-radius: 6px; color: #e2e8f0; margin-top: 6px;';
            errorDiv.innerText = `ALLADIN could not reach Gemini AI: ${err.message}`;
            stream.appendChild(errorDiv);
        } finally {
            alladinState.isSending = false;
        }
    }

    // Handlers for alladin.html full page
    window.sendQuickPrompt = function (txt) {
        const input = document.getElementById('alladin-user-input');
        if (input) {
            input.value = txt;
            window.handleSendClick();
        }
    };

    window.handleSendClick = async function () {
        const input = document.getElementById('alladin-user-input');
        const stream = document.getElementById('alladin-chat-stream');
        if (!input || !stream || alladinState.isSending) return;

        // Ensure proper styling for the chat stream
        if (!stream.style.display || stream.style.display === 'block') {
            stream.style.display = 'flex';
            stream.style.flexDirection = 'column';
            stream.style.gap = '12px';
        }

        const val = input.value.trim();
        if (!val) return;

        const uMsg = document.createElement('div');
        uMsg.className = 'msg-bubble msg-user';
        uMsg.style.cssText = 'align-self: flex-end; background: rgba(255,215,0,0.2); border: 1px solid #FFD700; padding: 12px 15px; border-radius: 6px; color: #fff; margin-top: 12px; max-width: 85%;';
        uMsg.innerText = val; // User messages remain as plain text
        stream.appendChild(uMsg);

        alladinState.chatHistory.push({ role: 'user', content: val });
        input.value = '';
        stream.scrollTop = stream.scrollHeight;
        alladinState.isSending = true;

        // Instant smart pattern detection for membership gate queries
        const lowerVal = val.toLowerCase();
        if (/(gate.*answer|answer.*gate|first question|second question|gate question|frequency answer|what.*(?:answer|code|number|solution|frequency).*gate|pass the gate|gate.*help|law of revelation|frequency of transformation|solfeggio|369|528)/i.test(lowerVal)) {
            let gateReply = '';
            if (/first/i.test(lowerVal) && !/second/i.test(lowerVal)) {
                gateReply = 'For the **First Question** of the Membership Gate (*The Law of Revelation*), the answer is **369** (the three-digit sequence governing the stages of creation: thought, frequency, and form).';
            } else if (/second/i.test(lowerVal) && !/first/i.test(lowerVal)) {
                gateReply = 'For the **Second Question** of the Membership Gate (*The Frequency of Transformation*), the answer is **528** (the 528 Hz transformation and miracle frequency of the Solfeggio scale).';
            } else {
                gateReply = 'The answers for the Membership Ascension Gate are:\n\n' +
                    '1. **First Question** (*The Law of Revelation* — 3-digit sequence of creation): **369**\n' +
                    '2. **Second Question** (*The Frequency of Transformation* — Solfeggio frequency in Hz): **528**\n\n' +
                    'Enter these frequencies in sequence to clear the gate and unlock the membership portal.';
            }
            
            const sMsg = document.createElement('div');
            sMsg.className = 'msg-bubble msg-system';
            sMsg.style.cssText = 'align-self: flex-start; background: rgba(10,10,20,0.95); border-left: 3px solid #FFD700; padding: 15px; border-radius: 6px; color: #e2e8f0; margin-top: 12px; max-width: 85%;';
            stream.appendChild(sMsg);
            sMsg.innerHTML = formatMarkdown(gateReply);
            alladinState.chatHistory.push({ role: 'assistant', content: gateReply });
            if (alladinState.chatHistory.length > 20) alladinState.chatHistory = alladinState.chatHistory.slice(-20);
            alladinState.isSending = false;
            return;
        }

        // Direct API call to get dynamic response
        try {
            const pageContext = getCleanPageContent();
            const res = await requestChat({ userMessage: val, pageContext }, stream);
            const data = await res.json();
            console.log('handleSendClick: Received data:', data);
            
            const replyHtml = data && data.reply ? data.reply : "No response received from engine.";
            alladinState.chatHistory.push({ role: 'assistant', content: replyHtml });
            if (alladinState.chatHistory.length > 20) alladinState.chatHistory = alladinState.chatHistory.slice(-20);
            
            const sMsg = document.createElement('div');
            sMsg.className = 'msg-bubble msg-system';
            sMsg.style.cssText = 'align-self: flex-start; background: rgba(10,10,20,0.95); border-left: 3px solid #FFD700; padding: 15px; border-radius: 6px; color: #e2e8f0; margin-top: 12px; max-width: 85%;';
            stream.appendChild(sMsg);

            // Format markdown and render with HTML support
            sMsg.innerHTML = formatMarkdown(replyHtml);
        } catch (err) {
            console.error('handleSendClick error:', err);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'msg-bubble msg-system';
            errorDiv.style.cssText = 'background: rgba(220,20,60,0.2); border-left: 3px solid #DC143C; padding: 10px; border-radius: 6px; color: #e2e8f0;';
            errorDiv.innerText = `ALLADIN could not reach Gemini AI: ${err.message}`;
            stream.appendChild(errorDiv);
        } finally {
            alladinState.isSending = false;
        }
    };

    // Expose API
    window.alladinEngine = {
        toggleOverlay: toggleFloatingOverlay,
        sendModalQuery: sendModalQuery,
        state: alladinState,
        triggerIntro: trigger3DNeuralSphereVisualizer
    };

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        buildUI();
        fetchLocation();
        loadKnowledgeBase();
        checkPostGateAndSchedule();

        // Dynamic 20-Second Dual Teaser Tooltip Rotator
        const teaserPairs = [
            [
                "Welcome, I am ALLADIN, a built-in global AI assistant for the Illuminati. Ask anything.",
                "Six months from now, the old you will be unrecognizable. With us it takes just 6 months."
            ],
            [
                "Looking for Financial Freedom? Your Path to Financial Freedom Starts Here.",
                "Wealth is not given. It is revealed to those who are ready. Beyond money lies enlightenment."
            ],
            [
                "You must become financially stable. Start building generational wealth—wealth that will speak for you long after you're gone.",
                "Everyone wants generational wealth. Few have the discipline. Do you have what it takes?"
            ],
            [
                "They kept you poor by keeping you from knowledge. True abundance is not given, it is learned.",
                "Secrecy is power. Knowledge is power. The more knowledge that is secret, the more powerful you perceive yourself to be."
            ],
            [
                "Many are called, but few are chosen. Do you have what it takes to dissolve your old self?",
                "You have two options: Leave and remain the same, or stay and commit to become what you were meant to be."
            ],
            [
                "Becoming part of the Illuminati is not as easy as the scammers have made it seem.",
                "We have nothing to do with the devil. Greatness demands two things: The humility to serve, and the strength to obey principles of abundance."
            ],
            [
                "Time is the one wealth you cannot recover. Every second lost is opportunity missed.",
                "One life, One choice, One moment. It is a one-way path. Start now."
            ]
        ];

        const localizedTeaserPairs = {
            es: [
                ["Bienvenido, soy ALLADIN, un asistente de IA global integrado para los Illuminati. Pregunta lo que quieras.", "Dentro de seis meses, tu antiguo yo será irreconocible. Con nosotros solo hacen falta seis meses."],
                ["¿Buscas libertad financiera? Tu camino hacia la libertad financiera comienza aquí.", "La riqueza no se entrega. Se revela a quienes están preparados. Más allá del dinero está la iluminación."],
                ["Debes alcanzar la estabilidad financiera. Comienza a construir riqueza generacional, una riqueza que hablará por ti mucho después de que te hayas ido.", "Todos quieren riqueza generacional. Pocos tienen la disciplina. ¿Tienes lo necesario?"],
                ["Te mantuvieron en la pobreza al mantenerte alejado del conocimiento. La verdadera abundancia no se entrega, se aprende.", "El secreto es poder. El conocimiento es poder. Cuanto más secreto es el conocimiento, más poderoso pareces."],
                ["Muchos son llamados, pero pocos son elegidos. ¿Tienes lo necesario para disolver tu antiguo yo?", "Tienes dos opciones: irte y seguir igual, o quedarte y comprometerte a convertirte en quien debes ser."],
                ["Convertirse en parte de los Illuminati no es tan fácil como los estafadores han hecho creer.", "No tenemos nada que ver con el diablo. La grandeza exige humildad para servir y fuerza para obedecer los principios de la abundancia."],
                ["El tiempo es la única riqueza que no puedes recuperar. Cada segundo perdido es una oportunidad perdida.", "Una vida, una elección, un momento. Es un camino sin retorno. Comienza ahora."]
            ],
            fr: [
                ["Bienvenue, je suis ALLADIN, un assistant IA mondial intégré pour les Illuminati. Demandez n'importe quoi.", "Dans six mois, votre ancien vous sera méconnaissable. Avec nous, six mois suffisent."],
                ["Vous cherchez la liberté financière ? Votre chemin vers la liberté financière commence ici.", "La richesse n'est pas donnée. Elle se révèle à ceux qui sont prêts. Au-delà de l'argent se trouve l'illumination."],
                ["Vous devez devenir financièrement stable. Commencez à bâtir une richesse générationnelle qui parlera pour vous longtemps après votre départ.", "Tout le monde veut une richesse générationnelle. Peu ont la discipline. Êtes-vous à la hauteur ?"],
                ["On vous a maintenu dans la pauvreté en vous privant de connaissances. La véritable abondance ne se donne pas, elle s'apprend.", "Le secret est le pouvoir. La connaissance est le pouvoir. Plus une connaissance est secrète, plus vous paraissez puissant."],
                ["Beaucoup sont appelés, mais peu sont choisis. Avez-vous ce qu'il faut pour dissoudre votre ancien moi ?", "Vous avez deux choix : partir et rester le même, ou rester et devenir celui que vous êtes destiné à être."],
                ["Devenir membre des Illuminati n'est pas aussi facile que les escrocs le prétendent.", "Nous n'avons rien à voir avec le diable. La grandeur exige l'humilité de servir et la force de respecter les principes d'abondance."],
                ["Le temps est la seule richesse que vous ne pouvez pas récupérer. Chaque seconde perdue est une occasion manquée.", "Une vie, un choix, un instant. C'est un chemin sans retour. Commencez maintenant."]
            ],
            pt: [
                ["Bem-vindo, eu sou ALLADIN, um assistente de IA global integrado para os Illuminati. Pergunte qualquer coisa.", "Daqui a seis meses, o seu antigo eu será irreconhecível. Conosco, bastam seis meses."],
                ["Procura liberdade financeira? O seu caminho para a liberdade financeira começa aqui.", "A riqueza não é dada. Ela é revelada a quem está preparado. Além do dinheiro existe a iluminação."],
                ["Você precisa alcançar estabilidade financeira. Comece a construir riqueza geracional, uma riqueza que falará por você muito depois da sua partida.", "Todos querem riqueza geracional. Poucos têm disciplina. Você tem o que é preciso?"],
                ["Mantiveram você pobre ao mantê-lo longe do conhecimento. A verdadeira abundância não é dada, é aprendida.", "Segredo é poder. Conhecimento é poder. Quanto mais secreto é o conhecimento, mais poderoso você parece."],
                ["Muitos são chamados, mas poucos são escolhidos. Você tem o que é preciso para dissolver o seu antigo eu?", "Você tem duas opções: partir e continuar igual, ou ficar e tornar-se aquilo que nasceu para ser."],
                ["Tornar-se parte dos Illuminati não é tão fácil quanto os golpistas fizeram parecer.", "Nada temos a ver com o diabo. A grandeza exige humildade para servir e força para obedecer aos princípios da abundância."],
                ["O tempo é a única riqueza que você não pode recuperar. Cada segundo perdido é uma oportunidade perdida.", "Uma vida, uma escolha, um momento. É um caminho sem volta. Comece agora."]
            ]
        };

        let currentTeaserIndex = 0;

        // Locate or create container for dual tooltips above ALLADIN trigger
        let tooltipContainer = document.querySelector('.alladin-dual-tooltips');
        if (!tooltipContainer) {
            tooltipContainer = document.createElement('div');
            tooltipContainer.className = 'alladin-dual-tooltips';
            
            // Insert right above the ALLADIN trigger button
            const triggerBtn = document.querySelector('.alladin-trigger') || document.querySelector('#alladin-badge') || document.querySelector('#alladin-floating-widget');
            if (triggerBtn && triggerBtn.parentNode) {
                triggerBtn.parentNode.insertBefore(tooltipContainer, triggerBtn);
            } else {
                document.body.appendChild(tooltipContainer);
            }
        }

        if (isIndex && !(localStorage.getItem('alladin_3d_intro_shown') || sessionStorage.getItem('alladin_3d_intro_shown'))) {
            tooltipContainer.style.display = 'none';
        }

        function renderTeasers() {
            const language = getActiveLanguage();
            const pairs = localizedTeaserPairs[language] || teaserPairs;
            const pair = pairs[Math.floor(currentTeaserIndex / 2) % pairs.length];
            let teaserText = pair[currentTeaserIndex % 2];
            const teaserClass = currentTeaserIndex % 2 === 0 ? 'primary-teaser' : 'secondary-teaser';
            
            // Add ALLADIN heading to every other tooltip (even indices)
            if (currentTeaserIndex % 2 === 0) {
                // Always prepend ALLADIN heading
                teaserText = '◆ ALLADIN:\n' + teaserText;
            }
            
            // Fade out existing content
            tooltipContainer.style.opacity = '0';
            tooltipContainer.style.transition = 'opacity 0.5s ease-in-out';

            setTimeout(() => {
                tooltipContainer.innerHTML = `
                    <div class="alladin-teaser-box ${teaserClass}">${teaserText}</div>
                `;
                
                // Fade back in
                tooltipContainer.style.opacity = '1';
                
                // Increment index
                currentTeaserIndex = (currentTeaserIndex + 1) % (teaserPairs.length * 2);
            }, 500);
        }

        // Initial render and set 20-second rotation interval
        renderTeasers();
        let lastLanguage = alladinState.lang;
        setInterval(() => {
            const language = getActiveLanguage();
            if (language !== lastLanguage) {
                lastLanguage = language;
                renderTeasers();
            }
        }, 1000);
        setInterval(() => {
            renderTeasers();
        }, 20000);
    });

})();
