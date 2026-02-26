import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Youtube, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Material = Database['public']['Tables']['materials']['Row'];

interface FocusReaderProps {
    onMaterialChange: (material: Material | null) => void;
}

export const FocusReader = ({ onMaterialChange }: FocusReaderProps) => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            const { data } = await supabase
                .from("materials")
                .select("*")
                .order("created_at", { ascending: false });

            if (data) {
                setMaterials(data as Material[]);
            }
            setLoading(false);
        };
        fetchMaterials();
    }, []);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        const mat = materials.find(m => m.id === id) || null;
        onMaterialChange(mat);
    };

    const selectedMaterial = materials.find(m => m.id === selectedId);

    // Youtube Embed Helper
    const getYoutubeEmbed = (url: string) => {
        let videoId = "";
        if (url.includes("youtu.be")) {
            videoId = url.split("/").pop() || "";
        } else if (url.includes("youtube.com")) {
            const params = new URLSearchParams(new URL(url).search);
            videoId = params.get("v") || "";
        }
        return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-950 text-slate-300">
            {/* Header / Selector */}
            <div className="h-14 border-b border-white/10 flex items-center px-4 gap-4 bg-black/20">
                <div className="flex items-center gap-2 text-blue-400 font-mono text-sm uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Material Link</span>
                </div>
                <div className="flex-1 max-w-md">
                    <Select onValueChange={handleSelect} value={selectedId}>
                        <SelectTrigger className="h-8 bg-slate-900/50 border-slate-700 text-xs">
                            <SelectValue placeholder="Select primary source..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            {materials.map(m => (
                                <SelectItem key={m.id} value={m.id} className="text-xs">
                                    <span className="flex items-center gap-2">
                                        {m.type === 'youtube' ? <Youtube className="w-3 h-3 text-red-500" /> : <FileText className="w-3 h-3 text-blue-400" />}
                                        {m.title}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content Viewer */}
            <div className="flex-1 bg-black relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : !selectedMaterial ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-4 p-8 text-center">
                        <FileText className="w-16 h-16 opacity-20" />
                        <p>Select a material to analyze.</p>
                        <p className="text-sm opacity-50 max-w-sm">
                            Supported formats: PDF (native viewer) and YouTube (embed).
                            Ensure external links allow embedding.
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        {selectedMaterial.type === 'youtube' ? (
                            <iframe
                                src={getYoutubeEmbed(selectedMaterial.url)}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : selectedMaterial.url.endsWith('.pdf') ? (
                            <iframe
                                src={selectedMaterial.url}
                                className="w-full h-full border-0"
                                title="PDF Viewer"
                            />
                        ) : (
                            // Fallback for non-embeddable links
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <p>This content cannot be embedded directly.</p>
                                <Button variant="outline" asChild>
                                    <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Open in New Tab (Careful of Distractions)
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
