import { motion, AnimatePresence } from "framer-motion";
import { X, Bell } from "lucide-react";
import { useState, useEffect } from "react";

interface AppleNotificationProps {
    title: string;
    message: string;
    onClose?: () => void;
    duration?: number;
}

export const AppleNotification = ({
    title,
    message,
    onClose,
    duration = 5000,
}: AppleNotificationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Allow exit animation to finish
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 25,
                        mass: 1,
                        velocity: 2,
                    }}
                    className="w-96 pointer-events-auto"
                >
                    <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/20 shadow-2xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="shrink-0 p-2.5 bg-white/20 rounded-xl">
                                <Bell className="w-6 h-6 text-foreground" />
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <h3 className="font-semibold text-base text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
