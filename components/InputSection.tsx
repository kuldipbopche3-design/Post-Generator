
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Target, Hash, Settings2, Moon, Sun, Languages, ChevronDown } from 'lucide-react';
import { Theme, Language } from '../types';

interface InputSectionProps {
  onGenerate: (topic: string, audience: string) => void;
  isLoading: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  onGenerate, 
  isLoading,
  theme,
  setTheme,
  language,
  setLanguage
}) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic && audience) {
      onGenerate(topic, audience);
    }
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLanguageOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Settings Bar */}
      <div className="flex justify-end mb-4 gap-2">
        <button 
          onClick={() => setTheme(theme === 'noir' ? 'light' : 'noir')}
          className="p-2 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] transition-colors"
          title="Toggle Theme"
        >
          {theme === 'noir' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <div className="relative" ref={languageRef}>
           <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-medium uppercase tracking-wider transition-colors"
          >
            <Languages className="w-4 h-4" />
            <span>{language}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLanguageOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
               <button 
                 onClick={() => handleLanguageSelect('english')} 
                 className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                   language === 'english' 
                     ? 'bg-[var(--bg-input)] text-[var(--accent)] font-semibold' 
                     : 'text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                 }`}
               >
                 English
               </button>
               <button 
                 onClick={() => handleLanguageSelect('hindi')} 
                 className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                   language === 'hindi' 
                     ? 'bg-[var(--bg-input)] text-[var(--accent)] font-semibold' 
                     : 'text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
                 }`}
               >
                 Hindi
               </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 md:p-8 shadow-sm transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
              <Hash className="w-3 h-3 text-[var(--accent)]" />
              What's the topic?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Sustainable Fashion, AI in Healthcare..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-color)] transition-all font-light"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">
              <Target className="w-3 h-3 text-[var(--accent)]" />
              Who is this for?
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Gen Z, Tech Founders, Foodies..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-color)] transition-all font-light"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic || !audience}
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg font-medium text-sm tracking-wide transition-all duration-300 ${
              isLoading || !topic || !audience
                ? 'bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-not-allowed'
                : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Crafting Content...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Campaign</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputSection;
