import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface XPProgressBarProps {
  currentXP: number;
  nextMilestone: number;
  previousMilestone?: number;
}

export const XPProgressBar = ({ 
  currentXP, 
  nextMilestone, 
  previousMilestone = 0 
}: XPProgressBarProps) => {
  const progress = ((currentXP - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-xp" />
          <span className="text-sm font-medium text-muted-foreground">
            Progress to {nextMilestone.toLocaleString()} XP
          </span>
        </div>
        <span className="text-sm font-mono text-foreground">
          {currentXP.toLocaleString()} / {nextMilestone.toLocaleString()}
        </span>
      </div>
      
      <div className="xp-bar">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
        <span>{previousMilestone.toLocaleString()} XP</span>
        <span className="text-primary font-medium">
          {(nextMilestone - currentXP).toLocaleString()} XP to go
        </span>
        <span>{nextMilestone.toLocaleString()} XP</span>
      </div>
    </div>
  );
};
