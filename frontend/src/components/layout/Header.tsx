import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User, FileText, Brain, Zap, MessageSquare, X, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HeaderProps {
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  userRole?: string;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

// Mock Search Data
// Mock Search Data
const SEARCH_ITEMS = [
  { id: "1", title: "Introduction to Machine Learning", type: "Material", icon: FileText, path: "/materials" },
  { id: "2", title: "Neural Networks Quiz", type: "Quiz", icon: Brain, path: "/quizzes" },
  { id: "3", title: "Python Basics Flashcards", type: "Flashcard", icon: Zap, path: "/flashcards" },
  { id: "4", title: "Calculus Revision Chat", type: "Chat", icon: MessageSquare, path: "/chat" },
  { id: "5", title: "Deep Learning pdf", type: "Material", icon: FileText, path: "/materials" },
  { id: "6", title: "React Hooks Guide", type: "Material", icon: FileText, path: "/materials" },
  // Navigation Items
  { id: "nav-1", title: "Dashboard", type: "Page", icon: FileText, path: "/dashboard" },
  { id: "nav-2", title: "Quizzes", type: "Page", icon: Brain, path: "/quizzes" },
  { id: "nav-3", title: "Flashcards", type: "Page", icon: Zap, path: "/flashcards" },
  { id: "nav-4", title: "Materials", type: "Page", icon: FileText, path: "/materials" },
  { id: "nav-5", title: "AI Chat", type: "Page", icon: MessageSquare, path: "/chat" },
  { id: "nav-6", title: "Analytics", type: "Page", icon: FileText, path: "/analytics" },
  { id: "nav-7", title: "Settings", type: "Page", icon: FileText, path: "/settings" },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'quiz' | 'achievement' | 'assignment' | 'system';
  read: boolean;
  created_at: string;
}

export const Header = ({
  userName,
  userEmail,
  avatarUrl,
  userRole = "Student",
  onProfileClick,
  onSettingsClick,
  onLogout,
  onNavigate,
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  // We need to use window.location or a passed navigate function if basic routing isn't available
  // But Index.tsx uses conditional rendering based on state, not real routes?
  // User's Index.tsx passes `onNavigate` to Dashboard, but Header doesn't receive it.
  // Wait, Index.tsx passes `onNavigate` only to Dashboard.
  // Header receives: userName, userEmail, userRole, onProfileClick, onSettingsClick, onLogout.
  // It DOES NOT receive onNavigate.
  // Converting this to use `window.dispatchEvent` or asking user to add prop will be cleaner.
  // For now, I'll assumne I can't easily change the props interface without breaking Index.tsx (though I can edit Index.tsx too).
  // Actually, I can edit Index.tsx to pass onNavigate to Header.

  // Let's rely on a custom event or just modify Props. Modifying Props is better.
  // I will add `onNavigate` to HeaderProps in the next tool call if needed, but for now let's just use a console log
  // or try to use `window.location.hash` hack?
  // No, `Index.tsx` uses `setCurrentPage`. 
  // I will update Index.tsx to pass `onNavigate` to Header as well.

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Initial fetch and setup
    const setupNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch initial notifications
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }

      // 2. Request Notification Permission
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // 3. Subscribe to Realtime Updates
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // UI Feedback
            toast.info(newNotification.title, {
              description: newNotification.message,
            });

            // Browser Notification (Mobile-style)
            if (Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/logo.png' // You can change this to your actual logo path
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupNotifications();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-black">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div ref={searchRef} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search materials, flashcards, quizzes..."
            className="pl-10 input-dark w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />

          {/* Search Results Dropdown - Fast Conditional Rendering */}
          {showResults && searchQuery.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-full bg-black border border-border/80 rounded-lg shadow-none overflow-hidden z-50">
              <ScrollArea className="max-h-[300px]">
                {filteredItems.length > 0 ? (
                  <div className="p-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5 mb-1 opacity-60">System Results</div>
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/10 transition-none text-left"
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate(item.path.replace('/', ''));
                          } else {
                            const event = new CustomEvent('navigate-to', { detail: item.path.replace('/', '') });
                            window.dispatchEvent(event);
                          }
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="p-2 bg-muted rounded-md text-primary">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{item.title}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm font-bold">
                    No results found.
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`cursor-pointer p-4 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold text-sm ${!notification.read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{getTimeAgo(notification.created_at)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full absolute right-2 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No updates yet</p>
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="w-full text-center text-sm text-primary font-medium cursor-pointer justify-center hover:bg-primary/5"
                    onClick={markAllAsRead}
                  >
                    <CheckSquare className="w-4 h-4 mr-2" /> Mark all as read
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole.replace('_', ' ')}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsClick}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
