import { useEffect, useRef, useState } from "react";

// Phrases (words-only check). Changed "rizz god mode" → "67".
const PHRASES = [
  { text: "pen pineapple apple pen" },
  { text: "skibidi toilet" },
  { text: "bing chilling" },
  { text: "67" },                 // ✅ new phrase
  { text: "sneaky golem in the pocket" },
];

// How long we listen for speech (ms)
const SR_MS = 7000;

// How close the transcript must be to the expected phrase (0..1)
const PHRASE_THRESHOLD = 0.75;

export default function VoiceAuth({ onPass }) {
  const [prompt, setPrompt] = useState(() => PHRASES[(Math.random() * PHRASES.length) | 0]);
  const [phase, setPhase] = useState("idle"); // idle | sr | result
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null); // { pass, phraseScore, transcript }
  const recogRef = useRef(null);
  const transcriptRef = useRef("");
  const startedAtRef = useRef(0);

  useEffect(() => () => stopSR(), []);

  function stopSR() {
    try { recogRef.current?.abort?.(); } catch {}
    recogRef.current = null;
  }

  function reset() {
    stopSR();
    setErr("");
    setResult(null);
    transcriptRef.current = "";
    setPrompt(PHRASES[(Math.random() * PHRASES.length) | 0]);
    setPhase("idle");
  }

  async function start() {
    setErr("");
    setResult(null);
    transcriptRef.current = "";
    stopSR();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErr("Speech recognition not available in this browser. Try Chrome on HTTPS.");
      return;
    }

    setPhase("sr");
    startedAtRef.current = performance.now();
    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;      // keep listening during window
    r.interimResults = true;  // capture partials too
    r.maxAlternatives = 1;

    r.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      if (last && last[0]) {
        transcriptRef.current = (last[0].transcript || "").trim();
      }
    };
    r.onerror = (e) => {
      console.warn("SpeechRecognition error:", e.error);
      // We'll still evaluate whatever we captured.
    };
    r.onend = () => {
      // If it stops early, we'll just score whatever we heard.
    };

    try { r.start(); recogRef.current = r; } catch (e) {
      console.warn("SR start failed:", e);
    }

    setTimeout(() => finish(), SR_MS);
  }

  function finish() {
    stopSR();
    const expected = normalizeForMatch(prompt.text);
    const heard = normalizeForMatch(transcriptRef.current);
    const phraseScore = stringSimilarity(expected, heard);
    const pass = phraseScore >= PHRASE_THRESHOLD;
    const totalMs = Math.max(0, performance.now() - startedAtRef.current);
    sessionStorage.setItem("brainrot.voice", JSON.stringify({
        phrase: prompt.text,
        phraseScore,
        heard: transcriptRef.current || "",
        ms: Math.round(totalMs),
        at: Date.now()
     }));
    setResult({
      pass,
      phraseScore,
      transcript: transcriptRef.current || "(no speech detected)",
    });
    setPhase("result");
    if (pass) onPass?.();
  }

  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Voice Vibe Check</h3>
        <button
          onClick={phase === "sr" ? undefined : start}
          className={`rounded-lg px-3 py-1 text-sm font-semibold text-white ${
            phase === "sr" ? "bg-zinc-700 cursor-not-allowed" : "bg-fuchsia-500 hover:bg-fuchsia-400"
          }`}
        >
          {phase === "sr" ? "Listening…" : "Start"}
        </button>
      </div>

      <p className="mt-1 text-zinc-400">
        Say exactly:&nbsp;
        <span className="text-zinc-200 font-semibold">“{prompt.text}”</span>
      </p>

      {err && <div className="mt-2 text-sm text-red-400">{err}</div>}

      {phase === "sr" && (
        <div className="mt-2 text-xs text-zinc-500">
          Listening for ~{Math.round(SR_MS / 1000)}s… speak clearly.
        </div>
      )}

      {result && (
        <div className="mt-3 text-sm">
          <div className={result.pass ? "text-emerald-400" : "text-red-400"}>
            {result.pass ? "Voice verified ✅" : "Try again ❌"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            phrase {(result.phraseScore * 100).toFixed(0)}% · heard “{result.transcript}”
          </div>

          {!result.pass && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={start}
                className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-900"
              >
                Try again
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-zinc-800 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-900"
              >
                New phrase
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========== matching helpers (words-only) ========== */
function normalizeForMatch(s) {
  // Lowercase, strip punctuation, squeeze spaces
  let t = (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize common hyphen variants (e.g., “sixty-seven”)
  t = t.replace(/-/g, " ");

  // Normalize number words ↔ digits for "67" cases
  t = normalizeNumbers(t); // converts either form toward a common representation

  return t;
}

function normalizeNumbers(s) {
  // Handle “67”, “sixty seven”, “sixty-seven” → "sixty seven"
  // Add any other numbers you end up using.
  return s
    .replace(/\b67\b/g, "sixty seven")
    .replace(/\bsixty\s*seven\b/g, "sixty seven");
}

function stringSimilarity(a, b) {
  if (!a && !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return 1 - dist / maxLen;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[n];
}
