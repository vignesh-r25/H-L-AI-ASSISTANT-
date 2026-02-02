import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Youtube, Search, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Database } from "@/integrations/supabase/types";

type Material = Database['public']['Tables']['materials']['Row'];

export const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMaterials(data as Material[] || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      // 3. Save Metadata to DB (using existing schema columns)
      const { data: newMaterial, error: dbError } = await supabase
        .from("materials")
        .insert({
          title: file.name,
          type: "pdf",
          url: publicUrl,
          // user_id is automatically handled by RLS/default value usually, but if needed we can try to omit it or fetch from session
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setMaterials([newMaterial as Material, ...materials]);
      toast.success("File uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error.message?.includes("Bucket not found") || error.statusCode === "404") {
        toast.error("Storage bucket not found", {
          description: "Please creating a public bucket named 'materials' in your Supabase dashboard."
        });
      } else {
        toast.error(error.message || "Failed to upload file");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddYoutube = async () => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      toast.error("Invalid YouTube URL");
      return;
    }

    try {
      const { data: newMaterial, error } = await supabase
        .from("materials")
        .insert({
          title: "New Video Resource",
          type: "youtube",
          url: url,
        })
        .select()
        .single();

      if (error) throw error;

      setMaterials([newMaterial as Material, ...materials]);
      toast.success("YouTube link added!");
    } catch (error) {
      console.error("Error adding youtube video:", error);
      toast.error("Failed to add video");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;

      setMaterials(materials.filter(m => m.id !== id));
      toast.success("Material removed");
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Materials</h1>
          <p className="text-muted-foreground">Manage your PDFs and video resources</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddYoutube} variant="outline" className="gap-2">
            <Youtube className="w-4 h-4" />
            Add Video
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          className="pl-10 bg-background/50 border-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Materials Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => (
          <motion.div key={material.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  {material.type === "pdf" ? (
                    <FileText className="w-6 h-6 text-primary" />
                  ) : (
                    <Youtube className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(material.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
                  {material.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-xs">
                  <span>{new Date(material.created_at).toLocaleDateString()}</span>
                </CardDescription>
                <Button variant="secondary" className="w-full mt-4 gap-2" asChild>
                  <a href={material.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No materials found. Upload a PDF or add a YouTube link to get started.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
