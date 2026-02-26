import { AuthForm } from "@/components/auth/AuthForm";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { EduAnimation } from "@/components/layout/EduAnimation";

export default function Auth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const mode = searchParams.get("mode");
    const isSignup = mode === "signup";

    useEffect(() => {
        console.log("[Auth] Page mounted. Checking session...");
        let mounted = true;

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            console.log("[Auth] Session check result:", !!session);
            if (mounted) {
                if (session) {
                    navigate("/dashboard", { replace: true });
                } else {
                    setLoading(false);
                }
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Only auto-navigate on initial session recovery. 
            // Manual sign-ins are handled by the AuthForm animation finish.
            if (mounted && session && event === 'INITIAL_SESSION') {
                navigate("/dashboard", { replace: true });
            }
        });

        // Faster safety fallback
        const timer = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 500);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
                <EduAnimation />
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 flex flex-col items-center text-center px-6"
                >
                    <div className="relative mb-12">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-2 border-primary/20 border-t-primary shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-bold tracking-tight text-white uppercase"
                        >
                            Please Wait
                        </motion.h2>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[10px] text-primary/70 font-mono uppercase tracking-[0.5em] animate-pulse">
                                Synchronizing Identity
                            </p>
                            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-full w-full bg-primary/40"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-black">
            <EduAnimation />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0" />
            <div className="relative z-10 w-full h-full">
                <AuthForm onSuccess={() => navigate("/dashboard", { replace: true })} defaultIsLogin={!isSignup} />
            </div>
        </div>
    );
}
