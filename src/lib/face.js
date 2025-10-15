// src/lib/face.js
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let videoLM, imageLM;

export async function getVideoLandmarker() {
  if (videoLM) return videoLM;
  const files = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  videoLM = await FaceLandmarker.createFromOptions(files, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false
  });
  return videoLM;
}

export async function getImageLandmarker() {
  if (imageLM) return imageLM;
  const files = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  imageLM = await FaceLandmarker.createFromOptions(files, {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    },
    runningMode: "VIDEO",      
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false 
    });
  return imageLM;
}

// existing video frame helper you already use in FaceAuth:
export function detect(lm, videoEl) {
  return lm.detectForVideo(videoEl, performance.now());
}
