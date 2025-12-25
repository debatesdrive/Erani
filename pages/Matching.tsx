import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, X, Loader2 } from 'lucide-react';
import io from 'socket.io-client';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAppContext } from '../App';
import { Stance } from '../types';

const Matching: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStance, user } = useAppContext();
  const [socket, setSocket] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (!selectedStance || !user) {
      navigate('/lobby');
      return;
    }
  }, [selectedStance, user, navigate]);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3002`);
    setSocket(newSocket);

    newSocket.on('matched', (data: { roomId: string; opponentStance: string; opponent: any }) => {
      console.log('Matched!', data);
      navigate('/call', { state: { roomId: data.roomId, opponentStance: data.opponentStance, opponent: data.opponent } });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    if (socket && selectedStance && user && !isMatching) {
      socket.emit('joinMatching', { stance: selectedStance, user });
      setIsMatching(true);
    }
  }, [socket, selectedStance, user, isMatching]);

  const handleCancel = () => {
    if (socket) {
      socket.emit('leaveMatching');
    }
    navigate('/lobby');
  };

  return (
    <Layout className="items-center justify-center relative">
      <div className="flex flex-col items-center justify-center w-full max-w-xs text-center z-10">
        
        {/* Radar Animation Container */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          {/* Outer ripples */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-8 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
          
          {/* Core Circle */}
          <div className="w-32 h-32 bg-slate-900 border-4 border-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 relative z-20">
            <Radio className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>

          {/* Stance Indicator badge */}
          <div className={`absolute bottom-0 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl border ${
            selectedStance === Stance.COALITION 
              ? 'bg-blue-600 border-blue-400 text-white' 
              : 'bg-red-600 border-red-400 text-white'
          }`}>
            {selectedStance === Stance.COALITION ? 'ימין' : 'שמאל'}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <span>מחפש פרטנר לשיחה</span>
          <Loader2 className="animate-spin text-blue-400" size={24} />
        </h2>
        <p className="text-slate-400 text-lg mb-8">
          שמור על עירנות! מחפשים מישהו עם דעה מנוגדת.
        </p>

        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="min-w-[150px] border-slate-700 text-slate-500 hover:border-red-500 hover:text-red-500"
        >
          <X size={20} className="ml-2" />
          ביטול
        </Button>
      </div>

      {/* Decorative background grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
          backgroundSize: '40px 40px' 
        }}>
      </div>
    </Layout>
  );
};

export default Matching;