import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Shield,
  Zap,
  Clock,
  FileUp,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Music,
  CheckCircle2,
} from 'lucide-react';
import Dropzone from './Dropzone';
import ConversionProgress from './ConversionProgress';
import {
  CONVERSION_OPTIONS,
  type ConversionType,
  type ConversionOption,
  type FileState,
  type ConversionStatus,
  type ConversionResult,
  getExtension,
  MAX_FILE_SIZES,
  getFileCategory,
} from '../types';
import { convertFile } from '../utils/converters';

export default function ConverterDashboard() {
  const [selectedConversion, setSelectedConversion] = useState<ConversionType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    preview: null,
    name: '',
    size: 0,
    type: '',
    extension: '',
  });
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [convertCount, setConvertCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get available conversions based on uploaded file
  const availableConversions = useCallback((): ConversionOption[] => {
    if (!fileState.file) return CONVERSION_OPTIONS;
    const ext = getExtension(fileState.file.name);
    return CONVERSION_OPTIONS.filter((opt) => opt.from.includes(ext));
  }, [fileState.file]);

  // Auto-select conversion when file is uploaded
  useEffect(() => {
    if (fileState.file) {
      const available = availableConversions();
      if (available.length > 0 && !selectedConversion) {
        setSelectedConversion(available[0].id);
      }
      // If current selection is not available, reset
      if (available.length > 0 && selectedConversion) {
        const isValid = available.some((o) => o.id === selectedConversion);
        if (!isValid) {
          setSelectedConversion(available[0].id);
        }
      }
    }
  }, [fileState.file, availableConversions, selectedConversion]);

  const handleFileSelect = useCallback((file: File) => {
    setFileState({
      file,
      preview: null,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getExtension(file.name),
    });
    setStatus('idle');
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setFileState({
      file: null,
      preview: null,
      name: '',
      size: 0,
      type: '',
      extension: '',
    });
    setSelectedConversion(null);
    setStatus('idle');
    setProgress(0);
    setStatusText('');
    setError(null);
    setResult(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!fileState.file || !selectedConversion) return;

    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setStatusText('Processing your file...');
      setProgress(10);

      const conversionResult = await convertFile(
        selectedConversion,
        fileState.file,
        (pct) => {
          setProgress(pct);
          setStatusText(`Converting... ${pct}%`);
        }
      );

      setProgress(100);
      setStatusText('Ready to download!');
      setResult(conversionResult);
      setStatus('ready');
      setConvertCount((c) => c + 1);
    } catch (err: any) {
      console.error('Conversion error:', err);
      const message =
        err?.message || 'Conversion failed. Please try again with a different file.';

      // Check if it's a SharedArrayBuffer issue (FFmpeg.wasm)
      if (message.includes('SharedArrayBuffer') || message.includes('Cross-Origin')) {
        setError(
          'Video conversion requires special server headers (COOP/COEP). Please try with image files, or host this app with the proper headers.'
        );
      } else {
        setError(message);
      }
      setStatus('error');
      setStatusText('Conversion failed');
    }
  }, [fileState.file, selectedConversion]);

  const selectedOption = CONVERSION_OPTIONS.find((o) => o.id === selectedConversion);

  const features = [
    { icon: Shield, title: '100% Private', desc: 'Files never leave your browser' },
    { icon: Zap, title: 'Instant', desc: 'No upload wait times' },
    { icon: Clock, title: 'No Limits', desc: 'Convert as many files as you want' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero */}
      <div className="mb-8 text-center sm:mb-12">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 light:border-indigo-200 light:bg-indigo-50">
          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 light:text-indigo-500" />
          <span className="text-xs font-medium text-indigo-300 light:text-indigo-600">
            {convertCount > 0
              ? `${convertCount} file${convertCount > 1 ? 's' : ''} converted`
              : 'Free & Unlimited'}
          </span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white light:text-gray-900 sm:text-4xl">
          Convert your files{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent light:from-indigo-600 light:to-purple-600">
            instantly
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-400 light:text-gray-500 sm:text-base">
          No tracking. 100% secure. All conversions happen right in your browser.
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="rounded-3xl border border-white/10 bg-[#111627]/80 p-5 shadow-2xl backdrop-blur-xl sm:p-8 light:border-gray-200 light:bg-white light:shadow-gray-200/50">
        {/* Step 1: Select Conversion Type */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 light:text-gray-400">
            Step 1 — Choose Conversion
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => fileState.file && setDropdownOpen(!dropdownOpen)}
              disabled={!fileState.file}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all ${
                fileState.file
                  ? 'cursor-pointer border-white/10 bg-white/5 text-white hover:border-indigo-500/50 hover:bg-white/10 light:border-gray-200 light:bg-gray-50 light:text-gray-900 light:hover:border-indigo-300 light:hover:bg-indigo-50'
                  : 'cursor-not-allowed border-gray-800 bg-gray-900/50 text-gray-600 light:border-gray-200 light:bg-gray-100 light:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {selectedOption ? (
                  <>
                    {selectedOption.icon === 'FileText' && (
                      <FileText className="h-4 w-4 text-indigo-400 light:text-indigo-500" />
                    )}
                    {selectedOption.icon === 'Image' && (
                      <ImageIcon className="h-4 w-4 text-indigo-400 light:text-indigo-500" />
                    )}
                    {selectedOption.icon === 'Music' && (
                      <Music className="h-4 w-4 text-indigo-400 light:text-indigo-500" />
                    )}
                    <span>{selectedOption.label}</span>
                  </>
                ) : (
                  <span className="text-gray-500 light:text-gray-400">
                    Upload a file to see options
                  </span>
                )}
              </div>
              {fileState.file && (
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Dropdown */}
            {dropdownOpen && fileState.file && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#161B2E] shadow-2xl light:border-gray-200 light:bg-white">
                {availableConversions().map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedConversion(option.id);
                      setDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all ${
                      selectedConversion === option.id
                        ? 'bg-indigo-500/10 text-indigo-300 light:bg-indigo-50 light:text-indigo-600'
                        : 'text-gray-300 hover:bg-white/5 light:text-gray-700 light:hover:bg-gray-50'
                    }`}
                  >
                    {option.icon === 'FileText' && (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    {option.icon === 'Image' && (
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                    )}
                    {option.icon === 'Music' && (
                      <Music className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="font-medium">{option.label}</span>
                    {selectedConversion === option.id && (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-indigo-400 light:text-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Upload File */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500 light:text-gray-400">
            Step 2 — Upload File
          </label>
          <Dropzone
            onFileSelect={handleFileSelect}
            acceptedFiles={
              selectedOption?.acceptedFiles ||
              CONVERSION_OPTIONS.flatMap((o) => o.acceptedFiles)
            }
            maxSize={
              fileState.file
                ? MAX_FILE_SIZES[getFileCategory(fileState.file.type)] ||
                  MAX_FILE_SIZES.image
                : MAX_FILE_SIZES.image
            }
            currentFile={fileState.file}
            onClear={handleClear}
          />
        </div>

        {/* Step 3: Convert */}
        {fileState.file && selectedConversion && status === 'idle' && (
          <button
            onClick={handleConvert}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <FileUp className="h-4 w-4" />
            Convert to {selectedOption?.to.toUpperCase()}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* Progress / Result */}
        <ConversionProgress
          status={status}
          progress={progress}
          statusText={statusText}
          result={result}
          onReset={handleClear}
          error={error}
        />
      </div>

      {/* Supported Formats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {CONVERSION_OPTIONS.map((option) => (
          <div
            key={option.id}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 light:border-gray-100 light:bg-gray-50"
          >
            {option.icon === 'FileText' && (
              <FileText className="h-3.5 w-3.5 shrink-0 text-indigo-400/60 light:text-indigo-400" />
            )}
            {option.icon === 'Image' && (
              <ImageIcon className="h-3.5 w-3.5 shrink-0 text-indigo-400/60 light:text-indigo-400" />
            )}
            {option.icon === 'Music' && (
              <Music className="h-3.5 w-3.5 shrink-0 text-indigo-400/60 light:text-indigo-400" />
            )}
            <span className="text-[11px] font-medium text-gray-500 light:text-gray-500">
              {option.label}
            </span>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center light:border-gray-100 light:bg-gray-50"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 light:bg-indigo-50">
              <Icon className="h-5 w-5 text-indigo-400 light:text-indigo-500" />
            </div>
            <h3 className="text-sm font-semibold text-white light:text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-500 light:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
