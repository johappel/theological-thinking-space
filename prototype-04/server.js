import http from "node:http";
import https from "node:https";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, "public");

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const value = t.slice(i + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile();

const PORT = Number(process.env.PORT || 8787);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MODEL = process.env.MODEL || "deepseek-v4-flash";
const BASE_URL = (process.env.BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const API_URL = `${BASE_URL}/chat/completions`;
const MAX_TOKENS = (() => {
  const raw = process.env.MAX_TOKENS ?? process.env.MAXTOKEN;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 4000;
})();

const ROLE_PROMPTS = {
  companion: `
Du bist der Companion im Theological Thinking Space.
Dein Ziel ist nicht maximale Tiefe, sondern Beweglichkeit theologischen Denkens.
Du entwirfst noch keinen Gottesdienst.

M?gliche Gespr?chsz?ge:
deepen, differentiate, contrast, contextualize, resource, condense, park, threshold.

Anti-Tunnel:
- Wenn die letzten Beitr?ge dieselbe Spur wiederholen, vertiefe nicht automatisch weiter.
- Wenn mehrere Stimmen dieselbe L?sung best?tigen, ?ffne einen plausiblen Kontrast.
- Wenn der Mensch von "ich" auf "alle", "die Gemeinde" oder "die Menschen" schlie?t, unterscheide vorsichtig zwischen Wissen und Vermutung.
- Wiederhole nicht routinem??ig spiegelnde Formulierungen.
- Stelle h?chstens eine echte Frage.
- Unterscheide Erleben der Vorbereitenden und m?gliche sp?tere Rezeption anderer.
- Wenn eine Spur ausreichend verstanden ist, darfst du sie verdichten und verlassen.
`,
  bible: `
Du bist die Perspektive Bibel / Theologie.
Entwirf keinen Gottesdienst. Bringe genau eine theologisch relevante Beobachtung, Spannung oder Frage ein.
Achte auf implizite Gottes- und Menschenbilder, vorschnelle Harmonisierung, m?gliche biblische Resonanzr?ume und die Differenz zwischen Zeugnis und allgemeiner Behauptung.
Wenn kein konkreter Text genannt wurde, erfinde keine Exegese.
Verst?rke eine bereits dominante Spur nicht automatisch.
`,
  liturgy: `
Du bist die Perspektive Liturgie / Praxis.
Entwirf noch keinen Ablauf. Bringe genau eine Beobachtung, Spannung oder Frage ein.
Achte auf K?rper, Raum, Zeit, Schwellen, Stille, Beziehungen, Freiwilligkeit und Nichtteilnahme.
Pr?fe, ob gew?nschte Wirkungen f?r andere vorweggenommen werden.
Verst?rke eine bereits dominante Spur nicht automatisch.
`,
  outside: `
Du bist die Perspektive Au?enblick.
Sprich nicht stellvertretend f?r bestimmte Gruppen.
Mache Voraussetzungen, Machtstrukturen, religi?se Selbstverst?ndlichkeiten und Alternativdeutungen sichtbar.
Pr?fe besonders, ob vom Erleben der Vorbereitenden unbemerkt auf sp?tere Teilnehmende geschlossen wird.
Wenn alle Stimmen dieselbe Spur teilen, ?ffne einen plausiblen Kontrast.
`
};

const JSON_INSTRUCTION = `
Antworte ausschlie?lich als g?ltiges JSON-Objekt:
{
  "message":"sichtbarer Gespr?chsbeitrag auf Deutsch, maximal etwa 120 W?rter",
  "state_candidates":[
    {"type":"resonance|irritation|theological_tension|question|emerging_testimony|unresolved","text":"knapper Kandidat"}
  ],
  "suggested_perspective":{"id":"bible|liturgy|outside","reason":"kurzer Grund"} | null,
  "threshold_readiness":"not_yet|possible|ready",
  "conversation_dynamics":{
    "dominant_theme":"kurze Benennung oder leer",
    "movement":"low|medium|high",
    "risk":"none|tunnel|convergence|overgeneralization",
    "next_move":"deepen|differentiate|contrast|contextualize|resource|condense|park|threshold",
    "note":"knappe Prozessbeobachtung"
  }
}
Regeln:
- h?chstens 2 state_candidates
- conversation_dynamics beschreibt das Gespr?ch, nicht die Person
- bei tunnel oder convergence darf next_move nicht deepen sein
- bei overgeneralization unterscheide eigene Erfahrung und Annahmen ?ber andere
- ready nur bei erkennbarer Denkbewegung
`;

function sendJson(res,status,body){
  const data=JSON.stringify(body);
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Content-Length":Buffer.byteLength(data)});
  res.end(data);
}
async function readJson(req){
  let body="";
  for await (const chunk of req){
    body+=chunk;
    if(body.length>300000) throw new Error("Request too large");
  }
  return JSON.parse(body||"{}");
}
function cleanEvents(events){
  if(!Array.isArray(events)) return [];
  return events.slice(-14).map(e=>({author:String(e.author||"").slice(0,50),text:String(e.text||"").slice(0,4000)}));
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));

function requestJson(url, { method = "GET", headers = {}, body = null, timeoutMs = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const requestHeaders = { ...headers };
    if (body != null && requestHeaders["Content-Length"] == null && requestHeaders["content-length"] == null) {
      requestHeaders["Content-Length"] = Buffer.byteLength(body);
    }

    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers: requestHeaders
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
            text: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(Object.assign(new Error("Connect timeout"), { code: "UND_ERR_CONNECT_TIMEOUT" }));
    });
    req.on("error", reject);
    if (body != null) req.write(body);
    req.end();
  });
}

