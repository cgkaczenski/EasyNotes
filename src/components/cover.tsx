"use client";

import { deleteImage } from "@/actions/supabase";
import { removeCoverImage } from "@/actions/actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useDocument } from "@/hooks/use-document";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Document } from "@prisma/client";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  preview?: boolean;
}

export const Cover = ({ preview }: CoverImageProps) => {
  const params = useParams();
  const coverImage = useCoverImage();
  const { user } = useCurrentUser();
  const { selectedDocument } = useDocument();
  const url = selectedDocument?.coverImageUrl;

  const onRemove = async () => {
    const bucket = "cover_image";
    const slug = user?.email as string;
    const id = params.documentId as Document["id"];

    if (url) {
      await deleteImage({
        bucket: bucket,
        slug: slug,
        id: id,
      });
    }

    await removeCoverImage(id);
  };

  return (
    <div
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-muted"
      )}
    >
      {!!url && (
        <Image
          src={`${url}?timestamp=${Date.now()}`}
          fill
          alt="Cover"
          className="object-cover"
          style={{
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      )}
      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onOpen()}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};
