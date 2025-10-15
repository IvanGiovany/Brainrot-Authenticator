import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FaceAuth from "./FaceAuth.jsx";
import MemeCard from "./components/MemeCard.jsx";
import VoiceAuth from "./VoiceAuth.jsx";       // ✅ import voice screen
import { randomMeme } from "./data/memes.js";

function Layout({ children }) {
  return (
    <div className="min-h-dvh bg-black text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-extrabold tracking-tight text-fuchsia-400">
            Brainrot
          </Link>
          <nav className="text-sm text-zinc-400">
            <Link to="/" className="hover:text-zinc-200">Home</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-md px-4 py-8 text-xs text-zinc-500">
        © 2025 Brainrot Authenticator — “security” by memes.
      </footer>
    </div>
  );
}

function Home() {
  const nav = useNavigate();
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
        <h1 className="text-3xl font-extrabold text-fuchsia-400">Brainrot Authenticator™</h1>
        <p className="mt-2 text-zinc-400">
          Log in by matching <span className="text-zinc-200">meme faces</span> and passing a vibe check.
          Absolutely useless. Technically brilliant.
        </p>
        <button
          onClick={() => nav("/auth")}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold text-white hover:bg-fuchsia-400 active:scale-[0.99]"
        >
          Sign in with Brainrot
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["Trollface", "GigaChad", "Sad Wojak"].map((m) => (
          <div key={m} className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-3 text-center">
            <div className="text-sm text-zinc-300">{m}</div>
            <div className="mt-1 text-[10px] text-zinc-500">challenge</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
        <h2 className="text-xl font-bold">How it “works”</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-zinc-400">
          <li>We show you a meme face to mimic.</li>
          <li>Then you pass a voice vibe check.</li>
          <li>If you pass, you’re in. If not… NPC detected.</li>
        </ol>
      </div>
    </div>
  );
}

function AuthPlaceholder() {
  const nav = useNavigate();
  const [score, setScore] = useState(0);
  const [challenge, setChallenge] = useState(() => randomMeme());

  // --- pass stability config ---
  const PASS = 0.75;   // score threshold
  const HOLD_MS = 900; // how long score must stay >= PASS
  const [stableSince, setStableSince] = useState(0);
  const [startedAt, setStartedAt] = useState(performance.now());
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const now = performance.now();
    if (score >= PASS) {
      if (!stableSince) setStableSince(now);
    } else {
      if (stableSince) setStableSince(0);
    }
  }, [score]);

  useEffect(() => {
    setStableSince(0);
    setScore(0);
  }, [challenge?.id]);

  const passed = stableSince && (performance.now() - stableSince) > HOLD_MS;
  const holdPct = stableSince ? Math.min(1, (performance.now() - stableSince) / HOLD_MS) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Authenticator</h2>
          <button
            onClick={() => {
              setChallenge(randomMeme());
              setStableSince(0);
              setScore(0);
              setStartedAt(performance.now());
              setClicked(false);
            }}
            className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            New meme
          </button>
        </div>
        <p className="mt-1 text-zinc-400">Mimic the meme to pass.</p>

        <div className="mt-3">
          <MemeCard meme={challenge} />
        </div>

        <div className="mt-3">
          <FaceAuth template={challenge} onScore={setScore} />
        </div>

        <div className="mt-3 flex items-center justify-between relative">
          <span className="text-sm text-zinc-400">
            Score: {(score * 100 | 0)}%
            {score >= PASS && !passed && (
              <span className="ml-2 text-emerald-400">
                holding… {(holdPct * 100 | 0)}%
              </span>
            )}
          </span>

          {score >= PASS && !passed && (
            <div className="absolute left-0 right-0 -bottom-2 h-1 rounded bg-zinc-800">
              <div className="h-1 rounded bg-emerald-500" style={{ width: `${holdPct * 100}%` }} />
            </div>
          )}

          <div className="flex gap-3">
            <button
              disabled={!passed || clicked}
              onClick={() => {
                if (clicked) return;
                setClicked(true);
                const faceMs = Math.max(0, performance.now() - startedAt);
                sessionStorage.setItem("brainrot.face", JSON.stringify({
                  score,
                  ms: Math.round(faceMs),
                  meme: challenge?.id || null,
                  at: Date.now()
                }));
                nav("/voice");
              }}       
              className={`rounded-xl px-4 py-2 font-semibold text-white ${
                passed ? "bg-emerald-500 hover:bg-emerald-400" : "bg-zinc-700 cursor-not-allowed"
              }`}
            >
              Pass
            </button>
            <button
              onClick={() => nav("/")}
              className="rounded-xl border border-zinc-800 px-4 py-2 font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoicePage() {
  const nav = useNavigate();
  return (
    <div className="space-y-4">
      <VoiceAuth onPass={() => nav("/success")} />
      <button
        onClick={() => nav("/")}
        className="rounded-xl border border-zinc-800 px-4 py-2 text-zinc-200 hover:bg-zinc-900"
      >
        Cancel
      </button>
    </div>
  );
}

