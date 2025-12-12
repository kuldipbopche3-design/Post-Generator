
import React, { useState } from 'react';
import { GeneratedCampaign, SocialPlatform } from '../types';
import { Linkedin, Twitter, Instagram, Image as ImageIcon, Copy, Check, RefreshCw, ExternalLink, Download } from 'lucide-react';

interface ResultDisplayProps {
  data: GeneratedCampaign;
  onGenerateImage: (platform: SocialPlatform) => void;
  isGeneratingImage: Record<SocialPlatform, boolean>;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onGenerateImage, isGeneratingImage }) => {
  const [activeTab, setActiveTab] = useState<SocialPlatform>(SocialPlatform.LINKEDIN);
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const activeContent = data[activeTab];
  const imageCount = activeContent.generatedImages?.length || 0;

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case SocialPlatform.LINKEDIN: return <Linkedin className="w-4 h-4" />;
      case SocialPlatform.TWITTER: return <Twitter className="w-4 h-4" />;
      case SocialPlatform.INSTAGRAM: return <Instagram className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Platform Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-color)]">
          {(Object.values(SocialPlatform) as SocialPlatform[]).map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === platform
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)]'
              }`}
            >
              {getPlatformIcon(platform)}
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Content Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-serif font-medium text-[var(--text-primary)]">
              Post Content
            </h3>
            <button
              onClick={() => handleCopy(`${activeContent.text}\n\n${activeContent.hashtags.join(' ')}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-input)] hover:bg-[var(--border-color)] rounded-md transition-colors"
            >
              {copiedText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedText ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex-grow space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            <div className="whitespace-pre-wrap text-[var(--text-primary)] leading-7 font-light text-base">
              {activeContent.text}
            </div>
            
            <div className="pt-4 border-t border-[var(--border-color)]">
               <div className="flex flex-wrap gap-2">
                {activeContent.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-[var(--accent)] bg-[var(--bg-input)] px-2.5 py-1 rounded-md text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visuals Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-color)]">
            <h3 className="text-lg font-serif font-medium text-[var(--text-primary)]">
              Visuals
            </h3>
            {imageCount > 0 && (
              <span className="px-2 py-0.5 bg-[var(--bg-input)] rounded text-[10px] font-bold uppercase text-[var(--text-secondary)]">
                {imageCount} {imageCount === 1 ? 'Option' : 'Options'}
              </span>
            )}
          </div>

          <div className="flex-grow flex flex-col gap-4">
            
            {/* Gallery */}
            <div className="flex-grow">
              {imageCount > 0 ? (
                <div className={`grid gap-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar ${imageCount === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-2'}`}>
                  {activeContent.generatedImages?.map((imgBase64, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-[var(--border-color)] aspect-square md:aspect-auto">
                      <img
                        src={`data:image/png;base64,${imgBase64}`}
                        alt={`Variation ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <a 
                           href={`data:image/png;base64,${imgBase64}`} 
                           download={`${activeTab}-variation-${index+1}.png`}
                           className="bg-white/90 text-black px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-white flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all"
                         >
                           <Download className="w-3 h-3" />
                         </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-input)]/50">
                  <ImageIcon className="w-10 h-10 text-[var(--text-secondary)] mb-3 opacity-50" />
                  <p className="text-[var(--text-secondary)] text-sm mb-5 text-center px-4">
                    Ready to generate visuals for this post?
                  </p>
                  <button
                    onClick={() => onGenerateImage(activeTab)}
                    disabled={isGeneratingImage[activeTab]}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isGeneratingImage[activeTab] ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Create Image
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      {data.groundingUrls.length > 0 && (
        <div className="flex items-center gap-2 justify-center pt-6 border-t border-[var(--border-color)]">
          <ExternalLink className="w-3 h-3 text-[var(--text-secondary)]" />
          <div className="flex gap-3 overflow-x-auto pb-1 max-w-full">
            {data.groundingUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors truncate max-w-[150px]"
              >
                {new URL(url).hostname}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
