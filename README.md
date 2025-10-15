# 🧠 Brainrot Authenticator™

> *“Security” powered by memes and vibes.*

Brainrot Authenticator is a parody login system that verifies users using **facial meme matching** and **voice-based vibe checks**.  
Built with **React + Vite**, it blends computer-vision face landmarking with browser speech recognition to create the most useless yet technically over-engineered authentication flow imaginable.
If you dont want to set it up yourself, check out the live website: brainrotauthenticator.netlify.app

---

## 🚀 Features

- 🎭 **Face Authentication** – mimic meme expressions like *GigaChad* or *Sad Wojak* using your webcam.  
- 🎤 **Voice Vibe Check** – say a random meme phrase (“pen pineapple apple pen”, “skibidi toilet”, etc.) and get scored by speech similarity.  
- 🧩 **Browser-only ML** – runs fully client-side using `MediaPipe` face landmarks and Web Speech API (no backend).  
- 💅 **Modern UI** – Tailwind-styled responsive interface with smooth challenge transitions.  
- 📊 **Brainrot Score** – blends face + voice accuracy + speed into a single chaotic ranking.  

---

## 🧰 Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router DOM |
| **Face Detection** | MediaPipe Tasks Vision (face-landmarking) |
| **Speech Recognition** | Web Speech API |
| **Storage** | `sessionStorage` (temporary metrics) |

---

---

## 🪄 How It Works

1. **Meme Challenge** → You’re shown a meme face to imitate.  
2. **Face Detection** → Your live camera feed is compared to the meme’s target emotions.  
3. **Voice Challenge** → You repeat a random meme phrase aloud.  
4. **Vibe Scoring** → Face + voice scores + speed combine into a final *Brainrot Level*.  
5. **Success Screen** → View detailed breakdowns of your meme and voice accuracy.

---

## 🖥️ Installation & Run

> Prerequisites: Node 18+, npm or pnpm, and a camera + microphone.

```bash
# 1️⃣  Clone the repo
git clone https://github.com/IvanGiovany/brainrot-authenticator.git
cd brainrot-authenticator

# 2️⃣  Install dependencies
npm install

# 3️⃣  Run the dev server
npm run dev
```
