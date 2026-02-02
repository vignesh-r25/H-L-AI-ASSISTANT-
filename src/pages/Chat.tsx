import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User as UserIcon, Paperclip, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from "sonner";

// Use safe worker loading for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your H&L Assistant. You can upload a PDF to chat about its content!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [fileContext, setFileContext] = useState<{ name: string, content: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const extractTextFromPDF = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
            }

            setFileContext({ name: file.name, content: fullText });
            toast.success(`Loaded "${file.name}" context!`);

            setMessages(prev => [...prev, {
                id: Math.random().toString(36).substring(7),
                role: "assistant",
                content: `I've read "${file.name}". Ask me anything about it!`,
                timestamp: new Date()
            }]);

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

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Math.random().toString(36).substring(7),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        // Simulate AI RAG response
        setTimeout(() => {
            let response = "That's an interesting question. I'd typically verify that with your study materials.";

            if (fileContext) {
                const keywords = input.toLowerCase().split(" ").filter(w => w.length > 3);
                const found = keywords.some(k => fileContext.content.toLowerCase().includes(k));

                if (found) {
                    response = `Based on "${fileContext.name}", I found relevant information regarding your query. The document discusses this topic in detail. (Mock RAG: In a real implementation, I would send the file text to an LLM to generate this answer).`;
                } else {
                    response = `I checked "${fileContext.name}", but I couldn't find a specific mention of that. Can you rephrase or ask about something else covered in the document?`;
                }
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
        <div className="h-[calc(100vh-120px)] flex flex-col max-w-4xl mx-auto">
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">AI Tutor</h1>
                    <p className="text-muted-foreground">Context-aware help for your studies</p>
                </div>
                {fileContext && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs text-primary animate-in fade-in slide-in-from-right-5">
                        <FileText className="w-3 h-3" />
                        <span className="max-w-[150px] truncate">{fileContext.name}</span>
                        <button onClick={() => setFileContext(null)} className="hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden glass-card">
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <Avatar className={`w-10 h-10 border-2 ${message.role === "assistant" ? "border-primary" : "border-muted"}`}>
                                    <AvatarFallback className={message.role === "assistant" ? "bg-primary/10 text-primary" : "bg-muted"}>
                                        {message.role === "assistant" ? <Bot className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div className={`flex flex-col max-w-[80%] space-y-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                                    <div
                                        className={`p-4 rounded-2xl text-sm leading-relaxed ${message.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-secondary text-secondary-foreground rounded-tl-sm"
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground px-1">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {isTyping && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                                <Avatar className="w-10 h-10 border-2 border-primary">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <Bot className="w-6 h-6" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-secondary p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
                                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={scrollRef as any} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                    <div className="flex gap-2 relative">
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
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach PDF context"
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <Input
                            placeholder="Ask a question..."
                            className="pr-12"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isTyping}
                        />
                        <Button
                            size="icon"
                            className="absolute right-1 top-1 h-8 w-8"
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
