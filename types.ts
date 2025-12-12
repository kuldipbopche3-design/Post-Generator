
export interface ImagePrompt {
  description: string;
  style: string;
  colorPalette: string;
  overlayText?: string;
}

export interface PlatformContent {
  text: string;
  hashtags: string[];
  imagePrompt: ImagePrompt;
  generatedImages?: string[]; // Array of base64 strings
  isImageLoading?: boolean;
}

export interface GeneratedCampaign {
  topic: string;
  audience: string;
  linkedin: PlatformContent;
  twitter: PlatformContent;
  instagram: PlatformContent;
  groundingUrls: string[];
  language: string;
}

export interface SocialFormState {
  topic: string;
  audience: string;
}

export enum SocialPlatform {
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
}

export type Theme = 'noir' | 'light';
export type Language = 'english' | 'hindi';
