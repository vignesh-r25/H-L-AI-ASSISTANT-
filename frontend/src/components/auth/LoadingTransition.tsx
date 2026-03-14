import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Cpu, ShieldCheck, Zap, Globe } from "lucide-react";

interface LoadingTransitionProps {
    onComplete: () => void;
    waitingFor?: boolean;
}

const statusMessages = [
    { text: "Synchronizing Knowledge Vault", icon: Database },
    { text: "Initializing AI Neural Core", icon: Cpu },
    { text: "Establishing Secure Link", icon: ShieldCheck },
    { text: "Optimizing Learning Nodes", icon: Zap },
    { text: "Finalizing Workspace Sync", icon: Globe },
];

export const LoadingTransition = ({ onComplete, waitingFor }: LoadingTransitionProps) => {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const duration = 1500; // 1.5 seconds for a snappier feel
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (waitingFor) return 100; // Stay at 100% while waiting for auth result
                    clearInterval(timer);
                    setTimeout(onComplete, 1000); // Final delay for polish
                    return 100;
                }
                return prev + step;
            });
        }, interval);

        const statusTimer = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statusMessages.length);
        }, 600);

        return () => {
            clearInterval(timer);
            clearInterval(statusTimer);
        };
    }, [onComplete, waitingFor]);

    const CurrentIcon = statusMessages[statusIndex].icon;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Energy Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="mb-12 relative">
                    {/* Animated Outer Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary/60 m-[-20px]"
                    />

                    <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={statusIndex}
                                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
                                className="text-primary"
                            >
                                <CurrentIcon className="w-12 h-12" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <motion.h2
                            className="text-2xl font-bold tracking-tight text-foreground"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            Please Wait
                        </motion.h2>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={statusIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-sm font-mono uppercase tracking-[0.3em] text-primary/70"
                            >
                                {statusMessages[statusIndex].text}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    <div className="space-y-3">
                        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">
                            <span>System Initialization</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-3 gap-8 opacity-20">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="h-1 bg-primary/50 rounded-full"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Decorative Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
                    animate={{
                        x: [Math.random() * 1000 - 500, Math.random() * 1000 - 500],
                        y: [Math.random() * 1000 - 500, Math.random() * 1000 - 500],
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                />
            ))}
        </div>
    );
};
