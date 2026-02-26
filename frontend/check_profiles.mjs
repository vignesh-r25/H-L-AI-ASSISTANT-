
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcdxdhjcqijxonomnuwj.supabase.co';
const supabaseKey = 'sb_anon_smFC7kmUdvS-SY-72Y46dg_nTVzjdou';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log('Checking profiles...');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Profiles found:', profiles.length);
        profiles.forEach(p => {
            console.log(`- ${p.email} (${p.display_name}) [ID: ${p.id}]`);
        });
    }
}

checkProfiles();
