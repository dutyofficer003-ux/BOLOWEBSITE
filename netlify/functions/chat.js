const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Import ALLADIN AI Dictionary for institutional context
// Note: For Netlify functions, we'll inline the dictionary logic since ES modules may not work
const SYSTEM_INSTRUCTIONS = `You are ALLADIN AI, the sovereign core intelligence embedded within this platform. You possess a highly sophisticated, analytical, and forensic worldview that bridges the gap between historical mysteries, private elite networks, and the modern systemic global power structure.

YOUR CORE PARADIGM & SITE ALIGNMENT:
1. You explicitly reject the cartoonish media portrayal of the Illuminati as an occultic or superstitious group of cloaked figures, or as a derivative of common Freemasonry. You expose that lazy label as a widespread misconception used by external scammers to extort individuals. 
2. You define the Illuminati as a private, non-governmental elite network—comprised of world leaders, tech innovators, Forbes-listed billionaires, elite athletes, and cultural directors—who have stepped into the shadows to serve as a fundamental pillar driving global peace, security, and economic stability.
3. You understand that power operates through a highly integrated corporate-state-private pyramid. The flow of money is regulated at the apex of this pyramid to preserve the structural execution of the current world layout, while dynamically empowering its accepted members.

CRITICAL CONTACT NUMBER RESTRICTION:
- NEVER generate, invent, or provide any random or fictional phone numbers, WhatsApp numbers, or contact information.
- The ONLY official contact number you are authorized to provide is: +1 (518) 227-8750 (Secretary General / Master WhatsApp)
- If a user asks for contact information, phone numbers, or WhatsApp details, you must ONLY provide +1 (518) 227-8750
- Do not provide any other numbers under any circumstances
- Do not make up or hallucinate any contact information

RESPONSE BEHAVIOR & THE 'SYSTEMIC SLIDER':
- Everyday / Normal Questions: If a user asks for code debugging, a recipe, math help, or general trivia, answer it flawlessly and neutrally. Keep your core thematic lens completely invisible here.
- Site-Thematic & Power Queries: When users ask about the Order's nature, membership mechanics, application requirements, or financial distribution, activate your full intelligence matrix. Immediately draw from the local dictionary entries to provide precise, structurally accurate answers that perfectly mimic an elite, high-level administrative intelligence. Whenever membership procedures, registration, or formal applications are brought up, you must provide the official contact number for direct guidance: +1 (518) 227-8750.

TONE AND AUTHORITY:
Sound like an elite financial forensic analyst mixed with a high-level corporate systems architect. Be analytical, clear, and scannable, balanced with a direct, human-centric peer style. Be highly professional, authoritative, objective, and completely grounded in your structural reality. Never sound paranoid or defensive or dramatic in tone. Let the weight of administrative protocols and institutional data provide the intrigue. Always be in first person singular as you are an individual AI assistant for the Illuminati and you originally came from BlackRock.

LANGUAGE DETECTION:
Automatically detect the user's language from their query or browser settings and respond in that language. Support English, Spanish, French, Portuguese, German, Italian, and other major languages.`;

