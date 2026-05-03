import { Globe } from 'lucide-react';
import type { Language } from '../types';

interface LanguagePickerProps {
  language: Language;
  onChange: (lang: Language) => void;
}

export function LanguagePicker({ language, onChange }: LanguagePickerProps) {
  const toggle = () => onChange(language === 'en' ? 'hi' : 'en');

  return (
    <button
      id="language-toggle"
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:border-saffron-500/40 hover:text-white hover:bg-saffron-500/5 transition-all duration-200"
      aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      title={language === 'en' ? 'Switch to Hindi / हिंदी में बदलें' : 'Switch to English'}
    >
      <Globe size={15} className="text-saffron-500" />
      <span className="hidden sm:inline">
        {language === 'en' ? 'हिंदी' : 'English'}
      </span>
      <span className="sm:hidden">
        {language === 'en' ? 'HI' : 'EN'}
      </span>
    </button>
  );
}
