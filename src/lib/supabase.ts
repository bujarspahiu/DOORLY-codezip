import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://oqatugaoamylsbabrtpd.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjI2MDk1MjA0LWI5YmUtNGJjYi1iNmI3LTdjYzc3NjAyY2Q2MSJ9.eyJwcm9qZWN0SWQiOiJvcWF0dWdhb2FteWxzYmFicnRwZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzczMjE2MjExLCJleHAiOjIwODg1NzYyMTEsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.FWi5uQMjvSmG8RGEZuAu-bg9A-eT87BLnmTRZxaJH1o';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };