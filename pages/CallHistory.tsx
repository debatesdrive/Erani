
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Calendar, User, Clock } from 'lucide-react';
import Layout from '../components/Layout';

interface HistoryItem {
  opponent: string;
  rating: number;
  tags: string[];
  timestamp: string;
}

const CallHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('erani_feedback_history');
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        // Sort by date descending (newest first)
        parsed.sort((a: HistoryItem, b: HistoryItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'numeric', // 'short' sometimes produces unexpected results in some envs, numeric is safer
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return '';
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center w-full">
           <button onClick={() => navigate('/profile')} className="p-2 -mr-2 text-slate-400 hover:text-white">
             <ArrowRight size={24} />
           </button>
           <span className="mr-2 font-bold text-slate-200">היסטוריית שיחות</span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 animate-fade-in-up pb-8">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-slate-500 gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <Clock size={40} />
            </div>
            <p className="text-lg font-medium">אין עדיין שיחות בהיסטוריה</p>
          </div>
        ) : (
          history.map((item, index) => (
            <div key={index} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 shrink-0">
                    <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{item.opponent}</h3>
                  <div className="flex items-center text-slate-500 text-xs gap-1">
                    <Calendar size={12} />
                    <span dir="ltr" className="text-right">{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-500 ml-1 text-sm">{item.rating}</span>
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                 </div>
                 {item.tags && item.tags.length > 0 && (
                     <div className="flex gap-1">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                        ))}
                     </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default CallHistory;
