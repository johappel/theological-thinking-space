const state = {
  mode: "thinking",
  startingPoint: "",
  entries: [],
  thinking_state: {
    resonances: [],
    irritations: [],
    theological_tensions: [],
    questions: [],
    emerging_testimonies: [],
    unresolved: []
  },
  threshold: {}
};

const $ = (id) => document.getElementById(id);

const perspectiveLabels = {
  bible: "Bibel / Theologie",
  liturgy: "Liturgie / Praxis",
  outside: "Außenblick"
};

const prompts = {
  bible: [
    "Welche Aussage über Gott oder den Menschen steckt hier bereits unausgesprochen drin?",
    "Was im biblischen Text sperrt sich vielleicht gegen unsere bisherige Deutung?",
    "Welche Spannung sollten wir nicht vorschnell harmonisieren?"
  ],
  liturgy: [
    "Was geschieht hier eigentlich leiblich, räumlich oder zwischen Menschen – jenseits dessen, was gesagt wird?",
    "Welche Form würde diese Einsicht nicht nur erklären, sondern erfahrbar werden lassen?",
    "Wo droht Beteiligung zu einer stillen Erwartung zu werden?"
  ],
  outside: [
    "Was daran wäre auch für jemanden nachvollziehbar, der die Glaubenssprache nicht teilt?",
    "Welche Erfahrung setzen wir gerade voraus, die andere vielleicht gar nicht machen?",
    "Wo könnte unser Entwurf Menschen ungewollt vereinnahmen?"
  ]
};

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function saveLocal() {
  localStorage.setItem("tts-prototype-02", JSON.stringify(state));
}

function loadLocal() {
  const raw = localStorage.getItem("tts-prototype-02");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
  } catch {}
}

function render() {
  $("introPanel").classList.toggle("hidden", !!state.startingPoint);
  $("workspace").classList.toggle("hidden", !state.startingPoint || state.mode !== "thinking");
  $("thresholdPanel").classList.toggle("hidden", state.mode !== "threshold");
  $("modePill").textContent = state.mode === "thinking" ? "DENKRAUM" : "SCHWELLE";

  const stream = $("stream");
  stream.innerHTML = "";
  state.entries.forEach((entry, index) => {
    const card = document.createElement("article");
    card.className = "entry " + (entry.kind === "human" ? "human" : "");
    card.innerHTML = `
      <div class="meta">${entry.label}</div>
      <p>${escapeHtml(entry.text)}</p>
      <div class="entry-actions">
        <button data-action="resonance" data-index="${index}">Resonanz</button>
        <button data-action="irritation" data-index="${index}">Irritation</button>
        <button data-action="tension" data-index="${index}">Spannung</button>
        <button data-action="question" data-index="${index}">Frage</button>
        <button data-action="testimony" data-index="${index}">Zeugnis?</button>
      </div>`;
    stream.appendChild(card);
  });

  const groups = [
    ["Resonanzen", "resonances"],
    ["Irritationen", "irritations"],
    ["Theologische Spannungen", "theological_tensions"],
    ["Offene Fragen", "questions"],
    ["Vorläufige Zeugnisse", "emerging_testimonies"],
    ["Noch offen", "unresolved"]
  ];

  $("stateLists").innerHTML = groups.map(([label, key]) => {
    const values = state.thinking_state[key];
    return `
      <section class="state-group">
        <h3>${label}</h3>
        ${values.length
          ? `<ul>${values.map(v => `<li>${escapeHtml(v)}</li>`).join("")}</ul>`
          : `<div class="state-empty">Noch nichts festgehalten.</div>`}
      </section>`;
  }).join("");

  saveLocal();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

$("startBtn").addEventListener("click", () => {
  const text = $("startingPoint").value.trim();
  if (!text) return;
  state.startingPoint = text;
  state.entries.push({ kind: "human", label: "DU / TEAM", text });
  render();
});

$("addHumanBtn").addEventListener("click", () => {
  const text = $("messageInput").value.trim();
  if (!text) return;
  state.entries.push({ kind: "human", label: "DU / TEAM", text });
  $("messageInput").value = "";
  render();
});

$("perspectiveBar").addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-perspective]");
  if (!btn) return;
  const perspective = btn.dataset.perspective;
  const text = choose(prompts[perspective]);
  state.entries.push({
    kind: "perspective",
    perspective,
    label: perspectiveLabels[perspective],
    text
  });
  render();
});

$("stream").addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;

  const entry = state.entries[Number(btn.dataset.index)];
  const mapping = {
    resonance: "resonances",
    irritation: "irritations",
    tension: "theological_tensions",
    question: "questions",
    testimony: "emerging_testimonies"
  };

  const bucket = mapping[btn.dataset.action];
  if (bucket && !state.thinking_state[bucket].includes(entry.text)) {
    state.thinking_state[bucket].push(entry.text);
  }
  render();
});

$("thresholdBtn").addEventListener("click", () => {
  state.mode = "threshold";
  render();
});

$("backBtn").addEventListener("click", () => {
  state.mode = "thinking";
  render();
});

$("saveThresholdBtn").addEventListener("click", () => {
  state.threshold = {
    changed: $("changed").value.trim(),
    testimony: $("testimony").value.trim(),
    not_prescribe: $("notPrescribe").value.trim(),
    open_conditions: $("openConditions").value.trim()
  };

  const snapshot = {
    starting_point: state.startingPoint,
    thinking_state: state.thinking_state,
    threshold: state.threshold
  };

  $("snapshot").textContent = JSON.stringify(snapshot, null, 2);
  $("snapshot").classList.remove("hidden");
  saveLocal();
});

loadLocal();

if (state.startingPoint) {
  $("startingPoint").value = state.startingPoint;
}
render();
