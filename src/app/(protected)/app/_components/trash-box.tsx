"use client";

import { getTrash, restoreDocument, deleteDocument } from "@/actions/actions";
import { Spinner } from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Document } from "@prisma/client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Trash, Undo } from "lucide-react";
import { toast } from "sonner";

export const TrashBox = () => {
  const router = useRouter();
  const params = useParams();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrash = async () => {
      const result = await getTrash();
      setDocuments(result);
      setLoading(false);
    };

    fetchTrash();
  }, []);

  const [search, setSearch] = useState("");

  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });

  const onClick = (documentId: string) => {
    router.push(`/app/documents/${documentId}`);
  };

  const removeDocumentAndChildren = (documentId: Document["id"]) => {
    const documentsToRemove = documents.filter((doc) => doc.id === documentId);

    documents.forEach((doc) => {
      if (doc.parentDocumentId === documentId) {
        documentsToRemove.push(...removeDocumentAndChildren(doc.id));
      }
    });

    return documentsToRemove;
  };

  const onRestore = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: Document["id"]
  ) => {
    event.stopPropagation();
    const promise = restoreDocument(documentId);

    promise.then(() => {
      const documentsToRemove = removeDocumentAndChildren(documentId);
      setDocuments(documents.filter((doc) => !documentsToRemove.includes(doc)));
    });

    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored!",
      error: " Failed to restore note.",
    });
  };

  const onRemove = (documentId: Document["id"]) => {
    const promise = deleteDocument(documentId);

    promise.then(() => {
      setDocuments(documents.filter((doc) => doc.id !== documentId));
      if (params.documentId === documentId) {
        router.push("/app/documents");
      }
    });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted!",
      error: "Failed to delete note.",
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found.
        </p>
        {filteredDocuments?.map((document) => (
          <div
            key={document.id}
            role="button"
            onClick={() => onClick(document.id)}
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
          >
            <span className="truncate pl-2">{document.title}</span>
            <div className="flex items-center">
              <div
                onClick={(e) => onRestore(e, document.id)}
                role="button"
                className="rounded-sm p-2 hover:bg-neutral-200"
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </div>
              <ConfirmModal onConfirm={() => onRemove(document.id)}>
                <div
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
