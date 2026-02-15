import { useState } from "react";
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
    Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
// Use safe worker loading for Vite
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

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

// Mock Database of "Generated" Questions for demo purposes
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
    // States: 'input' -> 'generating' -> 'quiz' -> 'result'
    const [status, setStatus] = useState<"input" | "generating" | "quiz" | "result">("input");

    // Input State Data
    const [sourceType, setSourceType] = useState<"pdf" | "youtube">("pdf");
    const [fileName, setFileName] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");

    // Quiz State Data
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);

    // Initialize worker safely
    if (typeof window !== 'undefined') initPdfWorker();

    // ---- Handlers for Input Phase ----

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
            // Simulate reading delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Simulate generation delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real app, we would send text to LLM here.
            // For demo, we load high-quality mocks.
            setQuestions(MOCK_GENERATED_QUESTIONS);
            setStatus("quiz");
            toast.success("Quiz generated successfully!");
        } catch (error) {
            toast.error("Failed to generate quiz");
            setStatus("input");
        }
    };

    const handleYoutubeSubmit = async () => {
        if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
            toast.error("Invalid YouTube URL");
            return;
        }

        setStatus("generating");

        // Simulate processing
        setTimeout(() => {
            setQuestions(MOCK_GENERATED_QUESTIONS);
            setStatus("quiz");
            toast.success("Quiz generated from Video!");
        }, 3000);
    };

    // ---- Handlers for Quiz Phase ----

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
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

    // ---- Renderers ----

    const renderInput = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-2xl mx-auto"
        >
            <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    AI Quiz Generator
                </h1>
                <p className="text-muted-foreground text-lg">
                    Turn your study materials into interactive quizzes instantly.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant={sourceType === "pdf" ? "default" : "outline"}
                    className="h-24 text-lg flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => setSourceType("pdf")}
                >
                    <FileText className="w-8 h-8 mb-1" />
                    Upload PDF
                    {sourceType === "pdf" && (
                        <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-primary rounded-lg" />
                    )}
                </Button>
                <Button
                    variant={sourceType === "youtube" ? "default" : "outline"}
                    className="h-24 text-lg flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => setSourceType("youtube")}
                >
                    <Youtube className="w-8 h-8 mb-1" />
                    YouTube
                    {sourceType === "youtube" && (
                        <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-primary rounded-lg" />
                    )}
                </Button>
            </div>

            <Card className="glass-card border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    {sourceType === "pdf" ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 text-center hover:bg-muted/50 transition-colors relative">
                            <input
                                type="file"
                                accept=".pdf"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                            />
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-4 bg-background rounded-full shadow-sm">
                                    <Upload className="w-6 h-6 text-primary" />
                                </div>
                                <p className="font-medium">Click to browse or drag PDF here</p>
                                <p className="text-sm text-muted-foreground">Up to 10MB</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Video URL</label>
                                <Input
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <Button size="lg" className="w-full" onClick={handleYoutubeSubmit} disabled={!youtubeUrl}>
                                Generate Quiz <Sparkles className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderGenerating = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
        >
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Generating Question Set...</h2>
                <p className="text-muted-foreground">Analyzing {sourceType === "pdf" ? fileName : "Video Content"} to create relevant questions.</p>
            </div>

            <div className="flex gap-1">
                <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-primary rounded-full" />
                <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-primary rounded-full" />
                <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-primary rounded-full" />
            </div>
        </motion.div>
    );

    const renderQuiz = () => {
        const question = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / questions.length) * 100;

        return (
            <motion.div
                key="quiz-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <h2 className="text-sm text-primary font-medium mt-1">Found in {sourceType === "pdf" ? fileName : "YouTube Video"}</h2>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <span className="font-bold text-primary">{score}</span>
                        <span className="text-muted-foreground text-sm"> pts</span>
                    </div>
                </div>

                {/* Question Card */}
                <Card className="glass-card border-none shadow-lg overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-secondary">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <CardContent className="p-8 pt-12 text-center">
                        <h3 className="text-2xl font-semibold leading-relaxed mb-8">
                            {question.question}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map((option, index) => {
                                let stateStyle = "border-muted hover:border-primary/50 hover:bg-muted/50";
                                let icon = null;

                                if (isAnswered) {
                                    if (index === question.correctAnswer) {
                                        stateStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                                        icon = <CircleCheck className="w-5 h-5" />;
                                    } else if (index === selectedOption) {
                                        stateStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                                        icon = <CircleX className="w-5 h-5" />;
                                    } else {
                                        stateStyle = "opacity-50 border-muted";
                                    }
                                } else if (selectedOption === index) {
                                    stateStyle = "border-primary bg-primary/5";
                                }

                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={!isAnswered ? { scale: 1.02 } : {}}
                                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                        onClick={() => handleOptionClick(index)}
                                        disabled={isAnswered}
                                        className={`p-6 rounded-xl border-2 text-left font-medium transition-all duration-200 flex items-center justify-between ${stateStyle}`}
                                    >
                                        <span>{option}</span>
                                        {icon}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Footer / Next Button */}
                <div className="flex justify-end h-12">
                    <AnimatePresence>
                        {isAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Button size="lg" onClick={handleNext} className="gap-2 rounded-full px-8">
                                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "View Results"}
                                    <ArrowRight className="w-4 h-4" />
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
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
        >
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Award className="w-32 h-32 text-primary relative z-10 drop-shadow-2xl" />
            </div>

            <div className="space-y-2">
                <h2 className="text-4xl font-bold">Quiz Completed!</h2>
                <p className="text-xl text-muted-foreground">
                    You scored <span className="text-primary font-bold text-2xl">{score}</span> out of {questions.length}
                </p>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Create New Quiz
                </Button>
                <Button size="lg" onClick={() => toast.info("Sharing not implemented yet!")}>
                    Share Result
                </Button>
            </div>

            {/* Simulated Summary Mock */}
            <Card className="max-w-md w-full glass-card p-6 mt-8 text-left">
                <h3 className="font-semibold mb-4">AI Feedback</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Great job! You showed strong understanding of <span className="text-foreground font-medium">Neural Networks</span>,
                    but might want to review <span className="text-foreground font-medium">Optimization Techniques</span>.
                    I've updated your learning path effectively.
                </p>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen container py-8 pb-20">
            <AnimatePresence mode="wait">
                {status === "input" && renderInput()}
                {status === "generating" && renderGenerating()}
                {status === "quiz" && renderQuiz()}
                {status === "result" && renderResult()}
            </AnimatePresence>
        </div>
    );
};
