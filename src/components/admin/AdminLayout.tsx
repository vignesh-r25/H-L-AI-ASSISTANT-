import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    Megaphone,
    GraduationCap,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("Logged out successfully");
            navigate("/auth");
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", path: "/admin-dashboard" },
        { icon: Megaphone, label: "Announcements", path: "/admin-dashboard/announcements" },
        { icon: GraduationCap, label: "Quiz Manager", path: "/admin-dashboard/quizzes" },
        { icon: BookOpen, label: "Resource Library", path: "/admin-dashboard/resources" },
        { icon: Users, label: "Student Analytics", path: "/admin-dashboard/analytics" },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? "w-64" : "w-20"} 
                    lg:relative
                `}
            >
                <div className="h-full flex flex-col">
                    <div className="p-4 flex items-center justify-between border-b border-border/50">
                        <h1 className={`font-bold text-xl text-primary transition-opacity ${!isSidebarOpen && "opacity-0 hidden"}`}>
                            H&L Admin
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="ml-auto"
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link to={item.path} key={item.path}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={`w-full justify-start gap-3 ${!isSidebarOpen && "justify-center px-0"}`}
                                        title={item.label}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                        {isSidebarOpen && <span>{item.label}</span>}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-border/50">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 ${!isSidebarOpen && "justify-center px-0"}`}
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5" />
                            {isSidebarOpen && <span>Logout</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
