const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

for (const line of envFile.split('\n')) {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
}

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    const { data, error } = await supabase.from('flashcards').insert([{
        user_id: 'db2a53bb-de20-424a-b5e1-51fbf0effdc2',
        front: 'test front',
        back: 'test back',
        mastered: false
    }]);
    console.log("Insert Error with front/back:", JSON.stringify(error, null, 2));

    const { data: data2, error: error2 } = await supabase.from('flashcards').insert([{
        user_id: 'db2a53bb-de20-424a-b5e1-51fbf0effdc2',
        question: 'test question',
        answer: 'test answer'
    }]);
    console.log("Insert Error with question/answer:", JSON.stringify(error2, null, 2));
}

testQuery();
