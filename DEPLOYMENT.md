# Campus Companion: Production Deployment Guide

This guide details the architectural approach for launching the Campus Companion platform into a production environment.

## 1. Environment Topology

### Frontend Hosting (Vercel or Netlify)
The React/Vite client application compiles to static HTML/CSS/JS. It should be offloaded to a global CDN like Vercel. 
**Required Steps:**
1. Connect GitHub Repo to Vercel.
2. Set Root Directory to `client/`.
3. Set Build Command: `npm run build`.
4. Set Output Directory: `dist/`.
5. **Environment Variable**: `VITE_API_URL` => `https://api.campuscompanion.com` (Your backend production URL).

### Backend Hosting (Render or Railway)
Node.js/Express requires a persistent runtime, and Socket.io needs WebSocket support. Render or Railway are perfect PaaS choices.
**Required Steps:**
1. Connect GitHub Repo to Render.
2. Select "Web Service".
3. Set Root Directory to `server/`.
4. Build Command: `npm install`.
5. Start Command: `npm start`.

### Database (MongoDB Atlas)
Use MongoDB Atlas for secure cluster management.
**Required Steps:**
1. Create a free/dedicated cluster on MongoDB Atlas.
2. Whitelist your Backend Server's IP address (or `0.0.0.0/0` if relying entirely on strong credentials).
3. Secure the `MONGO_URI`.

---

## 2. Environment Variables Checklist (Server)

You **must** supply these securely in your hosting provider's dashboard (e.g. Render Dashboard -> Environment variables), NEVER in code.

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://campuscompanion.vercel.app  # Important for CORS to allow frontend calls
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusdb
JWT_SECRET=production_randomly_generated_string_128_bits
JWT_REFRESH_SECRET=production_randomly_generated_refresh_string_128_bits
OPENAI_API_KEY=sk-proj-... # For AI integrations
```

---

## 3. Architecture Overview (Production)

```ascii
 [ User Browser ] -- HTTPS --> [ Vercel CDNEdge ] -.
                                                   |
                                            React Frontend App
                                                   |
                                        Axios (REST) & Socket.io
                                                   |
                                                   v
                                   [ Render / Railway Node.js App ]
                                   (Load Balancers & WebSockets)
                                     /             |              \
                                    /              |               \
                   OpenAI Cloud API      JSON Web Tokens        MongoDB Atlas Cluster
                   (GPT-4o / AI)        (Stateless Auth)        (Data Storage & Vector matching)
```

## 4. Continuous Integration / Deployment (CI/CD)
The repository contains a `.github/workflows/ci.yml` file.
Currently, every `push` to the `main` branch triggers:
1. A fresh build of the frontend via Vite to verify it compiles.
2. A dependencies installation sweep on the server to prevent broken dependency deployments.

Once code passes these checks, Render and Vercel will automatically pull the updated main branch and redeploy!
