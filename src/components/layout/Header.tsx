import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User, FileText, Brain, Zap, MessageSquare } from "lucide-react";
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
}

// Mock Search Data
const SEARCH_ITEMS = [
  { id: "1", title: "Introduction to Machine Learning", type: "Material", icon: FileText, path: "/materials" },
  { id: "2", title: "Neural Networks Quiz", type: "Quiz", icon: Brain, path: "/quizzes" },
  { id: "3", title: "Python Basics Flashcards", type: "Flashcard", icon: Zap, path: "/flashcards" },
  { id: "4", title: "Calculus Revision Chat", type: "Chat", icon: MessageSquare, path: "/chat" },
  { id: "5", title: "Deep Learning pdf", type: "Material", icon: FileText, path: "/materials" },
  { id: "6", title: "React Hooks Guide", type: "Material", icon: FileText, path: "/materials" },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Quiz Available",
    message: "Test your knowledge with the new Neural Networks quiz!",
    time: "2m ago",
    read: false,
  },
  {
    id: 2,
    title: "Achievement Unlocked",
    message: "You've completed your first 7-day streak! Keep it up!",
    time: "1h ago",
    read: false,
  },
  {
    id: 3,
    title: "Assignment Due",
    message: "Machine Learning Basics assignment is due in 24 hours.",
    time: "5h ago",
    read: false,
  },
];

export const Header = ({
  userName,
  userEmail,
  avatarUrl,
  userRole = "Student",
  onProfileClick,
  onSettingsClick,
  onLogout,
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
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

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 left-0 w-full bg-popover border rounded-xl shadow-xl overflow-hidden z-50"
              >
                <ScrollArea className="max-h-[300px]">
                  {filteredItems.length > 0 ? (
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-1">Results</div>
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                          onClick={() => {
                            // Since we don't have onNavigate prop yet, we'll dispatch a custom event
                            // This is a temporary workaround until we update Index.tsx
                            const event = new CustomEvent('navigate-to', { detail: item.path.replace('/', '') });
                            window.dispatchEvent(event);
                            setShowResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No results found.
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {MOCK_NOTIFICATIONS.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{notification.title}</span>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full text-center text-sm text-primary font-medium cursor-pointer justify-center">
                Mark all as read
              </DropdownMenuItem>
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
