import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  PlusCircle,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onOpenCreatePost }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      navigate('/', { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '10px 16px'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent-pink))',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)',
            flexShrink: 0
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span className="nav-brand-text" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Social<span style={{ color: 'var(--primary)' }}>Pulse</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: '1', maxWidth: '380px', minWidth: '130px', position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '34px',
              paddingRight: '10px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px'
            }}
          />
        </form>

        {/* Nav actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              <button
                className="btn btn-primary btn-create-post"
                onClick={onOpenCreatePost}
                style={{ height: '36px', borderRadius: 'var(--radius-full)' }}
                title="Create New Post"
              >
                <PlusCircle size={18} />
                <span>Post</span>
              </button>

              <Link to="/" className="btn-icon btn-secondary" title="Home Feed">
                <Home size={18} />
              </Link>

              <Link to="/chat" className="btn-icon btn-secondary" title="Messages">
                <MessageSquare size={18} />
              </Link>

              <Link to={`/profile/${user?.username}`} className="btn-icon btn-secondary" title="My Profile" style={{ overflow: 'hidden' }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserIcon size={18} />
                )}
              </Link>

              <button onClick={handleLogout} className="btn-icon btn-danger" title="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ height: '34px', padding: '0 12px', fontSize: '13px' }}>Login</Link>
              <Link to="/signup" className="btn btn-primary" style={{ height: '34px', padding: '0 12px', fontSize: '13px' }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
