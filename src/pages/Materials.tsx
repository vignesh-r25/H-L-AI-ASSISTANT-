import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Youtube, Search, Trash2, ExternalLink, Loader2, Plus, Filter, PlayCircle, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Use safe worker loading for Vite
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

const initPdfWorker = () => {
  try {
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    }
  } catch (e) {
    console.error("Failed to init PDF worker:", e);
  }
};

type Material = Database['public']['Tables']['materials']['Row'];

export const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initPdfWorker();
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

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      const { data: newMaterial, error: dbError } = await supabase
        .from("materials")
        .insert({
          title: file.name,
          type: "pdf",
          url: publicUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setMaterials([newMaterial as Material, ...materials]);
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
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
      toast.error("Failed to add video");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;

      setMaterials(materials.filter(m => m.id !== id));
      toast.success("Material removed");
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || m.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Knowledge Hub
          </h1>
          <p className="text-muted-foreground text-lg">
            Organize your study assets in one beautiful space.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <Button onClick={handleAddYoutube} variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all border-primary/20 bg-background/50 backdrop-blur-sm">
            <Youtube className="w-4 h-4 mr-2" />
            Add Link
          </Button>
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all bg-gradient-to-r from-primary to-purple-600 border-0">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {isUploading ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 items-center bg-card/30 backdrop-blur-md p-2 rounded-2xl border border-white/5 md:border-transparent"
      >
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10 bg-background/50 border-transparent focus:bg-background transition-all rounded-xl h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-background/50 backdrop-blur-sm h-11 p-1 rounded-xl w-full md:w-auto">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">All</TabsTrigger>
            <TabsTrigger value="pdf" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Documents</TabsTrigger>
            <TabsTrigger value="youtube" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">Videos</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Upload Zone (Visual) */}
      {!isLoading && materials.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-dashed border-primary/20 rounded-3xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer relative group"
        >
          <input
            type="file"
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop your files here</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Support for PDF documents to generate quizzes and flashcards automatically.
          </p>
        </motion.div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMaterials.map((material, index) => (
            <motion.div
              key={material.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-xl hover:shadow-primary/5 hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden relative">
                {/* Card Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <CardHeader className="p-5 pb-2 flex flex-row items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${material.type === "pdf" ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>
                    {material.type === "pdf" ? <BookOpen className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold leading-tight truncate" title={material.title}>
                      {material.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {new Date(material.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-2">
                  <div className="h-20 bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-border/50 group-hover:border-primary/20 transition-colors">
                    {material.type === "pdf" ? (
                      <FileText className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
                    ) : (
                      <Youtube className="w-8 h-8 text-muted-foreground/40 group-hover:text-red-500/40 transition-colors" />
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button variant="secondary" className="flex-1 h-9 text-xs font-medium bg-secondary/50 hover:bg-secondary transition-colors" asChild>
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      Open Resource
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(material.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMaterials.length === 0 && !isLoading && materials.length > 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No resources match your filters.</p>
          <Button variant="link" onClick={() => { setSearchQuery(""); setActiveTab("all"); }}>Clear filters</Button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}

    </div>
  );
};
