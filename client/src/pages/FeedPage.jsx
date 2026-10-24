import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { Sparkles, Loader, ChevronDown, Lock, UserPlus, LogIn } from 'lucide-react';

export const FeedPage = ({ onOpenCreatePost }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    onOpenCreatePost();
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, hasMore: false, totalPosts: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/posts?page=${page}&limit=10`);
      if (res.data.success) {
        if (page === 1) {
          setPosts(res.data.posts);
        } else {
          setPosts((prev) => [...prev, ...res.data.posts]);
        }
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(1);
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchPosts(pagination.currentPage + 1);
    }
  };

  // If user is NOT logged in, show welcoming sign up/login prompt and NO posts
  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '580px', margin: '40px auto' }}>
        <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent-pink))',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}>
            <Sparkles size={32} color="#fff" />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '12px' }}>
            Welcome to Social<span style={{ color: 'var(--primary)' }}>Pulse</span>
          </h2>

          <p style={{ fontSize: '15px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
            Posts dekhne aur share karne ke liye pehle Login ya Sign Up karein. Apne doston se connect hon aur trending posts dekhein!
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '700' }}>
              <LogIn size={18} />
              <span>Log In</span>
            </Link>
            <Link to="/signup" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '15px', fontWeight: '700' }}>
              <UserPlus size={18} />
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Feed Banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            Community Feed
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Discover updates, photos and discussions from everyone.
          </p>
        </div>
        <button onClick={handleCreateClick} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
          New Post
        </button>
      </div>

      {/* Post List (Item 8: CRUD, Item 9: User data populate) */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '15px' }}>
            No posts found yet. Be the first to share something!
          </p>
          <button onClick={handleCreateClick} className="btn btn-primary">
            Create First Post
          </button>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
          ))}

          {/* Item 21: Pagination Controls */}
          {pagination.hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={handleLoadMore}
                className="btn btn-secondary"
                disabled={loadingMore}
                style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)' }}
              >
                {loadingMore ? (
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Load More Posts ({pagination.totalPosts - posts.length} remaining)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
