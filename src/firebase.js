// All AI goes through Firebase AI Logic — this file is the only place models are created.
import { initializeApp } from "firebase/app";
import { initializeAppCheck, CustomProvider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode } from "firebase/ai";
import { firebaseConfig, appCheckDebugToken } from "./secrets.js";

// App Check is required by Firebase AI Logic.
// Extensions run on a chrome-extension:// address, where reCAPTCHA doesn't work,
// so we use a debug token (the hackathon rules allow this).
// This line MUST run before initializeAppCheck.
self.FIREBASE_APPCHECK_DEBUG_TOKEN = appCheckDebugToken;

const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  // In debug mode this provider is never actually asked for a token —
  // the debug token above is used instead. It's just a required placeholder.
  provider: new CustomProvider({
    getToken: () => Promise.reject(new Error("Only debug tokens are used in this extension")),
  }),
  isTokenAutoRefreshEnabled: true,
});

const ai = getAI(app, { backend: new GoogleAIBackend() });

// ⚡ localModel: quick rewrites ("Make it simple", "Too hard").
// Runs on Gemini Nano inside Chrome when it can; falls back to cloud if it can't.
export const localModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  onDeviceParams: {
    createOptions: {
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
    },
  },
});

// ☁️ cloudModel: bigger jobs ("Quiz me", whole articles). Always the cloud.
export const cloudModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
});
