import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// ... imports
import { Send, Bot, User as UserIcon, Paperclip, FileText, X, Sparkles, Lightbulb, GraduationCap, History, MessageSquare, Clock, Trash2 } from "lucide-react";

// ... inside Chat component


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";

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

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    date: Date;
    preview: string;
}

const suggestions = [
    { icon: Lightbulb, text: "Explain Quantum Physics simply" },
    { icon: GraduationCap, text: "Create a study plan for Finals" },
    { icon: FileText, text: "Summarize my uploaded notes" },
    { icon: Sparkles, text: "Write five flashcards about..." },
];



export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [fileContext, setFileContext] = useState<{ name: string, content: string } | null>(null);
    const [history, setHistory] = useState<ChatSession[]>([]); // Dynamic History State
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        initPdfWorker();
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const extractTextFromPDF = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => 'str' in item ? (item as { str: string }).str : '').join(" ");
                fullText += pageText + "\n";
            }

            setFileContext({ name: file.name, content: fullText });
            toast.success(`Loaded "${file.name}" context!`);

            // Add system welcome message for context
            if (messages.length === 0) {
                setMessages([{
                    id: "system-welcome",
                    role: "assistant",
                    content: `I've read "${file.name}". I'm ready to help you study this material!`,
                    timestamp: new Date()
                }]);
            }

        } catch (error) {
            console.error("PDF reading error:", error);
            toast.error("Failed to read PDF. Make sure it's a valid file.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are supported for now.");
                return;
            }
            extractTextFromPDF(file);
        }
    };

    const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent triggering the session select
        setHistory(prev => prev.filter(item => item.id !== id));
        toast.success("History deleted successfully");
    };

    const handleSend = (text = input) => {
        if (!text.trim()) return;

        const timestamp = new Date();
        const userMessage: Message = {
            id: Math.random().toString(36).substring(7),
            role: "user",
            content: text,
            timestamp: timestamp
        };

        setMessages(prev => [...prev, userMessage]);

        // Add to History
        const newHistoryItem: ChatSession = {
            id: Math.random().toString(36).substring(7),
            title: text, // Use message as title
            date: timestamp,
            preview: text
        };
        setHistory(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            return [newHistoryItem, ...safePrev];
        });

        setInput("");
        setIsTyping(true);

        // Simulate AI RAG response
        setTimeout(() => {
            let response = "That's an interesting question. I'd typically verify that with your study materials.";

            if (fileContext) {
                const keywords = text.toLowerCase().split(" ").filter(w => w.length > 3);
                const found = keywords.some(k => fileContext.content.toLowerCase().includes(k));

                if (found) {
                    response = `Based on "${fileContext.name}", I found relevant information regarding your query. The document discusses this topic in detail. (This is a simulation of RAG context retrieval).`;
                } else {
                    response = `I checked "${fileContext.name}", but I couldn't find a specific mention of that. Can you rephrase or ask about something else covered in the document?`;
                }
            } else {
                // Generic responses for demo
                const responses = [
                    "I can help you understand that concept better. Would you like a simplified explanation?",
                    "Great question! In the context of your studies, this usually refers to...",
                    "I can generate some practice questions about that if you'd like.",
                    "Let me break that down for you step-by-step."
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            }

            const aiMessage: Message = {
                id: Math.random().toString(36).substring(7),
                role: "assistant",
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col relative max-w-5xl mx-auto w-full">

            {/* Header / History Toggle */}
            <div className="absolute top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-background/50 backdrop-blur-md shadow-sm border hover:bg-background">
                            <History className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" /> History
                            </SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-100px)] -mx-6 px-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Conversations</h4>

                                    {(!Array.isArray(history) || history.length === 0) ? (
                                        <p className="text-sm text-muted-foreground italic">No history yet.</p>
                                    ) : (
                                        history.map((session) => (
                                            <div key={session.id} className="group p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0" />
                                                        <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">{session.title}</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
                                                        <Clock className="w-3 h-3" />
                                                        {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pl-5">
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {session.date.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Chat Area */}
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
                <div className="py-8 space-y-8 min-h-full flex flex-col justify-end">

                    {/* Empty State / Welcome Screen */}
                    {messages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center min-h-[50vh]">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-2"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                    Hello, Learner
                                </h1>
                                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                                    I'm your AI Tutor. Upload a PDF or pick a topic to get started.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl"
                            >
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s.text)}
                                        className="p-4 rounded-xl border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 text-left flex items-center gap-3 group"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <s.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{s.text}</span>
                                    </button>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <Avatar className={`w-8 h-8 mt-1 border ${message.role === "assistant" ? "bg-background shadow-sm" : "bg-primary"}`}>
                                <AvatarFallback className={message.role === "assistant" ? "bg-transparent" : "bg-primary text-primary-foreground"}>
                                    {message.role === "assistant" ? <Sparkles className="w-4 h-4 text-purple-600" /> : <UserIcon className="w-4 h-4" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`py-3 px-5 rounded-3xl text-sm leading-relaxed shadow-sm ${message.role === "user"
                                        ? "bg-gradient-to-br from-primary to-purple-600 text-white rounded-tr-sm"
                                        : "bg-card border text-card-foreground rounded-tl-sm"
                                        }`}
                                >
                                    {message.content}
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 px-2">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                            <Avatar className="w-8 h-8 mt-1 bg-background border shadow-sm">
                                <AvatarFallback><Sparkles className="w-4 h-4 text-purple-600" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-card border px-4 py-3 rounded-3xl rounded-tl-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={bottomRef} className="h-4" />
                </div>
            </ScrollArea>

            {/* Input Area (Floating) */}
            <div className="p-4 bg-gradient-to-t from-background via-background to-transparent pb-6">
                <div className="max-w-3xl mx-auto relative group">
                    {/* Animated Glow Border */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />

                    <div className="relative flex items-center bg-card/80 backdrop-blur-xl border shadow-lg rounded-full px-4 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                        {/* File Context Indicator */}
                        {fileContext && (
                            <div className="hidden sm:flex items-center gap-2 mr-2 px-2 py-1 bg-primary/10 rounded-full text-xs text-primary animate-in fade-in zoom-in">
                                <FileText className="w-3 h-3" />
                                <span className="max-w-[80px] truncate">{fileContext.name}</span>
                                <button onClick={() => setFileContext(null)} className="hover:text-destructive">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload PDF"
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>

                        <Input
                            placeholder="Ask me anything..."
                            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-6 text-base"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />

                        <Button
                            size="icon"
                            className={`rounded-full shrink-0 transition-all duration-300 ${input.trim() ? "bg-primary text-primary-foreground opacity-100 scale-100" : "bg-muted text-muted-foreground opacity-50 scale-90"}`}
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </Button>
                    </div>

                    {/* Helper text under input */}
                    <div className="text-center mt-3 text-xs text-muted-foreground/50">
                        H&L AI can make mistakes. Check important info.
                    </div>
                </div>
            </div>
        </div>
    );
};
