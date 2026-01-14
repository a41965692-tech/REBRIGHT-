
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ResearchView from './components/ResearchView';
import VisualsView from './components/VisualsView';
import LiveView from './components/LiveView';
import ProfileView from './components/ProfileView';
import ApiManagementView from './components/ApiManagementView';
import LoginView from './components/LoginView';
import { AppView, User } from './types';
import { storage } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.CHAT);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = () => {
    storage.setUser(null);
    setUser(null);
    setView(AppView.CHAT);
  };

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LoginView onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased">
      <Sidebar currentView={currentView} setView={setView} user={user} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {currentView === AppView.CHAT && <ChatView />}
            {currentView === AppView.RESEARCH && <ResearchView />}
            {currentView === AppView.VISUALS && <VisualsView />}
            {currentView === AppView.LIVE && <LiveView />}
            {currentView === AppView.PROFILE && <ProfileView user={user} onLogout={handleLogout} />}
            {currentView === AppView.API_KEYS && <ApiManagementView />}
            {currentView === AppView.SETTINGS && (
              <div className="p-8 h-full overflow-y-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
                <div className="max-w-2xl space-y-8">
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      REBRIGHT.ai uses the Gemini API. For Pro features like Deep Research, 2K/4K Images, and Veo Video, you may need a paid API key.
                    </p>
                    <button 
                      onClick={async () => {
                        // @ts-ignore
                        if (window.aistudio && window.aistudio.openSelectKey) {
                          // @ts-ignore
                          await window.aistudio.openSelectKey();
                        } else {
                          alert("API Key selection is only available in the AI Studio environment.");
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Manage API Keys
                    </button>
                  </section>
                  
                  <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Identity</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">R</div>
                      <div>
                        <p className="font-bold text-gray-800">REBRIGHT.ai</p>
                        <p className="text-sm text-gray-400">Version 2.5.0-ultra</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
