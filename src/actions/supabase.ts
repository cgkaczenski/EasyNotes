"use server";

import { currentUser } from "@/lib/auth";
import { StorageClient } from "@supabase/storage-js";
import { unstable_noStore as noStore } from "next/cache";

const supabase = new StorageClient(process.env.STORAGE_URL as string, {
  apikey: process.env.SERVICE_KEY as string,
  Authorization: `Bearer ${process.env.SERVICE_KEY}`,
});

type StorageResponse = {
  signedUrl: string;
  token: string;
  path: string;
  url?: string;
};

export async function getSignedRequestForUpload({
  bucket,
  slug,
  id,
}: {
  bucket: string;
  slug: string;
  id: string;
}) {
  noStore();
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to upload a file");
  }

  try {
    const newFilePath = `${slug}/${id}`;
    const { data, error } = await supabase
      .from(bucket)
      .createSignedUploadUrl(newFilePath);

    const publicUrlResponse = supabase.from(bucket).getPublicUrl(newFilePath);

    const response = {
      ...data,
      url: publicUrlResponse.data.publicUrl,
    } as StorageResponse;

    if (error) {
      throw error;
    }

    return response;
  } catch (error) {
    throw new Error("Failed to get signed request for upload");
  }
}

export async function deleteImage({
  bucket,
  slug,
  id,
}: {
  bucket: string;
  slug: string;
  id: string;
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to upload a file");
  }

  const { data, error } = await supabase.from(bucket).remove([`${slug}/${id}`]);

  if (error) {
    throw error;
  }

  return data;
}
