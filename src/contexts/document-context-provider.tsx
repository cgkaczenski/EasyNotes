"use client";

import { addDocument } from "@/actions/actions";
import { createContext, useMemo, useOptimistic } from "react";
import { Document } from "@prisma/client";

type DocumentContextProps = {
  data: Document[];
  children: React.ReactNode;
};

type TDocumentContext = {
  documents: Document[];
  handleAddDocument: ({
    title,
    parentId,
  }: {
    title: string;
    parentId?: Document["id"];
  }) => Promise<null>;
};

export const DocumentContext = createContext<TDocumentContext | null>(null);

export default function DocumentContextProvider({
  data: leads,
  children,
}: DocumentContextProps) {
  return (
    <DocumentContextProviderContent data={leads}>
      {children}
    </DocumentContextProviderContent>
  );
}

function DocumentContextProviderContent({
  data,
  children,
}: DocumentContextProps) {
  const [optimisticDocuments, setOptimisticDocuments] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          return [...state, { ...payload, id: Math.random().toString() }];
        default:
          return state;
      }
    }
  );

  const documents = useMemo(() => optimisticDocuments, [optimisticDocuments]);

  const handleAddDocument = async ({
    title,
    parentId,
  }: {
    title: string;
    parentId?: Document["id"];
  }) => {
    setOptimisticDocuments({
      action: "add",
      payload: { title },
    });
    await addDocument(title, parentId);
    return null;
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        handleAddDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
