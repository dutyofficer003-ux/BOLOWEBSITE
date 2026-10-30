# OTP Verification System Setup Guide

## Overview
This system implements a secure 6-digit email verification using Brevo API for:
1. **Login verification** - Required before accessing the portal
2. **Payment method connection** - Required when adding bank accounts or mobile money
3. **New device verification** - Required when logging in from unrecognized devices

## Security Note
⚠️ **IMPORTANT:** For security reasons, the actual API key you provided has NOT been included in any code files. You must add it securely to your environment configuration yourself.

## Setup Instructions

### 1. Add Brevo API Key to Environment

**For Netlify:**
1. Go to your Netlify dashboard
2. Navigate to Site Settings → Environment Variables
3. Add a new variable:
   - Key: `BREVO_API_KEY`
   - Value: Your actual Brevo API key (the one starting with `xkeysib-...`)

**For Local Development:**
1. Copy `.env.example` to `.env`
2. Add your API key:
   ```
   BREVO_API_KEY=your_actual_api_key_here
   ```

### 2. Deploy Netlify Functions

The following serverless functions are included in `netlify/functions/`:
- `send-otp.js` - Generates and sends 6-digit codes via Brevo
- `verify-otp.js` - Verifies submitted codes

These will be automatically deployed by Netlify.

### 3. Include Frontend Script

Add this to your HTML pages (membership.html, elite-dashboard.html, etc.):

```html
<script src="otp-verification.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

## Integration Examples

### Example 1: Login Verification (membership.html)

```javascript
// When user submits email for login
function handleLogin(email) {
    // Trigger OTP verification
    window.OTPVerification.show(
        email,                          // User's email
        'login',                        // Purpose
        () => {                         // Success callback
            // Code verified - proceed with login
            localStorage.setItem('userEmail', email);
            localStorage.setItem('verified', 'true');
            window.location.href = 'elite-dashboard.html';
        },
        (error) => {                    // Failure callback
            console.error('Verification failed:', error);
            alert('Verification failed. Please try again.');
        }
    );
}
```

### Example 2: Payment Method Verification (elite-dashboard.html)

```javascript
// When user clicks to connect payment method
function connectPaymentMethod(paymentType, accountDetails) {
    const userEmail = localStorage.getItem('userEmail');

    // Trigger OTP verification
    window.OTPVerification.show(
        userEmail,
        'payment',
        () => {
            // Code verified - save payment method
            savePaymentMethodToDatabase(paymentType, accountDetails);
            alert('Payment method connected successfully!');
        },
        (error) => {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please try again.');
        }
    );
}
```

### Example 3: New Device Verification

```javascript
// Check if device is recognized
function checkDeviceRecognition() {
    const currentDeviceId = getDeviceFingerprint();
    const recognizedDevices = JSON.parse(localStorage.getItem('recognizedDevices') || '[]');

    if (!recognizedDevices.includes(currentDeviceId)) {
        // New device detected - require verification
        const userEmail = localStorage.getItem('userEmail');

        window.OTPVerification.show(
            userEmail,
            'device',
            () => {
                // Device verified - add to recognized devices
                recognizedDevices.push(currentDeviceId);
                localStorage.setItem('recognizedDevices', JSON.stringify(recognizedDevices));
                // Proceed with login
            },
            (error) => {
                console.error('Device verification failed:', error);
                window.location.href = 'account-gate.html';
            }
        );
    }
}
```

## Features

### Security Features
- ✅ 6-digit random codes (100000-999999)
- ✅ 10-minute code expiration
- ✅ Maximum 3 verification attempts per code
- ✅ Rate limiting on resend (60-second cooldown)
- ✅ Purpose-specific email templates
- ✅ In-memory storage with automatic cleanup

### UI Features
- ✅ Clean, responsive modal design
- ✅ Auto-advance input fields
- ✅ Paste support (paste 6 digits at once)
- ✅ Real-time error feedback
- ✅ Success animation
- ✅ Resend code with countdown timer
- ✅ Golden Illuminati-themed styling

### Email Templates
Each purpose has a custom email template:
- **Login**: Illuminati Portal Access
- **Payment**: Payment Method Verification
- **Device**: New Device Detected

## API Endpoints

### Send OTP
```
POST /.netlify/functions/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "login" | "payment" | "device"
}

Response:
{
  "success": true,
  "message": "Verification code sent successfully",
  "expiresIn": 600
}
```

### Verify OTP
```
POST /.netlify/functions/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "purpose": "login" | "payment" | "device"
}

Response:
{
  "success": true,
  "message": "Code verified successfully"
}
```

## Testing

### Local Testing
1. Set up local Netlify functions server:
   ```bash
   netlify functions:serve
   ```

2. Add your Brevo API key to `.env`

3. Test the frontend by loading your HTML pages

### Production Testing
1. Deploy to Netlify
2. Add environment variable in Netlify dashboard
3. Test with real email addresses

## Important Notes

⚠️ **Production Considerations:**
- The current implementation uses in-memory storage for OTP codes
- For production, replace with a database (Redis, MongoDB, etc.) with TTL
- The `send-otp.js` and `verify-otp.js` share the same in-memory store which works for Netlify
- For multiple server instances, use a shared storage solution

⚠️ **Security Best Practices:**
- Never commit actual API keys to version control
- Use environment variables for all sensitive data
- Implement rate limiting at the API level
- Log all verification attempts for security auditing
- Consider adding IP-based rate limiting

⚠️ **Brevo Configuration:**
- Ensure your Brevo account has transactional email enabled
- Verify your sender email/domain in Brevo dashboard
- Check Brevo API rate limits (free tier: 300 emails/day)

## Troubleshooting

### Code not sending
- Check Brevo API key is correct in environment variables
- Verify Brevo account has email sending enabled
- Check Netlify function logs for errors

### Code verification failing
- Ensure email matches between send and verify
- Check code hasn't expired (10-minute window)
- Verify user hasn't exceeded 3 attempts
- Check purpose matches between send and verify

### Modal not showing
- Ensure `otp-verification.js` is loaded
- Check Font Awesome is included for icons
- Verify no JavaScript errors in console

## Support

For issues with:
- **Brevo API**: Check Brevo documentation at https://developers.brevo.com/
- **Netlify Functions**: Check Netlify documentation at https://docs.netlify.com/functions/
- **Integration**: Review the examples in this guide
