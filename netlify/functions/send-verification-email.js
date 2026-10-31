const crypto = require('crypto');

// In-memory backup store with TTL for the same container session
const otpMemoryStore = new Map();

function getSecretKey() {
    return process.env.BREVO_API_KEY || process.env.JWT_SECRET || 'illuminati_portal_secure_otp_salt_2026';
}

function generateHMAC(email, purpose, code, timestamp) {
    const secret = getSecretKey();
    const data = `${String(email).trim().toLowerCase()}:${purpose || 'login'}:${String(code).trim()}:${timestamp}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function generate6DigitCode() {
    return crypto.randomInt(100000, 999999).toString();
}

function storeInMemory(email, code, purpose) {
    const key = `${String(email).trim().toLowerCase()}_${purpose || 'login'}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpMemoryStore.set(key, { code, expiresAt, attempts: 0 });

    if (otpMemoryStore.size > 2000) {
        const now = Date.now();
        for (const [k, val] of otpMemoryStore.entries()) {
            if (val.expiresAt < now) otpMemoryStore.delete(k);
        }
    }
}

function verifyInMemory(email, code, purpose) {
    const key = `${String(email).trim().toLowerCase()}_${purpose || 'login'}`;
    const stored = otpMemoryStore.get(key);
    if (!stored) return false;
    if (stored.expiresAt < Date.now()) {
        otpMemoryStore.delete(key);
        return false;
    }
    if (stored.code === String(code).trim()) {
        otpMemoryStore.delete(key);
        return true;
    }
    stored.attempts = (stored.attempts || 0) + 1;
    if (stored.attempts >= 4) {
        otpMemoryStore.delete(key);
    }
    return false;
}

