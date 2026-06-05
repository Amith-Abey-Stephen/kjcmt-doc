import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { getExtensionFromBuffer } from "./pdf";

// Configure Cloudinary only if credentials are set
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Sanitizes a student's name for use in filenames.
 */
export function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "") // remove special characters
    .replace(/[\s-]+/g, "_"); // replace spaces and hyphens with single underscore
}

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a file (provided as buffer) to Cloudinary or falls back to local storage.
 */
export async function uploadCertificate(
  fileBuffer: Buffer,
  formId: string,
  studentName: string,
  index: number
): Promise<UploadResult> {
  const sanitizedStudent = sanitizeName(studentName);
  const ext = getExtensionFromBuffer(fileBuffer);
  const filename = `${sanitizedStudent}_${index}`;
  const folderPath = `kjcmt-doc/form_${formId}`;
  
  if (isCloudinaryConfigured) {
    try {
      const isPdf = ext === "pdf";
      // Cloudinary upload using stream-promise wrapper
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            public_id: filename,
            resource_type: isPdf ? "raw" : "image",
            format: !isPdf ? ext : "pdf",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload failed, falling back to local storage:", error);
    }
  }

  // Local Storage Fallback
  const localDir = path.join(process.cwd(), "public", "uploads", `form_${formId}`);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const localPath = path.join(localDir, `${filename}.${ext}`);
  fs.writeFileSync(localPath, fileBuffer);

  const relativeUrl = `/uploads/form_${formId}/${filename}.${ext}`;
  return {
    url: relativeUrl,
    publicId: `local/form_${formId}/${filename}`,
  };
}

/**
 * Deletes a certificate from Cloudinary or local storage.
 */
export async function deleteCertificate(publicId: string, url: string): Promise<boolean> {
  if (publicId.startsWith("local/")) {
    try {
      const relativePath = url.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    } catch (e) {
      console.error("Local file deletion failed:", e);
    }
    return false;
  }

  if (isCloudinaryConfigured) {
    try {
      const isPdf = url.toLowerCase().endsWith(".pdf");
      const result = await cloudinary.uploader.destroy(publicId, { 
        resource_type: isPdf ? "raw" : "image" 
      });
      return result.result === "ok";
    } catch (e) {
      console.error("Cloudinary file deletion failed:", e);
    }
  }
  return false;
}
