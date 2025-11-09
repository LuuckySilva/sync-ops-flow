import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onClearFilters?: () => void;
  searchValue?: string;
}

export const FilterBar = ({
  searchPlaceholder = "Buscar...",
  onSearchChange,
  onFilterChange,
  filters = [],
  onClearFilters,
  searchValue = "",
}: FilterBarProps) => {
  const hasActiveFilters = searchValue !== "";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          onValueChange={(value) => onFilterChange?.(filter.key, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && onClearFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Limpar
        </Button>
      )}
    </div>
  );
};
