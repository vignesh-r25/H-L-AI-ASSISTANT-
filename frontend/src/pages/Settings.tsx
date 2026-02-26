import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Bell,
    Shield,
    Moon,
    Monitor,
    Laptop,
    Loader2,
    Edit2,
    Check,
    X,
    Camera,
    Smartphone,
    Mail,
    Lock,
    LogOut,
    ChevronRight,
    AtSign,
    ShieldCheck,
    Eye,
    Zap,
    Clock,
    UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AppleCard } from "@/components/ui/AppleCard";

interface Profile {
    id: string;
    email: string;
    display_name: string;
    role: string | null;
    avatar_url: string | null;
}

interface SettingsProps {
    onProfileUpdate?: (updates: Partial<Profile>) => void;
}

export const Settings = ({ onProfileUpdate }: SettingsProps) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState("");

    // Notification States
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    const [remindersEnabled, setRemindersEnabled] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);

    const { theme, setTheme } = useTheme();

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle(); // Better than .single() to avoid 406

            if (error) throw error;

            if (data) {
                setProfile(data as Profile);
                setEditName(data.display_name || "");
            } else {
                console.warn('No profile found for current user');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            toast.error("Cloud connection interrupted");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async () => {
        if (!editName.trim()) {
            toast.error("Display name cannot be empty");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user");

            const trimmedName = editName.trim();

            const { error: dbError } = await supabase
                .from('profiles')
                .update({
                    display_name: trimmedName
                })
                .eq('id', user.id);

            if (dbError) {
                console.warn('Database sync failed, falling back to user metadata:', dbError);
                // Fallback: Update user metadata in Auth
                const { error: authError } = await supabase.auth.updateUser({
                    data: { display_name: trimmedName }
                });

                if (authError) throw authError;

                toast.info("Syncing to cloud (metadata fallback)");
            } else {
                toast.success("Identity updated");
            }

            // Update local state first
            setProfile(prev => prev ? { ...prev, display_name: trimmedName } : null);

            // Explicitly call the parent update handler to sync across Dashboard/Header
            if (onProfileUpdate) {
                onProfileUpdate({ display_name: trimmedName });
            }

            setIsEditingName(false);
        } catch (error: any) {
            console.error('Profile update failed:', error);
            const isSchemaError = error.message?.includes('column "display_name" of relation "profiles" does not exist') || error.code === '42703';

            if (isSchemaError) {
                toast.error("Database schema out of sync. Please run the Fix SQL in our chat.");
            } else {
                toast.error(`Synchronization failed: ${error.message || "Please check your connection"}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 animate-pulse">
                    Loading account preferences...
                </p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                    <X className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Profile Unreachable</h2>
                <p className="text-muted-foreground mb-8 max-w-sm">We couldn't initialize your cloud profile. Please verify your connection status.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Retry Connection</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 space-y-12">

            {/* Clean Header */}
            <div className="space-y-4 pt-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-lg font-medium opacity-70">Personalize your learning environment and account security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                {/* Left: Account Summary */}
                <div className="md:col-span-4 space-y-8">
                    <div className="flex flex-col items-center p-8 bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                        <div className="relative group mb-6">
                            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Avatar className="w-24 h-24 border-2 border-background shadow-lg relative z-10 transition-transform active:scale-95 cursor-pointer">
                                <AvatarImage src={profile.avatar_url || ""} />
                                <AvatarFallback className="bg-muted text-foreground font-bold text-2xl">
                                    {(profile.display_name || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-all z-20 border-2 border-background">
                                <Camera className="w-3.5 h-3.5" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Basic validation
                                        if (!file.type.startsWith('image/')) {
                                            toast.error("Please upload an image file");
                                            return;
                                        }

                                        if (file.size > 2 * 1024 * 1024) {
                                            toast.error("Image must be smaller than 2MB");
                                            return;
                                        }

                                        setUploading(true);
                                        try {
                                            const { data: { user } } = await supabase.auth.getUser();
                                            if (!user) throw new Error("Unauthenticated");

                                            console.log("[Settings] Uploading avatar for user:", user.id);
                                            
                                            // 1. Upload to Storage
                                            const fileExt = file.name.split('.').pop();
                                            const filePath = `${user.id}/${Date.now()}.${fileExt}`;

                                            const { error: uploadError, data: uploadData } = await supabase.storage
                                                .from('avatars')
                                                .upload(filePath, file, { 
                                                    upsert: true,
                                                    contentType: file.type
                                                });

                                            if (uploadError) {
                                                console.error("[Settings] Storage upload error:", uploadError);
                                                const msg = uploadError.message === 'Bucket not found' ? 'Bucket not found (Create avatars bucket in Supabase)' : uploadError.message;
                                                throw new Error(`Cloud storage failure: ${msg}`);
                                            }

                                            // 2. Get Public URL
                                            const { data: { publicUrl } } = supabase.storage
                                                .from('avatars')
                                                .getPublicUrl(filePath);

                                            console.log("[Settings] Avatar uploaded. Public URL:", publicUrl);

                                            // 3. Update Profile Table
                                            const { error: updateError } = await supabase
                                                .from('profiles')
                                                .update({ avatar_url: publicUrl })
                                                .eq('id', user.id);

                                            if (updateError) {
                                                console.error("[Settings] Profile update error:", updateError);
                                                throw new Error("Identity sync failed");
                                            }

                                            // 4. Update Local State & Broadcast
                                            setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
                                            if (onProfileUpdate) {
                                                onProfileUpdate({ avatar_url: publicUrl });
                                            }

                                            toast.success("Photo synchronized");
                                        } catch (error: any) {
                                            console.error('[Settings] Photo update failed:', error);
                                            toast.error(error.message || "Photo synchronization failed");
                                        } finally {
                                            setUploading(false);
                                            // Reset input
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-full">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-xl font-bold">{profile.display_name}</h3>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-1 bg-muted rounded-full w-fit mx-auto">
                                {(profile.role || "Member").replace('_', ' ')}
                            </div>
                        </div>

                        <div className="w-full mt-10 space-y-4 pt-6 border-t border-border/50">
                            <div className="flex items-center gap-4 text-muted-foreground group">
                                <Mail className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-tight opacity-40">Email Address</p>
                                    <p className="text-sm font-medium truncate">{profile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground group">
                                <ShieldCheck className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity text-green-500" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-tight opacity-40">Cloud Status</p>
                                    <p className="text-sm font-medium">Identity Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Settings Sections */}
                <div className="md:col-span-8 space-y-8">

                    {/* Identity Section */}
                    <div className="space-y-4">
                        <Label className="px-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Profile Identification</Label>
                        <AppleCard className="p-0 border-border/30 overflow-hidden bg-card/10">
                            <div className="flex items-center justify-between p-6 group hover:bg-muted/30 transition-colors">
                                <div className="space-y-1 flex-1">
                                    <p className="text-sm font-semibold">Display Name</p>
                                    {isEditingName ? (
                                        <div className="flex items-center gap-2 mt-2 animate-in slide-in-from-top-1 duration-300">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-10 rounded-xl bg-background border-border/50 focus:ring-primary/20"
                                                autoFocus
                                            />
                                            <Button size="icon" onClick={handleSaveName} className="rounded-xl h-10 w-10 shrink-0">
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)} className="rounded-xl h-10 w-10 border border-border/50">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">{profile.display_name}</p>
                                    )}
                                </div>
                                {!isEditingName && (
                                    <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                        </AppleCard>
                    </div>

                    {/* Sync Section */}
                    <div className="space-y-4">
                        <Label className="px-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Cloud Synchronization</Label>
                        <AppleCard className="p-0 border-border/30 overflow-hidden bg-card/10">
                            <div className="divide-y divide-border/30">
                                {[
                                    { id: 'push', icon: Smartphone, label: "Interactive Alerts", desc: "Real-time push notifications", state: pushEnabled, setter: setPushEnabled },
                                    { id: 'mail', icon: Mail, label: "Weekly Digest", desc: "Automated progress summaries", state: emailUpdates, setter: setEmailUpdates },
                                    { id: 'remind', icon: Clock, label: "Intelligent Reminders", desc: "AI-driven study prompts", state: remindersEnabled, setter: setRemindersEnabled },
                                    { id: 'vis', icon: Eye, label: "Social Visibility", desc: "Allow tutors to see your progress", state: publicProfile, setter: setPublicProfile },
                                ].map((sys) => (
                                    <div key={sys.id} className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                                <sys.icon className="w-5 h-5 text-muted-foreground/70" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{sys.label}</p>
                                                <p className="text-[11px] text-muted-foreground/60 font-medium">{sys.desc}</p>
                                            </div>
                                        </div>
                                        <Switch checked={sys.state} onCheckedChange={sys.setter} />
                                    </div>
                                ))}
                            </div>
                        </AppleCard>
                    </div>

                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <Label className="px-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Neural Interface</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'dark', icon: Moon, label: 'Night' },
                                { id: 'light', icon: Laptop, label: 'Day' },
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setTheme(mode.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] border transition-all duration-300",
                                        theme === mode.id
                                            ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-sm"
                                            : "bg-card/30 border-border/40 hover:bg-card/50"
                                    )}
                                >
                                    <mode.icon className={cn("w-6 h-6", theme === mode.id ? "text-primary" : "text-muted-foreground")} />
                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme === mode.id ? "text-primary" : "text-muted-foreground/70")}>{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};
