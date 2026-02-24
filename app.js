const supabase = window.supabase.createClient(
"https://rrjxsdxaholwhdzidpvx.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyanhzZHhhaG9sd2hkemlkcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzcwNTcsImV4cCI6MjA4NzQxMzA1N30.VIcs9IqSpZUAw43gYYQ4RWWb29dBIk422BuQzWeyA6k"
);

async function getMatches(){
const { data } = await supabase
.from("matches")
.select("*")
.order("table_number",{ascending:true});
return data;
}

async function addScore(id,p){
const { data } = await supabase
.from("matches")
.select("*")
.eq("id",id)
.single();

let s1=data.score1;
let s2=data.score2;

if(p==1) s1++;
if(p==2) s2++;

await supabase
.from("matches")
.update({
score1:s1,
score2:s2
})
.eq("id",id);
}
