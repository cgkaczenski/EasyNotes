import { useContext } from "react";
import { DocumentContext } from "@/contexts/document-context-provider";

export function useDocumentContext() {
  const context = useContext(DocumentContext);

  if (!context) {
    throw new Error(
      "useDocumentContext must be used within a DocumentContextProvider"
    );
  }

  return context;
}
