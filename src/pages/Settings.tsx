import { motion } from "framer-motion";
import { User, Bell, Shield, Moon, Monitor, Laptop, Loader2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";

export const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);

    // Theme hook
    const { theme, setTheme } = useTheme();

    // Editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) { // Added this condition
                setProfile(data);
                setEditName(data.display_name || "");
            } else {
                // Profile doesn't exist yet, prep mostly empty state
                setProfile({ id: user.id, email: user.email, role: 'student' });
                // Try to set display name from email
                const nameFromEmail = user.email?.split('@')[0] || "User";
                setEditName(nameFromEmail);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            const updates = {
                id: user.id,
                display_name: editName, // Save the edited name
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            setProfile({ ...profile, ...updates });
            setIsEditingName(false);
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error("Failed to save settings");
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-4xl"
        >
            <motion.div variants={item}>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </motion.div>

            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            <CardTitle>Profile Settings</CardTitle>
                        </div>
                        <CardDescription>Manage your public profile and account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                            <div className="space-y-0.5 flex-1 mr-4">
                                <Label className="text-base">Display Name</Label>
                                {isEditingName ? (
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="mt-1 max-w-xs"
                                    />
                                ) : (
                                    <div className="text-sm text-muted-foreground">{profile?.display_name || "User"}</div>
                                )}
                            </div>
                            <Button
                                variant={isEditingName ? "default" : "outline"}
                                onClick={() => {
                                    if (isEditingName) handleSave();
                                    else setIsEditingName(true);
                                }}
                            >
                                {isEditingName ? <Check className="w-4 h-4" /> : "Edit"}
                            </Button>
                            {isEditingName && (
                                <Button variant="ghost" size="icon" onClick={() => {
                                    setIsEditingName(false);
                                    setEditName(profile?.display_name || "");
                                }}>
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email</Label>
                                <div className="text-sm text-muted-foreground">{profile?.email || "No email"}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                            <div className="space-y-0.5">
                                <Label className="text-base">Role</Label>
                                <div className="text-sm text-muted-foreground capitalize">{(profile?.role || "Student").replace('_', ' ')}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-primary" />
                            <CardTitle>Appearance</CardTitle>
                        </div>
                        <CardDescription>Customize the application look and feel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <Button
                                variant={theme === 'dark' ? "default" : "outline"}
                                className="h-auto flex-col gap-2 p-4"
                                onClick={() => setTheme('dark')}
                            >
                                <Moon className="w-5 h-5" />
                                <span>Dark</span>
                            </Button>
                            <Button
                                variant={theme === 'light' ? "default" : "outline"}
                                className="h-auto flex-col gap-2 p-4"
                                onClick={() => setTheme('light')}
                            >
                                <Laptop className="w-5 h-5" />
                                <span>Light</span>
                            </Button>
                            <Button
                                variant={theme === 'system' ? "default" : "outline"}
                                className="h-auto flex-col gap-2 p-4"
                                onClick={() => setTheme('system')}
                            >
                                <Monitor className="w-5 h-5" />
                                <span>System</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item} className="flex justify-end gap-2">
                <Button onClick={handleSave}>Save Changes</Button>
            </motion.div>
        </motion.div>
    );
};
