// Minor change to trigger Vercel rebuild
import { type NextRequest, NextResponse } from "next/server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

import { serverEnv } from "@/lib/env.server";
import { apiErrorResponse, AppError } from "@/lib/utils";

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

export async function POST(request: NextRequest) {
  try {
    // Validate BLOB_READ_WRITE_TOKEN
    if (!serverEnv.BLOB_READ_WRITE_TOKEN) {
      throw new AppError(
        "BLOB_READ_WRITE_TOKEN is not set.",
        "MISSING_BLOB_TOKEN", // Using a more specific error code
        {},
        500,
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      throw new AppError(
        "No file provided for upload.",
        "NO_FILE_PROVIDED",
        {},
        400,
      );
    }

    // Validate file type and size
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new AppError(
        `Invalid file type. Allowed types are: ${ALLOWED_FILE_TYPES.join(", ")}`,
        "INVALID_FILE_TYPE",
        {},
        400,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        "FILE_TOO_LARGE",
        {},
        400,
      );
    }

    // Create a unique filename with original extension
    const extension = file.name.split(".").pop();
    const uniqueFilename = `${folder}/${nanoid()}.${extension}`;

    // Upload to Vercel Blob
    const { url } = await put(uniqueFilename, file, {
      access: "public",
    });

    return NextResponse.json({ url, success: true });
  } catch (error) {
    return apiErrorResponse(error, "File Upload API");
  }
}
