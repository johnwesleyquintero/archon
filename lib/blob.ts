"use server"

import { put, del, type PutBlobResult } from "@vercel/blob"
import { nanoid } from "nanoid"
import { getUser } from "@/lib/supabase/auth"

/**
 * Uploads a file to Vercel Blob Storage.
 * @param file The file to upload (e.g., from FormData).
 * @param pathname The desired path for the file in the blob store (e.g., "avatars/user-id/image.png").
 * @returns The result of the upload, including the URL.
 */
export async function uploadFileToBlob(file: File, pathname: string): Promise<PutBlobResult> {
  try {
    const blob = await put(pathname, file, {
      access: "public",
    })
    return blob
  } catch (error: any) {
    console.error("Error uploading file to Vercel Blob:", error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
}

/**
 * Deletes a file from Vercel Blob Storage.
 * @param url The URL of the file to delete.
 */
export async function deleteFileFromBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error: any) {
    console.error("Error deleting file from Vercel Blob:", error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Server Action to handle avatar upload and update user profile.
 * @param formData FormData containing the 'avatar' file.
 * @returns The updated profile URL or null if failed.
 */
export async function uploadAvatar(formData: FormData): Promise<string | null> {
  const user = await getUser()
  if (!user) {
    throw new Error("Authentication required to upload avatar.")
  }

  const file = formData.get("avatar") as File
  if (!file || file.size === 0) {
    console.warn("No avatar file provided for upload.")
    return null
  }

  const fileExtension = file.name.split(".").pop()
  const filename = `${user.id}/${nanoid()}.${fileExtension}` // Unique filename per user

  try {
    const blob = await uploadFileToBlob(file, `avatars/${filename}`)
    return blob.url
  } catch (error) {
    console.error("Failed to upload avatar:", error)
    throw error
  }
}

/**
 * Server Action to handle attachment upload for journal entries or goals.
 * @param formData FormData containing the 'attachment' file.
 * @param type 'journal' or 'goal' to categorize the attachment.
 * @returns The URL of the uploaded attachment or null if failed.
 */
export async function uploadAttachment(formData: FormData, type: "journal" | "goal"): Promise<string | null> {
  const user = await getUser()
  if (!user) {
    throw new Error("Authentication required to upload attachment.")
  }

  const file = formData.get("attachment") as File
  if (!file || file.size === 0) {
    console.warn("No attachment file provided for upload.")
    return null
  }

  const fileExtension = file.name.split(".").pop()
  const filename = `${user.id}/${type}/${nanoid()}.${fileExtension}` // Unique filename per user and type

  try {
    const blob = await uploadFileToBlob(file, `attachments/${filename}`)
    return blob.url
  } catch (error) {
    console.error("Failed to upload attachment:", error)
    throw error
  }
}
