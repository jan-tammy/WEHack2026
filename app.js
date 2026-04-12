const gallery = document.getElementById("gallery");
const chatModal = document.getElementById("chatModal");
const councilModal = document.getElementById("councilModal");

const mName = document.getElementById("mName");
const mYears = document.getElementById("mYears");
const mField = document.getElementById("mField");
const mImg = document.getElementById("mImg");
const mTagline = document.getElementById("mTagline");
const mIntro = document.getElementById("mIntro");
const breadcrumbName = document.getElementById("breadcrumbName");

const suggestions = document.getElementById("suggestions");
const chatMsgs = document.getElementById("chatMsgs");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalBtn2 = document.getElementById("closeModalBtn2");
const closeModalBtn3 = document.getElementById("closeModalBtn3");

const playBtn = document.getElementById("playBtn");
const playLabel = document.getElementById("playLabel");

const navLogo = document.querySelector(".nav-logo");
const heroCouncilBtn = document.getElementById("heroCouncilBtn");
const councilFromModal = document.getElementById("councilFromModal");

const navLoginBtn = document.getElementById("navLoginBtn");

const closeCouncilBtn = document.getElementById("closeCouncilBtn");
const councilForm = document.getElementById("councilForm");
const councilInput = document.getElementById("councilInput");
const councilResults = document.getElementById("councilResults");
const consensusBox = document.getElementById("consensusBox");
const consensusText = document.getElementById("consensusText");

let personas = [];
let activePersona = null;
let currentAudio = null;
let isPlaying = false;

function scrollToGallery() {
  document.getElementById("gallery-section")?.scrollIntoView({ behavior: "smooth" });
}

function getPersonaImage(persona) {
  return persona.portrait || persona.image || "";
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

    const data = await response.json();
    personas = Array.isArray(data) ? data : (data.personas || []);
    renderGallery();
    renderBanner();
  } catch (error) {
    console.error("Failed to load personas:", error);
    gallery.innerHTML = `
      <p class="error-msg">
        Could not load personas.json. Make sure it is in the project root next to index.html and app.js.
      </p>
    `;
  }
}

function renderGallery() {
  gallery.innerHTML = personas.map((persona, index) => {
    const num = String(index + 1).padStart(2, "0");
    const tags = (persona.philosophy || []).slice(0, 3).map(tag => `
      <span class="tag">${tag}</span>
    `).join("");

    return `
      <article class="exhibit-card fade-in" data-id="${persona.id}" role="button" tabindex="0" aria-label="Enter ${persona.name} exhibit">
        <div class="frame-wrap">
          <div class="frame-shadow">
            <img
              src="${getPersonaImage(persona)}"
              alt="Portrait of ${persona.name}"
              loading="lazy"
              width="300"
              height="400"
            />
          </div>
        </div>
        <div class="card-num">Exhibit ${num}</div>
        <h3 class="card-name">${persona.name}</h3>
        <p class="card-years">${persona.years || ""}</p>
        <p class="card-tagline">${persona.tagline || ""}</p>
        <p class="card-desc">${getPersonaDescription(persona)}</p>
        ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        <span class="card-link">— Enter Exhibit</span>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".exhibit-card").forEach((card) => {
    card.addEventListener("click", () => openExhibit(card.dataset.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExhibit(card.dataset.id);
      }
    });
  });
}

function renderBanner() {
  const franklin = personas.find((p) => p.id === "benjamin-franklin");
  const source = franklin || personas[0];
  if (!source) return;

  const quote = source.tagline || "An investment in knowledge pays the best interest.";
  const bannerQuote = document.getElementById("bannerQuote");
  bannerQuote.innerHTML = `
    <p class="banner-text">"${quote}"</p>
    <p class="banner-attr">— ${source.name}</p>
  `;
}

function updatePlayButton() {
  playLabel.textContent = isPlaying ? "❚❚ Pause Intro" : "Play Intro";
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isPlaying = false;
  updatePlayButton();
}

function toggleIntroAudio() {
  if (!activePersona) return;

  const introAudioPath = getPersonaIntroAudio(activePersona);
  if (!introAudioPath) {
    console.warn(`No intro audio for ${activePersona.name}`);
    return;
  }

  if (!currentAudio) {
    currentAudio = new Audio(introAudioPath);
    currentAudio.preload = "auto";
    currentAudio.addEventListener("ended", stopAudio);
    currentAudio.addEventListener("error", () => {
      console.error("Intro audio failed:", currentAudio?.error);
      stopAudio();
    });

    currentAudio.play()
      .then(() => {
        isPlaying = true;
        updatePlayButton();
      })
      .catch((error) => {
        console.error("Could not play intro audio:", error);
        stopAudio();
      });
    return;
  }

  if (isPlaying) {
    currentAudio.pause();
    isPlaying = false;
    updatePlayButton();
  } else {
    currentAudio.play()
      .then(() => {
        isPlaying = true;
        updatePlayButton();
      })
      .catch((error) => {
        console.error("Could not resume intro audio:", error);
      });
  }
}

function openExhibit(personaId) {
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) return;

  activePersona = persona;
  stopAudio();

  mName.textContent = persona.name || "";
  mYears.textContent = persona.years || "";
  mField.textContent = persona.field || "";
  mImg.src = getPersonaImage(persona);
  mImg.alt = `Portrait of ${persona.name || "persona"}`;
  mTagline.textContent = persona.tagline || "";
  mIntro.textContent = getPersonaIntro(persona);
  breadcrumbName.textContent = persona.name || "";

  renderSuggestions(persona);
  resetChat(persona);

  chatModal.classList.add("open");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    chatInput?.focus();
  }, 100);
}

function closeExhibit() {
  stopAudio();
  chatModal.classList.remove("open");

  if (!councilModal.classList.contains("open")) {
    document.body.style.overflow = "";
  }
}

function renderSuggestions(persona) {
  const list = Array.isArray(persona.suggestions) ? persona.suggestions : [];

  suggestions.innerHTML = list.map((question) => `
    <button class="chip" type="button">${question}</button>
  `).join("");

  suggestions.querySelectorAll(".chip").forEach((chip, index) => {
    chip.addEventListener("click", () => {
      sendMessage(list[index]);
    });
  });
}

function resetChat(persona) {
  chatMsgs.innerHTML = "";
  appendMessage(
    "ai",
    `Welcome. I am ${persona.name}. Ask your question, and I will guide you through it.`
  );
}

function appendMessage(role, text, footer = "") {
  const row = document.createElement("div");
  row.className = `msg-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.innerHTML = `
    <div>${text}</div>
    ${footer ? `<div class="footnote">${footer}</div>` : ""}
  `;

  row.appendChild(bubble);
  chatMsgs.appendChild(row);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function showTyping() {
  const row = document.createElement("div");
  row.id = "typingRow";
  row.className = "msg-row ai";
  row.innerHTML = `
    <div class="bubble ai">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatMsgs.appendChild(row);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function hideTyping() {
  document.getElementById("typingRow")?.remove();
}

async function sendMessage(text) {
  if (!activePersona || !text.trim()) return;

  appendMessage("user", text);
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        personaId: activePersona.id
      })
    });

    const data = await response.json();
    hideTyping();

    if (!response.ok) {
      appendMessage(
        "ai",
        data.message || activePersona.fallback || "Something went wrong. Please try again."
      );
      console.error("Chat API error:", data);
      return;
    }

    appendMessage(
      "ai",
      data.reply,
      `Grounded in ${activePersona.name}'s financial philosophy`
    );
  } catch (error) {
    hideTyping();
    appendMessage(
      "ai",
      activePersona?.fallback || "Something went wrong. Please try again."
    );
    console.error("sendMessage error:", error);
  }
}

function openCouncil() {
  councilModal.classList.add("open");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    councilInput?.focus();
  }, 100);
}

