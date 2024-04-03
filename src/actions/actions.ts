"use server";

import { db } from "@/lib/db";
import { Document } from "@prisma/client";
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

export async function addDocument(
  documentTitle: Document["title"],
  parentId?: Document["parentDocumentId"]
) {
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

export async function archiveDocument(documentId: Document["id"]) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to archive a document");
  }

  const document = await db.document.findUnique({
    where: {
      id: documentId,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.userId !== user.id) {
    throw new Error("You do not have permission to archive this document");
  }

  const getDocumentIdsRecursively = async (
    documentId: Document["id"]
  ): Promise<Document["id"][]> => {
    const children = await db.document.findMany({
      where: {
        parentDocumentId: documentId,
      },
      select: {
        id: true,
      },
    });

    const childIds = children.map((child) => child.id);
    const nestedChildIds = await Promise.all(
      childIds.map((childId) => getDocumentIdsRecursively(childId))
    );

    return [documentId, ...childIds, ...nestedChildIds.flat()];
  };

  const recursiveArchive = async (documentId: Document["id"]) => {
    const documentIds = await getDocumentIdsRecursively(documentId);

    await db.document.updateMany({
      where: {
        id: {
          in: documentIds,
        },
      },
      data: {
        isArchived: true,
      },
    });
  };

  try {
    await recursiveArchive(documentId);
  } catch (error) {
    throw new Error("Failed to archive the document");
  }

  revalidatePath("/app", "layout");
}
