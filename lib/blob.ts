"use server";

import { put, del } from "@vercel/blob";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export async function uploadFile(
  file: File,
  pathPrefix = "uploads",
): Promise<{ success: boolean; url: string; error?: Error }> {
  try {
    if (!file) {
      return { success: false, url: "", error: new Error("No file provided.") };
    }

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop();
    const filename = `${pathPrefix}/${nanoid()}.${fileExtension}`;

    const blob = await put(filename, file, {
      access: "public",
    });

    return { success: true, url: blob.url };
  } catch (err) {
    console.error("Vercel Blob upload error:", err);
    let errorToReturn: Error | undefined = undefined;
    if (err instanceof Error) {
      errorToReturn = err;
    } else {
      errorToReturn = new Error(String(err));
    }
    return { success: false, url: "", error: errorToReturn };
  }
}

export async function deleteFile(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await del(url);
    return { success: true };
  } catch (err) {
    console.error("Vercel Blob delete error:", err);
    let errorMessage: string | undefined = undefined;
    if (err instanceof Error) {
      errorMessage = err.message;
    } else {
      errorMessage = String(err);
    }
    return { success: false, error: errorMessage };
  }
}
