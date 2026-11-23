// Popup logic: grab the page's main text → rewrite it with the ⚡ localModel → show it.
import { Readability } from "@mozilla/readability";
import { localModel } from "./firebase.js";
import { simplifyPrompt, defaultProfile } from "./prompts.js";

const button = document.getElementById("simplify");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const badgeEl = document.getElementById("badge");

const MAX_CHARS = 1500; // small chunk = fits Gemini Nano comfortably

button.addEventListener("click", async () => {
  button.disabled = true;
  outputEl.replaceChildren();
  badgeEl.hidden = true;

  try {
    setStatus("Reading the page…");
    const chunk = await getFirstChunkOfPage();

    // Firebase docs: start the on-device model after a user click, before the prompt.
    // If the model isn't downloaded yet, this starts the download and we fall back to cloud.
    if (typeof localModel.initializeDeviceModel === "function") {
      localModel
        .initializeDeviceModel((progress) =>
          setStatus(`Getting the on-device AI ready… ${Math.round(progress * 100)}%`)
        )
        .catch((e) => console.warn("On-device model not ready, cloud will be used:", e));
    }

    setStatus("Making it simple…");
    const result = await localModel.generateContent(simplifyPrompt(chunk, defaultProfile));

    showText(result.response.text());
    showBadge(result.response.inferenceSource);
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus(friendlyError(err));
  } finally {
    button.disabled = false;
  }
});

// Pulls the page's HTML, strips menus/ads with Readability, returns the first ~2 paragraphs.
async function getFirstChunkOfPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result: html }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });

  const doc = new DOMParser().parseFromString(html, "text/html");
  const article = new Readability(doc).parse();
  const text = article?.textContent || doc.body?.innerText || "";

  // Keep real paragraphs (skip tiny lines like captions), then cut to MAX_CHARS.
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 60);

  let chunk = "";
  for (const p of paragraphs) {
    if (chunk.length + p.length > MAX_CHARS) break;
    chunk += p + "\n\n";
  }
  chunk = chunk.trim() || paragraphs[0]?.slice(0, MAX_CHARS) || "";

  if (!chunk) throw new Error("NO_TEXT");
  return chunk;
}

function showText(text) {
  // textContent (not innerHTML) so AI output can never inject HTML
  for (const para of text.split(/\n+/).filter((p) => p.trim())) {
    const p = document.createElement("p");
    p.textContent = para.trim();
    outputEl.append(p);
  }
}

function showBadge(source) {
  const onDevice = String(source).toLowerCase().includes("device");
  badgeEl.textContent = onDevice ? "⚡ On-device (Gemini Nano)" : "☁️ Cloud";
  badgeEl.className = `badge ${onDevice ? "local" : "cloud"}`;
  badgeEl.hidden = false;
}

function setStatus(msg) {
  statusEl.textContent = msg;
}

function friendlyError(err) {
  const msg = String(err?.message || err);
  if (msg === "NO_TEXT") return "I couldn't find any text on this page to simplify.";
  if (msg.includes("Cannot access") || msg.includes("chrome://"))
    return "Chrome doesn't let extensions read this page. Try a normal website, like Wikipedia.";
  if (msg.toLowerCase().includes("app check") || msg.includes("appCheck"))
    return "App Check blocked the request. Check the debug token in src/secrets.js.";
  return `Something went wrong: ${msg}`;
}
