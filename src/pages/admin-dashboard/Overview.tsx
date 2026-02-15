import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Brain, TrendingUp, UserPlus, Calendar, GraduationCap, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminOverview = () => {
    const [recentSignups, setRecentSignups] = useState<any[]>([]);

    useEffect(() => {
        fetchRecentSignups();
    }, []);

    const fetchRecentSignups = async () => {
        // Since we don't have direct access to auth.users created_at in profiles yet,
        // we will fetch profiles and assume recent ones are new for this demo
        // Ideally we would order by created_at if available
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .is('role', null) // filter student s
            .limit(5); // Just getting 5 for now as we don't have created_at sorted

        if (data) setRecentSignups(data);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back, Administrator.</p>
            </div>

            {/* Notification Area for New Signups */}
            <Card className="border-l-4 border-l-green-500 bg-green-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-600" />
                        New Account Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentSignups.length > 0 ? (
                        <div className="space-y-2">
                            {recentSignups.map((user) => (
                                <div key={user.id} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="font-medium">{user.display_name || user.email}</span>
                                        <span className="text-muted-foreground">created a new account.</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Just now</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No new signups recently.</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
                        <GraduationCap className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">4 ending today</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resource Files</CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">432</div>
                        <p className="text-xs text-muted-foreground">+24 new this week</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">84%</div>
                        <p className="text-xs text-muted-foreground">+2.4% from last week</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminOverview;