exports.handler = async function (event, context) {
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let body = {};
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { action = 'send', email, purpose = 'login', code, token } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Valid email address is required' }) };
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // -------------------------------------------------------------------------
    // ACTION: VERIFY CODE
    // -------------------------------------------------------------------------
    if (action === 'verify' || (code && code.length === 6 && !body.sender)) {
        if (!code || !/^\d{6}$/.test(String(code).trim())) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ success: false, error: 'Invalid 6-digit code format' })
            };
        }

        const trimmedCode = String(code).trim();
        let isValid = false;

        // 1. Verify via stateless HMAC token (cross-lambda safe)
        if (token && typeof token === 'string' && token.includes('.')) {
            const [tsStr, signature] = token.split('.');
            const timestamp = parseInt(tsStr, 10);
            const now = Date.now();

            if (!isNaN(timestamp) && (now - timestamp) <= (10 * 60 * 1000) && (now - timestamp) >= -30000) {
                const expectedSignature = generateHMAC(normalizedEmail, purpose, trimmedCode, timestamp);
                if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                    isValid = true;
                }
            }
        }

        // 2. Check in-memory store fallback
        if (!isValid) {
            isValid = verifyInMemory(normalizedEmail, trimmedCode, purpose);
        }

        if (isValid) {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    verified: true,
                    message: 'Verification code verified successfully',
                    email: normalizedEmail,
                    purpose
                })
            };
        }

        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                error: 'Invalid or expired verification code. Please request a new code.'
            })
        };
    }

    // -------------------------------------------------------------------------
    // ACTION: SEND VERIFICATION EMAIL (VIA BREVO API)
    // -------------------------------------------------------------------------
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        console.error('BREVO_API_KEY not configured in environment variables');
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Brevo email service not configured. Please set BREVO_API_KEY in Netlify settings.' })
        };
    }

    // Generate 6-digit code and token
    const generatedCode = generate6DigitCode();
    const timestamp = Date.now();
    const signature = generateHMAC(normalizedEmail, purpose, generatedCode, timestamp);
    const verificationToken = `${timestamp}.${signature}`;

    // Store in container memory fallback
    storeInMemory(normalizedEmail, generatedCode, purpose);

    // Prepare purpose-specific email styling and copy
    let subject = 'Illuminati Portal - Security Verification Code';
    let headline = 'Security Verification';
    let description = 'Enter this 6-digit code to authorize access to your Elite Account.';

    if (purpose === 'payment') {
        subject = 'Illuminati Portal - Payment Method Security Verification';
        headline = 'Payout Gateway Verification';
        description = 'You are linking or updating a payout gateway channel (such as CashApp, Venmo, or Bank Transfer) on the Global Ledger. Please confirm this change with the 6-digit code below:';
    } else if (purpose === 'device' || purpose === 'browser') {
        subject = 'Illuminati Portal - Unrecognized Browser Verification';
        headline = 'New Browser Detected';
        description = 'A login or access attempt was detected from an unrecognized browser or device. Enter the 6-digit authorization code below to verify your identity:';
    } else if (purpose === 'approval') {
        subject = 'Illuminati Portal - Membership Approved & Account Access Code';
        headline = 'Account Approved - Welcome';
        description = 'Your membership has been officially approved by the Secretary General. To unlock and enter your Elite Dashboard, please enter your 6-digit authorization code below:';
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { background-color: #080808; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; }
                .email-container { max-width: 580px; margin: 30px auto; background: #0f172a; border: 2px solid #d4af37; border-radius: 12px; overflow: hidden; box-shadow: 0 0 35px rgba(212, 175, 55, 0.25); }
                .header { background: linear-gradient(135deg, #0b0f19 0%, #1e293b 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.4); }
                .header h1 { color: #d4af37; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
                .header p { color: #94a3b8; margin: 8px 0 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; }
                .content { padding: 35px 30px; text-align: center; }
                .content h2 { color: #f8fafc; font-size: 20px; margin-top: 0; margin-bottom: 15px; }
                .content p { color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 25px; }
                .code-box { background: #020617; border: 2px solid #d4af37; border-radius: 10px; padding: 18px 24px; display: inline-block; margin: 15px auto 25px auto; }
                .code-text { font-size: 36px; font-weight: 800; color: #facc15; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; }
                .notice { background: rgba(212, 175, 55, 0.08); border-left: 3px solid #d4af37; padding: 12px 16px; text-align: left; margin: 25px 0 15px 0; border-radius: 4px; }
                .notice p { margin: 0; font-size: 12px; color: #94a3b8; }
                .footer { background: #080c14; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>ILLUMINATI OVERSIGHT</h1>
                    <p>Elite Account Security Verification</p>
                </div>
                <div class="content">
                    <h2>${headline}</h2>
                    <p>${description}</p>
                    <div class="code-box">
                        <div class="code-text">${generatedCode}</div>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 10px;">
                        This one-time passcode is valid for <strong>10 minutes</strong>.
                    </p>
                    <div class="notice">
                        <p><strong>SECURITY NOTICE:</strong> If you did not initiate this request or access your Elite account, please contact the Secretary General immediately.</p>
                    </div>
                </div>
                <div class="footer">
                    &copy; 2026 Illuminati Global Oversight. All rights reserved. Confidential transmission.
                </div>
            </div>
        </body>
        </html>
    `;

    const textContent = `Illuminati Portal - ${headline}\n\n${description}\n\nYOUR 6-DIGIT VERIFICATION CODE: ${generatedCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please contact support or ignore this message.`;

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || 'noreply@illuminati-portal.com';
    const senderName = 'Illuminati Portal';

    try {
        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: normalizedEmail }],
                subject,
                htmlContent,
                textContent
            })
        });

        const responseData = await brevoResponse.json().catch(() => ({}));

        if (!brevoResponse.ok) {
            console.error('Brevo API error response:', responseData);
            return {
                statusCode: brevoResponse.status,
                headers: corsHeaders,
                body: JSON.stringify({
                    error: 'Failed to send verification email via Brevo',
                    details: responseData
                })
            };
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Verification code sent successfully',
                token: verificationToken,
                expiresIn: 600,
                email: normalizedEmail,
                purpose
            })
        };
    } catch (err) {
        console.error('Network or execution error sending email:', err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to dispatch email', message: err.message })
        };
    }
};
