import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
    const [session, setSession] = useState<any>(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(initialSession);
                    setSessionLoading(false);
                }
            } catch (error) {
                console.error("Auth init error:", error);
                if (mounted) setSessionLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (!mounted) return;
            if (newSession) {
                setSession(newSession);
            } else if (event === 'SIGNED_OUT' || !newSession) {
                setSession(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { session, sessionLoading, setSession };
};
