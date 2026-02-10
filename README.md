# Eunoia
This is a minimal full-stack demo:
- `public/index.html` – your landing page with an embedded chat widget
- `server.js` – Express backend that calls the OpenAI Responses API

## 1) Install
```bash
cd eunoia_b2_responses_demo
npm install
```

## 2) Configure
```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY
```

## 3) Run
```bash
npm run dev
```

Then open:
http://localhost:3000

## Notes
- Keep your API key server-side. Do NOT put it in the browser.
- The chat uses `previous_response_id` to maintain multi-turn context.
- For production, restrict CORS_ORIGIN and consider stronger auth/rate limits.
