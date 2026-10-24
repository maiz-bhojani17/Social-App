import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles, AlertCircle, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const SignupPage = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to main page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [demoVerificationToken, setDemoVerificationToken] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await signup(formData);
      if (data.success) {
        setVerificationSent(true);
        if (data.verificationToken) {
          setDemoVerificationToken(data.verificationToken);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <div className="glass-panel" style={{ padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent-pink))',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 4px 15px var(--primary-glow)'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Create an Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Join the social network and connect with creators
          </p>
        </div>

        {verificationSent ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-emerald)'
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Verification Email Sent!</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              We sent a verification link to <strong>{formData.email}</strong>. Please check your inbox or click below to simulate instant verification.
            </p>

            {demoVerificationToken && (
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '18px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Quick Development Verification:</span>
                <Link
                  to={`/verify-email/${demoVerificationToken}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', width: '100%', marginTop: '6px' }}
                >
                  Verify Email Instantly
                </Link>
              </div>
            )}

            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Home Feed
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--accent-rose)'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Alex Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. alexj"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Password (min 6 characters)</label>
                
                {/* Password Input with Show/Hide toggle */}
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', height: '40px', paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '44px' }}>
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : (
                  <>
                    <UserPlus size={18} />
                    <span>Sign Up</span>
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-dim)', marginTop: '20px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                Log In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
