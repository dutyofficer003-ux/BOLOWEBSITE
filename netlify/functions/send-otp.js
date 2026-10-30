const crypto = require('crypto');

// Simple in-memory code storage (for production, use a database with TTL)
const otpStore = new Map();

// Store codes with 10-minute expiration
function storeOTP(email, code, purpose = 'login') {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(`${email}_${purpose}`, {
        code,
        expiresAt,
        attempts: 0
    });

    // Clean up expired codes periodically
    if (otpStore.size > 1000) {
        const now = Date.now();
        for (const [key, value] of otpStore.entries()) {
            if (value.expiresAt < now) {
                otpStore.delete(key);
            }
        }
    }
}

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

function generate6DigitCode() {
    return crypto.randomInt(100000, 999999).toString();
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

    const { email, purpose = 'login' } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid email address' }) };
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        console.error('BREVO_API_KEY not configured');
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Email service not configured' })
        };
    }

    // Generate 6-digit code
    const code = generate6DigitCode();
    storeOTP(email, code, purpose);

    // Prepare email content based on purpose
    let subject, htmlContent, textContent;

    switch (purpose) {
        case 'login':
            subject = 'Illuminati Portal - Login Verification Code';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">Illuminati Portal Access</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #1a1a1a; color: #d4af37; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you did not request this code, please ignore this email.</p>
                </div>
            `;
            textContent = `Your Illuminati Portal verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.`;
            break;

        case 'payment':
            subject = 'Illuminati Portal - Payment Verification Code';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">Payment Method Verification</h2>
                    <p>You are connecting a payment method to your elite account.</p>
                    <p>Your verification code is:</p>
                    <div style="background: #1a1a1a; color: #d4af37; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you did not initiate this action, please contact support immediately.</p>
                </div>
            `;
            textContent = `You are connecting a payment method to your elite account.\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not initiate this action, please contact support immediately.`;
            break;

        case 'device':
            subject = 'Illuminati Portal - New Device Verification';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">New Device Detected</h2>
                    <p>We detected a login attempt from a new device or location.</p>
                    <p>Your verification code is:</p>
                    <div style="background: #1a1a1a; color: #d4af37; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px;">If you did not attempt to log in from a new device, please secure your account immediately.</p>
                </div>
            `;
            textContent = `We detected a login attempt from a new device or location.\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not attempt to log in from a new device, please secure your account immediately.`;
            break;

        default:
            subject = 'Illuminati Portal - Verification Code';
            htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">Verification Code</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #1a1a1a; color: #d4af37; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `;
            textContent = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
    }

    // Send email via Brevo API
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: 'Illuminati Portal',
                    email: 'noreply@illuminati-portal.com'
                },
                to: [{ email }],
                subject,
                htmlContent,
                textContent
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', responseData);
            return {
                statusCode: response.status,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Failed to send email', details: responseData })
            };
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                message: 'Verification code sent successfully',
                expiresIn: 600 // 10 minutes in seconds
            })
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to send email', message: error.message })
        };
    }
};
