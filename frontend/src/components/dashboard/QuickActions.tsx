import { ActionCard } from "./ActionCard";
import { Upload, Youtube, Brain, MessageSquare, Target } from "lucide-react";
import { motion } from "framer-motion";

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
  const actions = [
    { label: "Upload Link", icon: Upload, onClick: onUploadPDF, color: "text-blue-500", bg: "bg-blue-500/10", delay: 0.1 },
    { label: "YouTube", icon: Youtube, onClick: onYouTube, color: "text-red-500", bg: "bg-red-500/10", delay: 0.2 },
    { label: "Flashcards", icon: Brain, onClick: onFlashcards, color: "text-purple-500", bg: "bg-purple-500/10", delay: 0.3 },
    { label: "AI Chat", icon: MessageSquare, onClick: onAIChat, color: "text-green-500", bg: "bg-green-500/10", delay: 0.4 },
    { label: "Take Quiz", icon: Target, onClick: onQuiz, color: "text-orange-500", bg: "bg-orange-500/10", delay: 0.5 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: action.delay }}
          whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } }}
          whileTap={{ scale: 0.95 }}
        >
          <ActionCard
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            iconColor={action.color}
            iconBg={action.bg}
            className="h-full border border-white/5 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
          />
        </motion.div>
      ))}
    </div>
  );
};
