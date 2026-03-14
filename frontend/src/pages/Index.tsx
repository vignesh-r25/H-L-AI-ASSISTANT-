import { Navigate } from "react-router-dom";
import { useState } from "react";
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
import { useAuthSession } from "@/hooks/useAuthSession";
import { useProfileSync } from "@/hooks/useProfileSync";

const Index = () => {
  const { session, sessionLoading, setSession } = useAuthSession();
  const { profile, isLoadingProfile, setProfile } = useProfileSync(session);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await supabase.auth.signOut();
      setSession(null);
      setIsLoggingOut(false);
    } catch (error) {
      console.error("Logout error:", error);
      setSession(null);
      setIsLoggingOut(false);
    }
  };

  const isPreparing = sessionLoading || (session && isLoadingProfile);

  if (isLoggingOut) return <LogoutTransition />;

  if (sessionLoading && !session) return null;

  if (!session && !sessionLoading) return <Navigate to="/auth" replace />;

  if (isPreparing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
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
    <div className="min-h-screen bg-background text-foreground">
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
              {currentPage === "dashboard" && <Dashboard userId={user.id} profile={profileData} onNavigate={handleNavigate} onProfileUpdate={setProfile} />}
              {currentPage === "materials" && <Materials />}
              {currentPage === "flashcards" && <Flashcards />}
              {currentPage === "quizzes" && <Quizzes />}
              {currentPage === "chat" && <Chat />}
              {currentPage === "settings" && <Settings onProfileUpdate={setProfile} />}
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
