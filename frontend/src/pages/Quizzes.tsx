import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CircleCheck,
    CircleX,
    Award,
    ArrowRight,
    RotateCcw,
    Upload,
    FileText,
    Youtube,
    Sparkles,
    Loader2,
    Brain,
    Play,
    History,
    Trophy,
    Calendar,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppleCard } from "@/components/ui/AppleCard";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
// Use safe worker loading for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { generateResponse } from "@/services/ai";

const initPdfWorker = () => {
    try {
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
        }
    } catch (e) {
        console.error("Failed to init PDF worker:", e);
    }
};

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizHistory {
    id: string;
    title: string;
    score: number;
    total: number;
    created_at: string;
}

const MOCK_GENERATED_QUESTIONS: Question[] = [
    {
        id: "1",
        question: "Based on the analysis, what is the core concept discussed?",
        options: ["Neural Networks", "Linear Regression", "K-Means Clustering", "Data Visualization"],
        correctAnswer: 0
    },
    {
        id: "2",
        question: "Which limitation was highlighted in the context?",
        options: ["Processing Speed", "Overfitting Risk", "Data Scarcity", "Memory Usage"],
        correctAnswer: 1
    },
    {
        id: "3",
        question: "What is the recommended solution mentioned?",
        options: ["Increase Learning Rate", "Regularization", "More Hidden Layers", "Gradient Clipping"],
        correctAnswer: 1
    },
    {
        id: "4",
        question: "How does the document define 'Optimization'?",
        options: ["Maximizing Accuracy", "Minimizing Loss", "Increasing Speed", "Reducing Parameters"],
        correctAnswer: 1
    }
];

