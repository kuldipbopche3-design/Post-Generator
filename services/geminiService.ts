
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GeneratedCampaign, SocialPlatform, Language } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Extracts content from a specific XML-style tag.
 */
function extractTag(input: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = input.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Parses the custom XML output from the model into the GeneratedCampaign structure.
 */
function parseXmlResponse(response: string): any {
  const platforms = ['linkedin', 'twitter', 'instagram'];
  const result: any = {};

  platforms.forEach(platform => {
    // Extract the platform block
    const platformBlock = extractTag(response, platform);
    
    if (!platformBlock) {
      result[platform] = {
        text: "",
        hashtags: [],
        imagePrompt: { description: "", style: "", colorPalette: "" }
      };
      return;
    }

    const text = extractTag(platformBlock, 'text');
    const hashtagsStr = extractTag(platformBlock, 'hashtags');
    const imageDesc = extractTag(platformBlock, 'imageDescription');
    const imageStyle = extractTag(platformBlock, 'imageStyle');
    const imagePalette = extractTag(platformBlock, 'imagePalette');

    // Parse hashtags
    const hashtags = hashtagsStr
      .split(/[\s,]+/) // Split by space or comma
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.trim());

    result[platform] = {
      text: text,
      hashtags: hashtags,
      imagePrompt: {
        description: imageDesc,
        style: imageStyle,
        colorPalette: imagePalette
      }
    };
  });

  return result;
}

/**
 * Generates the text content and image prompts for all platforms
 */
