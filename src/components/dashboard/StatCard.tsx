import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  glowColor?: "cyan" | "orange" | "purple" | "green";
}

const glowClasses = {
  cyan: "before:bg-gradient-to-br before:from-xp/20 before:to-transparent",
  orange: "before:bg-gradient-to-br before:from-streak/20 before:to-transparent",
  purple: "before:bg-gradient-to-br before:from-purple/20 before:to-transparent",
  green: "before:bg-gradient-to-br before:from-success/20 before:to-transparent",
};

const iconBgClasses = {
  cyan: "bg-xp/15 text-xp",
  orange: "bg-streak/15 text-streak",
  purple: "bg-purple/15 text-purple",
  green: "bg-success/15 text-success",
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  glowColor = "cyan",
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`stat-card ${glowClasses[glowColor]}`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgClasses[glowColor]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? "text-success" : "text-destructive"
              }`}
            >
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
