import React from 'react';
import { Phone, PhoneOff, ShieldCheck, Star, Quote } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { MOCK_OPPONENT } from '../constants';
import { useAppContext } from '../App';
import { Stance } from '../types';
import { useNavigate } from 'react-router-dom';

const Call: React.FC = () => {
  const { selectedStance } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, opponentStance, opponent } = location.state || {};

  const opponentStanceLabel = opponentStance === 'COALITION' ? 'קואליציה / ימין' : 'אופוזיציה / שמאל';
  // Use slightly more vibrant colors for the stance section to make it prominent
  const opponentColorClass = opponentStance === 'COALITION' ? 'text-blue-300' : 'text-red-300';
  const opponentBgClass = opponentStance === 'COALITION' ? 'bg-gradient-to-br from-blue-900/40 to-slate-900/60 border-blue-500/30' : 'bg-gradient-to-br from-red-900/40 to-slate-900/60 border-red-500/30';
  const opponentBadgeBg = opponentStance === 'COALITION' ? 'bg-blue-600 shadow-blue-900/50' : 'bg-red-600 shadow-red-900/50';

  const handleCallClick = () => {
    // Tactile confirmation pattern
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleEndCall = () => {
    // Navigate to feedback screen instead of resetting immediately
    navigate('/feedback', { state: { opponent } });
  };

  return (
    <Layout className="justify-between relative overflow-hidden">
      {/* Custom Keyframe Animation for "Lava Lamp" effect */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Dynamic Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-[20%] w-96 h-96 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Success Header */}
        <div className="text-center mt-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-green-500/20 text-green-400 rounded-full mb-4 ring-1 ring-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)] backdrop-blur-sm">
            <ShieldCheck size={20} />
            <span className="font-bold text-base">נמצאה התאמה מושלמת</span>
          </div>
        </div>

        {/* Detailed Opponent Card */}
        <div className={`w-full p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent p-[1px] mt-4 mb-auto animate-fade-in-up shadow-2xl`}>
          <div className={`w-full h-full p-6 rounded-[2.5rem] border border-white/5 ${opponentBgClass} backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center`}>
            
            <div className="relative mb-5 group">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500"></div>
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-800 relative z-10">
                 <img 
                   src={opponent?.avatarUrl || "https://via.placeholder.com/128"} 
                   alt={opponent?.fullName}
                   className="w-full h-full rounded-full object-cover border-4 border-slate-900"
                 />
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 text-slate-900 p-2 rounded-full border-4 border-slate-900 shadow-lg z-20">
                 <Phone size={16} fill="currentColor" className="text-white animate-pulse" />
              </div>
              <div className="absolute bottom-0 left-0 bg-amber-500 text-slate-900 text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg border-4 border-slate-900 z-20">
                <Star size={12} fill="currentColor" />
                {opponent?.stats?.rating || 5}
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">{opponent?.fullName}</h2>
            <p className="text-slate-300 text-sm mb-6 max-w-[90%] leading-relaxed font-light">{opponent?.bio || "משתמש פעיל באפליקציה"}</p>
            
            {/* Prominent Stance Section */}
            <div className="w-full bg-slate-950/40 rounded-3xl p-5 border border-white/5 relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-1 h-full ${opponentStance === 'COALITION' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
               
               <div className="flex flex-col items-center">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">העמדה בדיון</span>
                 <div className={`px-6 py-2 rounded-xl ${opponentBadgeBg} text-white font-black text-xl mb-3 shadow-lg transform hover:scale-105 transition-transform`}>
                   {opponentStanceLabel}
                 </div>
                 <div className="relative">
                   <Quote size={20} className={`absolute -top-2 -right-4 ${opponentColorClass} opacity-50`} />
                   <p className={`text-base ${opponentColorClass} font-medium leading-relaxed italic px-4`}>
                     "{opponent?.stanceDescription || "מוכן לדיון מעניין!"}"
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-8 pb-4 space-y-4">
          <a 
            href={`tel:${opponent?.phoneNumber}`}
            onClick={handleCallClick}
            className="group relative flex items-center justify-center w-full h-20 bg-green-600 hover:bg-green-500 text-white rounded-3xl font-black text-2xl shadow-xl shadow-green-900/40 transition-all active:scale-95 no-underline border-t border-green-400/30 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Phone size={28} className="ml-3 fill-current animate-bounce" />
            <span className="relative z-10">חייג עכשיו</span>
          </a>

          <Button 
            variant="ghost" 
            fullWidth 
            onClick={handleEndCall}
            className="h-14 text-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <PhoneOff size={20} className="ml-2" />
            ביטול שיחה
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Call;