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
  onDelete?: (id: string) => void;
}

const typeIcons = {
  pdf: <FileText className="w-5 h-5 text-destructive" />,
  youtube: <Youtube className="w-5 h-5 text-red-500" />,
  image: <Image className="w-5 h-5 text-purple-accent" />,
  video: <Youtube className="w-5 h-5 text-primary" />,
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
  onDelete,
}: RecentMaterialsProps) => {
  return (
    <div className="bg-black p-6 border border-border/40 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Vault Status</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary font-bold">
          Access All
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-bold">No materials found.</p>
          <p className="text-sm text-muted-foreground opacity-60">Upload content to begin analysis.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/10 cursor-pointer border border-transparent hover:border-border/30 transition-none group"
              onClick={() => onMaterialClick(material.id)}
            >
              <div className="p-2 rounded-lg bg-muted">
                {typeIcons[material.type]}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-none">
                  {material.title}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase opacity-60">
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
                      className="h-full bg-primary rounded-full transition-none"
                      style={{ width: `${material.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground text-center mt-1">
                    {material.progress}%
                  </p>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border-border/80">
                  <DropdownMenuItem className="font-bold">Open</DropdownMenuItem>
                  <DropdownMenuItem className="font-bold">Generate Flashcards</DropdownMenuItem>
                  <DropdownMenuItem className="font-bold">Create Quiz</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(material.id);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