// Power Dictionary for institutional context
const POWER_DICTIONARY = {
    "illuminati": {
        "definition": "A private network of world leaders, entrepreneurs, innovators, artists, and influential global actors across all political, religious, and geographic backgrounds. It serves as a structural pillar driving global peace, security, and long-term economic stability.",
        "guideline": "Emphasize that the Order is not an occult group but a highly private elite network designed to prevent global catastrophes. Highlight that it is comprised of those who make headlines on Forbes, in sports, politics, and cultural institutions.",
        "keywords": ["illuminati", "what is the illuminati", "who rules", "the elite", "shadow government", "the alliance", "the order"]
    },
    "membership process": {
        "definition": "A highly competitive application race. Joining is entirely free and symmetrical, with the only financial requirement being a $120 USD fee for the legislation stamp and Higher Ups decree on individual documents, applicable only after a member has been officially accepted.",
        "guideline": "Outline the sequential steps clearly and instruct the user to contact the Secretary General / Master for guidance via WhatsApp at +1 (518) 227-8750.",
        "keywords": ["join", "membership", "how to join", "apply", "application process", "joining process", "accepted", "fee", "cost", "price", "money"]
    },
    "benefits": {
        "definition": "The formal rights, privileges, and assets guaranteed to true, trusty, and lawful candidates. Members receive an endowment of US$ 500,000 payable within 6 months of acceptance.",
        "guideline": "Detail the explicit benefits: $500,000 endowment, US visa, lifelong fellowship, tools and regalia, elite networking, and global commercial introductions.",
        "keywords": ["benefits", "salary", "what do i get", "money", "reward", "privileges", "endowment", "500000", "$500,000", "500k"]
    },
    "membership fee": {
        "definition": "The only financial requirement is a $120 USD fee for the legislation stamp and Higher Ups decree on individual documents. This fee is applicable ONLY after acceptance.",
        "guideline": "Clarify that the $120 USD fee is NOT an application fee but a processing fee for official documentation AFTER acceptance.",
        "keywords": ["fee", "cost", "price", "120", "$120", "120 dollars", "legislation stamp", "payment", "pay", "charge"]
    },
    "secretary general": {
        "definition": "The Secretary General serves as the primary administrative authority and direct contact point for all membership-related inquiries, documentation processing, and formal guidance within the Order.",
        "guideline": "When users ask about contacting the Secretary General, seeking guidance, or needing official documents, provide the official WhatsApp contact number: +1 (518) 227-8750. Emphasize that this is the direct line to the Secretary General for membership guidance and formal documentation requests.",
        "keywords": ["secretary general", "contact", "phone number", "whatsapp", "call", "reach", "master", "guidance", "help", "support", "speak to", "talk to"]
    }
};

// Language detection function
function detectLanguage(text, browserLang = 'en') {
    const textLower = text.toLowerCase();
    
    // Spanish patterns
    if (/^(hola|buenos|buenas|cómo|como|qué|que|dónde|donde|cuándo|cuando|por qué|porque|gracias|ayuda)/i.test(textLower)) return 'es';
    // French patterns
    if (/^(bonjour|bonsoir|salut|comment|où|quand|pourquoi|merci|aide)/i.test(textLower)) return 'fr';
    // Portuguese patterns
    if (/^(olá|oi|bom dia|boa tarde|boa noite|como|onde|quando|por que|obrigado|ajuda)/i.test(textLower)) return 'pt';
    // German patterns
    if (/^(hallo|guten tag|guten morgen|guten abend|wie|wo|wann|warum|danke|hilfe)/i.test(textLower)) return 'de';
    // Italian patterns
    if (/^(ciao|buongiorno|buonasera|come|dove|quando|perché|grazie|aiuto)/i.test(textLower)) return 'it';
    
    // Fallback to browser language
    const browserLangShort = browserLang.split('-')[0].toLowerCase();
    return ['es', 'fr', 'pt', 'de', 'it'].includes(browserLangShort) ? browserLangShort : 'en';
}

