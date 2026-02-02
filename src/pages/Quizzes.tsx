import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleCheck, CircleX, Award, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

const questions: Question[] = [
    {
        id: "1",
        question: "What is the primary goal of Supervised Learning?",
        options: [
            "Clustering data into groups",
            "Predicting outputs based on labeled inputs",
            "Exploring data structure",
            "Teaching via rewards and penalties"
        ],
        correctAnswer: 1
    },
    {
        id: "2",
        question: "Which activation function is commonly used in hidden layers of a Deep Neural Network?",
        options: ["Sigmoid", "Softmax", "ReLU", "Linear"],
        correctAnswer: 2
    },
    {
        id: "3",
        question: "What does CNN stand for in Deep Learning?",
        options: [
            "Central Neural Network",
            "Convolutional Neural Network",
            "Computer Neural Network",
            "Continuous Neural Network"
        ],
        correctAnswer: 1
    }
];

export const Quizzes = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowResult(false);
        setIsAnswered(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Weekly Quiz</h1>
                <p className="text-muted-foreground">Test your knowledge on Fundamentals</p>
            </div>

            <AnimatePresence mode="wait">
                {showResult ? (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <Card className="glass-card p-12">
                            <div className="mb-6 flex justify-center">
                                <Award className="w-20 h-20 text-yellow-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                You scored <span className="text-primary font-bold">{score}</span> out of <span className="font-bold">{questions.length}</span>
                            </p>
                            <Button size="lg" onClick={handleRestart} className="gap-2">
                                <RotateCcw className="w-5 h-5" /> Try Again
                            </Button>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                    <span className="text-sm font-medium text-primary">Score: {score}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <CardTitle className="mt-8 text-xl leading-relaxed">
                                    {currentQuestion.question}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-3">
                                    {currentQuestion.options.map((option, index) => {
                                        let variant = "outline";
                                        if (isAnswered) {
                                            if (index === currentQuestion.correctAnswer) variant = "success"; // Will use custom style
                                            else if (index === selectedOption) variant = "destructive";
                                        } else if (index === selectedOption) {
                                            variant = "default";
                                        }

                                        const getBorderColor = () => {
                                            if (!isAnswered) return index === selectedOption ? "border-primary" : "border-input";
                                            if (index === currentQuestion.correctAnswer) return "border-green-500 bg-green-500/10";
                                            if (index === selectedOption) return "border-red-500 bg-red-500/10";
                                            return "border-input opacity-50";
                                        };

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleOptionClick(index)}
                                                disabled={isAnswered}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${getBorderColor()} hover:bg-accent/50`}
                                            >
                                                <span>{option}</span>
                                                {isAnswered && index === currentQuestion.correctAnswer && <CircleCheck className="w-5 h-5 text-green-500" />}
                                                {isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && <CircleX className="w-5 h-5 text-red-500" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {isAnswered && (
                                    <div className="flex justify-end mt-6 pt-4">
                                        <Button onClick={handleNext} className="gap-2">
                                            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"} <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
