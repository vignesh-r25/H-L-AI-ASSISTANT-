import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Brain,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Flame,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Lock
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  totalXP: number;
  streakCount: number;
  multiplierActive: boolean;
  onLogout: () => void;
  userRole?: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "materials", label: "Materials", icon: FileText },
  { id: "flashcards", label: "Flashcards", icon: Brain },
  { id: "quizzes", label: "Quizzes", icon: BookOpen },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
  { id: "analytics", label: "Progress", icon: BarChart3 },
];

export const Sidebar = ({
  currentPage,
  onNavigate,
  totalXP,
  streakCount,
  multiplierActive,
  onLogout,
  userRole = "student",
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) => {

  return (
    <aside
      style={{ width: collapsed ? 90 : 280 }}
      className={cn(
        "fixed left-4 top-4 bottom-4 rounded-lg z-50 flex flex-col transition-none",
        "bg-black border border-border/80 shadow-none",
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className={cn("flex items-center gap-2 overflow-hidden text-foreground", collapsed && "hidden")}>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/40">
            <span className="font-bold text-primary text-xl">H</span>
          </div>
          <span className="font-bold text-xl tracking-tight">
            H&L ASSISTANT
          </span>
        </div>
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/40">
            <span className="font-bold text-primary text-xl">H</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn("shrink-0 rounded-lg hover:bg-muted/10", collapsed && "hidden")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats - Compact Mode Support */}
      <div className={cn("px-4 py-2", collapsed ? "flex flex-col gap-2 items-center" : "")}>
        {!collapsed ? (
          <div className="p-3 rounded-lg bg-muted/20 border border-border/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">
              <div className="p-1.5 rounded-md bg-muted text-primary">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="font-mono text-sm">{totalXP.toLocaleString()} XP</span>
            </div>
            <div className={cn("flex items-center gap-2 font-bold", multiplierActive ? "text-accent" : "text-muted-foreground")}>
              <Flame className={cn("w-4 h-4", multiplierActive && "fill-current")} />
              <span className="font-mono text-sm">{streakCount}D</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="w-10 h-10 mx-auto rounded-lg bg-muted text-primary flex items-center justify-center border border-border/30" title={`${totalXP} XP`}>
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className={cn("w-10 h-10 mx-auto rounded-lg bg-muted flex items-center justify-center border border-border/30", multiplierActive ? "text-accent" : "text-muted-foreground")} title={`${streakCount} Day Streak`}>
              <Flame className={cn("w-5 h-5", multiplierActive && "fill-current")} />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-1 scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-none group",
              currentPage === item.id
                ? "bg-primary text-primary-foreground font-bold"
                : "text-muted-foreground hover:bg-muted/10 hover:text-foreground font-medium"
            )}
          >
            <div className={cn(
              "p-1 rounded-md transition-none",
              currentPage === item.id ? "bg-black/20" : "bg-transparent"
            )}>
              <item.icon className={cn("w-5 h-5", collapsed ? "w-6 h-6 mx-auto" : "")} />
            </div>

            {!collapsed && (
              <span className="text-sm">{item.label}</span>
            )}
          </button>
        ))}

        {/* Divider */}
        <div className="my-4 h-px bg-border/40" />

        {/* Assessment - Admin Only */}
        {['teacher', 'super_admin', 'master', 'super-admin', 'super admin'].includes((userRole || '').toLowerCase()) && (
          <button
            onClick={() => onNavigate("assessment")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-none group mt-2 font-bold",
              currentPage === 'assessment'
                ? "bg-purple-accent text-white"
                : "text-purple-accent hover:bg-purple-accent/10"
            )}
          >
            <ClipboardCheck className={cn("w-5 h-5", collapsed ? "w-6 h-6 mx-auto" : "")} />
            {!collapsed && <span className="text-sm">Assessment</span>}
          </button>
        )}

        {/* Focus Mode */}
        <button
          onClick={() => window.location.href = "/focus-chamber"}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-none group mt-2",
            "bg-muted/20 text-primary border border-primary/30 font-bold"
          )}
        >
          <Lock className={cn("w-5 h-5", collapsed ? "w-6 h-6 mx-auto" : "")} />
          {!collapsed && <span className="text-sm tracking-wide">FOCUS CHAMBER</span>}
        </button>

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/40 space-y-2">
        <button
          onClick={() => onNavigate("settings")}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-none",
            currentPage === 'settings'
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/10"
          )}
        >
          <Settings className={cn("w-5 h-5", collapsed ? "w-6 h-6 mx-auto" : "")} />
          {!collapsed && <span className="font-bold text-sm">Settings</span>}
        </button>

        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-none",
            "text-destructive hover:bg-destructive/10 font-bold"
          )}
        >
          <LogOut className={cn("w-5 h-5", collapsed ? "w-6 h-6 mx-auto" : "")} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Collapse Button for collapsed state */}
      {collapsed && (
        <div className="absolute -right-3 top-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-full shadow-none bg-black border-border"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}

    </aside>
  );
};
