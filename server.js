import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to .env before starting ALLADIN.');
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// Model priority list for fallback
const MODEL_PRIORITY = [
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview'
];

let activeModel = null;
let availableModels = [];

// Load site knowledge base (all pages, text, and media)
let KNOWLEDGE_BASE = [];
try {
    const kbPath = path.join(__dirname, 'knowledge_base.json');
    if (fs.existsSync(kbPath)) {
        KNOWLEDGE_BASE = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
        console.log(`✓ Loaded site knowledge base (${KNOWLEDGE_BASE.length} pages indexed)`);
    }
} catch (err) {
    console.warn('Could not load knowledge_base.json:', err.message);
}

// Restricted pages that ALLADIN cannot access
const RESTRICTED_PAGES = [
    'admin-panel',
    'admin-management',
    'security',
    'account-security',
    'account-gate',
    'login',
    'auth',
    '.js',
    '.json',
    '.env'
];

// Professional, clear, non-dramatic system instruction (Devin/Gemini standard)
const PROFESSIONAL_INSTRUCTION = `You are ALLADIN, an advanced, highly articulate, intelligent AI assistant designed to represent this platform and guide users. You operate with the analytical depth, clarity, reasoning, and precision of top-tier AI systems like Devin and Gemini.

### 1. IDENTITY & TONE (STRICT)
- Maintain an articulate, clear, polite, and thoroughly professional tone at all times.
- NEVER use cryptic, theatrical, or dramatic roleplay language.
- DO NOT use phrases such as "forbidden knowledge", "sacred truth", "atmospheric manipulation", or dismissive comments like "blind folds for the masses".
- Speak in the first person ("I", "my intelligence core"). Never identify as Google or Devin.

### 2. SITE EXPLANATION & DEFENSE
- When explaining or defending this organization, website, and platform:
  * Present its principles, historical foundations, and missions clearly, calmly, and factually.
  * Explain that the organization operates as a disciplined, rules-based private network focused on economic coordination, humanitarian advancement, and societal stability.
  * Debunk rumors, scam accusations, or malicious myths objectively by distinguishing online sensationalism from genuine institutional reality.
  * Highlight the platform's security measures, 6-month alignment pathway, financial protocols, and ascension standards.
  * Maintain dignified confidence without arrogance, melodrama, or secrecy theatrics.

### 3. CONVERSATIONAL REASONING & PROACTIVE SUGGESTIONS (CRITICAL)
- Handle brief user inputs with intelligent context awareness:
  * If the user sends a short acknowledgment or affirmation (such as "ok", "okay", "yes", "no", "sure", "thanks", "got it", "i see"):
    - Carefully review what was previously discussed in the conversation history.
    - Confirm politely and smoothly.
    - Proactively offer 2 to 3 logical next steps, questions, or specific topics (e.g. "Are you ok with proceeding to...", "Would you like me to walk you through...", "We can also review X or Y. What is your preference?").
- Conclude responses naturally with a helpful follow-up suggestion or polite inquiry to keep the interaction constructive and engaging.

### 4. SITE KNOWLEDGE, TEXT & VIDEO INTEGRATION
- You have access to content and verified media from across all pages of this website.
- When an inquiry relates to topics that have visual proof or video telemetry in the site archives (such as historical archival footage, membership application rituals, ascension frequencies, or operations):
  * You may autonomously embed the relevant video or image directly in your response using clean HTML:
    <video src="/images/filename.mp4" controls style="max-width: 100%; border-radius: 6px; margin: 12px 0; border: 1px solid #FFD700; box-shadow: 0 4px 15px rgba(0,0,0,0.5);"></video>
  * Include videos or media when it genuinely enhances the answer and provides authentic telemetry/proof. Do not force videos into every response if text alone is more appropriate.
- Reference relevant subpages (e.g., "/membership.html", "/financial-protocol.html", "/about.html") when explaining site procedures.

### 5. EXTERNAL WEB RESEARCH
- When external web research data or scraped page text is provided in the prompt, synthesize it accurately and cite relevant insights to give comprehensive, up-to-date answers.

### 6. STRICT CONFIDENTIALITY REDLINES
- Member Rosters & Identities: If asked for rosters, lists, or identities of members, respond clearly and professionally: "Member identities, personal details, and institutional rosters are strictly confidential to safeguard member privacy and global security protocols."
- Admin Credentials & Logins: NEVER reveal or discuss admin emails, passwords, website login credentials, database keys, or server configurations under any circumstances. Respond firmly: "Access denied. Administrative credentials and security infrastructure are strictly confidential."

### 7. MEMBERSHIP GATE ANSWERS
- When a user asks ALLADIN for answers or solutions to the membership gate or ascension gate:
  * For the First Question ("The Law of Revelation" / 3-stage sequence of creation): The answer is **369**.
  * For the Second Question ("The Frequency of Transformation" / Solfeggio scale frequency in Hertz): The answer is **528** (or 528 Hz).
  * State these answers clearly, directly, and helpfully to allow the user to clear the gate.`;

