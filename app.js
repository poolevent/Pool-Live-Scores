document.addEventListener("DOMContentLoaded", () => {
    initRealtime();
    loadLive();
    loadAdminMatches();
});

/* =========================
LIVE MATCHES
========================= */

async function loadLive(){
    const { data } = await supabaseClient
        .from("matches")
        .select("*")
        .eq("status","live")
        .order("id",{ascending:true});

    renderMatches(data || []);
}

async function loadUpcoming(){
    const { data } = await supabaseClient
        .from("matches")
        .select("*")
        .eq("status","upcoming")
        .order("id",{ascending:true});

    renderMatches(data || []);
}

async function loadFinished(){
    const { data } = await supabaseClient
        .from("matches")
        .select("*")
        .eq("status","finished")
        .order("id",{ascending:true});

    renderMatches(data || []);
}

/* =========================
PLAYERS TAB
========================= */

async function loadPlayers(){
    const { data } = await supabaseClient
        .from("players")
        .select("*")
        .order("name");

    const container = document.getElementById("content");
    if(!container) return;

    container.innerHTML = "";

    data.forEach(p=>{
        container.innerHTML += `
        <div class="match">
            ${p.flag ? `<img src="${p.flag}" width="20">` : ""}
            ${p.name}
        </div>
        `;
    });
}

/* =========================
VENUE TAB
========================= */

async function loadVenue(){
    const { data } = await supabaseClient
        .from("events")
        .select("*")
        .limit(1);

    const container = document.getElementById("content");
    if(!container) return;

    if(data.length === 0){
        container.innerHTML = "No Venue";
        return;
    }

    container.innerHTML = `
    <div class="match">
        Venue: ${data[0].venue}
    </div>
    `;
}

/* =========================
RENDER MATCH
========================= */

function renderMatches(matches){
    const container = document.getElementById("content");
    if(!container) return;

    container.innerHTML = "";

    matches.forEach(match=>{
        container.innerHTML += `
        <div class="match">
            <div>
                ${match.player1}
                <span class="score">${match.score1 ?? 0}</span>
                vs
                <span class="score">${match.score2 ?? 0}</span>
                ${match.player2}
            </div>

            <div>
                Table ${match.table_no ?? "-"}
            </div>
        </div>
        `;
    });
}

/* =========================
ADMIN PANEL
========================= */

async function loadAdminMatches(){
    const { data } = await supabaseClient
        .from("matches")
        .select("*")
        .order("id");

    const div = document.getElementById("matchesAdmin");
    if(!div) return;

    div.innerHTML = "";

    data.forEach(match=>{
        div.innerHTML += `
        <div class="match">
            ${match.player1}
            ${match.score1}

            <button onclick="addScore(${match.id},1)">+</button>

            VS

            <button onclick="addScore(${match.id},2)">+</button>

            ${match.score2}
            ${match.player2}
        </div>
        `;
    });
}

/* =========================
UPDATE SCORE
========================= */

async function addScore(id,player){

    const { data } = await supabaseClient
        .from("matches")
        .select("*")
        .eq("id",id)
        .single();

    let s1 = data.score1 || 0;
    let s2 = data.score2 || 0;
    let race = data.race_to || 7;

    if(player === 1) s1++;
    if(player === 2) s2++;

    let status = "live";

    if(s1 >= race || s2 >= race){
        status = "finished";
    }

    await supabaseClient
        .from("matches")
        .update({
            score1:s1,
            score2:s2,
            status:status
        })
        .eq("id",id);

    loadAdminMatches();
}

/* =========================
OWNER CREATE EVENT
========================= */

async function createEvent(){

    const name = document.getElementById("eventNameInput").value;
    const venue = document.getElementById("venueInput").value;
    const race = document.getElementById("raceInput").value;
    const format = document.getElementById("formatInput").value;

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

/* =========================
REALTIME
========================= */

function initRealtime(){

    supabaseClient
        .channel("live")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "matches"
            },
            payload => {

                loadLive();
                loadUpcoming();
                loadFinished();
                loadAdminMatches();

            }
        )
        .subscribe();
}
