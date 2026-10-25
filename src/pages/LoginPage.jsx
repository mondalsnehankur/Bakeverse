import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleAuthRedirect = (userRole) => {
    if (redirectParam) {
      navigate(redirectParam);
    } else if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'storefront') {
      navigate('/storefront');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const data = await register({ name, email, password, phone, address });
        handleAuthRedirect(data.user?.role);
      } else {
        const data = await login(email, password);
        handleAuthRedirect(data.user?.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ credential }) => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await api.post('/auth/google', { credential });
      if (res.data.success) {
        localStorage.setItem('bakeverse_token', res.data.token);
        window.location.href = redirectParam || res.data.redirectPath || '/';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-lavender-200 dark:bg-lavender-900/60 flex items-center justify-center text-3xl mx-auto shadow-soft animate-soft-float">
          🧁
        </div>
        <h1 className="font-display font-bold text-3xl text-berry-950 dark:text-white">
          {isRegister ? 'Join BakeVerse Family' : 'Welcome to BakeVerse'}
        </h1>
        <p className="text-xs text-berry-900/70 dark:text-lavender-200/70">
          {isRegister
            ? 'Sign up as a customer to order fresh treats from top artisan bakeries.'
            : 'Sign in to access your orders, custom 3D cakes, and rewards.'}
        </p>
      </div>

      <div className="glass-card rounded-4xl p-6 sm:p-8 shadow-soft border border-lavender-200 dark:border-lavender-800 space-y-5">
        {/* Toggle Sign In / Register */}
        <div className="flex bg-lavender-100/80 dark:bg-mocha-800 p-1 rounded-2xl border border-lavender-200 dark:border-lavender-700">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
              !isRegister
                ? 'bg-white dark:bg-mocha-700 text-berry-950 dark:text-white shadow-xs'
                : 'text-berry-900/70 dark:text-lavender-300 hover:text-berry-950 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
              isRegister
                ? 'bg-white dark:bg-mocha-700 text-berry-950 dark:text-white shadow-xs'
                : 'text-berry-900/70 dark:text-lavender-300 hover:text-berry-950 dark:hover:text-white'
            }`}
          >
            New Customer
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="flex justify-center min-h-10">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Check the OAuth client configuration.')}
            useOneTap={false}
            theme="outline"
            size="large"
            text="signin_with"
            width="360"
          />
        </div>
        {googleLoading && <p className="text-center text-xs text-lavender-700">Signing in with Google...</p>}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-lavender-200 dark:bg-lavender-800" />
          <span className="text-xs uppercase font-bold text-lavender-600 dark:text-lavender-400">or</span>
          <div className="flex-1 h-px bg-lavender-200 dark:bg-lavender-800" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pooja Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
                <User className="w-4 h-4 text-lavender-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
              <Mail className="w-4 h-4 text-lavender-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
              <Lock className="w-4 h-4 text-lavender-500 absolute left-3 top-3" />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">Phone Number (+91)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                  <Phone className="w-4 h-4 text-lavender-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-berry-900 dark:text-lavender-100 block mb-1">Delivery Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="42 Blossom Garden Way, Indiranagar, Bengaluru"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-lavender-200 dark:border-lavender-700 bg-white dark:bg-mocha-800 text-berry-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                  <MapPin className="w-4 h-4 text-lavender-500 absolute left-3 top-3" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-semibold text-xs tracking-wide shadow-soft hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying...' : isRegister ? 'Create Customer Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
