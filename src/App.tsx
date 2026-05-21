import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import ConverterDashboard from './components/ConverterDashboard';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white transition-colors duration-300 light:bg-gray-50 light:text-gray-900">
      {/* Subtle background gradient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/[0.04] blur-[120px] light:hidden" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-purple-500/[0.03] blur-[100px] light:hidden" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="flex-1">
          <ConverterDashboard />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 light:border-gray-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-xs text-gray-600 light:text-gray-400">
              Built with React & Tailwind CSS • All conversions happen locally in your browser
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
