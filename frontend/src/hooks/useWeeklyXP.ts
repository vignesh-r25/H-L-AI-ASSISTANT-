import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

export const useWeeklyXP = (userId: string | undefined) => {
    const [data, setData] = useState<{ name: string; xp: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchWeeklyData = async () => {
            try {
                // Get logs from the last 7 days
                const weekAgo = subDays(startOfDay(new Date()), 6).toISOString();

                const { data: logs, error } = await supabase
                    .from('gamification_logs')
                    .select('created_at, xp_earned')
                    .eq('user_id', userId)
                    .gte('created_at', weekAgo)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                // Prepare date slots for the last 7 days
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = subDays(new Date(), i);
                    days.push({
                        dateStr: format(date, 'yyyy-MM-dd'),
                        name: format(date, 'EEE'), // Mon, Tue, etc.
                        xp: 0
                    });
                }

                // Aggregate XP by day
                logs?.forEach(log => {
                    const logDate = format(new Date(log.created_at), 'yyyy-MM-dd');
                    const daySlot = days.find(d => d.dateStr === logDate);
                    if (daySlot) {
                        daySlot.xp += log.xp_earned;
                    }
                });

                setData(days.map(d => ({ name: d.name, xp: d.xp })));
            } catch (err) {
                console.error("Error fetching weekly XP:", err);
                // Fallback to empty if error
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklyData();

        // Subscribe to changes in gamification_logs to keep graph updated
        const channel = supabase
            .channel('weekly-xp-sync')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'gamification_logs', filter: `user_id=eq.${String(userId)}` },
                (payload) => {
                    console.log("[useWeeklyXP] log change detected:", payload);
                    fetchWeeklyData();
                }
            )
            .subscribe((status) => {
                console.log(`[useWeeklyXP] Sync Status: ${status}`);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { data, loading };
};