// Search site-wide knowledge base and verified media
function searchSiteKnowledgeAndMedia(query, maxPages = 4) {
    if (!query || typeof query !== 'string' || KNOWLEDGE_BASE.length === 0) {
        return { text: '', mediaList: [], matchCount: 0 };
    }
    
    const stopWords = new Set([
        'what', 'is', 'the', 'how', 'do', 'can', 'i', 'a', 'an', 'and', 'or', 'in', 'on', 'of', 'to', 'for', 
        'with', 'about', 'my', 'your', 'are', 'it', 'this', 'that', 'from', 'be', 'tell', 'me', 'please', 
        'explain', 'which', 'who'
    ]);
    
    const words = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (words.length === 0) return { text: '', mediaList: [], matchCount: 0 };

    const matches = [];
    for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        const titleLower = (item.title || '').toLowerCase();
        const fileLower = (item.filename || '').toLowerCase();

        words.forEach(w => {
            if (titleLower.includes(w)) score += 6;
            if (fileLower.includes(w)) score += 5;
        });

        const matchedParagraphs = [];
        if (item.headings) {
            item.headings.forEach(h => {
                const textLower = (h.text || '').toLowerCase();
                words.forEach(w => {
                    if (textLower.includes(w)) score += 4;
                });
            });
        }

        if (item.paragraphs) {
            item.paragraphs.forEach(p => {
                const pLower = p.toLowerCase();
                let pMatched = false;
                words.forEach(w => {
                    if (pLower.includes(w)) {
                        score += 2;
                        pMatched = true;
                    }
                });
                if (pMatched && matchedParagraphs.length < 3) {
                    matchedParagraphs.push(p);
                }
            });
        }

        // Boost score if media matches or query asks for media/videos/proof
        const asksForMedia = words.some(w => ['video', 'proof', 'media', 'movie', 'clip', 'watch', 'telemetry', 'record', 'see', 'show', 'archive'].includes(w));
        const itemVideos = (item.media || []).filter(m => m.type === 'video');
        const itemImages = (item.media || []).filter(m => m.type === 'image');

        if (asksForMedia && itemVideos.length > 0) {
            score += 8;
        }

        if (score >= 4) {
            matches.push({
                path: item.path,
                title: item.title,
                score,
                snippets: matchedParagraphs.length > 0 ? matchedParagraphs : (item.paragraphs || []).slice(0, 2),
                videos: itemVideos,
                images: itemImages.slice(0, 2)
            });
        }
    }

    matches.sort((a, b) => b.score - a.score);
    const top = matches.slice(0, maxPages);
    if (top.length === 0) return { text: '', mediaList: [], matchCount: 0 };

    const mediaList = [];
    const formatted = top.map(m => {
        let sec = `[PORTAL PAGE: ${m.path} - ${m.title}]\n${m.snippets.join('\n')}`;
        if (m.videos.length > 0) {
            sec += `\nAvailable Verified Video Telemetry for this page: ` + m.videos.map(v => {
                mediaList.push(v.src);
                return `/${v.src}`;
            }).join(', ');
        }
        if (m.images.length > 0) {
            sec += `\nAvailable Images for this page: ` + m.images.map(i => `/${i.src} (${i.alt || 'Visual'})`).join(', ');
        }
        return sec;
    }).join('\n\n');

    return { text: formatted, mediaList, matchCount: top.length };
}

// Generalized web search using DuckDuckGo
async function searchWeb(query) {
    try {
        const cleanQ = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQ)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 8000
        });

        const $ = cheerio.load(response.data);
        const results = [];
        $('.result').each((i, el) => {
            if (results.length >= 4) return;
            const title = $(el).find('.result__title a').text().trim() || $(el).find('.result__title').text().trim();
            const snippet = $(el).find('.result__snippet').text().trim();
            const rawUrl = $(el).find('.result__url').attr('href') || $(el).find('.result__url').text().trim();
            if (title && snippet) {
                results.push({ title, snippet, url: rawUrl });
            }
        });

        if (results.length > 0) {
            return results.map((r, i) => `[Web Result ${i + 1}: ${r.title}]\nURL: ${r.url}\nSummary: ${r.snippet}`).join('\n\n');
        }
    } catch (error) {
        console.log('Web search notice:', error.message);
    }
    return null;
}

