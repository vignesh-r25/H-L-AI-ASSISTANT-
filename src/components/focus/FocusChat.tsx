import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User as UserIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface FocusChatProps {
    contextMaterial: { title: string; type: string; url: string } | null;
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

        // Simulate "Concise Egoist" AI response
        setTimeout(() => {
            let response = "";
            const lowerInput = input.toLowerCase();

            // CONCISE PERSONA LOGIC
            if (lowerInput.includes("help") || lowerInput.includes("stuck")) {
                response = "Analyze the problem. Break it down. What exactly is blocking you?";
            } else if (lowerInput.includes("tired") || lowerInput.includes("quit")) {
                response = "Fatigue is a mental construct. Continue.";
            } else if (contextMaterial) {
                // Mock context awareness
                response = `Regarding "${contextMaterial.title}": Focus on the key concepts in section 3. Do not get distracted by details.`;
            } else {
                response = "Acknowledged. Proceed with the task.";
            }

            // Append disclaimer if user is chatty
            if (input.length > 50) {
                response += " (Keep queries brief. Return to work.)";
            }

            const aiMessage: Message = {
                id: Math.random().toString(36).substring(7),
                role: "assistant",
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 800);
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
