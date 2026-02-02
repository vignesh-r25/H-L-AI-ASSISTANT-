import { motion } from "framer-motion";
import { Zap, BookOpen, Brain, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { XPProgressBar } from "@/components/dashboard/XPProgressBar";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentMaterials } from "@/components/dashboard/RecentMaterials";

interface DashboardProps {
  profile: {
    totalXP: number;
    streakCount: number;
    multiplierActive: boolean;
    multiplierExpiresAt?: Date;
    displayName: string;
  };
  onNavigate: (page: string) => void;
}

// Mock data - will be replaced with real data
const mockMaterials = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    type: "pdf" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    progress: 75,
  },
  {
    id: "2",
    title: "Deep Learning Fundamentals - YouTube",
    type: "youtube" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    progress: 100,
  },
  {
    id: "3",
    title: "Neural Networks Explained",
    type: "pdf" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    progress: 30,
  },
];

export const Dashboard = ({ profile, onNavigate }: DashboardProps) => {
  const getNextMilestone = (currentXP: number) => {
    const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
    return milestones.find((m) => m > currentXP) || currentXP + 1000;
  };

  const getPreviousMilestone = (currentXP: number) => {
    const milestones = [0, 100, 250, 500, 1000, 2500, 5000, 10000];
    const index = milestones.findIndex((m) => m > currentXP);
    return milestones[Math.max(0, index - 1)] || 0;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
    setAnnouncements(data || []);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Welcome back, <span className="gradient-text">{profile.displayName}</span>!
        </h1>
        <p className="text-muted-foreground">
          Ready to continue your learning journey? Let's make today count.
        </p>
      </motion.div>

      {/* Announcements Broadcast */}
      {announcements.length > 0 && (
        <motion.div variants={item} className="space-y-4">
          {announcements.map(ann => (
            <div key={ann.id} className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-4 items-start">
              <div className="p-2 bg-primary/10 rounded-full">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{ann.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">{new Date(ann.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* XP Progress */}
      <motion.div variants={item} className="glass-card p-6">
        <XPProgressBar
          currentXP={profile.totalXP}
          nextMilestone={getNextMilestone(profile.totalXP)}
          previousMilestone={getPreviousMilestone(profile.totalXP)}
        />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total XP"
          value={profile.totalXP}
          icon={Zap}
          glowColor="cyan"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Materials Studied"
          value={mockMaterials.length}
          icon={BookOpen}
          glowColor="purple"
        />
        <StatCard
          title="Flashcards Mastered"
          value={42}
          icon={Brain}
          glowColor="green"
        />
        <StatCard
          title="Quiz Accuracy"
          value="87%"
          icon={Target}
          glowColor="orange"
          trend={{ value: 5, isPositive: true }}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8 max-w-7xl mx-auto">
        {/* Left Column - Streak & Actions */}
        <motion.div variants={item} className="w-full lg:w-[350px] shrink-0 space-y-6">
          <StreakDisplay
            streakCount={profile.streakCount}
            multiplierActive={profile.multiplierActive}
            multiplierExpiresAt={profile.multiplierExpiresAt}
          />
          <div className="glass-card p-6">
            <QuickActions
              onUploadPDF={() => onNavigate("materials")}
              onYouTube={() => onNavigate("materials")}
              onFlashcards={() => onNavigate("flashcards")}
              onAIChat={() => onNavigate("chat")}
              onQuiz={() => onNavigate("quizzes")}
            />
          </div>
        </motion.div>

        {/* Right Column - Recent Materials */}
        <motion.div variants={item} className="w-full lg:flex-1 max-w-3xl">
          <RecentMaterials
            materials={mockMaterials}
            onMaterialClick={(id) => console.log("Open material:", id)}
            onViewAll={() => onNavigate("materials")}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
