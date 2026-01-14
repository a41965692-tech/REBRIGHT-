
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImage, generateVideo } from '../services/geminiService';
import { ImageGenOptions, VideoGenOptions } from '../types';

const VisualsView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [size, setSize] = useState<string>('1K');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null); 
    try {
      if (type === 'image') {
        const url = await generateImage({
          prompt,
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        });
        setResult(url);
      } else {
        const url = await generateVideo({
          prompt,
          aspectRatio: aspectRatio as any,
          resolution: '720p'
        });
        setResult(url);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate. Ensure you have a valid paid API key for Visuals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 scrollbar-hide h-full">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create Visuals</h1>
          <p className="text-gray-500">Cinematic AI engine for high-fidelity images and motion.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Generation Type</label>
              <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
                <button 
                  onClick={() => setType('image')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${type === 'image' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <i className="fas fa-image mr-2"></i> Image
                </button>
                <button 
                  onClick={() => setType('video')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${type === 'video' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <i className="fas fa-video mr-2"></i> Video
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '16:9', '9:16'].map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${aspectRatio === ratio ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {type === 'image' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resolution</label>
                    <div className="flex gap-2">
                      {['1K', '2K', '4K'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`flex-1 py-2 text-[10px] font-bold border rounded-lg transition-all ${size === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A neon holographic cat driving a cyberpunk vehicle at night..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[120px] resize-none"
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={loading || !prompt}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      <span>Generate {type === 'image' ? 'Image' : 'Video'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Preview Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full min-h-[400px] flex items-center justify-center p-4 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-indigo-600 font-bold mb-1">REBRIGHT is imagining...</p>
                      <p className="text-xs text-gray-400">This can take up to a minute for video.</p>
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {type === 'image' ? (
                      <img 
                        src={result} 
                        alt="Generated Preview" 
                        className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
                      />
                    ) : (
                      <video 
                        src={result} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-full rounded-2xl shadow-2xl"
                      />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <a 
                        href={result} 
                        download={`rebright-${Date.now()}`}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg text-gray-800 hover:text-indigo-600 transition-colors"
                      >
                        <i className="fas fa-download"></i>
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-300"
                  >
                    <i className="fas fa-sparkles text-6xl mb-4"></i>
                    <p className="font-medium">Enter a prompt to see the magic happen</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualsView;
