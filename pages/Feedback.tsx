
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAppContext } from '../App';
import { MOCK_OPPONENT } from '../constants';
import { db } from '../lib/firebase';

const Feedback: React.FC = () => {
  const navigate = useNavigate();
  const { setStance, user } = useAppContext() as any;
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const tags = [
    { id: 'respectful', label: 'מכבד', icon: '🤝' },
    { id: 'listener', label: 'מקשיב', icon: '👂' },
    { id: 'interesting', label: 'מעניין', icon: '💡' },
    { id: 'civil', label: 'תרבותי', icon: '⚖️' },
    { id: 'calm', label: 'רגוע', icon: '😌' },
    { id: 'knowledgeable', label: 'ידען', icon: '📚' },
  ];

  const handleFinish = async (skipped: boolean = false) => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (!skipped) {
        // Save feedback to Firestore
        await addDoc(collection(db, 'calls'), {
          userId: user.uid,
          opponent: MOCK_OPPONENT.name,
          rating,
          tags: selectedTags,
          timestamp: new Date().toISOString()
        });

        // Update user stats
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'stats.debatesCount': increment(1)
        });
      }

      setStance(null);
      navigate('/lobby');
    } catch (err) {
      console.error('Error saving feedback', err);
    } finally {
      setLoading(false);
    }
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
        <div className="text-center mt-4 mb-8">
          <h2 className="text-3xl font-black text-white mb-2">דרג את השיחה</h2>
          <p className="text-slate-400">איך היה הדיון עם {MOCK_OPPONENT.name}?</p>
        </div>

        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl">
            <img 
              src={MOCK_OPPONENT.avatarUrl} 
              alt={MOCK_OPPONENT.name}
              className="w-full h-full rounded-full object-cover border-4 border-slate-900"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
            >
              <Star 
                size={42} 
                className={`${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} transition-colors duration-200`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <div className="w-full grid grid-cols-2 gap-3 mb-8">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200' 
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

      <div className="w-full space-y-4 pt-4">
        <Button 
          fullWidth 
          onClick={() => handleFinish(false)}
          disabled={rating === 0 || loading}
          className={rating === 0 ? 'grayscale opacity-50' : ''}
        >
          {loading ? 'שומר...' : 'שלח משוב'}
        </Button>
        <button 
          onClick={() => handleFinish(true)}
          disabled={loading}
          className="w-full text-center text-slate-500 py-3 text-sm"
        >
          דלג על השלב הזה
        </button>
      </div>
    </Layout>
  );
};

export default Feedback;
