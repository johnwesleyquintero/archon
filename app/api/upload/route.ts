// Minor change to trigger Vercel rebuild
import { type NextRequest, NextResponse } from "next/server";

import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

import { serverEnv } from "@/lib/env.server";
import { apiErrorResponse, AppError } from "@/lib/utils";

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
