import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
    materialsStudied: number;
    flashcardsMastered: number;
    quizAccuracy: number;
}

export const useRealtimeStats = (userId: string | undefined) => {
    const [stats, setStats] = useState<Stats>({
        materialsStudied: 0,
        flashcardsMastered: 0,
        quizAccuracy: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchStats = async () => {
            try {
                console.log("[useRealtimeStats] Fetching for user:", userId);
                
                // Fetch actual materials count (Checking user_id first, then created_by)
                let { count: materialsCount, error: matError } = await supabase
                    .from("materials")
                    .select("id", { count: "exact" })
                    .eq("user_id", userId);

                // Fallback for different schema versions
                if (matError || (materialsCount === 0)) {
                    const { count: fallbackCount } = await supabase
                        .from("materials")
                        .select("id", { count: "exact" })
                        .eq("created_by", userId);
                    if (fallbackCount) materialsCount = fallbackCount;
                }

                console.log("[useRealtimeStats] Materials count:", materialsCount);

                // Fetch mastered flashcards count
                const { count: masteredCount } = await supabase
                    .from("flashcards")
                    .select("id", { count: "exact" })
                    .eq("user_id", userId)
                    .eq("mastered", true);

                // Fetch quiz results for accuracy (mocked for now as we don't have results table)
                const { data: quizResults } = await supabase
                    .from("quizzes")
                    .select("score, max_score")
                    .eq("user_id", userId)
                    .not("score", "is", null);

                let accuracy = 0;
                if (quizResults && quizResults.length > 0) {
                    const totalScore = quizResults.reduce((acc, q) => acc + (q.score || 0), 0);
                    const totalMax = quizResults.reduce((acc, q) => acc + (q.max_score || 0), 0);
                    accuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
                }

                if (!isMounted) return;

                setStats({
                    materialsStudied: materialsCount || 0,
                    flashcardsMastered: masteredCount || 0,
                    quizAccuracy: accuracy || 0,
                });
            } catch (err) {
                console.error("Unexpected error in useRealtimeStats:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchStats();

        // Subscribe to changes for live updates
        const materialsChannel = supabase
            .channel('stats-materials-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'materials', filter: `user_id=eq.${userId}` }, () => fetchStats())
            .subscribe();

        const flashcardsChannel = supabase
            .channel('stats-flashcards-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'flashcards', filter: `user_id=eq.${userId}` }, () => fetchStats())
            .subscribe();

        const quizzesChannel = supabase
            .channel('stats-quizzes-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes', filter: `user_id=eq.${userId}` }, () => fetchStats())
            .subscribe();

        // Cleanup to prevent state updates on unmount
        return () => {
            isMounted = false;
            supabase.removeChannel(materialsChannel);
            supabase.removeChannel(flashcardsChannel);
            supabase.removeChannel(quizzesChannel);
        };
    }, [userId]);

    return { stats, loading };
};
