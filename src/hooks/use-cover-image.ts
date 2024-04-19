import { useContext } from "react";
import { CoverImageContext } from "@/contexts/cover-image-provider";

export function useCoverImage() {
  const context = useContext(CoverImageContext);

  if (!context) {
    throw new Error(
      "useSettings must be used within a SettingsContextProvider"
    );
  }

  return context;
}
