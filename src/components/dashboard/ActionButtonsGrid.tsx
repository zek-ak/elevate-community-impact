import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Target, 
  FileText, 
  Users, 
  FolderKanban,
  BarChart3,
  HandHeart,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActionButton {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
}

export const actions: ActionButton[] = [
  { 
    id: "contribute", 
    label: "Contribute", 
    icon: <Wallet className="w-5 h-5" />,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  },
  { 
    id: "pledge", 
    label: "Pledge Goal", 
    icon: <Target className="w-5 h-5" />,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  },
  { 
    id: "my-contributions", 
    label: "My Contributions", 
    icon: <HandHeart className="w-5 h-5" />,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  { 
    id: "group-members", 
    label: "Group Members", 
    icon: <Users className="w-5 h-5" />,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  },
  { 
    id: "projects", 
    label: "Church Projects", 
    icon: <FolderKanban className="w-5 h-5" />,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
  },
  { 
    id: "reports", 
    label: "Reports", 
    icon: <BarChart3 className="w-5 h-5" />,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
  },
];

interface ActionButtonsGridProps {
  onAction: (actionId: string) => void;
  activeAction?: string | null;
  onCloseDropdown?: () => void;
}

const ActionButtonsGrid = ({ 
  onAction, 
  activeAction,
  onCloseDropdown
}: ActionButtonsGridProps) => {
  const activeButton = actions.find(a => a.id === activeAction);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        {activeAction && (
          <button 
            onClick={onCloseDropdown}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        )}
      </div>
      
      {/* Header indicator for active action (optional) */}
      {activeAction && activeButton && (
        <div className="bg-muted/30 rounded-xl p-3 mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeButton.color)}>
              {activeButton.icon}
            </div>
            <span className="font-medium text-foreground">{activeButton.label}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-200",
              "border border-border/50 bg-card",
              activeAction === action.id 
                ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md" 
                : "hover:bg-accent hover:shadow-md hover:-translate-y-0.5"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: activeAction === action.id ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", action.color)}>
              {action.icon}
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>


    </div>
  );
};

export default ActionButtonsGrid;

