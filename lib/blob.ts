import { put, list, del } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadFile(file: File, folder = "general") {
  try {
    // Create a unique filename with original extension
    const extension = file.name.split(".").pop()
    const uniqueFilename = `${folder}/${nanoid()}.${extension}`

    // Upload to Vercel Blob
    const { url } = await put(uniqueFilename, file, {
      access: "public",
    })

    return { url, filename: uniqueFilename, success: true }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { error, success: false }
  }
}

export async function listFiles(prefix = "") {
  try {
    const { blobs } = await list({ prefix })
    return { blobs, success: true }
  } catch (error) {
    console.error("Error listing files:", error)
    return { error, success: false }
  }
}

export async function deleteFile(url: string) {
  try {
    await del(url)
    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { error, success: false }
  }
}
