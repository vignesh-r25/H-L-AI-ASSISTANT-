import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfileSync = (session: any) => {
    const queryClient = useQueryClient();
    const userId = session?.user?.id;

    const { data: profile, isLoading, error } = useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) return null;

            // Abandoned focus session penalty check
            const wasFocused = localStorage.getItem('focus_session_active');
            if (wasFocused === 'true') {
                const { error: rpcError } = await (supabase.rpc as any)('deduct_streak_and_xp', {
                    target_id: userId,
                    xp_amount: 50,
                    streak_deduction: 1
                });
                if (!rpcError) {
                    localStorage.removeItem('focus_session_active');
                    toast.error("ABANDONED FOCUS DETECTED. Streak & XP Penalized.", {
                        style: { backgroundColor: '#7f1d1d', color: '#fff', border: '1px solid #ef4444' }
                    });
                }
            }

            // Fetch Profile
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .maybeSingle();

            if (!profileData && session.user) {
                // Auto-create missing profile
                const { data: newProfile, error: createError } = await supabase
                    .from("profiles")
                    .insert({
                        id: userId,
                        email: session.user.email,
                        display_name: session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Learner",
                        role: "student"
                    })
                    .select()
                    .maybeSingle();

                if (!createError && newProfile) {
                    return newProfile;
                }
                throw new Error("Profile creation failed");
            }
            return profileData;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        if (!userId) return;

        // Real-time synchronization
        const channel = supabase
            .channel('dashboard-profile-sync')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${String(userId)}` },
                (payload) => {
                    if (payload.new) {
                        queryClient.setQueryData(['profile', userId], payload.new);
                        toast.info("XP Synced Live", { duration: 1000 });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, queryClient]);

    // Manual setter for optimistic updates across the app overriding the cached data
    const setProfile = (updater: any) => {
        if (typeof updater === 'function') {
            const oldState = queryClient.getQueryData(['profile', userId]);
            queryClient.setQueryData(['profile', userId], updater(oldState));
        } else {
            queryClient.setQueryData(['profile', userId], updater);
        }
    };

    return { profile, isLoadingProfile: isLoading, profileError: error, setProfile };
};
