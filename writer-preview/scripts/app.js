const writingInput = document.getElementById("writingInput");
const resultText = document.getElementById("resultText");
const previewBtn = document.getElementById("previewBtn");
const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const quickVideoBtn = document.getElementById("quickVideoBtn");
const fullVideoBtn = document.getElementById("fullVideoBtn");
const modelSelect = document.getElementById("modelSelect");
const apiKeyInput = document.getElementById("apiKeyInput");
const authorNameInput = document.getElementById("authorNameInput");
const authorPhotoInput = document.getElementById("authorPhotoInput");
const themeSelect = document.getElementById("themeSelect");
const moodInput = document.getElementById("moodInput");
const hashtagsInput = document.getElementById("hashtagsInput");
const previewPages = document.getElementById("previewPages");
const videoStatus = document.getElementById("videoStatus");

let authorPhotoDataUrl = "";

const englishStopWords = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "its",
  "that",
  "this",
  "as",
  "i",
  "you",
  "we",
  "they",
  "he",
  "she",
  "my",
  "your",
  "our",
  "their",
  "me",
  "us",
  "them",
  "so",
  "if",
  "then",
  "too",
  "very",
  "just",
  "into",
  "about",
  "over",
  "under",
  "again",
  "still"
]);

const devanagariStopWords = new Set([
  "और",
  "का",
  "की",
  "के",
  "को",
  "में",
  "से",
  "पर",
  "है",
  "हूं",
  "हूँ",
  "था",
  "थी",
  "थे",
  "मैं",
  "तुम",
  "हम",
  "आप",
  "यह",
  "वह",
  "भी",
  "तो",
  "ना",
  "न",
  "छ",
  "छन्",
  "हो",
  "होई",
  "र",
  "मा"
]);

function cleanLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractKeywords(text) {
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !englishStopWords.has(word) && !devanagariStopWords.has(word));

  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

function detectTone(text) {
  const lowered = text.toLowerCase();
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  if (/(lonely|loss|goodbye|silence|rain|dark|empty|बिछ|अकेल|दुख|उदास|पीडा)/i.test(lowered)) {
    return "reflective and bittersweet";
  }

  if (/(fire|rise|fight|dream|build|hope|उठ|सपना|आशा|जीत|हिम्मत)/i.test(lowered)) {
    return "hopeful and determined";
  }

  if (/(love|kiss|touch|heart|माया|प्रेम|दिल|मोह)/i.test(lowered)) {
    return "intimate and emotionally warm";
  }

  return hasDevanagari
    ? "personal and lyrical, with a conversational South Asian voice"
    : "personal and introspective, with poetic undertones";
}

function buildTheme(text, keywords) {
  const tone = detectTone(text);
  const seed = keywords.length ? keywords.join(", ") : "memory, identity, and change";

  return [
    `The piece feels ${tone} and centers on ${seed}.`,
    "It translates as a search for meaning through a small but emotionally loaded moment."
  ];
}

function buildBookIdeas(keywords) {
  const k1 = keywords[0] || "memory";
  const k2 = keywords[1] || "belonging";
  const k3 = keywords[2] || "becoming";

  return [
    {
      idea: `Echoes Between ${capitalize(k1)} and ${capitalize(k2)}: A bilingual poetry collection where each poem has a mirrored response in another language.`,
      why: "This works for readers who love cross-cultural emotion and shareable lines that feel intimate but universal."
    },
    {
      idea: `Small Rooms, Loud Hearts: A short-story anthology built from everyday scenes that hide turning-point emotions.`,
      why: "This taps young adult and millennial readers who connect with subtle realism, nostalgia, and quiet heartbreak."
    },
    {
      idea: `Project ${capitalize(k3)}: A multimedia text-photo-audio series where each entry pairs a micro-essay, ambient sound, and one visual motif.`,
      why: "This works because it blends literature with creator culture and increases discoverability across Instagram, YouTube Shorts, and Threads."
    }
  ];
}

