import { motion } from "framer-motion";
import {
  FileText,
  Youtube,
  Brain,
  MessageSquare,
  BookOpen,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  xpReward: number;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

const QuickAction = ({
  icon,
  label,
  description,
  xpReward,
  onClick,
  variant = "secondary"
}: QuickActionProps) => (
  <motion.button
    whileHover={{
      scale: 1.05,
      y: -5,
      transition: { type: "spring" as const, stiffness: 400, damping: 25 }
    }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`w-full p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${variant === "primary"
      ? "bg-gradient-primary text-primary-foreground shadow-lg shadow-primary/20"
      : "glass-card hover:bg-white/5 border border-white/10"
      }`}
  >
    {/* Shine effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-3 rounded-2xl ${variant === "primary"
        ? "bg-white/20 backdrop-blur-sm"
        : "bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10"
        } transition-colors shadow-inner`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-semibold tracking-tight ${variant === "primary" ? "" : "text-foreground"
            }`}>
            {label}
          </h4>
          <span className={`badge-xp text-[10px] px-2 py-0.5 rounded-full ${variant === "primary" ? "bg-white/20 text-white border border-white/30 backdrop-blur-md" : "bg-primary/10 text-primary border border-primary/20"
            }`}>
            +{xpReward} XP
          </span>
        </div>
        <p className={`text-xs ${variant === "primary" ? "text-white/80" : "text-muted-foreground"
          }`}>
          {description}
        </p>
      </div>
    </div>
  </motion.button>
);

interface QuickActionsProps {
  onUploadPDF: () => void;
  onYouTube: () => void;
  onFlashcards: () => void;
  onAIChat: () => void;
  onQuiz: () => void;
}

export const QuickActions = ({
  onUploadPDF,
  onYouTube,
  onFlashcards,
  onAIChat,
  onQuiz,
}: QuickActionsProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, bounce: 0.4 }
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2"
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent w-full justify-between group">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Quick Actions</h3>
            </div>
            <div className={`p-1 rounded-full bg-secondary/50 transition-transform duration-300 ${isOpen ? "rotate-0" : "-rotate-90"}`}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-3 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-visible">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2 pb-4 px-1"
        >
          <motion.div variants={item}>
            <QuickAction
              icon={<FileText className="w-5 h-5" />}
              label="Upload PDF"
              description="Transform PDF to material"
              xpReward={50}
              onClick={onUploadPDF}
              variant="primary"
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickAction
              icon={<Youtube className="w-5 h-5 text-red-500" />}
              label="YouTube AI"
              description="Summarize videos"
              xpReward={30}
              onClick={onYouTube}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickAction
              icon={<Brain className="w-5 h-5 text-purple-500" />}
              label="Flashcards"
              description="Review decks"
              xpReward={25}
              onClick={onFlashcards}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickAction
              icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
              label="AI Chat"
              description="Ask questions"
              xpReward={15}
              onClick={onAIChat}
            />
          </motion.div>

          <motion.div variants={item}>
            <QuickAction
              icon={<BookOpen className="w-5 h-5 text-green-500" />}
              label="Take Quiz"
              description="Test knowledge"
              xpReward={100}
              onClick={onQuiz}
            />
          </motion.div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
};
