# membership-page

## ALLADIN chat deployment

The browser must call a running backend. A custom domain that only serves HTML, CSS, and JavaScript cannot run `server.js` or safely contain `GEMINI_API_KEY` by itself.

Use one of these production setups:

1. Host this Node app on a backend service and proxy `https://your-domain.com/api/chat` to that service. This keeps the frontend URL unchanged.
2. Host the backend at a separate HTTPS URL and configure the frontend before `alladin-engine.js`:

```html
<script>
	window.ALLADIN_API_URL = 'https://api.your-domain.com';
</script>
<script src="alladin-engine.js"></script>
```

The value must be the API origin only. The chat code adds `/api/chat` automatically. The backend must allow `POST` and `OPTIONS` requests from the website origin, and `GEMINI_API_KEY` must be set only as a backend environment variable.

For local testing, run `npm start` and open `http://localhost:3000/alladin.html`. For Netlify, keep the included `netlify.toml` redirect and set `GEMINI_API_KEY` in Netlify environment variables.

The deployed Netlify site does not depend on the laptop running: Netlify hosts `/.netlify/functions/chat` and the redirect exposes it as `/api/chat`. If the key or Gemini service is unavailable, Alladin now responds from the portal knowledge base in the browser instead of showing a connection error. Do not configure `ALLADIN_API_URL` to `localhost` for the deployed site.

