
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User as UserIcon, ShieldCheck, AlertCircle } from 'lucide-react';
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
    // Setup invisible recaptcha
    if (!showConfigWarning && !(window as any).recaptchaVerifier) {
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showConfigWarning) return;
    
    if (!formData.phoneNumber || !formData.fullName) {
      setError('נא למלא את כל השדות');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formData.phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('מספר טלפון לא תקין. נא להשתמש בפורמט בינלאומי (למשל +972...)');
      } else {
        setError('שגיאה בשליחת ה-SMS. וודא שהגדרת את הדומיין ב-Firebase Console.');
      }
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
      const result = await confirmationResult.confirm(formData.otp);
      const fbUser = result.user;

      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      let userData;
      if (!userSnap.exists()) {
        userData = {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          stats: { debatesCount: 0, rating: 5.0 }
        };
        await setDoc(userRef, userData);
      } else {
        userData = userSnap.data();
      }

      login({ ...userData, uid: fbUser.uid } as any);
      navigate('/lobby');
    } catch (err) {
      setError('קוד אימות שגוי או פג תוקף.');
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
            עליך לעדכן את קובץ <code className="bg-black/30 px-1 rounded text-white">lib/firebase.ts</code> 
            עם הפרמטרים מהפרויקט שלך ב-Firebase Console כדי להפעיל את ההתחברות.
          </p>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className={`w-full space-y-6 animate-fade-in-up ${showConfigWarning ? 'opacity-50 pointer-events-none' : ''}`}>
          <Input
            label="שם מלא"
            placeholder="ישראל ישראלי"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            icon={<UserIcon size={20} />}
          />
          
          <Input
            label="מספר טלפון (פורמט בינלאומי)"
            type="tel"
            placeholder="+972501234567"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            icon={<Phone size={20} />}
            dir="ltr"
          />

          {error && <p className="text-red-400 text-sm text-center font-bold bg-red-900/20 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <div className="pt-4">
            <Button type="submit" fullWidth size="xl" disabled={loading || showConfigWarning}>
              {loading ? 'שולח SMS...' : 'שלח קוד אימות'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="w-full space-y-6 animate-fade-in-up">
          <div className="text-center mb-4">
             <p className="text-slate-300">קוד נשלח למספר <span dir="ltr" className="font-bold text-blue-400">{formData.phoneNumber}</span></p>
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

          {error && <p className="text-red-400 text-sm text-center font-bold bg-red-900/20 p-3 rounded-xl border border-red-500/20">{error}</p>}

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
