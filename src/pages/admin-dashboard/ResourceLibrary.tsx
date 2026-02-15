import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book, FileText, Upload, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";

type Material = Database['public']['Tables']['materials']['Row'];

const CATEGORIES = ["Notes", "Test", "Quiz", "Lecture"];

const AdminResources = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Upload state
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Notes");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMaterials(data || []);
        } catch (error) {
            console.error("Error fetching materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file || !title) {
            toast.error("Please provide a title and select a file");
            return;
        }

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('materials')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Insert into DB
            const { data: { publicUrl } } = supabase.storage
                .from('materials')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('materials')
                .insert({
                    title: title,
                    type: category, // Using 'type' column for category
                    url: publicUrl,
                    user_id: user.id
                });

            if (dbError) throw dbError;

            toast.success("Material uploaded successfully!");
            setTitle("");
            setFile(null);
            fetchMaterials();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload material");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, url: string | null) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;

        try {
            // Delete from DB
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Attempt to delete from storage if we could extract path, 
            // but simplified here to just DB for safety/brevity

            toast.success("Resource deleted");
            setMaterials(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete resource");
        }
    };

    const groupedMaterials = materials.reduce((acc, curr) => {
        const type = curr.type || "Uncategorized";
        if (!acc[type]) acc[type] = [];
        acc[type].push(curr);
        return acc;
    }, {} as Record<string, Material[]>);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Upload Section */}
                <Card className="w-full md:w-1/3 h-fit glass-card">
                    <CardHeader>
                        <CardTitle>Add Resource</CardTitle>
                        <CardDescription>Upload files to the library</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="e.g. Chapter 1 Notes"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>File</Label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {file ? file.name : "Click to upload PDF/DOC"}
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>

                        <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                            {uploading ? "Uploading..." : "Add to Library"}
                        </Button>
                    </CardContent>
                </Card>

                {/* List Section */}
                <div className="flex-1 space-y-6">
                    <h2 className="text-2xl font-bold">Library Content</h2>

                    {Object.entries(groupedMaterials).map(([type, items]) => (
                        <div key={type} className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Book className="w-4 h-4 text-primary" /> {type}
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {items.map(item => (
                                    <Card key={item.id} className="glass-card hover:border-primary/50 transition-colors">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium truncate" title={item.title}>{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => window.open(item.url, '_blank')}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => handleDelete(item.id, item.url)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}

                    {materials.length === 0 && (
                        <div className="text-center p-12 text-muted-foreground">
                            No materials uploaded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminResources;
