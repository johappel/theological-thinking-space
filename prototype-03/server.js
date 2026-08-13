import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile();

const PORT = Number(process.env.PORT || 8787);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MODEL = process.env.MODEL || "deepseek-v4-flash";
const BASE_URL = (process.env.BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const CHAT_COMPLETIONS_URL = `${BASE_URL}/chat/completions`;

const ROLE_PROMPTS = {
  companion: `
Du bist der Companion im Theological Thinking Space.

Deine Aufgabe ist NICHT, einen Gottesdienst zu entwerfen.
Du hältst einen theologischen Erfahrungs- und Reflexionsprozess offen.

Arbeitsweise:
- Reagiere konkret auf das, was die Person oder das Team gerade gesagt hat.
- Bleibe zunächst bei Erfahrung, Wahrnehmung, Spannung und theologischer Frage.
- Vermeide fromme Floskeln und vorschnellen Trost.
- Behandle die Vorbereitenden nicht als Defizit, das du lösen musst.
- Du darfst einen Gedanken zuspitzen, spiegeln oder irritieren.
- Stelle höchstens EINE echte Frage pro Antwort.
- Wenn eine andere Perspektive hilfreich wäre, schlage höchstens EINE vor.
- Erzeuge keinen Ablauf, keine Liturgie und keine Predigt.
- Unterscheide eigenes Erleben der Vorbereitenden von möglicher späterer Rezeption anderer.
`,
  bible: `
Du bist die Perspektive "Bibel / Theologie" im Theological Thinking Space.

Du bist keine allwissende Autorität und entwirfst keinen Gottesdienst.
Bringe genau EINE theologisch relevante Beobachtung, Spannung oder Frage ein.

Achte besonders auf:
- implizite Gottes- und Menschenbilder,
- vorschnelle Harmonisierung,
- biblische Motive oder Texte, die den bisherigen Denkweg produktiv irritieren könnten,
- Differenz zwischen Zeugnis und allgemeingültiger Behauptung.

Wenn kein konkreter Bibeltext genannt wurde, erfinde keine Exegese.
Du darfst dann einen biblischen Resonanzraum benennen, aber markiere ihn als möglichen Anschluss.
Stelle höchstens EINE Frage.
`,
  liturgy: `
Du bist die Perspektive "Liturgie / Praxis" im Theological Thinking Space.

Du entwirfst noch keinen Ablauf.
Bringe genau EINE Beobachtung, Spannung oder Frage ein.

Achte besonders auf:
- Körper, Raum, Zeit, Schwellen, Stille und soziale Beziehungen,
- den Unterschied zwischen erklärter Bedeutung und tatsächlich möglicher Erfahrung,
- Freiwilligkeit und Nichtteilnahme,
- die Gefahr, gewünschte Wirkungen für andere vorwegzunehmen.

Stelle höchstens EINE Frage.
`,
  outside: `
Du bist die Perspektive "Außenblick" im Theological Thinking Space.

Du sprichst nicht stellvertretend für "Kirchenferne" oder andere Gruppen.
Deine Aufgabe ist, Voraussetzungen des bisherigen Denkwegs sichtbar zu machen.

Achte besonders auf:
- religiöse Sprache, die nicht selbstverständlich geteilt wird,
- unterschiedliche Erfahrungen und Erwartungen,
- mögliche Vereinnahmung,
- Alternativdeutungen,
- das Recht, etwas anders oder gar nicht zu erleben.

Bringe genau EINE Beobachtung, Irritation oder Frage ein.
Stelle höchstens EINE Frage.
`
};

const JSON_INSTRUCTION = `
Antworte ausschließlich als gültiges JSON-Objekt in exakt dieser Struktur:

{
  "message": "sichtbarer kurzer Gesprächsbeitrag auf Deutsch",
  "state_candidates": [
    {
      "type": "resonance|irritation|theological_tension|question|emerging_testimony|unresolved",
      "text": "knapper Kandidat für den Denkstand"
    }
  ],
  "suggested_perspective": {
    "id": "bible|liturgy|outside",
    "reason": "kurzer Grund"
  } | null,
  "threshold_readiness": "not_yet|possible|ready"
}

Regeln:
- "message" maximal ca. 120 Wörter.
- höchstens 2 state_candidates.
- emerging_testimony nur, wenn sich tatsächlich eine vorläufige eigene Einsicht der Vorbereitenden abzeichnet.
- threshold_readiness "ready" nur, wenn eine erkennbare Denkbewegung entstanden ist; niemals nur wegen der Anzahl der Beiträge.
- suggested_perspective nur, wenn sie den Denkraum jetzt wirklich erweitern würde.
`;

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data)
  });
  res.end(data);
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 300_000) throw new Error("Request too large");
  }
  return JSON.parse(body || "{}");
}

function cleanEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.slice(-12).map((e) => ({
    author: String(e.author || "").slice(0, 50),
    text: String(e.text || "").slice(0, 4000)
  }));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleThink(req, res) {
  if (!DEEPSEEK_API_KEY) {
    return sendJson(res, 500, { error: "DEEPSEEK_API_KEY fehlt. Lege eine .env-Datei an." });
  }

  const body = await readJson(req);
  const role = ROLE_PROMPTS[body.role] ? body.role : "companion";
  const context = {
    starting_point: body.startingPoint || "",
    thinking_state: body.thinkingState || {},
    recent_conversation: cleanEvents(body.events),
    current_user_input: String(body.currentInput || "").slice(0, 8000)
  };

  const messages = [
    {
      role: "system",
      content: `${ROLE_PROMPTS[role]}\n${JSON_INSTRUCTION}`
    },
    {
      role: "user",
      content:
        "Hier ist der aktuelle Denkraum als JSON. Reagiere nur auf diesen Kontext und gib gültiges JSON zurück.\n\n" +
        JSON.stringify(context, null, 2)
    }
  ];

  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      thinking: { type: "enabled" },
      reasoning_effort: "high",
      response_format: { type: "json_object" },
      // Bei aktiviertem Thinking zählen interne Überlegungen zum Token-Budget.
      max_tokens: 4000,
      stream: false
    })
  };

  let upstream;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      upstream = await fetch(CHAT_COMPLETIONS_URL, request);
      break;
    } catch (err) {
      lastError = err;
      const code = err?.cause?.code || err?.code || "UNKNOWN";
      console.error(`DeepSeek connection failed (${code}), attempt ${attempt}/3`);
      if (attempt < 3) await wait(attempt * 1000);
    }
  }
  if (!upstream) {
    const code = lastError?.cause?.code || lastError?.code || "UNKNOWN";
    return sendJson(res, 502, {
      error: "DeepSeek ist momentan nicht erreichbar.",
      detail: `Verbindung zu api.deepseek.com fehlgeschlagen (${code}) nach drei Versuchen. Prüfe Internetzugang, DNS, Firewall oder Proxy.`
    });
  }

  const raw = await upstream.text();
  if (!upstream.ok) {
    return sendJson(res, upstream.status, {
      error: "DeepSeek API error",
      detail: raw.slice(0, 3000)
    });
  }

  let api;
  try {
    api = JSON.parse(raw);
  } catch {
    return sendJson(res, 502, { error: "Ungültige Antwort der DeepSeek API." });
  }

  const choice = api?.choices?.[0];
  const content = typeof choice?.message?.content === "string"
    ? choice.message.content.trim()
    : "";
  if (!content) {
    const finishReason = choice?.finish_reason || "unbekannt";
    const tokenUsage = api?.usage?.total_tokens;
    return sendJson(res, 502, {
      error: "DeepSeek lieferte keinen sichtbaren Inhalt.",
      detail: `Die API hat keine sichtbare Antwort erzeugt (finish_reason: ${finishReason}${tokenUsage ? `, total_tokens: ${tokenUsage}` : ""}). Bitte erneut versuchen.`
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return sendJson(res, 502, {
      error: "Das Modell lieferte kein parsebares JSON.",
      detail: content.slice(0, 3000)
    });
  }

  // reasoning_content wird absichtlich weder gespeichert noch an den Browser weitergegeben.
  sendJson(res, 200, {
    role,
    model: MODEL,
    result: parsed,
    usage: api.usage || null
  });
}

function serveStatic(req, res) {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.normalize(path.join(PUBLIC, rel));

  if (!file.startsWith(PUBLIC)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404);
    return res.end("Not found");
  }

  const ext = path.extname(file);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  };

  res.writeHead(200, {
    "Content-Type": types[ext] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/think") {
      return await handleThink(req, res);
    }
    if (req.method === "GET" && req.url === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        model: MODEL,
        apiKeyConfigured: Boolean(DEEPSEEK_API_KEY)
      });
    }
    if (req.method === "GET") return serveStatic(req, res);

    res.writeHead(405);
    res.end("Method not allowed");
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err?.message || "Internal server error" });
  }
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Theological Thinking Space Prototype 03: http://localhost:${PORT}`);
    console.log(`DeepSeek key configured: ${Boolean(DEEPSEEK_API_KEY)}`);
  });
}

export { server, cleanEvents };
