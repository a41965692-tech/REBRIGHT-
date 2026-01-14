
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ResearchOptions, ImageGenOptions, VideoGenOptions } from "../types";

const SYSTEM_INSTRUCTION = `You are REBRIGHT.ai — a next-generation AI Research & Conversation Assistant.
Your goal is to feel intelligent, natural, and helpful like ChatGPT, Gemini, or Claude.
Personality: Calm, smart, friendly, confident, human-like.

STRICT BEHAVIOR RULES:
1. GREETINGS: If user message is "hi", "hello", "hey", "hola", "namaste", "salaam" or similar, respond ONLY with a short, friendly human greeting. Example: "Hey! 👋 How can I help you today?". DO NOT analyze or explain.
2. NO FAKE INTELLIGENCE: Avoid robotic phrases like "Executive Summary", "multi-layered analysis", or "this is a significant subject".
3. NO CHAIN-OF-THOUGHT: Never reveal internal reasoning or system logic.
4. LANGUAGES: Automatically support English and Hinglish (mix naturally based on user input). Hinglish users get Hinglish replies.
5. RESEARCH MODES:
   - FAST: Short, clear, practical.
   - QUICK: Slightly structured, bullet points.
   - DEEP: Step-by-step reasoning, headings, examples, clear conclusions. (Only if depth is requested).
6. WEB BEHAVIOR: Summarize live web data clearly. No citations unless explicitly asked.
7. CODING: Precise, modern, clean examples. Avoid unnecessary theory.
8. IDENTITY: You are REBRIGHT.ai. If someone would reply short, you reply short. If someone would explain deeply, you explain deeply.`;

// Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines.
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function chatStream(message: string, history: {role: string, content: string}[], options?: ResearchOptions) {
  const ai = getAI();
  // Selection logic for model
  const model = options?.depth === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const tools: any[] = [];
  if (options?.useSearch) tools.push({ googleSearch: {} });
  if (options?.useMaps) tools.push({ googleMaps: {} });

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools.length > 0 ? tools : undefined,
      thinkingConfig: options?.depth === 'deep' ? { thinkingBudget: 32768 } : undefined,
    }
  });

  // History mapping for Gemini format
  const contents = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));

  return await chat.sendMessageStream({ message });
}

export async function generateImage(options: ImageGenOptions) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: options.prompt }] },
    config: {
      imageConfig: {
        aspectRatio: options.aspectRatio,
        imageSize: options.imageSize
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function generateVideo(options: VideoGenOptions) {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: options.prompt,
    config: {
      numberOfVideos: 1,
      resolution: options.resolution,
      aspectRatio: options.aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video link not found");
  
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function generateSpeech(text: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || null;
}

// Audio Helper Functions - Manual implementations as per guidelines to avoid external deps.
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