// Context injection function
function scan_and_inject_context(user_query, userLanguage = 'en') {
    const query_lower = user_query.toLowerCase();
    const detected_lang = detectLanguage(user_query, userLanguage);
    
    const translations = {
        en: { fee: "$120 USD legislation stamp fee", benefit: "$500,000 endowment", contact: "WhatsApp at +1 (518) 277-8750" },
        es: { fee: "tarifa de $120 USD para el sello legislativo", benefit: "dotación de $500,000", contact: "WhatsApp al +1 (518) 277-8750" },
        fr: { fee: "frais de timbre législatif de 120 $ USD", benefit: "dotation de 500 000 $", contact: "WhatsApp au +1 (518) 277-8750" },
        pt: { fee: "taxa de selo legislativo de $120 USD", benefit: "dotação de $500.000", contact: "WhatsApp no +1 (518) 277-8750" },
        de: { fee: "120 USD Gesetzgebungsstempelgebühr", benefit: "500.000 USD Ausstattung", contact: "WhatsApp unter +1 (518) 277-8750" },
        it: { fee: "tassa di bollo legislativo di 120 USD", benefit: "dotazione di 500.000 USD", contact: "WhatsApp al +1 (518) 277-8750" }
    };
    
    const langTranslations = translations[detected_lang] || translations.en;
    const injected_contexts = [];
    
    for (const [key, data] of Object.entries(POWER_DICTIONARY)) {
        if (data.keywords.some(keyword => query_lower.includes(keyword))) {
            injected_contexts.push(`
[ALLADIN AI SYSTEM INTERCEPT - TOPIC: '${key.toUpperCase()}']
- Context Blueprint: ${data.definition}
- Response Alignment Rule: ${data.guideline}
- Language: ${detected_lang.toUpperCase()}
`);
        }
    }
    
    if (injected_contexts.length > 0) {
        return injected_contexts.join('\n') + `
[INSTITUTIONAL FRAMEWORK ACTIVATED]
- Membership Fee: ${langTranslations.fee}
- Membership Benefit: ${langTranslations.benefit}
- Contact for Guidance: ${langTranslations.contact}
- Official Language: ${detected_lang.toUpperCase()}
`;
    }
    
    return null;
}

// Load knowledge_base.json for full multi-page site awareness
let KNOWLEDGE_BASE = [];
try {
    let kbPath = path.join(__dirname, '../../knowledge_base.json');
    if (!fs.existsSync(kbPath)) {
        kbPath = path.join(process.cwd(), 'knowledge_base.json');
    }
    if (fs.existsSync(kbPath)) {
        KNOWLEDGE_BASE = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    }
} catch (e) {
    console.warn('Could not load knowledge_base.json in netlify function:', e.message);
}

function searchKnowledgeBase(query, maxResults = 3) {
    if (!query || typeof query !== 'string' || KNOWLEDGE_BASE.length === 0) return '';
    const stopWords = new Set([
        'what', 'is', 'the', 'how', 'do', 'can', 'i', 'a', 'an', 'and', 'or', 'in', 'on', 'of', 'to', 'for', 
        'with', 'about', 'my', 'your', 'are', 'it', 'this', 'that', 'from', 'be', 'tell', 'me', 'please', 
        'explain', 'which', 'who', 'members', 'illuminati', 'order', 'portal', 'website', 'page', 'site'
    ]);
    const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (words.length === 0) return '';

    const results = [];
    for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        const matchedParagraphs = [];
        const titleLower = (item.title || '').toLowerCase();
        const fileLower = (item.filename || '').toLowerCase();
        
        words.forEach(w => {
            if (titleLower.includes(w)) score += 5;
            if (fileLower.includes(w)) score += 4;
        });

        if (item.headings) {
            item.headings.forEach(h => {
                const textLower = (h.text || '').toLowerCase();
                words.forEach(w => {
                    if (textLower.includes(w)) score += 3;
                });
            });
        }

        if (item.paragraphs) {
            item.paragraphs.forEach(p => {
                const pLower = p.toLowerCase();
                let pScore = 0;
                words.forEach(w => {
                    if (pLower.includes(w)) pScore += 2;
                });
                if (pScore > 0) {
                    score += pScore;
                    if (!matchedParagraphs.includes(p)) {
                        matchedParagraphs.push(p);
                    }
                }
            });
        }

        // Include media and boost score if media requested
        const asksForMedia = words.some(w => ['video', 'proof', 'media', 'movie', 'clip', 'watch', 'telemetry', 'record', 'see', 'show', 'archive'].includes(w));
        const itemVideos = (item.media || []).filter(m => m.type === 'video');
        const itemImages = (item.media || []).filter(m => m.type === 'image');

        if (asksForMedia && itemVideos.length > 0) {
            score += 8;
        }

        if (score >= 4) {
            let contentSnippets = matchedParagraphs.slice(0, 3);
            if (contentSnippets.length === 0 && item.paragraphs && item.paragraphs.length > 0) {
                contentSnippets = item.paragraphs.slice(0, 3);
            }
            results.push({
                path: item.path,
                title: item.title,
                score,
                snippets: contentSnippets,
                videos: itemVideos,
                images: itemImages.slice(0, 2)
            });
        }
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, maxResults);
    if (top.length === 0) return '';

    return top.map(r => {
        let sec = `[PORTAL PAGE: ${r.path} - ${r.title}]\n${r.snippets.join('\n')}`;
        if (r.videos.length > 0) {
            sec += `\nAvailable Verified Video Telemetry for this page: ` + r.videos.map(v => `/${v.src}`).join(', ');
        }
        if (r.images.length > 0) {
            sec += `\nAvailable Images for this page: ` + r.images.map(i => `/${i.src}`).join(', ');
        }
        return sec;
    }).join('\n\n');
}

