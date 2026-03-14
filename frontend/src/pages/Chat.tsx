import { useState, useRef, useEffect } from "react";
import { generateResponse } from "@/services/ai";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Bot,
    User as UserIcon,
    Paperclip,
    FileText,
    X,
    Sparkles,
    Lightbulb,
    GraduationCap,
    History,
    MessageSquare,
    Clock,
    Trash2,
    Plus,
    Share2,
    Copy,
    Check,
    Loader2,
    MoreVertical,
    Star,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AppleCard } from "@/components/ui/AppleCard";

// Use safe worker loading for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

const generateId = () => {
    try {
        return crypto.randomUUID();
    } catch (e) {
        return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
};

const AIThinkingShimmer = () => (
    <div className="relative w-full overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 py-4">
            <motion.div
                initial={{ opacity: 0.2, x: "-100%" }}
                animate={{ opacity: [0.2, 0.5, 0.2], x: "100%" }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="h-3 w-4/5 rounded-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            />
            <motion.div
                initial={{ opacity: 0.2, x: "-100%" }}
                animate={{ opacity: [0.2, 0.5, 0.2], x: "100%" }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 0.4 }}
                className="h-3 w-full rounded-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            />
            <motion.div
                initial={{ opacity: 0.2, x: "-100%" }}
                animate={{ opacity: [0.2, 0.5, 0.2], x: "100%" }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear", delay: 0.8 }}
                className="h-3 w-3/4 rounded-full bg-gradient-to-r from-transparent via-pink-500/15 to-transparent shadow-[0_0_15px_rgba(236,72,153,0.15)]"
            />
        </div>
    </div>
);

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
    created_at: string;
}

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
}


