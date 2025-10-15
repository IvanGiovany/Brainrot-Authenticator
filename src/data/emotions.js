// src/data/emotions.js
export const memeEmotionTargets = {
  gigachad: {
    target: {
      happiness: { target: 0.70, w: 1.0 },
      surprise:  { target: 0.15, w: 0.3 },
      anger:     { target: 0.10, w: 0.2 },
      sadness:   { target: 0.10, w: 0.2 },
      smirkAsym: { target: 0.40, w: 0.7 }, // encourage asymmetric smile
    },
    gates: {
      happinessMin: 0.45,
      smirkAsymMin: 0.20,
    }
  },

  pepe: {
    target: {
      sadness:   { target: 0.65, w: 1.0 }, // was 0.75 → a bit easier
      happiness: { target: 0.15, w: 0.6 }, // allow some neutral
      surprise:  { target: 0.10, w: 0.2 },
      anger:     { target: 0.15, w: 0.2 },
    },
    gates: {
      sadnessMin: 0.25,      // was 0.55 → easier to pass with “somewhat sad”
      happinessMax: 0.45,    // allow more neutral without blocking
    }
  },

  pikachu: {
    target: {
      surprise:  { target: 0.80, w: 1.0 },
      happiness: { target: 0.25, w: 0.3 },
      anger:     { target: 0.10, w: 0.2 },
      sadness:   { target: 0.10, w: 0.2 },
    },
    gates: {
      surpriseMin: 0.55,
    }
  },

  trollface: {
    target: {
      happiness: { target: 0.85, w: 1.0 },
      surprise:  { target: 0.10, w: 0.3 },
      anger:     { target: 0.10, w: 0.2 },
      sadness:   { target: 0.10, w: 0.2 },
      smirkAsym: { target: 0.45, w: 0.8 },
    },
    gates: {
      happinessMin: 0.60,
    }
  },

  wojak: {
    target: {
      surprise:  { target: 0.55, w: 1.0 }, // open mouth is main factor
      anger:     { target: 0.35, w: 0.9 }, // easier to hit than 0.5
      sadness:   { target: 0.25, w: 0.3 }, // optional, low influence
      happiness: { target: 0.10, w: 0.1 }, // almost no penalty for neutral
    },
    gates: {
      surpriseMin: 0.35, // mouth should open at least somewhat
      angerMin: 0.10,    // only mild tension needed
    }
  },

};
