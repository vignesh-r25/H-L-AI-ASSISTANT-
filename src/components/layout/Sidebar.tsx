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

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  totalXP: number;
  streakCount: number;
  multiplierActive: boolean;
  onLogout: () => void;
  userRole?: string | null;
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
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center justify-start overflow-hidden max-w-[200px]"
          >
            <img
              src="/hl-logo.png"
              alt="H&L AI Assistant"
              className="h-10 w-auto object-contain"
            />
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className={`p-4 border-b border-sidebar-border ${collapsed ? 'hidden' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="badge-xp">
            <Zap className="w-4 h-4" />
            {totalXP.toLocaleString()} XP
          </div>
          <div className={`badge-streak ${multiplierActive ? 'glow-orange' : ''}`}>
            <Flame className={`w-4 h-4 ${multiplierActive ? 'fire-icon' : ''}`} />
            {streakCount}
          </div>
        </div>
        {multiplierActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 p-2 rounded-lg bg-streak/10 border border-streak/20"
          >
            <p className="text-xs text-streak font-medium">🔥 2.5x Multiplier Active!</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`nav-item w-full relative group ${currentPage === item.id
                    ? 'bg-primary/10 text-primary border-r-2 border-primary/50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } transition-all duration-200`}
              >
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/5 rounded-lg"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`flex items-center gap-3 relative z-10 ${collapsed ? 'justify-center w-full px-0' : 'px-2'}`}>
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${currentPage === item.id ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]' : 'group-hover:text-cyan-200'
                    }`} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-hidden whitespace-nowrap font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </button>
            </li>
          ))}

          {/* Assessment Command Center - Only for Admins/Teachers */}
          {['teacher', 'super_admin', 'master', 'super-admin', 'super admin'].includes((userRole || '').toLowerCase()) && (
            <li>
              <button
                onClick={() => onNavigate("assessment")}
                className={`nav-item w-full relative group ${currentPage === 'assessment' ? 'text-cyan-400 bg-cyan-950/20' : 'text-cyan-600 hover:text-cyan-400 hover:bg-cyan-950/10'
                  }`}
              >
                <div className={`flex items-center gap-3 relative z-10 ${collapsed ? 'justify-center w-full px-0' : 'px-2'}`}>
                  <ClipboardCheck className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="overflow-hidden whitespace-nowrap font-semibold">
                      Assessment
                    </span>
                  )}
                </div>
              </button>
            </li>
          )}

          {/* Focus Chamber - Available to all */}
          <li>
            <button
              onClick={() => window.location.href = "/focus-chamber"}
              className="nav-item w-full text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 group"
            >
              <div className={`flex items-center gap-3 relative z-10 ${collapsed ? 'justify-center w-full px-0' : 'px-2'}`}>
                <div className="p-1 rounded bg-blue-950/50 group-hover:bg-blue-900/50">
                  <Lock className="w-3 h-3 text-blue-500" />
                </div>
                {!collapsed && (
                  <span className="overflow-hidden whitespace-nowrap font-bold tracking-wide text-xs">
                    FOCUS MODE
                  </span>
                )}
              </div>
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => onNavigate("settings")}
          className="nav-item w-full"
        >
          <Settings className="w-5 h-5 shrink-0" />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            className="overflow-hidden whitespace-nowrap"
          >
            Settings
          </motion.span>
        </button>
        <button
          onClick={onLogout}
          className="nav-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            className="overflow-hidden whitespace-nowrap"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
};
