import React from 'react';
import { Phone, PhoneOff, ShieldCheck, Star } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { MOCK_OPPONENT } from '../constants';
import { useAppContext } from '../App';
import { Stance } from '../types';
import { useNavigate } from 'react-router-dom';

const Call: React.FC = () => {
  const { selectedStance } = useAppContext();
  const navigate = useNavigate();

  const opponentStanceLabel = selectedStance === Stance.COALITION ? 'אופוזיציה / שמאל' : 'קואליציה / ימין';
  const opponentColorClass = selectedStance === Stance.COALITION ? 'text-red-400' : 'text-blue-400';
  const opponentBgClass = selectedStance === Stance.COALITION ? 'bg-red-500/10 border-red-500/30 shadow-red-900/20' : 'bg-blue-500/10 border-blue-500/30 shadow-blue-900/20';
  const opponentBadgeBg = selectedStance === Stance.COALITION ? 'bg-red-600' : 'bg-blue-600';

  const handleCallClick = () => {
    // Tactile confirmation pattern
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleEndCall = () => {
    // Navigate to feedback screen instead of resetting immediately
    navigate('/feedback');
  };

  return (
    <Layout className="justify-between relative overflow-hidden">
      {/* Dynamic Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-blue-600/30 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[50%] bg-green-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[30%] bg-purple-500/20 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Success Header */}
        <div className="text-center mt-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full mb-4 ring-1 ring-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <ShieldCheck size={20} />
            <span className="font-bold text-sm">נמצאה התאמה מושלמת</span>
          </div>
        </div>

        {/* Detailed Opponent Card */}
        <div className={`w-full p-6 rounded-[2rem] border ${opponentBgClass} backdrop-blur-md mt-4 mb-auto animate-fade-in-up shadow-2xl relative overflow-hidden`}>
          {/* Background decoration inside card */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-800 shadow-xl">
                 <img 
                   src={MOCK_OPPONENT.avatarUrl} 
                   alt={MOCK_OPPONENT.name}
                   className="w-full h-full rounded-full object-cover border-4 border-slate-900"
                 />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-900 text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg border-2 border-slate-900">
                <Star size={12} fill="currentColor" />
                {MOCK_OPPONENT.rating}
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{MOCK_OPPONENT.name}</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-[80%] leading-relaxed">{MOCK_OPPONENT.bio}</p>
            
            <div className="w-full bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
               <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">עמדה בדיון</div>
               <div className={`inline-block px-4 py-1 rounded-lg ${opponentBadgeBg} text-white font-bold text-lg mb-2 shadow-lg`}>
                 {opponentStanceLabel}
               </div>
               <p className={`text-sm ${opponentColorClass} font-medium leading-relaxed mt-1 italic`}>
                 "{MOCK_OPPONENT.stanceDescription}"
               </p>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-8 pb-4 space-y-4">
          <a 
            href={`tel:${MOCK_OPPONENT.phoneNumber}`}
            onClick={handleCallClick}
            className="flex items-center justify-center w-full h-20 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black text-2xl shadow-lg shadow-green-900/50 transition-all active:scale-95 no-underline border-t border-green-400/30 animate-pulse-slow cursor-pointer"
          >
            <Phone size={28} className="ml-3 fill-current" />
            חייג עכשיו
          </a>

          <Button 
            variant="danger" 
            fullWidth 
            onClick={handleEndCall}
            className="h-14 text-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 shadow-none"
          >
            <PhoneOff size={20} className="ml-2" />
            סיים שיחה
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Call;