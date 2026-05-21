import { useCallback, useState, useRef } from 'react';
import { Upload, File, X, Image as ImageIcon, FileText, Video, Music } from 'lucide-react';
import { formatFileSize, getExtension, getFileCategory } from '../types';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFiles?: string[];
  maxSize?: number;
  currentFile?: File | null;
  onClear?: () => void;
}

const categoryIcons: Record<string, typeof File> = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  audio: Music,
};

export default function Dropzone({
  onFileSelect,
  acceptedFiles,
  maxSize = 100 * 1024 * 1024,
  currentFile,
  onClear,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      if (acceptedFiles && acceptedFiles.length > 0) {
        const ext = '.' + getExtension(file.name);
        if (!acceptedFiles.includes(ext.toLowerCase())) {
          setError(
            `Invalid file type. Accepted: ${acceptedFiles.join(', ').toUpperCase()}`
          );
          return false;
        }
      }

      if (file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
        setError(`File too large. Maximum size: ${maxMB}MB`);
        return false;
      }

      return true;
    },
    [acceptedFiles, maxSize]
  );

  const processFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setPreview(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Show file preview if a file is selected
  if (currentFile) {
    const category = getFileCategory(currentFile.type);
    const Icon = categoryIcons[category] || File;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 light:border-indigo-300 light:from-indigo-50 light:to-purple-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear?.();
            setPreview(null);
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 transition-all hover:bg-red-500/20 hover:text-red-400"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-4">
          {/* Preview or Icon */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 light:bg-gray-100">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon className="h-8 w-8 text-indigo-400 light:text-indigo-500" />
            )}
          </div>

          {/* File Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white light:text-gray-900">
              {currentFile.name}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-300 light:bg-indigo-100 light:text-indigo-600">
                {getExtension(currentFile.name).toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 light:text-gray-400">
                {formatFileSize(currentFile.size)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
            : 'border-gray-700 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/5 light:border-gray-300 light:bg-gray-50 light:hover:border-indigo-400 light:hover:bg-indigo-50'
        }`}
      >
        {/* Animated background glow */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse" />
        )}

        <div className="relative z-10">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
              isDragging
                ? 'bg-indigo-500/20 scale-110'
                : 'bg-white/5 group-hover:bg-indigo-500/10 light:bg-gray-100 light:group-hover:bg-indigo-100'
            }`}
          >
            <Upload
              className={`h-7 w-7 transition-all duration-300 ${
                isDragging
                  ? 'text-indigo-400 -translate-y-0.5'
                  : 'text-gray-500 group-hover:text-indigo-400 light:text-gray-400 light:group-hover:text-indigo-500'
              }`}
            />
          </div>

          <p className="text-base font-semibold text-white light:text-gray-900">
            {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
          </p>
          <p className="mt-1.5 text-sm text-gray-500 light:text-gray-400">
            or{' '}
            <span className="text-indigo-400 underline underline-offset-2 light:text-indigo-500">
              browse files
            </span>
          </p>

          {acceptedFiles && acceptedFiles.length > 0 && (
            <p className="mt-3 text-xs text-gray-600 light:text-gray-400">
              Accepted: {acceptedFiles.map((f) => f.toUpperCase()).join(', ')}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={acceptedFiles?.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 light:border-red-200 light:bg-red-50">
          <p className="text-sm text-red-400 light:text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