const MarkdownContent = ({ content }: { content: string }) => {
    const renderContent = (text: string) => {
        const parts = text.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            if (part && part.startsWith('```')) {
                const code = part.replace(/```(\w+)?\n?/, '').replace(/```$/, '');
                return (
                    <div key={i} className="my-5 rounded-[1.5rem] overflow-hidden border border-border bg-black/5 dark:bg-black/40 shadow-sm">
                        <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border/50">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Source Code</span>
                            <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success("Copied");
                            }}>
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <pre className="p-6 overflow-x-auto text-sm font-mono text-foreground/90 whitespace-pre scrollbar-hide">
                            {code}
                        </pre>
                    </div>
                );
            }

            let formatted = part
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs border border-border/40">$1</code>')
                .replace(/\n/g, '<br />');

            return <span key={i} className="text-foreground/80 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: formatted }} />;
        });
    };

    return <div className="space-y-3">{renderContent(content)}</div>;
};

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [fileContext, setFileContext] = useState<{ name: string, content: string } | null>(null);
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        initPdfWorker();
        fetchHistory();
    }, []);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const loadSession = async (sessionId: string) => {
        setActiveSessionId(sessionId);
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error("Error loading messages:", error);
            toast.error("Sync failed");
        }
    };

    const startNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
        setInput("");
        setFileContext(null);
    };

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
            toast.success(`Node ready: ${file.name}`);

            if (messages.length === 0) {
                const welcomeMsg: Message = {
                    id: 'welcome',
                    role: "assistant",
                    content: `I've analyzed **${file.name}**. How would you like to proceed? I can summarize it, explain key terms, or prepare practice questions for you.`,
                    created_at: new Date().toISOString()
                };
                setMessages([welcomeMsg]);
            }
        } catch (error) {
            console.error("PDF reading error:", error);
            toast.error("Analysis failed");
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('chat_sessions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setHistory(prev => prev.filter(item => item.id !== id));
            if (activeSessionId === id) startNewChat();
            toast.success("Identity removed");
        } catch (error) {
            toast.error("Failed");
        }
    };

    const handleStop = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsTyping(false);
            toast.info("AI Stream Paused");
        }
    };

    const handleSend = async (text = input) => {
        if (!text.trim() || isTyping) return;

        const controller = new AbortController();
        setAbortController(controller);

        // Optimistic Update
        const userMessage: Message = {
            id: generateId(),
            role: "user",
            content: text,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Session expired");
                setIsTyping(false);
                return;
            }

            let currentSessionId = activeSessionId;

            // Handle session creation if needed
            if (!currentSessionId) {
                const { data, error } = await supabase
                    .from('chat_sessions')
                    .insert({
                        user_id: user.id,
                        title: text.slice(0, 40) + (text.length > 40 ? "..." : "")
                    })
                    .select()
                    .single();

                if (error) throw error;
                currentSessionId = data.id;
                setActiveSessionId(currentSessionId);
                fetchHistory();
            }

            await supabase.from('chat_messages').insert({
                session_id: currentSessionId!,
                user_id: user.id,
                role: 'user',
                content: text
            });

            await supabase.from('ai_usage_logs').insert({
                user_id: user.id,
                feature: 'chat',
                prompt: text,
            });

            const responseText = await generateResponse(text, fileContext?.content, controller.signal);

            if (responseText === "Request paused." || responseText === "Request cancelled.") {
                return;
            }

            const aiMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: responseText,
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);

            await supabase.from('chat_messages').insert({
                session_id: currentSessionId!,
                user_id: user.id,
                role: 'assistant',
                content: responseText
            });

            await supabase.rpc('award_xp', {
                target_id: user.id,
                amount: 5
            });

        } catch (error: any) {
            if (error.name === 'AbortError') return;

            console.error("AI service error:", error);
            const errorMessage: Message = {
                id: generateId(),
                role: "assistant",
                content: error?.message?.includes("API key")
                    ? "Error: Your Groq API key is missing or invalid. Please check your settings."
                    : "I've encountered a link stability issue. Please attempt to re-establish connection.",
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            toast.error("Connection synchronization failure");
        } finally {
            setIsTyping(false);
            setAbortController(null);
        }
    };

    return (
        <div className="h-[calc(100vh-60px)] flex flex-col relative max-w-[1600px] mx-auto w-full px-0 pt-0 text-foreground bg-black selection:bg-primary/30">

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: isSidebarCollapsed ? 0 : 300,
                        opacity: isSidebarCollapsed ? 0 : 1,
                        x: isSidebarCollapsed ? -20 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                    className="hidden lg:flex flex-col bg-transparent border-r border-white/5 h-full shrink-0 z-30"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary/60" />
                            <span className="font-bold text-xs tracking-widest uppercase opacity-40">Archive</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full hover:bg-white/5 text-muted-foreground transition-all duration-300"
                            onClick={startNewChat}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <ChatSidebar
                        history={history}
                        activeId={activeSessionId}
                        onSelect={loadSession}
                        onDelete={handleDeleteSession}
                        onNew={startNewChat}
                    />
                </motion.aside>

                {/* Chat Flow Area */}
                <div className="flex-1 flex flex-col bg-transparent relative w-full overflow-hidden">

                    {/* Minimalist Seamless Header */}
                    <header className="px-8 py-4 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md z-40">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden lg:flex w-9 h-9 rounded-full hover:bg-white/5 transition-all text-muted-foreground"
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            >
                                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                            </Button>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden w-9 h-9 rounded-full hover:bg-white/5 transition-all text-muted-foreground">
                                        <History className="w-4 h-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80 p-0 border-r border-white/5 bg-black">
                                    <ChatSidebar
                                        history={history}
                                        activeId={activeSessionId}
                                        onSelect={loadSession}
                                        onDelete={handleDeleteSession}
                                        onNew={startNewChat}
                                    />
                                </SheetContent>
                            </Sheet>

                            <div className="flex items-center gap-3 ml-2">
                                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-xs tracking-tight text-white/90">
                                        {activeSessionId
                                            ? history.find(s => s.id === activeSessionId)?.title || "Active Discussion"
                                            : "Intelligence Model"}
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-40">Secure Connection</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-muted-foreground/40 hover:text-white hover:bg-white/5" onClick={startNewChat}>
                                <Plus className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-muted-foreground/40 hover:text-white hover:bg-white/5" onClick={() => {
                                if (messages.length === 0) {
                                    toast.info("No conversation to share yet.");
                                    return;
                                }
                                const chatTranscript = messages.map(m => `${m.role === 'user' ? 'Me' : 'AI'}: ${m.content}`).join("\n\n");
                                navigator.clipboard.writeText(chatTranscript);
                                toast.success("Chat history copied to clipboard!");
                            }}>
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </header>

                    {/* Conversational Space */}
                    <ScrollArea className="flex-1 overflow-x-hidden">
                        <div className="max-w-6xl mx-auto px-6 py-16 space-y-12 min-h-full pb-40">
                            {messages.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{ duration: 6, repeat: Infinity }}
                                        className="w-24 h-24 bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent rounded-[2.5rem] flex items-center justify-center mb-12 shadow-2xl relative group overflow-hidden border border-white/5"
                                    >
                                        <Sparkles className="w-10 h-10 text-primary opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-30" />
                                    </motion.div>
                                    <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
                                        How can I <span className="text-primary italic">help?</span>
                                    </h1>
                                    <p className="text-muted-foreground text-lg max-w-sm mb-20 font-medium opacity-40 leading-relaxed font-sans">
                                        Start a conversation to analyze notes or explore new concepts.
                                    </p>

                                </motion.div>
                            ) : (
                                messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-6 max-w-[95%] lg:max-w-[100%]",
                                            message.role === "user" ? "flex-row-reverse ml-auto" : "flex-row"
                                        )}
                                    >
                                        <Avatar className={cn(
                                            "w-9 h-9 rounded-full border bg-black shrink-0 transition-transform active:scale-90",
                                            message.role === "assistant" ? "border-primary/20" : "border-white/10"
                                        )}>
                                            <AvatarFallback className={cn(
                                                "rounded-full font-bold text-[10px]",
                                                message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-white/5 text-white/40"
                                            )}>
                                                {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className={cn(
                                            "flex flex-col gap-2 max-w-[85%]",
                                            message.role === "user" ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "p-6 rounded-[2rem] text-sm leading-relaxed transition-all duration-500",
                                                message.role === "user"
                                                    ? "bg-white/5 border border-white/10 text-white rounded-tr-none"
                                                    : "bg-transparent text-white/90"
                                            )}>
                                                {message.role === "assistant" ? (
                                                    <MarkdownContent content={message.content} />
                                                ) : (
                                                    <p className="font-medium whitespace-pre-wrap">{message.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex gap-6 items-start"
                                >
                                    <div className="w-9 h-9 rounded-full border border-primary/20 bg-black flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-primary animate-pulse" />
                                    </div>
                                    <div className="flex-1 max-w-[80%]">
                                        <AIThinkingShimmer />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} className="h-4" />
                        </div>
                    </ScrollArea>

                    {/* Gemini Floating Pill Input Bar */}
                    <div className="absolute inset-x-0 bottom-10 z-50 px-6 pointer-events-none">
                        <div className="max-w-5xl mx-auto w-full pointer-events-auto">
                            <div className="p-2.5 rounded-[3rem] bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 group">
                                <AnimatePresence>
                                    {fileContext && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="px-4 pt-1"
                                        >
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                                <FileText className="w-3 h-3 text-primary/70" />
                                                <span className="text-[10px] font-bold text-white/60 truncate max-w-[150px]">{fileContext.name}</span>
                                                <button onClick={() => setFileContext(null)} className="ml-1 text-white/20 hover:text-white transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex items-center gap-2 pr-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) extractTextFromPDF(file);
                                        }}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-11 h-11 rounded-full text-white/40 hover:text-primary hover:bg-white/5 shrink-0"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </Button>

                                    <Input
                                        placeholder="Type something..."
                                        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium h-11 px-2 shadow-none placeholder:text-white/20 text-white"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                    />

                                    <Button
                                        size="icon"
                                        className={cn(
                                            "w-11 h-11 rounded-full transition-all duration-300 transform active:scale-95 shrink-0",
                                            isTyping
                                                ? "bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                                : input.trim()
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                    : "bg-white/5 text-white/20 cursor-not-allowed opacity-50"
                                        )}
                                        onClick={() => isTyping ? handleStop() : handleSend()}
                                    >
                                        {isTyping ? <X className="w-5 h-5" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChatSidebar = ({ history, activeId, onSelect, onDelete }: any) => (
    <div className="flex flex-col h-full space-y-8 px-4 py-8">
        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
                <div className="space-y-1.5 pb-10">
                    {history.map((session: any) => (
                        <div
                            key={session.id}
                            onClick={() => onSelect(session.id)}
                            className={cn(
                                "group flex items-center justify-between p-3 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden",
                                activeId === session.id
                                    ? "bg-white/5 text-white"
                                    : "bg-transparent text-white/40 hover:bg-white/[0.03] hover:text-white/60"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <MessageSquare className={cn(
                                    "w-4 h-4 shrink-0 transition-colors",
                                    activeId === session.id ? "text-primary/70" : "text-white/10"
                                )} />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[11px] font-bold truncate tracking-tight">{session.title}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                                onClick={(e) => onDelete(e, session.id)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <History className="w-5 h-5 mb-3 opacity-10 text-white" />
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10">No History</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    </div>
);
