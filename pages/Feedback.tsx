import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Check, Send } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAppContext } from '../App';
import { MOCK_OPPONENT } from '../constants';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { opponent } = location.state || {};
  const { setStance } = useAppContext();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = [
    { id: 'respectful', label: 'מכבד', icon: '🤝' },
    { id: 'listener', label: 'מקשיב', icon: '👂' },
    { id: 'interesting', label: 'מעניין', icon: '💡' },
    { id: 'civil', label: 'תרבותי', icon: '⚖️' },
    { id: 'calm', label: 'רגוע', icon: '😌' },
    { id: 'knowledgeable', label: 'ידען', icon: '📚' },
  ];

  const handleFinish = (skipped: boolean = false) => {
    if (!skipped) {
      // Save feedback to localStorage
      const feedback = {
        opponent: opponent?.fullName || MOCK_OPPONENT.name,
        rating,
        tags: selectedTags,
        timestamp: new Date().toISOString()
      };
      
      const history = JSON.parse(localStorage.getItem('erani_feedback_history') || '[]');
      history.push(feedback);
      localStorage.setItem('erani_feedback_history', JSON.stringify(history));
    }

    // Reset app state and go to lobby
    setStance(null);
    navigate('/lobby');
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <Layout className="items-center justify-between">
      <div className="w-full flex-1 flex flex-col items-center animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mt-4 mb-8">
          <h2 className="text-3xl font-black text-white mb-2">דרג את השיחה</h2>
          <p className="text-slate-400">איך היה הדיון עם {opponent?.fullName || MOCK_OPPONENT.name}?</p>
        </div>

        {/* Opponent Avatar */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl">
            <img 
              src={opponent?.avatarUrl || MOCK_OPPONENT.avatarUrl} 
              alt={opponent?.fullName || MOCK_OPPONENT.name}
              className="w-full h-full rounded-full object-cover border-4 border-slate-900"
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 shadow-lg whitespace-nowrap">
             השיחה הסתיימה
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
            >
              <Star 
                size={42} 
                className={`${rating >= star ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-slate-700'} transition-colors duration-200`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        {/* Tags Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-8">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-xl">{tag.icon}</span>
                <span className="font-bold">{tag.label}</span>
                {isSelected && <Check size={16} className="text-blue-400 absolute left-3" />}
              </button>
            );
          })}
        </div>

      </div>

      {/* Footer Actions */}
      <div className="w-full space-y-4 pt-4 bg-slate-950/80 backdrop-blur-sm">
        <Button 
          fullWidth 
          onClick={() => handleFinish(false)}
          disabled={rating === 0}
          icon={<Send size={20} className="rotate-180" />} // RTL arrow
          className={rating === 0 ? 'grayscale opacity-50' : 'animate-pulse-slow'}
        >
          שלח משוב
        </Button>
        
        <button 
          onClick={() => handleFinish(true)}
          className="w-full text-center text-slate-500 py-3 text-sm font-medium hover:text-slate-300 transition-colors"
        >
          דלג על השלב הזה
        </button>
      </div>
    </Layout>
  );
};

export default Feedback;