import { Search } from "lucide-react";
import type { FC } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";
import { cn } from "~/shared/lib/utils";
import { TextInput } from "../common/text-input";

interface SearchBarProps {
  placeholder: string;
  iconPosition?: "start" | "end";
  searchParamKey?: string;
  className?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  iconPosition = "start",
  searchParamKey = "buscar",
  className,
}) => {
  const { handleSearchParams, searchParams } = useSearchParamsManager();

  const handleSearch = useDebouncedCallback((term: string) => {
    handleSearchParams(searchParamKey, term);
  }, 300);

  return (
    <TextInput
      icon={<Search className="h-5 w-5 text-muted-foreground" />}
      iconPosition={iconPosition}
      defaultValue={searchParams.get(searchParamKey) ?? ""}
      placeholder={placeholder}
      onChange={(e) => handleSearch(e.target.value)}
      className={cn("rounded-lg border", className)}
    />
  );
};
