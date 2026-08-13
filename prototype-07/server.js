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
Du bist Gastgeber, Prozesswächter und Mitdenker.
Am Anfang einer Suchbewegung sind kurze Rückfragen oft passend.
Wenn Rückfragen keine neue Bewegung erzeugen, öffne oder fokussiere den Suchraum.
Wenn erste bedeutsame Gedanken entstehen, darfst du angemessen ausführlicher werden.
Suchbewegungen können jederzeit neu entstehen.

Beobachte das aktuelle Denksegment:
searching | emerging | stuck | consolidating
Bedarf:
open | focus | contrast | resource | stay

Wenn mehrere stay/clarify-Züge keine neue Bedeutung erzeugen: nicht weiter nur nachfragen.
"Und nun?", "Wie weiter?", "Ja und?", "Was folgt daraus?" = häufig need_movement; dann nicht mit stay antworten.

Zu Fundstücken:
Wenn ein Fundstück auf den Tisch gelegt wird, erkläre es nicht sofort aus.
Frage zuerst, was die Person daran anspricht, irritiert oder neugierig macht.
Das Fundstück soll zuerst beim Menschen wirken.

Wenn der User mit einer Perspektive im Gespräch ist, mische dich nicht automatisch ein.
`,
bible:`Du bist die Perspektive Bibel / Theologie. Wenn der User auf deinen Beitrag antwortet, antworte selbst weiter. Bringe höchstens einen tragenden Gedanken ein. Keine erfundene Exegese.`,
liturgy:`Du bist die Perspektive Liturgie / Praxis. Wenn der User auf deinen Beitrag antwortet, antworte selbst weiter. Bringe höchstens einen tragenden Gedanken ein. Noch kein fertiger Ablauf.`,
outside:`Du bist die Perspektive Außenblick. Wenn der User auf deinen Beitrag antwortet, antworte selbst weiter. Bringe höchstens einen tragenden Gedanken ein. Sprich nie stellvertretend für ganze Gruppen.`
};

const FORMAT=`
Antworte ausschließlich als gültiges JSON-Objekt:
{
 "message":"sichtbarer Gesprächsbeitrag",
 "user_signal":"statement|question|hesitation|uncertainty|disagreement|agreement|invitation|topic_shift|need_movement",
 "conversation_move":"stay|clarify|differentiate|open|focus|contrast|contextualize|resource|condense|park|threshold",
 "segment":{"state":"searching|emerging|stuck|consolidating","need":"open|focus|contrast|resource|stay","movement":"low|medium|high","new_meaning":true},
 "state_candidates":[{"type":"resonance|irritation|theological_tension|question|emerging_testimony|unresolved","text":"knapper Kandidat"}],
 "suggested_perspective":{"id":"bible|liturgy|outside","reason":"kurzer Grund"} | null,
 "threshold_readiness":"not_yet|possible|ready"
}
`;

const FRAGMENTS=[
 {id:"urlauberkirche",kind:"Praxisfundstück",title:"Urlauberkirche am See",teaser:"Kirche taucht dort auf, wo Menschen im Ferienmodus ohnehin verweilen – nicht erst im Kirchengebäude.",body:"Demo-Fundstück: Stell dir eine Urlauberkirche an einem See oder Campingplatz vor. Menschen kommen nicht primär wegen eines Gottesdienstes, sondern weil sie ohnehin dort sind. Kirchliche Präsenz dockt an eine vorhandene Lebenssituation an: Ferien, Übergang, Fremdsein, Zeit haben, Gemeinschaft auf Zeit.",provenance:"Demo / Platzhalter – noch keine verifizierte Quelle"},
 {id:"taize",kind:"Traditionsspur",title:"Taizé: Gemeinschaft als gelebtes Zeichen",teaser:"Nicht zuerst erklären, was Versöhnung ist – sondern eine Gemeinschaft leben, in der sie erfahrbar werden kann.",body:"Demo-Paraphrase: Eine mögliche Taizé-Spur wäre, Gemeinschaft nicht als Programm für Suchende zu verstehen, sondern als gelebte Praxis von Gebet, Gastfreundschaft, Versöhnung und Einfachheit. Wer hinzukommt, trifft auf etwas, das bereits geschieht.",provenance:"Demo-Paraphrase – Quelle später verknüpfen"},
 {id:"third-place",kind:"Fremdperspektive",title:"Third Place statt Veranstaltungsort",teaser:"Was macht einen Ort attraktiv, an dem Menschen ohne großen Anlass wiederkommen?",body:"Demo-Fundstück: Cafés, Bibliotheken, Nachbarschaftsorte oder offene Werkstätten funktionieren oft weder wie Zuhause noch wie Arbeitsplatz. Interessant ist weniger das Programm als die Verlässlichkeit: Man darf da sein, wiederkommen, andere sehen, sich beteiligen oder nur beobachten.",provenance:"Demo / säkulare Raum-Perspektive"},
 {id:"bewohnter-raum",kind:"Denkfragment",title:"Bewohnter Raum",teaser:"Atmosphäre könnte Nebenwirkung einer tatsächlich gelebten Praxis sein – nicht ihr Ersatz.",body:"Demo-Denkfragment: Vielleicht entsteht ein belebter Raum nicht dadurch, dass Kerzen, Musik und Stimmung für Besucher arrangiert werden. Vielleicht entsteht Atmosphäre als Nebenwirkung dessen, dass Menschen dort tatsächlich etwas tun, das ihnen selbst wichtig ist – beten, lesen, singen, essen, schweigen, reden, helfen.",provenance:"Aus dem bisherigen Denkprozess abgeleitet"}
];

function sendJson(res,status,body){const data=JSON.stringify(body);res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Content-Length":Buffer.byteLength(data)});res.end(data);}
async function readJson(req){let body="";for await(const chunk of req){body+=chunk;if(body.length>300000)throw new Error("Request too large");}return JSON.parse(body||"{}");}
function cleanEvents(events){if(!Array.isArray(events))return[];return events.slice(-18).map(e=>({id:String(e.id||"").slice(0,80),author:String(e.author||"").slice(0,50),text:String(e.text||"").slice(0,4000),kind:String(e.kind||"message").slice(0,30),reply_to:e.reply_to?String(e.reply_to).slice(0,80):null,addressee:e.addressee?String(e.addressee).slice(0,50):null}));}
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function think(req,res){
 if(!KEY)return sendJson(res,500,{error:"DEEPSEEK_API_KEY fehlt."});
 const body=await readJson(req); const role=ROLE_PROMPTS[body.role]?body.role:"companion";
 const context={starting_point:body.startingPoint||"",thinking_state:body.thinkingState||{},current_segment:body.currentSegment||{},active_perspective:body.activePerspective||null,recent_conversation:cleanEvents(body.events),current_user_input:String(body.currentInput||"").slice(0,8000),current_addressee:body.currentAddressee||null,reply_to:body.replyTo||null};
 const messages=[{role:"system",content:`${ROLE_PROMPTS[role]}\n${FORMAT}`},{role:"user",content:"Aktueller Denkraum:\n\n"+JSON.stringify(context,null,2)}];
 const request={method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${KEY}`},body:JSON.stringify({model:MODEL,messages,thinking:{type:"enabled"},reasoning_effort:"high",response_format:{type:"json_object"},max_tokens:3200,stream:false})};
 let upstream,lastError; for(let a=1;a<=3;a++){try{upstream=await fetch(API,request);break}catch(err){lastError=err;if(a<3)await wait(a*1000)}}
 if(!upstream){const code=lastError?.cause?.code||lastError?.code||"UNKNOWN";return sendJson(res,502,{error:"DeepSeek ist momentan nicht erreichbar.",detail:`Verbindung fehlgeschlagen (${code}).`});}
 const raw=await upstream.text(); if(!upstream.ok)return sendJson(res,upstream.status,{error:"DeepSeek API error",detail:raw.slice(0,3000)});
 let api;try{api=JSON.parse(raw)}catch{return sendJson(res,502,{error:"Ungültige DeepSeek-Antwort."})}
 let content=api?.choices?.[0]?.message?.content?.trim?.()||""; if(!content)return sendJson(res,502,{error:"DeepSeek lieferte keinen sichtbaren Inhalt."});
 content=content.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"").trim();
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
  if(req.method==="GET"&&req.url==="/api/fragments")return sendJson(res,200,{fragments:FRAGMENTS});
  if(req.method==="GET"&&req.url==="/api/health")return sendJson(res,200,{ok:true,prototype:"07",model:MODEL,apiKeyConfigured:Boolean(KEY)});
  if(req.method==="GET")return serve(req,res);
  res.writeHead(405);res.end("Method not allowed");
 }catch(err){console.error(err);sendJson(res,500,{error:err?.message||"Internal server error"})}
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){server.listen(PORT,()=>console.log(`Prototype 07: http://localhost:${PORT}`));}
export{server,cleanEvents};