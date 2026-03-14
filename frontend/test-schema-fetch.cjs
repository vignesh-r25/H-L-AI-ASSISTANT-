const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
let url, key;
for (const line of envFile.split('\n')) {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

async function run() {
    const res = await fetch(`${url}/rest/v1/flashcards?select=*&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    console.log(JSON.stringify(await res.json(), null, 2));

    // try inserting with front/back
    const res2 = await fetch(`${url}/rest/v1/flashcards`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ user_id: 'db2a53bb-de20-424a-b5e1-51fbf0effdc2', front: 'f', back: 'b' })
    });
    console.log("Insert f/b:", JSON.stringify(await res2.json(), null, 2));

    // try inserting with question/answer
    const res3 = await fetch(`${url}/rest/v1/flashcards`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ user_id: 'db2a53bb-de20-424a-b5e1-51fbf0effdc2', question: 'q', answer: 'a' })
    });
    console.log("Insert q/a:", JSON.stringify(await res3.json(), null, 2));
}
run();