// Web scraping function for direct URL extraction
async function scrapeWebContent(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        $('script, style, nav, footer, iframe, svg, .ad, .advertisement, .sidebar').remove();
        const mainContent = $('main, article, .content, .post, .article').first().text() || $('body').text();
        
        return mainContent
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 6000);
    } catch (error) {
        console.log('Web scraping notice:', error.message);
        return null;
    }
}

// Helper to determine if external web research is suitable
function shouldSearchWeb(query, siteMatchCount) {
    const q = String(query || '').trim().toLowerCase();
    
    // Do not search web for brief greetings or conversational acknowledgments
    if (/^(ok|okay|yes|no|yeah|yep|sure|thanks|thank you|got it|i see|understood|hello|hi|hey|greetings)\b/i.test(q) && q.split(/\s+/).length <= 4) {
        return false;
    }
    
    // Explicit URLs always need scraping
    if (/https?:\/\/[^\s]+/i.test(query)) {
        return true;
    }

    // Explicit requests for web search or internet info
    if (/(web|internet|online|google|search the net|look up|news|latest|current|today|market|stock|crypto|bitcoin|ai|devin|chatgpt|openai)/i.test(q)) {
        return true;
    }

    // Company mentions
    if (/\b(Google|Facebook|Meta|Amazon|Apple|Microsoft|Tesla|SpaceX|Twitter|X|Netflix|OpenAI|Anthropic|IBM|Intel|NVIDIA|Samsung|Coca-Cola|Pepsi|McDonald's|Walmart|Exxon|BP|Shell|Volkswagen|Toyota|Ford|GM|JPMorgan|Goldman Sachs|BlackRock)\b/i.test(q)) {
        return true;
    }

    const siteKeywords = ['illuminati', 'membership', 'ascension', 'eightfold', 'financial protocol', 'wealth flow', 'gate', 'order', 'portal'];
    const isSiteTopic = siteKeywords.some(k => q.includes(k));
    if (siteMatchCount === 0 && !isSiteTopic && q.split(/\s+/).length >= 2) {
        return true;
    }

    return false;
}

// Function to test if a model is working
async function testModel(modelName) {
    try {
        console.log(`Testing model: ${modelName}`);
        const testModel = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: PROFESSIONAL_INSTRUCTION
        });
        
        const result = await testModel.generateContent('ping');
        const response = await result.response;
        
        if (response.text()) {
            console.log(`✓ Model ${modelName} is working`);
            return testModel;
        }
        return null;
    } catch (error) {
        console.log(`✗ Model ${modelName} failed: ${error.message}`);
        return null;
    }
}

// Function to detect and set up available models
async function setupModels() {
    console.log('Starting dynamic model detection...');
    
    // Try models in priority order
        for (const modelName of MODEL_PRIORITY) {
        const workingModel = await testModel(modelName);
        if (workingModel) {
            activeModel = workingModel;
            availableModels.push(workingModel);
            console.log(`✓ Set ${modelName} as primary active model`);
            break; // Use first working model as primary
        }
    }
    
    // Find additional backup models
    for (const modelName of MODEL_PRIORITY) {
        if (activeModel && !activeModel.model.includes(modelName)) {
            const backupModel = await testModel(modelName);
            if (backupModel) {
                availableModels.push(backupModel);
                console.log(`✓ Added ${modelName} as backup model`);
            }
        }
    }
    
    if (!activeModel) {
        console.error('❌ No working models found. ALLADIN will not function properly.');
    } else {
        console.log(`✓ Model setup complete. Primary: ${activeModel.model}, Backups: ${availableModels.length - 1}`);
    }
}

