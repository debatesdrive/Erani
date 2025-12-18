
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Calendar, User, Clock, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import Layout from '../components/Layout';
import { useAppContext } from '../App';
import { db } from '../lib/firebase';

interface HistoryItem {
  opponent: string;
  rating: number;
  tags: string[];
  timestamp: string;
}

const CallHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext() as any;
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'calls'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const results: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          results.push(doc.data() as HistoryItem);
        });
        setHistory(results);
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'numeric',
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
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-blue-400 gap-4">
             <Loader2 size={40} className="animate-spin" />
             <p>טוען היסטוריה...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-slate-500 gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <Clock size={40} />
            </div>
            <p className="text-lg font-medium">אין עדיין שיחות בהיסטוריה</p>
          </div>
        ) : (
          history.map((item, index) => (
            <div key={index} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                    <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{item.opponent}</h3>
                  <div className="flex items-center text-slate-500 text-xs gap-1">
                    <Calendar size={12} />
                    <span dir="ltr">{formatDate(item.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    <span className="font-bold text-amber-500 ml-1 text-sm">{item.rating}</span>
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default CallHistory;
