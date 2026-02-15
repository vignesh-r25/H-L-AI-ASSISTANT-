import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Plus, RotateCw, Brain, Check, X, Layers, Smartphone, Trophy, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Flashcard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

export const Flashcards = () => {
    const [mode, setMode] = useState<"study" | "create">("study");
    const [cards, setCards] = useState<Flashcard[]>([
        { id: "1", front: "What is Supervised Learning?", back: "Training a model on labeled data where the desired output is known.", mastered: false },
        { id: "2", front: "What is a Neuron?", back: "A mathematical function that models a biological neuron, taking inputs, applying weights, and passing through an activation function.", mastered: false },
        { id: "3", front: "What is Overfitting?", back: "When a model learns training data too well, capturing noise and details that don't generalize to new data.", mastered: false },
        { id: "4", front: "Explain Gradient Descent", back: "An optimization algorithm used to minimize the loss function by iteratively moving in the direction of steepest descent.", mastered: false },
        { id: "5", front: "What is a Convolutional Neural Network (CNN)?", back: "A class of deep neural networks, most commonly applied to analyzing visual imagery.", mastered: false },
    ]);

    // Study Session State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState<"left" | "right" | null>(null);
    const [streak, setStreak] = useState(0);

    // Create Mode State
    const [newCard, setNewCard] = useState({ front: "", back: "" });

    // Swipe Animation Values
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleSwipe = (dir: "left" | "right") => {
        setDirection(dir);
        if (dir === "right") {
            setStreak(s => s + 1);
            toast.success("Mastered! +10 XP");
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            setIsFlipped(false);
            setDirection(null);
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 300);
    };

    const handleCreate = () => {
        if (!newCard.front || !newCard.back) {
            toast.error("Please fill in both sides");
            return;
        }
        const card: Flashcard = {
            id: Math.random().toString(36).substring(7),
            front: newCard.front,
            back: newCard.back,
            mastered: false,
        };
        setCards([...cards, card]);
        setNewCard({ front: "", back: "" });
        toast.success("Flashcard added!");
        setMode("study");
    };

    // Calculate Progress
    const progress = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
                        Flashcards
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Layers className="w-4 h-4" />
                        <span>{cards.length} cards in deck</span>
                        <div className="h-4 w-[1px] bg-border" />
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>Streak: {streak}</span>
                    </div>
                </div>

                <div className="flex p-1 bg-muted/50 rounded-xl">
                    <button
                        onClick={() => setMode("study")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "study" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Study Mode
                    </button>
                    <button
                        onClick={() => setMode("create")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === "create" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Create New
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === "study" ? (
                    <motion.div
                        key="study"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Card Stack Area */}
                        <div className="relative h-[450px] w-full max-w-xl mx-auto flex items-center justify-center perspective-1000">
                            {/* Background Stack Cards (Visual Only) */}
                            <div className="absolute w-[90%] h-[90%] bg-card/10 border border-white/5 rounded-3xl translate-y-8 translate-z-[-20px] shadow-lg" />
                            <div className="absolute w-[95%] h-[95%] bg-card/20 border border-white/10 rounded-3xl translate-y-4 translate-z-[-10px] shadow-lg" />

                            {/* Active Card */}
                            <motion.div
                                className="w-full h-full relative cursor-pointer transform-style-3d transition-transform duration-700"
                                animate={{
                                    rotateY: isFlipped ? 180 : 0,
                                    x: direction === "left" ? -500 : direction === "right" ? 500 : 0,
                                    opacity: direction ? 0 : 1
                                }}
                                onClick={() => !direction && setIsFlipped(!isFlipped)}
                            >
                                {/* Front Side */}
                                <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl group">
                                    <div className="absolute top-6 left-6 p-2 bg-primary/10 rounded-lg">
                                        <Brain className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="absolute top-6 right-6 text-sm font-mono text-muted-foreground">
                                        FRONT
                                    </div>

                                    <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight">
                                        {cards[currentIndex]?.front}
                                    </h2>

                                    <div className="absolute bottom-6 text-sm text-muted-foreground flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <RotateCw className="w-4 h-4" /> Click to flip
                                    </div>
                                </Card>

                                {/* Back Side */}
                                <Card className="absolute inset-0 backface-hidden w-full h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-xl border-primary/20 shadow-2xl rounded-3xl rotate-y-180">
                                    <div className="absolute top-6 left-6 p-2 bg-primary/20 rounded-lg">
                                        <Check className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="absolute top-6 right-6 text-sm font-mono text-muted-foreground">
                                        BACK
                                    </div>

                                    <p className="text-xl md:text-2xl text-center leading-relaxed text-foreground/90 font-medium">
                                        {cards[currentIndex]?.back}
                                    </p>

                                    <div className="absolute bottom-6 text-sm text-muted-foreground flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                        <RotateCw className="w-4 h-4" /> Click to flip back
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center gap-6 pt-4">
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 h-14 rounded-2xl border-2 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all gap-2"
                                onClick={() => handleSwipe("left")}
                            >
                                <RefreshCw className="w-5 h-5" />
                                Study Again
                            </Button>

                            <Button
                                size="lg"
                                className="px-8 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 gap-2"
                                onClick={() => handleSwipe("right")}
                            >
                                <Check className="w-5 h-5" />
                                Got it!
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-xl mx-auto"
                    >
                        <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                            <div className="h-2 w-full bg-gradient-to-r from-primary to-purple-600" />
                            <CardContent className="space-y-6 pt-8 p-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold">Create New Card</h2>
                                    <p className="text-muted-foreground">Add to your learning deck</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Front Side (Question)</label>
                                    <Input
                                        placeholder="e.g., What is React?"
                                        value={newCard.front}
                                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                        className="bg-background/50 h-12"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Back Side (Answer)</label>
                                    <Textarea
                                        placeholder="e.g., A JavaScript library for building user interfaces..."
                                        className="min-h-[150px] bg-background/50 resize-none p-4"
                                        value={newCard.back}
                                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20 mt-4" onClick={handleCreate}>
                                    <Plus className="w-5 h-5 mr-2" /> Add Flashcard
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
