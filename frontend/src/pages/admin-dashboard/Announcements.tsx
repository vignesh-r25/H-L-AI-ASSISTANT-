import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Plus, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author_id: string;
}

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error("Error fetching announcements:", error);
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim() || !newContent.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setPosting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('announcements')
                .insert({
                    title: newTitle,
                    content: newContent,
                    author_id: user.id
                });

            if (error) throw error;

            toast.success("Announcement posted!");
            setIsCreating(false);
            setNewTitle("");
            setNewContent("");
            fetchAnnouncements();
        } catch (error) {
            console.error("Error creating announcement:", error);
            toast.error("Failed to post announcement");
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Announcement deleted");
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Failed to delete announcement");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Announcements</h1>
                    <p className="text-muted-foreground">Manage global updates for students</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> New Announcement</>}
                </Button>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="glass-card mb-6 border-primary/20">
                            <CardHeader>
                                <CardTitle>New Announcement</CardTitle>
                                <CardDescription>This will be visible to all students immediately.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Title (e.g., 'Final Exam Schedule')"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                />
                                <Textarea
                                    placeholder="Content..."
                                    className="min-h-[100px]"
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleCreate} disabled={posting}>
                                        {posting ? "Posting..." : <><Send className="w-4 h-4 mr-2" /> Post Now</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No announcements yet.</p>
                    </div>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id} className="glass-card group relative">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{announcement.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Posted {new Date(announcement.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(announcement.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                    {announcement.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncements;
