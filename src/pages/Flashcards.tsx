import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RotateCw, Brain, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Flashcard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

export const Flashcards = () => {
    const [mode, setMode] = useState<"study" | "create">("study");
    const [cards, setCards] = useState<Flashcard[]>([
        { id: "1", front: "What is Supervised Learning?", back: "Training a model on labeled data.", mastered: false },
        { id: "2", front: "What is a Neuron?", back: "A mathematical function that models a biological neuron.", mastered: false },
        { id: "3", front: "What is Overfitting?", back: "When a model learns training data too well but fails on new data.", mastered: false },
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [newCard, setNewCard] = useState({ front: "", back: "" });

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
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
    };

    const handleMastered = () => {
        const updatedCards = [...cards];
        updatedCards[currentIndex].mastered = true;
        setCards(updatedCards);
        toast.success("Marked as Mastered!");
        handleNext();
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
                    <p className="text-muted-foreground">{cards.length} cards in deck</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={mode === "study" ? "default" : "outline"}
                        onClick={() => setMode("study")}
                    >
                        <Brain className="w-4 h-4 mr-2" /> Study
                    </Button>
                    <Button
                        variant={mode === "create" ? "default" : "outline"}
                        onClick={() => setMode("create")}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create
                    </Button>
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
                        <div className="perspective-1000 h-[400px] w-full relative cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                                {/* Front */}
                                <Card className="absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                                    <h2 className="text-3xl font-bold text-center text-foreground">{cards[currentIndex]?.front}</h2>
                                    <div className="absolute bottom-4 text-xs text-muted-foreground">Click to flip</div>
                                </Card>

                                {/* Back */}
                                <Card className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-8 bg-gradient-to-br from-secondary/5 to-primary/5 border-2 border-secondary/20">
                                    <p className="text-xl text-center leading-relaxed text-foreground">{cards[currentIndex]?.back}</p>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button size="lg" variant="outline" className="w-32" onClick={handleNext}>
                                <X className="w-5 h-5 mr-2 text-red-500" />
                                Skip
                            </Button>
                            <Button size="lg" className="w-32" onClick={handleMastered}>
                                <Check className="w-5 h-5 mr-2 text-green-500" />
                                Mastered
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Card {currentIndex + 1} of {cards.length}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Front Side (Question)</label>
                                    <Input
                                        placeholder="e.g., What is React?"
                                        value={newCard.front}
                                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Back Side (Answer)</label>
                                    <Textarea
                                        placeholder="e.g., A JavaScript library for building user interfaces."
                                        className="h-32"
                                        value={newCard.back}
                                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                    />
                                </div>
                                <Button className="w-full" onClick={handleCreate}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Card
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
