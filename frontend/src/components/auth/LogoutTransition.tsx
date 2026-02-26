import { motion } from "framer-motion";
import { LogOut, Zap, Shield } from "lucide-react";

export const LogoutTransition = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.05)_0%,transparent_70%)]" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
            >
                <div className="relative mb-8">
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-primary/10 border-t-primary/40 m-[-10px]"
                    />
                    <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto">
                        <LogOut className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                        Signing Out
                    </h2>
                    <div className="flex items-center justify-center gap-4 opacity-50">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-muted-foreground">
                            Clearing Secure Session
                        </span>
                        <Shield className="w-3 h-3 text-primary" />
                    </div>
                    
                    {/* Fast progress bar */}
                    <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden mt-8 border border-white/5">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
