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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Materials</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
          View All
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No materials yet</p>
          <p className="text-sm text-muted-foreground">Upload a PDF or paste a YouTube URL to get started</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {materials.map((material) => (
            <motion.div
              key={material.id}
              variants={item}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => onMaterialClick(material.id)}
            >
              <div className="p-2 rounded-lg bg-muted">
                {typeIcons[material.type]}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {material.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{typeLabels[material.type]}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(material.createdAt)}
                  </span>
                </div>
              </div>

              {material.progress !== undefined && (
                <div className="w-16">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary rounded-full"
                      style={{ width: `${material.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {material.progress}%
                  </p>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuItem>Generate Flashcards</DropdownMenuItem>
                  <DropdownMenuItem>Create Quiz</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
