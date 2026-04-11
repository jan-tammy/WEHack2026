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

const scrollUpBtn = document.getElementById("scrollUpBtn");
const scrollDownBtn = document.getElementById("scrollDownBtn");
const chatTop = document.getElementById("chatTop");
const chatBottom = document.getElementById("chatBottom");

const askAllBtn = document.getElementById("askAllBtn");
const exploreBtn = document.getElementById("exploreBtn");
const askCouncilFromModalBtn = document.getElementById("askCouncilFromModalBtn");

const closeCouncilBtn = document.getElementById("closeCouncilBtn");
const councilForm = document.getElementById("councilForm");
const councilInput = document.getElementById("councilInput");
const councilResults = document.getElementById("councilResults");
const consensusBox = document.getElementById("consensusBox");
const consensusText = document.getElementById("consensusText");

let personas = [];
let activePersona = null;

function getPersonaImage(persona) {
  return persona.image || persona.portrait || "";
}

function getPersonaIntro(persona) {
  return persona.intro || persona.opening_greeting || "";
}

function getPersonaDescription(persona) {
  return persona.description || persona.opening_greeting || "";
}

async function loadPersonas() {
  try {
    const response = await fetch("./personas.json");
    personas = await response.json();
    renderGallery();
  } catch (error) {
    console.error("Failed to load personas:", error);
  }
}

function renderGallery() {
  gallery.innerHTML = personas.map((persona, index) => `
    <article class="museum-card rounded-3xl p-5 md:p-6 hover:-translate-y-1 hover:shadow-2xl transition duration-300">
      <p class="uppercase tracking-[0.28em] text-[11px] text-[#d8c79b]/70 mb-3">Exhibit ${String(index + 1).padStart(2, "0")}</p>

      <div class="portrait-frame mb-5">
        <div class="portrait-inner">
          <img src="${getPersonaImage(persona)}" alt="${persona.name}" class="w-full h-full object-cover" />
        </div>
      </div>

      <h4 class="serif text-3xl gold-text">${persona.name}</h4>
      <p class="text-stone-300/75 text-sm mt-1">${persona.years}</p>
      <p class="mt-3 text-stone-100 text-lg">${persona.tagline}</p>
      <p class="mt-3 text-stone-300 leading-7">${getPersonaDescription(persona)}</p>

      <button
        class="open-exhibit-btn mt-6 w-full px-5 py-3 rounded-full bg-[#d4af37] text-black font-semibold hover:opacity-90 transition"
        data-id="${persona.id}"
      >
        Enter Exhibit
      </button>
    </article>
  `).join("");

  document.querySelectorAll(".open-exhibit-btn").forEach(button => {
    button.addEventListener("click", () => {
      const personaId = button.dataset.id;
      openExhibit(personaId);
    });
  });
}

function openExhibit(personaId) {
  const persona = personas.find(p => p.id === personaId);
  if (!persona) return;

  activePersona = persona;

  modalName.textContent = persona.name;
  modalYears.textContent = persona.years;
  modalImage.src = getPersonaImage(persona);
  modalImage.alt = persona.name;
  modalTagline.textContent = persona.tagline;
  modalIntro.textContent = getPersonaIntro(persona);

  renderSuggestions(persona);
  resetChat(persona);

  chatModal.classList.remove("hidden");
  chatModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeExhibit() {
  chatModal.classList.add("hidden");
  chatModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

function renderSuggestions(persona) {
  suggestionsContainer.innerHTML = persona.suggestions.map(question => `
    <button class="suggestion-chip px-4 py-2 rounded-full border border-[#d4af37]/30 text-sm hover:bg-[#d4af37]/10 transition">
      ${question}
    </button>
  `).join("");

  document.querySelectorAll(".suggestion-chip").forEach((chip, index) => {
    chip.addEventListener("click", () => {
      sendMessage(persona.suggestions[index]);
    });
  });
}

function resetChat(persona) {
  chatMessages.innerHTML = `
    <div class="max-w-2xl rounded-2xl bg-[#1c1611] border border-[#d4af37]/15 p-4">
      <p class="text-stone-200">
        Welcome. I am ${persona.name}. Ask your question, and I will guide you through it.
      </p>
    </div>
  `;
}

function appendMessage(role, text, footer = "") {
  const wrapper = document.createElement("div");
  wrapper.className = role === "user" ? "flex justify-end" : "flex justify-start";

  const bubble = document.createElement("div");
  bubble.className =
    role === "user"
      ? "max-w-2xl rounded-2xl bg-[#d4af37] text-black p-4"
      : "max-w-2xl rounded-2xl bg-[#1c1611] border border-[#d4af37]/15 p-4";

  bubble.innerHTML = `
    <p class="${role === "user" ? "text-black" : "text-stone-100"} leading-7">${text}</p>
    ${
      footer
        ? `<p class="mt-3 text-xs uppercase tracking-[0.15em] text-stone-400">${footer}</p>`
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
    <div class="max-w-2xl rounded-2xl bg-[#1c1611] border border-[#d4af37]/15 p-4 text-stone-300">
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
    // Placeholder until Gemini backend is connected
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

const _audioMap = {
  "warren-buffett": "../assets/audio/warren-greeting.mp3",
  "madam-cj-walker": "../assets/audio/walker-greeting.mp3",
  "benjamin-franklin": "../assets/audio/franklin-greeting.mp3",
};

function getPersonaAudioPath(persona) {
  if (!persona || !persona.id) return null;
  if (_audioMap[persona.id]) return _audioMap[persona.id];
  const key = persona.id.toLowerCase();
  if (key.includes("warren")) return _audioMap["warren-buffett"];
  if (key.includes("walker") || key.includes("madam")) return _audioMap["madam-cj-walker"];
  if (key.includes("franklin") || key.includes("benjamin")) return _audioMap["benjamin-franklin"];
  return null;
}

playIntroBtn.addEventListener("click", () => {
  if (!activePersona) return;
  const path = getPersonaAudioPath(activePersona);
  if (!path) {
    console.warn("No intro audio available for:", activePersona.id);
    return;
  }

  try {
    const audio = new Audio(path);
    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  } catch (err) {
    console.error("Unable to play intro audio:", err);
  }
});

scrollUpBtn.addEventListener("click", () => {
  chatTop.scrollIntoView({ behavior: "smooth", block: "start" });
});

scrollDownBtn.addEventListener("click", () => {
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth"
  });
});

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

councilForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = councilInput.value.trim();
  if (!question) return;

  renderCouncilResults(question);
});

function renderCouncilResults(question) {
  councilResults.innerHTML = personas.map(persona => `
    <div class="rounded-3xl border border-[#d4af37]/20 bg-[#16110d] p-5">
      <p class="uppercase tracking-[0.25em] text-[11px] text-[#d8c79b]/70 mb-2">${persona.name}</p>
      <div class="flex gap-2 mb-4">
        <span class="px-3 py-1 rounded-full text-xs border border-[#d4af37]/25 text-stone-200">Moderate</span>
        <span class="px-3 py-1 rounded-full text-xs border border-[#d4af37]/25 text-stone-200">Long-term</span>
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