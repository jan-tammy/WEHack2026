const gallery = document.getElementById("gallery");
const chatModal = document.getElementById("chatModal");
const councilModal = document.getElementById("councilModal");

const modalName = document.getElementById("modalName");
const modalYears = document.getElementById("modalYears");
const modalImage = document.getElementById("modalImage");
const modalTagline = document.getElementById("modalTagline");
const modalIntro = document.getElementById("modalIntro");
const suggestionsContainer = document.getElementById("suggestions");
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

const closeModalBtn = document.getElementById("closeModalBtn");
const playIntroBtn = document.getElementById("playIntroBtn");

const askAllBtn = document.getElementById("askAllBtn");
const exploreBtn = document.getElementById("exploreBtn");
const askCouncilFromModalBtn = document.getElementById("askCouncilFromModalBtn");

const closeCouncilBtn = document.getElementById("closeCouncilBtn");
const councilForm = document.getElementById("councilForm");
const councilInput = document.getElementById("councilInput");
const councilResults = document.getElementById("councilResults");
const consensusBox = document.getElementById("consensusBox");
const consensusText = document.getElementById("consensusText");

const toggleChamberBtn = document.getElementById("toggleChamberBtn");
const toggleChamberLabel = document.getElementById("toggleChamberLabel");
const toggleChamberIcon = document.getElementById("toggleChamberIcon");
const chamberContent = document.getElementById("chamberContent");

let personas = [];
let activePersona = null;
let currentIntroAudio = null;
let isChamberCollapsed = false;

function getPersonaImage(persona) {
  return persona.image || persona.portrait || "";
}

function getPersonaIntro(persona) {
  return persona.intro || persona.opening_greeting || "";
}

function getPersonaDescription(persona) {
  return persona.description || persona.opening_greeting || "";
}

function getPersonaIntroAudio(persona) {
  return persona.introAudio || "";
}

async function loadPersonas() {
  try {
    const response = await fetch("./personas.json");
    if (!response.ok) {
      throw new Error(`Could not load personas.json (${response.status})`);
    }

    personas = await response.json();
    renderGallery();
  } catch (error) {
    console.error("Failed to load personas:", error);
    gallery.innerHTML = `
      <div class="museum-card rounded-3xl p-6 text-center col-span-full">
        <p class="text-lg text-[#f5eee6]">Could not load personas.json</p>
        <p class="text-sm text-[#e7d9c8]/70 mt-2">
          Make sure personas.json is in the same frontend folder as index.html and app.js.
        </p>
      </div>
    `;
  }
}

function renderGallery() {
  gallery.innerHTML = personas.map((persona, index) => `
    <article class="museum-card gallery-card rounded-3xl p-5 md:p-6">
      <p class="uppercase tracking-[0.28em] text-[11px] text-[#d8c79b]/70 mb-3">
        Exhibit ${String(index + 1).padStart(2, "0")}
      </p>

      <div class="portrait-frame mb-5">
        <div class="portrait-inner">
          <img src="${getPersonaImage(persona)}" alt="${persona.name}" class="w-full h-full object-cover" />
        </div>
      </div>

      <h4 class="serif text-3xl gold-text">${persona.name}</h4>
      <p class="text-stone-300/75 text-sm mt-1">${persona.years || ""}</p>
      <p class="mt-3 text-stone-100 text-lg">${persona.tagline || ""}</p>
      <p class="mt-3 text-stone-300 leading-7">${getPersonaDescription(persona)}</p>

      <button
        class="open-exhibit-btn mt-6 w-full px-5 py-3 rounded-full bg-[#c6a268] text-black font-semibold hover:opacity-90 transition"
        data-id="${persona.id}"
      >
        Enter Exhibit
      </button>
    </article>
  `).join("");

  document.querySelectorAll(".open-exhibit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      openExhibit(button.dataset.id);
    });
  });
}

function stopIntroAudio() {
  if (currentIntroAudio) {
    currentIntroAudio.pause();
    currentIntroAudio.currentTime = 0;
    currentIntroAudio = null;
  }
}

function playIntroAudio() {
  if (!activePersona) return;

  const introAudioPath = getPersonaIntroAudio(activePersona);
  if (!introAudioPath) {
    console.log(`No intro audio found for ${activePersona.name}`);
    return;
  }

  stopIntroAudio();

  currentIntroAudio = new Audio(introAudioPath);
  currentIntroAudio.volume = 1.0;

  currentIntroAudio.play().catch((error) => {
    console.error("Intro audio failed to play:", error);
  });
}

function expandChamber() {
  isChamberCollapsed = false;
  chamberContent.classList.remove("max-h-0", "opacity-0");
  chamberContent.classList.add("max-h-[260px]", "opacity-100");
  toggleChamberLabel.textContent = "Minimize";
  toggleChamberIcon.textContent = "▲";
  toggleChamberBtn.setAttribute("aria-expanded", "true");
}

function collapseChamber() {
  isChamberCollapsed = true;
  chamberContent.classList.remove("max-h-[260px]", "opacity-100");
  chamberContent.classList.add("max-h-0", "opacity-0");
  toggleChamberLabel.textContent = "Expand";
  toggleChamberIcon.textContent = "▼";
  toggleChamberBtn.setAttribute("aria-expanded", "false");
}

function toggleChamber() {
  if (isChamberCollapsed) {
    expandChamber();
  } else {
    collapseChamber();
  }
}

