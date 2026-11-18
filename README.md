# Scholaris

An AI study assistant. Students upload their study material as PDFs and ask questions about it; answers come only from their own material, with page citations.

**Stack:** React + Vite client with Firebase sign-in · Express API · MongoDB Atlas Vector Search · Google Gemini (embeddings and answers) via LangChain.

## How it works

1. **Upload:** the PDF is saved on the server and linked to a learning session owned by the signed-in user.
2. **Extract:** text is read page by page. If a PDF looks scanned (almost no text), each page is rendered and read with OCR (MuPDF + Tesseract).
3. **Chunk and embed:** pages are split into 1,000-character chunks with 150 characters of overlap, embedded with Gemini, and stored in MongoDB with their session ID and page number.
4. **Answer:** a question retrieves the 5 most similar chunks *from that session only*. Gemini answers using only those excerpts, cites them as [1], [2]…, and says so when the material doesn't cover the question.

## Security

- Every API route requires a Firebase ID token (`Authorization: Bearer <token>`); the server takes the user's identity from the verified token, never from the request.
- Sessions can only be read or queried by the user who created them.
- The server finds an uploaded file from the session record, never from a file name sent by the client, and only accepts PDFs up to `MAX_UPLOAD_MB`.
- Secrets live in `server/.env`, which is git-ignored. See `server/.env.example`.

## Setup

### 1. MongoDB Atlas

Create a cluster and an Atlas Vector Search index named `vector_index` on the `rags` collection, using `server/atlas-vector-index.json`. The `learningSessionId` filter field is required: it keeps each session's search separate.

### 2. Server

```bash
cd server
cp .env.example .env      # then fill in MONGO_URI, GOOGLE_API_KEY, FIREBASE_PROJECT_ID
npm install
npm run dev               # or: npm start
npm test                  # unit tests; no database or API keys needed
```

### 3. Client

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Set `VITE_API_URL` in `client/.env` if the API isn't at `http://localhost:5000`. The Firebase web config in `client/src/firebase.js` is public by design; access is protected by token verification on the server.

## Possible next steps

- Process uploads in a background job queue instead of during the request.
- Hybrid search (keyword + vector) with reranking, and an evaluation set to tune chunk size and top-k.
- A practice-question generator for the "Attempt Questions" mode.
