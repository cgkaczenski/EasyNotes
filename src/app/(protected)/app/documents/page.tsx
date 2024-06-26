"use client";

import { useDocument } from "@/hooks/use-document";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DocumentsPage = () => {
  const { user } = useCurrentUser();
  const { handleAddDocument } = useDocument();

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        height="300"
        width="300"
        alt="Empty"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        height="300"
        width="300"
        alt="Empty"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.name}&apos;s EasyNote
      </h2>
      <Button
        onClick={async () =>
          toast.promise(
            Promise.resolve(handleAddDocument({ title: "Untitled" })),
            {
              loading: "Creating a new note...",
              success: "New note created!",
              error: "Failed to create a new note.",
            }
          )
        }
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  );
};

export default DocumentsPage;