function openExhibit(personaId) {
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) return;

  activePersona = persona;

  modalName.textContent = persona.name || "";
  modalYears.textContent = persona.years || "";
  modalImage.src = getPersonaImage(persona);
  modalImage.alt = persona.name || "Persona portrait";
  modalTagline.textContent = persona.tagline || "";
  modalIntro.textContent = getPersonaIntro(persona);

  renderSuggestions(persona);
  resetChat(persona);
  expandChamber();

  chatModal.classList.remove("hidden");
  chatModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");

  setTimeout(() => {
    playIntroAudio();
  }, 250);
}

function closeExhibit() {
  stopIntroAudio();
  chatModal.classList.add("hidden");
  chatModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

function renderSuggestions(persona) {
  const suggestions = Array.isArray(persona.suggestions) ? persona.suggestions : [];

  suggestionsContainer.innerHTML = suggestions.map((question) => `
    <button class="suggestion-chip px-4 py-2 rounded-full border border-[#c6a268]/25 text-sm text-[#f5eee6] hover:bg-[#c6a268]/10 transition">
      ${question}
    </button>
  `).join("");

  document.querySelectorAll(".suggestion-chip").forEach((chip, index) => {
    chip.addEventListener("click", () => {
      sendMessage(suggestions[index]);
    });
  });
}

function resetChat(persona) {
  chatMessages.innerHTML = `
    <div class="max-w-2xl rounded-[1.6rem] bg-[#211712] border border-[#c6a268]/15 p-5">
      <p class="text-[#f5eee6] text-lg leading-8">
        Welcome. I am ${persona.name}. Ask your question, and I will guide you through it.
      </p>
    </div>
  `;

  chatMessages.scrollTop = 0;
}

function appendMessage(role, text, footer = "") {
  const wrapper = document.createElement("div");
  wrapper.className = role === "user" ? "flex justify-end" : "flex justify-start";

  const bubble = document.createElement("div");
  bubble.className =
    role === "user"
      ? "max-w-2xl rounded-[1.6rem] bg-[#c6a268] text-black p-5"
      : "max-w-2xl rounded-[1.6rem] bg-[#211712] border border-[#c6a268]/15 p-5";

  bubble.innerHTML = `
    <p class="${role === "user" ? "text-black" : "text-[#f5eee6]"} leading-7">${text}</p>
    ${
      footer
        ? `<p class="mt-3 text-xs uppercase tracking-[0.15em] text-[#e7d9c8]/45">${footer}</p>`
        : ""
    }
  `;

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typingIndicator";
  typing.className = "flex justify-start";

  typing.innerHTML = `
    <div class="max-w-2xl rounded-[1.6rem] bg-[#211712] border border-[#c6a268]/15 p-5 text-[#e7d9c8]/80">
      Thinking...
    </div>
  `;

  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById("typingIndicator");
  if (typing) typing.remove();
}

async function sendMessage(text) {
  if (!activePersona || !text.trim()) return;

  appendMessage("user", text);
  showTyping();

  try {
    const fakeReply = getMockReply(activePersona.name, text);

    setTimeout(() => {
      hideTyping();
      appendMessage(
        "assistant",
        fakeReply,
        `Grounded in ${activePersona.name}'s financial philosophy`
      );
    }, 900);
  } catch (error) {
    hideTyping();
    appendMessage("assistant", "Something went wrong. Please try again.");
    console.error(error);
  }
}

function getMockReply(name, question) {
  return `${name} would likely say: start with discipline, protect your downside, and make decisions that compound over time. Your question was "${question}".`;
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  sendMessage(text);
  chatInput.value = "";
});

closeModalBtn.addEventListener("click", closeExhibit);

chatModal.addEventListener("click", (event) => {
  if (event.target === chatModal) closeExhibit();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeExhibit();
    closeCouncil();
  }
});

playIntroBtn.addEventListener("click", () => {
  playIntroAudio();
});

toggleChamberBtn.addEventListener("click", toggleChamber);

function openCouncil() {
  councilModal.classList.remove("hidden");
  councilModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeCouncil() {
  councilModal.classList.add("hidden");
  councilModal.classList.remove("flex");

  if (!chatModal.classList.contains("flex")) {
    document.body.classList.remove("overflow-hidden");
  }
}

askAllBtn.addEventListener("click", openCouncil);
askCouncilFromModalBtn.addEventListener("click", openCouncil);
closeCouncilBtn.addEventListener("click", closeCouncil);

councilModal.addEventListener("click", (event) => {
  if (event.target === councilModal) closeCouncil();
});

exploreBtn.addEventListener("click", () => {
  document.getElementById("gallery").scrollIntoView({ behavior: "smooth" });
});

councilForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = councilInput.value.trim();
  if (!question) return;

  renderCouncilResults(question);
});

function renderCouncilResults(question) {
  councilResults.innerHTML = personas.map((persona) => `
    <div class="rounded-[1.6rem] border border-[#c6a268]/20 bg-[#16110d] p-5">
      <p class="uppercase tracking-[0.25em] text-[11px] text-[#d8c79b]/70 mb-2">${persona.name}</p>
      <div class="flex gap-2 mb-4 flex-wrap">
        <span class="px-3 py-1 rounded-full text-xs border border-[#c6a268]/25 text-stone-200">Moderate</span>
        <span class="px-3 py-1 rounded-full text-xs border border-[#c6a268]/25 text-stone-200">Long-term</span>
      </div>
      <p class="text-stone-100 leading-7">
        ${persona.name} would advise caution, patience, and intentional decision-making in response to: "${question}"
      </p>
    </div>
  `).join("");

  consensusBox.classList.remove("hidden");
  consensusText.textContent =
    "Consensus: Begin with disciplined saving, avoid impulsive risk, and build a foundation before expanding into long-term investing.";
}

loadPersonas();