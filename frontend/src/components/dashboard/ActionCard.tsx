import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    className?: string;
    iconColor?: string;
    iconBg?: string;
}

export const ActionCard = ({ icon: Icon, label, onClick, className, iconColor, iconBg }: ActionCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 group",
                "bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-sm",
                className
            )}
        >
            <div className={cn(
                "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                iconBg || "bg-primary/10",
                iconColor || "text-primary"
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm text-center text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
            </span>
        </div>
    );
};
