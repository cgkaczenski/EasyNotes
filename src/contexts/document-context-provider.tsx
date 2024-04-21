"use client";

import {
  addDocument,
  archiveDocument,
  updateDocument,
} from "@/actions/actions";
import { createContext, useMemo, useOptimistic, useState } from "react";
import { Document } from "@prisma/client";

type DocumentContextProps = {
  data: Document[];
  children: React.ReactNode;
};

type TDocumentContext = {
  documents: Document[];
  selectedDocument: Document | undefined;
  handleChangeDocumentId: (id: Document["id"]) => void;
  handleAddDocument: ({
    title,
    parentId,
  }: {
    title: string;
    parentId?: Document["id"];
  }) => Promise<null>;
  handleArchiveDocument: ({ id }: { id: Document["id"] }) => Promise<null>;
  handleUpdateDocument: ({
    id,
    title,
    content,
    coverImageUrl,
    icon,
    isPublished,
  }: {
    id: Document["id"];
    title?: Document["title"];
    content?: Document["content"];
    coverImageUrl?: Document["coverImageUrl"];
    icon?: Document["icon"];
    isPublished?: Document["isPublished"];
  }) => Promise<null>;
};

export const DocumentContext = createContext<TDocumentContext | null>(null);

export default function DocumentContextProvider({
  data: documents,
  children,
}: DocumentContextProps) {
  return (
    <DocumentContextProviderContent data={documents}>
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
  const [selectedDocumentId, setSelectedDocumentId] = useState<
    Document["id"] | null
  >(null);
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
        case "edit":
          return state.map((document) =>
            document.id === payload.id ? { ...document, ...payload } : document
          );
        default:
          return state;
      }
    }
  );

  const documents = useMemo(() => optimisticDocuments, [optimisticDocuments]);
  const selectedDocument = documents.find(
    (doc) => doc.id === selectedDocumentId
  );

  const handleChangeDocumentId = (id: Document["id"]) => {
    setSelectedDocumentId(id);
  };

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

  const handleUpdateDocument = async ({
    id,
    title,
    content,
    coverImageUrl,
    icon,
    isPublished,
  }: {
    id: Document["id"];
    title?: Document["title"];
    content?: Document["content"];
    coverImageUrl?: Document["coverImageUrl"];
    icon?: Document["icon"];
    isPublished?: Document["isPublished"];
  }) => {
    setOptimisticDocuments({
      action: "edit",
      payload: { id, title, content, coverImageUrl, icon, isPublished },
    });
    await updateDocument({
      id,
      title,
      content,
      coverImageUrl,
      icon,
      isPublished,
    });
    return null;
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        selectedDocument,
        handleChangeDocumentId,
        handleAddDocument,
        handleArchiveDocument,
        handleUpdateDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