function buildSocialActions(keywords) {
  const k = keywords[0] || "this line";

  return [
    {
      hook: `"I wrote this at 2 AM and didn\'t expect it to hit this hard: ${k}."`,
      format: "Reel/Short with text-on-video + 1 emotional line per beat",
      cta: "Ask: 'Which line felt most personal?' and pin best replies; use 3 niche hashtags + 1 broad tag."
    },
    {
      hook: '"Swipe this like a mini-book: draft -> feeling -> final line."',
      format: "IG/FB carousel (5 slides: context, draft excerpt, final excerpt, meaning, takeaway)",
      cta: "Prompt comments with: 'Should I turn this into a full series?' and add 'follow for part 2'."
    },
    {
      hook: '"Thread: one tiny paragraph that changed how I see myself."',
      format: "Threads/X style story thread with 4-6 short posts",
      cta: "Close with: 'Reply with one word for your current mood' to drive low-friction engagement."
    }
  ];
}

function buildStoryboard(lines, keywords) {
  if (lines.length <= 4) {
    return [
      "Single Animated Card Shot: Grainy paper texture background, center-aligned key line, slow zoom-in from 100% to 108%, soft shadow on text; on-screen text: 'A line I had to write today' + the writing excerpt; font vibe: serif headline + clean sans body; colors: warm ivory, charcoal, muted coral accent; music mood: ambient piano with vinyl crackle."
    ];
  }

  const k = keywords[0] || "a feeling";

  return [
    "Shot 1 (0-3s): Close-up of notebook or textured background entering frame; on-screen text: 'A thought I could not ignore'; style: warm paper grain, cream + deep navy, slight camera shake.",
    `Shot 2 (3-7s): Key phrase appears word-by-word with stagger motion; on-screen text: '${truncateForText(k, 24)}'; style: bold serif headline, fade-up animation.` ,
    "Shot 3 (7-11s): Split layout with 2 short lines from the writing and subtle underline sweep; on-screen text: 'What this really means'; style: coral accent strokes, soft blur transition.",
    "Shot 4 (11-15s): End card with creator name/handle and CTA; on-screen text: 'If this felt familiar, follow for the full piece'; style: clean sans, gentle zoom-out; music mood: warm acoustic + light ambient pad."
  ];
}

function buildStylingNotes() {
  return [
    "Style A: Font vibe 'Merriweather + Space Grotesk'; palette #FFF7E8, #1D2230, #FF6F61; layout with one oversized quote line and small attribution footer.",
    "Style B: Font vibe 'Playfair Display + Manrope'; palette #F3F7FF, #243B53, #E07A5F; layout as vertical poster card with top title band and centered body text.",
    "Style C: Font vibe 'Noto Serif Devanagari + DM Sans'; palette #FAF4EE, #2E294E, #3A7D44; layout as bilingual split card (left original, right translation) for better shares.",
    "Optional Gemini API feature: Add a 'Generate 5 visual styles' button that returns JSON fields for fontPair, palette, backgroundTexture, and layoutTemplate for direct HTML/CSS rendering."
  ];
}

