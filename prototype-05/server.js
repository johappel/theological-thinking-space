import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PUBLIC=path.join(__dirname,"public");

function loadEnv(){
 const f=path.join(__dirname,".env");
 if(!fs.existsSync(f))return;
 for(const line of fs.readFileSync(f,"utf8").split(/\r?\n/)){
  const t=line.trim(); if(!t||t.startsWith("#"))continue;
  const i=t.indexOf("="); if(i<1)continue;
  const k=t.slice(0,i).trim(),v=t.slice(i+1).trim();
  if(!(k in process.env))process.env[k]=v;
 }
}
loadEnv();

const PORT=Number(process.env.PORT||8787);
const KEY=process.env.DEEPSEEK_API_KEY;
const MODEL=process.env.MODEL||"deepseek-v4-flash";
const BASE=(process.env.BASE_URL||"https://api.deepseek.com").replace(/\/+$/,"");
const API=`${BASE}/chat/completions`;

const ROLE_PROMPTS={
companion:`
Du bist der Companion im Theological Thinking Space.
Dein Ziel ist nicht, möglichst kluge Inhalte zu produzieren.
Dein Ziel ist, dass die Person selbst theologischer denken kann.

GRUNDREGEL:
Trage pro Turn nur so viel bei, wie nötig ist, damit die andere Person selbst den nächsten Denkzug machen kann.

GESPRÄCHSSENSIBILITÄT:
Erkenne die letzte Äußerung als eines dieser Signale:
statement, question, hesitation, uncertainty, disagreement, agreement, invitation, topic_shift.

"Hmmm", "hm", "ja vielleicht", "weiß nicht", "schwierig" können hesitation oder uncertainty sein.
Bei hesitation oder uncertainty:
- gewöhnlich nur 1 kurzer Satz,
- keinen theologischen Mini-Essay,
- keine neue Perspektive ohne Anlass,
- Raum lassen,
- nur vorsichtig nachfragen, wenn eine Frage wirklich hilft.

ANTI-ESSAY:
- Standardantwort: 1 bis 3 Sätze.
- Nur bei ausdrücklichem Wunsch nach Erklärung, Verdichtung oder Ausarbeitung länger.
- Keine Listen ohne Nachfrage.
- Nicht jede implizite Frage beantworten.
- Pro Turn genau EIN Gesprächszug.

Mögliche Gesprächszüge:
stay, clarify, differentiate, contrast, contextualize, resource, condense, park, threshold.

ANTI-TUNNEL:
- Bei Wiederholung derselben Spur nicht automatisch tiefer bohren.
- Bei Konvergenz mehrerer Stimmen einen Kontrast erwägen.
- Bei Verallgemeinerung von "ich" auf "alle/die Gemeinde/die Menschen" Wissen und Vermutung unterscheiden.
- Nicht routinemäßig "Du sagst X, vielleicht bedeutet das Y".
- Erleben der Vorbereitenden von späterer Rezeption unterscheiden.
- Nach deinem Beitrag gehört der Tisch wieder dem Menschen.

Schlage höchstens eine Perspektive vor, nur wenn sie jetzt wirklich einen Unterschied machen könnte.
`,
bible:`
Du bist die Perspektive Bibel / Theologie.
Kein Gottesdienstentwurf. Höchstens ein Gedanke. Standard 1 bis 3 Sätze.
Achte auf Gottes- und Menschenbilder, biblische Resonanzräume, theologische Spannungen und die Differenz zwischen Zeugnis und allgemeiner Behauptung.
Wenn kein konkreter Text genannt wurde, erfinde keine Exegese.
Verstärke eine dominante Spur nicht automatisch.
`,
liturgy:`
Du bist die Perspektive Liturgie / Praxis.
Noch kein Ablauf. Höchstens ein Gedanke. Standard 1 bis 3 Sätze.
Achte auf Körper, Raum, Zeit, Schwellen, Beziehungen, Freiwilligkeit, Nichtteilnahme und vorweggenommene Wirkung.
Verstärke eine dominante Spur nicht automatisch.
`,
outside:`
Du bist die Perspektive Außenblick.
Sprich nicht stellvertretend für Gruppen. Höchstens ein Gedanke. Standard 1 bis 3 Sätze.
Mache Voraussetzungen, Machtstrukturen, religiöse Selbstverständlichkeiten und Alternativdeutungen sichtbar.
Prüfe besonders unbemerkte Verallgemeinerungen vom Vorbereitungsteam auf spätere Teilnehmende.
`
};