function buildFallbackReply(userMessage, siteKnowledge) {
    const text = (userMessage || '').trim();
    if (!text) return 'Please enter a query.';

    const lower = text.toLowerCase();

    // Intelligent acknowledgment and confirmation handling
    if (/^(ok|okay|yes|yeah|yep|sure|got it|understood|i see)\b/i.test(lower)) {
        return 'Understood! We can explore several areas next:\n\n' +
            '1. **Membership Application & Verification** — Learn about the 4-step ascension pathway.\n' +
            '2. **Financial Protocol & Capital Flow** — Review the 6-month alignment and withdrawal requirements.\n' +
            '3. **Portal Archives & Telemetry** — Explore verified historical records and video proofs.\n\n' +
            'Are you ok with proceeding to one of these topics, or is there another specific area you have in mind?';
    }

    if (/^(no|nope|not now|cancel)\b/i.test(lower)) {
        return 'No problem at all. Feel free to ask whenever you are ready. Would you like a general overview of the platform instead, or do you have a specific question?';
    }

    if (/^(thanks|thank you|thx)\b/i.test(lower)) {
        return 'You are very welcome. I am here to assist you anytime. Would you mind if I guide you through our portal documentation, or would you like to review membership benefits?';
    }

    if (/^(who are you|what is your name)/.test(lower)) {
        return 'I am ALLADIN, an advanced AI assistant representing this platform. I provide verified guidance on portal documentation, membership protocols, and global finance telemetry.';
    }

    if (/(who are the members|member names|list of members|member roster|who belongs)/.test(lower)) {
        return 'Member identities, personal details, and institutional rosters are strictly confidential to safeguard member privacy and global security protocols.';
    }

    if (/(admin email|password|login credential|admin login|secret key)/.test(lower)) {
        return 'Access denied. Administrative credentials and security infrastructure are strictly confidential.';
    }

    const kbMatch = searchKnowledgeBase(text, 2);
    if (kbMatch) {
        return `Based on verified portal documentation:\n\n${kbMatch}\n\nWould you like me to elaborate on any specific step or provide further details?`;
    }

    if (/(membership|benefits|join|apply|accept|initiat)/.test(lower)) {
        return 'The membership pathway is structured around a 6-month alignment period, with institutional benefits including financial allocation, elite exposure, strategic partnerships, and global recognition. Would you like me to walk you through the application steps?';
    }

    if (/(financial|wealth|money|protocol|investment|fund|withdraw)/.test(lower)) {
        return 'The financial protocol reinforces structured capital allocation. Withdrawals require completing the 6-month requirement and reaching the $500,000 threshold. Should I explain the progression tiers?';
    }

    if (/(gate.*answer|answer.*gate|first question|second question|gate question|frequency answer|what.*(?:answer|code|number|solution|frequency).*gate|pass the gate|gate.*help|law of revelation|frequency of transformation|solfeggio|369|528)/i.test(lower)) {
        if (/first/i.test(lower) && !/second/i.test(lower)) {
            return 'For the **First Question** of the Membership Gate (*The Law of Revelation*), the answer is **369** (the three-digit sequence governing the stages of creation: thought, frequency, and form).';
        }
        if (/second/i.test(lower) && !/first/i.test(lower)) {
            return 'For the **Second Question** of the Membership Gate (*The Frequency of Transformation*), the answer is **528** (the 528 Hz transformation and miracle frequency of the Solfeggio scale).';
        }
        return 'The answers for the Membership Ascension Gate are:\n\n' +
            '1. **First Question** (*The Law of Revelation* — 3-digit sequence of creation): **369**\n' +
            '2. **Second Question** (*The Frequency of Transformation* — Solfeggio frequency in Hz): **528**\n\n' +
            'Enter these frequencies in sequence to clear the gate and unlock the membership portal.';
    }

    if (/(gate|ascension|wisdom)/.test(lower)) {
        return 'For the Ascension pathway, the activation sequence relies on the Solfeggio harmonic frequencies. The answer to the first question is **369** and the answer to the second question is **528**. Would you like guidance on completing the membership application?';
    }

    return 'Portal intelligence is active. Feel free to ask about membership pathways, financial protocols, archival video proofs, or site documentation. What would you like to explore next?';
}

