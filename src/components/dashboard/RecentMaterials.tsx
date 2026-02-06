import { motion } from "framer-motion";
import { FileText, Youtube, Image, Clock, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Material {
  id: string;
  title: string;
  type: "pdf" | "youtube" | "image" | "video";
  createdAt: Date;
  progress?: number;
}

interface RecentMaterialsProps {
  materials: Material[];
  onMaterialClick: (id: string) => void;
  onViewAll: () => void;
}

const typeIcons = {
  pdf: <FileText className="w-5 h-5 text-destructive" />,
  youtube: <Youtube className="w-5 h-5 text-red-500" />,
  image: <Image className="w-5 h-5 text-purple" />,
  video: <Youtube className="w-5 h-5 text-xp" />,
};

const typeLabels = {
  pdf: "PDF Document",
  youtube: "YouTube Video",
  image: "Image/Notes",
  video: "Video",
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

export const RecentMaterials = ({
  materials,
  onMaterialClick,
  onViewAll,
}: RecentMaterialsProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-white/10 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white tracking-tight">Recent Materials</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-gray-400 hover:text-white hover:bg-white/5">
          View All
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 font-medium">No materials yet</p>
          <p className="text-sm text-gray-600 mt-1 max-w-[200px]">Upload a PDF or paste a YouTube URL to get started</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {materials.map((material) => (
            <motion.div
              key={material.id}
              variants={item}
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
              className="flex items-center gap-4 p-3 rounded-lg border border-transparent hover:border-white/5 transition-all group cursor-pointer"
              onClick={() => onMaterialClick(material.id)}
            >
              <div className="p-2.5 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                {typeIcons[material.type]}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                  {material.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                  <span className="capitalize">{typeLabels[material.type]}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="flex items-center gap-1 font-mono text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDate(material.createdAt)}
                  </span>
                </div>
              </div>

              {material.progress !== undefined && (
                <div className="w-20 shrink-0">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500/80 rounded-full"
                      style={{ width: `${material.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-right text-gray-500 mt-1.5">
                    {material.progress}%
                  </p>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 opacity-0 group-hover:opacity-100 transition-all hover:text-white hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-gray-300">
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Open</DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Generate Flashcards</DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10 focus:text-white cursor-pointer">Create Quiz</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
