const SUPABASE_URL = "https://rrjxsdxaholwhdzidpvx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyanhzZHhhaG9sd2hkemlkcHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzcwNTcsImV4cCI6MjA4NzQxMzA1N30.VIcs9IqSpZUAw43gYYQ4RWWb29dBIk422BuQzWeyA6k";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