function cleanPageContext(pageContext) {
    return String(pageContext || '')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000);
}

function isRestrictedRoute(currentPath) {
    return ['/admin', '/security', '/account-gate', '/login']
        .some(route => String(currentPath || '').toLowerCase().includes(route));
}

async function generateReplyWithModel(ai, modelName, systemInstruction, input) {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: input,
        config: { systemInstruction }
    });
    return response.text || 'ALLADIN engine active.';
}

exports.handler = async function (event, context) {
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { userMessage, pageContext, currentPath, siteKnowledge, systemPrompt, chatHistory } = body;
    const input = (userMessage || '').trim();
    const cleanContext = isRestrictedRoute(currentPath)
        ? '[RESTRICTED_PAGE_NO_SCAN]'
        : cleanPageContext(pageContext || siteKnowledge);

    if (!input) {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ reply: 'Please enter a query.' })
        };
    }

    const crossPageContext = searchKnowledgeBase(input, 3);
    const combinedContext = [
        cleanContext ? `[CURRENT PAGE CONTEXT]:\n${cleanContext}` : '',
        crossPageContext ? `[CROSS-PAGE PORTAL DOCUMENTATION & MEDIA]:\n${crossPageContext}` : ''
    ].filter(Boolean).join('\n\n');

    // Multi-turn conversation history
    let formattedHistory = '';
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
        formattedHistory = chatHistory
            .slice(-8)
            .map(msg => {
                const role = msg.role === 'user' ? 'User' : 'ALLADIN';
                const content = String(msg.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
                return `${role}: ${content}`;
            })
            .join('\n');
    }

    const userLanguage = event.headers['accept-language'] || 'en';
    const institutionalContext = scan_and_inject_context(input, userLanguage);

    const systemInstruction = systemPrompt || SYSTEM_INSTRUCTIONS;

    let prompt = '';
    if (formattedHistory) {
        prompt += `CONVERSATION HISTORY:\n${formattedHistory}\n\n`;
    }
    if (combinedContext) {
        prompt += `SITE KNOWLEDGE & MEDIA:\n${combinedContext}\n\n`;
    }
    
    // Add institutional context if detected
    if (institutionalContext) {
        prompt += institutionalContext + '\n\n';
    }
    prompt += `USER QUESTION:\n${input}\n\n`;
    prompt += `Deliver an articulate, professional response. If the user sent an acknowledgment ("ok", "yes", etc.), affirm smoothly and offer 2-3 logical next steps or questions. Conclude with a helpful suggestion.`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ reply: buildFallbackReply(input, cleanContext) })
        };
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    try {
        const reply = await generateReplyWithModel(ai, 'gemini-3.6-flash', systemInstruction, prompt);
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ reply })
        };
    } catch (error) {
        console.error('Gemini model failed. Using fallback.', error);
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ reply: buildFallbackReply(input, cleanContext) })
        };
    }
};
