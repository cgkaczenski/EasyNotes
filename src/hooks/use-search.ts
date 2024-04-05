import { useContext } from "react";
import { SearchContext } from "@/contexts/search-context-provider";

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchContextProvider");
  }

  return context;
}