export const generateCampaignText = async (topic: string, audience: string, language: Language): Promise<GeneratedCampaign> => {
  const languageInstruction = language === 'hindi' 
    ? "IMPORTANT: Generate all post text, captions, and hashtags in Hindi (Devanagari script). However, keep the 'imagePrompt' contents in English." 
    : "Generate all content in English.";

  // We use XML tags to avoid JSON quote escaping issues
  const prompt = `
    Role: World-class Social Media Content Strategist.
    
    Task: Create a high-impact social media campaign for the topic: "${topic}" targeting: "${audience}".
    
    Language Requirement: ${languageInstruction}
    
    CORE WRITING RULES (Apply to all):
    1. ATTENTION: Start with a strong hook/question that grabs attention in the first 2 seconds.
    2. CLARITY: Use simple English. Avoid jargon. Highlight the key idea/benefit clearly.
    3. STRUCTURE: Hook -> Valuable Insight/Learning -> Clear Call-To-Action (CTA).
    4. TONE: Friendly yet formal. Professional but accessible.
    
    PLATFORM SPECIFICS:

    1. LINKEDIN:
       - Style: Professional, insightful, value-driven, clear.
       - Length: 120 - 300 words.
       - Content: Focus on expertise and industry value.
       - Hashtags: 3-6 professional tags.
       - Image Concept: Describe a scene that represents growth or professional success.

    2. INSTAGRAM:
       - Style: Friendly, visual, emotional, personal.
       - Length: 120 - 300 words.
       - Content: Focus on the "human" side or the emotional benefit.
       - Hashtags: 5-12 relevant tags.
       - Image Concept: Describe a highly aesthetic, visually storytelling scene.

    3. TWITTER (X):
       - Style: Punchy, concise, bold, scroll-stopping.
       - Structure: A short thread (3-5 tweets) OR one long-form post (max 280 chars per section).
       - Content: Cut the fluff. Get straight to the insight.
       - Hashtags: 3-6 relevant tags.
       - Image Concept: Describe a bold, high-contrast visual.

    OUTPUT FORMAT:
    Please wrap the response in specific XML tags exactly as shown below. Do not use markdown code blocks.
    
    <linkedin>
      <text>Put the full LinkedIn post text here.</text>
      <hashtags>#tag1 #tag2 #tag3</hashtags>
      <imageDescription>Description of the image.</imageDescription>
      <imageStyle>Professional, etc.</imageStyle>
      <imagePalette>Color palette description.</imagePalette>
    </linkedin>

    <twitter>
      <text>Put the full Twitter post/thread here.</text>
      <hashtags>#tag1 #tag2</hashtags>
      <imageDescription>Description of the image.</imageDescription>
      <imageStyle>Bold, etc.</imageStyle>
      <imagePalette>Color palette description.</imagePalette>
    </twitter>

    <instagram>
      <text>Put the full Instagram caption here.</text>
      <hashtags>#tag1 #tag2</hashtags>
      <imageDescription>Description of the image.</imageDescription>
      <imageStyle>Aesthetic, etc.</imageStyle>
      <imagePalette>Color palette description.</imagePalette>
    </instagram>
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const textResponse = response.text || "";
    
    // Parse the XML-like structure
    let parsedData;
    try {
      parsedData = parseXmlResponse(textResponse);
      
      // Basic validation to ensure we got data
      if (!parsedData.linkedin?.text && !parsedData.twitter?.text) {
        throw new Error("Empty parsed data");
      }
    } catch (e) {
      console.error("Failed to parse response", textResponse);
      throw new Error("Failed to generate valid campaign content. Please try again.");
    }

    // Extract grounding URLs if available
    const groundingUrls: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          groundingUrls.push(chunk.web.uri);
        }
      });
    }

    return {
      topic,
      audience,
      language,
      linkedin: { 
        text: parsedData.linkedin.text, 
        hashtags: parsedData.linkedin.hashtags, 
        imagePrompt: parsedData.linkedin.imagePrompt,
        generatedImages: [] 
      },
      twitter: { 
        text: parsedData.twitter.text, 
        hashtags: parsedData.twitter.hashtags, 
        imagePrompt: parsedData.twitter.imagePrompt,
        generatedImages: [] 
      },
      instagram: { 
        text: parsedData.instagram.text, 
        hashtags: parsedData.instagram.hashtags, 
        imagePrompt: parsedData.instagram.imagePrompt,
        generatedImages: [] 
      },
      groundingUrls,
    };
  } catch (error) {
    console.error("Error generating text content:", error);
    throw new Error("Failed to generate campaign content.");
  }
};

/**
 * Helper to call the API for image generation.
 */
async function callImageApi(platform: SocialPlatform, prompt: string, aspectRatio: string): Promise<string[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          numberOfImages: 1
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ]
      }
    });

    const validImages: string[] = [];
    const candidate = response.candidates?.[0];
    
    // Check finishReason specifically
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error("SAFETY_BLOCK");
    }

    for (const part of candidate?.content?.parts || []) {
      if (part.inlineData) {
        validImages.push(part.inlineData.data);
        break; // Take only one
      }
    }
    
    if (validImages.length === 0) {
      throw new Error("NO_IMAGE_RETURNED");
    }
    return validImages;
}

/**
 * Generates images for a specific platform based on the prompt.
 * Includes a fallback mechanism for safety filters.
 */
export const generatePlatformImage = async (
  platform: SocialPlatform,
  promptData: { description: string; style: string; colorPalette: string; overlayText?: string }
): Promise<string[]> => {
  
  const validAspectRatio = platform === SocialPlatform.INSTAGRAM ? "1:1" : "16:9";
  let lastError = "";

  // 1. Primary Attempt - Use a polished but safe style first
  const primaryStyle = "Digital art, modern illustrative style, clean composition, high quality";
  const primaryPrompt = `
      Create a social media image for ${platform}.
      Topic: ${promptData.description}
      Style: ${primaryStyle}
      Colors: ${promptData.colorPalette}
      Constraints: No text on image. Artistic and creative interpretation.
  `;

  try {
    return await callImageApi(platform, primaryPrompt, validAspectRatio);
  } catch (err: any) {
    console.warn("Primary image generation failed:", err.message);
    lastError = err.message;

    // If Rate Limit, fail immediately (don't retry to save quota/time)
    if (err.message?.includes('429') || err.status === 429 || err.code === 429) {
       throw new Error("Google API Limit Reached (429). Please wait 1-2 minutes before trying again.");
    }
  }

  // 2. Fallback Attempt - If Safety/Unknown error, try a very safe abstract prompt
  // Wait 1.5 second before retry to be gentle
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log("Attempting fallback image generation...");
  const safePrompt = `
      Create a minimal abstract vector illustration about: ${promptData.description}.
      Style: Flat vector art, geometric shapes, minimal.
      Colors: ${promptData.colorPalette}
      Constraints: No people, no realistic faces, no text.
  `;

  try {
    return await callImageApi(platform, safePrompt, validAspectRatio);
  } catch (fallbackErr: any) {
    console.error("Fallback image generation failed:", fallbackErr);
    
    if (fallbackErr.message?.includes('429') || fallbackErr.status === 429) {
      throw new Error("API Rate Limit Reached. Please wait a moment.");
    }
    
    if (lastError === "SAFETY_BLOCK" || fallbackErr.message === "SAFETY_BLOCK") {
       throw new Error("Image blocked by Safety Filter. The topic might be restricted (e.g., real people). Try a different topic.");
    }
    
    throw new Error(`Image generation failed: ${fallbackErr.message || lastError}`);
  }
};
