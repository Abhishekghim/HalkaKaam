/**
 * Offscreen HTML5 Canvas Image Compression & Format Fallback Utility
 * Downscales and compresses user-uploaded images (KYC IDs, task photos, chat attachments)
 * to prevent localStorage 5MB QuotaExceededError and main-thread JSON serialization stalls.
 */

export interface ImageCompressOptions {
  /** Maximum width in pixels (aspect ratio preserved). Default: 1024 */
  maxWidth?: number;
  /** Maximum height in pixels (aspect ratio preserved). Default: 1024 */
  maxHeight?: number;
  /** Target encoder quality between 0.1 and 1.0. Default: 0.72 */
  quality?: number;
  /** Preferred MIME type with automatic fallback to image/jpeg. Default: 'image/webp' */
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

/**
 * Checks whether the current browser canvas implementation supports encoding to a given MIME type.
 */
function supportsCanvasMimeType(canvas: HTMLCanvasElement, mimeType: string): boolean {
  try {
    const testUrl = canvas.toDataURL(mimeType, 0.5);
    return testUrl.startsWith(`data:${mimeType}`);
  } catch (err) {
    console.warn(`[image-compress] MIME type ${mimeType} probe failed:`, err);
    return false;
  }
}

/**
 * Compresses a browser File or Blob into a compact Base64 Data URL using an offscreen Canvas.
 * Automatically falls back from `image/webp` to `image/jpeg` on older WebKit/Safari engines,
 * and falls back to a raw FileReader Data URL if Canvas 2D is unavailable.
 */
export async function compressImageFile(
  file: File | Blob,
  options: ImageCompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.72,
    mimeType = 'image/webp',
  } = options;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('[image-compress] compressImageFile must be executed in a browser environment.');
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        const naturalWidth = img.naturalWidth || img.width || 1;
        const naturalHeight = img.naturalHeight || img.height || 1;

        const widthRatio = maxWidth / naturalWidth;
        const heightRatio = maxHeight / naturalHeight;
        const scale = Math.min(1, widthRatio, heightRatio);

        const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
        const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D rendering context is unavailable.');
        }

        // Fill white background when exporting opaque formats to avoid black transparent pixels
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const targetMime = supportsCanvasMimeType(canvas, mimeType)
          ? mimeType
          : 'image/jpeg';

        const compressedDataUrl = canvas.toDataURL(targetMime, quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.error('[image-compress] Canvas compression failed, falling back to FileReader:', err);
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => {
          if (typeof fallbackReader.result === 'string') {
            resolve(fallbackReader.result);
          } else {
            reject(new Error('[image-compress] FileReader fallback produced an empty result.'));
          }
        };
        fallbackReader.onerror = (readErr) => {
          console.error('[image-compress] FileReader fallback failed:', readErr);
          reject(new Error('[image-compress] Failed to read image file.'));
        };
        fallbackReader.readAsDataURL(file);
      }
    };

    img.onerror = (imgErr) => {
      URL.revokeObjectURL(objectUrl);
      console.error('[image-compress] Image decode error:', imgErr);
      reject(new Error('[image-compress] Unable to decode the provided image file.'));
    };

    img.src = objectUrl;
  });
}

