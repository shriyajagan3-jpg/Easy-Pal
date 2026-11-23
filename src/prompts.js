// The instructions we give the AI. Keeping them in one file makes them easy to tweak.

// Day 1: a fixed example profile. On Day 3 the parent setup screen will fill this in
// (saved with chrome.storage.local, so it never leaves the laptop).
export const defaultProfile = {
  readingLevel: "easy", // "easy" | "medium" | "harder"
  favoriteTopic: "dinosaurs",
  shortSentences: true,
  literalLanguage: true, // no idioms, sarcasm or figures of speech
  oneIdeaAtATime: true,
};

const levelGuide = {
  easy: "a 7-year-old (very short, everyday words)",
  medium: "a 10-year-old",
  harder: "a 13-year-old",
};

export function simplifyPrompt(text, profile = defaultProfile) {
  const rules = [
    `Write for ${levelGuide[profile.readingLevel] ?? levelGuide.easy}.`,
    profile.shortSentences && "Use short sentences. No sentence longer than 12 words.",
    profile.literalLanguage &&
      "Say exactly what you mean. Do not use idioms, sarcasm, jokes or figures of speech.",
    profile.oneIdeaAtATime && "Put one idea in each paragraph. Use 3 to 5 short paragraphs.",
    profile.favoriteTopic &&
      `Use one comparison to ${profile.favoriteTopic} to explain the main idea, because the child loves ${profile.favoriteTopic}.`,
    "Keep every fact correct. Do not add facts that are not in the text.",
    "Reply with only the rewritten text. No title, no lists, no markdown.",
  ].filter(Boolean);

  return `You are helping a neurodivergent child understand a study text.
Rewrite the TEXT below following these rules:
- ${rules.join("\n- ")}

TEXT:
"""
${text}
"""`;
}
