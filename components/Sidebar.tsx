
import React from 'react';
import { motion } from 'framer-motion';
import { AppView, User } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user }) => {
  const items = [
    { id: AppView.CHAT, icon: 'fa-comments', label: 'Chat' },
    { id: AppView.RESEARCH, icon: 'fa-microscope', label: 'Research' },
    { id: AppView.VISUALS, icon: 'fa-image', label: 'Visuals' },
    { id: AppView.LIVE, icon: 'fa-broadcast-tower', label: 'Live' },
    { id: AppView.API_KEYS, icon: 'fa-key', label: 'API Keys' },
    { id: AppView.SETTINGS, icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <div className="w-20 md:w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm z-30 relative">
      <div className="p-4 flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg cursor-pointer"
        >
          R
        </motion.div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-gray-800">REBRIGHT.ai</span>
      </div>
      
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <motion.i 
                whileHover={{ scale: 1.2 }}
                className={`fas ${item.icon} text-lg w-6 transition-colors ${isActive ? 'text-indigo-600' : 'group-hover:text-gray-700'}`}
              ></motion.i>
              <span className={`hidden md:block font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <motion.button 
          whileHover={{ x: 5 }}
          onClick={() => setView(AppView.PROFILE)}
          className={`w-full flex items-center gap-3 px-2 py-3 rounded-xl transition-all ${currentView === AppView.PROFILE ? 'bg-indigo-50 shadow-sm' : 'hover:bg-gray-50'}`}
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden">
             {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
          </div>
          <div className="hidden md:block text-left overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">Profile</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
