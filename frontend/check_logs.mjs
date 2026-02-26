
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kcdxdhjcqijxonomnuwj.supabase.co';
const supabaseKey = 'sb_anon_smFC7kmUdvS-SY-72Y46dg_nTVzjdou';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
    const yesterday = '2026-02-24';
    const today = '2026-02-25';

    console.log(`Checking logs for ${yesterday}...`);

    try {
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

        // Check if there are any interesting notifications
        const { data: notifications, error: notifError } = await supabase
            .from('notifications')
            .select('*')
            .gte('created_at', yesterday + 'T00:00:00')
            .lt('created_at', today + 'T00:00:00');

        if (notifError) {
            console.error('Error fetching notifications:', notifError);
        } else {
            console.log(`\nFound ${notifications.length} notifications:`);
            notifications.forEach(t => {
                console.log(`- ${t.created_at}: ${t.title} - ${t.message}`);
            });
        }

        // Check profiles for any recent updates if possible
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .limit(10);

        if (profileError) {
            console.error('Error fetching profiles:', profileError);
        } else {
            console.log('\nProfiles:');
            console.log(profiles);
            console.log('\nRecent profiles check complete.');
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

checkLogs();
