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
                // Safe fetch for materials
                const { count: materialsCount, error } = await supabase
                    .from("study_sessions")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", userId);

                if (!isMounted) return;

                if (error) {
                    console.error("Error fetching stats:", error);
                    // Don't throw, just keep defaults
                } else {
                    setStats((prev) => ({
                        ...prev,
                        materialsStudied: materialsCount || 0,
                        // Flashcards and Quiz are mocks for now, keeping 0 to avoid confusion
                        // until backend tables exist
                    }));
                }
            } catch (err) {
                console.error("Unexpected error in useRealtimeStats:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchStats();

        // Cleanup to prevent state updates on unmount
        return () => {
            isMounted = false;
        };
    }, [userId]);

    return { stats, loading };
};
