
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getAI, encode, decode, decodeAudioData } from '../services/geminiService';

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setError(null);
      const ai = getAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              // CRITICAL: Solely rely on sessionPromise resolves to send input.
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const b64 = msg.serverContent.modelTurn.parts[0].inlineData.data;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(b64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              // Track sources to allow interruption handling.
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              // Schedule playback at exact end of previous chunk.
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => setError("Audio connection failed."),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are REBRIGHT.ai in live voice mode. Be concise, human-like, and friendly. Support English and Hinglish seamlessly.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Microphone access denied or connection issue.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-indigo-900 text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="z-10 text-center max-w-md">
        <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] scale-110' : 'bg-white/10'}`}>
          <i className={`fas ${isActive ? 'fa-microphone' : 'fa-broadcast-tower'} text-4xl`}></i>
        </div>

        <h1 className="text-4xl font-bold mb-4">Live Voice</h1>
        <p className="text-indigo-200 mb-12 leading-relaxed">
          {isActive 
            ? "I'm listening. Speak naturally, I'll reply in real-time." 
            : "Connect to start a natural, low-latency voice conversation with REBRIGHT.ai."}
        </p>

        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>}

        {!isActive ? (
          <button 
            onClick={startSession}
            className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-xl hover:bg-indigo-50 transition-all transform active:scale-95"
          >
            Connect Now
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="px-10 py-4 bg-red-500 text-white font-bold rounded-2xl shadow-xl hover:bg-red-600 transition-all transform active:scale-95"
          >
            End Session
          </button>
        )}
      </div>

      {isActive && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-white rounded-full animate-[bounce_1s_infinite]"></div>
          <div className="w-1.5 h-10 bg-white rounded-full animate-[bounce_1.2s_infinite]"></div>
          <div className="w-1.5 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite]"></div>
          <div className="w-1.5 h-10 bg-white rounded-full animate-[bounce_1.1s_infinite]"></div>
          <div className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.9s_infinite]"></div>
        </div>
      )}
    </div>
  );
};

export default LiveView;
