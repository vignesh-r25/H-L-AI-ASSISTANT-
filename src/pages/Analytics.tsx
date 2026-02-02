import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        materialsCount: 0,
        recentActivityCount: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { count: materialsCount } = await supabase
                .from('materials')
                .select('*', { count: 'exact', head: true });

            const { count: recentActivityCount } = await supabase
                .from('gamification_logs')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            setStats({
                materialsCount: materialsCount || 0,
                recentActivityCount: recentActivityCount || 0
            });
        } catch (error) {
            console.error("Error loading stats", error);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                    <p className="text-muted-foreground">Real-time overview of your learning resources</p>
                </div>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardDescription>Total Materials</CardDescription>
                        <CardTitle className="text-4xl">{stats.materialsCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-green-500 font-medium">Resources uploaded</div>
                    </CardContent>
                </Card>
                <Card className="glass-card bg-secondary/50">
                    <CardHeader className="pb-2">
                        <CardDescription>Recent Activity (7 Days)</CardDescription>
                        <CardTitle className="text-4xl">{stats.recentActivityCount}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Actions recorded</div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Activity Tracking</CardTitle>
                        <CardDescription>As you use the app (upload files, take quizzes), your stats will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Detailed charts coming after more data collection...
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};
