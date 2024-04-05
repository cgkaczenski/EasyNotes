"use client";

import { useDocumentContext } from "@/hooks/use-document-context";
import { Document } from "@prisma/client";
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Title } from "./title";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();
  const { handleChangeDocumentId, selectedDocument } = useDocumentContext();

  if (
    params &&
    params.documentId &&
    params.documentId !== selectedDocument?.id
  ) {
    handleChangeDocumentId(params.documentId as Document["id"]);
  }

  const document = selectedDocument;

  if (document === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center">
        <Title.Skeleton />
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between wf-ull">
          <Title initialData={document} />
        </div>
      </nav>
    </>
  );
};
