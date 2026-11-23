# Easy-Pal

A Chrome extension that rewrites any webpage so neurodivergent kids can understand it: short sentences, literal words, one idea at a time, explained with the child's favorite topic.

Built for **#BuildHybridAI 2026** with **Firebase AI Logic hybrid inference**:

- ⚡ **On-device (Gemini Nano in Chrome)**: quick rewrites ("Make it simple", "Too hard"). Fast, free, and the child's reading stays on the laptop.
- ☁️ **Cloud (Gemini via Firebase AI Logic)**: bigger jobs like "Quiz me", and automatic fallback when the laptop can't run the on-device model.

> 🚧 Work in progress. Day 1: "Make it simple" button with the on-device/cloud badge.

## Where Firebase AI Logic is used

- `src/firebase.js` creates two models with `getGenerativeModel`:
  - `localModel` uses `InferenceMode.PREFER_ON_DEVICE`
  - `cloudModel` uses `InferenceMode.ONLY_IN_CLOUD`
- `src/popup.js` calls `localModel.generateContent(...)` and reads `response.inferenceSource` to show ⚡ or ☁️.

## Run it yourself

Requirements: Chrome 139+ on desktop, Node.js 18+.

1. **Install packages**
   ```bash
   npm install
   ```
2. **Add your Firebase settings.** Copy `src/secrets.example.js` to `src/secrets.js`, then paste in:
   - your Firebase web app config (Firebase console → Project settings → Your apps)
   - an App Check debug token (Firebase console → App Check → Apps → Manage debug tokens)
3. **Build**
   ```bash
   npm run build
   ```
4. **Load in Chrome**: open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and choose the `dist` folder.
5. **(Optional) Turn on the on-device model**: enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` and restart Chrome. Without it, Easy-Pal still works and uses the cloud.

## License

Apache 2.0. See [LICENSE](LICENSE).