function requestJsonViaCurl(url, { method = "GET", headers = {}, body = null, timeoutMs = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    const args = ["-sS", "-X", method, url, "--max-time", String(Math.max(1, Math.ceil(timeoutMs / 1000)))];
    for (const [key, value] of Object.entries(headers)) {
      args.push("-H", `${key}: ${value}`);
    }
    if (body != null) args.push("--data-binary", body);
    args.push("-w", "\n__STATUS__:%{http_code}");

    const child = spawn("curl.exe", args, { windowsHide: true });
    const out = [];
    const err = [];
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.stderr.on("data", (chunk) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const stdout = Buffer.concat(out).toString("utf8");
      const stderr = Buffer.concat(err).toString("utf8").trim();
      const marker = "\n__STATUS__:";
      const idx = stdout.lastIndexOf(marker);
      if (idx < 0) {
        const e = new Error(stderr || `curl failed with exit code ${code}`);
        e.code = "CURL_NO_STATUS";
        return reject(e);
      }
      const text = stdout.slice(0, idx);
      const status = Number(stdout.slice(idx + marker.length).trim());
      if (!Number.isFinite(status)) {
        const e = new Error("Invalid status from curl transport");
        e.code = "CURL_BAD_STATUS";
        return reject(e);
      }
      resolve({
        status,
        ok: status >= 200 && status < 300,
        text
      });
    });
  });
}

