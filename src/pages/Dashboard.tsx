import { motion } from "framer-motion";
import { Zap, BookOpen, Brain, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { XPProgressBar } from "@/components/dashboard/XPProgressBar";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentMaterials } from "@/components/dashboard/RecentMaterials";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useRealtimeStats } from "@/hooks/useRealtimeStats";

interface DashboardProps {
  userId?: string;
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

export const Dashboard = ({ userId, profile, onNavigate }: DashboardProps) => {
  const { stats } = useRealtimeStats(userId);
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
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8
      }
    }
  };

  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string; created_at: string }[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{ id: string; title: string; content: string; created_at: string } | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
    setAnnouncements(data || []);
  };

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-7xl mx-auto"
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
              <div
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-4 items-start cursor-pointer hover:bg-primary/10 transition-colors"
                role="button"
                tabIndex={0}
              >
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{ann.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ann.content}</p>
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

        {/* Quick Actions - Top Section */}
        <motion.div variants={item} className="glass-card p-6">
          <QuickActions
            onUploadPDF={() => onNavigate("materials")}
            onYouTube={() => onNavigate("materials")}
            onFlashcards={() => onNavigate("flashcards")}
            onAIChat={() => onNavigate("chat")}
            onQuiz={() => onNavigate("quizzes")}
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
            value={stats.materialsStudied}
            icon={BookOpen}
            glowColor="purple"
          />
          <StatCard
            title="Flashcards Mastered"
            value={stats.flashcardsMastered}
            icon={Brain}
            glowColor="green"
          />
          <StatCard
            title="Quiz Accuracy"
            value={`${stats.quizAccuracy}%`}
            icon={Target}
            glowColor="orange"
            trend={{ value: 5, isPositive: true }}
          />
        </motion.div>

        {/* Main Content Grid - Restored at Bottom */}
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
          {/* Left Column - Streak */}
          <motion.div variants={item} className="w-full lg:w-[350px] shrink-0 space-y-6">
            <StreakDisplay
              streakCount={profile.streakCount}
              multiplierActive={profile.multiplierActive}
              multiplierExpiresAt={profile.multiplierExpiresAt}
            />
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

      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {new Date(selectedAnnouncement?.created_at || '').toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-foreground whitespace-pre-wrap">
            {selectedAnnouncement?.content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
