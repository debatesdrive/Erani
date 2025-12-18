import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MessageCircle, Award, LogOut, History, ChevronLeft, Camera, Loader2, AlertCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAppContext } from '../App';
import { storage, db } from '../lib/firebase';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  /**
   * Resizes and compresses an image file on the client side.
   * This ensures we only store ~50-100KB per user on Firebase Storage.
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
          const MAX_SIZE = 400; // Standard profile resolution
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
          if (!ctx) return reject(new Error('Canvas context failed'));
          
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.7); // 70% quality is the sweet spot for size/quality
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('נא לבחור קובץ תמונה בלבד');
      return;
    }
    
    // Safety check for very large files before processing
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('הקובץ המקורי גדול מדי. נא לבחור תמונה קטנה מ-15MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // 1. Locally optimize
      const compressedBlob = await compressImage(file);
      
      /**
       * 2. Define Storage path. 
       * Using user.uid as the filename ensures we OVERWRITE the previous picture
       * instead of creating a history of files for the same user.
       */
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      
      // 3. Perform upload
      const metadata = { contentType: 'image/jpeg' };
      await uploadBytes(storageRef, compressedBlob, metadata);
      
      // 4. Update download reference
      // (Note: getDownloadURL returns a versioned token, so browser caches are refreshed)
      const downloadURL = await getDownloadURL(storageRef);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      // 5. Update UI
      updateUser({ photoURL: downloadURL });
    } catch (err: any) {
      console.error('Upload Process Error:', err);
      let message = 'העלאה נכשלה.';
      
      if (err.message?.includes('404')) {
        message = 'שגיאה: שירות ה-Storage לא מופעל. וודא שלחצת על "Get Started" ב-Firebase Console.';
      } else if (err.code === 'storage/unauthorized') {
        message = 'אין הרשאות כתיבה. בדוק את חוקי ה-Storage (Rules).';
      } else {
        message = `שגיאה (${err.code || 'unknown'}): נסה שוב מאוחר יותר.`;
      }
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        </div>
      }
    >
      <div className="flex flex-col items-center animate-fade-in-up">
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />

        {/* Avatar Section */}
        <div className="relative mt-4 mb-6 group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900 overflow-hidden relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-black text-white">{user.fullName?.charAt(0) || '?'}</span>
                )}
                
                {/* Upload Overlay */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                   {isUploading ? (
                     <Loader2 className="text-white animate-spin" size={32} />
                   ) : (
                     <Camera className="text-white" size={32} />
                   )}
                </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-amber-500 text-slate-900 p-2 rounded-full border-4 border-slate-950 shadow-lg">
             <Award size={20} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-white mb-1">{user.fullName}</h2>
        <p className="text-slate-500 mb-4">{user.phoneNumber}</p>

        {uploadError && (
          <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-3 w-full">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-red-200 text-sm leading-snug">{uploadError}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500 mb-1">
                    <Star size={28} fill="currentColor" />
                </div>
                <span className="text-4xl font-black text-white">{user.stats?.rating || '5.0'}</span>
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

      </div>
    </Layout>
  );
};

export default Profile;