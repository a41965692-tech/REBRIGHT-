
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiKey } from '../types';
import { storage } from '../services/storageService';

const ApiManagementView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    setKeys(storage.getApiKeys());
  }, []);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const keyString = `rb_${Math.random().toString(36).substr(2, 32)}`;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: keyString,
      createdAt: Date.now(),
      usageCount: 0,
      status: 'active'
    };
    storage.saveApiKey(newKey);
    setKeys(storage.getApiKeys());
    setJustCreatedKey(keyString);
    setNewKeyName('');
    setShowModal(true);
  };

  const handleRevoke = (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? External applications using it will lose access immediately.")) {
      storage.revokeApiKey(id);
      setKeys(storage.getApiKeys());
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Management</h1>
          <p className="text-gray-500 leading-relaxed">
            Harness REBRIGHT.ai's intelligence in your own applications. Create keys to access our proprietary research and conversation engines via our standard REST API.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12"
        >
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800">Your API Keys</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Key Name..." 
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                className="flex-1 md:w-64 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md active:scale-95"
              >
                Create
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">API Key</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {keys.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No API keys generated yet.</td>
                    </motion.tr>
                  ) : (
                    keys.map((k, index) => (
                      <motion.tr 
                        key={k.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-sm hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">{k.name}</td>
                        <td className="px-6 py-4 font-mono text-gray-400">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{k.key.substring(0, 8)}...</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${k.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {k.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{k.usageCount} calls</td>
                        <td className="px-6 py-4">
                          {k.status === 'active' && (
                            <button 
                              onClick={() => handleRevoke(k.id)}
                              className="text-red-400 hover:text-red-600 font-bold transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Documentation</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Integrate REBRIGHT.ai into your stack using our simple REST endpoint. We support JSON output for easy parsing.
            </p>
            <div className="bg-gray-900 p-4 rounded-xl font-mono text-[11px] text-gray-300 overflow-x-auto shadow-inner">
              <span className="text-indigo-400">curl</span> -X POST "https://api.rebright.ai/v1/chat" \<br/>
              &nbsp;&nbsp;-H <span className="text-emerald-400">"Authorization: Bearer YOUR_API_KEY"</span> \<br/>
              &nbsp;&nbsp;-d <span className="text-yellow-400">'{"message": "Explain quantum physics in Hinglish"}'</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Usage Monitoring</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Track your API performance and token consumption in real-time. Pro users get 1M free tokens per month.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500">Monthly Usage</span>
                <span className="text-indigo-600">25.3% of 1M</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '25.3%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all"
                ></motion.div>
              </div>
              <p className="text-[10px] text-gray-400 italic text-right">Resetting in 12 days</p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl">
                <i className="fas fa-check"></i>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">API Key Generated!</h2>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Copy this key now. For your security, we won't show it to you again.
              </p>
              <div className="bg-gray-50 border-2 border-dashed border-indigo-200 p-4 rounded-2xl flex items-center gap-2 mb-8 group relative">
                <code className="flex-1 font-mono text-indigo-600 break-all text-xs">{justCreatedKey}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(justCreatedKey || '');
                    alert('Copied to clipboard!');
                  }}
                  className="p-3 bg-white hover:bg-indigo-50 border border-gray-100 rounded-xl transition-all text-gray-400 hover:text-indigo-600 shadow-sm"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                I've Safely Saved It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiManagementView;
