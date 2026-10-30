// Simple in-memory code storage (must match send-otp.js storage)
const otpStore = new Map();

// These functions must match the implementation in send-otp.js
// In production, use a shared database instead
function getOTP(email, purpose = 'login') {
    const stored = otpStore.get(`${email}_${purpose}`);
    if (!stored) return null;

    if (stored.expiresAt < Date.now()) {
        otpStore.delete(`${email}_${purpose}`);
        return null;
    }

    return stored;
}

function incrementAttempts(email, purpose = 'login') {
    const stored = otpStore.get(`${email}_${purpose}`);
    if (stored) {
        stored.attempts++;
        if (stored.attempts >= 3) {
            otpStore.delete(`${email}_${purpose}`);
            return false; // Too many attempts
        }
    }
    return true;
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
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { email, code, purpose = 'login' } = body;

    if (!email || !code) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Email and code are required' }) };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email address' }) };
    }

    if (!/^\d{6}$/.test(code)) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid code format' }) };
    }

    const stored = getOTP(email, purpose);

    if (!stored) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Code expired or not found. Please request a new code.' })
        };
    }

    if (stored.code !== code) {
        const canContinue = incrementAttempts(email, purpose);
        if (!canContinue) {
            return {
                statusCode: 429,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Too many failed attempts. Please request a new code.' })
            };
        }
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid code. Please try again.' })
        };
    }

    // Code is valid - remove it to prevent reuse
    otpStore.delete(`${email}_${purpose}`);

    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
            success: true,
            message: 'Code verified successfully'
        })
    };
};
