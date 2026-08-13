const STORAGE_KEY = "tts-prototype-03";

const emptyState = () => ({
  startingPoint: "",
  mode: "thinking",
  events: [],
  thinkingState: {
    resonances: [],
    irritations: [],
    theological_tensions: [],
    questions: [],
    emerging_testimonies: [],
    unresolved: []
  },
  pendingCandidates: [],
  suggestion: null,
  readiness: "not_yet",
  threshold: {}
});

let state = load() || emptyState();
let busy = false;

const $ = (id) => document.getElementById(id);
const labels = {
  companion: "COMPANION",
  bible: "BIBEL / THEOLOGIE",
  liturgy: "LITURGIE / PRAXIS",
  outside: "AUSSENBLICK",
  human: "DU / TEAM"
};
const bucketLabels = {
  resonances: "Resonanzen",
  irritations: "Irritationen",
  theological_tensions: "Theologische Spannungen",
  questions: "Offene Fragen",
  emerging_testimonies: "Vorläufige Zeugnisse",
  unresolved: "Noch offen"
};
const typeToBucket = {
  resonance: "resonances",
  irritation: "irritations",
  theological_tension: "theological_tensions",
  question: "questions",
  emerging_testimony: "emerging_testimonies",
  unresolved: "unresolved"
};

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } }
function esc(s=""){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}

function render(){
  $("startPanel").classList.toggle("hidden", !!state.startingPoint);
  $("thinkingView").classList.toggle("hidden", !state.startingPoint || state.mode !== "thinking");
  $("thresholdView").classList.toggle("hidden", state.mode !== "threshold");
  $("modeBadge").textContent = state.mode === "thinking" ? "DENKRAUM" : "SCHWELLE";

  const stream = $("stream");
  stream.innerHTML = state.events.map(e => `
    <article class="entry ${e.author === "human" ? "human" : e.author === "companion" ? "companion" : "perspective"}">
      <div class="meta">${esc(labels[e.author] || e.author)}</div>
      <p>${esc(e.text)}</p>
    </article>`).join("");

  requestAnimationFrame(() => { stream.scrollTop = stream.scrollHeight; });

  $("stateGroups").innerHTML = Object.entries(bucketLabels).map(([key,label]) => {
    const items = state.thinkingState[key] || [];
    return `<section class="state-group"><h3>${label}</h3>${
      items.length ? `<ul>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>` : `<div class="empty">Noch nichts festgehalten.</div>`
    }</section>`;
  }).join("");

  $("candidateArea").classList.toggle("hidden", !state.pendingCandidates.length);
  $("candidateList").innerHTML = state.pendingCandidates.map((c,i)=>`
    <div class="candidate">
      <p><strong>${esc(bucketLabels[typeToBucket[c.type]] || c.type)}:</strong> ${esc(c.text)}</p>
      <div class="candidate-actions">
        <button data-candidate="${i}" data-action="accept">Festhalten</button>
        <button class="reject" data-candidate="${i}" data-action="reject">Verwerfen</button>
      </div>
    </div>`).join("");

  const readinessText = {
    not_yet: "noch im Prozess",
    possible: "Schwelle wird denkbar",
    ready: "Schwelle erscheint tragfähig"
  };
  $("readiness").textContent = readinessText[state.readiness] || "noch im Prozess";

  if (state.suggestion) {
    $("suggestionBox").classList.remove("hidden");
    $("suggestionBox").innerHTML = `
      <strong>${esc(labels[state.suggestion.id] || "Perspektive")} könnte hilfreich sein.</strong><br>
      ${esc(state.suggestion.reason || "")}<br>
      <button data-suggested-role="${esc(state.suggestion.id)}">Perspektive einladen</button>`;
  } else {
    $("suggestionBox").classList.add("hidden");
    $("suggestionBox").innerHTML = "";
  }

  $("loading").classList.toggle("hidden", !busy);
  document.querySelectorAll("button").forEach(b => b.disabled = busy && !b.classList.contains("always"));
  save();
}

