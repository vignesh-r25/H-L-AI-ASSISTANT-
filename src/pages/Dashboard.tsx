import { motion, AnimatePresence } from "framer-motion";
import { Zap, BookOpen, Brain, Target, Bell } from "lucide-react";
import { useEffect } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
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

  const { notifications } = useNotifications();

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

      {/* Real-time Notifications / Activity Log */}
      {/* Real-time Notifications / Activity Log */}
      <AnimatePresence mode="popLayout">
        {notifications.length > 0 ? (
          <motion.div variants={item} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Activity Feed</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-emerald-500 font-mono">ONLINE</span>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {notifications.map(notif => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  className={`p-4 rounded-xl border flex gap-4 items-start relative group transition-all duration-300 ${notif.type === 'success'
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                      : notif.type === 'warning' || notif.type === 'error'
                        ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                        : 'bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10'
                    }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                      notif.type === 'warning' || notif.type === 'error' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-cyan-500/10 text-cyan-400'
                    }`}>
                    {notif.type === 'success' ? <Zap className="w-4 h-4" /> :
                      notif.type === 'warning' ? <Target className="w-4 h-4" /> :
                        <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-semibold text-sm ${notif.type === 'success' ? 'text-emerald-100' :
                          notif.type === 'warning' || notif.type === 'error' ? 'text-amber-100' :
                            'text-cyan-100'
                        }`}>{notif.title}</h3>
                      <span className="text-[10px] text-gray-500 font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                        {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={item} className="py-8 text-center border border-white/5 rounded-xl bg-white/5 border-dashed">
            <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-widest">No recent activity</p>
          </motion.div>
        )}
      </AnimatePresence>

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
