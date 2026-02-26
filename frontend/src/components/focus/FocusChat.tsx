import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User as UserIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { generateResponse } from "@/services/ai";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface FocusChatProps {
    contextMaterial: { title: string; type: string; url: string; content_url?: string } | null;
}

export const FocusChat = ({ contextMaterial }: FocusChatProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "system-init",
            role: "assistant",
            content: "EGOIST AI ONLINE. State your query clearly. Time is ticking.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const currentInput = input;
        const userMessage: Message = {
            id: Math.random().toString(36).substring(7),
            role: "user",
            content: currentInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            // EGOIST PERSONA SYSTEM PROMPT
            const systemPrompt = `You are "EGOIST AI" (Logic Keeper), a strict, concise, and slightly arrogant study assistant. 
            Your goal is to keep the user focused and minimize distractions. 
            Rules:
            1. Be extremely concise (1-2 sentences max).
            2. If the user is chatty or mentions being tired, be firm but encouraging (e.g., "Fatigue is a mental construct. Continue.").
            3. Use clinical, logical language.
            4. If a study material is provided, focus only on that.
            
            Current context: ${contextMaterial ? `The user is studying "${contextMaterial.title}".` : "No specific material linked."}
            
            User says: ${currentInput}`;

            const response = await generateResponse(systemPrompt, contextMaterial?.content_url);

            const aiMessage: Message = {
                id: Math.random().toString(36).substring(7),
                role: "assistant",
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Focus Chat error:", error);
            const errorMessage: Message = {
                id: Math.random().toString(36).substring(7),
                role: "assistant",
                content: "Link failure. Re-initialize and focus.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-950/50 border-l border-blue-900/30">
            <div className="p-3 border-b border-blue-900/30 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">Logic Keeper</span>
                </div>
                {contextMaterial && (
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        Linked: {contextMaterial.title}
                    </span>
                )}
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, x: message.role === "user" ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <Avatar className={`w-6 h-6 border ${message.role === "assistant" ? "border-blue-500/50" : "border-slate-700"}`}>
                                <AvatarFallback className="bg-slate-900 text-[10px]">
                                    {message.role === "assistant" ? "AI" : "U"}
                                </AvatarFallback>
                            </Avatar>

                            <div className={`flex flex-col max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`px-3 py-2 text-xs font-mono leading-relaxed rounded-md ${message.role === "user"
                                        ? "bg-blue-900/20 text-blue-100 border border-blue-800/50"
                                        : "bg-slate-900/50 text-slate-300 border border-slate-800"
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex items-center gap-2 text-xs text-blue-500/50 animate-pulse px-2">
                            <Bot className="w-3 h-3" />
                            <span>Processing...</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-3 border-t border-blue-900/30 bg-black/40">
                <div className="flex gap-2 relative">
                    <Input
                        placeholder="Query..."
                        className="h-8 text-xs bg-slate-900/50 border-blue-900/30 focus-visible:ring-blue-800"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={isTyping}
                    />
                    <Button
                        size="icon"
                        className="h-8 w-8 bg-blue-900/20 hover:bg-blue-800/30 text-blue-400 border border-blue-800/50"
                        onClick={handleSend}
                    >
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
