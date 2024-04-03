"use client";

import { addDocument, archiveDocument } from "@/actions/actions";
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
  handleArchiveDocument: ({ id }: { id: Document["id"] }) => Promise<null>;
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
  const isDocumentOrDescendant = (
    documents: Document[],
    currentDocumentId: Document["id"],
    targetDocumentId: Document["id"]
  ): boolean => {
    if (currentDocumentId === targetDocumentId) {
      return true;
    }

    const children = documents.filter(
      (doc) => doc.parentDocumentId === currentDocumentId
    );
    return children.some((child) =>
      isDocumentOrDescendant(documents, child.id, targetDocumentId)
    );
  };

  const [optimisticDocuments, setOptimisticDocuments] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          return [...state, { ...payload, id: Math.random().toString() }];
        case "archive":
          return state.filter(
            (document) =>
              !isDocumentOrDescendant(state, document.id, payload.documentId)
          );
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

  const handleArchiveDocument = async ({ id }: { id: Document["id"] }) => {
    setOptimisticDocuments({
      action: "archive",
      payload: { id },
    });
    await archiveDocument(id);
    return null;
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        handleAddDocument,
        handleArchiveDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