function truncateForText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function capitalize(value) {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function generateStructuredOutput(text) {
  const lines = cleanLines(text);
  const keywords = extractKeywords(text);

  const theme = buildTheme(text, keywords);
  const ideas = buildBookIdeas(keywords);
  const actions = buildSocialActions(keywords);
  const storyboard = buildStoryboard(lines, keywords);
  const styling = buildStylingNotes();

  const chunks = [];

  chunks.push("1) Theme");
  chunks.push(`- ${theme[0]}`);
  chunks.push(`- ${theme[1]}`);

  chunks.push("\n2) Book Ideas");
  ideas.forEach((item, index) => {
    chunks.push(`${index + 1}. Idea: ${item.idea}`);
    chunks.push(`   Why this works: ${item.why}`);
  });

  chunks.push("\n3) Social Posts");
  actions.forEach((action, index) => {
    chunks.push(`${index + 1}. Hook: ${action.hook}`);
    chunks.push(`   Format: ${action.format}`);
    chunks.push(`   CTA: ${action.cta}`);
  });

  chunks.push("\n4) Video Storyboard");
  storyboard.forEach((item, index) => {
    chunks.push(`- Scene ${index + 1}: ${item}`);
  });

  chunks.push("\n5) Styling Notes");
  styling.forEach((item) => chunks.push(`- ${item}`));

  return chunks.join("\n");
}

function firstStrongLine(text) {
  const lines = cleanLines(text);

  if (!lines.length) {
    return "Your first strong line will appear here.";
  }

  return truncateForText(lines[0], 140);
}

function getPosterTitle(lines) {
  if (!lines.length) {
    return "Literary Snapshot";
  }

  const first = lines[0].replace(/[,:;.!?]+$/g, "").trim();
  return truncateForText(first || "Literary Snapshot", 36);
}

function secondSupportLine(text) {
  const lines = cleanLines(text);

  if (lines.length > 1) {
    return truncateForText(lines[1], 160);
  }

  return "A visual excerpt crafted for social sharing.";
}

function buildHashtagLine(keywords) {
  if (!keywords.length) {
    return "#creative #writing";
  }

  return keywords
    .slice(0, 3)
    .map((word) => `#${word.replace(/\s+/g, "").replace(/[^\p{L}\p{N}_]/gu, "")}`)
    .filter(Boolean)
    .join(" ");
}

function splitIntoPages(text) {
  const lines = cleanLines(text);

  if (!lines.length) {
    return [];
  }

  const MAX_LINES_PER_PAGE = 17;
  const pages = [];
  for (let i = 0; i < lines.length; i += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + MAX_LINES_PER_PAGE));
  }

  return pages;
}

function getAuthorName() {
  const value = authorNameInput.value.trim();
  return value || "Anonymous Writer";
}

function getAuthorInitial(name) {
  const first = name.trim().charAt(0).toUpperCase();
  return first || "A";
}

function buildAuthorSignatureMarkup(authorName) {
  const safeAuthorName = escapeHtml(authorName);
  const avatarMarkup = authorPhotoDataUrl
    ? `<img class="author-avatar" src="${authorPhotoDataUrl}" alt="Author portrait">`
    : `<span class="author-avatar placeholder">${escapeHtml(getAuthorInitial(authorName))}</span>`;

  return `
    <div class="author-signature">
      ${avatarMarkup}
      <div>
        <p class="author-label">Written by</p>
        <p class="author-name">${safeAuthorName}</p>
      </div>
    </div>
  `;
}

function getThemeClass(tone) {
  const selected = themeSelect.value;

  if (selected && selected !== "auto") {
    return `theme-${selected}`;
  }

  if (tone.includes("reflective")) {
    return "theme-reflective";
  }

  if (tone.includes("hopeful")) {
    return "theme-hopeful";
  }

  if (tone.includes("intimate")) {
    return "theme-intimate";
  }

  if (tone.includes("lyrical")) {
    return "theme-lyrical";
  }

  return "theme-neutral";
}

