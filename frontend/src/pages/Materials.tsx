import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Youtube, Search, Trash2, ExternalLink, Loader2, Plus, Filter, PlayCircle, BookOpen, Sparkles, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppleCard } from "@/components/ui/AppleCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { generateResponse } from "@/services/ai";

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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("[Materials] Awarding XP: 50 to user:", user.id);
        const { error: rpcError } = await supabase.rpc('award_xp', {
          target_id: user.id,
          amount: 50
        });
        if (rpcError) toast.error(`XP SYNC FAILED: ${rpcError.message}`);
      }

      setMaterials([newMaterial as Material, ...materials]);
      toast.success("File uploaded successfully! +50 XP");
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

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("[Materials] Awarding XP: 30 to user:", user.id);
        const { error: rpcError } = await supabase.rpc('award_xp', {
          target_id: user.id,
          amount: 30
        });
        if (rpcError) toast.error(`XP SYNC FAILED: ${rpcError.message}`);
      }

      setMaterials([newMaterial as Material, ...materials]);
      toast.success("YouTube link added! +30 XP");
    } catch (error) {
      toast.error("Failed to add video");
    }
  };

  const extractTextFromPdf = async (url: string): Promise<string> => {
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      let fullText = "";

      // Limit to first 10 pages to avoid excessive token usage/timeout
      const numPages = Math.min(pdf.numPages, 10);

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      return fullText.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Could not read PDF content");
    }
  };

  const handleAiSummarize = async (material: Material) => {
    toast.info(`AI is analyzing "${material.title}"...`);
    try {
      let contentToSummarize = `Resource Title: ${material.title}\nResource Type: ${material.type}\nLink: ${material.url}`;

      if (material.type === "pdf") {
        try {
          const extractedText = await extractTextFromPdf(material.url);
          if (extractedText) {
            // Truncate text if it's too long (roughly 12000 characters)
            contentToSummarize = `Content of PDF "${material.title}":\n\n${extractedText.substring(0, 12000)}`;
          }
        } catch (err) {
          console.warn("Falling back to metadata summary due to extraction error:", err);
        }
      }

      const prompt = `Provide a concise 3-bullet point summary of the following content. If it's a PDF, summarize the actual text content provided.
      
      ${contentToSummarize}`;

      const response = await generateResponse(prompt);
      alert(`AI Summary for ${material.title}:\n\n${response}`);
    } catch (error) {
      toast.error("Failed to generate summary");
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
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6">

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-background to-purple-500/5 border border-border/50 p-8 md:p-12">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 max-w-2xl"
          >
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Knowledge <span className="text-primary italic">Vault</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Your centralized hub for academic excellence. Organize, analyze, and master your study materials with AI-powered insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              onClick={handleAddYoutube}
              variant="outline"
              className="h-14 px-8 rounded-2xl bg-muted/50 border-border hover:bg-muted backdrop-blur-xl transition-all hover:scale-105"
            >
              <Youtube className="w-5 h-5 mr-3 text-red-500" />
              Import Video
            </Button>

            <div className="relative group">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button className="h-14 px-8 rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all bg-primary hover:bg-primary/90 border-0 hover:scale-105 group">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                ) : (
                  <Upload className="w-5 h-5 mr-3 group-hover:-translate-y-1 transition-transform" />
                )}
                <span className="text-lg font-semibold">
                  {isUploading ? "Processing..." : "Upload Source"}
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-card/30 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md"
      >
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search your library..."
            className="pl-12 bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-xl h-14 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted border border-border backdrop-blur-md h-14 p-1 rounded-xl w-full">
              <TabsTrigger value="all" className="rounded-lg h-12 px-6 data-[state=active]:bg-primary flex gap-2">
                All Assets <span className="opacity-50 text-xs">{materials.length}</span>
              </TabsTrigger>
              <TabsTrigger value="pdf" className="rounded-lg h-12 px-6 data-[state=active]:bg-primary flex gap-2">
                Documents <span className="opacity-50 text-xs">{materials.filter(m => m.type === 'pdf').length}</span>
              </TabsTrigger>
              <TabsTrigger value="youtube" className="rounded-lg h-12 px-6 data-[state=active]:bg-primary flex gap-2">
                Videos <span className="opacity-50 text-xs">{materials.filter(m => m.type === 'youtube').length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />

          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl bg-muted border border-border hidden sm:flex">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-primary/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Synchronizing your library...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-dashed border-border rounded-[3rem] p-20 text-center bg-muted/20 hover:bg-muted/40 transition-all relative group backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[3rem]" />

          <div className="relative z-10">
            <div className="w-32 h-32 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-primary/10">
              <BookOpen className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Your library is currently empty</h3>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed mb-10">
              Begin your journey by uploading academic papers or importing lecture videos.
              Our AI will automatically prepare them for deep learning.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="h-12 rounded-xl px-8" onClick={handleAddYoutube}>Add YouTube Link</Button>
              <div className="relative overflow-hidden inline-block group/btn">
                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
                <Button className="h-12 rounded-xl px-8 shadow-xl shadow-primary/20">Browse My Files</Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AppleCard
                  className="group relative h-full flex flex-col p-0 border-border bg-card hover:shadow-xl transition-all duration-500 rounded-[2.5rem] overflow-hidden cursor-pointer"
                  noPadding
                  onClick={() => window.open(material.url, '_blank')}
                >
                  {/* Thumbnail / Type Header */}
                  <div className={`relative h-40 w-full flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:h-32 ${material.type === "pdf" ? "bg-blue-500/10" : "bg-red-500/10"
                    }`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl ${material.type === "pdf" ? "bg-blue-500/20 text-blue-500" : "bg-red-500/20 text-red-500"
                        }`}
                    >
                      {material.type === "pdf" ? <FileText className="w-12 h-12" /> : <Youtube className="w-12 h-12" />}
                    </motion.div>

                    {/* Stats overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-bold text-foreground uppercase border border-border tracking-widest">
                        {material.type}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {material.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium mt-auto pt-6 border-t border-white/5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground/50 tracking-tighter">Added on</span>
                        <span>{new Date(material.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Actions Overlay Hover */}
                    <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-primary hover:text-white border border-white/10 shadow-xl transition-all"
                        onClick={(e) => { e.stopPropagation(); handleAiSummarize(material); }}
                        title="AI Summary"
                      >
                        <Sparkles className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-background/80 hover:bg-destructive hover:text-destructive-foreground border border-border shadow-xl transition-all"
                        onClick={(e) => handleDelete(material.id, e)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </AppleCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