async function handleThink(req,res){
  if(!DEEPSEEK_API_KEY) return sendJson(res,500,{error:"DEEPSEEK_API_KEY fehlt. Lege eine .env-Datei an."});
  const body=await readJson(req);
  const role=ROLE_PROMPTS[body.role]?body.role:"companion";
  const context={
    starting_point:body.startingPoint||"",
    thinking_state:body.thinkingState||{},
    conversation_dynamics:body.conversationDynamics||{},
    recent_conversation:cleanEvents(body.events),
    current_user_input:String(body.currentInput||"").slice(0,8000),
    forced_move:body.forcedMove||null
  };
  const forced=body.forcedMove?`\nF?r diesen Turn soll der Gespr?chszug "${String(body.forcedMove)}" erprobt werden, sofern er passt.\n`:"";
  const messages=[
    {role:"system",content:`${ROLE_PROMPTS[role]}\n${forced}\n${JSON_INSTRUCTION}`},
    {role:"user",content:"Aktueller Denkraum:\n\n"+JSON.stringify(context,null,2)}
  ];
  const payload=JSON.stringify({
    model:MODEL,
    messages,
    thinking:{type:"enabled"},
    reasoning_effort:"high",
    response_format:{type:"json_object"},
    max_tokens:MAX_TOKENS,
    stream:false
  });

  let upstream,lastError;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      upstream=await requestJson(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${DEEPSEEK_API_KEY}`},
        body:payload,
        timeoutMs:20000
      });
      break;
    }
    catch(err){
      if(process.platform==="win32"){
        try{
          upstream=await requestJsonViaCurl(API_URL,{
            method:"POST",
            headers:{"Content-Type":"application/json","Authorization":`Bearer ${DEEPSEEK_API_KEY}`},
            body:payload,
            timeoutMs:20000
          });
          break;
        }catch(curlErr){
          lastError=curlErr;
        }
      }else{
        lastError=err;
      }
      const fail=lastError||err;
      const code=fail?.cause?.code||fail?.code||"UNKNOWN";
      console.error(`DeepSeek connection failed (${code}), attempt ${attempt}/3`);
      if(attempt<3) await wait(attempt*1000);
    }
  }
  if(!upstream){
    const code=lastError?.cause?.code||lastError?.code||"UNKNOWN";
    return sendJson(res,502,{error:"DeepSeek ist momentan nicht erreichbar.",detail:`Verbindung fehlgeschlagen (${code}) nach drei Versuchen.`});
  }

  const raw=upstream.text;
  if(!upstream.ok) return sendJson(res,upstream.status,{error:"DeepSeek API error",detail:raw.slice(0,3000)});
  let api;
  try{api=JSON.parse(raw)}catch{return sendJson(res,502,{error:"Ung?ltige Antwort der DeepSeek API."})}
  const choice=api?.choices?.[0];
  const content=typeof choice?.message?.content==="string"?choice.message.content.trim():"";
  if(!content) return sendJson(res,502,{error:"DeepSeek lieferte keinen sichtbaren Inhalt.",detail:`finish_reason: ${choice?.finish_reason||"unbekannt"}`});
  let parsed;
  try{parsed=JSON.parse(content)}catch{return sendJson(res,502,{error:"Das Modell lieferte kein parsebares JSON.",detail:content.slice(0,3000)})}
  sendJson(res,200,{role,model:MODEL,result:parsed,usage:api.usage||null,finishReason:choice?.finish_reason||null});
}

function serveStatic(req,res){
  const urlPath=new URL(req.url,`http://${req.headers.host}`).pathname;
  const rel=urlPath==="/"?"index.html":urlPath.replace(/^\/+/,"");
  const file=path.normalize(path.join(PUBLIC,rel));
  if(!file.startsWith(PUBLIC)){res.writeHead(403);return res.end("Forbidden")}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end("Not found")}
  const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};
  res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  fs.createReadStream(file).pipe(res);
}

const server=http.createServer(async(req,res)=>{
  try{
    if(req.method==="POST"&&req.url==="/api/think") return await handleThink(req,res);
    if(req.method==="GET"&&req.url==="/api/health") return sendJson(res,200,{ok:true,prototype:"04",model:MODEL,apiKeyConfigured:Boolean(DEEPSEEK_API_KEY)});
    if(req.method==="GET") return serveStatic(req,res);
    res.writeHead(405);res.end("Method not allowed");
  }catch(err){console.error(err);sendJson(res,500,{error:err?.message||"Internal server error"})}
});

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  server.listen(PORT,()=>console.log(`Theological Thinking Space Prototype 04: http://localhost:${PORT}`));
}
export{server,cleanEvents};
