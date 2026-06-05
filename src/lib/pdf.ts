import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

/**
 * Detects the file format extension based on the first bytes (magic numbers) of the buffer.
 */
export function getExtensionFromBuffer(buffer: Buffer): string {
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "png";
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  return "pdf"; // Default fallback
}

/**
 * Converts a JPG/PNG image buffer into a single-page PDF document scaled to A4 dimensions.
 */
async function convertImageToPdf(imageBuffer: Buffer, ext: string): Promise<PDFDocument> {
  const tempPdf = await PDFDocument.create();
  let embeddedImage;

  if (ext === "png") {
    embeddedImage = await tempPdf.embedPng(imageBuffer);
  } else {
    embeddedImage = await tempPdf.embedJpg(imageBuffer);
  }

  // Standard A4 dimensions in PDF points (72 points/inch)
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;

  const { width: imgWidth, height: imgHeight } = embeddedImage.scale(1);

  // Calculate scaling factor to fit within A4 boundaries while preserving aspect ratio
  const widthRatio = A4_WIDTH / imgWidth;
  const heightRatio = A4_HEIGHT / imgHeight;
  const scaleFactor = Math.min(widthRatio, heightRatio, 1); // Do not upscale beyond source resolution

  const printWidth = imgWidth * scaleFactor;
  const printHeight = imgHeight * scaleFactor;

  // Center image on A4 page
  const page = tempPdf.addPage([A4_WIDTH, A4_HEIGHT]);
  const x = (A4_WIDTH - printWidth) / 2;
  const y = (A4_HEIGHT - printHeight) / 2;

  page.drawImage(embeddedImage, {
    x,
    y,
    width: printWidth,
    height: printHeight,
  });

  return tempPdf;
}

/**
 * Fetches a file buffer from either a remote URL or the local filesystem.
 */
export async function fetchPdfBuffer(pdfPath: string): Promise<Buffer> {
  if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
    const response = await fetch(pdfPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch remote asset: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Local filesystem pathway
  const relativePath = pdfPath.replace(/^\//, "");
  const fullPath = path.join(process.cwd(), "public", relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Local file not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath);
}

interface MergeAndCompressOptions {
  compressionMode: "low" | "medium" | "high";
}

/**
 * Merges multiple PDF/Image buffers into a single PDF, stripping metadata and compressing assets.
 */
export async function mergeAndCompressPdfs(
  pdfPaths: string[],
  options: MergeAndCompressOptions
): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();
  
  // Set minimal metadata (remove original creator information)
  mergedPdf.setCreator("KJCMT DOC Platform");
  mergedPdf.setProducer("KJCMT DOC PDF Engine");
  mergedPdf.setTitle("Final Certificate Bundle");

  let pagesAdded = 0;

  for (const pdfPath of pdfPaths) {
    try {
      const buffer = await fetchPdfBuffer(pdfPath);
      const ext = getExtensionFromBuffer(buffer);
      
      let srcPdf: PDFDocument;
      if (ext === "jpg" || ext === "png") {
        srcPdf = await convertImageToPdf(buffer, ext);
      } else {
        srcPdf = await PDFDocument.load(buffer);
      }

      const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
        pagesAdded++;
      });
    } catch (err) {
      console.error(`Error processing asset in merger: ${pdfPath}`, err);
      // Skip corrupt files and continue merging others
    }
  }

  if (pagesAdded === 0) {
    throw new Error("No valid PDF pages or images were found or merged.");
  }

  // Apply saving options based on compression levels
  let savedBytes: Uint8Array;
  if (options.compressionMode === "low") {
    savedBytes = await mergedPdf.save({
      useObjectStreams: false,
    });
  } else {
    // Medium and High compression
    savedBytes = await mergedPdf.save({
      useObjectStreams: true,
      updateFieldAppearances: true,
    });
  }

  return Buffer.from(savedBytes);
}
