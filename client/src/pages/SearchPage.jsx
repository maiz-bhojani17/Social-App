import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/PostCard';
import { Search, User as UserIcon, CheckCircle, MessageSquare, Loader } from 'lucide-react';

export const SearchPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);

  const performSearch = async (term) => {
    if (!term.trim()) return;
    try {
      setLoading(true);
      const res = await api.get(`/users/search?q=${encodeURIComponent(term)}`);
      if (res.data.success) {
        setResults({ users: res.data.users, posts: res.data.posts });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Search Header (Item 14: Search) */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="var(--primary)" />
          Search SocialPulse
        </h2>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search by name, username or post text..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 1, height: '42px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 20px' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Loader size={30} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div>
          {/* User Results */}
          {results.users?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px' }}>
                USERS ({results.users.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.users.map((u) => (
                  <div key={u._id} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to={`/profile/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: '700', color: 'var(--primary)' }}>
                            {u.name?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px' }}>{u.name}</span>
                          {u.isVerified && <CheckCircle size={13} color="var(--accent-emerald)" />}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>@{u.username}</span>
                      </div>
                    </Link>

                    <Link to={`/chat?user=${u._id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <MessageSquare size={13} /> Message
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Results */}
          {isAuthenticated && results.posts?.length > 0 && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px' }}>
                POSTS ({results.posts.length})
              </h3>
              {results.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {query && results.users?.length === 0 && results.posts?.length === 0 && (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No users or posts found matching "{query}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
