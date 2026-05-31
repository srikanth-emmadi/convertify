import { jsPDF } from 'jspdf';
import type { ConversionType, ConversionResult } from '../types';

// ─── Image to PDF (Maximum Quality) ──────────────────────────────
export async function convertImageToPDF(file: File): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) throw new Error('Could not get canvas context');

        // Disable smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);

        // Use PNG (lossless) as intermediate format — no quality loss
        const imgData = canvas.toDataURL('image/png');

        const orientation: 'landscape' | 'portrait' = width > height ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [width, height],
        });

        // Embed as PNG to avoid JPEG re-compression
        pdf.addImage(imgData, 'PNG', 0, 0, width, height, undefined, 'NONE');
        const blob = pdf.output('blob');
        const filename = file.name.replace(/\.[^.]+$/, '') + '.pdf';

        resolve({
          blob,
          filename,
          url: URL.createObjectURL(blob),
        });
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// ─── Generic Image Format Converter (Maximum Quality) ────────────
function convertImageFormat(
  file: File,
  mimeType: string,
  extension: string
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) throw new Error('Could not get canvas context');

        // Disable smoothing for exact pixel reproduction
        ctx.imageSmoothingEnabled = false;
        ctx.imageSmoothingQuality = 'high';

        // White background for JPEG (no transparency)
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Use maximum quality: 1.0 for JPEG, lossless for PNG
        const quality = mimeType === 'image/jpeg' ? 1.0 : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Conversion failed'));
              return;
            }
            const filename = file.name.replace(/\.[^.]+$/, '') + '.' + extension;
            resolve({
              blob,
              filename,
              url: URL.createObjectURL(blob),
            });
          },
          mimeType,
          quality
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function convertJPGToPNG(file: File): Promise<ConversionResult> {
  return convertImageFormat(file, 'image/png', 'png');
}

export async function convertPNGToJPG(file: File): Promise<ConversionResult> {
  return convertImageFormat(file, 'image/jpeg', 'jpg');
}

export async function convertJPGToJPEG(file: File): Promise<ConversionResult> {
  return convertImageFormat(file, 'image/jpeg', 'jpeg');
}

export async function convertJPEGToJPG(file: File): Promise<ConversionResult> {
  return convertImageFormat(file, 'image/jpeg', 'jpg');
}

// ─── PDF to JPG (High Resolution, Maximum Quality) ───────────────
export async function convertPDFToJPG(file: File): Promise<ConversionResult> {
  const pdfjsLib = await loadPDFJS();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    // Use native image decoder for better quality
    useSystemFonts: true,
  }).promise;

  const page = await pdf.getPage(1);

  // Use 3x scale for high-resolution output (300 DPI equivalent)
  const scale = 3.0;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Could not get canvas context');

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    // Maximum JPEG quality
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to render PDF page'));
          return;
        }
        const filename = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        resolve({
          blob,
          filename,
          url: URL.createObjectURL(blob),
        });
      },
      'image/jpeg',
      1.0 // Maximum quality
    );
  });
}

// ─── Video to MP3 (High Quality Audio) ───────────────────────────
export async function convertVideoToMP3(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ConversionResult> {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile } = await import('@ffmpeg/util');

  const ffmpeg = new FFmpeg();

  ffmpeg.on('progress', ({ progress }: { progress: number }) => {
    if (onProgress) {
      onProgress(Math.min(Math.round(progress * 100), 99));
    }
  });

  ffmpeg.on('log', ({ message }: { message: string }) => {
    console.log('FFmpeg:', message);
  });

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  const inputName = 'input' + getFileExtension(file.name);
  const outputName = 'output.mp3';

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // High quality MP3: 320kbps CBR (best quality)
  await ffmpeg.exec([
    '-i', inputName,
    '-vn',
    '-acodec', 'libmp3lame',
    '-b:a', '320k',
    '-ar', '48000',
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data as unknown as BlobPart], { type: 'audio/mpeg' });
  const filename = file.name.replace(/\.[^.]+$/, '') + '.mp3';

  await ffmpeg.deleteFile(inputName).catch(() => {});
  await ffmpeg.deleteFile(outputName).catch(() => {});

  return {
    blob,
    filename,
    url: URL.createObjectURL(blob),
  };
}

// ─── Helper: Load PDF.js from CDN ───────────────────────────────
async function loadPDFJS(): Promise<any> {
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(lib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
}

// ─── Helper: Convert URL to Blob URL for FFmpeg ─────────────────
async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const resp = await fetch(url);
  const buf = await resp.arrayBuffer();
  const blob = new Blob([buf], { type: mimeType });
  return URL.createObjectURL(blob);
}

// ─── Helper: Get file extension ─────────────────────────────────
function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop();
  return ext ? '.' + ext : '';
}

// ─── Main conversion router ─────────────────────────────────────
export async function convertFile(
  type: ConversionType,
  file: File,
  onProgress?: (pct: number) => void
): Promise<ConversionResult> {
  switch (type) {
    case 'jpg-to-pdf':
      return convertImageToPDF(file);
    case 'pdf-to-jpg':
      return convertPDFToJPG(file);
    case 'jpg-to-png':
      return convertJPGToPNG(file);
    case 'png-to-jpg':
      return convertPNGToJPG(file);
    case 'jpg-to-jpeg':
      return convertJPGToJPEG(file);
    case 'jpeg-to-jpg':
      return convertJPEGToJPG(file);
    case 'video-to-mp3':
      return convertVideoToMP3(file, onProgress);
    default:
      throw new Error('Unsupported conversion type');
  }
}
