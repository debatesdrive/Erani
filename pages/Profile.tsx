
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MessageCircle, LogOut, History, ChevronLeft, Edit3, Camera, X, Plus, Save } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppContext } from '../App';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, login } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    topics: user?.topics || []
  });
  const [newTopic, setNewTopic] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:3002/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: editData.fullName,
          bio: editData.bio,
          topics: editData.topics
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();

      // Update context with new data
      login(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsLoading(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:3002/api/users/${user.id}/upload-picture`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      // Update user context with new profile picture
      if (user) {
        login({
          ...user,
          profilePicture: data.profilePicture
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !editData.topics.includes(newTopic.trim()) && editData.topics.length < 10) {
      setEditData({
        ...editData,
        topics: [...editData.topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setEditData({
      ...editData,
      topics: editData.topics.filter(topic => topic !== topicToRemove)
    });
  };

  if (!user) return null;

  return (
    <Layout
      header={
        <div className="flex items-center w-full">
           <button onClick={() => navigate('/lobby')} className="p-2 -mr-2 text-slate-400 hover:text-white">
             <ArrowRight size={24} />
           </button>
           <span className="mr-2 font-bold text-slate-200">הפרופיל שלי</span>
           {!isEditing && (
             <button
               onClick={() => setIsEditing(true)}
               className="mr-auto p-2 text-slate-400 hover:text-white"
             >
               <Edit3 size={20} />
             </button>
           )}
        </div>
      }
    >
      <div className="flex flex-col items-center animate-fade-in-up">

        {/* Avatar Section */}
        <div className="relative mt-4 mb-6">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900 overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={`http://${window.location.hostname}:3002${user.profilePicture}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-black text-white">{user.fullName.charAt(0)}</span>
              )}
            </div>
          </div>
          {isEditing && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-3 rounded-full border-4 border-slate-950 shadow-lg hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                <Camera size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </>
          )}
        </div>

        {isEditing ? (
          <div className="w-full space-y-6">
            <Input
              label="שם מלא"
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              placeholder="הכנס שם מלא"
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">ביוגרפיה</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="ספר קצת על עצמך..."
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-slate-500 mt-1">{editData.bio.length}/500</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">נושאי עניין</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                  placeholder="הוסף נושא..."
                  className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={addTopic}
                  className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  disabled={!newTopic.trim() || editData.topics.length >= 10}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-full">
                    <span className="text-sm text-slate-300">{topic}</span>
                    <button
                      onClick={() => removeTopic(topic)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex-1"
                icon={<Save size={20} />}
              >
                {isLoading ? 'שומר...' : 'שמור שינויים'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    fullName: user.fullName,
                    bio: user.bio || '',
                    topics: user.topics || []
                  });
                }}
                disabled={isLoading}
              >
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black text-white mb-1">{user.fullName}</h2>
            <p className="text-slate-500 mb-4">{user.phoneNumber}</p>

            {user.bio && (
              <p className="text-slate-300 text-center mb-6 max-w-md">{user.bio}</p>
            )}

            {user.topics && user.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {user.topics.map((topic, index) => (
                  <span key={index} className="bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-300">
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
                {/* Rating Card */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 mb-1">
                        <Star size={28} fill="currentColor" />
                    </div>
                    <span className="text-4xl font-black text-white">{user.stats.rating}</span>
                    <span className="text-slate-400 text-sm font-medium">דירוג משתמש</span>
                </div>

                {/* Debates Card */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 mb-1">
                        <MessageCircle size={28} />
                    </div>
                    <span className="text-4xl font-black text-white">{user.stats.debatesCount}</span>
                    <span className="text-slate-400 text-sm font-medium">שיחות שבוצעו</span>
                </div>
            </div>

            {/* Additional Options */}
            <div className="w-full space-y-4">
                <button
                    onClick={() => navigate('/history')}
                    className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between hover:bg-slate-800 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-full text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <History size={20} />
                        </div>
                        <span className="text-slate-200 font-bold">היסטוריית שיחות</span>
                    </div>
                    <ChevronLeft size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                </button>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">דרגת נהג</span>
                    <span className="font-bold text-blue-400">מתחיל</span>
                </div>

                <Button
                    variant="ghost"
                    fullWidth
                    onClick={handleLogout}
                    className="mt-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    icon={<LogOut size={20} />}
                >
                    התנתק מהמערכת
                </Button>
            </div>
          </>
        )}

      </div>
    </Layout>
  );
};

export default Profile;
