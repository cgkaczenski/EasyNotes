"use server";

import { db } from "@/lib/db";
//import { Document } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getDocuments() {
  noStore();
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to view documents");
  }

  try {
    const documents = await db.document.findMany({
      where: {
        userId: user.id as string,
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documents;
  } catch (error) {
    throw new Error("Failed to fetch documents");
  }
}

export async function addDocument(documentTitle: string, parentId?: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to create a document");
  }

  try {
    await db.document.create({
      data: {
        title: documentTitle,
        userId: user.id as string,
        parentDocumentId: parentId ? parentId : undefined,
      },
    });
  } catch (error) {
    throw new Error("Failed to create a document");
  }

  revalidatePath("/app", "layout");
}
