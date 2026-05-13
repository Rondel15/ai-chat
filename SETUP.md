# AI Chat App — Setup Guide

## Prerequisites
- Node.js v18+
- MongoDB running locally
- Free Groq API key (console.groq.com)

---

## Step 1 — Get your Groq API key
1. Go to https://console.groq.com
2. Sign up with Google
3. Click "API Keys" in the sidebar
4. Click "Create API Key"
5. Copy the key

---

## Step 2 — Set up the server

```bash
cd ai-chat/server
npm install
cp .env.example .env
```

Edit `.env` and fill in:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-chat
JWT_SECRET=any_long_random_string
GROQ_API_KEY=gsk_your_key_here
CLIENT_URL=http://localhost:5173
```

---

## Step 3 — Start MongoDB
```bash
brew services start mongodb-community
```

---

## Step 4 — Start the server
```bash
cd ai-chat/server
npm run dev
# Should see: MongoDB connected + Server running on port 5000
```

---

## Step 5 — Set up and start the client
Open a new terminal tab:
```bash
cd ai-chat/client
npm install
npm run dev
```

Open http://localhost:5173

---

## What's working

| Feature | Status |
|---|---|
| Register / Login | ✅ |
| Streaming AI responses (word by word) | ✅ |
| Full chat history saved to MongoDB | ✅ |
| Load past conversations from sidebar | ✅ |
| Delete conversations | ✅ |
| Search through chat history | ✅ |
| Custom AI personas | ✅ |
| Default persona auto-created on register | ✅ |
| Markdown rendering | ✅ |
| Code blocks with syntax highlighting | ✅ |
| Copy code button | ✅ |
| Typing indicator while AI responds | ✅ |
| Suggestion prompts on new chat | ✅ |

---

## Available AI Models (Groq - all free)
Change the model in your persona settings:
- `llama-3.1-70b-versatile` — Best overall (default)
- `llama-3.1-8b-instant` — Fastest
- `mixtral-8x7b-32768` — Good for long context
- `gemma2-9b-it` — Google's model

---

## Next features to build
1. Persona creator UI (form to create/edit custom personas)
2. Regenerate last response button
3. Export conversation as markdown
4. Token usage counter
5. Temperature / creativity slider
6. Image input (when Groq adds vision support)
