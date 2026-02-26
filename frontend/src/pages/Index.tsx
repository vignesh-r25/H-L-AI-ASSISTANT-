import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/pages/Dashboard";
import { Materials } from "@/pages/Materials";
import { Settings } from "@/pages/Settings";
import { Analytics } from "@/pages/Analytics";
import { Flashcards } from "@/pages/Flashcards";
import { Quizzes } from "@/pages/Quizzes";
import { Chat } from "@/pages/Chat";
import { Assessment } from "@/pages/Assessment";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EduAnimation } from "@/components/layout/EduAnimation";
import { LogoutTransition } from "@/components/auth/LogoutTransition";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Fast, premium 1s delay for the animation to play
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setLoading(false);
      setIsPreparing(false);
      setIsLoggingOut(false);
    } catch (error) {
      console.error("Logout error:", error);
      setSession(null);
      setProfile(null);
      setLoading(false);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    console.log("[Dashboard] Index mounted/updating. Current loading:", loading, "isPreparing:", isPreparing);
    let mounted = true;

    const initialize = async () => {
      // Don't re-initialize if we already have a profile or are already preparing
      if (profile) return;

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setIsPreparing(true);

          // Check for abandoned focus session (CLOSED TAB PENALTY)
          const wasFocused = localStorage.getItem('focus_session_active');
          if (wasFocused === 'true') {
              console.log("[Dashboard] Abandoned focus session detected. Applying penalty...");
              const { error } = await supabase.rpc('deduct_streak_and_xp', {
                  target_id: initialSession.user.id,
                  xp_amount: 50,
                  streak_deduction: 1
              });
              if (!error) {
                  localStorage.removeItem('focus_session_active');
                  toast.error("ABANDONED FOCUS DETECTED. Streak & XP Penalized.", {
                      style: { backgroundColor: '#7f1d1d', color: '#fff', border: '1px solid #ef4444' }
                  });
              }
          }

          console.log("[Dashboard] Session found, fetching profile...");
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", initialSession.user.id)
            .maybeSingle();

          if (mounted) {
            console.log("[Dashboard] Profile fetched:", !!profileData);
            setProfile(profileData);
            setLoading(false);
            // Brief delay to allow profile state to propagate before showing UI
            setTimeout(() => {
              if (mounted) setIsPreparing(false);
            }, 200);
          }
        } else {
          console.log("[Dashboard] No session found, redirecting to auth...");
          setLoading(false);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        console.log("[Dashboard] Auth state changed:", event, !!newSession);
        
        if (newSession) {
          setSession(newSession);
        } else if (event === 'SIGNED_OUT' || !newSession) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          setIsPreparing(false);
        }
      }
    );

    const timer = setTimeout(() => {
      if (mounted && loading) {
        console.log("[Dashboard] Safety timeout reached, forcing load...");
        setLoading(false);
        setIsPreparing(false);
      }
    }, 2000); // 2s absolute safety

    // Real-time synchronization for profile (XP/Streaks)
    let profileSubscription: any = null;
    if (session?.user?.id) {
        console.log("[Dashboard] Starting Realtime Session for:", session.user.id);
        profileSubscription = supabase
            .channel('dashboard-profile-sync')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${String(session.user.id)}` },
                (payload) => {
                    console.log("[Dashboard] REALTIME PAYLOAD RECEIVED:", payload);
                    if (payload.new && mounted) {
                        console.log("[Dashboard] Updating profile state with new XP:", payload.new.total_xp);
                        setProfile(payload.new);
                        toast.info("XP Synced Live", { duration: 1000 });
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[Dashboard] Realtime Subscription Status: ${status}`);
                if (status === 'SUBSCRIBED') {
                    console.log("[Dashboard] Synchronized with Knowledge Vault");
                }
            });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (profileSubscription) supabase.removeChannel(profileSubscription);
      clearTimeout(timer);
    };
  }, [session?.user?.id]); // Re-run when session ID is available

  if (isLoggingOut) return <LogoutTransition />;

  if (loading && !session) return null;

  if (!session) return <Navigate to="/auth" replace />;

  if (loading || isPreparing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <EduAnimation />
        <div className="flex flex-col items-center gap-6 relative z-10 w-full max-w-xs text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl border-4 border-primary/10 animate-[spin_3s_linear_infinite]" />
            <div className="w-16 h-16 rounded-2xl border-4 border-t-primary animate-[spin_1s_ease-in-out_infinite] absolute inset-0" />
            <Loader2 className="w-8 h-8 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-mono uppercase tracking-[0.5em] text-primary">Initializing</p>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest opacity-50 animate-pulse">Synchronizing Knowledge Vault</p>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 w-full">
            <button 
              onClick={handleLogout}
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary transition-colors font-mono"
            >
              Sign Out & Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = session?.user;
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Learner";

  const profileData = {
    totalXP: profile?.total_xp || 0,
    streakCount: profile?.streak_count || 0,
    multiplierActive: profile?.multiplier_active || false,
    multiplierExpiresAt: profile?.multiplier_expires_at ? new Date(profile.multiplier_expires_at) : undefined,
    displayName,
    avatarUrl: profile?.avatar_url || undefined,
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        totalXP={profileData.totalXP}
        streakCount={profileData.streakCount}
        multiplierActive={profileData.multiplierActive}
        onLogout={handleLogout}
        userRole={profile?.role}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn("transition-all duration-300", sidebarCollapsed ? "ml-[90px]" : "ml-[280px]")}
      >
        <Header
          userName={displayName}
          userEmail={user.email}
          avatarUrl={profileData.avatarUrl}
          userRole={profile?.role || "Student"}
          onProfileClick={() => handleNavigate("profile")}
          onSettingsClick={() => handleNavigate("settings")}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />

        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentPage === "dashboard" && <Dashboard userId={user.id} profile={profileData} onNavigate={handleNavigate} onProfileUpdate={(u) => setProfile(p => ({ ...p, ...u }))} />}
              {currentPage === "materials" && <Materials />}
              {currentPage === "flashcards" && <Flashcards />}
              {currentPage === "quizzes" && <Quizzes />}
              {currentPage === "chat" && <Chat />}
              {currentPage === "settings" && <Settings onProfileUpdate={(u) => setProfile(p => ({ ...p, ...u }))} />}
              {currentPage === "analytics" && <Analytics />}
              {currentPage === "assessment" && <Assessment />}

              {!["dashboard", "materials", "flashcards", "quizzes", "chat", "settings", "analytics", "assessment"].includes(currentPage) && (
                <div className="p-12 text-center text-muted-foreground font-mono uppercase tracking-widest opacity-50">Module Synchronization Complete.</div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default Index;
