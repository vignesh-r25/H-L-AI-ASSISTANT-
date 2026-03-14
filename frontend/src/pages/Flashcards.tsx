import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RotateCw, Brain, Check, Layers, Trophy, RefreshCw, Loader2, BookOpen, Clock, Trash2, ChartBar, Sparkles, FileText, Youtube, Upload, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AppleCard } from "@/components/ui/AppleCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateResponse } from "@/services/ai";
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

interface Flashcard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

export const Flashcards = () => {
    const [mode, setMode] = useState<"study" | "create" | "deck-selection" | "ai-generate">("deck-selection");
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // AI Generation State
    const [aiSourceType, setAiSourceType] = useState<"topic" | "pdf" | "youtube">("topic");
    const [aiTopic, setAiTopic] = useState("");
    const [aiYoutubeUrl, setAiYoutubeUrl] = useState("");

    // Study Session State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState<"left" | "right" | null>(null);
    const [streak, setStreak] = useState(0);

    // Create Mode State
    const [newCard, setNewCard] = useState({ front: "", back: "" });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') initPdfWorker();
        fetchFlashcards();
    }, []);

    const processAiGeneration = async (promptText: string) => {
        setIsGenerating(true);
        try {
            const prompt = `${promptText} 
            Generate 3 high-quality flashcards based on the provided context.
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
                    question: c.front,
                    answer: c.back,
                    is_custom: true,
                    difficulty: 'medium'
                }));

                const { data, error } = await supabase
                    .from('flashcards')
                    .insert(newCards)
                    .select();

                if (error) throw error;
                const mappedCards = (data || []).map((c: any) => ({
                    id: c.id,
                    front: c.question,
                    back: c.answer,
                    mastered: (c.review_count || 0) > 0
                }));
                setCards([...mappedCards, ...cards]);
                toast.success(`Generated ${generated.length} cards!`);
                setMode("study");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
            toast.error("Failed to generate cards");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTopicSubmit = () => {
        if (!aiTopic) {
            toast.error("Please enter a topic");
            return;
        }
        processAiGeneration(`Create flashcards about the topic: "${aiTopic}".`);
    };

    const handleYoutubeSubmit = () => {
        if (!aiYoutubeUrl.includes("youtube.com") && !aiYoutubeUrl.includes("youtu.be")) {
            toast.error("Invalid YouTube URL");
            return;
        }
        processAiGeneration(`Create flashcards about the topic mentioned in this URL: ${aiYoutubeUrl}.`);
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are supported");
            return;
        }

        setIsGenerating(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map((item: any) => item.str).join(" ") + " ";
            }
            await processAiGeneration(`Create flashcards based on this content: ${fullText.substring(0, 4000)}`);
        } catch (error) {
            console.error("PDF Parsing Error:", error);
            toast.error("Failed to parse PDF document");
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
            const mappedCards = (data || []).map((c: any) => ({
                id: c.id,
                front: c.question,
                back: c.answer,
                mastered: (c.review_count || 0) > 0
            }));
            setCards(mappedCards);
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
                        .update({ review_count: 1, last_reviewed: new Date().toISOString() })
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
                    question: newCard.front,
                    answer: newCard.back,
                    is_custom: true,
                    difficulty: 'medium'
                })
                .select()
                .single();

            if (error) throw error;

            const mappedCard = {
                id: data.id,
                front: data.question,
                back: data.answer,
                mastered: (data.review_count || 0) > 0
            };

            setCards([mappedCard, ...cards]);
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
                        variant={mode === "ai-generate" ? "default" : "ghost"}
                        onClick={() => setMode("ai-generate")}
                        className="rounded-xl h-11 px-6 text-primary hover:bg-primary/10"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
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
                ) : mode === "create" ? (
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
                ) : mode === "ai-generate" ? (
                    <motion.div
                        key="ai-gen"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-10"
                    >
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full border-[6px] border-primary/10 animate-[spin_4s_linear_infinite]" />
                                    <div className="w-40 h-40 rounded-full border-[6px] border-t-primary animate-[spin_1.5s_ease-in-out_infinite] absolute inset-0" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Brain className="w-12 h-12 text-primary animate-bounce-slow" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-bold">Synthesizing Knowledge...</h2>
                                    <p className="text-muted-foreground">Extracting core insights into flashcards.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center space-y-2 max-w-2xl mx-auto mb-10">
                                    <h2 className="text-3xl font-bold tracking-tight">AI Generation Hub</h2>
                                    <p className="text-muted-foreground">Turn your materials directly into flashcards in seconds.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Topic Input */}
                                    <AppleCard
                                        className={cn(
                                            "group cursor-pointer transition-all duration-300 border-white/5",
                                            aiSourceType === "topic" ? "ring-2 ring-primary bg-primary/5 shadow-xl" : "bg-card/40 hover:bg-card/60"
                                        )}
                                        onClick={() => setAiSourceType("topic")}
                                        noPadding
                                    >
                                        <div className="p-8 flex flex-col items-center text-center h-full">
                                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                                                <Type className="w-8 h-8 text-blue-500 opacity-80" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Topic / Text</h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex-1">Type or paste any text directly.</p>
                                            {aiSourceType === "topic" && (
                                                <div className="w-full space-y-3 mt-auto">
                                                    <Input
                                                        placeholder="E.g. Quantum Physics..."
                                                        value={aiTopic}
                                                        onChange={(e) => setAiTopic(e.target.value)}
                                                        className="h-12 bg-background border-border text-center"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Button className="w-full h-12 font-bold" onClick={(e) => { e.stopPropagation(); handleTopicSubmit(); }} disabled={!aiTopic}>Generate</Button>
                                                </div>
                                            )}
                                        </div>
                                    </AppleCard>

                                    {/* PDF Upload */}
                                    <AppleCard
                                        className={cn(
                                            "group cursor-pointer transition-all duration-300 border-white/5",
                                            aiSourceType === "pdf" ? "ring-2 ring-primary bg-primary/5 shadow-xl" : "bg-card/40 hover:bg-card/60"
                                        )}
                                        onClick={() => setAiSourceType("pdf")}
                                        noPadding
                                    >
                                        <div className="p-8 flex flex-col items-center text-center h-full">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                                <FileText className="w-8 h-8 text-primary opacity-80" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Document</h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex-1">Extract from PDF files.</p>
                                            {aiSourceType === "pdf" && (
                                                <div className="w-full relative mt-auto">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        onChange={(e) => { e.stopPropagation(); handlePdfUpload(e); }}
                                                    />
                                                    <Button variant="outline" className="w-full h-12 bg-background font-bold border-border">
                                                        <Upload className="w-4 h-4 mr-2" /> Select PDF
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </AppleCard>

                                    {/* YouTube Extractor */}
                                    <AppleCard
                                        className={cn(
                                            "group cursor-pointer transition-all duration-300 border-white/5",
                                            aiSourceType === "youtube" ? "ring-2 ring-primary bg-primary/5 shadow-xl" : "bg-card/40 hover:bg-card/60"
                                        )}
                                        onClick={() => setAiSourceType("youtube")}
                                        noPadding
                                    >
                                        <div className="p-8 flex flex-col items-center text-center h-full">
                                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                                                <Youtube className="w-8 h-8 text-red-500 opacity-80" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Video Resource</h3>
                                            <p className="text-sm text-muted-foreground mb-6 flex-1">Generate from YouTube URL.</p>
                                            {aiSourceType === "youtube" && (
                                                <div className="w-full space-y-3 mt-auto">
                                                    <Input
                                                        placeholder="Paste URL..."
                                                        value={aiYoutubeUrl}
                                                        onChange={(e) => setAiYoutubeUrl(e.target.value)}
                                                        className="h-12 bg-background border-border text-center"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Button className="w-full h-12 font-bold" onClick={(e) => { e.stopPropagation(); handleYoutubeSubmit(); }} disabled={!aiYoutubeUrl}>Generate</Button>
                                                </div>
                                            )}
                                        </div>
                                    </AppleCard>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

