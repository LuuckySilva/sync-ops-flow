import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle2 } from "lucide-react";

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
  }[];
}

export const BatchActionBar = ({
  selectedCount,
  onClearSelection,
  actions,
}: BatchActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-xl p-4 flex items-center gap-4">
        <Badge variant="secondary" className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {selectedCount} selecionado{selectedCount > 1 ? "s" : ""}
        </Badge>

        <div className="flex gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "secondary"}
              size="sm"
              onClick={action.onClick}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="ml-2 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
