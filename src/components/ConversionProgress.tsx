import { Check, Download, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import type { ConversionStatus, ConversionResult } from '../types';
import { formatFileSize } from '../types';

interface ConversionProgressProps {
  status: ConversionStatus;
  progress: number;
  statusText: string;
  result: ConversionResult | null;
  onReset: () => void;
  error: string | null;
}

export default function ConversionProgress({
  status,
  progress,
  statusText,
  result,
  onReset,
  error,
}: ConversionProgressProps) {
  if (status === 'idle') return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 light:border-gray-200 light:bg-gray-50">
      {/* Status Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {status === 'processing' && (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          )}
          {status === 'uploading' && (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          )}
          {status === 'ready' && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-3 w-3 text-emerald-400" />
            </div>
          )}
          {status === 'error' && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="h-3 w-3 text-red-400" />
            </div>
          )}
          <span className="text-sm font-medium text-white light:text-gray-900">
            {statusText}
          </span>
        </div>

        {status !== 'processing' && status !== 'uploading' && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-white/10 hover:text-white light:text-gray-500 light:hover:bg-gray-200 light:hover:text-gray-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'processing' || status === 'uploading') && (
        <div className="mb-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/5 light:bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-gray-500 light:text-gray-400">
            {progress}%
          </p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 light:border-red-200 light:bg-red-50">
          <p className="text-sm text-red-400 light:text-red-600">{error}</p>
        </div>
      )}

      {/* Ready State - Download Button */}
      {status === 'ready' && result && (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 light:border-emerald-200 light:bg-emerald-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300 light:text-emerald-700">
                  Conversion Complete!
                </p>
                <p className="mt-0.5 text-xs text-gray-500 light:text-gray-400">
                  {result.filename} • {formatFileSize(result.blob.size)}
                </p>
              </div>
            </div>
          </div>

          <a
            href={result.url}
            download={result.filename}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            Download {result.filename.split('.').pop()?.toUpperCase()}
          </a>
        </div>
      )}
    </div>
  );
}
