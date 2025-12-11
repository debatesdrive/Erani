import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../App';
import { Stance } from '../types';

const StanceSelection: React.FC = () => {
  const navigate = useNavigate();
  const { currentTopic, setStance } = useAppContext();

  if (!currentTopic) {
    navigate('/lobby');
    return null;
  }

  const handleStanceSelect = (stance: Stance) => {
    setStance(stance);
    navigate('/matching');
  };

  return (
    <Layout
      header={
        <div className="flex items-center w-full">
           <button onClick={() => navigate('/lobby')} className="p-2 -mr-2 text-slate-400 hover:text-white">
             <ArrowRight size={24} />
           </button>
           <span className="mr-2 font-bold text-slate-200">בחירת עמדה</span>
        </div>
      }
    >
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Topic Image */}
        <div className="w-full h-56 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800 relative shrink-0">
            <img
              src={currentTopic.imageUrl}
              alt={currentTopic.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
             <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm text-slate-200 text-xs font-bold px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 z-10">
                <Info size={14} />
                {currentTopic.badge || 'דיון'}
             </div>
        </div>

        {/* Topic Text */}
        <div className="text-center space-y-3 px-2">
          <h2 className="text-3xl font-black leading-tight text-white">
            {currentTopic.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed font-light">
            {currentTopic.description}
          </p>
        </div>

        {/* Stance Selection */}
        <div className="flex-1 grid grid-rows-2 gap-4 mb-4">
          <button
            onClick={() => handleStanceSelect(Stance.COALITION)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-right shadow-lg shadow-blue-900/40 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <span className="text-blue-200 font-medium text-base">אני טוען ש...</span>
              <span className="text-3xl font-black text-white">בעד / ימין</span>
            </div>
            <div className="absolute -left-4 -bottom-4 text-blue-500/30 rotate-12">
               <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </button>

          <button
            onClick={() => handleStanceSelect(Stance.OPPOSITION)}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 p-6 text-right shadow-lg shadow-red-900/40 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <span className="text-red-200 font-medium text-base">אני טוען ש...</span>
              <span className="text-3xl font-black text-white">נגד / שמאל</span>
            </div>
            <div className="absolute -left-4 -bottom-4 text-red-500/30 rotate-12">
               <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default StanceSelection;