let isSpeechEnabled = true;

export function setSpeechEnabled(enabled: boolean) {
  isSpeechEnabled = enabled;
  if (!enabled) {
    cancelSpeech();
  }
}

export function getSpeechEnabled(): boolean {
  return isSpeechEnabled;
}

export function speakText(text: string, languageCode: "bn" | "en" | "auto" = "auto") {
  if (!isSpeechEnabled || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    // Sanitize text slightly (remove brackets or keep cleaner)
    const cleanText = text.replace(/[\(\)]/g, " ").trim();

    // Split text into chunks because some TTS engines have a maximum length
    const chunks = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];

    let currentChunkIndex = 0;

    const speakNextChunk = () => {
      if (currentChunkIndex >= chunks.length || !isSpeechEnabled) return;

      const chunkText = chunks[currentChunkIndex].trim();
      if (!chunkText) {
        currentChunkIndex++;
        speakNextChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunkText);

      // Simple language detection helper
      let lang = "bn-IN"; // Default to Bengali
      if (languageCode === "en" || (languageCode === "auto" && /[a-zA-Z]/.test(chunkText) && !/[অ-য়]/.test(chunkText))) {
        lang = "en-US";
      }

      utterance.lang = lang;

      // Try to find a matching voice in the browser
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith(lang.split("-")[0]) && (v.name.includes("Google") || v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith(lang.split("-")[0]));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Vibe adjustment: make Bengali a bit warmer and slower
      utterance.rate = lang.startsWith("bn") ? 0.95 : 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        currentChunkIndex++;
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis chunk error:", e);
        // Continue to next chunk on error to prevent freezing
        currentChunkIndex++;
        speakNextChunk();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
  } catch (err) {
    console.error("Speech Synthesis Error:", err);
  }
}

export function cancelSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
