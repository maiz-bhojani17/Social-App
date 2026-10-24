import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          setSuccess(true);
          setMessage(res.data.message || 'Email verified successfully!');
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Verification link is invalid or expired.');
      } finally {
        setLoading(false);
      }
    };
    if (token) verify();
  }, [token]);

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto' }}>
      <div className="glass-panel" style={{ padding: '36px 28px', textAlign: 'center' }}>
        {loading ? (
          <div>
            <Loader size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Verifying your email...</h3>
          </div>
        ) : success ? (
          <div>
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
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Email Verified!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Log In Now
            </Link>
          </div>
        ) : (
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-rose)'
            }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Verification Failed</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {message}
            </p>
            <Link to="/signup" className="btn btn-secondary" style={{ width: '100%' }}>
              Back to Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
