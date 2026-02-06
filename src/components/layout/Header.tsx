import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  userRole?: string;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export const Header = ({
  userName,
  userEmail,
  avatarUrl,
  userRole = "Student",
  onProfileClick,
  onSettingsClick,
  onLogout,
}: HeaderProps) => {
  const navigate = useNavigate();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const { notifications } = useNotifications();
  const hasNotifications = notifications.length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search materials, flashcards, quizzes..."
            className="pl-10 bg-white/5 border-white/10 w-full h-10 text-sm focus:bg-white/10 transition-colors"
          />
        </div>

        {/* Right side */}
        {/* Right side */}
        <div className="flex items-center gap-4 h-full">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5 rounded-full w-10 h-10 transition-colors">
                <Bell className={`w-5 h-5 ${hasNotifications ? 'text-white' : 'text-gray-400'}`} />
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,229,255,0.5)]"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 text-gray-300 p-0 shadow-2xl rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Log</span>
                {hasNotifications && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">{notifications.length} New</span>}
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3 items-start last:border-0">
                      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-emerald-500' :
                        notif.type === 'warning' ? 'bg-amber-500' :
                          'bg-cyan-500'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 leading-none mb-1">{notif.title}</p>
                        <p className="text-xs text-gray-500 leading-tight">{notif.message}</p>
                        <p className="text-[10px] text-gray-600 mt-1.5 font-mono">{notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No new notifications</p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-white/10 mx-1"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-white/5 h-10 rounded-lg group">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-none">{userName}</p>
                  <p className="text-[10px] text-cyan-500/80 font-mono mt-1 uppercase tracking-wider">{userRole.replace('_', ' ')}</p>
                </div>
                <Avatar className="w-9 h-9 border border-white/10">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-cyan-950 text-cyan-200 text-xs font-bold ring-1 ring-cyan-500/30">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-white/10 text-gray-300">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium text-white">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={onProfileClick} className="focus:bg-white/10 focus:text-white cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsClick} className="focus:bg-white/10 focus:text-white cursor-pointer">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={onLogout} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
