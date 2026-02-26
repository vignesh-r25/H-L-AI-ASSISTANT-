import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Maximize, AlertOctagon, Brain, Flame, Lock, Eye } from "lucide-react";
import { FocusReader } from "@/components/focus/FocusReader";
import { FocusChat } from "@/components/focus/FocusChat";
import { supabase } from "@/integrations/supabase/client";

// Types
type FocusState = 'IDLE' | 'LOCKED_IN' | 'PENALTY' | 'VICTORY';
type Material = { id: string; title: string; type: string; url: string; content_url: string; };

const FocusChamber = () => {
    const navigate = useNavigate();
    const [state, setState] = useState<FocusState>('IDLE');
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [othersCount, setOthersCount] = useState(0);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePenalty = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            console.log("[FocusChamber] Applying penalty to user:", user.id);
            const { error } = await supabase.rpc('deduct_streak_and_xp', {
                target_id: user.id,
                xp_amount: 50,
                streak_deduction: 1
            });
 
            if (error) {
                console.error("[FocusChamber] Penalty RPC failed:", error);
                toast.error(`PENALTY SYNC FAILED: ${error.message} (Code: ${error.code})`, {
                    duration: 6000
                });
                return;
            }

            localStorage.removeItem('focus_session_active');
            toast.error("FOCUS BROKEN. -50 XP & -1 STREAK PENALTY APPLIED.", {
                style: { backgroundColor: '#7f1d1d', color: '#fff', border: '1px solid #ef4444' },
                duration: 4000
            });
        } catch (error) {
            console.error("Penalty failed:", error);
            toast.error("Critical System Failure during Penalty sync");
        }
    };

    // Initial check on mount
    useEffect(() => {
        setOthersCount(Math.floor(Math.random() * 10) + 3);

        // Visibility API Listener
        const handleVisibilityChange = () => {
            if (document.hidden && state === 'LOCKED_IN') {
                handlePenalty();
            }
        };

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state === 'LOCKED_IN') {
                e.preventDefault();
                e.returnValue = "LEAVING WILL INCUR A PENALTY. YOUR STREAK AND XP WILL BE REDUCED.";
                return e.returnValue;
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [state]);

    const enterChamber = async () => {
        try {
            await document.documentElement.requestFullscreen();
            localStorage.setItem('focus_session_active', 'true');
            setState('LOCKED_IN');
            setTimeLeft(60 * 60);
            toast("THE CHAMBER IS SEALED. FOCUS.", {
                style: { backgroundColor: '#000', color: '#fff', border: '1px solid #33f' }
            });
        } catch (err) {
            toast.error("Fullscreen required to enter.");
        }
    };

    // Exit Handler
    const handleExit = async () => {
        if (state === 'LOCKED_IN') {
            const confirmExit = window.confirm("LEAVING NOW WILL INCUR A PENALTY. Are you sure?");
            if (confirmExit) {
                await handlePenalty();
                document.exitFullscreen().catch(() => { });
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (state === 'LOCKED_IN' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && state === 'LOCKED_IN') {
            localStorage.removeItem('focus_session_active');
            setState('VICTORY');
        }
        return () => clearInterval(interval);
    }, [state, timeLeft]);

    // Format time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (state === 'IDLE') {
        // ... (Same Idle Screen as before)
        return (
            <div className="min-h-screen bg-black text-blue-500 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

                <div className="z-10 text-center space-y-8 max-w-2xl border border-blue-900/50 p-12 rounded-2xl bg-black/50 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(30,64,175,0.5)]">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-blue-950/30 border border-blue-500/30 animate-pulse">
                            <Brain className="w-16 h-16 text-blue-500" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-900 uppercase">
                        The Chamber
                    </h1>

                    <div className="space-y-4 text-blue-200/70 text-lg">
                        <p className="flex items-start gap-2 justify-center">
                            <AlertOctagon className="w-5 h-5 text-red-500 mt-1" />
                            <span>Warning: High Stakes Environment</span>
                        </p>
                        <p>One Hour. Fullscreen Mandatory. No Distractions.</p>
                        <p className="text-sm border-t border-blue-900/50 pt-4 mt-4">
                            Leaving early or switching tabs results in <span className="text-red-400 font-bold">-50 XP</span> penalty.
                        </p>
                    </div>

                    <div className="pt-8">
                        <Button
                            onClick={enterChamber}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-8 text-xl rounded-none border border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.7)]"
                        >
                            <Lock className="w-6 h-6 mr-3" />
                            INITIATE LOCK-IN
                        </Button>
                        <p className="mt-4 text-xs text-blue-500/50 uppercase tracking-widest">
                            {othersCount} Agents currently locked in
                        </p>
                    </div>
                </div>

                <Button variant="ghost" className="absolute top-4 left-4 text-blue-900 hover:text-blue-500" onClick={() => navigate('/dashboard')}>
                    ← ABORT
                </Button>
            </div>
        );
    }

    // MAIN COCKPIT VIEW
    return (
        <div ref={containerRef} className="h-screen max-h-screen flex flex-col bg-slate-950 text-blue-400 font-mono overflow-hidden">

            {/* Top Bar / Status */}
            <div className="h-10 bg-black border-b border-blue-900/20 flex items-center justify-between px-4 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-blue-500 tracking-[0.2em] flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        SYSTEM SECURE
                    </span>
                    <span className="text-xs text-slate-500">
                        {othersCount} PEERS ACTIVE
                    </span>
                </div>

                <div className="text-xl font-black text-white px-4 tabular-nums tracking-wide">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-red-900 hover:text-red-500 hover:bg-red-950/20"
                        onClick={handleExit}
                    >
                        ABORT MISSION
                    </Button>
                </div>
            </div>

            {/* Main Area: Split Screen */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Material Reader (70%) */}
                <div className="w-[70%] h-full border-r border-blue-900/20 bg-black relative">
                    <FocusReader onMaterialChange={(m) => setSelectedMaterial(m as unknown as Material)} />

                    {/* Deadman Switch overlay would spawn here randomly */}
                    {/* <DeadmanSwitch /> */}
                </div>

                {/* RIGHT: Egoist AI (30%) */}
                <div className="w-[30%] h-full bg-slate-950">
                    <FocusChat contextMaterial={selectedMaterial} />
                </div>
            </div>
        </div>
    );
};

export default FocusChamber;
