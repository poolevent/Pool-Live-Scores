let EVENT_ID;

async function getLiveEvent(){
 const {data}=await supabaseClient
   .from("events")
   .select("*")
   .eq("status","live")
   .limit(1)
   .single();
 EVENT_ID=data.id;
 return data;
}

/* ========= VIEWER ========= */
async function initViewer(){
 const event=await getLiveEvent();
 document.getElementById("eventName").innerText=event.name;
 document.getElementById("raceInfo").innerText="Race To "+event.race_to;
 loadMatches();
 loadBracket();
 realtime();
}

async function loadMatches(){
 const {data}=await supabaseClient
  .from("matches")
  .select(`*,p1:player1(name),p2:player2(name)`)
  .eq("event_id",EVENT_ID);

 const el=document.getElementById("matches");
 el.innerHTML="";
 data.forEach(m=>{
  el.innerHTML+=`
   <div class="card">
    R${m.round} :
    ${m.p1?.name||"-"} ${m.score1}
    vs
    ${m.score2} ${m.p2?.name||"-"}
    <br>
    Table ${m.table_no||"-"}
    ${m.streaming?"<span class='streaming'>●LIVE</span>":""}
   </div>`;
 });
}

async function loadBracket(){
 const {data}=await supabaseClient
  .from("matches")
  .select(`*,p1:player1(name),p2:player2(name)`)
  .eq("event_id",EVENT_ID)
  .order("round",{ascending:true});

 const el=document.getElementById("bracket");
 el.innerHTML="<h3>Bracket</h3>";

 let grouped={};
 data.forEach(m=>{
  if(!grouped[m.round]) grouped[m.round]=[];
  grouped[m.round].push(m);
 });

 Object.keys(grouped).forEach(r=>{
  el.innerHTML+=`<h4>Round ${r}</h4>`;
  grouped[r].forEach(m=>{
   el.innerHTML+=`
    <div class="card bracket-line">
     ${m.p1?.name||"-"} (${m.score1})
     vs
     ${m.p2?.name||"-"} (${m.score2})
    </div>`;
  });
 });
}

/* ========= ADMIN ========= */
async function initAdmin(){
 await getLiveEvent();
 loadMatches();
}

async function shuffle(){
 const {data}=await supabaseClient
  .from("players")
  .select("*")
  .eq("event_id",EVENT_ID);

 const shuffled=data.sort(()=>Math.random()-0.5);
 for(let i=0;i<shuffled.length;i++){
  await supabaseClient
   .from("players")
   .update({seed:i+1})
   .eq("id",shuffled[i].id);
 }
 alert("Shuffled");
}

async function makeKO(){
 const topN=parseInt(document.getElementById("topN").value);
 generateKnockout(EVENT_ID,topN);
}

async function generateKnockout(eventId,topN){
 const {data}=await supabaseClient
  .from("standings")
  .select("*")
  .eq("event_id",eventId)
  .order("wins",{ascending:false})
  .limit(topN);

 let size=1;
 while(size<topN) size*=2;

 for(let i=0;i<size/2;i++){
  await supabaseClient.from("matches").insert({
   event_id:eventId,
   round:1,
   position:i,
   player1:data[i]?.player_id||null,
   player2:data[size-1-i]?.player_id||null
  });
 }
}

/* ========= OWNER ========= */
async function updateRace(){
 const val=document.getElementById("race").value;
 await supabaseClient.from("events")
 .update({race_to:val})
 .eq("id",EVENT_ID);
}

async function updateFormat(){
 const val=document.getElementById("format").value;
 await supabaseClient.from("events")
 .update({format:val})
 .eq("id",EVENT_ID);
}

/* ========= REALTIME ========= */
function realtime(){
 supabaseClient.channel("live")
 .on("postgres_changes",
  {event:"*",schema:"public",table:"matches"},
  ()=>{loadMatches();loadBracket();}
 ).subscribe();
}
