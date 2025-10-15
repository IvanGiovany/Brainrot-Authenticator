export const memes = [
  {
    id: "gigachad",
    name: "GigaChad (smirk)",
    img: "/memes/Gigachad.jpg",
    crops: {
      leftEye:  [0.38, 0.30, 0.10, 0.10],
      rightEye: [0.56, 0.29, 0.10, 0.10],
      mouth:    [0.43, 0.58, 0.22, 0.16],
    },
  },
  {
    id: "pepe",
    name: "Pepe the Frog (Sad/Smug)",
    img: "/memes/PepeFrog.png",
    crops: {
      leftEye:  [0.37, 0.33, 0.12, 0.12],
      rightEye: [0.62, 0.34, 0.12, 0.12],
      mouth:    [0.47, 0.64, 0.22, 0.12],
    },
  },
  {
    id: "pikachu",
    name: "Surprised Pikachu",
    img: "/memes/SurprisedPikachu.jpg",
    crops: {
      leftEye:  [0.40, 0.38, 0.10, 0.10],
      rightEye: [0.60, 0.38, 0.10, 0.10],
      mouth:    [0.50, 0.63, 0.12, 0.10],
    },
  },
  {
    id: "trollface",
    name: "TrollFace",
    img: "/memes/TrollFace.png",
    crops: {
      leftEye:  [0.34, 0.30, 0.12, 0.10],
      rightEye: [0.60, 0.30, 0.12, 0.10],
      mouth:    [0.48, 0.58, 0.28, 0.16],
    },
  },
  {
    id: "wojak",
    name: "Wojak (Angry, ngl you gotta work for this one)",
    img: "/memes/Wojak.png",
    crops: {
      leftEye:  [0.41, 0.33, 0.12, 0.10],
      rightEye: [0.60, 0.34, 0.12, 0.10],
      mouth:    [0.51, 0.63, 0.20, 0.12],
    },
  },
];

export function randomMeme() {
  return memes[Math.floor(Math.random() * memes.length)];
}
