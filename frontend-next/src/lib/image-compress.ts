/**
 * Facebook-Style Smart Offscreen Canvas Image Compression Utility
 * - Preserves crisp visual quality while compressing high-resolution photos (e.g. 12MP/4K phone photos)
 *   down to an optimal HD dimension (1600px max edge) and target byte budget (~240 KB).
 * - Uses progressive 2x step-down canvas resampling for high-res images to prevent jagged aliasing.
 * - Automatically falls back from `image/webp` to `image/jpeg` on older engines.
 */

export interface ImageCompressOptions {
  /** Maximum longest edge in pixels (aspect ratio preserved). Default: 1600 (Facebook HD standard) */
  maxWidth?: number;
  /** Maximum height in pixels (aspect ratio preserved). Default: 1600 */
  maxHeight?: number;
  /** Initial encoder quality between 0.1 and 1.0. Default: 0.82 */
  quality?: number;
  /** Target maximum output size in bytes before adaptive quality step-down. Default: 260_000 (~250 KB) */
  maxBytes?: number;
  /** Preferred MIME type with automatic fallback to image/jpeg. Default: 'image/webp' */
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

function supportsCanvasMimeType(canvas: HTMLCanvasElement, mimeType: string): boolean {
  try {
    const testUrl = canvas.toDataURL(mimeType, 0.5);
    return testUrl.startsWith(`data:${mimeType}`);
  } catch {
    return false;
  }
}

/** Estimates decoded byte size of a Base64 Data URL */
function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  const base64Length = commaIdx >= 0 ? dataUrl.length - commaIdx - 1 : dataUrl.length;
  return Math.round((base64Length * 3) / 4);
}

/**
 * Progressive step-down resampling (halving dimensions until close to target)
 * so 4000px+ camera photos downscale smoothly like Facebook/Instagram without moiré aliasing.
 */
function drawSteppedDown(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let curW = img.naturalWidth || img.width || targetWidth;
  let curH = img.naturalHeight || img.height || targetHeight;

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d');
  if (!finalCtx) return finalCanvas;

  finalCtx.fillStyle = '#FFFFFF';
  finalCtx.fillRect(0, 0, targetWidth, targetHeight);
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';

  // If image is more than 2x larger than target, step down in halves first
  if (curW > targetWidth * 2.1 || curH > targetHeight * 2.1) {
    let stepCanvas = document.createElement('canvas');
    curW = Math.max(targetWidth, Math.round(curW * 0.5));
    curH = Math.max(targetHeight, Math.round(curH * 0.5));
    stepCanvas.width = curW;
    stepCanvas.height = curH;

    const stepCtx = stepCanvas.getContext('2d');
    if (stepCtx) {
      stepCtx.imageSmoothingEnabled = true;
      stepCtx.imageSmoothingQuality = 'high';
      stepCtx.drawImage(img, 0, 0, curW, curH);

      while (curW > targetWidth * 2.1 || curH > targetHeight * 2.1) {
        const nextW = Math.max(targetWidth, Math.round(curW * 0.5));
        const nextH = Math.max(targetHeight, Math.round(curH * 0.5));
        const nextCanvas = document.createElement('canvas');
        nextCanvas.width = nextW;
        nextCanvas.height = nextH;
        const nextCtx = nextCanvas.getContext('2d');
        if (!nextCtx) break;
        nextCtx.imageSmoothingEnabled = true;
        nextCtx.imageSmoothingQuality = 'high';
        nextCtx.drawImage(stepCanvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
        stepCanvas = nextCanvas;
        curW = nextW;
        curH = nextH;
      }

      finalCtx.drawImage(stepCanvas, 0, 0, curW, curH, 0, 0, targetWidth, targetHeight);
      return finalCanvas;
    }
  }

  finalCtx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return finalCanvas;
}

export async function compressImageFile(
  file: File | Blob,
  options: ImageCompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    maxBytes = 260_000,
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

        const canvas = drawSteppedDown(img, targetWidth, targetHeight);

        const targetMime = supportsCanvasMimeType(canvas, mimeType)
          ? mimeType
          : 'image/jpeg';

        // If original file is already small (< 180 KB) and didn't need downscaling, use higher quality
        let currentQuality = file.size < 180_000 && scale === 1 ? Math.max(quality, 0.88) : quality;
        let compressedDataUrl = canvas.toDataURL(targetMime, currentQuality);

        // Adaptive quality step-down: only compress further if still above maxBytes budget
        while (estimateDataUrlBytes(compressedDataUrl) > maxBytes && currentQuality > 0.56) {
          currentQuality = Number((currentQuality - 0.08).toFixed(2));
          compressedDataUrl = canvas.toDataURL(targetMime, currentQuality);
        }

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
        fallbackReader.onerror = () => {
          reject(new Error('[image-compress] Failed to read image file.'));
        };
        fallbackReader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('[image-compress] Unable to decode the provided image file.'));
    };

    img.src = objectUrl;
  });
}
