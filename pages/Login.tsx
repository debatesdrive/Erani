import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User as UserIcon } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppContext } from '../App';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({
    fullName: '',
    phoneNumber: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { fullName: '', phoneNumber: '' };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'נא להזין שם מלא';
      isValid = false;
    }

    // Validation for phone number
    // Strip all non-digit characters to check pure length
    const cleanedPhone = formData.phoneNumber.replace(/\D/g, '');
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'נא להזין מספר טלפון';
      isValid = false;
    } else if (cleanedPhone.length < 9 || cleanedPhone.length > 15) {
      // Allows 9-10 digits for standard local numbers, up to 15 for international
      newErrors.phoneNumber = 'מספר טלפון לא תקין (9-15 ספרות)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Create user with default stats
      login({
        ...formData,
        stats: { debatesCount: 0, rating: 5.0 }
      });
      navigate('/lobby');
    }
  };

  return (
    <Layout className="justify-center">
      <div className="flex flex-col items-center mb-12 animate-fade-in-up">
        {/* Logo Image */}
        <div className="w-48 h-48 mb-6 rounded-full overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.3)] border-4 border-slate-800 relative bg-slate-900 flex items-center justify-center">
           {/* Placeholder for the attached Erani Waveform Logo */}
           <img 
             src="https://placehold.co/400x400/0f172a/ffffff?text=ERANI+Waveform" 
             alt="Erani Logo" 
             className="w-full h-full object-cover scale-110"
           />
        </div>
        
        <h1 className="text-5xl font-black tracking-tight mb-2 text-white drop-shadow-lg">ערני</h1>
        <p className="text-blue-400 text-xl font-bold text-center px-4 tracking-wide">משנים הילוך בשיח הישראלי</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <Input
          label="שם מלא"
          placeholder="ישראל ישראלי"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={errors.fullName}
          icon={<UserIcon size={20} />}
        />
        
        <Input
          label="מספר טלפון"
          type="tel"
          inputMode="tel"
          placeholder="050-1234567 או +972..."
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          error={errors.phoneNumber}
          icon={<Phone size={20} />}
          dir="ltr"
          className="text-right"
        />

        <div className="pt-4">
          <Button type="submit" fullWidth size="xl">
            התחל נסיעה
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default Login;