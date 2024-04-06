"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useSearch } from "@/hooks/use-search";
import { useDocumentContext } from "@/hooks/use-document-context";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Document } from "@prisma/client";
import { useEffect, useState } from "react";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";

export const SearchCommand = () => {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen, onClose, toggle } = useSearch();
  const { documents } = useDocumentContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    router.push(`/app/documents/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.name}'s EasyNote...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          {documents?.map((document: Document) => (
            <CommandItem
              key={document.id}
              value={`${document.id}`}
              title={document.title}
              onSelect={() => onSelect(document.id)}
            >
              {document.icon ? (
                <p className="mr-2 text-[18px]">{document.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
