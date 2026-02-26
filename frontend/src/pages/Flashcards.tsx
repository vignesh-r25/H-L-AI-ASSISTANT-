import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RotateCw, Brain, Check, Layers, Trophy, RefreshCw, Loader2, BookOpen, Clock, Trash2, ChartBar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateResponse } from "@/services/ai";

interface Flashcard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

export const Flashcards = () => {
    const [mode, setMode] = useState<"study" | "create" | "deck-selection">("deck-selection");
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Study Session State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState<"left" | "right" | null>(null);
    const [streak, setStreak] = useState(0);

    // Create Mode State
    const [newCard, setNewCard] = useState({ front: "", back: "" });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchFlashcards();
    }, []);

    const handleAiGenerate = async () => {
        const topic = prompt("Enter a topic or paste content for AI generation:");
        if (!topic) return;

        setIsGenerating(true);
        try {
            const prompt = `Generate 3 high-quality flashcards for the topic: "${topic}". 
            Return ONLY a valid JSON array of objects with "front" and "back" properties.
            Example: [{"front": "What is React?", "back": "A JS library for building UIs"}]`;

            const response = await generateResponse(prompt);
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                const generated = JSON.parse(jsonMatch[0]);
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const newCards = generated.map((c: any) => ({
                    user_id: user.id,
                    front: c.front,
                    back: c.back,
                    mastered: false
                }));

                const { data, error } = await supabase
                    .from('flashcards')
                    .insert(newCards)
                    .select();

                if (error) throw error;
                setCards([...(data || []), ...cards]);
                toast.success(`Generated ${generated.length} cards!`);
                setMode("study");
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
            toast.error("Failed to generate cards");
        } finally {
            setIsGenerating(false);
        }
    };

    const fetchFlashcards = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCards(data || []);
        } catch (error) {
            console.error("Error fetching cards:", error);
            toast.error("Failed to load flashcards");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwipe = async (dir: "left" | "right") => {
        setDirection(dir);
        const currentCard = cards[currentIndex];

        if (dir === "right") {
            setStreak(s => s + 1);
            toast.success("Mastered! +10 XP");

            // Update mastered status in DB
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('flashcards')
                        .update({ mastered: true })
                        .eq('id', currentCard.id);
                    
                    console.log("[Flashcards] Awarding XP: 10 to user:", user.id);
                    const { error: rpcError } = await supabase.rpc('award_xp', {
                        target_id: user.id,
                        amount: 10
                    });

                    if (rpcError) {
                        console.error("[Flashcards] RPC Error:", rpcError);
                        toast.error(`XP SYNC FAILED: ${rpcError.message}`);
                    }
                }
            } catch (err: any) {
                console.error("[Flashcards] Penalty failed:", err);
                toast.error(`CRITICAL SYNC ERROR: ${err.message || "Unknown"}`);
            }
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            setIsFlipped(false);
            setDirection(null);
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 300);
    };

    const handleCreate = async () => {
        if (!newCard.front || !newCard.back) {
            toast.error("Please fill in both sides");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from('flashcards')
                .insert({
                    user_id: user.id,
                    front: newCard.front,
                    back: newCard.back,
                    mastered: false
                })
                .select()
                .single();

            if (error) throw error;

            setCards([data, ...cards]);
            setNewCard({ front: "", back: "" });
            toast.success("Flashcard added!");
            setMode("study");
        } catch (error) {
            toast.error("Failed to create card");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('flashcards').delete().eq('id', id);
            if (error) throw error;
            setCards(cards.filter(c => c.id !== id));
            toast.success("Card deleted");
        } catch (error) {
            toast.error("Failed to delete card");
        }
    };

    const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
            {/* Header / Premium Branding */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-bold mb-1 opacity-70">
                        <Brain className="w-4 h-4" />
                        <span className="uppercase tracking-[0.2em] text-[10px]">Study Mode</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight mb-4">
                        Flashcards
                    </h1>
                    <div className="flex items-center gap-6 text-muted-foreground bg-card/40 px-6 py-3 rounded-2xl border border-border/40 backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary opacity-60" />
                            <span className="font-semibold text-foreground">{cards.length}</span>
                            <span className="text-xs">Cards</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-foreground">{streak}</span>
                            <span className="text-xs">Mastery Streak</span>
                        </div>
                    </div>
                </div>

                <div className="flex p-1.5 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                    <Button
                        variant={mode === "deck-selection" ? "default" : "ghost"}
                        onClick={() => setMode("deck-selection")}
                        className="rounded-xl h-11 px-6"
                    >
                        Library
                    </Button>
                    <Button
                        variant={mode === "study" ? "default" : "ghost"}
                        onClick={() => {
                            if (cards.length === 0) {
                                toast.error("No cards available to study");
                                return;
                            }
                            setMode("study");
                        }}
                        className="rounded-xl h-11 px-6"
                    >
                        Study
                    </Button>
                    <Button
                        variant={mode === "create" ? "default" : "ghost"}
                        onClick={() => setMode("create")}
                        className="rounded-xl h-11 px-6"
                    >
                        New Card
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleAiGenerate}
                        disabled={isGenerating}
                        className="rounded-xl h-11 px-6 text-primary hover:bg-primary/10"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        AI Gen
                    </Button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div key="loading" className="flex justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary/50" />
                    </motion.div>
                ) : mode === "deck-selection" ? (
                    <motion.div
                        key="library"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {cards.length === 0 ? (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Plus className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">No cards in your vault</h3>
                                <p className="text-muted-foreground">Start by creating your first study resource.</p>
                                <Button onClick={() => setMode("create")} className="h-12 rounded-xl px-10">Create Now</Button>
                            </div>
                        ) : (
                            cards.map((card) => (
                                <Card key={card.id} className="group relative bg-card/20 hover:bg-card/40 border-border/40 transition-all duration-300 rounded-[2rem] overflow-hidden p-6 cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${card.mastered ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                                            {card.mastered ? "Mastered" : "Learning"}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{card.front}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 italic">
                                        {card.back}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 border-t border-white/5 pt-4 uppercase tracking-tighter">
                                        <Clock className="w-3 h-3" />
                                        Ready to review
                                    </div>
                                </Card>
                            ))
                        )}
                    </motion.div>
                ) : mode === "study" ? (
                    <motion.div
                        key="study"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Session Progress Header */}
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <ChartBar className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col text-sm">
                                    <span className="font-bold">{currentIndex + 1} / {cards.length}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">Session Progress</span>
                                </div>
                            </div>
                            <Progress value={progress} className="w-48 h-2 bg-secondary/50" />
                        </div>

                        {/* Professional Card Stack Area */}
                        <div className="relative h-[500px] w-full max-w-2xl mx-auto flex items-center justify-center perspective-1000">
                            {/* Background Stack Cards */}
                            <div className="absolute w-[92%] h-[92%] bg-secondary/20 border border-white/5 rounded-[3rem] translate-y-10 scale-95 blur-sm" />
                            <div className="absolute w-[96%] h-[96%] bg-secondary/40 border border-white/10 rounded-[3rem] translate-y-5 scale-[0.98] blur-[1px]" />

                            <motion.div
                                className="w-full h-full relative cursor-pointer transform-style-3d transition-all duration-700"
                                animate={{
                                    rotateY: isFlipped ? 180 : 0,
                                    x: direction === "left" ? -800 : direction === "right" ? 800 : 0,
                                    opacity: direction ? 0 : 1,
                                    rotateZ: direction === "left" ? -20 : direction === "right" ? 20 : 0
                                }}
                                onClick={() => !direction && setIsFlipped(!isFlipped)}
                            >
                                {/* Front Side - Deep Dark Pro Aesthetic */}
                                <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#121212] to-black border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-[3rem] group overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-8 left-8 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Question Phase</span>
                                    </div>
                                    <div className="absolute top-8 right-8 text-[10px] font-mono p-2 bg-muted/20 rounded-lg border border-border/40">
                                        {String(currentIndex + 1).padStart(2, '0')}
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-bold text-center leading-[1.1] tracking-tight">
                                        {cards[currentIndex]?.front}
                                    </h2>

                                    <div className="absolute bottom-12 text-[10px] font-bold text-primary/40 flex items-center gap-2 uppercase tracking-[0.2em]">
                                        <RotateCw className="w-3 h-3 animate-spin-slow" /> Tap to reveal essence
                                    </div>
                                </Card>

                                {/* Back Side - Professional Accent Aesthetic */}
                                <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-primary/20 via-primary/5 to-purple-600/20 backdrop-blur-3xl border-primary/30 shadow-[0_32px_64px_-16px_rgba(var(--primary),0.2)] rounded-[3rem] rotate-y-180">
                                    <div className="absolute top-8 left-8 flex items-center gap-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Insight Phase</span>
                                    </div>

                                    <p className="text-2xl md:text-3xl text-center leading-relaxed text-foreground/90 font-medium tracking-tight">
                                        {cards[currentIndex]?.back}
                                    </p>

                                    <div className="absolute bottom-12 text-[10px] font-bold text-muted-foreground/50 flex items-center gap-2 uppercase tracking-[0.2em]">
                                        <RefreshCw className="w-3 h-3" /> Tap to revert
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Professional Controls */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-10">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-64 h-16 rounded-[1.5rem] border-2 border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-lg"
                                onClick={() => handleSwipe("left")}
                            >
                                <RefreshCw className="w-5 h-5 mr-3" />
                                Hard / Review
                            </Button>

                            <Button
                                size="lg"
                                className="w-full sm:w-64 h-16 rounded-[1.5rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/40 border-0 font-black text-lg hover:scale-105 active:scale-95 transition-all"
                                onClick={() => handleSwipe("right")}
                            >
                                <Check className="w-5 h-5 mr-3" />
                                Mastered It
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-2xl mx-auto"
                    >
                        <Card className="border-white/10 shadow-2xl bg-secondary/20 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]">
                            <div className="h-2 w-full bg-primary" />
                            <CardContent className="space-y-8 pt-10 p-10">
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">New Knowledge Node</h2>
                                    <p className="text-muted-foreground">Synthesize your learning into a card.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Front (Question)</label>
                                    <Input
                                        placeholder="Enter pivotal question..."
                                        value={newCard.front}
                                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                        className="bg-background/80 border-border/40 h-16 text-lg rounded-2xl focus-visible:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Back (Insight)</label>
                                    <Textarea
                                        placeholder="Enter synthesized answer..."
                                        className="min-h-[180px] bg-background/80 border-border/40 rounded-2xl p-6 text-lg leading-relaxed focus-visible:ring-primary/20 resize-none"
                                        value={newCard.back}
                                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full h-16 text-xl font-bold shadow-lg shadow-primary/10 rounded-2xl active:scale-95 transition-all" onClick={handleCreate}>
                                    <Plus className="w-6 h-6 mr-3" /> Create Card
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

