# Maelekezo ya Kuunganisha na Render (https://dashboard.render.com/)

Mradi huu wa **Zenia** umeandaliwa kikamilifu kuwa tayari kurushwa moja kwa moja kwenye **Render** kama **Web Service** (Full-Stack Express + React) au kama **Static Site**.

---

## Njia ya 1: Kurusha kama Web Service (Inayopendekezwa - Full App na AI API)

Kwa kuwa mradi una backend ya Express (`server.ts`) inayohudumia React frontend na API za AI:

1. **Pakia mradi wako kwenye GitHub**:
   - Weka msimbo (files) zote za mradi huu kwenye repository ya GitHub (mfano `github.com/jina-lako/zenia-app`).

2. **Ingia kwenye Render Dashboard**:
   - Fungua [https://dashboard.render.com/](https://dashboard.render.com/)
   - Bonyeza kitufe cha **"New +"** (juu kulia).
   - Chagua **"Web Service"**.

3. **Unganisha na GitHub**:
   - Chagua repository yako ya GitHub.

4. **Mipangilio ya Huduma (Configuration)**:
   - **Name**: `zenia-superapp`
   - **Region**: Chagua iliyo karibu (mfano: *Frankfurt* au *Oregon*)
   - **Branch**: `main`
   - **Root Directory**: Acha wazi (default)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Environment Variables (Vigezo vya Mazingira)**:
   Kwenye sehemu ya *Environment Variables*, ongeza:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *(Weka Gemini API Key yako kwa ajili ya AI Assistant)*

6. Bonyeza **"Create Web Service"**.
   - Render itapakua packages, itajenga build ya Vite (`npm run build`), na kisha itawasha server (`npm start`).
   - Baada ya dakika chache utapata link yako ya bure ya moja kwa moja (mfano `https://zenia-superapp.onrender.com`).

---

## Njia ya 2: Kutumia Render Blueprint (`render.yaml`)
Mradi huu tayari una faili la `render.yaml` kwenye root directory.
1. Kwenye Render Dashboard, bonyeza **"New +"** -> **"Blueprint"**.
2. Unganisha repository yako ya GitHub.
3. Render itasoma `render.yaml` na kusanidi kila kitu kiotomatiki!

---

## Njia ya 3: Static Site (Frontend Pekee)
Kama unataka kupangisha sehemu ya mbele (UI pekee bila Express):
- Chagua **"New +"** -> **"Static Site"**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- Chini ya **Redirects/Rewrites**, ongeza:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`
