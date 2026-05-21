export type ConversionType =
  | 'jpg-to-pdf'
  | 'pdf-to-jpg'
  | 'jpg-to-png'
  | 'png-to-jpg'
  | 'jpg-to-jpeg'
  | 'jpeg-to-jpg'
  | 'video-to-mp3';

export interface ConversionOption {
  id: ConversionType;
  label: string;
  from: string[];
  to: string;
  acceptedFiles: string[];
  icon: string;
}

export interface FileState {
  file: File | null;
  preview: string | null;
  name: string;
  size: number;
  type: string;
  extension: string;
}

export type ConversionStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error';

export interface ConversionResult {
  blob: Blob;
  filename: string;
  url: string;
}

export const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    id: 'jpg-to-pdf',
    label: 'JPG → PDF',
    from: ['jpg', 'jpeg'],
    to: 'pdf',
    acceptedFiles: ['.jpg', '.jpeg'],
    icon: 'FileText',
  },
  {
    id: 'pdf-to-jpg',
    label: 'PDF → JPG',
    from: ['pdf'],
    to: 'jpg',
    acceptedFiles: ['.pdf'],
    icon: 'Image',
  },
  {
    id: 'jpg-to-png',
    label: 'JPG → PNG',
    from: ['jpg', 'jpeg'],
    to: 'png',
    acceptedFiles: ['.jpg', '.jpeg'],
    icon: 'Image',
  },
  {
    id: 'png-to-jpg',
    label: 'PNG → JPG',
    from: ['png'],
    to: 'jpg',
    acceptedFiles: ['.png'],
    icon: 'Image',
  },
  {
    id: 'jpg-to-jpeg',
    label: 'JPG → JPEG',
    from: ['jpg'],
    to: 'jpeg',
    acceptedFiles: ['.jpg'],
    icon: 'Image',
  },
  {
    id: 'jpeg-to-jpg',
    label: 'JPEG → JPG',
    from: ['jpeg'],
    to: 'jpg',
    acceptedFiles: ['.jpeg'],
    icon: 'Image',
  },
  {
    id: 'video-to-mp3',
    label: 'Video → MP3',
    from: ['mp4', 'webm', 'mov', 'avi'],
    to: 'mp3',
    acceptedFiles: ['.mp4', '.webm', '.mov', '.avi'],
    icon: 'Music',
  },
];

export const MAX_FILE_SIZES: Record<string, number> = {
  image: 15 * 1024 * 1024, // 15MB
  pdf: 20 * 1024 * 1024,   // 20MB
  video: 100 * 1024 * 1024, // 100MB
};

export function getFileCategory(type: string): 'image' | 'pdf' | 'video' | 'unknown' {
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('video/')) return 'video';
  return 'unknown';
}

export function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
