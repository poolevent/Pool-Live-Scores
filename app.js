async function initViewer(){
  const { data: matches } = await supabaseClient
    .from("matches")
    .select("*")
    .order("round", { ascending: true })
    .order("match_number", { ascending: true });

  const grouped = {};
  matches.forEach(m => {
    if (!grouped[m.round]) grouped[m.round] = [];
    grouped[m.round].push(m);
  });

  document.getElementById("bracketContainer").innerHTML = "";

  for (let round in grouped) {
    const col = document.createElement("div");
    col.className = "round";

    col.innerHTML = `<div><strong>Round ${round}</strong></div>`;

    grouped[round].forEach(m => {
      col.innerHTML += `
        <div class="match">
          <div class="player ${m.winner === m.player1 ? 'winner' : ''}">
            <span>${m.player1 || "-"}</span>
            <span class="score">${m.score1}</span>
          </div>
          <div class="player ${m.winner === m.player2 ? 'winner' : ''}">
            <span>${m.player2 || "-"}</span>
            <span class="score">${m.score2}</span>
          </div>
        </div>
      `;
    });

    document.getElementById("bracketContainer").appendChild(col);
  }

  supabaseClient.channel("realtime")
    .on("postgres_changes", {event:"*",schema:"public",table:"matches"},
      () => initViewer()
    ).subscribe();
}
