import { motion } from "framer-motion";
import { Zap, BookOpen, Brain, Target, Upload, Youtube, MessageSquare, Calendar, ChevronRight, Camera, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { XPProgressBar } from "@/components/dashboard/XPProgressBar";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { RecentMaterials } from "@/components/dashboard/RecentMaterials";
import { AppleCard } from "@/components/ui/AppleCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useRealtimeStats } from "@/hooks/useRealtimeStats";
import { useWeeklyXP } from "@/hooks/useWeeklyXP";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { cn } from "@/lib/utils";

interface DashboardProps {
  userId?: string;
  profile: {
    totalXP: number;
    streakCount: number;
    multiplierActive: boolean;
    multiplierExpiresAt?: Date;
    displayName: string;
    avatarUrl?: string;
  };
  onNavigate: (page: string) => void;
  onProfileUpdate?: (updates: any) => void;
}

export const Dashboard = ({ userId, profile, onNavigate, onProfileUpdate }: DashboardProps) => {
  const { stats } = useRealtimeStats(userId);
  const { data: weeklyXP } = useWeeklyXP(userId);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; content: string; created_at: string }[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{ id: string; title: string; content: string; created_at: string } | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchRecentMaterials();
    }
  }, [userId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      console.log("[Dashboard] Uploading avatar to path:", filePath);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error("[Dashboard] Storage upload error:", uploadError);
        let friendlyMsg = uploadError.message;
        if (uploadError.message === 'Bucket not found') {
          friendlyMsg = 'Bucket Not Found: Please create the "avatars" bucket in your Supabase storage.';
        } else if (uploadError.message.includes('Invalid Compact JWS') || (uploadError as any).status === 400) {
          friendlyMsg = 'Connection Error: Supabase keys in .env might be misconfigured.';
        }
        throw new Error(friendlyMsg);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrl) throw new Error("Failed to generate public URL");

      console.log("[Dashboard] Avatar uploaded successfully. Public URL:", publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error("[Dashboard] Profile sync error:", updateError);
        throw new Error(`Profile sync failed: ${updateError.message}`);
      }

      if (onProfileUpdate) {
        onProfileUpdate({ avatar_url: publicUrl });
      }
      toast.success("Profile photo updated");
    } catch (error: any) {
      console.error("[Dashboard] Photo update failed:", error);
      toast.error(error.message || "Unknown synchronization failure");
    } finally {
      setUploading(false);
    }
  };

  const fetchRecentMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && data) {
      const mapped = data.map((m: any) => ({
        id: m.id,
        title: m.title,
        type: m.type === 'video' ? 'youtube' : m.type,
        createdAt: new Date(m.created_at),
        progress: 0
      }));
      setRecentMaterials(mapped);
    }
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3);
      setAnnouncements(data || []);
    };
    fetchAnnouncements();
  }, []);

  const handleMaterialDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      setRecentMaterials(prev => prev.filter(m => m.id !== id));
      toast.success("Material deleted");
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    }
  };

  const getNextMilestone = (currentXP: number) => {
    const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
    return milestones.find((m) => m > currentXP) || currentXP + 1000;
  };

  const getPreviousMilestone = (currentXP: number) => {
    const milestones = [0, 100, 250, 500, 1000, 2500, 5000, 10000];
    const index = milestones.findIndex((m) => m > currentXP);
    return milestones[Math.max(0, index - 1)] || 0;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  } as const;

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 max-w-[1300px] mx-auto pb-24 px-4 sm:px-6 text-foreground"
      >

        {/* Professional Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden md:block relative"
                >
                  <Avatar className="w-24 h-24 border-2 border-primary/20 p-1 bg-card overflow-visible">
                    <AvatarImage src={profile.avatarUrl} className="rounded-full object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>

                    {/* Hover Upload Overlay */}
                    <label className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-6 h-6 text-foreground" />
                        <span className="text-[10px] text-foreground font-bold uppercase tracking-widest">Update</span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>

                    {/* Small Camera Badge */}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-background text-primary-foreground shadow-xl z-20">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </div>
                  </Avatar>
                </motion.div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight hover-word-visible">
                    Welcome back, <span className="text-primary">{profile.displayName}</span>
                  </h1>
                </div>
                <p className="text-muted-foreground text-xl mt-3 font-medium opacity-60 max-w-2xl">
                  Professional learning workspace. All systems synchronized and ready.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="p-6 px-8 rounded-lg bg-card border border-border/60 shadow-none min-w-[300px]">
              <XPProgressBar
                currentXP={profile.totalXP}
                nextMilestone={getNextMilestone(profile.totalXP)}
                previousMilestone={getPreviousMilestone(profile.totalXP)}
              />
            </div>
          </div>
        </motion.div>

        {/* 1. Announcements Selection */}
        {announcements.length > 0 && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <AppleCard
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className="p-5 flex gap-4 items-center cursor-pointer hover:bg-muted/10 border-border/60 bg-card"
                noPadding
              >
                <div className="p-3 bg-muted rounded-2xl shrink-0">
                  <Zap className="w-4 h-4 text-primary opacity-70" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-sm tracking-tight truncate">{ann.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ann.content}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/20" />
              </AppleCard>
            ))}
          </motion.div>
        )}

        {/* 2. Primary Tools & Progress View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Access (Left) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-4">
            <AppleCard className="p-8 h-full bg-card/20 border-border/30">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary/70" /> Quick Access
              </h3>
              <div className="grid grid-cols-1 gap-4 flex-1">
                {[
                  { id: 'materials-pdf', label: 'Upload Study Material', icon: Upload, color: 'text-blue-500', bgColor: 'bg-blue-500/20', target: 'materials' },
                  { id: 'materials-yt', label: 'Import from YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-500/20', target: 'materials' },
                  { id: 'quizzes-start', label: 'Begin Practice Quiz', icon: Target, color: 'text-orange-500', bgColor: 'bg-orange-500/20', target: 'quizzes' }
                ].map((tool) => (
                  <Button
                    key={tool.id}
                    variant="ghost"
                    className="justify-start h-16 gap-4 bg-muted/30 border border-border/10 hover:border-border/40 hover:bg-muted/50 transition-all rounded-2xl group text-md font-semibold"
                    onClick={() => onNavigate(tool.target)}
                  >
                    <div className={cn("p-2.5 rounded-xl transition-colors", tool.bgColor, tool.color)}>
                      <tool.icon className="w-5 h-5" />
                    </div>
                    {tool.label}
                  </Button>
                ))}
              </div>
            </AppleCard>
          </motion.div>

          {/* Progress Tracking (Right) */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <AppleCard className="p-8 h-full bg-card/20 border-border/30">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Intellectual Flow</h3>
                  <p className="text-sm text-muted-foreground opacity-60">Daily XP synchronization</p>
                </div>
              </div>
              <div className="h-[300px]">
                <ActivityChart data={weeklyXP} />
              </div>
            </AppleCard>
          </motion.div>
        </div>

        {/* 3. Deep Context Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Recent Knowledge Nodes (Left) */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <AppleCard className="p-10 h-full bg-card/20 border-border/30">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold tracking-tight">Recent Knowledge Nodes</h3>
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/10 rounded-xl" onClick={() => onNavigate("materials")}>
                  Open Vault
                </Button>
              </div>
              <RecentMaterials
                materials={recentMaterials}
                onMaterialClick={() => onNavigate("materials")}
                onViewAll={() => onNavigate("materials")}
                onDelete={handleMaterialDelete}
              />
            </AppleCard>
          </motion.div>

          {/* Performance Diagnostics (Right) */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
            <StreakDisplay
              streakCount={profile.streakCount}
              multiplierActive={profile.multiplierActive}
              multiplierExpiresAt={profile.multiplierExpiresAt}
            />

            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Total XP', val: profile.totalXP, icon: Zap, color: 'cyan' },
                { label: 'Materials', val: stats.materialsStudied, icon: BookOpen, color: 'purple' },
                { label: 'Mastered', val: stats.flashcardsMastered, icon: Brain, color: 'green' },
                { label: 'Efficiency', val: `${stats.quizAccuracy}%`, icon: Target, color: 'orange' }
              ].map((stat, i) => (
                <StatCard
                  key={i}
                  title={stat.label}
                  value={stat.val}
                  icon={stat.icon}
                  glowColor={stat.color as any}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/50 rounded-[2.5rem]">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest opacity-50">
              Node Update • {new Date(selectedAnnouncement?.created_at || '').toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 text-foreground/80 text-md leading-relaxed whitespace-pre-wrap font-medium">
            {selectedAnnouncement?.content}
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={() => setSelectedAnnouncement(null)} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
              Acknowledged
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
