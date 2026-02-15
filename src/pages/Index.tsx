import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
// import { AuthForm } from "@/components/auth/AuthForm"; // Removed
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
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  display_name: string;
  total_xp: number;
  streak_count: number;
  multiplier_active: boolean;
  multiplier_expires_at: string | null;
  deep_learn_unlocked: boolean;
  custom_flashcards_unlocked: boolean;
  role: string | null;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      handleNavigate(customEvent.detail);
    };
    window.addEventListener('navigate-to', handleCustomNav);
    return () => window.removeEventListener('navigate-to', handleCustomNav);
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data as unknown as Profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading H&L...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to auth page
  if (!session || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated - show dashboard
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Learner";
  const profileData = {
    totalXP: profile?.total_xp || 0,
    streakCount: profile?.streak_count || 0,
    multiplierActive: profile?.multiplier_active || false,
    multiplierExpiresAt: profile?.multiplier_expires_at
      ? new Date(profile.multiplier_expires_at)
      : undefined,
    displayName,
  };

  const handleProfileUpdate = (updates: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates } as Profile);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        totalXP={profileData.totalXP}
        streakCount={profileData.streakCount}
        multiplierActive={profileData.multiplierActive}
        onLogout={handleLogout}
        userRole={profile?.role}
      />

      <div className="ml-[280px]">
        <Header
          userName={displayName}
          userEmail={user.email}
          userRole={profile?.role || "Student"}
          onProfileClick={() => handleNavigate("profile")}
          onSettingsClick={() => handleNavigate("settings")}
          onLogout={handleLogout}
        />

        <main className="p-6">

          {currentPage === "dashboard" && (
            <Dashboard
              userId={user?.id}
              profile={profileData}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "materials" && <Materials />}
          {currentPage === "flashcards" && <Flashcards />}
          {currentPage === "quizzes" && <Quizzes />}
          {currentPage === "chat" && <Chat />}
          {currentPage === "settings" && <Settings onProfileUpdate={handleProfileUpdate} />}
          {currentPage === "analytics" && <Analytics />}
          {currentPage === "assessment" && (['teacher', 'super_admin', 'master', 'super-admin'].includes((profile?.role || '').toLowerCase()) ?
            <Assessment /> :
            <div className="text-center p-10 text-destructive">Unauthorized Access</div>
          )}

          {!["dashboard", "materials", "flashcards", "quizzes", "chat", "settings", "analytics", "assessment"].includes(currentPage) && (
            <div className="glass-card p-12 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                This section is coming soon! We're building amazing AI-powered features.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
