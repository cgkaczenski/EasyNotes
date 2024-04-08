"use client";

import { useDocumentContext } from "@/hooks/use-document-context";
import { Toolbar } from "@/components/toolbar";

const DocumentIdPage = () => {
  const { selectedDocument } = useDocumentContext();

  if (selectedDocument === undefined) {
    return <div>Loading...</div>;
  }

  if (selectedDocument === null) {
    return <div>Not found</div>;
  }
  return (
    <div className="pb-40">
      <div className="h-[35vh]" />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={selectedDocument} />
      </div>
    </div>
  );
};

export default DocumentIdPage;
