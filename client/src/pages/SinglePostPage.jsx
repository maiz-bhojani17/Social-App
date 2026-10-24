import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { ArrowLeft, Loader, Lock } from 'lucide-react';

export const SinglePostPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchSinglePost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${id}`);
        if (res.data.success) {
          setPost(res.data.post);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchSinglePost();
  }, [id, isAuthenticated]);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>
        <ArrowLeft size={16} />
        Back to Feed
      </Link>

      {!isAuthenticated ? (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Lock size={26} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Post is Private</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '20px', maxWidth: '380px', margin: '0 auto 20px' }}>
            Is post ko dekhne aur interact karne ke liye Login ya Sign Up karein.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>Log In</Link>
            <Link to="/signup" className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '14px' }}>Sign Up</Link>
          </div>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--accent-rose)' }}>
          <p>{error}</p>
        </div>
      ) : post ? (
        <div>
          <PostCard post={post} onPostDeleted={() => window.location.href = '/'} />
        </div>
      ) : null}
    </div>
  );
};
