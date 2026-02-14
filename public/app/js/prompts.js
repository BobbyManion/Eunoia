import { escapeHtml } from "./utils.js";
import { el } from "./dom.js";
import { autoGrowTextarea } from "./utils.js";

const EXAMPLE_PROMPTS = [
  { icon: "book", label: "CS PhD · NLP / LLMs", text: "I'm applying for a CS PhD in the US. Interests: NLP and large language models (alignment, instruction tuning). Background: transformer fine-tuning, some RL. Suggest matching labs and advisors." },
  { icon: "bookmark", label: "HCI · User Studies", text: "I'm applying for a CS PhD. Interests: HCI and accessibility. Background: 2 user-study projects. Find labs/advisors." },
  { icon: "chart", label: "CV + Robotics", text: "I'm interested in vision-language models for robotics manipulation. Background: computer vision, ROS, some RL. Target: US and Canada. Suggest programs, labs, and advisors." },
  { icon: "flask", label: "Not sure yet", text: "I'm interested in deep learning but not sure which subfield fits me best. Ask me a few clarifying questions, then suggest possible research directions and matching labs." },
];

function promptIconSvg(key){
  const common = 'width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"';
  if(key==="book"){
    return `<svg ${common}><path d="M4 19a2 2 0 0 0 2 2h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 17V5a2 2 0 0 1 2-2h12v14H8a2 2 0 0 0-2 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }
  if(key==="bookmark"){
    return `<svg ${common}><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-3-6 3V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }
  if(key==="chart"){
    return `<svg ${common}><path d="M4 19V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 15v-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 15V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16 15V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  }
  return `<svg ${common}><path d="M10 2v6l-5.5 9.5A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 8V2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 14h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
}

export function renderExamplePrompts() {
  const wrap = document.getElementById("examplePrompts");
  wrap.innerHTML = "";
  for (const ex of EXAMPLE_PROMPTS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip rounded-full backdrop-blur px-3 py-1.5 text-xs text-black/70 transition inline-flex items-center gap-1.5";
    btn.innerHTML = `${promptIconSvg(ex.icon)}<span>${escapeHtml(ex.label)}</span>`;
    btn.addEventListener("click", () => {
      if (el.chatInput.disabled) return;
      el.chatInput.value = ex.text;
      autoGrowTextarea(el.chatInput);
      el.chatInput.focus();
    });
    wrap.appendChild(btn);
  }
}
