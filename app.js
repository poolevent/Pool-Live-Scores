const supabaseClient = supabase.createClient(
"https://rrjxsdxaholwhdzidpvx.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyanhzZHhhaG9sd2hkemlkcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzcwNTcsImV4cCI6MjA4NzQxMzA1N30.VIcs9IqSpZUAw43gYYQ4RWWb29dBIk422BuQzWeyA6k"
);

async function getMatches(){
const { data } = await supabaseClient
.from("matches")
.select("*")
.order("table_number",{ascending:true});

return data || [];
}

async function updateScore(id,score1,score2){
await supabaseClient
.from("matches")
.update({score1,score2})
.eq("id",id)
}
