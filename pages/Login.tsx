import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User as UserIcon, ShieldCheck, AlertCircle, Globe, Settings, Database } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppContext } from '../App';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAppContext() as any;
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '', 
    otp: '',
  });
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfigWarning, setShowConfigWarning] = useState(!isFirebaseConfigured());

  useEffect(() => {
    if (auth && !showConfigWarning && !(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('Recaptcha resolved');
          }
        });
      } catch (err) {
        console.error('Recaptcha init failed', err);
      }
    }
  }, [showConfigWarning]);

  const getE164PhoneNumber = (localNumber: string) => {
    let clean = localNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    return `+972${clean}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showConfigWarning) return;
    
    if (!formData.phoneNumber || !formData.fullName) {
      setError('נא למלא את כל השדות');
      return;
    }

    const digitsOnly = formData.phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      setError('מספר טלפון קצר מדי.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const e164Number = getE164PhoneNumber(formData.phoneNumber);
      
      if (!(window as any).recaptchaVerifier) {
         (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }

      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, e164Number, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      const errorCode = err.code || 'unknown';
      let message = '';

      if (errorCode === 'auth/invalid-phone-number') {
        message = 'מספר טלפון לא תקין.';
      } else if (errorCode === 'auth/unauthorized-domain') {
        message = `הדומיין ${window.location.hostname} אינו מורשה ב-Firebase.`;
      } else if (errorCode === 'auth/operation-not-allowed') {
        message = 'שליחת SMS לישראל אינה מאושרת. יש להגדיר SMS Region Policy ב-Firebase.';
      } else {
        message = `שגיאה (${errorCode})`;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !formData.otp) return;

    setLoading(true);
    setError('');

    try {
      // 1. Verify OTP with Firebase Auth
      const result = await confirmationResult.confirm(formData.otp);
      const fbUser = result.user;

      try {
        // 2. Try to sync with Firestore
        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);

        let userData;
        if (!userSnap.exists()) {
          userData = {
            fullName: formData.fullName,
            phoneNumber: getE164PhoneNumber(formData.phoneNumber),
            stats: { debatesCount: 0, rating: 5.0 }
          };
          await setDoc(userRef, userData);
        } else {
          userData = userSnap.data();
        }

        login({ ...userData, uid: fbUser.uid } as any);
        navigate('/lobby');
      } catch (dbErr: any) {
        console.error("Firestore Error:", dbErr);
        if (dbErr.code === 'permission-denied') {
          setError('שגיאת הרשאות בסיס נתונים. וודא שהגדרת את ה-Firestore Rules ב-Firebase Console.');
        } else {
          setError(`שגיאה בגישה לנתונים: ${dbErr.code || 'unknown'}`);
        }
      }
    } catch (authErr: any) {
      console.error("OTP Verification Error:", authErr);
      if (authErr.code === 'auth/invalid-verification-code') {
        setError('קוד אימות שגוי. נסה שוב.');
      } else {
        setError(`שגיאת אימות: ${authErr.code || 'unknown'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="justify-center">
      <div id="recaptcha-container"></div>
      
      <div className="flex flex-col items-center mb-12 animate-fade-in-up">
        <div className="w-40 h-40 mb-6 rounded-full overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.3)] border-4 border-slate-800 relative bg-slate-900 flex items-center justify-center">
           <img 
             src="https://placehold.co/400x400/0f172a/ffffff?text=ERANI+Waveform" 
             alt="Erani Logo" 
             className="w-full h-full object-cover scale-110"
           />
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-2 text-white drop-shadow-lg">ערני</h1>
        <p className="text-blue-400 text-xl font-bold text-center px-4 tracking-wide">משנים הילוך בשיח הישראלי</p>
      </div>

      {showConfigWarning && (
        <div className="bg-amber-900/30 border border-amber-500/50 p-6 rounded-3xl mb-8 flex flex-col items-center text-center gap-3 animate-pulse">
          <AlertCircle size={32} className="text-amber-500" />
          <h3 className="text-amber-200 font-bold">דרושה הגדרת Firebase</h3>
          <p className="text-amber-200/70 text-sm">
            יש לוודא שקובץ ה-.env מוגדר כראוי וש-Phone Authentication מופעל ב-Firebase Console.
          </p>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className={`w-full space-y-6 animate-fade-in-up`}>
          <Input
            label="שם מלא"
            placeholder="ישראל ישראלי"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            icon={<UserIcon size={20} />}
          />
          
          <div className="flex flex-col gap-2">
            <label className="text-slate-400 text-sm font-medium pr-1">
              מספר טלפון
            </label>
            <div className="relative">
              <input
                className="w-full h-14 bg-slate-900 border border-slate-700 rounded-xl px-4 pr-20 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                type="tel"
                placeholder="05X-XXXXXXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                dir="ltr"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-l border-slate-700 pl-4 h-6 flex items-center">
                <span className="text-blue-400 ml-1">+972</span>
                <Phone size={18} className="text-slate-500" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-3">
              <p className="text-red-400 text-sm text-center font-bold bg-red-900/20 p-4 rounded-xl border border-red-500/20 break-words">
                {error}
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" fullWidth size="xl" disabled={loading}>
              {loading ? 'שולח SMS...' : 'שלח קוד אימות'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="w-full space-y-6 animate-fade-in-up">
          <div className="text-center mb-4">
             <p className="text-slate-300">קוד נשלח למספר <span dir="ltr" className="font-bold text-blue-400">{getE164PhoneNumber(formData.phoneNumber)}</span></p>
          </div>
          
          <Input
            label="קוד אימות (6 ספרות)"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={formData.otp}
            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
            icon={<ShieldCheck size={20} />}
            className="text-center tracking-[1em]"
          />

          {error && (
            <div className="flex flex-col gap-3">
              <p className="text-red-400 text-sm text-center font-bold bg-red-900/20 p-4 rounded-xl border border-red-500/20 break-words">
                {error}
              </p>
              
              {error.includes('הרשאות בסיס נתונים') && (
                <div className="flex flex-col gap-2 p-3 bg-slate-900/80 rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                    <Database size={14} />
                    <span>הוראות למפתח:</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Firebase Console > Firestore Database > Rules > וודא שהרשאות הקריאה/כתיבה מאושרות למשתמשים מחוברים.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button type="submit" fullWidth size="xl" disabled={loading}>
              {loading ? 'בודק...' : 'התחבר עכשיו'}
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setStep('phone')} disabled={loading}>
              חזור לתיקון מספר
            </Button>
          </div>
        </form>
      )}
    </Layout>
  );
};

export default Login;