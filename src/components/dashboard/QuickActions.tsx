import { motion } from "framer-motion";
import {
  FileText,
  Youtube,
  Brain,
  MessageSquare,
  BookOpen,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full p-4 rounded-xl text-left transition-all duration-300 group ${variant === "primary"
        ? "bg-gradient-primary text-primary-foreground shadow-lg"
        : "glass-card hover:border-primary/30"
      }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${variant === "primary"
          ? "bg-white/20"
          : "bg-primary/10 group-hover:bg-primary/20"
        } transition-colors`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-semibold ${variant === "primary" ? "" : "text-foreground"
            }`}>
            {label}
          </h4>
          <span className={`badge-xp text-xs ${variant === "primary" ? "!bg-white/20 !text-white !border-white/30" : ""
            }`}>
            +{xpReward} XP
          </span>
        </div>
        <p className={`text-sm ${variant === "primary" ? "text-white/80" : "text-muted-foreground"
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
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      <motion.div variants={item}>
        <QuickAction
          icon={<FileText className="w-5 h-5" />}
          label="Upload PDF"
          description="Transform any PDF into interactive study materials"
          xpReward={50}
          onClick={onUploadPDF}
          variant="primary"
        />
      </motion.div>

      <motion.div variants={item}>
        <QuickAction
          icon={<Youtube className="w-5 h-5 text-destructive" />}
          label="YouTube Summary"
          description="Get AI summaries from educational videos"
          xpReward={30}
          onClick={onYouTube}
        />
      </motion.div>

      <motion.div variants={item}>
        <QuickAction
          icon={<Brain className="w-5 h-5 text-purple" />}
          label="Study Flashcards"
          description="Review and master your flashcard decks"
          xpReward={25}
          onClick={onFlashcards}
        />
      </motion.div>

      <motion.div variants={item}>
        <QuickAction
          icon={<MessageSquare className="w-5 h-5 text-xp" />}
          label="AI Study Chat"
          description="Ask questions about your study materials"
          xpReward={15}
          onClick={onAIChat}
        />
      </motion.div>

      <motion.div variants={item}>
        <QuickAction
          icon={<BookOpen className="w-5 h-5 text-success" />}
          label="Take Quiz"
          description="Test your knowledge with AI-generated quizzes"
          xpReward={100}
          onClick={onQuiz}
        />
      </motion.div>
    </motion.div>
  );
};
