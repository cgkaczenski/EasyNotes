"use client";

import { deleteImage } from "@/actions/supabase";
import { removeCoverImage } from "@/actions/actions";
import { getSignedRequestForUpload } from "@/actions/supabase";
import { useDocument } from "@/hooks/use-document";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCoverImage } from "@/hooks/use-cover-image";
import { SingleImageDropzone } from "@/components/single-image-dropzone";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Document } from "@prisma/client";
import { startTransition, useState } from "react";
import { useParams } from "next/navigation";

export const CoverImageModal = () => {
  const params = useParams();
  const { user } = useCurrentUser();
  const coverImage = useCoverImage();
  const { handleUpdateDocument, selectedDocument } = useDocument();

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const uploadFile = async (file: File, signedUrl: string) => {
    try {
      const response = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Cache-Control": "max-age=2592000",
        },
      });

      if (!response.ok) {
        throw new Error(`File upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const onChange = async (file?: File) => {
    if (file) {
      setIsSubmitting(true);
      setFile(file);
      const bucket = "cover_image";
      const slug = user?.email as string;
      const id = params.documentId as Document["id"];
      try {
        if (selectedDocument?.coverImageUrl) {
          await deleteImage({
            bucket: bucket,
            slug: slug,
            id: id,
          });

          await removeCoverImage(id);
        }

        const res = await getSignedRequestForUpload({
          bucket,
          slug,
          id,
        });

        await uploadFile(file, res.signedUrl);

        startTransition(() => {
          handleUpdateDocument({
            id: id,
            coverImageUrl: res.url,
          });
        });
      } catch (error) {
        toast.error("Failed to upload cover image");
      }

      onClose();
    }
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  );
};
