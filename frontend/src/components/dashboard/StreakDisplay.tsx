import { motion, AnimatePresence } from "framer-motion";
import { Flame, Timer } from "lucide-react";

interface StreakDisplayProps {
  streakCount: number;
  multiplierActive: boolean;
  multiplierExpiresAt?: Date;
}

export const StreakDisplay = ({
  streakCount,
  multiplierActive,
  multiplierExpiresAt,
}: StreakDisplayProps) => {
  const daysToMultiplier = Math.max(7 - streakCount, 0);
  
  const getTimeRemaining = () => {
    if (!multiplierExpiresAt) return null;
    const now = new Date();
    const diff = multiplierExpiresAt.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Background glow when multiplier is active */}
      <AnimatePresence>
        {multiplierActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-streak/10 via-transparent to-transparent"
          />
        )}
      </AnimatePresence>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Daily Streak</h3>
          {multiplierActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="badge-multiplier"
            >
              <Flame className="w-4 h-4" />
              2.5x XP
            </motion.div>
          )}
        </div>
        
        {/* Streak counter */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`relative ${multiplierActive ? 'fire-icon' : ''}`}>
            <Flame 
              className={`w-16 h-16 ${
                multiplierActive 
                  ? 'text-streak' 
                  : streakCount > 0 
                    ? 'text-streak/70' 
                    : 'text-muted-foreground'
              }`} 
            />
            {multiplierActive && (
              <motion.div
                className="absolute inset-0 bg-streak/30 blur-xl rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          
          <div>
            <p className="text-5xl font-bold text-foreground font-mono">
              {streakCount}
            </p>
            <p className="text-muted-foreground">
              {streakCount === 1 ? "day streak" : "days streak"}
            </p>
          </div>
        </div>
        
        {/* Progress to multiplier or timer */}
        {multiplierActive ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-streak/10 border border-streak/20">
            <Timer className="w-5 h-5 text-streak" />
            <span className="text-sm text-foreground">
              Multiplier expires in: <span className="font-mono font-semibold text-streak">{getTimeRemaining()}</span>
            </span>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress to 2.5x Multiplier</span>
              <span className="text-foreground font-mono">{streakCount}/7 days</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-fire rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((streakCount / 7) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {daysToMultiplier > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                🔥 {daysToMultiplier} more {daysToMultiplier === 1 ? "day" : "days"} until 2.5x XP boost!
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