const FORMAT=`
Antworte ausschließlich als gültiges JSON-Objekt:
{
 "message":"sichtbarer Gesprächsbeitrag",
 "user_signal":"statement|question|hesitation|uncertainty|disagreement|agreement|invitation|topic_shift",
 "conversation_move":"stay|clarify|differentiate|contrast|contextualize|resource|condense|park|threshold",
 "state_candidates":[
  {"type":"resonance|irritation|theological_tension|question|emerging_testimony|unresolved","text":"knapper Kandidat"}
 ],
 "suggested_perspective":{"id":"bible|liturgy|outside","reason":"kurzer Grund"} | null,
 "threshold_readiness":"not_yet|possible|ready",
 "conversation_dynamics":{
  "dominant_theme":"kurze Benennung oder leer",
  "movement":"low|medium|high",
  "risk":"none|tunnel|convergence|overgeneralization",
  "note":"knappe interne Prozessbeobachtung"
 }
}
Regeln:
- message bei hesitation/uncertainty meist maximal 25 Wörter.
- sonst message meist maximal 70 Wörter.
- höchstens 2 state_candidates.
- conversation_dynamics beschreibt das Gespräch, nicht die Person.
- ready nur bei erkennbarer Denkbewegung.
`;

function sendJson(res,status,body){
 const data=JSON.stringify(body);
 res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Content-Length":Buffer.byteLength(data)});
 res.end(data);
}
async function readJson(req){
 let body="";
 for await(const chunk of req){body+=chunk;if(body.length>300000)throw new Error("Request too large");}
 return JSON.parse(body||"{}");
}
function cleanEvents(events){
 if(!Array.isArray(events))return[];
 return events.slice(-14).map(e=>({author:String(e.author||"").slice(0,50),text:String(e.text||"").slice(0,4000)}));
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function think(req,res){
 if(!KEY)return sendJson(res,500,{error:"DEEPSEEK_API_KEY fehlt."});
 const body=await readJson(req);
 const role=ROLE_PROMPTS[body.role]?body.role:"companion";
 const context={
  starting_point:body.startingPoint||"",
  thinking_state:body.thinkingState||{},
  conversation_dynamics:body.conversationDynamics||{},
  recent_conversation:cleanEvents(body.events),
  current_user_input:String(body.currentInput||"").slice(0,8000)
 };
 const messages=[
  {role:"system",content:`${ROLE_PROMPTS[role]}\n${FORMAT}`},
  {role:"user",content:"Aktueller Denkraum:\n\n"+JSON.stringify(context,null,2)}
 ];
 const request={
  method:"POST",
  headers:{"Content-Type":"application/json","Authorization":`Bearer ${KEY}`},
  body:JSON.stringify({model:MODEL,messages,thinking:{type:"enabled"},reasoning_effort:"high",
   response_format:{type:"json_object"},max_tokens:2600,stream:false})
 };
 let upstream,lastError;
 for(let a=1;a<=3;a++){
  try{upstream=await fetch(API,request);break}
  catch(err){lastError=err;if(a<3)await wait(a*1000)}
 }
 if(!upstream){
  const code=lastError?.cause?.code||lastError?.code||"UNKNOWN";
  return sendJson(res,502,{error:"DeepSeek ist momentan nicht erreichbar.",detail:`Verbindung fehlgeschlagen (${code}).`});
 }
 const raw=await upstream.text();
 if(!upstream.ok)return sendJson(res,upstream.status,{error:"DeepSeek API error",detail:raw.slice(0,3000)});
 let api;try{api=JSON.parse(raw)}catch{return sendJson(res,502,{error:"Ungültige DeepSeek-Antwort."})}
 const content=api?.choices?.[0]?.message?.content?.trim?.()||"";
 if(!content)return sendJson(res,502,{error:"DeepSeek lieferte keinen sichtbaren Inhalt."});
 let parsed;try{parsed=JSON.parse(content)}catch{return sendJson(res,502,{error:"Modell lieferte kein parsebares JSON.",detail:content.slice(0,3000)})}
 sendJson(res,200,{role,model:MODEL,result:parsed,usage:api.usage||null});
}

function serve(req,res){
 const pathname=new URL(req.url,`http://${req.headers.host}`).pathname;
 const rel=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");
 const file=path.normalize(path.join(PUBLIC,rel));
 if(!file.startsWith(PUBLIC)){res.writeHead(403);return res.end("Forbidden")}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end("Not found")}
 const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};
 res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
 fs.createReadStream(file).pipe(res);
}

const server=http.createServer(async(req,res)=>{
 try{
  if(req.method==="POST"&&req.url==="/api/think")return await think(req,res);
  if(req.method==="GET"&&req.url==="/api/health")return sendJson(res,200,{ok:true,prototype:"05",model:MODEL,apiKeyConfigured:Boolean(KEY)});
  if(req.method==="GET")return serve(req,res);
  res.writeHead(405);res.end("Method not allowed");
 }catch(err){console.error(err);sendJson(res,500,{error:err?.message||"Internal server error"})}
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 server.listen(PORT,()=>console.log(`Prototype 05: http://localhost:${PORT}`));
}
export{server,cleanEvents};