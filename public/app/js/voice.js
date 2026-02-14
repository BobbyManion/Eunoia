import { el } from "./dom.js";
import { autoGrowTextarea } from "./utils.js";

export function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isRecording = false;

  function setVoiceUI(recording) {
    if (!el.voiceBtn) return;
    el.voiceBtn.classList.toggle("bg-black/5", recording);
    el.voiceBtn.title = recording ? "Stop recording" : "Voice input";
  }

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      const base = el.chatInput.value;
      el.chatInput.value = (base + " " + (finalText || interim)).replace(/\s+/g, " ").trimStart();
      autoGrowTextarea(el.chatInput);
    };

    recognition.onend = () => {
      isRecording = false;
      setVoiceUI(false);
    };

    el.voiceBtn?.addEventListener("click", () => {
      if (!recognition) return;
      if (isRecording) {
        recognition.stop();
        return;
      }
      try {
        isRecording = true;
        setVoiceUI(true);
        recognition.start();
      } catch {
        isRecording = false;
        setVoiceUI(false);
      }
    });
  } else {
    el.voiceBtn?.classList.add("hidden");
  }
}
