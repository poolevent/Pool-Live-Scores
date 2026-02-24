async function loadBracket(){

const { data } = await supabase
.from("matches")
.select("*")
.order("round",{ascending:true})

let rounds={}

data.forEach(m=>{
if(!rounds[m.round]) rounds[m.round]=[]
rounds[m.round].push(m)
})

let html=""

Object.keys(rounds).forEach(r=>{

html+=`<div class="round"><h3>Round ${r}</h3>`

rounds[r].forEach(m=>{

html+=`
<div class="match">
<div class="player-row">${m.player1} ${m.score1}</div>
<div class="player-row">${m.player2} ${m.score2}</div>
</div>
`
})

html+=`</div>`

})

bracket.innerHTML=html
}

loadBracket()
setInterval(loadBracket,2000)
