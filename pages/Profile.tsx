import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MessageCircle, Award, LogOut, History, ChevronLeft, Edit3, Camera, Loader2, AlertCircle, X, Plus, Save, Info } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppContext } from '../App';
import { storage, db } from '../lib/firebase';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State from main (Upload logic)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // State from Roei (UI logic)
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

  /**
   * Resizes and compresses image on client side.
   * Target size: ~50KB - 100KB.
   */
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas failure'));
          
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Blob failure'));
          }, 'image/jpeg', 0.7);
        };
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('נא לבחור קובץ תמונה בלבד');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const compressedBlob = await compressImage(file);
      
      // Use user.uid to ensure we overwrite old images (clean storage)
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const metadata = { contentType: 'image/jpeg' };
      
      await uploadBytes(storageRef, compressedBlob, metadata);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      // Update Local Context
      updateUser({ photoURL: downloadURL });
    } catch (err: any) {
      console.error('Upload Error:', err);
      setUploadError('העלאת התמונה נכשלה. וודא ששירות ה-Storage מופעל ב-Firebase.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updatePayload = {
        fullName: editData.fullName,
        bio: editData.bio,
        topics: editData.topics
      };
      
      await updateDoc(userRef, updatePayload);

      // Update context
      updateUser(updatePayload);
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      setUploadError('שגיאה בעדכון הפרופיל בבסיס הנתונים.');
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
           <button onClick={() => navigate('/lobby')} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
             <ArrowRight size={24} />
           </button>
           <span className="mr-2 font-bold text-slate-200">הפרופיל שלי</span>
           {!isEditing && (
             <button
               onClick={() => setIsEditing(true)}
               className="mr-auto p-2 text-slate-400 hover:text-white transition-colors"
             >
               <Edit3 size={20} />
             </button>
           )}
        </div>
      }
    >
      <div className="flex flex-col items-center animate-fade-in-up pb-10">
        
        {/* Avatar Section */}
        <div className="relative mt-4 mb-6 group">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900 overflow-hidden relative">
                {user.photoURL ? (
                  <img src={`${user.photoURL}&t=${Date.now()}`} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-white">{user.fullName?.charAt(0) || '?'}</span>
                )}
                
                {/* Upload Overlay */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                   {isUploading ? (
                     <Loader2 className="text-white animate-spin" size={32} />
                   ) : (
                     <Camera className="text-white" size={32} />
                   )}
                </div>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />
          <div className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-2 rounded-full border-4 border-slate-950 shadow-lg">
             <Award size={20} />
          </div>
        </div>

        {uploadError && (
          <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-3 w-full">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-red-200 text-sm leading-snug">{uploadError}</p>
          </div>
        )}

        {isEditing ? (
          <div className="w-full space-y-6">
            <Input
              label="שם מלא"
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              placeholder="הכנס שם מלא"
            />

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 pr-1">ביוגרפיה</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="ספר קצת על עצמך..."
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none transition-all"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-slate-500 mt-1 text-left">{editData.bio.length}/500</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 pr-1">נושאי עניין</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                  placeholder="הוסף נושא..."
                  className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={addTopic}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                  disabled={!newTopic.trim() || editData.topics.length >= 10}
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">
                    <span className="text-sm text-slate-300">{topic}</span>
                    <button
                      onClick={() => removeTopic(topic)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {editData.topics.length === 0 && (
                  <p className="text-slate-600 text-sm italic">לא נוספו נושאים עדיין</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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

            {user.bio ? (
              <p className="text-slate-300 text-center mb-6 max-w-md leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-slate-600 italic text-sm mb-6">אין ביוגרפיה להצגה</p>
            )}

            {user.topics && user.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {user.topics.map((topic, index) => (
                  <span key={index} className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-sm text-slate-400 font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 mb-1">
                        <Star size={28} fill="currentColor" />
                    </div>
                    <span className="text-4xl font-black text-white">{user.stats?.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-slate-400 text-sm font-medium">דירוג משתמש</span>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 mb-1">
                        <MessageCircle size={28} />
                    </div>
                    <span className="text-4xl font-black text-white">{user.stats?.debatesCount || '0'}</span>
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
                    <span className="text-slate-300 font-medium">דרגת נהג</span>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                       <span className="font-bold text-blue-400">מתחיל</span>
                    </div>
                </div>
                
                <Button 
                    variant="ghost" 
                    fullWidth 
                    onClick={handleLogout} 
                    className="mt-8 text-red-400 hover:text-red-300 hover:bg-red-900/10 border border-transparent hover:border-red-900/30"
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