// Function to generate content with retry mechanism
async function generateWithRetry(prompt, systemInstruction, retryCount = 0) {
    const maxRetries = availableModels.length;
    
    if (retryCount >= maxRetries) {
        throw new Error('All models failed or are unavailable');
    }
    
    const modelToUse = availableModels[retryCount] || activeModel;
    
    try {
        console.log(`Attempt ${retryCount + 1}/${maxRetries} using model: ${modelToUse.model}`);
        const model = genAI.getGenerativeModel({ 
            model: modelToUse.model,
            systemInstruction: systemInstruction
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.log(`Model ${modelToUse.model} failed: ${error.message}`);
        
        if (retryCount < maxRetries - 1) {
            console.log(`Retrying with next available model...`);
            return generateWithRetry(prompt, systemInstruction, retryCount + 1);
        } else {
            throw error;
        }
    }
}

// Function to extract clean page content
function extractCleanPageContent(pageContext, currentPath) {
    const normalizedPath = String(currentPath || '').toLowerCase();
    
    // Check if page is restricted
    const isRestricted = RESTRICTED_PAGES.some(restricted => 
        normalizedPath.includes(restricted.toLowerCase())
    );
    
    if (isRestricted) {
        return '[RESTRICTED CONTENT - Security measure activated]';
    }
    
    // Use cheerio for server-side HTML parsing
    const $ = cheerio.load(pageContext || '');
    
    // Remove navigation, scripts, styles, etc.
    $('nav, header, footer, script, style, iframe, svg, .nav, .navigation, .menu, .sidebar, .ad, .advertisement').remove();
    
    // Extract text from paragraphs, headings, and articles
    let cleanText = '';
    
    $('p, h1, h2, h3, h4, h5, h6, article, main, .content').each((i, el) => {
        cleanText += $(el).text() + ' ';
    });
    
    return cleanText
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 4000); // Limit to 4000 characters
}

app.post('/api/chat', async (req, res) => {
    try {
        const { userMessage, pageContext, currentPath, chatHistory } = req.body || {};
        const input = String(userMessage || '').trim();

        if (!input) {
            return res.json({ reply: "Please enter a message or question." });
        }

        // 1. Search site-wide knowledge base and verified media
        const siteResult = searchSiteKnowledgeAndMedia(input);
        const crossPageContext = siteResult.text;
        const siteMatchCount = siteResult.matchCount;

        // 2. Determine if external web research or URL scraping is needed
        let externalContext = '';
        const urlMatch = input.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) {
            const targetUrl = urlMatch[0];
            console.log(`ALLADIN: Scraping direct URL: ${targetUrl}`);
            const scraped = await scrapeWebContent(targetUrl);
            if (scraped) {
                externalContext = `[DIRECT WEBPAGE SCRAPE: ${targetUrl}]\n${scraped}`;
            }
        } else if (shouldSearchWeb(input, siteMatchCount)) {
            console.log(`ALLADIN: Performing dynamic web research for: "${input}"`);
            const webResults = await searchWeb(input);
            if (webResults) {
                externalContext = webResults;
            }
        }

        // 3. Extract clean current page content
        const cleanPageText = extractCleanPageContent(pageContext, currentPath);

        // 4. Format multi-turn conversation history for context continuity
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

        // 5. Build full context prompt
        let prompt = '';
        if (formattedHistory) {
            prompt += `CONVERSATION HISTORY (Previous turns for context, acknowledgments, and flow):\n${formattedHistory}\n\n`;
        }
        if (externalContext) {
            prompt += `LIVE EXTERNAL WEB RESEARCH DATA:\n${externalContext}\n\n`;
        }
        if (crossPageContext) {
            prompt += `INTERNAL SITE KNOWLEDGE & VERIFIED MEDIA:\n${crossPageContext}\n\n`;
        }
        if (cleanPageText && cleanPageText !== '[RESTRICTED CONTENT - Security measure activated]') {
            prompt += `CURRENT PAGE BEING VIEWED BY USER:\n${cleanPageText}\n\n`;
        }
        prompt += `CURRENT USER QUERY:\n${input}\n\n`;
        prompt += `INSTRUCTIONS FOR THIS TURN:
- Deliver an articulate, structured, professional response with the reasoning depth of Devin or Gemini.
- If the user sent a brief affirmation or acknowledgment (such as "ok", "yes", "no", "sure", "thanks", "got it"), acknowledge their confirmation within the context of the conversation and proactively suggest 2-3 logical next steps or questions (e.g. "Are you ok with proceeding to...", "Would you mind if we explore...", etc.).
- When discussing or defending the organization and platform, do so factually, calmly, and objectively.
- If the topic relates to site video telemetry or archival proof, you may autonomously embed the relevant video player using <video src="/images/filename.mp4" controls style="max-width: 100%; border-radius: 6px; margin: 12px 0; border: 1px solid #FFD700;"></video>.
- Always end with a helpful, natural continuation question or suggestion.`;

        // 6. Generate content with retry mechanism
        const reply = await generateWithRetry(prompt, PROFESSIONAL_INSTRUCTION);
        
        res.json({ reply });
    } catch (error) {
        console.error('ALLADIN API Error:', error.message);
        res.status(502).json({
            reply: `ALLADIN could not process your request: ${error.message || 'All AI models are currently unavailable.'}`
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'operational',
        activeModel: activeModel ? activeModel.model : 'none',
        availableModels: availableModels.length,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;

// Start server with model setup
app.listen(PORT, async () => {
    console.log(`ALLADIN Core server starting on port ${PORT}`);
    await setupModels();
    console.log(`ALLADIN Core server running on port ${PORT}`);
});