function renderPreviewCards(text) {
  const tone = detectTone(text);
  const keywords = extractKeywords(text);
  const themeClass = getThemeClass(tone);
  const pages = splitIntoPages(text);
  const totalPages = pages.length || 1;
  const title = getPosterTitle(cleanLines(text));
  const hashtagLine = hashtagsInput.value.trim() || buildHashtagLine(keywords);
  const authorName = getAuthorName();
  const safeTone = escapeHtml(moodInput.value.trim() || tone);

  previewPages.innerHTML = "";

  if (!pages.length) {
    const fallbackCard = document.createElement("article");
    fallbackCard.className = `preview-card ${themeClass}`;
    fallbackCard.innerHTML = `
      <span class="paper-tape tape-top"></span>
      <span class="paper-tape tape-bottom"></span>
      <span class="paper-cut cut-top-left"></span>
      <span class="paper-cut cut-bottom-right"></span>
      <span class="art-orb orb-a"></span>
      <span class="art-orb orb-b"></span>
      <span class="art-grid"></span>
      <p class="preview-tag">Literary Snapshot</p>
      <h3 class="preview-title">Draft</h3>
      <p class="preview-body">Your full literary text preview will appear here.</p>
      <p class="preview-subline">Add writing and click Preview design.</p>
      <div class="preview-footer">
        <p class="preview-mood">Mood: waiting for your writing</p>
        <p class="preview-keywords">#creative #writing</p>
      </div>
      ${buildAuthorSignatureMarkup(authorName)}
    `;
    previewPages.appendChild(fallbackCard);
    return;
  }

  pages.forEach((pageLines, index) => {
    const card = document.createElement("article");
    card.className = `preview-card ${themeClass}`;
    const pageLabel = totalPages > 1 ? `Page ${index + 1}/${totalPages}` : "One-page poster";
    const bodyText = pageLines.join("\n");
    const isFinalPage = index === totalPages - 1;
    const subline = totalPages > 1 ? "" : secondSupportLine(text);
    const safeTitle = escapeHtml(title);
    const safeBodyText = escapeHtml(bodyText);
    const safeSubline = escapeHtml(subline);
    const safeHashtagLine = escapeHtml(hashtagLine);
    const sublineMarkup = safeSubline ? `<p class="preview-subline">${safeSubline}</p>` : "";

    card.innerHTML = `
      <span class="paper-tape tape-top"></span>
      <span class="paper-tape tape-bottom"></span>
      <span class="paper-cut cut-top-left"></span>
      <span class="paper-cut cut-bottom-right"></span>
      <span class="art-orb orb-a"></span>
      <span class="art-orb orb-b"></span>
      <span class="art-grid"></span>
      <p class="preview-tag">Literary Snapshot</p>
      <h3 class="preview-title">${safeTitle}</h3>
      <p class="preview-body">${safeBodyText}</p>
      ${sublineMarkup}
      <div class="preview-footer">
        <p class="preview-mood">Mood: ${safeTone}</p>
        <p class="preview-keywords">${isFinalPage ? safeHashtagLine : ""}</p>
      </div>
      ${isFinalPage ? buildAuthorSignatureMarkup(authorName) : ""}
    `;
    previewPages.appendChild(card);
  });
}

function handleLocalPreview(text) {
  resultText.textContent = generateStructuredOutput(text);
  renderPreviewCards(text);
}

async function handlePreview() {
  const text = writingInput.value.trim();

  if (!text) {
    resultText.textContent = "1) Theme\n- Please paste a piece of writing first.";
    renderPreviewCards("");
    return;
  }

  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    handleLocalPreview(text);
    return;
  }

  await handleRemoteGenerate(text, apiKey, modelSelect.value.trim());
  renderPreviewCards(text);
}

async function handleRemoteGenerate(text, apiKey, model) {
  const selectedModel = model || "gemini-1.5-flash";

  const wantsOpenAI = selectedModel.startsWith("openai-");

  const prompt = [
    "You are a creative writing coach + social media growth strategist + short-video editor director.",
    "Use ONLY brief and structured output with these exact headings:",
    "1) Theme",
    "2) Book Ideas",
    "3) Social Posts",
    "4) Video Storyboard",
    "5) Styling Notes",
    "Rules:",
    "- Keep concise and actionable for HTML/CSS/JS implementation.",
    "- If writing has 4 or fewer lines, video storyboard must be one compact animated card shot.",
    "- Include 3 distinct book/project expansion ideas with one line idea + one line why each.",
    "- Include 3 social actions with hook, format, CTA.",
    "- Include 2-3 styling suggestions and optionally Gemini API enhancement detail.",
    "Writing:",
    text
  ].join("\n");

  resultText.textContent = wantsOpenAI ? "Generating with OpenAI..." : "Generating with Gemini...";

  try {
    let response;

    if (wantsOpenAI) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel.replace("openai-", ""),
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.85,
          max_tokens: 800
        })
      });
    } else {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.85,
              topP: 0.95,
              maxOutputTokens: 800
            }
          })
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const modelText = wantsOpenAI
      ? data?.choices?.[0]?.message?.content?.trim()
      : data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim();

    if (!modelText) {
      throw new Error("The model returned no text output.");
    }

    resultText.textContent = modelText;
  } catch (error) {
    resultText.textContent = `1) Theme\n- API generation failed.\n\nDetails: ${error.message}`;
  }
}

