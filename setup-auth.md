# Elite Account JWT Authentication System

## Overview
This authentication system provides secure JWT-based authentication with persistent sessions and email-based device switching for the Elite Account dashboard.

## Features
- ✅ JWT token authentication with refresh tokens
- ✅ Persistent sessions across browser restarts
- ✅ Email-based device switching access links
- ✅ Automatic token refresh
- ✅ Secure logout and token invalidation
- ✅ Integration with existing Elite Account dashboard

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:

```env
# JWT Secrets (change these in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Email Configuration (for access links)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Port
PORT=3000
```

### 3. Configure Gmail for Email Access Links
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Elite Account"
3. Use the app password in the `EMAIL_PASS` environment variable

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

## How It Works

### Authentication Flow
1. **Direct Login**: User enters full name and email → JWT tokens generated → Dashboard access
2. **Email Access Link**: User enters email → Secure link sent → Click link → Auto-login
3. **Persistent Session**: Tokens stored in localStorage → Auto-refresh on page load

### Token System
- **Access Token**: 15-minute expiry, used for API calls
- **Refresh Token**: 7-day expiry, used to generate new access tokens
- **Email Link Token**: 15-minute expiry, one-time use for device switching

### Security Features
- Automatic token refresh before expiry
- Secure token storage in localStorage
- Token invalidation on logout
- Email links expire after 15 minutes
- CORS protection
- Rate limiting (recommended for production)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and full name
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens
- `POST /api/auth/send-link` - Send email access link
- `GET /access?token=<token>` - Access via email link

### Protected
- `GET /api/user/profile` - Get user profile (requires JWT)

## Integration with Existing System

### Elite Dashboard Updates
- Added `auth-client.js` for JWT handling
- Updated authentication check to use JWT instead of localStorage
- Dashboard loads data based on JWT user email

### Account Gate Updates
- Added JWT login form
- Added email access link functionality
- Maintains backward compatibility with existing checks

### Membership Form Integration
The membership form still works as before, but now users can:
1. Submit membership application → Get approved → Use JWT authentication
2. Access dashboard across devices with email links
3. Stay logged in across browser restarts

## Testing

### Test JWT Authentication
1. Start the server: `npm run dev`
2. Go to `http://localhost:3000/account-gate.html`
3. Enter full name and email → Click "Access Elite Account"
4. Should redirect to dashboard with JWT authentication

### Test Email Access Links
1. Go to account gate → Enter email → Click "Send Access Link"
2. Check email for access link
3. Click link → Should auto-login to dashboard

### Test Persistent Sessions
1. Login successfully
2. Close browser/restart
3. Go back to dashboard → Should auto-authenticate

## Production Considerations

### Security
- Change JWT secrets in production
- Use HTTPS in production
- Implement rate limiting
- Add IP-based restrictions
- Monitor for suspicious activity

### Database
- Replace in-memory storage with proper database
- Add user registration/approval workflow
- Implement proper user management

### Email Service
- Consider using transactional email service (SendGrid, Mailgun)
- Add email templates and branding
- Implement email analytics

## Troubleshooting

### Common Issues
1. **Email not sending**: Check Gmail app password configuration
2. **Token not refreshing**: Check JWT secrets match
3. **Access denied**: Check user approval status in Firestore
4. **CORS errors**: Ensure frontend is making requests to correct port

### Debug Mode
Enable console logging in browser to see JWT authentication flow:
```javascript
// In browser console
localStorage.getItem('elite_access_token')
localStorage.getItem('elite_refresh_token')
localStorage.getItem('elite_user')
```

## File Structure
```
membership-page/
├── server.js              # Node.js authentication server
├── package.json           # Dependencies and scripts
├── auth-client.js         # Frontend JWT client
├── elite-dashboard.html   # Updated with JWT auth
├── account-gate.html      # Updated with JWT login
├── membership.html        # Existing membership form
└── setup-auth.md          # This documentation
```

## Next Steps
1. Test the authentication system thoroughly
2. Configure production environment variables
3. Set up proper database integration
4. Add monitoring and analytics
5. Implement additional security measures