function closeCouncil() {
  councilModal.classList.remove("open");

  if (!chatModal.classList.contains("open")) {
    document.body.style.overflow = "";
  }
}

function renderCouncilResults(question) {
  councilResults.innerHTML = personas.map((persona) => `
    <div class="council-card">
      <div class="council-card-hdr">
        <span class="council-card-name">${persona.name}</span>
        <div class="council-tags">
          ${persona.riskProfile ? `<span class="tag">${persona.riskProfile}</span>` : ""}
          ${persona.timeHorizon ? `<span class="tag">${persona.timeHorizon}</span>` : ""}
        </div>
      </div>
      <p class="council-card-text">
        ${persona.tagline || `${persona.name} would advise patience, discipline, and thoughtful decision-making.`}
      </p>
    </div>
  `).join("");

  consensusBox.classList.add("visible");
  consensusText.textContent =
    "Across all perspectives, one truth emerges: begin with discipline, build through consistency, and let time do the heavy lifting.";
}

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  sendMessage(text);
  chatInput.value = "";
});

chatInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    sendMessage(text);
    chatInput.value = "";
  }
});

closeModalBtn?.addEventListener("click", closeExhibit);
closeModalBtn2?.addEventListener("click", closeExhibit);
closeModalBtn3?.addEventListener("click", closeExhibit);

chatModal?.addEventListener("click", (event) => {
  if (event.target === chatModal) closeExhibit();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeExhibit();
    closeCouncil();
  }
});

playBtn?.addEventListener("click", toggleIntroAudio);

heroCouncilBtn?.addEventListener("click", openCouncil);
councilFromModal?.addEventListener("click", openCouncil);
closeCouncilBtn?.addEventListener("click", closeCouncil);

councilModal?.addEventListener("click", (event) => {
  if (event.target === councilModal) closeCouncil();
});

councilForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = councilInput.value.trim();
  if (!question) return;
  renderCouncilResults(question);
});

navLogo?.addEventListener("click", scrollToGallery);

navLoginBtn?.addEventListener("click", () => {
  window.location.href = "./login.html";
});

loadPersonas();