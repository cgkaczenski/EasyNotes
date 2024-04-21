"use client";

import { getPublishedDocumentById } from "@/actions/actions";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/spinner";
import SettingsContextProvider from "@/contexts/settings-context-provider";
import CoverImageContextProvider from "@/contexts/cover-image-provider";
import DocumentContextProvider from "@/contexts/document-context-provider";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Document } from "@prisma/client";

interface DocumentIdPageProps {
  params: {
    documentId: Document["id"];
  };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const [document, setDocument] = useState<Document | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      const result = await getPublishedDocumentById(params.documentId);
      if (result === null) {
        setIsNotFound(true);
        return;
      }
      setDocument(result);
    };

    fetchDoc();
  }, [params.documentId]);

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null && !isNotFound) {
    return (
      <div className="w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (document === null && isNotFound) {
    return (
      <div className="w-full flex items-center justify-center">
        No Document Found
      </div>
    );
  }

  if (document) {
    return (
      <DocumentContextProvider data={[document]}>
        <SettingsContextProvider>
          <CoverImageContextProvider>
            <div className="pb-40">
              <Cover preview url={document.coverImageUrl} />
              <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
                <Toolbar preview initialData={document} />
                <Editor
                  editable={false}
                  onChange={() => {}}
                  initialContent={document.content}
                />
              </div>
            </div>
          </CoverImageContextProvider>
        </SettingsContextProvider>
      </DocumentContextProvider>
    );
  }
};

export default DocumentIdPage;
