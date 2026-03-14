import { motion } from "framer-motion";
import { LogOut, Zap, Shield } from "lucide-react";

export const LogoutTransition = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.05)_0%,transparent_70%)]" />

            {/* Digital Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px]" />
            <motion.div
                animate={{ y: [0, 30] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-20 w-full"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
            >
                <div className="relative mb-10">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{
                            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute inset-0 rounded-full border border-primary/20 border-t-primary/60 m-[-15px] blur-[2px]"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-white/5 border-b-white/20 m-[-25px]"
                    />

                    <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto relative overflow-hidden group">
                        <motion.div
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-primary/20"
                        />
                        <LogOut className="w-12 h-12 text-primary relative z-10" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <motion.h2
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
                            className="text-2xl font-black tracking-[0.2em] text-foreground uppercase italic"
                        >
                            Signing Out
                        </motion.h2>
                        <div className="h-0.5 w-12 bg-primary mx-auto rounded-full" />
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Zap className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-primary/60">
                            Terminating Session
                        </span>
                        <Shield className="w-3 h-3 text-primary animate-pulse" />
                    </div>

                    {/* Enhanced progress bar */}
                    <div className="w-64 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden mt-12 border border-white/10 relative">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, ease: "circIn" }}
                            className="h-full bg-gradient-to-r from-primary/50 to-primary relative z-10"
                        />
                        <motion.div
                            initial={{ left: "-10%" }}
                            animate={{ left: "110%" }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 bottom-0 w-8 bg-white/40 skew-x-12 blur-sm z-20"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
