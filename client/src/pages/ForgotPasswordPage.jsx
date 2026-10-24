import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { KeyRound, ArrowLeft, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSent(true);
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto' }}>
      <div className="glass-panel" style={{ padding: '32px 28px' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-amber), var(--accent-rose))',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <KeyRound size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Forgot Password</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: 'var(--accent-emerald)'
            }}>
              <CheckCircle size={28} />
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>Reset Link Sent!</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '18px' }}>
              Check your inbox for instructions to reset your password.
            </p>

            {resetToken && (
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Quick Reset Simulation (Development):</span>
                <Link to={`/reset-password/${resetToken}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '12px' }}>
                  Open Reset Password Form
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                padding: '10px 14px',
                marginBottom: '14px',
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Registered Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '42px' }}>
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
