import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await login(email, password);
      
      if (authError) {
        throw authError;
      }

      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-row">
      <div className="hidden lg:block lg:w-1/2 relative bg-surface border-r border-outline-variant">
        <img alt="Healthcare Technology Concept" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxN1CcJQ2m15ZNJjedPmDm7AE1tOkMWhtsHD6jhtHrrG2CvqvWgkWdpO5RCDcoutounMFhiG5HxJzbItqqHsaX3orqw-fHwlfjRluCSpwHR31IkZAIAtNBpn75LzJJ3Ihh3hRtBax4XpuhyuKYjYWvaMjZasyRaQovMy3RcoLMCTh23GafqfT878A0lnxwOVTQ1hKiVmAHHplkSJWfyc5b_22rvzp61zq3_WcPz8uWS98BMeZKnjczuL0tz-i_KotJ7_DzpDxv25u8" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/80 via-surface-container-lowest/50 to-surface-container-lowest"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-90"></div>
        
        <div className="absolute bottom-xl left-margin-desktop z-10 max-w-md">
          <div className="flex items-center gap-sm mb-md">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container" >security</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">Vitalis HMS</h1>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Central Command infrastructure. Authorized medical personnel only. All access attempts are logged and monitored.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center px-margin-mobile lg:px-margin-desktop py-xl relative min-h-screen">
        <div className="w-full max-w-[440px] z-10">
          <div className="lg:hidden flex flex-col items-center justify-center mb-xl">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant flex items-center justify-center mb-md shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <span className="material-symbols-outlined text-primary text-[28px]" >health_and_safety</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">Vitalis HMS</h1>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-xl p-lg md:p-xl flex flex-col gap-xl">
            <div className="flex flex-col gap-sm text-left">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Staff Portal</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Enter your assigned credentials to securely access the administrative dashboard.</p>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-lg w-full" onSubmit={handleLogin}>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-md text-outline">mail</span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-md pl-[3rem] pr-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                    id="email" 
                    placeholder="e.g. admin@vitalis.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-end w-full">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot credentials?</a>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-md text-outline">key</span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-md pl-[3rem] pr-md font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                    id="password" 
                    placeholder="••••••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button className="absolute right-md text-outline hover:text-on-surface transition-colors flex items-center justify-center" type="button">
                    <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                  </button>
                </div>
              </div>

              <div className="pt-sm flex flex-col gap-md">
                <button 
                  className="w-full bg-primary-container hover:bg-primary text-on-primary-container py-md rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-sm group shadow-[0_0_10px_rgba(77,142,255,0.1)] hover:shadow-[0_0_15px_rgba(77,142,255,0.2)] disabled:opacity-50" 
                  type="submit"
                  disabled={loading}
                >
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">login</span>
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </button>

                <div className="flex items-center justify-center gap-xs mt-sm opacity-80">
                  <span className="material-symbols-outlined text-tertiary text-[18px]" >enhanced_encryption</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">End-to-end encrypted</span>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-xl text-center w-full flex flex-col items-center gap-xs">
            <p className="font-body-sm text-body-sm text-outline">
              © 2024 Vitalis Medical Systems. All Rights Reserved.
            </p>
            <div className="flex gap-md">
              <a className="font-label-sm text-label-sm text-outline hover:text-on-surface transition-colors" href="#">System Status</a>
              <span className="text-outline border-l border-outline-variant"></span>
              <a className="font-label-sm text-label-sm text-outline hover:text-on-surface transition-colors" href="#">IT Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
