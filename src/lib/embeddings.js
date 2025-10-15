import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

// Load once, keep cached
let model;
export async function loadEmbedder() {
  if (model) return model;
  model = await mobilenet.load({ version: 2, alpha: 1.0 });
  return model;
}

// Get a 1000-dim feature from an HTMLCanvasElement region
export function embedCanvasRegion(model, canvas, box) {
  // box is [x, y, w, h] in pixels
  const [x, y, w, h] = box.map(Math.floor);
  const tmp = document.createElement("canvas");
  tmp.width = 224; tmp.height = 224;
  const tctx = tmp.getContext("2d");
  tctx.drawImage(canvas, x, y, w, h, 0, 0, 224, 224);

  return tf.tidy(() => {
    const input = tf.browser.fromPixels(tmp);
    // use intermediate activation as embedding
    const activation = model.infer(input.expandDims(0), { embedding: true });
    // return a 1D tensor
    return activation.squeeze(); // shape [1024] or similar depending on mobilenet version
  });
}

// Cosine similarity between two 1D tensors
export function cosineSim(a, b) {
  const sim = tf.tidy(() => {
    const an = tf.norm(a);
    const bn = tf.norm(b);
    return tf.sum(tf.mul(a, b)).div(an.mul(bn));
  });
  const v = sim.dataSync()[0];
  sim.dispose();
  return v;
}