async function handleExportImage() {
  if (!window.html2canvas) {
    videoStatus.textContent = "html2canvas is not available to export image.";
    return;
  }

  const cards = [...previewPages.querySelectorAll(".preview-card")];

  if (!cards.length) {
    videoStatus.textContent = "No preview page found to export.";
    return;
  }

  for (let i = 0; i < cards.length; i += 1) {
    const canvas = await window.html2canvas(cards[i], {
      backgroundColor: null,
      scale: 2
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `creative-boost-preview-page-${i + 1}.png`;
    link.click();
  }

  videoStatus.textContent = `Exported ${cards.length} preview page(s).`;
}

function handleQuickVideoPreview() {
  const cards = [...previewPages.querySelectorAll(".preview-card")];

  if (!cards.length) {
    videoStatus.textContent = "Generate preview first to animate pages.";
    return;
  }

  cards.forEach((card, index) => {
    card.classList.remove("is-previewing");
    window.setTimeout(() => {
      card.classList.add("is-previewing");
    }, index * 170);
  });

  videoStatus.textContent = cards.length > 1
    ? "Quick video preview playing with page-by-page animation."
    : "Quick video preview playing (single page).";
}

function handleFullVideoPlan() {
  const currentOutput = resultText.textContent;
  const plan = [
    "",
    "Build Note:",
    "- Full video generation is scaffolded as a plan in this demo UI.",
    "- Next step: send storyboard JSON to a render API (Remotion/FFmpeg service) and return MP4 URL.",
    "- Use the existing '4) Video Storyboard' section as the scene source."
  ].join("\n");

  resultText.textContent = `${currentOutput}${plan}`;
  videoStatus.textContent = "Full video plan appended to output.";
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(resultText.textContent);
    copyBtn.textContent = "Copied";
    window.setTimeout(() => {
      copyBtn.textContent = "Copy Output";
    }, 1100);
  } catch (_error) {
    copyBtn.textContent = "Copy failed";
    window.setTimeout(() => {
      copyBtn.textContent = "Copy Output";
    }, 1100);
  }
}

function handleAuthorPhotoUpload(event) {
  const file = event.target.files?.[0];

  if (!file) {
    authorPhotoDataUrl = "";
    renderPreviewCards(writingInput.value.trim());
    return;
  }

  if (!file.type.startsWith("image/")) {
    videoStatus.textContent = "Please upload a valid image file for author photo.";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    authorPhotoDataUrl = typeof reader.result === "string" ? reader.result : "";
    renderPreviewCards(writingInput.value.trim());
    videoStatus.textContent = "Author photo added to preview.";
  };
  reader.readAsDataURL(file);
}

previewBtn.addEventListener("click", handlePreview);
copyBtn.addEventListener("click", handleCopy);
exportBtn.addEventListener("click", handleExportImage);
quickVideoBtn.addEventListener("click", handleQuickVideoPreview);
fullVideoBtn.addEventListener("click", handleFullVideoPlan);
authorPhotoInput.addEventListener("change", handleAuthorPhotoUpload);
authorNameInput.addEventListener("input", () => {
  renderPreviewCards(writingInput.value.trim());
});
themeSelect.addEventListener("change", () => {
  renderPreviewCards(writingInput.value.trim());
});
moodInput.addEventListener("input", () => {
  renderPreviewCards(writingInput.value.trim());
});
hashtagsInput.addEventListener("input", () => {
  renderPreviewCards(writingInput.value.trim());
});

renderPreviewCards("");
