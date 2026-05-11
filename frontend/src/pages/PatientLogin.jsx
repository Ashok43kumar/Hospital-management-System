import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const PatientLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('O');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [mobNo, setMobNo] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error: authError } = await login(email, password);
        if (authError) throw authError;
        navigate('/patient-dashboard');
      } else {
        // Validation
        if (!name || !age || !dob || !mobNo) {
          throw new Error("All fields are required for patient registration.");
        }

        // 1. Register with Supabase
        const { data: authData, error: authError } = await signup(email, password, { name });
        if (authError) throw authError;

        // Wait a moment for the session to be established before sending to backend
        await new Promise(res => setTimeout(res, 500));

        // 2. Create the patient profile in MySQL
        // We use the new axios instance which will automatically attach the new JWT
        try {
          await api.post('/patients/', {
            name: name,
            gender: gender,
            age: parseInt(age, 10),
            dob: dob,
            mob_no: mobNo,
            email: email
          });
        } catch (dbErr) {
          console.error("Failed to create patient record:", dbErr.response?.data || dbErr);
          // Don't fail the whole signup if the DB insert fails, but alert the user.
          // They can be prompted to complete their profile later.
        }

        setSuccess("Account created successfully! Mapping your medical profile...");
        await new Promise(res => setTimeout(res, 1500));
        navigate('/patient-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-[1200px] flex flex-col lg:flex-row bg-surface-container rounded-xl overflow-hidden border border-outline-variant shadow-2xl relative">

        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low flex-col justify-between p-xl border-r border-outline-variant">
          <img alt="Medical Professional Background" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQylYP9ikrk24eMPg-KLpsuwPhhrOkmrFo5B8nMiioDLHjPc4P_OhEzpLZrFyDeAcnVnmjxsPeczWz7VljQHjQ-Js26S3kP7EDfNgOMZTNUbfkBRniN0tNsBKEyHzP59z9iWYAH1ZYOs63l-YatrQ5YbO2CoGHofZab0zjw_zp9LPLz-8Xc2oULj7L9LizWRq1xN2905Z0AK65YZKFbvaA7z9SIqjgAVUADkyo6m2kvVsa8zU8xGtYn0WiSWKhk9sWnEmj34anJyHq" />
          <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/80 to-background/90"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-sm mb-xl">
              <span className="material-symbols-outlined text-primary text-[32px]">health_and_safety</span>
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Vitalis HMS</h1>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary-fixed mt-24 mb-sm">Secure Patient Portal</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Access your medical records, manage appointments, and communicate directly with your care team in a secure, encrypted environment.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-md">
            <div className="flex -space-x-4">
              <div className="w-10 h-10 rounded-full bg-surface-bright border-2 border-background flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">shield</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-bright border-2 border-background flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">lock</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-bright border-2 border-background flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">verified</span>
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">HIPAA Compliant &amp; End-to-End Encrypted</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-lg md:p-xl flex flex-col justify-center bg-surface relative h-[800px] overflow-y-auto">
          <div className="flex lg:hidden items-center gap-sm mb-xl justify-center">
            <span className="material-symbols-outlined text-primary text-[28px]">health_and_safety</span>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Vitalis HMS</h1>
          </div>
          
          <div className="w-full max-w-md mx-auto">
            <div className="mb-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
                {isLogin ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {isLogin ? 'Please enter your credentials to access your portal.' : 'Register to manage your healthcare journey.'}
              </p>
            </div>

            <div className="flex border-b border-outline-variant mb-lg">
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 pb-sm font-label-md text-label-md transition-colors ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 pb-sm font-label-md text-label-md transition-colors ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-primary/10 text-primary p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2 border border-primary/20">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {success}
              </div>
            )}

            <form className="space-y-md" onSubmit={handleAuth}>
              
              {!isLogin && (
                <>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Full Name</label>
                    <input 
                      className="w-full bg-background border border-outline-variant rounded-lg py-sm px-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none" 
                      placeholder="Jane Doe" 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Gender</label>
                      <select 
                        className="w-full bg-background border border-outline-variant rounded-lg py-sm px-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Age</label>
                      <input 
                        className="w-full bg-background border border-outline-variant rounded-lg py-sm px-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none" 
                        placeholder="30" 
                        type="number"
                        min="1"
                        max="120"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Date of Birth</label>
                      <input 
                        className="w-full bg-background border border-outline-variant rounded-lg py-sm px-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none" 
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Mobile Number</label>
                      <input 
                        className="w-full bg-background border border-outline-variant rounded-lg py-sm px-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none" 
                        placeholder="1234567890" 
                        type="tel"
                        value={mobNo}
                        onChange={(e) => setMobNo(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input 
                    className="w-full bg-background border border-outline-variant rounded-lg py-sm pl-xl pr-sm text-on-surface focus:border-primary focus:ring-1 focus:outline-none" 
                    placeholder="patient@example.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-xs">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant">Password</label>
                  {isLogin && (
                    <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed" href="#">Forgot Password?</a>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input 
                    className="w-full bg-background border border-outline-variant rounded-lg py-sm pl-xl pr-xl text-on-surface focus:border-primary focus:ring-1 focus:outline-none" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center">
                  <input className="w-4 h-4 rounded border-outline-variant bg-background text-primary focus:ring-primary focus:ring-offset-background" id="remember" type="checkbox" />
                  <label className="ml-2 font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember">Remember this device for 30 days</label>
                </div>
              )}

              <button 
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-md rounded-lg flex items-center justify-center gap-sm transition-colors mt-lg disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">{isLogin ? 'login' : 'person_add'}</span>
                )}
                {loading ? 'Processing...' : (isLogin ? 'Secure Login' : 'Create Patient Account')}
              </button>
            </form>

            <div className="relative my-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-on-surface-variant font-label-sm text-label-sm">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <button className="flex items-center justify-center gap-sm py-sm px-md border border-outline-variant rounded-lg bg-surface hover:bg-surface-container-high transition-colors text-on-surface font-label-md text-label-md" type="button">
                <span className="material-symbols-outlined text-[20px]">badge</span>
                HealthID
              </button>
              <button className="flex items-center justify-center gap-sm py-sm px-md border border-outline-variant rounded-lg bg-surface hover:bg-surface-container-high transition-colors text-on-surface font-label-md text-label-md" type="button">
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                Authenticator
              </button>
            </div>
          </div>

          <div className="mt-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Having trouble? <Link to="/" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientLogin;
