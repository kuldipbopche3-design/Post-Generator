
import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultDisplay from './components/ResultDisplay';
import { GeneratedCampaign, SocialPlatform, Theme, Language } from './types';
import { generateCampaignText, generatePlatformImage } from './services/geminiService';
import { Bot, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<Record<SocialPlatform, boolean>>({
    [SocialPlatform.LINKEDIN]: false,
    [SocialPlatform.TWITTER]: false,
    [SocialPlatform.INSTAGRAM]: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  // Theme and Language State
  const [theme, setTheme] = useState<Theme>('noir');
  const [language, setLanguage] = useState<Language>('english');

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const handleGenerateCampaign = async (topic: string, audience: string) => {
    setIsGeneratingText(true);
    setError(null);
    setCampaign(null);

    try {
      const result = await generateCampaignText(topic, audience, language);
      setCampaign(result);
    } catch (err) {
      setError('Failed to generate campaign content. Please try again.');
      console.error(err);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async (platform: SocialPlatform) => {
    if (!campaign) return;

    setIsGeneratingImage(prev => ({ ...prev, [platform]: true }));
    setError(null); // Clear previous errors
    
    try {
      const imagePrompt = campaign[platform].imagePrompt;
      // Returns an array of images
      const base64Images = await generatePlatformImage(platform, imagePrompt);
      
      setCampaign(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [platform]: {
            ...prev[platform],
            generatedImages: base64Images // Store array
          }
        };
      });
    } catch (err: any) {
      console.error(`Failed to generate images for ${platform}`, err);
      // Display the actual error message to the user for better debugging
      const errorMessage = err.message || `Failed to generate images for ${platform}. Please try again.`;
      setError(errorMessage);
    } finally {
      setIsGeneratingImage(prev => ({ ...prev, [platform]: false }));
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm mb-2">
            <Bot className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-[var(--text-primary)]">
            SocialGen <span className="text-[var(--accent)]">AI</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] font-light max-w-lg mx-auto">
            Create tailored, high-impact social media campaigns in seconds.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full mb-10">
          <InputSection 
            onGenerate={handleGenerateCampaign} 
            isLoading={isGeneratingText}
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-3xl mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        {campaign && (
          <div className="w-full">
            <ResultDisplay 
              data={campaign} 
              onGenerateImage={handleGenerateImage}
              isGeneratingImage={isGeneratingImage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
