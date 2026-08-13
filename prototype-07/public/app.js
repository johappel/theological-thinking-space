const STORAGE_KEY="tts-prototype-07";
const emptyState=()=>({
 startingPoint:"",mode:"thinking",events:[],
 thinkingState:{resonances:[],irritations:[],theological_tensions:[],questions:[],emerging_testimonies:[],unresolved:[]},
 pendingCandidates:[],suggestion:null,readiness:"not_yet",
 currentSegment:{state:"searching",need:"stay",movement:"medium",new_meaning:false},
 activePerspective:null,replyTarget:null,lastSignal:"",lastMove:"",
 fragments:[],visibleFragmentIds:[],openedFragmentId:null,threshold:{}
});
let state=load()||emptyState(),busy=false;
const $=id=>document.getElementById(id);
const labels={human:"DU / TEAM",companion:"COMPANION",bible:"BIBEL / THEOLOGIE",liturgy:"LITURGIE / PRAXIS",outside:"AUSSENBLICK",fragment:"FUNDSTÜCK"};
const buckets={resonances:"Resonanzen",irritations:"Irritationen",theological_tensions:"Theologische Spannungen",questions:"Offene Fragen",emerging_testimonies:"Vorläufige Zeugnisse",unresolved:"Noch offen"};
const typeToBucket={resonance:"resonances",irritation:"irritations",theological_tension:"theological_tensions",question:"questions",emerging_testimony:"emerging_testimonies",unresolved:"unresolved"};

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))}catch{return null}}
function esc(s=""){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function newId(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`}

async function loadFragments(){
 if(state.fragments.length)return;
 try{
  const r=await fetch("/api/fragments"),d=await r.json();
  state.fragments=d.fragments||[];
  pickFragments();
 }catch(e){console.error(e)}
}
function pickFragments(){
 state.visibleFragmentIds=[...state.fragments].sort(()=>Math.random()-.5).slice(0,3).map(x=>x.id);
 save();render();
}
function fragmentById(id){return state.fragments.find(f=>f.id===id)}
function openFragment(id){
 state.openedFragmentId=id;
 const f=fragmentById(id);if(!f)return;
 $("fragmentKind").textContent=f.kind;$("fragmentTitle").textContent=f.title;
 $("fragmentBody").textContent=f.body;$("fragmentProvenance").textContent=f.provenance;
 $("fragmentModal").classList.remove("hidden");
}
function closeFragment(){state.openedFragmentId=null;$("fragmentModal").classList.add("hidden")}

function render(){
 $("startPanel").classList.toggle("hidden",!!state.startingPoint);
 $("thinkingView").classList.toggle("hidden",!state.startingPoint||state.mode!=="thinking");
 $("thresholdView").classList.toggle("hidden",state.mode!=="threshold");
 $("modeBadge").textContent=state.mode==="thinking"?"DENKRAUM":"SCHWELLE";

 $("stream").innerHTML=state.events.map(e=>{
  const canReply=e.author!=="human"&&e.author!=="fragment";
  const cls=e.author==="human"?"human":e.author==="companion"?"companion":e.author==="fragment"?"fragment":"perspective";
  return `<article class="entry ${cls}">
   <div class="meta">${esc(labels[e.author]||e.author)}</div>
   <p>${esc(e.text)}</p>
   ${canReply?`<div class="entry-actions"><button data-reply-id="${esc(e.id)}" data-reply-author="${esc(e.author)}">Darauf antworten</button></div>`:""}
  </article>`;
 }).join("");

 if(state.activePerspective){
  $("activePartner").classList.remove("hidden");
  $("activePartner").textContent=`Im Gespräch mit: ${labels[state.activePerspective]||state.activePerspective}`;
 }else $("activePartner").classList.add("hidden");

 if(state.replyTarget){
  const t=state.events.find(e=>e.id===state.replyTarget.id);
  $("replyContext").classList.remove("hidden");
  $("replyContext").innerHTML=`Antwort an <strong>${esc(labels[state.replyTarget.author]||state.replyTarget.author)}</strong>: ${esc((t?.text||"").slice(0,140))}`;
 }else $("replyContext").classList.add("hidden");

 const visible=state.visibleFragmentIds.map(fragmentById).filter(Boolean);
 $("fragmentList").innerHTML=visible.map(f=>`<article class="fragment-card" data-fragment="${esc(f.id)}">
  <div class="fragment-kind">${esc(f.kind)}</div><h3>${esc(f.title)}</h3><p>${esc(f.teaser)}</p>
 </article>`).join("");

 $("stateGroups").innerHTML=Object.entries(buckets).map(([k,l])=>`<section class="state-group"><h3>${l}</h3>${
  state.thinkingState[k]?.length?`<ul>${state.thinkingState[k].map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<div class="empty">Noch nichts festgehalten.</div>`
 }</section>`).join("");

 $("candidateArea").classList.toggle("hidden",!state.pendingCandidates.length);
 $("candidateList").innerHTML=state.pendingCandidates.map((c,i)=>`<div class="candidate"><p><strong>${esc(buckets[typeToBucket[c.type]]||c.type)}:</strong> ${esc(c.text)}</p><button data-i="${i}" data-a="accept">Festhalten</button> <button class="reject" data-i="${i}" data-a="reject">Verwerfen</button></div>`).join("");

 const rr={not_yet:"noch im Prozess",possible:"Schwelle wird denkbar",ready:"Schwelle erscheint tragfähig"};
 $("readiness").textContent=rr[state.readiness]||rr.not_yet;
 $("thresholdBtn").classList.toggle("muted-threshold",state.readiness==="not_yet");

 const s=state.currentSegment||{};
 $("directorBox").innerHTML=`Signal: <strong>${esc(state.lastSignal||"—")}</strong><br>Gesprächszug: <strong>${esc(state.lastMove||"—")}</strong><br>Segment: <strong>${esc(s.state||"—")}</strong> · Bedarf: <strong>${esc(s.need||"—")}</strong> · Bewegung: ${esc(s.movement||"—")} · neue Bedeutung: ${String(Boolean(s.new_meaning))}`;

 if(state.suggestion){
  $("suggestionBox").classList.remove("hidden");
  $("suggestionBox").innerHTML=`<strong>${esc(labels[state.suggestion.id]||"Perspektive")} könnte hilfreich sein.</strong><br>${esc(state.suggestion.reason||"")}<br><button data-suggested="${esc(state.suggestion.id)}">An den Tisch holen</button>`;
 }else $("suggestionBox").classList.add("hidden");

 $("loading").classList.toggle("hidden",!busy);
 document.querySelectorAll("button").forEach(b=>b.disabled=busy);
 save();
}

async function callThink(role,currentInput="",replyTo=null,currentAddressee=null){
 busy=true;clearError();render();
 try{
  const response=await fetch("/api/think",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
   role,startingPoint:state.startingPoint,thinkingState:state.thinkingState,currentSegment:state.currentSegment,
   activePerspective:state.activePerspective,events:state.events,currentInput,currentAddressee,replyTo
  })});
  const data=await response.json();
  if(!response.ok)throw new Error(data.detail||data.error||`HTTP ${response.status}`);
  const result=data.result||{};
  if(result.message)state.events.push({id:newId(),author:role,text:result.message,reply_to:replyTo||null,addressee:null});
  if(Array.isArray(result.state_candidates))state.pendingCandidates.push(...result.state_candidates.filter(c=>c&&typeToBucket[c.type]&&c.text).slice(0,2));
  state.suggestion=result.suggested_perspective||null;
  state.readiness=result.threshold_readiness||state.readiness;
  state.currentSegment=result.segment||state.currentSegment;
  state.lastSignal=result.user_signal||"";
  state.lastMove=result.conversation_move||"";
  if(role!=="companion")state.activePerspective=role;
 }catch(e){showError(e.message||String(e))}
 finally{busy=false;render()}
}

$("startBtn").onclick=async()=>{if(busy)return;const text=$("startInput").value.trim();if(!text)return;state.startingPoint=text;state.events.push({id:newId(),author:"human",text,reply_to:null,addressee:"companion"});render();await callThink("companion",text)};
$("sendBtn").onclick=async()=>{if(busy)return;const text=$("messageInput").value.trim();if(!text)return;$("messageInput").value="";let addressee="companion",replyTo=null;if(state.replyTarget){addressee=state.replyTarget.author;replyTo=state.replyTarget.id}else if(state.activePerspective){addressee=state.activePerspective}state.events.push({id:newId(),author:"human",text,reply_to:replyTo,addressee});state.suggestion=null;state.replyTarget=null;render();await callThink(addressee,text,replyTo,addressee)};
$("messageInput").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")$("sendBtn").click()});

$("stream").onclick=e=>{const b=e.target.closest("button[data-reply-id]");if(!b)return;state.replyTarget={id:b.dataset.replyId,author:b.dataset.replyAuthor};state.activePerspective=b.dataset.replyAuthor==="companion"?null:b.dataset.replyAuthor;render();$("messageInput").focus()};
$("perspectiveToggle").onclick=()=>$("perspectivePicker").classList.toggle("hidden");
$("perspectivePicker").onclick=async e=>{const b=e.target.closest("button[data-role]");if(!b||busy)return;$("perspectivePicker").classList.add("hidden");state.activePerspective=b.dataset.role;state.replyTarget=null;render();await callThink(b.dataset.role,"")};
$("suggestionBox").onclick=async e=>{const b=e.target.closest("button[data-suggested]");if(!b||busy)return;const role=b.dataset.suggested;state.suggestion=null;state.activePerspective=role;state.replyTarget=null;render();await callThink(role,"")};

$("fragmentList").onclick=e=>{const c=e.target.closest("[data-fragment]");if(c)openFragment(c.dataset.fragment)};
$("shuffleFragments").onclick=pickFragments;
$("closeFragment").onclick=closeFragment;
$("leaveFragment").onclick=closeFragment;
$("fragmentModal").onclick=e=>{if(e.target.id==="fragmentModal")closeFragment()};
$("bringFragment").onclick=async()=>{
 const f=fragmentById(state.openedFragmentId);if(!f)return;
 closeFragment();
 state.events.push({id:newId(),author:"fragment",kind:"fragment",text:`${f.title}: ${f.teaser}`,reply_to:null,addressee:null});
 state.activePerspective=null;state.replyTarget=null;render();
 await callThink("companion",`Ich habe dieses Fundstück an den Tisch geholt: ${f.title}. ${f.body}`);
};

$("candidateList").onclick=e=>{const b=e.target.closest("button[data-i]");if(!b)return;const i=Number(b.dataset.i),c=state.pendingCandidates[i];if(!c)return;if(b.dataset.a==="accept"){const bucket=typeToBucket[c.type];if(bucket&&!state.thinkingState[bucket].includes(c.text))state.thinkingState[bucket].push(c.text)}state.pendingCandidates.splice(i,1);render()};
$("thresholdBtn").onclick=()=>{state.mode="threshold";const m=[...state.thinkingState.theological_tensions,...state.thinkingState.emerging_testimonies,...state.thinkingState.questions].slice(0,7);$("thresholdSummary").innerHTML=m.length?`<strong>Spuren:</strong><ul>${m.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"Der Denkstand ist noch offen.";render()};
$("backBtn").onclick=()=>{state.mode="thinking";render()};
$("snapshotBtn").onclick=()=>{state.threshold={changed:$("changedInput").value.trim(),testimony:$("testimonyInput").value.trim(),not_to_prescribe:$("openInput").value.trim(),open_conditions:$("conditionsInput").value.trim()};$("snapshot").textContent=JSON.stringify({starting_point:state.startingPoint,thinking_state:state.thinkingState,current_segment:state.currentSegment,active_perspective:state.activePerspective,threshold:state.threshold},null,2);$("snapshot").classList.remove("hidden");save()};
$("resetBtn").onclick=()=>{if(confirm("Session zurücksetzen?")){localStorage.removeItem(STORAGE_KEY);location.reload()}};
function showError(m){$("errorBox").textContent=m;$("errorBox").classList.remove("hidden")}
function clearError(){$("errorBox").classList.add("hidden")}
loadFragments();render();