function Success() {
  const nav = useNavigate();

  // Read stored stats (with safe defaults)
  const face = (() => {
    try { return JSON.parse(sessionStorage.getItem("brainrot.face") || "{}"); } catch { return {}; }
  })();
  const voice = (() => {
    try { return JSON.parse(sessionStorage.getItem("brainrot.voice") || "{}"); } catch { return {}; }
  })();

  const faceScore = clamp01(face.score ?? 0);     // 0..1
  const voiceScore = clamp01(voice.phraseScore ?? 0);

  // Speed bonus based on total time (face + voice)
  const totalMs = (face.ms ?? 0) + (voice.ms ?? 0);
  // ≤ 8s: +10 pts, 8–15s: +5 pts, >15s: +0
  const speedBonus = totalMs <= 8000 ? 10 : totalMs <= 15000 ? 5 : 0;

  // Blend: face 55%, voice 45%, then add bonus
  let level = Math.round(clamp01(0.55*faceScore + 0.45*voiceScore) * 100 + speedBonus);
  if (Number.isNaN(level)) level = 0;
  level = Math.max(0, Math.min(100, level));

  // Tier text
  const tier =
    level < 50 ? "are you sure you aint a bot" :
    level < 70 ? "mid ladder" :
                 "10k trophies ah";

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5 space-y-3">
      <h2 className="text-2xl font-bold">Logged in ✅</h2>

      {/* Level meter */}
      <div>
        <div className="flex items-baseline gap-2">
          <div className="text-zinc-400">Brainrot Level:</div>
          <div className="text-3xl font-extrabold text-fuchsia-300">{level}%</div>
        </div>
        <div className="mt-2 h-2 rounded bg-zinc-800 overflow-hidden">
          <div
            className={`h-2 ${level<50 ? "bg-red-500" : level<70 ? "bg-yellow-400" : "bg-emerald-500"}`}
            style={{ width: `${level}%` }}
          />
        </div>
        <div className="mt-1 text-sm text-zinc-400 italic">“{tier}”</div>
      </div>

      {/* Debug/details (nice for judges) */}
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-zinc-500">
        <div className="rounded-lg border border-zinc-900 p-3">
          <div className="font-semibold text-zinc-300">Face match</div>
          <div>score: {(faceScore*100|0)}% {face.meme ? `· meme: ${face.meme}` : ""}</div>
          <div>time: {face.ms ? `${face.ms} ms` : "—"}</div>
        </div>
        <div className="rounded-lg border border-zinc-900 p-3">
          <div className="font-semibold text-zinc-300">Voice phrase</div>
          <div>phrase: “{voice.phrase || "—"}”</div>
          <div>heard: “{(voice.heard || "—") }”</div>
          <div>accuracy: {(voiceScore*100|0)}%</div>
          <div>time: {voice.ms ? `${voice.ms} ms` : "—"}</div>
        </div>
      </div>

      <button
        onClick={() => nav("/")}
        className="mt-4 rounded-xl bg-fuchsia-500 px-4 py-2 font-semibold text-white hover:bg-fuchsia-400"
      >
        Back Home
      </button>
    </div>
  );
}

function clamp01(x){ return Math.max(0, Math.min(1, Number(x) || 0)); }

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPlaceholder />} />
          <Route path="/voice" element={<VoicePage />} />  {/* ✅ add route here */}
          <Route path="/success" element={<Success />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
