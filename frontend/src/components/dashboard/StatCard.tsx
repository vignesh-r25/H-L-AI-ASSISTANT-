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

const iconBgClasses = {
  cyan: "bg-muted text-primary opacity-90",
  orange: "bg-muted text-accent opacity-90",
  purple: "bg-muted text-purple-accent opacity-90",
  green: "bg-muted text-success-green opacity-90",
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
    <div className="stat-card">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconBgClasses[glowColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? "text-success-green" : "text-destructive"
                }`}
            >
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold mb-1 opacity-60">{title}</p>
          <p className="text-3xl font-bold text-foreground font-mono">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
