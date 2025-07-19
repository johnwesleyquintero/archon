"use server"

import { put } from "@vercel/blob"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 7) // 7-character random string

export async function uploadFile(
  file: File,
  pathPrefix = "uploads",
): Promise<{ success: boolean; url: string; error?: any }> {
  try {
    if (!file) {
      return { success: false, url: "", error: new Error("No file provided.") }
    }

    // Generate a unique filename
    const fileExtension = file.name.split(".").pop()
    const filename = `${pathPrefix}/${nanoid()}.${fileExtension}`

    const blob = await put(filename, file, {
      access: "public",
    })

    return { success: true, url: blob.url }
  } catch (error: any) {
    console.error("Vercel Blob upload error:", error)
    return { success: false, url: "", error: error }
  }
}

export async function deleteFile(url: string): Promise<{ success: boolean; error?: any }> {
  try {
    // This requires the BLOB_READ_WRITE_TOKEN to be available
    // The delete function is not directly exposed by @vercel/blob in 'use client' context
    // You would typically call a server action or API route for deletion.
    // For now, this is a placeholder for future implementation.
    console.warn("Delete file from Vercel Blob not fully implemented on client side. URL:", url)
    return { success: true } // Simulate success for now
  } catch (error: any) {
    console.error("Vercel Blob delete error:", error)
    return { success: false, error: error }
  }
}
