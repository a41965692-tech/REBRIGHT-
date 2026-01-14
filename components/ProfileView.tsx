
import React from 'react';
import { User, Conversation } from '../types';
import { storage } from '../services/storageService';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  const conversations = storage.getConversations();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-md">
            {user.name[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wide">Pro Researcher</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide">Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="px-6 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all font-semibold"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Research Sessions</p>
            <p className="text-3xl font-bold text-gray-900">{conversations.filter(c => c.view === 'research').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">Messages Sent</p>
            <p className="text-3xl font-bold text-gray-900">{conversations.reduce((acc, c) => acc + c.messages.length, 0)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase mb-1">API Keys Active</p>
            <p className="text-3xl font-bold text-gray-900">{storage.getApiKeys().filter(k => k.status === 'active').length}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-gray-800">Recent Activity</h2>
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
              <i className="fas fa-history text-gray-200 text-4xl mb-4"></i>
              <p className="text-gray-400">No activity yet. Start chatting to see your history!</p>
            </div>
          ) : (
            conversations.slice(0, 10).map(conv => (
              <div key={conv.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${conv.view === 'research' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <i className={`fas ${conv.view === 'research' ? 'fa-microscope' : 'fa-comments'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{conv.title || 'Untitled Conversation'}</p>
                  <p className="text-xs text-gray-400">Last updated {new Date(conv.updatedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">{conv.view}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
