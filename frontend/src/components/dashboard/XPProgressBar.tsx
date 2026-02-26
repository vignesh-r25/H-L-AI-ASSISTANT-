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
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
            Progress to {nextMilestone.toLocaleString()} XP
          </span>
        </div>
        <span className="text-sm font-mono text-foreground font-bold">
          {currentXP.toLocaleString()} / {nextMilestone.toLocaleString()}
        </span>
      </div>

      <div className="xp-bar h-2.5">
        <div
          className="xp-bar-fill h-full bg-primary rounded-full transition-none"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-xs text-muted-foreground font-bold">
        <span>{previousMilestone.toLocaleString()} XP</span>
        <span className="text-primary">
          {(nextMilestone - currentXP).toLocaleString()} XP left to goal
        </span>
        <span>{nextMilestone.toLocaleString()} XP</span>
      </div>
    </div>
  );
};