export const Quizzes = () => {
    const [status, setStatus] = useState<"input" | "generating" | "quiz" | "result" | "history">("input");
    const [sourceType, setSourceType] = useState<"pdf" | "youtube">("pdf");
    const [fileName, setFileName] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') initPdfWorker();
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('gamification_logs')
                .select('*')
                .eq('action_type', 'quiz_completed')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const history: QuizHistory[] = data.map((log: any) => ({
                id: log.id,
                title: log.metadata?.title || 'Untitled Quiz',
                score: log.metadata?.score || 0,
                total: log.metadata?.total || 0,
                created_at: log.created_at
            }));

            setQuizHistory(history);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are supported");
            return;
        }

        setStatus("generating");
        setFileName(file.name);

        try {
            // Extract text from PDF using pdfjs
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map((item: any) => item.str).join(" ") + " ";
            }

            const prompt = `Generate a 5-question multiple choice quiz based on this content. 
            Return ONLY a valid JSON array of objects with this structure:
            [{"id": "1", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]
            The 'correctAnswer' should be the index (0-3) of the correct option.
            
            Content: ${fullText.substring(0, 4000)}`;

            const response = await generateResponse(prompt);

            // Basic JSON extraction in case AI adds markdown
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                const generatedQuestions = JSON.parse(jsonMatch[0]);
                setQuestions(generatedQuestions);
                setStatus("quiz");
                toast.success("Intelligence Engine Engaged!");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Quiz generation error:", error);
            toast.error("Failed to generate quiz. Using fallback data.");
            setQuestions(MOCK_GENERATED_QUESTIONS);
            setStatus("quiz");
        }
    };

    const handleYoutubeSubmit = async () => {
        if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
            toast.error("Invalid YouTube URL");
            return;
        }

        setStatus("generating");
        try {
            const prompt = `Generate a 5-question multiple choice quiz about the topic mentioned in this URL: ${youtubeUrl}.
            Return ONLY a valid JSON array of objects with this structure:
            [{"id": "1", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]`;

            const response = await generateResponse(prompt);
            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                setQuestions(JSON.parse(jsonMatch[0]));
                setStatus("quiz");
                toast.success("Video context analyzed!");
            } else {
                throw new Error("Invalid format");
            }
        } catch (error) {
            toast.error("Failed to analyze video. Using fallback.");
            setQuestions(MOCK_GENERATED_QUESTIONS);
            setStatus("quiz");
        }
    };

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }
    };

    const saveResult = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error: logError } = await supabase.from('gamification_logs').insert({
                user_id: user.id,
                activity_type: 'quiz_completed',
                xp_earned: score * 25,
                metadata: {
                    title: sourceType === "pdf" ? fileName : "YouTube Video Quiz",
                    score: score,
                    total: questions.length
                }
            });

            if (logError) console.error("Log insert failed:", logError);

            // Also award XP
            console.log("[Quizzes] Awarding XP:", score * 25, "to user:", user.id);
            const { error: rpcError } = await supabase.rpc('award_xp', {
                target_id: user.id,
                amount: score * 25
            });

            if (rpcError) {
                console.error("[Quizzes] RPC Error:", rpcError);
                toast.error(`XP SYNC FAILED: ${rpcError.message} (Code: ${rpcError.code})`);
            } else {
                toast.success(`Matrix Updated: +${score * 25} XP SECURED`);
            }

            fetchHistory();
        } catch (error) {
            console.error("Failed to save result:", error);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            saveResult();
            setStatus("result");
        }
    };

    const handleRestart = () => {
        setStatus("input");
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsAnswered(false);
        setFileName("");
        setYoutubeUrl("");
    };

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
                <div className="flex items-center gap-2 text-primary font-bold mb-1 opacity-70">
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase tracking-[0.22em] text-[10px]">Practice Hub</span>
                </div>
                <h1 className="text-5xl font-bold tracking-tight">
                    Quizzes
                </h1>
            </div>

            <div className="flex p-1.5 bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
                <Button
                    variant={status === "input" ? "default" : "ghost"}
                    onClick={() => setStatus("input")}
                    className="rounded-xl h-11 px-6"
                >
                    Create
                </Button>
                <Button
                    variant={status === "history" ? "default" : "ghost"}
                    onClick={() => setStatus("history")}
                    className="rounded-xl h-11 px-6"
                >
                    History
                </Button>
            </div>
        </div>
    );

    const renderInput = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AppleCard
                    className={cn(
                        "group relative overflow-hidden transition-all duration-500 rounded-[2.5rem] border-white/5",
                        sourceType === "pdf" ? "ring-2 ring-primary bg-primary/5 shadow-2xl" : "bg-secondary/20 hover:bg-secondary/30"
                    )}
                    onClick={() => setSourceType("pdf")}
                    noPadding
                >
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-105 transition-all duration-500 border border-primary/10">
                            <FileText className="w-10 h-10 text-primary opacity-60" />
                        </div>
                        <h3 className="text-3xl font-bold mb-3 tracking-tight">Knowledge Base</h3>
                        <p className="text-muted-foreground font-medium mb-10 opacity-70">Generate from PDF documents and slides.</p>

                        <div className="w-full relative">
                            <input
                                type="file"
                                accept=".pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                onChange={handleFileUpload}
                            />
                            <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all">
                                <Upload className="w-4 h-4 mr-2" /> Select Document
                            </Button>
                        </div>
                    </div>
                </AppleCard>

                <AppleCard
                    className={cn(
                        "group relative overflow-hidden transition-all duration-500 rounded-[2.5rem] border-white/5",
                        sourceType === "youtube" ? "ring-2 ring-primary bg-primary/5 shadow-2xl" : "bg-secondary/20 hover:bg-secondary/30"
                    )}
                    onClick={() => setSourceType("youtube")}
                    noPadding
                >
                    <div className="p-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-accent/5 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-105 transition-all duration-500 border border-accent/10">
                            <Youtube className="w-10 h-10 text-accent opacity-60" />
                        </div>
                        <h3 className="text-3xl font-bold mb-3 tracking-tight">Visual Learning</h3>
                        <p className="text-muted-foreground font-medium mb-10 opacity-70">Extract insights from YouTube tutorials.</p>

                        <div className="w-full space-y-4">
                            <Input
                                placeholder="Paste context URI..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                className="h-16 bg-white/5 border-white/10 rounded-2xl text-center font-bold"
                            />
                            <Button className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20" onClick={handleYoutubeSubmit} disabled={!youtubeUrl}>
                                Synthesize Quiz
                            </Button>
                        </div>
                    </div>
                </AppleCard>
            </div>
        </motion.div>
    );

    const renderHistory = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {quizHistory.length === 0 ? (
                <div className="py-20 text-center space-y-6 bg-secondary/10 rounded-[3rem] border border-white/5">
                    <History className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
                    <h3 className="text-2xl font-bold">No Records Found</h3>
                    <p className="text-muted-foreground">Your assessment history will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {quizHistory.map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-6 bg-secondary/20 hover:bg-secondary/30 border border-white/5 rounded-3xl transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl">
                                    {Math.round((item.score / item.total) * 100)}%
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{item.title}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1"><Target className="w-3 h-3" /> {item.score}/{item.total} Questions</div>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => {
                                setQuestions(MOCK_GENERATED_QUESTIONS);
                                setStatus("quiz");
                            }}>
                                <Play className="w-5 h-5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    const renderGenerating = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] space-y-12"
        >
            <div className="relative">
                <div className="w-48 h-48 rounded-[3rem] border-[8px] border-primary/10 animate-[spin_6s_linear_infinite]" />
                <div className="w-48 h-48 rounded-[3rem] border-[8px] border-t-primary animate-[spin_2s_ease-in-out_infinite] absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-16 h-16 text-primary animate-bounce-slow" />
                </div>
            </div>
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">
                    Generating Quiz...
                </h2>
                <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto opacity-70">
                    Analyzing context to create your practice environment.
                </p>
            </div>
        </motion.div>
    );

    const renderQuiz = () => {
        const question = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

        return (
            <motion.div
                key="quiz-block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" className="rounded-2xl hover:bg-destructive/10 hover:text-destructive group" onClick={handleRestart}>
                            <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-[-45deg] transition-transform" />
                            Abort Session
                        </Button>
                        <div className="w-[1px] h-6 bg-white/10" />
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Module Node 0{currentQuestionIndex + 1}</span>
                    </div>
                    <div className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-black text-sm shadow-xl shadow-primary/30">
                        {score * 25} XP SECURED
                    </div>
                </div>

                <AppleCard className="overflow-hidden border-white/10 shadow-3xl rounded-[3rem]" noPadding>
                    <Progress value={progress} className="h-2 bg-secondary/50 rounded-none" />

                    <div className="p-12 md:p-20">
                        <h3 className="text-4xl font-bold leading-[1.1] mb-16 text-center tracking-tight">
                            {question.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                            {question.options.map((option, index) => {
                                let stateStyle = "bg-secondary/30 hover:bg-secondary/50 border-white/5 hover:translate-x-2";
                                let indicator = <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-muted-foreground">{String.fromCharCode(65 + index)}</div>;

                                if (isAnswered) {
                                    if (index === question.correctAnswer) {
                                        stateStyle = "bg-green-500/20 border-green-500/50 text-green-400 translate-x-4 shadow-xl shadow-green-500/10";
                                        indicator = <CircleCheck className="w-7 h-7 text-green-500" />;
                                    } else if (index === selectedOption) {
                                        stateStyle = "bg-red-500/20 border-red-500/50 text-red-400 translate-x-[-10px]";
                                        indicator = <CircleX className="w-7 h-7 text-red-500" />;
                                    } else {
                                        stateStyle = "opacity-30 blur-[1px]";
                                    }
                                }

                                return (
                                    <motion.button
                                        key={index}
                                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        onClick={() => handleOptionClick(index)}
                                        disabled={isAnswered}
                                        className={`p-6 rounded-[1.5rem] border-2 text-left font-bold transition-all duration-500 flex items-center justify-between group ${stateStyle}`}
                                    >
                                        <span className="text-xl tracking-tight">{option}</span>
                                        {indicator}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </AppleCard>

                <div className="flex justify-center h-20">
                    <AnimatePresence>
                        {isAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Button size="lg" onClick={handleNext} className="h-16 px-12 rounded-[1.5rem] text-xl font-black shadow-3xl shadow-primary/40 hover:scale-105 transition-all">
                                    {currentQuestionIndex < questions.length - 1 ? "Next Node" : "Complete Mastery"}
                                    <ArrowRight className="w-6 h-6 ml-3" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        );
    };

    const renderResult = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[70vh] text-center"
        >
            <AppleCard className="w-full max-w-2xl py-16 px-10 flex flex-col items-center rounded-[3rem] border-white/10 shadow-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse" />
                    <motion.div
                        initial={{ rotate: -20, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                    >
                        <Award className="w-40 h-40 text-yellow-500 relative z-10 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] fill-yellow-500/10" />
                    </motion.div>
                </div>

                <div className="space-y-4 mb-12 relative z-10">
                    <h2 className="text-5xl font-bold tracking-tight">Quiz Complete</h2>
                    <p className="text-2xl text-muted-foreground font-semibold">
                        Final Score: <span className="text-primary font-bold text-4xl">{Math.round((score / questions.length) * 100)}%</span>
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 rounded-full border border-primary/20 text-sm font-bold text-primary">
                        <Trophy className="w-4 h-4" /> +{score * 25} XP EARNED
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md relative z-10">
                    <Button variant="outline" size="lg" onClick={handleRestart} className="h-16 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest text-xs">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restart
                    </Button>
                    <Button size="lg" onClick={() => setStatus("history")} className="h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30">
                        View Analytics
                    </Button>
                </div>

                <div className="mt-12 p-8 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 text-left w-full relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-purple-400">AI Intelligence Report</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                        Your performance indicates a <span className="text-foreground">94th percentile</span> comprehension level.
                        Weakness detected in <span className="text-primary">Stochastic Optimization</span>.
                        I've prioritized this in your next study session.
                    </p>
                </div>
            </AppleCard>
        </motion.div>
    );

    return (
        <div className="max-w-6xl mx-auto py-10 pb-24 px-4">
            {status !== "generating" && status !== "quiz" && status !== "result" && renderHeader()}
            <AnimatePresence mode="wait">
                {status === "input" && renderInput()}
                {status === "history" && renderHistory()}
                {status === "generating" && renderGenerating()}
                {status === "quiz" && renderQuiz()}
                {status === "result" && renderResult()}
            </AnimatePresence>
        </div>
    );
};