async function callThink(role, currentInput=""){
  busy = true; clearError(); render();
  try {
    const response = await fetch("/api/think", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        role,
        startingPoint: state.startingPoint,
        thinkingState: state.thinkingState,
        events: state.events,
        currentInput
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || data.error || `HTTP ${response.status}`);

    const result = data.result || {};
    if (result.message) {
      state.events.push({author: role, text: result.message});
    }
    if (Array.isArray(result.state_candidates)) {
      state.pendingCandidates.push(...result.state_candidates
        .filter(c => c && typeToBucket[c.type] && c.text)
        .slice(0,2));
    }
    state.suggestion = result.suggested_perspective || null;
    state.readiness = result.threshold_readiness || state.readiness;
  } catch (err) {
    showError(err.message || String(err));
  } finally {
    busy = false; render();
  }
}

$("startBtn").addEventListener("click", async ()=>{
  const text = $("startInput").value.trim();
  if (!text) return;
  state.startingPoint = text;
  state.events.push({author:"human",text});
  render();
  await callThink("companion", text);
});

$("sendBtn").addEventListener("click", async ()=>{
  const text = $("messageInput").value.trim();
  if (!text || busy) return;
  $("messageInput").value = "";
  state.events.push({author:"human",text});
  state.suggestion = null;
  render();
  await callThink("companion", text);
});

$("messageInput").addEventListener("keydown", e=>{
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") $("sendBtn").click();
});

$("perspectiveToggle").addEventListener("click", ()=>{
  $("perspectivePicker").classList.toggle("hidden");
});

$("perspectivePicker").addEventListener("click", async e=>{
  const btn = e.target.closest("button[data-role]");
  if (!btn || busy) return;
  $("perspectivePicker").classList.add("hidden");
  state.suggestion = null;
  render();
  await callThink(btn.dataset.role, "");
});

$("suggestionBox").addEventListener("click", async e=>{
  const btn = e.target.closest("button[data-suggested-role]");
  if (!btn || busy) return;
  const role = btn.dataset.suggestedRole;
  state.suggestion = null;
  render();
  await callThink(role, "");
});

$("candidateList").addEventListener("click", e=>{
  const btn = e.target.closest("button[data-candidate]");
  if (!btn) return;
  const i = Number(btn.dataset.candidate);
  const candidate = state.pendingCandidates[i];
  if (!candidate) return;
  if (btn.dataset.action === "accept") {
    const bucket = typeToBucket[candidate.type];
    if (bucket && !state.thinkingState[bucket].includes(candidate.text)) {
      state.thinkingState[bucket].push(candidate.text);
    }
  }
  state.pendingCandidates.splice(i,1);
  render();
});

$("thresholdBtn").addEventListener("click", ()=>{
  state.mode = "threshold";
  const meaningful = [
    ...state.thinkingState.theological_tensions,
    ...state.thinkingState.emerging_testimonies,
    ...state.thinkingState.questions
  ].slice(0,6);
  $("thresholdSummary").innerHTML = meaningful.length
    ? `<strong>Spuren aus dem Denkraum:</strong><ul>${meaningful.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`
    : "Der Denkstand ist noch sehr offen. Du kannst trotzdem an die Schwelle treten und prüfen, was sich bereits verändert hat.";
  render();
});

$("backBtn").addEventListener("click", ()=>{ state.mode="thinking"; render(); });

$("snapshotBtn").addEventListener("click", ()=>{
  state.threshold = {
    changed: $("changedInput").value.trim(),
    testimony: $("testimonyInput").value.trim(),
    not_to_prescribe: $("openInput").value.trim(),
    open_conditions: $("conditionsInput").value.trim()
  };
  const snapshot = {
    starting_point: state.startingPoint,
    thinking_state: state.thinkingState,
    threshold: state.threshold
  };
  $("snapshot").textContent = JSON.stringify(snapshot,null,2);
  $("snapshot").classList.remove("hidden");
  save();
});

$("resetBtn").addEventListener("click", ()=>{
  if (!confirm("Diese lokale Prototype-Session wirklich zurücksetzen?")) return;
  state = emptyState();
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});

function showError(msg){ $("errorBox").textContent=msg; $("errorBox").classList.remove("hidden"); }
function clearError(){ $("errorBox").classList.add("hidden"); $("errorBox").textContent=""; }

render();
