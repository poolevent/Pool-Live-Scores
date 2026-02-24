document.addEventListener("DOMContentLoaded", () => {
    initRealtime();
    loadLive();
});

/* =========================
LOAD MATCHES
========================= */

async function loadLive(){
    const { data, error } = await supabaseClient
        .from("matches")
        .select("*")
        .eq("status","live")
        .order("id",{ascending:true});

    if(error) console.log(error);

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
RENDER MATCHES
========================= */

function renderMatches(matches){
    const container = document.getElementById("content");
    if(!container) return;

    container.innerHTML = "";

    matches.forEach(match => {
        container.innerHTML += `
        <div class="match">
            <div>
                ${match.player1 || "-"}
                <span class="score">${match.score1 ?? 0}</span>
                vs
                <span class="score">${match.score2 ?? 0}</span>
                ${match.player2 || "-"}
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
        .order("id",{ascending:true});

    const div = document.getElementById("matchesAdmin");
    if(!div) return;

    div.innerHTML = "";

    data.forEach(match=>{
        div.innerHTML += `
        <div class="match">
            ${match.player1} ${match.score1}
            <button onclick="addScore(${match.id},1)">+</button>

            ${match.player2} ${match.score2}
            <button onclick="addScore(${match.id},2)">+</button>
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
REALTIME UPDATE
========================= */

function initRealtime(){

    supabaseClient
        .channel("live-matches")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "matches"
            },
            (payload) => {

                console.log("Realtime update", payload);

                loadLive();
                loadUpcoming();
                loadFinished();
                loadAdminMatches();

            }
        )
        .subscribe();
}
