"use client";
import { updateDocument } from "@/actions/actions";
import { useDocument } from "@/hooks/use-document";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import { toast } from "sonner";

const DocumentIdPage = () => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const { selectedDocument } = useDocument();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  if (selectedDocument === undefined) {
    return <div>Loading...</div>;
  }

  if (selectedDocument === null) {
    return <div>Not found</div>;
  }

  const onChange = (content: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!toastIdRef.current) {
      toastIdRef.current = toast.loading("Note editing...");
    }

    timeoutRef.current = setTimeout(() => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }

      const updatePromise = updateDocument({
        id: selectedDocument.id,
        content,
      });

      toast.promise(updatePromise, {
        loading: "Save in progress",
        success: "Note saved!",
        error: "Failed to save note",
      });
    }, 3000);
  };

  return (
    <div className="pb-40">
      <Cover />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={selectedDocument} />
        <Editor onChange={onChange} initialContent={selectedDocument.content} />
      </div>
    </div>
  );
};

export default DocumentIdPage;
