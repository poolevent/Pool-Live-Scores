async function loadLive(){
const { data } = await supabaseClient
.from("matches")
.select("*")
.eq("status","live");

renderMatches(data);
}

async function loadUpcoming(){
const { data } = await supabaseClient
.from("matches")
.select("*")
.eq("status","upcoming");

renderMatches(data);
}

async function loadFinished(){
const { data } = await supabaseClient
.from("matches")
.select("*")
.eq("status","finished");

renderMatches(data);
}

function renderMatches(matches){
const container=document.getElementById("content");
container.innerHTML="";

matches.forEach(match=>{
container.innerHTML+=`
<div class="match">
${match.player1} 
<span class="score">${match.score1}</span>
vs
<span class="score">${match.score2}</span>
${match.player2}
</div>
`;
});
}

async function loadAdminMatches(){
const { data } = await supabaseClient
.from("matches")
.select("*");

const div=document.getElementById("matchesAdmin");
div.innerHTML="";

data.forEach(match=>{
div.innerHTML+=`
<div class="match">
${match.player1} ${match.score1}
<button onclick="addScore(${match.id},1)">+</button>

${match.player2} ${match.score2}
<button onclick="addScore(${match.id},2)">+</button>
</div>
`;
});
}

async function addScore(id,player){
let match = await supabaseClient
.from("matches")
.select("*")
.eq("id",id)
.single();

let s1=match.data.score1;
let s2=match.data.score2;

if(player==1) s1++;
if(player==2) s2++;

await supabaseClient
.from("matches")
.update({
score1:s1,
score2:s2
})
.eq("id",id);

loadAdminMatches();
}

async function createEvent(){
const name=document.getElementById("eventNameInput").value;
const venue=document.getElementById("venueInput").value;
const race=document.getElementById("raceInput").value;
const format=document.getElementById("formatInput").value;

await supabaseClient
.from("events")
.insert({
name:name,
venue:venue,
race_to:race,
format:format
});

alert("Event Created");
}
