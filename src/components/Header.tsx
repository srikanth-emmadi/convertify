import { Moon, Sun, Link, Zap } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl dark:border-white/10 light:border-gray-200 light:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white light:text-gray-900">
              Convertify
            </h1>
            <p className="hidden text-[11px] font-medium uppercase tracking-widest text-gray-500 light:text-gray-400 sm:block">
              File Converter
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-white/10 hover:text-white light:text-gray-500 light:hover:bg-gray-100 light:hover:text-gray-900"
            title="GitHub"
          >
            <Link className="h-[18px] w-[18px]" />
          </a>
          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-white/10 hover:text-white light:text-gray-500 light:hover:bg-gray-100 light:hover:text-gray-900"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
