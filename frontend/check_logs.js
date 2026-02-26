
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kcdxdhjcqijxonomnuwj.supabase.co';
const supabaseKey = 'sb_anon_smFC7kmUdvS-SY-72Y46dg_nTVzjdou';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    const yesterday = '2026-02-24';
    const today = '2026-02-25';

    console.log(`Checking logs for ${yesterday}...`);

    // Check gamification_logs
    const { data: logs, error: logsError } = await supabase
        .from('gamification_logs')
        .select('*')
        .gte('created_at', yesterday + 'T00:00:00')
        .lt('created_at', today + 'T00:00:00');

    if (logsError) {
        console.error('Error fetching logs:', logsError);
    } else {
        console.log(`Found ${logs.length} logs in gamification_logs:`);
        logs.forEach(log => {
            console.log(`- ${log.created_at}: ${log.action_type} (User: ${log.user_id})`);
        });
    }

    // Check profiles updated_at if it exists
    const { data: updatedProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        // We can't filter by updated_at if we don't know it exists, but we can try to find if any profiles were modified
        .limit(10);

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
    } else {
        console.log(`\nSample profiles (to check available fields):`);
        console.log(updatedProfiles);
    }

    // Check if there are any other interesting tables
    const { data: tables, error: tablesError } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', yesterday + 'T00:00:00')
        .lt('created_at', today + 'T00:00:00');

    if (tablesError) {
        console.error('Error fetching notifications:', tablesError);
    } else {
        console.log(`\nFound ${tables.length} notifications:`);
        tables.forEach(t => {
            console.log(`- ${t.created_at}: ${t.title} - ${t.message}`);
        });
    }
}

checkLogs();
