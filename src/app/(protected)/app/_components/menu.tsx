"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { archiveDocument } from "@/actions/actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Document } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash } from "lucide-react";

interface MenuProps {
  documentId: Document["id"];
}

export const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter();
  const { user } = useCurrentUser();

  const onArchive = () => {
    const promise = archiveDocument(documentId);

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash!",
      error: "Failed to archive note.",
    });

    router.push("/app/documents");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuItem onClick={onArchive}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.name}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};
