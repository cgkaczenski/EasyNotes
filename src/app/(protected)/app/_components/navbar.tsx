"use client";

import { useDocumentContext } from "@/hooks/use-document-context";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Document } from "@prisma/client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { MenuIcon } from "lucide-react";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();
  const { handleChangeDocumentId, selectedDocument } = useDocumentContext();

  useEffect(() => {
    if (
      params &&
      params.documentId &&
      params.documentId !== selectedDocument?.id
    ) {
      handleChangeDocumentId(params.documentId as Document["id"]);
    }
  }, [params, selectedDocument, handleChangeDocumentId]);

  const document = selectedDocument;

  if (document === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
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
        <div className="flex items-center justify-between w-full">
          <Title initialData={document} />
          <div className="flex items-center gap-x-2">
            <Menu documentId={document.id} />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document.id} />}
    </>
  );
};
