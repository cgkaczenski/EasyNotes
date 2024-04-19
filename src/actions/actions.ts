"use server";

import { db } from "@/lib/db";
import { Document } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

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

export async function restoreDocument(documentId: Document["id"]) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to restore a document");
  }

  if (!documentId) {
    throw new Error("Document ID is required");
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
    throw new Error("You do not have permission to restore this document");
  }

  const recursiveRestore = async (documentId: Document["id"]) => {
    const documentIds = await getDocumentIdsRecursively(documentId);
    await db.document.updateMany({
      where: {
        id: {
          in: documentIds,
        },
      },
      data: {
        isArchived: false,
      },
    });

    const restoredDocuments = await db.document.findMany({
      where: {
        id: {
          in: documentIds,
        },
      },
    });

    for (const restoredDocument of restoredDocuments) {
      if (restoredDocument.parentDocumentId) {
        const parentDocument = await db.document.findUnique({
          where: {
            id: restoredDocument.parentDocumentId,
          },
        });

        if (!parentDocument) {
          continue;
        }

        if (parentDocument.isArchived) {
          await db.document.update({
            where: {
              id: restoredDocument.id,
            },
            data: {
              parentDocumentId: null,
            },
          });
        }
      }
    }
  };

  try {
    await recursiveRestore(documentId);
  } catch (error) {
    throw new Error("Failed to restore the document");
  }

  revalidatePath("/app", "layout");
}

export async function getTrash() {
  noStore();
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to view trash");
  }

  try {
    const documents = await db.document.findMany({
      where: {
        userId: user.id as string,
        isArchived: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return documents;
  } catch (error) {
    throw new Error("Failed to fetch trash");
  }
}

export async function deleteDocument(documentId: Document["id"]) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to delete trash");
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
    throw new Error("You do not have permission to delete this document");
  }

  try {
    await await db.document.delete({
      where: {
        id: documentId,
      },
    });
  } catch (error) {
    throw new Error("Failed to delete the document");
  }

  revalidatePath("/app", "layout");
}

export async function updateDocument({
  id,
  title,
  content,
  coverImageUrl,
  icon,
  isPublished,
}: {
  id: Document["id"];
  title?: Document["title"];
  content?: Document["content"];
  coverImageUrl?: Document["coverImageUrl"];
  icon?: Document["icon"];
  isPublished?: Document["isPublished"];
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to update a document");
  }

  const document = await db.document.findUnique({
    where: {
      id: id,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.userId !== user.id) {
    throw new Error("You do not have permission to update this document");
  }

  try {
    await db.document.update({
      where: {
        id: id,
      },
      data: {
        title: title ? title : document.title,
        content: content ? content : document.content,
        coverImageUrl: coverImageUrl ? coverImageUrl : document.coverImageUrl,
        icon: icon ? icon : document.icon,
        isPublished: isPublished ? isPublished : document.isPublished,
      },
    });
  } catch (error) {
    throw new Error("Failed to update the document");
  }

  revalidatePath("/app", "layout");
}

export async function removeCoverImage(id: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to delete a cover image");
  }

  try {
    await db.document.update({
      where: {
        id: id,
      },
      data: {
        coverImageUrl: null,
      },
    });
  } catch (error) {
    throw new Error("Failed to remove the cover image");
  }

  revalidatePath("/app", "layout");
}
