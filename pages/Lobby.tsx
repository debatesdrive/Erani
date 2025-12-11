import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, ChevronLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../App';
import { Topic } from '../types';
import { TOPICS } from '../constants';

const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { user, setCurrentTopic } = useAppContext();

  const handleTopicSelect = (topic: Topic) => {
    setCurrentTopic(topic);
    navigate('/stance');
  };

  return (
    <Layout
      header={
        <>
          <div className="flex items-center gap-3" onClick={() => navigate('/profile')}>
             <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors">
                <span className="text-sm font-bold text-blue-400">{user?.fullName.charAt(0)}</span>
             </div>
             <div className="flex flex-col cursor-pointer">
               <span className="text-xs text-slate-400">שלום,</span>
               <span className="font-medium">{user?.fullName}</span>
             </div>
          </div>
          <button onClick={() => navigate('/profile')} className="p-2 text-slate-500 hover:text-white">
            <UserIcon size={24} />
          </button>
        </>
      }
    >
      <div className="flex-1 flex flex-col gap-6">
        <div className="space-y-2 mt-2">
          <h1 className="text-3xl font-black text-white">בחר נושא לדיון</h1>
          <p className="text-slate-400">על מה בא לך לדבר היום בדרך?</p>
        </div>

        <div className="grid gap-6">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic)}
              className="group relative w-full h-64 rounded-3xl overflow-hidden shadow-lg border border-slate-800 text-right transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-900/20 active:scale-95"
            >
              {/* Image Background */}
              <img
                src={topic.imageUrl}
                alt={topic.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90" />

              {/* Badge */}
              {topic.badge && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg z-10">
                  {topic.badge}
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 z-10">
                <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg group-hover:text-blue-200 transition-colors">
                  {topic.title}
                </h2>
                <p className="text-slate-300 text-sm font-medium line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
                <div className="mt-2 flex items-center text-blue-400 text-sm font-bold">
                  הכנס לדיון <ChevronLeft size={16} className="mr-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Lobby;