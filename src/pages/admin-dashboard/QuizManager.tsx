import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, GraduationCap, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // index
}

interface QuizTemplate {
    id: string;
    title: string;
    description: string;
    is_published: boolean;
    xp_reward: number;
    questions: Question[]; // Stored as JSONB
}

const QuizManager = () => {
    const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<Partial<QuizTemplate>>({
        title: "",
        description: "",
        questions: []
    });

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        const { data, error } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
        if (error) toast.error("Error loading quizzes");
        else setQuizzes((data as unknown as QuizTemplate[])?.map(q => ({
            ...q,
            questions: q.questions as Question[]
        })) || []);
    };

    const handleSave = async () => {
        if (!currentQuiz.title) return toast.error("Title required");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            title: currentQuiz.title,
            description: currentQuiz.description,
            questions: currentQuiz.questions as unknown as [], // Cast to JSON-compatible array
            teacher_id: user.id,
            is_published: currentQuiz.is_published || false,
            xp_reward: currentQuiz.xp_reward || 100
        };

        const { error } = await supabase
            .from('quizzes')
            .upsert(currentQuiz.id ? { id: currentQuiz.id, ...payload } : payload);

        if (error) toast.error("Failed to save quiz");
        else {
            toast.success("Quiz saved!");
            setIsEditing(false);
            setCurrentQuiz({ title: "", description: "", questions: [] });
            fetchQuizzes();
        }
    };

    const addQuestion = () => {
        const newQ: Question = {
            id: Math.random().toString(36).substr(2, 9),
            text: "New Question",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 0
        };
        setCurrentQuiz(prev => ({
            ...prev,
            questions: [...(prev.questions || []), newQ]
        }));
    };

    const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
        const newQuestions = [...(currentQuiz.questions || [])];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setCurrentQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...(currentQuiz.questions || [])];
        newQuestions[qIndex].options[oIndex] = value;
        setCurrentQuiz(prev => ({ ...prev, questions: newQuestions }));
    };

    if (isEditing) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Edit Quiz</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Form</Button>
                    </div>
                </div>

                <Card className="glass-card">
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label>Quiz Title</Label>
                            <Input
                                value={currentQuiz.title}
                                onChange={e => setCurrentQuiz(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={currentQuiz.description}
                                onChange={e => setCurrentQuiz(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>XP Reward</Label>
                            <Input
                                type="number"
                                value={currentQuiz.xp_reward || 100}
                                onChange={e => setCurrentQuiz(prev => ({ ...prev, xp_reward: Number(e.target.value) }))}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={currentQuiz.is_published}
                                onCheckedChange={checked => setCurrentQuiz(prev => ({ ...prev, is_published: checked }))}
                            />
                            <Label>Published (Visible to students)</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">Questions ({currentQuiz.questions?.length})</h3>
                        <Button variant="secondary" onClick={addQuestion}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
                    </div>

                    {currentQuiz.questions?.map((q, qIndex) => (
                        <Card key={q.id || qIndex} className="glass-card">
                            <CardHeader className="py-4">
                                <div className="flex justify-between">
                                    <span className="font-mono text-muted-foreground">Q{qIndex + 1}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive h-8"
                                        onClick={() => {
                                            const qs = [...(currentQuiz.questions || [])];
                                            qs.splice(qIndex, 1);
                                            setCurrentQuiz(prev => ({ ...prev, questions: qs }));
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    value={q.text}
                                    onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                    className="font-medium text-lg"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex gap-2 items-center">
                                            <div
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${q.correctAnswer === oIndex ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50 hover:border-primary"}`}
                                                onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                            >
                                                {q.correctAnswer === oIndex && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                            <Input
                                                value={opt}
                                                onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Quiz Manager</h1>
                    <p className="text-muted-foreground">Create and assess student knowledge</p>
                </div>
                <Button onClick={() => {
                    setCurrentQuiz({ title: "", description: "", questions: [], is_published: false });
                    setIsEditing(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" /> Create Quiz
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(quiz => (
                    <Card key={quiz.id} className="glass-card hover:border-primary/50 transition-all cursor-pointer group" onClick={() => {
                        setCurrentQuiz(quiz);
                        setIsEditing(true);
                    }}>
                        <CardHeader>
                            <CardTitle className="truncate">{quiz.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{quiz.description || "No description"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span className={quiz.is_published ? "text-green-500 font-medium" : "text-yellow-500"}>
                                    {quiz.is_published ? "Published" : "Draft"}
                                </span>
                                <span>{quiz.questions?.length || 0} Questions</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default QuizManager;
